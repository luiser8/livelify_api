import { Context } from '../../entities/user/context.entity';
import { UserId } from '../../value-objects/user';
import { ContextId } from '../../value-objects/context/context-id.value-object';

export interface UserContextRepositoryInterface {
  save(context: Context): Promise<Context>;
  findByUserId(userId: UserId): Promise<Context[] | null>;
  findById(id: ContextId): Promise<Context | null>;
  delete(id: ContextId): Promise<void>;
  countActions(id: ContextId): Promise<number>;
}
