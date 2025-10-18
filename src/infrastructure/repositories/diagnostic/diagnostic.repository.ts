import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import type { DiagnosticRepositoryInterface } from '../../../application/ports/diagnostic-repository';
import { Diagnostic } from '../../../domain/entities/diagnostic.entity';

@Injectable()
export class DiagnosticRepository implements DiagnosticRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  async save(diagnostic: Diagnostic): Promise<Diagnostic> {
    try {
      const diagnosticData = diagnostic.toPlainObject();

      await this.prisma.diagnostic.create({
        data: {
          id: diagnosticData.id,
          name: diagnosticData.name,
          email: diagnosticData.email,
          personal: diagnosticData.scores.personal,
          professional: diagnosticData.scores.professional,
          health: diagnosticData.scores.health,
          finances: diagnosticData.scores.finances,
          family: diagnosticData.scores.family,
          love: diagnosticData.scores.love,
          average: diagnosticData.average,
          createdAt: diagnosticData.createdAt,
        },
      });

      return diagnostic;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to save diagnostic: ${errorMessage}`);
    }
  }

  async findById(id: string): Promise<Diagnostic | null> {
    try {
      const diagnostic = await this.prisma.diagnostic.findUnique({
        where: { id },
      });

      if (!diagnostic) {
        return null;
      }

      return Diagnostic.fromPrimitives({
        id: diagnostic.id,
        name: diagnostic.name,
        email: diagnostic.email,
        scores: {
          personal: diagnostic.personal,
          professional: diagnostic.professional,
          health: diagnostic.health,
          finances: diagnostic.finances,
          family: diagnostic.family,
          love: diagnostic.love,
        },
        average: diagnostic.average,
        createdAt: diagnostic.createdAt,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to find diagnostic by id: ${errorMessage}`);
    }
  }

  async findByEmail(email: string): Promise<Diagnostic[]> {
    try {
      const diagnostics = await this.prisma.diagnostic.findMany({
        where: { email },
        orderBy: { createdAt: 'desc' },
      });

      return diagnostics.map((diagnostic) =>
        Diagnostic.fromPrimitives({
          id: diagnostic.id,
          name: diagnostic.name,
          email: diagnostic.email,
          scores: {
            personal: diagnostic.personal,
            professional: diagnostic.professional,
            health: diagnostic.health,
            finances: diagnostic.finances,
            family: diagnostic.family,
            love: diagnostic.love,
          },
          average: diagnostic.average,
          createdAt: diagnostic.createdAt,
        }),
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to find diagnostics by email: ${errorMessage}`);
    }
  }

  async findAll(): Promise<Diagnostic[]> {
    try {
      const diagnostics = await this.prisma.diagnostic.findMany({
        orderBy: { createdAt: 'desc' },
        take: 1000, // Limit for performance
      });

      return diagnostics.map((diagnostic) =>
        Diagnostic.fromPrimitives({
          id: diagnostic.id,
          name: diagnostic.name,
          email: diagnostic.email,
          scores: {
            personal: diagnostic.personal,
            professional: diagnostic.professional,
            health: diagnostic.health,
            finances: diagnostic.finances,
            family: diagnostic.family,
            love: diagnostic.love,
          },
          average: diagnostic.average,
          createdAt: diagnostic.createdAt,
        }),
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to find all diagnostics: ${errorMessage}`);
    }
  }
}
