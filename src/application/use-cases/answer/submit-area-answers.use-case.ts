import { Injectable, Inject } from '@nestjs/common';
import { Answer } from '../../../domain/entities/answer/answer.entity';
import { LifeWheelArea } from '../../../domain/entities/lifewheel/lifewheel-area.entity';
import { UserId } from '../../../domain/value-objects/user/user-id.value-object';
import { QuestionId } from '../../../domain/value-objects/question/question-id.value-object';
import { AreaId } from '../../../domain/value-objects/area/area-id.value-object';
import type { AnswerRepositoryInterface } from '../../../domain/repositories/answer/answer.repository.interface';
import type { LifeWheelAreaRepositoryInterface } from '../../../domain/repositories/lifewheel/lifewheel-area.repository.interface';
import type { LifeWheelRepositoryInterface } from '../../../domain/repositories/lifewheel/lifewheel.repository.interface';
import type { QuestionRepositoryInterface } from '../../../domain/repositories/question/question.repository.interface';
import {
  ANSWER_REPOSITORY_TOKEN,
  LIFEWHEEL_AREA_REPOSITORY_TOKEN,
  LIFEWHEEL_REPOSITORY_TOKEN,
} from '../../ports/lifewheel';
import { QUESTION_REPOSITORY } from '../../ports/questions';

export interface SubmitAreaAnswersRequest {
  userId: string;
  areaId: string;
  answers: {
    questionId: string;
    value: boolean; // true = Sí, false = No
  }[];
}

export interface SubmitAreaAnswersResponse {
  success: boolean;
  areaScore: number;
  globalScore: number;
  answersSubmitted: number;
  totalAnswersForArea: number;
  areaName: string;
  message: string;
}

@Injectable()
export class SubmitAreaAnswersUseCase {
  constructor(
    @Inject(ANSWER_REPOSITORY_TOKEN)
    private readonly answerRepository: AnswerRepositoryInterface,
    @Inject(LIFEWHEEL_AREA_REPOSITORY_TOKEN)
    private readonly lifeWheelAreaRepository: LifeWheelAreaRepositoryInterface,
    @Inject(LIFEWHEEL_REPOSITORY_TOKEN)
    private readonly lifeWheelRepository: LifeWheelRepositoryInterface,
    @Inject(QUESTION_REPOSITORY)
    private readonly questionRepository: QuestionRepositoryInterface,
  ) {}

  async execute(
    request: SubmitAreaAnswersRequest,
  ): Promise<SubmitAreaAnswersResponse> {
    // 1. Validar que el usuario y área existan
    const userId = UserId.fromString(request.userId);
    const areaId = AreaId.fromString(request.areaId);

    // 2. Obtener las preguntas del área para validar
    const questions = await this.questionRepository.findByAreaId(areaId);
    if (!questions || questions.length === 0) {
      throw new Error('No questions found for this area');
    }

    // 3. Validar que las respuestas correspondan a preguntas del área
    const questionIds = questions.map((q) => q.id.getValue());
    const invalidQuestions = request.answers.filter(
      (answer) => !questionIds.includes(answer.questionId),
    );

    if (invalidQuestions.length > 0) {
      throw new Error('Some questions do not belong to the specified area');
    }

    // 4. Obtener el LifeWheel del usuario
    const lifeWheels = await this.lifeWheelRepository.findByUserId(userId);
    if (!lifeWheels || lifeWheels.length === 0) {
      throw new Error('No LifeWheel found for this user');
    }

    // Asumir que tomamos el primer LifeWheel (podría ser el más reciente)
    const lifeWheel = lifeWheels[0];

    // 5. Encontrar el LifeWheelArea correspondiente
    const lifeWheelAreas = await this.lifeWheelAreaRepository.findByLifeWheelId(
      lifeWheel.id,
    );
    const lifeWheelArea = lifeWheelAreas.find(
      (lwa) => lwa.areaId.getValue() === areaId.getValue(),
    );

    if (!lifeWheelArea) {
      throw new Error('LifeWheelArea not found for this user and area');
    }

    // 6. Crear las entidades Answer
    const answerEntities = request.answers.map((answerData) =>
      Answer.create(
        answerData.value,
        userId,
        QuestionId.fromString(answerData.questionId),
        lifeWheelArea.id,
      ),
    );

    // 7. Guardar las respuestas (upsert para permitir actualizaciones)
    const savedAnswers = await this.answerRepository.saveMany(answerEntities);

    // 8. Calcular el nuevo score del área
    const areaScore =
      await this.answerRepository.calculateScoreForLifeWheelArea(
        userId,
        lifeWheelArea.id,
      );

    // 9. Actualizar el score del LifeWheelArea
    lifeWheelArea.updateScore(areaScore);
    await this.lifeWheelAreaRepository.update(lifeWheelArea);

    // 10. Recalcular el score global del LifeWheel
    // Obtener todas las áreas actualizadas después de guardar el score del área actual
    const allLifeWheelAreas =
      await this.lifeWheelAreaRepository.findByLifeWheelId(lifeWheel.id);

    // Solo considerar áreas que tienen respuestas (score > 0 o que tengan al menos una respuesta)
    const areasWithAnswers: LifeWheelArea[] = [];
    for (const area of allLifeWheelAreas) {
      const answerCount =
        await this.answerRepository.countAnswersByUserAndLifeWheelArea(
          userId,
          area.id,
        );
      if (answerCount > 0) {
        areasWithAnswers.push(area);
      }
    }

    // Calcular el promedio solo de las áreas que tienen respuestas
    const totalScore = areasWithAnswers.reduce(
      (sum, area) => sum + area.score,
      0,
    );
    const globalScore =
      areasWithAnswers.length > 0 ? totalScore / areasWithAnswers.length : 0;

    // 11. Actualizar el LifeWheel con el nuevo score global
    lifeWheel.updateGlobalScore(globalScore);
    await this.lifeWheelRepository.update(lifeWheel);

    // 12. Contar total de respuestas para el área
    const totalAnswersForArea =
      await this.answerRepository.countAnswersByUserAndLifeWheelArea(
        userId,
        lifeWheelArea.id,
      );

    // 13. Preparar respuesta
    const areaName = lifeWheelArea.area?.name || 'Unknown Area';
    const isAreaComplete = totalAnswersForArea >= 10; // 10 preguntas por área

    return {
      success: true,
      areaScore: Math.round(areaScore * 100) / 100, // Round to 2 decimal places
      globalScore: Math.round(globalScore * 100) / 100,
      answersSubmitted: savedAnswers.length,
      totalAnswersForArea,
      areaName,
      message: isAreaComplete
        ? `All questions for ${areaName} have been answered. Area score: ${areaScore}/10`
        : `${savedAnswers.length} answers submitted for ${areaName}. ${10 - totalAnswersForArea} questions remaining.`,
    };
  }
}
