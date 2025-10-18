import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import type * as PDFKit from 'pdfkit';
import type {
  DiagnosticData,
  PdfGeneratorServiceInterface,
} from '../../../application/ports/pdf-generator';

@Injectable()
export class PdfGeneratorAdapter implements PdfGeneratorServiceInterface {
  private drawSectionTitle(doc: PDFKit.PDFDocument, title: string, color = '#2563eb') {
    doc.moveDown(1);
    doc
      .fontSize(20)
      .fillColor(color)
      .text(title, { align: 'left' });
    this.drawDivider(doc, color);
  }

  private drawDivider(doc: PDFKit.PDFDocument, color = '#e5e7eb') {
    const y = doc.y + 6;
    doc
      .moveTo(50, y)
      .lineTo(545, y)
      .lineWidth(2)
      .strokeColor(color)
      .stroke();
    doc.moveDown(1);
  }

  private drawParagraph(doc: PDFKit.PDFDocument, text: string) {
    doc
      .fontSize(12)
      .fillColor('#374151')
      .text(text, { align: 'left' });
    doc.moveDown(0.5);
  }

  private drawBadge(doc: PDFKit.PDFDocument, label: string, bg = '#eef2ff', fg = '#4338ca') {
    const startY = doc.y;
    doc
      .roundedRect(50, startY, 495, 28, 6)
      .fillAndStroke(bg, '#ffffff');
    doc
      .fillColor(fg)
      .fontSize(12)
      .text(label, 60, startY + 8);
    doc.moveDown(1.5);
  }

  private drawScoreBar(doc: PDFKit.PDFDocument, label: string, score: number, icon: string) {
    const getScoreColor = (value: number): string => {
      if (value <= 4) return '#ef4444';
      if (value <= 7) return '#f59e0b';
      return '#10b981';
    };

    const barWidth = (score / 10) * 350;
    const y = doc.y;

    doc
      .fontSize(12)
      .fillColor('#111827')
      .text(`${icon} ${label}`, 50, y);

    const barY = y + 16;
    doc.rect(200, barY, 350, 14).fillColor('#e5e7eb').fill();
    doc
      .rect(200, barY, barWidth, 14)
      .fillColor(getScoreColor(score))
      .fill();

    doc
      .fontSize(11)
      .fillColor('#111827')
      .text(`${score}/10`, 560, barY - 1, { width: 30, align: 'right' });

    doc.moveDown(1.6);
  }

  private getInterpretation(score: number) {
    if (score <= 4) {
      return {
        level: 'Área de Atención Prioritaria',
        interpretation:
          'Probable sensación de estancamiento o insatisfacción. Necesita foco inmediato y hábitos pequeños y consistentes.',
        recommendation:
          'Empieza con un hábito simple que puedas mantener a diario. Bloquea 15–20 minutos en tu agenda para eso.',
      };
    }
    if (score <= 7) {
      return {
        level: 'Área con Potencial de Mejora',
        interpretation:
          'Tienes base, pero falta consistencia o dirección clara para avanzar al siguiente nivel.',
        recommendation:
          'Define un objetivo específico a 3 meses y agenda bloques recurrentes para trabajarlo.',
      };
    }
    return {
      level: 'Área Óptima',
      interpretation: 'Vas por muy buen camino y tienes una rutina sólida que funciona para ti.',
      recommendation: 'Evita estancarte: busca un reto superior o mentorea a otros para seguir creciendo.',
    };
  }

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

        // Portada
        doc
          .fontSize(24)
          .fillColor('#111827')
          .text('Tu Diagnóstico Personalizado', { align: 'center' });
        doc
          .fontSize(16)
          .fillColor('#2563eb')
          .text('El Informe de tu Rueda de la Vida', { align: 'center' });
        doc.moveDown(1.2);
        this.drawBadge(doc, `Preparado para: ${data.name}`);

        // Datos del usuario
        doc
          .fontSize(12)
          .fillColor('#374151')
          .text(`Nombre: ${data.name}`);
        doc.text(`Email: ${data.email}`);
        doc.moveDown(0.5);
        doc
          .fontSize(14)
          .fillColor('#2563eb')
          .text(`Puntuación Promedio: ${data.average.toFixed(1)}/10`, { align: 'left' });
        this.drawDivider(doc);

