import { Module } from '@nestjs/common';
import { RepositoryModule } from '../infrastructure/config/repository.module';

// User Use Cases
import { CreateUserWithProfileUseCase } from './use-cases/user/create-user-with-profile.use-case';
import { GetUserByIdUseCase } from './use-cases/user/get-user-by-id.use-case';
import { GetUserCompleteProfileUseCase } from './use-cases/user/get-user-complete-profile.use-case';
import { UpdateUserProfileUseCase } from './use-cases/user/update-user-profile.use-case';
import { CreateUserWithContextUseCase } from './use-cases/context/create-user-with-context.use-case';

// Auth Use Cases
import { LoginUseCase } from './use-cases/auth/login.use-case';
import { RefreshTokenUseCase } from './use-cases/auth/refresh-token.use-case';
import { LogoutUseCase } from './use-cases/auth/logout.use-case';
import { VerifyTokenUseCase } from './use-cases/auth/verify-token.use-case';
import { CreateUserSubscriptionUseCase } from './use-cases/subscription/create-user-with-subscription.use-case';
import { GetAllSubscriptionsUseCase } from './use-cases/subscription/get-all-subscriptions.use-case';
import { GetAllAreasUseCase } from './use-cases/area/get-all-areas.use-case';
import { GetQuestionByAreaIdUseCase } from './use-cases/question/get-by-area-questions.use-case';
import { CreateLifeWheelWithAreasUseCase } from './use-cases/lifewheel/create-lifewheel-with-areas.use-case';
import { GetUserLifeWheelUseCase } from './use-cases/lifewheel/get-user-lifewheel.use-case';
import { SubmitAreaAnswersUseCase } from './use-cases/answer/submit-area-answers.use-case';
import { CreateProjectFromLifeWheelAreaUseCase } from './use-cases/project/create-project-from-lifewheel-area.use-case';
import { GetUserProjectsUseCase } from './use-cases/project/get-user-projects.use-case';
import { GetProjectsByAreaUseCase } from './use-cases/project/get-projects-by-area.use-case';
import { CreateBudgetForProjectUseCase } from './use-cases/budget/create-budget-for-project.use-case';
import { UpdateBudgetUseCase } from './use-cases/budget/update-budget.use-case';
import { GetUserBudgetsUseCase } from './use-cases/budget/get-user-budgets.use-case';
import { GetAvailableCurrenciesUseCase } from './use-cases/currency/get-available-currencies.use-case';
import { CreateProjectGoalUseCase } from './use-cases/goal/create-project-goal.use-case';
import { GetUserGoalsUseCase } from './use-cases/goal/get-user-goals.use-case';
import { CreateGtdActionUseCase } from './use-cases/action/create-gtd-action.use-case';
import { GetUserActionsUseCase } from './use-cases/action/get-user-actions.use-case';
import { CompleteActionUseCase } from './use-cases/action/complete-action.use-case';
import { CreateUserContextUseCase } from './use-cases/context/create-user-context.use-case';
import { GetUserContextsUseCase } from './use-cases/context/get-user-contexts.use-case';
import { GetSubscriptionByUserIdUseCase } from './use-cases/subscription/get-subscription-by-user.use-case';

@Module({
  imports: [RepositoryModule],
  providers: [
    // User Use Cases
    CreateUserWithProfileUseCase,
    GetUserByIdUseCase,
    GetUserCompleteProfileUseCase,
    UpdateUserProfileUseCase,
    CreateUserWithContextUseCase,
    // Subscription Use Cases
    CreateUserSubscriptionUseCase,
    GetAllSubscriptionsUseCase,
    GetSubscriptionByUserIdUseCase,
    // Auth Use Cases
    LoginUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
    VerifyTokenUseCase,
    // Area
    GetAllAreasUseCase,
    // Question
    GetQuestionByAreaIdUseCase,
    // LifeWheel
    CreateLifeWheelWithAreasUseCase,
    GetUserLifeWheelUseCase,
    // Answer
    SubmitAreaAnswersUseCase,
    // Project
    CreateProjectFromLifeWheelAreaUseCase,
    GetUserProjectsUseCase,
    GetProjectsByAreaUseCase,
    // Budget
    CreateBudgetForProjectUseCase,
    UpdateBudgetUseCase,
    GetUserBudgetsUseCase,
    // Currency
    GetAvailableCurrenciesUseCase,
    // Goal
    CreateProjectGoalUseCase,
    GetUserGoalsUseCase,
    // Action
    CreateGtdActionUseCase,
    GetUserActionsUseCase,
    CompleteActionUseCase,
    // Context
    CreateUserContextUseCase,
    GetUserContextsUseCase,
  ],
  exports: [
    // Repository Module - needed for guards and other components
    RepositoryModule,
    // User Use Cases
    CreateUserWithProfileUseCase,
    GetUserByIdUseCase,
    GetUserCompleteProfileUseCase,
    UpdateUserProfileUseCase,
    CreateUserWithContextUseCase,
    // Subscription Use Cases
    CreateUserSubscriptionUseCase,
    GetAllSubscriptionsUseCase,
    GetSubscriptionByUserIdUseCase,
    // Auth Use Cases
    LoginUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
    VerifyTokenUseCase,
    // Area
    GetAllAreasUseCase,
    // Question
    GetQuestionByAreaIdUseCase,
    // LifeWheel
    CreateLifeWheelWithAreasUseCase,
    GetUserLifeWheelUseCase,
    // Answer
    SubmitAreaAnswersUseCase,
    // Project
    CreateProjectFromLifeWheelAreaUseCase,
    GetUserProjectsUseCase,
    GetProjectsByAreaUseCase,
    // Budget
    CreateBudgetForProjectUseCase,
    UpdateBudgetUseCase,
    GetUserBudgetsUseCase,
    // Currency
    GetAvailableCurrenciesUseCase,
    // Goal
    CreateProjectGoalUseCase,
    GetUserGoalsUseCase,
    // Action
    CreateGtdActionUseCase,
    GetUserActionsUseCase,
    CompleteActionUseCase,
    // Context
    CreateUserContextUseCase,
    GetUserContextsUseCase,
  ],
})
export class ApplicationModule {}
