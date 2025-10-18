import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import type * as PDFKit from 'pdfkit';
import type {
  DiagnosticData,
  PdfGeneratorServiceInterface,
} from '../../../application/ports/pdf-generator';

@Injectable()
export class PdfGeneratorAdapter implements PdfGeneratorServiceInterface {
  private drawGradientBackground(
    doc: PDFKit.PDFDocument,
    x: number,
    y: number,
    width: number,
    height: number,
    color1: string,
    color2: string,
  ) {
    const gradient = doc.linearGradient(x, y, x + width, y);
    gradient.stop(0, color1);
    gradient.stop(1, color2);
    doc.rect(x, y, width, height).fill(gradient);
  }

  private drawCard(
    doc: PDFKit.PDFDocument,
    x: number,
    y: number,
    width: number,
    height: number,
    bgColor = '#ffffff',
    radius = 10,
  ) {
    // Shadow
    doc
      .save()
      .fillColor('#00000010')
      .roundedRect(x + 2, y + 2, width, height, radius)
      .fill()
      .restore();
    
    // Card background
    doc.roundedRect(x, y, width, height, radius).fillAndStroke(bgColor, '#f3f4f6');
  }

  private drawProgressBar(
    doc: PDFKit.PDFDocument,
    x: number,
    y: number,
    width: number,
    height: number,
    value: number,
    maxValue: number,
    color: string,
    showLabels = true,
  ) {
    const percentage = value / maxValue;
    const filledWidth = width * percentage;

    // Background track
    doc.roundedRect(x, y, width, height, height / 2).fill('#e5e7eb');

    // Filled portion
    if (filledWidth > 0) {
      doc.roundedRect(x, y, filledWidth, height, height / 2).fill(color);
    }

    // Value indicator circle
    doc
      .circle(x + filledWidth, y + height / 2, height / 2 + 2)
      .fillAndStroke('#ffffff', color);
    
    if (showLabels) {
      // Labels
      doc
        .fontSize(9)
        .fillColor('#9ca3af')
        .text('1', x - 15, y + height / 2 - 4);
      doc.text('5', x + width / 2 - 5, y + height - 2);
      doc.text('10', x + width + 5, y + height / 2 - 4);
    }
  }

  private drawHexagonRadar(
    doc: PDFKit.PDFDocument,
    centerX: number,
    centerY: number,
    radius: number,
    scores: Record<string, number>,
  ) {
    const areas = ['personal', 'professional', 'health', 'finances', 'family', 'love'];
    const labels = ['Personal', 'Profesional', 'Salud', 'Finanzas', 'Familia', 'Amor'];
    const angleStep = (Math.PI * 2) / 6;

    // Draw grid hexagons
    for (let level = 1; level <= 3; level++) {
      const levelRadius = (radius * level) / 3;
      doc.strokeColor('#e5e7eb').lineWidth(1);
      
      for (let i = 0; i <= 6; i++) {
        const angle = angleStep * i - Math.PI / 2;
        const x = centerX + Math.cos(angle) * levelRadius;
        const y = centerY + Math.sin(angle) * levelRadius;
        
        if (i === 0) {
          doc.moveTo(x, y);
        } else {
          doc.lineTo(x, y);
        }
      }
      doc.stroke();
    }

    // Draw axes
    for (let i = 0; i < 6; i++) {
      const angle = angleStep * i - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      doc
        .moveTo(centerX, centerY)
        .lineTo(x, y)
        .strokeColor('#e5e7eb')
        .lineWidth(1)
        .stroke();

      // Labels
      const labelX = centerX + Math.cos(angle) * (radius + 20);
      const labelY = centerY + Math.sin(angle) * (radius + 20);
      
      doc
        .fontSize(10)
        .fillColor('#6b7280')
        .text(labels[i], labelX - 25, labelY - 5, {
          width: 50,
          align: 'center',
        });
    }

    // Draw data polygon
    doc.save();
    const dataPoints: Array<[number, number]> = [];
    
    areas.forEach((area, i) => {
      const score = scores[area as keyof typeof scores] || 0;
      const angle = angleStep * i - Math.PI / 2;
      const distance = (radius * score) / 10;
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      dataPoints.push([x, y]);
    });

    // Fill polygon
    doc.fillColor('#8b5cf6').opacity(0.3);
    dataPoints.forEach(([x, y], i) => {
      if (i === 0) doc.moveTo(x, y);
      else doc.lineTo(x, y);
    });
    doc.closePath().fill();

    // Stroke polygon
    doc.strokeColor('#8b5cf6').opacity(1).lineWidth(2);
    dataPoints.forEach(([x, y], i) => {
      if (i === 0) doc.moveTo(x, y);
      else doc.lineTo(x, y);
    });
    doc.closePath().stroke();

    // Draw points
    dataPoints.forEach(([x, y]) => {
      doc.circle(x, y, 4).fillAndStroke('#8b5cf6', '#ffffff');
    });

    doc.restore();
  }

