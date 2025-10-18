import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import type {
  DiagnosticData,
  PdfGeneratorServiceInterface,
} from '../../../application/ports/pdf-generator';

@Injectable()
export class PdfGeneratorAdapter implements PdfGeneratorServiceInterface {
  async generateDiagnosticPdf(data: DiagnosticData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margins: { top: 50, bottom: 50, left: 50, right: 50 },
        });

        const chunks: Buffer[] = [];

        // Collect PDF chunks
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Header
        doc
          .fontSize(24)
          .fillColor('#2563eb')
          .text('Diagnóstico de la Rueda de la Vida', { align: 'center' });

        doc.moveDown(1);

        // User Info
        doc
          .fontSize(14)
          .fillColor('#000000')
          .text(`Nombre: ${data.name}`, { align: 'left' });
        doc.text(`Email: ${data.email}`, { align: 'left' });

        doc.moveDown(1);

        // Average Score
        doc
          .fontSize(16)
          .fillColor('#2563eb')
          .text(`Puntuación Promedio: ${data.average.toFixed(1)}/10`, {
            align: 'center',
          });

        doc.moveDown(2);

        // Title for scores section
        doc.fontSize(18).fillColor('#000000').text('Puntuaciones por Área:', {
          align: 'left',
        });

        doc.moveDown(1);

        // Area labels in Spanish
        const areaLabels = {
          personal: 'Personal',
          professional: 'Profesional',
          health: 'Salud',
          finances: 'Finanzas',
          family: 'Familia',
          love: 'Amor',
        };

        // Define colors for different score ranges
        const getScoreColor = (score: number): string => {
          if (score <= 3) return '#ef4444'; // red
          if (score <= 6) return '#f59e0b'; // orange
          return '#10b981'; // green
        };

        // Draw each area score with bar chart
        Object.entries(data.scores).forEach(([area, score]) => {
          const label = areaLabels[area as keyof typeof areaLabels];
          const barWidth = (score / 10) * 400; // Max width 400 points

          // Area name
          doc.fontSize(12).fillColor('#000000').text(`${label}:`, 50, doc.y, {
            continued: false,
          });

          const barY = doc.y;

          // Score bar background
          doc.rect(150, barY, 400, 20).fillColor('#e5e7eb').fill();

          // Score bar filled portion
          doc
            .rect(150, barY, barWidth, 20)
            .fillColor(getScoreColor(score))
            .fill();

          // Score text
          doc
            .fontSize(11)
            .fillColor('#000000')
            .text(`${score}/10`, 560, barY + 3);

          doc.moveDown(1.5);
        });

        doc.moveDown(2);

        // Footer with date
        doc
          .fontSize(10)
          .fillColor('#6b7280')
          .text(
            `Generado el ${new Date().toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}`,
            { align: 'center' },
          );

        doc.moveDown(0.5);
        doc
          .fontSize(10)
          .fillColor('#2563eb')
          .text('Livelify - Tu Coach Personal', { align: 'center' });

        // Finalize PDF
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}
