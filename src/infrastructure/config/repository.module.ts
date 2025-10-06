/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Module } from '@nestjs/common';
import { DatabaseModule } from './database.module';

// Repository Implementations
import { UserRepository } from '../repositories/user/user.repository';
import { UserProfileRepository } from '../repositories/user/user-profile.repository';
import { UserTokenRepository } from '../repositories/user/user-token.repository';
import { UserSubscriptionPlanRepository } from '../repositories/user/user-subscription-plan.repository';
import { UserContextRepository } from '../repositories/user/user-context.repository';
import { SubscriptionPlanRepository } from '../repositories/subscription/subscription-plan.repository';
import { AreaRepository } from '../repositories/area/area.repository';
import { LifeWheelRepository } from '../repositories/lifewheel/lifewheel.repository';
import { LifeWheelAreaRepository } from '../repositories/lifewheel/lifewheel-area.repository';
import { AnswerRepository } from '../repositories/answer/answer.repository';
import { GtdProjectRepository } from '../repositories/project/gtd-project.repository';
import { GtdProjectDetailRepository } from '../repositories/project/gtd-project-detail.repository';
import { BudgetRepository } from '../repositories/budget/budget.repository';
import { CurrencyRepository } from '../repositories/currency/currency.repository';
import { ContextRepository } from '../repositories/context/context.repository';
import { ProjectGoalRepository } from '../repositories/goal/project-goal.repository';
import { GtdActionRepository } from '../repositories/action/gtd-action.repository';
import { GoalBudgetRepository } from '../repositories/goal-budget/goal-budget.repository';

// Tokens
import {
  USER_REPOSITORY_TOKEN,
  USER_PROFILE_REPOSITORY_TOKEN,
  USER_TOKEN_REPOSITORY_TOKEN,
} from '../../application/ports/tokens';

//Subscriptions
import {
  USER_SUBSCRIPTION_REPOSITORY,
  SUBSCRIPTION_REPOSITORY,
} from '../../application/ports/subscriptions';

//Contexts
import { USER_CONTEXT_REPOSITORY } from '../../application/ports/contexts';

//Areas
import { AREAS_REPOSITORY } from '../../application/ports/areas';
import { QUESTION_REPOSITORY } from 'src/application/ports/questions';

//LifeWheel
import {
  LIFEWHEEL_REPOSITORY_TOKEN,
  LIFEWHEEL_AREA_REPOSITORY_TOKEN,
  ANSWER_REPOSITORY_TOKEN,
} from '../../application/ports/lifewheel';

//Projects
import {
  GTD_PROJECT_REPOSITORY_TOKEN,
  GTD_PROJECT_DETAIL_REPOSITORY_TOKEN,
} from '../../application/ports/projects';

//Budget
import {
  BUDGET_REPOSITORY_TOKEN,
  CURRENCY_REPOSITORY_TOKEN,
} from '../../application/ports/budget';

//Goals & Actions
import {
  CONTEXT_REPOSITORY_TOKEN,
  PROJECT_GOAL_REPOSITORY_TOKEN,
  GTD_ACTION_REPOSITORY_TOKEN,
} from '../../application/ports/goals-actions';

//Goal Budgets
import { GOAL_BUDGET_REPOSITORY_TOKEN } from '../../application/ports/goal-budgets';

// Question
import { QuestionRepository } from '../repositories/question/question.repository';

@Module({
  imports: [DatabaseModule],
  providers: [
    {
      provide: USER_REPOSITORY_TOKEN,
      useClass: UserRepository,
    },
    {
      provide: USER_PROFILE_REPOSITORY_TOKEN,
      useClass: UserProfileRepository,
    },
    {
      provide: USER_TOKEN_REPOSITORY_TOKEN,
      useClass: UserTokenRepository,
    },
    {
      provide: USER_SUBSCRIPTION_REPOSITORY,
      useClass: UserSubscriptionPlanRepository,
    },
    {
      provide: USER_CONTEXT_REPOSITORY,
      useClass: UserContextRepository,
    },
    {
      provide: SUBSCRIPTION_REPOSITORY,
      useClass: SubscriptionPlanRepository,
    },
    {
      provide: AREAS_REPOSITORY,
      useClass: AreaRepository,
    },
    {
      provide: QUESTION_REPOSITORY,
      useClass: QuestionRepository,
    },
    {
      provide: LIFEWHEEL_REPOSITORY_TOKEN,
      useClass: LifeWheelRepository,
    },
    {
      provide: LIFEWHEEL_AREA_REPOSITORY_TOKEN,
      useClass: LifeWheelAreaRepository,
    },
    {
      provide: ANSWER_REPOSITORY_TOKEN,
      useClass: AnswerRepository,
    },
    {
      provide: GTD_PROJECT_REPOSITORY_TOKEN,
      useClass: GtdProjectRepository,
    },
    {
      provide: GTD_PROJECT_DETAIL_REPOSITORY_TOKEN,
      useClass: GtdProjectDetailRepository,
    },
    {
      provide: BUDGET_REPOSITORY_TOKEN,
      useClass: BudgetRepository,
    },
    {
      provide: CURRENCY_REPOSITORY_TOKEN,
      useClass: CurrencyRepository,
    },
    {
      provide: CONTEXT_REPOSITORY_TOKEN,
      useClass: ContextRepository,
    },
    {
      provide: PROJECT_GOAL_REPOSITORY_TOKEN,
      useClass: ProjectGoalRepository,
    },
    {
      provide: GTD_ACTION_REPOSITORY_TOKEN,
      useClass: GtdActionRepository,
    },
    {
      provide: GOAL_BUDGET_REPOSITORY_TOKEN,
      useClass: GoalBudgetRepository,
    },
  ],
  exports: [
    USER_REPOSITORY_TOKEN,
    USER_PROFILE_REPOSITORY_TOKEN,
    USER_TOKEN_REPOSITORY_TOKEN,
    USER_SUBSCRIPTION_REPOSITORY,
    USER_CONTEXT_REPOSITORY,
    SUBSCRIPTION_REPOSITORY,
    AREAS_REPOSITORY,
    QUESTION_REPOSITORY,
    LIFEWHEEL_REPOSITORY_TOKEN,
    LIFEWHEEL_AREA_REPOSITORY_TOKEN,
    ANSWER_REPOSITORY_TOKEN,
    GTD_PROJECT_REPOSITORY_TOKEN,
    GTD_PROJECT_DETAIL_REPOSITORY_TOKEN,
    BUDGET_REPOSITORY_TOKEN,
    CURRENCY_REPOSITORY_TOKEN,
    CONTEXT_REPOSITORY_TOKEN,
    PROJECT_GOAL_REPOSITORY_TOKEN,
    GTD_ACTION_REPOSITORY_TOKEN,
    GOAL_BUDGET_REPOSITORY_TOKEN,
  ],
})
export class RepositoryModule {}
