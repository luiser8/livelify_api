import { Question } from 'src/domain/entities/question/question.entity';
import { AreaId } from 'src/domain/value-objects/area/area-id.value-object';

export interface QuestionRepositoryInterface {
  findByAreaId(areaId: AreaId): Promise<Question[] | null>;
}
