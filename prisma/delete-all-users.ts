// scripts/delete-all-users.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const deleteAllUsers = async () => {
  return await prisma.$transaction(async (tx) => {
    const users = await tx.user.findMany({ select: { id: true } });
    const userIds = users.map((u) => u.id);

    if (userIds.length === 0) {
      console.log('No hay usuarios para eliminar.');
      return;
    }

    // ============================
    // 1. PROJECTS — eliminar TODO lo relacionado
    // ============================

    // Obtener todos los lifewheelAreaIds de usuarios
    const lifeWheelAreaIds = await tx.lifeWheelArea.findMany({
      where: { lifeWheel: { userId: { in: userIds } } },
      select: { id: true },
    });

    const lwAreaIds = lifeWheelAreaIds.map((a) => a.id);

    if (lwAreaIds.length > 0) {
      // 1.1 Obtener proyectos
      const projects = await tx.gtdProject.findMany({
        where: { lifeWheelAreaId: { in: lwAreaIds } },
        select: { id: true },
      });

      const projectIds = projects.map((p) => p.id);

      if (projectIds.length > 0) {
        // ACTIONS ==================================================================
        const goals = await tx.projectGoal.findMany({
          where: { detail: { projectId: { in: projectIds } } },
          select: { id: true },
        });

        const goalIds = goals.map((g) => g.id);

        if (goalIds.length > 0) {
          // Actions budgets
          const actions = await tx.gtdAction.findMany({
            where: { goalId: { in: goalIds } },
            select: { id: true },
          });

          const actionIds = actions.map((a) => a.id);

          if (actionIds.length > 0) {
            await tx.actionBudget.deleteMany({
              where: { actionId: { in: actionIds } },
            });
          }

          // Delete actions
          await tx.gtdAction.deleteMany({
            where: { goalId: { in: goalIds } },
          });
        }

        // GOALS =====================================================================
        await tx.projectGoal.deleteMany({
          where: { detail: { projectId: { in: projectIds } } },
        });

        // DETAILS ===================================================================
        const details = await tx.gtdProjectDetail.findMany({
          where: { projectId: { in: projectIds } },
          select: { id: true },
        });

        const detailIds = details.map((d) => d.id);

        if (detailIds.length > 0) {
          await tx.gtdProjectDetail.deleteMany({
            where: { projectId: { in: projectIds } },
          });
        }

        // BUDGET ====================================================================
        await tx.budget.deleteMany({
          where: { projectId: { in: projectIds } },
        });

        // PROJECTS ==================================================================
        await tx.gtdProject.deleteMany({
          where: { id: { in: projectIds } },
        });
      }
    }

    // ============================
    // 2. OTROS MODELOS DEPENDIENTES DE USER
    // ============================

    await tx.userToken.deleteMany({ where: { userId: { in: userIds } } });
    await tx.userRecovery.deleteMany({ where: { userId: { in: userIds } } });
    await tx.userSubscription.deleteMany({
      where: { userId: { in: userIds } },
    });
    await tx.userProfile.deleteMany({ where: { userId: { in: userIds } } });

    // Contextos y acciones
    const contexts = await tx.context.findMany({
      where: { userId: { in: userIds } },
      select: { id: true },
    });

    const contextIds = contexts.map((c) => c.id);

    if (contextIds.length > 0) {
      await tx.gtdAction.updateMany({
        where: { contextId: { in: contextIds } },
        data: { contextId: null },
      });
    }

    await tx.context.deleteMany({
      where: { userId: { in: userIds } },
    });

    // Respuestas
    await tx.answer.deleteMany({ where: { userId: { in: userIds } } });

    // Áreas seleccionadas
    await tx.userAreasSelected.deleteMany({
      where: { userId: { in: userIds } },
    });

    // Eliminar LifeWheelArea
    await tx.lifeWheelArea.deleteMany({
      where: { lifeWheel: { userId: { in: userIds } } },
    });

    // Eliminar LifeWheel
    await tx.lifeWheel.deleteMany({
      where: { userId: { in: userIds } },
    });

    // ============================
    // 3. ELIMINAR USUARIOS
    // ============================

    await tx.user.deleteMany({ where: { id: { in: userIds } } });

    console.log(`Usuarios eliminados: ${userIds.length}`);
  });
};

// Ejecutar desde CLI
deleteAllUsers()
  .then(() => {
    console.log('Proceso completado sin errores.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('ERROR EN LA ELIMINACIÓN:', err);
    process.exit(1);
  });
