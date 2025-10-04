import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { ApplicationModule } from '../application/application.module';
import { DatabaseModule } from '../infrastructure/config/database.module';

// Controllers
import { UserController } from './controllers/user.controller';
import { AuthController } from './controllers/auth.controller';
import { HealthController } from './controllers/health.controller';

// Guards
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GetSubscriptionByUserIdUseCase } from 'src/application/use-cases/subscription/get-subscription-by-user.use-case';
import { CreateUserWithContextUseCase } from 'src/application/use-cases/context/create-user-with-context.use-case';
import { GetContextByUserIdUseCase } from 'src/application/use-cases/context/get-context-by-user.use-case';
import { UpdateUserSubscriptionUseCase } from 'src/application/use-cases/subscription/update-user-subscription.use-case';
import { GetUserCompleteProfileUseCase } from 'src/application/use-cases/user/get-user-complete-profile.use-case';
import { GetAllSubscriptionsUseCase } from 'src/application/use-cases/subscription/get-all-subscriptions.use-case';
import { SubscriptionController } from './controllers/subscription.controller';
import { AreaController } from './controllers/area.controller';
import { GetAllAreasUseCase } from 'src/application/use-cases/area/get-all-areas.use-case';
import { GetQuestionByAreaIdUseCase } from 'src/application/use-cases/question/get-by-area-questions.use-case';
import { AssessmentController } from './controllers/assessment.controller';
import { AnswerController } from './controllers/answer.controller';
import { LifeWheelController } from './controllers/lifewheel.controller';
import { ProjectController } from './controllers/project.controller';
import { BudgetController } from './controllers/budget.controller';
import { CurrencyController } from './controllers/currency.controller';
import { GoalController } from './controllers/goal.controller';
import { ActionController } from './controllers/action.controller';
import { SubmitAreaAnswersUseCase } from 'src/application/use-cases/answer/submit-area-answers.use-case';
import { GetUserLifeWheelUseCase } from 'src/application/use-cases/lifewheel/get-user-lifewheel.use-case';
import { CreateProjectFromLifeWheelAreaUseCase } from 'src/application/use-cases/project/create-project-from-lifewheel-area.use-case';
import { GetUserProjectsUseCase } from 'src/application/use-cases/project/get-user-projects.use-case';
import { GetProjectsByAreaUseCase } from 'src/application/use-cases/project/get-projects-by-area.use-case';
import { CreateBudgetForProjectUseCase } from 'src/application/use-cases/budget/create-budget-for-project.use-case';
import { UpdateBudgetUseCase } from 'src/application/use-cases/budget/update-budget.use-case';
import { GetUserBudgetsUseCase } from 'src/application/use-cases/budget/get-user-budgets.use-case';
import { GetAvailableCurrenciesUseCase } from 'src/application/use-cases/currency/get-available-currencies.use-case';
import { CreateProjectGoalUseCase } from 'src/application/use-cases/goal/create-project-goal.use-case';
import { GetUserGoalsUseCase } from 'src/application/use-cases/goal/get-user-goals.use-case';
import { CreateGtdActionUseCase } from 'src/application/use-cases/action/create-gtd-action.use-case';
import { GetUserActionsUseCase } from 'src/application/use-cases/action/get-user-actions.use-case';
import { CompleteActionUseCase } from 'src/application/use-cases/action/complete-action.use-case';
import { VerifyTokenUseCase } from 'src/application/use-cases/auth/verify-token.use-case';

@Module({
  imports: [ApplicationModule, TerminusModule, DatabaseModule],
  controllers: [
    UserController,
    AuthController,
    HealthController,
    SubscriptionController,
    AreaController,
    AssessmentController,
    AnswerController,
    LifeWheelController,
    ProjectController,
    BudgetController,
    CurrencyController,
    GoalController,
    ActionController,
  ],
  providers: [
    JwtAuthGuard,
    GetSubscriptionByUserIdUseCase,
    CreateUserWithContextUseCase,
    GetContextByUserIdUseCase,
    UpdateUserSubscriptionUseCase,
    GetAllSubscriptionsUseCase,
    GetAllAreasUseCase,
    GetQuestionByAreaIdUseCase,
    SubmitAreaAnswersUseCase,
    GetUserLifeWheelUseCase,
    CreateProjectFromLifeWheelAreaUseCase,
    GetUserProjectsUseCase,
    GetProjectsByAreaUseCase,
    CreateBudgetForProjectUseCase,
    UpdateBudgetUseCase,
    GetUserBudgetsUseCase,
    GetAvailableCurrenciesUseCase,
    CreateProjectGoalUseCase,
    GetUserGoalsUseCase,
    CreateGtdActionUseCase,
    GetUserActionsUseCase,
    CompleteActionUseCase,
    GetUserCompleteProfileUseCase,
    VerifyTokenUseCase,
  ],
  exports: [JwtAuthGuard],
})
export class PresentationModule {}
