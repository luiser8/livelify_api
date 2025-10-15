import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { QuestionRepositoryInterface } from 'src/domain/repositories/question/question.repository.interface';
import { Question } from 'src/domain/entities/question/question.entity';
import { QuestionId } from 'src/domain/value-objects/question/question-id.value-object';
import { AreaId } from 'src/domain/value-objects/area/area-id.value-object';

@Injectable()
export class QuestionRepository implements QuestionRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  async findByAreaId(areaId: AreaId): Promise<Question[]> {
    const questions = await this.prisma.question.findMany({
      where: { areaId: areaId.getValue() },
      include: {
        area: true,
      },
    });

    return questions.map((q) => {
      const question = q as unknown as {
        id: string;
        text: string;
        tip: string | null;
        haveMoreQuestions: boolean;
        areaId: string;
        createdAt: Date;
        updatedAt: Date;
        area: {
          id: string;
          name: string;
          description: string;
        };
      };

      return this.toDomainEntity({
        id: question.id,
        text: question.text,
        tip: question.tip,
        haveMoreQuestions: question.haveMoreQuestions,
        areaId: question.areaId,
        createdAt: question.createdAt,
        updatedAt: question.updatedAt,
        area: question.area
          ? {
              id: question.area.id,
              name: question.area.name,
              description: question.area.description,
            }
          : undefined,
      });
    });
  }

  private toDomainEntity(value: {
    id: string;
    text: string;
    tip?: string | null;
    haveMoreQuestions: boolean;
    areaId: string;
    createdAt?: Date;
    updatedAt?: Date;
    area?: {
      id: string;
      name: string;
      description: string;
    };
  }): Question {
    return Question.reconstitute({
      id: QuestionId.fromString(value.id),
      text: value.text,
      tip: value.tip ?? undefined,
      haveMoreQuestions: value.haveMoreQuestions,
      createdAt: value.createdAt,
      updatedAt: value.updatedAt,
      areaId: AreaId.fromString(value.areaId),
      area: value.area
        ? {
            id: value.area.id,
            name: value.area.name,
            description: value.area.description,
            toPlainObject: () => ({
              id: value.area!.id,
              name: value.area!.name,
              description: value.area!.description,
            }),
          }
        : undefined,
    });
  }
}
