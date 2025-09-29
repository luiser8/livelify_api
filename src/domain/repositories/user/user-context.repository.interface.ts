import { Context } from '../../entities/user/context.entity';
import { UserId } from '../../value-objects/user';

export interface UserContextRepositoryInterface {
  save(context: Context): Promise<Context>;
  findByUserId(userId: UserId): Promise<Context[] | null>;
}
