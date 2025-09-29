import { Answer } from '../../entities/answer/answer.entity';
import { AnswerId } from '../../value-objects/answer/answer-id.value-object';
import { UserId } from '../../value-objects/user/user-id.value-object';
import { LifeWheelAreaId } from '../../value-objects/lifewheel/lifewheel-area-id.value-object';
import { QuestionId } from '../../value-objects/question/question-id.value-object';

export interface AnswerRepositoryInterface {
  save(answer: Answer): Promise<Answer>;
  saveMany(answers: Answer[]): Promise<Answer[]>;
  findById(id: AnswerId): Promise<Answer | null>;
  findByUserId(userId: UserId): Promise<Answer[]>;
  findByUserAndLifeWheelArea(
    userId: UserId,
    lifeWheelAreaId: LifeWheelAreaId,
  ): Promise<Answer[]>;
  findByUserAndQuestion(
    userId: UserId,
    questionId: QuestionId,
  ): Promise<Answer | null>;
  update(answer: Answer): Promise<Answer>;
  delete(id: AnswerId): Promise<void>;

  // Business specific methods
  calculateScoreForLifeWheelArea(
    userId: UserId,
    lifeWheelAreaId: LifeWheelAreaId,
  ): Promise<number>;
  countAnswersByUserAndLifeWheelArea(
    userId: UserId,
    lifeWheelAreaId: LifeWheelAreaId,
  ): Promise<number>;
}
