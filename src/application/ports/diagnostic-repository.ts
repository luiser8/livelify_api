/**
 * Diagnostic Repository Port
 * Interface for persisting diagnostic data
 */

import type { Diagnostic } from '../../domain/entities/diagnostic.entity';

export const DIAGNOSTIC_REPOSITORY_TOKEN = Symbol('DIAGNOSTIC_REPOSITORY');

export interface DiagnosticRepositoryInterface {
  save(diagnostic: Diagnostic): Promise<Diagnostic>;
  findById(id: string): Promise<Diagnostic | null>;
  findByEmail(email: string): Promise<Diagnostic[]>;
  findAll(): Promise<Diagnostic[]>;
}
