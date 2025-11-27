/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private prisma: PrismaClient;

  constructor(private configService: ConfigService) {
    // Obtener la URL de la base de datos desde las variables de entorno
    const databaseUrl = this.configService.get<string>('DATABASE_URL');

    // Crear el pool de PostgreSQL
    const pool = new Pool({ connectionString: databaseUrl });

    // Crear el adaptador de Prisma para PostgreSQL
    const adapter = new PrismaPg(pool);

    // Inicializar PrismaClient con el adaptador
    this.prisma = new PrismaClient({ adapter });
  }

  async onModuleInit(): Promise<void> {
    await this.prisma.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.prisma.$disconnect();
  }

  // Métodos proxy para los métodos especiales de Prisma
  get $connect() {
    return this.prisma.$connect.bind(this.prisma);
  }

  get $disconnect() {
    return this.prisma.$disconnect.bind(this.prisma);
  }

  get $transaction() {
    return this.prisma.$transaction.bind(this.prisma);
  }

  get $queryRaw() {
    return this.prisma.$queryRaw.bind(this.prisma);
  }

  get $executeRaw() {
    return this.prisma.$executeRaw.bind(this.prisma);
  }

  get $queryRawUnsafe() {
    return this.prisma.$queryRawUnsafe.bind(this.prisma);
  }

  get $executeRawUnsafe() {
    return this.prisma.$executeRawUnsafe.bind(this.prisma);
  }

  // Proxy para acceder a los métodos de Prisma
  get client(): PrismaClient {
    return this.prisma;
  }

  // Métodos proxy para acceso directo a los modelos
  get user() {
    return this.prisma.user;
  }

  get userProfile() {
    return this.prisma.userProfile;
  }

  get userToken() {
    return this.prisma.userToken;
  }

  get userRecovery() {
    return this.prisma.userRecovery;
  }

  get lifeWheel() {
    return this.prisma.lifeWheel;
  }

  get lifeWheelArea() {
    return this.prisma.lifeWheelArea;
  }

  get area() {
    return this.prisma.area;
  }

  get question() {
    return this.prisma.question;
  }

  get answer() {
    return this.prisma.answer;
  }

  get gtdProject() {
    return this.prisma.gtdProject;
  }

  get gtdProjectDetail() {
    return this.prisma.gtdProjectDetail;
  }

  get projectGoal() {
    return this.prisma.projectGoal;
  }

  get gtdAction() {
    return this.prisma.gtdAction;
  }

  get context() {
    return this.prisma.context;
  }

  get budget() {
    return this.prisma.budget;
  }

  get actionBudget() {
    return this.prisma.actionBudget;
  }

  get currency() {
    return this.prisma.currency;
  }

  get subscriptionPlan() {
    return this.prisma.subscriptionPlan;
  }

  get userSubscription() {
    return this.prisma.userSubscription;
  }

  get userAreasSelected() {
    return this.prisma.userAreasSelected;
  }
}
