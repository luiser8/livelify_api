import { Injectable, Inject } from '@nestjs/common';
import { QUESTION_REPOSITORY } from 'src/application/ports/questions';
import { Question } from 'src/domain/entities/question/question.entity';
import type { QuestionRepositoryInterface } from 'src/domain/repositories/question/question.repository.interface';
import { AreaId } from 'src/domain/value-objects/area/area-id.value-object';

@Injectable()
export class GetQuestionByAreaIdUseCase {
  constructor(
    @Inject(QUESTION_REPOSITORY)
    private readonly questionRepository: QuestionRepositoryInterface,
  ) {}

  async execute(areaId: AreaId): Promise<Question[] | []> {
    const questions = await this.questionRepository.findByAreaId(areaId);
    if (!questions) {
      throw new Error('Questions not found');
    }

    return questions;
  }
}
