import { Injectable, Inject } from '@nestjs/common';
import { User } from '../../../domain/entities/user/user.entity';
import { Email } from '../../../domain/value-objects/user/email.value-object';
import type { UserRepositoryInterface } from '../../../domain/repositories/user/user.repository.interface';
import { USER_REPOSITORY_TOKEN } from '../../ports/tokens';

export interface CreateUserRequest {
  email: string;
  password: string;
}

export interface CreateUserResponse {
  id: string;
  email: string;
  createdAt: Date;
}

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: UserRepositoryInterface,
  ) {}

  async execute(request: CreateUserRequest): Promise<CreateUserResponse> {
    // 1. Validate business rules
    const email = new Email(request.email);
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // 2. Create domain entity
    const user = await User.create(request.email, request.password);

    // 3. Persist entity
    const savedUser = await this.userRepository.save(user);

    // 4. Return response
    return {
      id: savedUser.id.getValue(),
      email: savedUser.email.getValue(),
      createdAt: savedUser.createdAt,
    };
  }
}