        // ¿Qué es la Rueda de la Vida?
        this.drawSectionTitle(doc, '¿Qué es la Rueda de la Vida?');
        this.drawParagraph(
          doc,
          `¡Hola, ${data.name}! Felicidades por tomarte el tiempo para hacer este ejercicio. Este diagnóstico se basa en la Rueda de la Vida, una herramienta de coaching poderosa para evaluar tus áreas clave.`,
        );
        this.drawParagraph(
          doc,
          'Su objetivo es darte una visión gráfica y honesta de cómo te sientes con respecto a las áreas más importantes de tu vida en este momento.',
        );
        this.drawParagraph(
          doc,
          'Imagina tu vida como una rueda. Si algunos radios son muy cortos y otros muy largos, la rueda no gira suave. El objetivo no es un 10 en todo, sino lograr equilibrio y fluidez.',
        );

        // Áreas
        this.drawSectionTitle(doc, 'Las Áreas que Componen tu Rueda');
        this.drawParagraph(doc, '🔮 Desarrollo Personal — Crecimiento intelectual, mental y espiritual.');
        this.drawParagraph(doc, '💼 Actividad Profesional — Satisfacción, propósito y crecimiento laboral.');
        this.drawParagraph(doc, '🥗 Alimentación y Salud — Energía, descanso, ejercicio y bienestar físico.');
        this.drawParagraph(doc, '💰 Dinero y Finanzas — Ingresos, control, ahorro y tranquilidad financiera.');
        this.drawParagraph(doc, '👪 Familia y Amigos — Conexión, apoyo y calidad de relaciones.');
        this.drawParagraph(doc, '❤️ Amor y Pareja — Comunicación, intimidad y satisfacción romántica o contigo.');

        // Resultados
        this.drawSectionTitle(doc, `Tus Resultados: ${data.name}`);
        this.drawScoreBar(doc, 'Desarrollo Personal', data.scores.personal, '🔮');
        this.drawScoreBar(doc, 'Actividad Profesional', data.scores.professional, '💼');
        this.drawScoreBar(doc, 'Alimentación y Salud', data.scores.health, '🥗');
        this.drawScoreBar(doc, 'Dinero y Finanzas', data.scores.finances, '💰');
        this.drawScoreBar(doc, 'Familia y Amigos', data.scores.family, '👪');
        this.drawScoreBar(doc, 'Amor y Pareja', data.scores.love, '❤️');

        // Interpretaciones y recomendaciones
        this.drawSectionTitle(doc, 'Qué Significan tus Puntuaciones');
        const areas: Array<{ key: keyof typeof data.scores; title: string; icon: string }> = [
          { key: 'personal', title: 'Desarrollo Personal', icon: '🔮' },
          { key: 'professional', title: 'Actividad Profesional', icon: '💼' },
          { key: 'health', title: 'Alimentación y Salud', icon: '🥗' },
          { key: 'finances', title: 'Dinero y Finanzas', icon: '💰' },
          { key: 'family', title: 'Familia y Amigos', icon: '👪' },
          { key: 'love', title: 'Amor y Pareja', icon: '❤️' },
        ];

        areas.forEach(({ key, title, icon }) => {
          const value = data.scores[key];
          const info = this.getInterpretation(value);
          this.drawBadge(doc, `${icon} Área: ${title} — Tu Puntuación: ${value}/10`, '#ecfeff', '#0e7490');
          this.drawParagraph(doc, `Nivel: ${info.level}`);
          this.drawParagraph(doc, `Interpretación: ${info.interpretation}`);
          this.drawParagraph(doc, `Recomendación: ${info.recommendation}`);
        });

        // Cierre y CTA
        this.drawSectionTitle(doc, 'Tienes tu Diagnóstico. ¿Y ahora qué?');
        this.drawParagraph(
          doc,
          `Felicidades, ${data.name}. La claridad sin acción no transforma. Este PDF es tu mapa; elige tu siguiente paso y conviértelo en hábito.`,
        );
        this.drawParagraph(
          doc,
          'Vuelve ahora a la página donde hiciste tu Rueda de la Vida y descubre el plan de acción para equilibrar tu rueda y avanzar.',
        );

        const btnY = doc.y + 10;
        doc.roundedRect(120, btnY, 360, 30, 6).fillColor('#ef4444').fill();
        doc
          .fontSize(12)
          .fillColor('#ffffff')
          .text('VOLVER AHORA Y DESCUBRIR MI PLAN DE ACCIÓN', 120, btnY + 9, {
            width: 360,
            align: 'center',
          });
        // Clickable link area over the CTA button
        doc.link(120, btnY, 360, 30, 'https://ifraindmg.com/');
        doc.moveDown(3);

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
