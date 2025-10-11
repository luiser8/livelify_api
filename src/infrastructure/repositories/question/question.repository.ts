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
    const question = await this.prisma.question.findMany({
      where: { areaId: areaId.getValue() },
      include: {
        area: true,
      },
    });

    return question.map((q) => this.toDomainEntity(q));
  }

  private toDomainEntity(value: {
    id: string;
    text: string;
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
