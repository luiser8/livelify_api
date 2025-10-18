/**
 * PDF Generator Service Port
 * Interface for generating PDF documents
 */

export const PDF_GENERATOR_SERVICE_TOKEN = Symbol('PDF_GENERATOR_SERVICE');

export interface DiagnosticData {
  name: string;
  email: string;
  scores: {
    personal: number;
    professional: number;
    health: number;
    finances: number;
    family: number;
    love: number;
  };
  average: number;
}

export interface PdfGeneratorServiceInterface {
  generateDiagnosticPdf(data: DiagnosticData): Promise<Buffer>;
}
