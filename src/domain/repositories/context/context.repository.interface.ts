import { Context } from '../../entities/context/context.entity';
import { ContextId } from '../../value-objects/context/context-id.value-object';
import { UserId } from '../../value-objects/user/user-id.value-object';

export interface ContextRepositoryInterface {
  save(context: Context): Promise<Context>;
  findById(id: ContextId): Promise<Context | null>;
  findByUserId(userId: UserId): Promise<Context[]>;
  findByUserIdAndName(userId: UserId, name: string): Promise<Context | null>;
  update(context: Context): Promise<Context>;
  delete(id: ContextId): Promise<void>;
}