  private getAreaColor(area: string): string {
    const colors: Record<string, string> = {
      personal: '#8b5cf6',
      professional: '#3b82f6',
      health: '#10b981',
      finances: '#f59e0b',
      family: '#fb923c',
      love: '#ec4899',
    };
    return colors[area] || '#6b7280';
  }

  private getAreaIcon(area: string): string {
    const icons: Record<string, string> = {
      personal: '🔮',
      professional: '💼',
      health: '🥗',
      finances: '💰',
      family: '👪',
      love: '❤️',
    };
    return icons[area] || '📊';
  }

  private getAreaLabel(area: string): string {
    const labels: Record<string, string> = {
      personal: 'Desarrollo Personal',
      professional: 'Actividad Profesional',
      health: 'Alimentación y Salud',
      finances: 'Dinero y Finanzas',
      family: 'Familia y Amigos',
      love: 'Amor y Pareja',
    };
    return labels[area] || area;
  }

  async generateDiagnosticPdf(data: DiagnosticData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margins: { top: 40, bottom: 40, left: 40, right: 40 },
        });

        const chunks: Buffer[] = [];
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        const pageWidth = 595 - 80; // A4 width minus margins
        const pageHeight = 842 - 80; // A4 height minus margins

        // Page 1: Cover with radar chart
        // Header gradient
        this.drawGradientBackground(doc, 0, 0, 595, 200, '#8b5cf6', '#3b82f6');

        // Title
        doc
          .fontSize(28)
          .fillColor('#ffffff')
          .text('Tu Diagnóstico Personalizado', 50, 50, { align: 'center' });
        
        doc
          .fontSize(16)
          .fillColor('#ffffff')
          .opacity(0.9)
          .text('Rueda de la Vida - Análisis Completo', 50, 90, { align: 'center' });

        // User info card
        this.drawCard(doc, 50, 140, pageWidth, 80);
        doc
          .fontSize(14)
          .fillColor('#111827')
          .opacity(1)
          .text(`${data.name}`, 70, 160);
        doc
          .fontSize(11)
          .fillColor('#6b7280')
          .text(`${data.email}`, 70, 180);
        doc
          .fontSize(11)
          .fillColor('#6b7280')
          .text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 70, 198);

        // Average score card
        this.drawCard(doc, 50, 240, pageWidth, 120);
        doc
          .fontSize(12)
          .fillColor('#6b7280')
          .text('Puntuación Promedio', 0, 255, { align: 'center' });
        doc
          .fontSize(48)
          .fillColor('#8b5cf6')
          .text(`${data.average.toFixed(1)}`, 0, 280, { align: 'center' });
        doc
          .fontSize(16)
          .fillColor('#6b7280')
          .text('/10', 0, 330, { align: 'center' });

        // Hexagon radar chart
        doc
          .fontSize(14)
          .fillColor('#111827')
          .text('Visualización de tus Áreas', 50, 390);
        
        this.drawHexagonRadar(doc, 297, 500, 80, data.scores);

        // Individual scores summary at bottom
        const scoreY = 620;
        const areas = Object.entries(data.scores);
        const halfIndex = Math.ceil(areas.length / 2);
        
        // Left column
        areas.slice(0, halfIndex).forEach(([area, score], index) => {
          const y = scoreY + index * 25;
          const icon = this.getAreaIcon(area);
          const color = this.getAreaColor(area);
          
          doc
            .fontSize(10)
            .fillColor(color)
            .text(`${icon}`, 60, y);
          doc
            .fontSize(10)
            .fillColor('#374151')
            .text(`${this.getAreaLabel(area)}`, 80, y);
          doc
            .fontSize(10)
            .fillColor('#6b7280')
            .text(`${score}/10`, 200, y, { width: 40, align: 'right' });
        });

        // Right column
        areas.slice(halfIndex).forEach(([area, score], index) => {
          const y = scoreY + index * 25;
          const icon = this.getAreaIcon(area);
          const color = this.getAreaColor(area);
          
          doc
            .fontSize(10)
            .fillColor(color)
            .text(`${icon}`, 320, y);
          doc
            .fontSize(10)
            .fillColor('#374151')
            .text(`${this.getAreaLabel(area)}`, 340, y);
          doc
            .fontSize(10)
            .fillColor('#6b7280')
            .text(`${score}/10`, 460, y, { width: 40, align: 'right' });
        });

        // Page 2: Detailed analysis
        doc.addPage();

        // Header for page 2
        doc
          .fontSize(24)
          .fillColor('#111827')
          .text('Análisis Detallado por Área', 50, 50);
        
        doc
          .fontSize(12)
          .fillColor('#6b7280')
          .text('Interpretación personalizada de tus resultados', 50, 80);

        // Draw each area analysis
        let yPosition = 120;
        const areaOrder = ['personal', 'professional', 'health', 'finances', 'family', 'love'];

        areaOrder.forEach((area) => {
          if (yPosition > 650) {
            doc.addPage();
            yPosition = 60;
          }

          const score = data.scores[area as keyof typeof data.scores] || 0;
          const color = this.getAreaColor(area);
          const icon = this.getAreaIcon(area);
          const label = this.getAreaLabel(area);

          // Area card
          this.drawCard(doc, 50, yPosition, pageWidth, 100);

          // Icon and title
          doc
            .fontSize(16)
            .fillColor(color)
            .text(icon, 70, yPosition + 15);
          doc
            .fontSize(14)
            .fillColor('#111827')
            .text(label, 100, yPosition + 17);
          
          // Score badge
          doc
            .fontSize(20)
            .fillColor(color)
            .text(`${score}`, pageWidth - 30, yPosition + 15, {
              width: 60,
              align: 'right',
            });
          doc
            .fontSize(12)
            .fillColor('#6b7280')
            .text('/10', pageWidth + 5, yPosition + 20, {
              width: 25,
              align: 'right',
            });

          // Progress bar
          this.drawProgressBar(
            doc,
            70,
            yPosition + 50,
            pageWidth - 40,
            12,
            score,
            10,
            color,
            true,
          );

          // Interpretation
          const interpretation = this.getInterpretation(score);
          doc
            .fontSize(9)
            .fillColor('#6b7280')
            .text(interpretation.level, 70, yPosition + 75);

          yPosition += 120;
        });

        // Page 3: Action plan
        doc.addPage();

        // Call to action header
        this.drawGradientBackground(doc, 0, 0, 595, 150, '#f97316', '#dc2626');
        
        doc
          .fontSize(24)
          .fillColor('#ffffff')
          .text('¿Y ahora qué?', 50, 50, { align: 'center' });
        
        doc
          .fontSize(14)
          .fillColor('#ffffff')
          .opacity(0.95)
          .text(
            'Has dado el primer paso. La claridad sin acción no transforma.',
            50,
            90,
            { align: 'center' },
          );

        // Action card
        this.drawCard(doc, 50, 180, pageWidth, 200);
        doc
          .fontSize(16)
          .fillColor('#111827')
          .opacity(1)
          .text('Tu Plan de Transformación te espera', 70, 200);
        
        doc
          .fontSize(12)
          .fillColor('#6b7280')
          .text(
            'Basado en tus resultados, hemos preparado un plan personalizado con:',
            70,
            230,
          );
        
        const features = [
          '✓ 8 módulos transformadores',
          '✓ Ejercicios prácticos paso a paso',
          '✓ Acompañamiento personalizado',
          '✓ Comunidad de apoyo',
          '✓ Garantía de resultados',
        ];
        
        features.forEach((feature, index) => {
          doc
            .fontSize(11)
            .fillColor('#10b981')
            .text(feature, 80, 260 + index * 20);
        });

        // CTA button
        const btnY = 400;
        this.drawGradientBackground(doc, 150, btnY, 315, 50, '#8b5cf6', '#3b82f6');
        doc
          .roundedRect(150, btnY, 315, 50, 25)
          .lineWidth(0)
          .stroke();
        
        doc
          .fontSize(14)
          .fillColor('#ffffff')
          .text('DESCUBRE TU PLAN PERSONALIZADO', 150, btnY + 18, {
            width: 315,
            align: 'center',
          });
        
        // Make button clickable
        doc.link(150, btnY, 315, 50, 'https://ifraindmg.com/');

        // Footer
        doc
          .fontSize(10)
          .fillColor('#6b7280')
          .text(
            'Este diagnóstico es el inicio de tu transformación.',
            50,
            500,
            { align: 'center' },
          );
        
        doc
          .fontSize(10)
          .fillColor('#8b5cf6')
          .text('www.ifraindmg.com', 50, 520, { align: 'center' });

        // Finalize PDF
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  private getInterpretation(score: number) {
    if (score <= 4) {
      return {
        level: 'Necesita atención prioritaria',
        color: '#ef4444',
      };
    }
    if (score <= 7) {
      return {
        level: 'Área con oportunidad de mejora',
        color: '#f59e0b',
      };
    }
    return {
      level: 'Área en buen estado',
      color: '#10b981',
    };
  }
}