import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AnswerRepositoryInterface } from '../../../domain/repositories/answer/answer.repository.interface';
import { Answer } from '../../../domain/entities/answer/answer.entity';
import { AnswerId } from '../../../domain/value-objects/answer/answer-id.value-object';
import { UserId } from '../../../domain/value-objects/user/user-id.value-object';
import { QuestionId } from '../../../domain/value-objects/question/question-id.value-object';
import { LifeWheelAreaId } from '../../../domain/value-objects/lifewheel/lifewheel-area-id.value-object';

@Injectable()
export class AnswerRepository implements AnswerRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  async save(answer: Answer): Promise<Answer> {
    const answerData = answer.toPlainObject();

    const savedAnswer = await this.prisma.answer.create({
      data: {
        id: answerData.id,
        value: answerData.value,
        userId: answerData.userId,
        questionId: answerData.questionId,
        lifeWheelAreaId: answerData.lifeWheelAreaId,
        createdAt: answerData.createdAt,
        updatedAt: answerData.updatedAt,
      },
    });

    return this.toDomainEntity(savedAnswer);
  }

  async saveMany(answers: Answer[]): Promise<Answer[]> {
    const answersData = answers.map((answer) => answer.toPlainObject());

    // Use transaction for bulk insert
    const savedAnswers = await this.prisma.$transaction(
      answersData.map((answerData) =>
        this.prisma.answer.upsert({
          where: {
            userId_questionId_lifeWheelAreaId: {
              userId: answerData.userId,
              questionId: answerData.questionId,
              lifeWheelAreaId: answerData.lifeWheelAreaId,
            },
          },
          update: {
            value: answerData.value,
            updatedAt: answerData.updatedAt,
          },
          create: {
            id: answerData.id,
            value: answerData.value,
            userId: answerData.userId,
            questionId: answerData.questionId,
            lifeWheelAreaId: answerData.lifeWheelAreaId,
            createdAt: answerData.createdAt,
            updatedAt: answerData.updatedAt,
          },
        }),
      ),
    );

    return savedAnswers.map((answer) => this.toDomainEntity(answer));
  }

  async findById(id: AnswerId): Promise<Answer | null> {
    const answer = await this.prisma.answer.findUnique({
      where: { id: id.getValue() },
    });

    if (!answer) {
      return null;
    }

    return this.toDomainEntity(answer);
  }

  async findByUserId(userId: UserId): Promise<Answer[]> {
    const answers = await this.prisma.answer.findMany({
      where: { userId: userId.getValue() },
    });

    return answers.map((answer) => this.toDomainEntity(answer));
  }

  async findByUserAndLifeWheelArea(
    userId: UserId,
    lifeWheelAreaId: LifeWheelAreaId,
  ): Promise<Answer[]> {
    const answers = await this.prisma.answer.findMany({
      where: {
        userId: userId.getValue(),
        lifeWheelAreaId: lifeWheelAreaId.getValue(),
      },
    });

    return answers.map((answer) => this.toDomainEntity(answer));
  }

  async findByUserAndQuestion(
    userId: UserId,
    questionId: QuestionId,
  ): Promise<Answer | null> {
    const answer = await this.prisma.answer.findFirst({
      where: {
        userId: userId.getValue(),
        questionId: questionId.getValue(),
      },
    });

    if (!answer) {
      return null;
    }

    return this.toDomainEntity(answer);
  }

  async update(answer: Answer): Promise<Answer> {
    const answerData = answer.toPlainObject();

    const updatedAnswer = await this.prisma.answer.update({
      where: { id: answerData.id },
      data: {
        value: answerData.value,
        updatedAt: answerData.updatedAt,
      },
    });

    return this.toDomainEntity(updatedAnswer);
  }

  async delete(id: AnswerId): Promise<void> {
    await this.prisma.answer.delete({
      where: { id: id.getValue() },
    });
  }

  async calculateScoreForLifeWheelArea(
    userId: UserId,
    lifeWheelAreaId: LifeWheelAreaId,
  ): Promise<number> {
    // Get all answers for this user and area
    const answers = await this.prisma.answer.findMany({
      where: {
        userId: userId.getValue(),
        lifeWheelAreaId: lifeWheelAreaId.getValue(),
      },
      select: {
        value: true,
      },
    });

    if (answers.length === 0) {
      return 0;
    }

    // Calculate percentage of true answers and convert to score out of 10
    const trueAnswers = answers.filter(
      (answer) => answer.value === true,
    ).length;
    const percentage = trueAnswers / answers.length;
    const score = percentage * 10;

    return Math.round(score * 100) / 100; // Round to 2 decimal places
  }

  async countAnswersByUserAndLifeWheelArea(
    userId: UserId,
    lifeWheelAreaId: LifeWheelAreaId,
  ): Promise<number> {
    return await this.prisma.answer.count({
      where: {
        userId: userId.getValue(),
        lifeWheelAreaId: lifeWheelAreaId.getValue(),
      },
    });
  }

  private toDomainEntity(value: any): Answer {
    return Answer.reconstitute({
      id: AnswerId.fromString(value.id),
      value: value.value,
      userId: UserId.fromString(value.userId),
      questionId: QuestionId.fromString(value.questionId),
      lifeWheelAreaId: LifeWheelAreaId.fromString(value.lifeWheelAreaId),
      createdAt: value.createdAt,
      updatedAt: value.updatedAt,
    });
  }
}
