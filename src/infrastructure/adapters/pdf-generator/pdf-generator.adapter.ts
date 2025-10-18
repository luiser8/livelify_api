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
    doc
      .roundedRect(x, y, width, height, radius)
      .fillAndStroke(bgColor, '#f3f4f6');
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
    const areas = [
      'personal',
      'professional',
      'health',
      'finances',
      'family',
      'love',
    ];
    const labels = [
      'Personal',
      'Profesional',
      'Salud',
      'Finanzas',
      'Familia',
      'Amor',
    ];
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

  private getAreaDescription(area: string): string {
    const descriptions: Record<string, string> = {
      personal: 'Se refiere a tu crecimiento intelectual, mental y espiritual. Incluye el aprendizaje de nuevas habilidades, tus hobbies, la lectura, tu mentalidad y tu conexión contigo mismo.',
      professional: 'Evalúa tu satisfacción con tu carrera, trabajo o negocio. ¿Sientes que tu trabajo tiene un propósito? ¿Estás creciendo profesionalmente? ¿Te sientes valorado y recompensado?',
      health: 'Mide tu bienestar físico. Esto incluye tu nivel de energía, la calidad de tu alimentación, tu sueño, el ejercicio físico y tu salud general. Es el motor de todo lo demás.',
      finances: 'Representa tu relación con el dinero. ¿Tus ingresos cubren tus necesidades y deseos? ¿Tienes capacidad de ahorro? ¿Sientes control y paz financiera, o estrés y escasez?',
      family: 'Tu red de apoyo y conexiones sociales. Evalúa la calidad de tus relaciones con familiares, amigos y tu comunidad. ¿Te sientes conectado, apoyado y parte de algo?',
      love: 'Se enfoca en tu relación romántica. Si estás en una, ¿cómo es la comunicación, la intimidad y el compañerismo? Si estás soltero, ¿cómo te sientes con esa situación y con tu relación amorosa contigo mismo?',
    };
    return descriptions[area] || '';
  }

  private getAreaInterpretation(area: string, score: number): { interpretation: string; recommendation: string } {
    const interpretations: Record<string, any> = {
      personal: {
        low: {
          interpretation: 'Es probable que sientas que tu crecimiento personal está estancado. Quizás has dejado de aprender cosas nuevas o no dedicas tiempo para ti mismo, tu mente o tus hobbies. Esta es un área fundamental que necesita tu atención.',
          recommendation: 'Revisa qué es lo que te gustaría aprender. Comienza dedicando solo 15 minutos al día a leer un libro sobre un tema que te interese o escuchar un podcast de crecimiento. La clave es empezar pequeño pero ser constante.',
        },
        medium: {
          interpretation: 'Tienes cierta conciencia sobre la importancia de tu desarrollo, pero quizás no es una prioridad constante. Hay avances, pero sientes que podrías estar haciendo más para crecer y nutrir tu mente. Tienes una buena base, pero hay mucho punto de mejora.',
          recommendation: 'Es hora de establecer una rutina. Define un objetivo de aprendizaje claro para los próximos 3 meses (ej. "terminar un curso online"). Bloquea tiempo en tu agenda para esta actividad, tal como lo harías con una reunión importante.',
        },
        high: {
          interpretation: '¡Felicidades! Sientes que estás en un camino de crecimiento constante. Probablemente lees, estudias y te dedicas tiempo a ti mismo de forma regular.',
          recommendation: '¡No te estanques! El crecimiento real está en la incomodidad. Es el momento de "subir de nivel". Si ya lees mucho, intenta escribir. Si ya sabes de un tema, enséñalo. Ponte un desafío que te parezca grande e intimidante para seguir evolucionando.',
        },
      },
      professional: {
        low: {
          interpretation: 'Es muy probable que sientas una fuerte insatisfacción, estrés o estancamiento en tu trabajo o carrera. Puede que no te sientas valorado o que tu trabajo no se alinee con tus valores.',
          recommendation: 'Revisa qué es lo que específicamente no te gusta. ¿Es la tarea, el jefe, la cultura? Actualiza tu CV y empieza a explorar otras opciones, no para cambiarte mañana, sino para ver qué hay en el mercado.',
        },
        medium: {
          interpretation: 'Estás "bien", pero no "genial". Tu trabajo paga las cuentas, pero quizás le falta chispa, propósito o un camino claro de crecimiento. Sientes que tienes mucho potencial por aprovechar.',
          recommendation: 'Busca una conversación con tu superior para pedir feedback y hablar de tu futuro. Propón un nuevo proyecto que te entusiasme o identifica una habilidad que, si la desarrollas, te permitirá asumir más responsabilidades.',
        },
        high: {
          interpretation: '¡Excelente! Disfrutas de tu trabajo, te sientes retado y valorado. Sientes que estás en el lugar correcto y aportando valor.',
          recommendation: 'Es el momento perfecto para evolucionar y no estancarte. ¿Cómo puedes ser un mentor para otros en tu equipo? ¿Puedes empezar un proyecto paralelo (side-hustle) basado en tu expertise? Ponte incómodo buscando el siguiente gran salto profesional.',
        },
      },
      health: {
        low: {
          interpretation: 'Es probable que te sientas bajo de energía, cansado o insatisfecho con tu estado físico. Quizás comes de forma desordenada, no duermes bien o el sedentarismo se ha apoderado de ti.',
          recommendation: 'No intentes cambiar todo de golpe. Revisa tu día y elige un solo hábito para empezar. ¿Puede ser tomar 2 litros de agua al día? ¿O caminar 20 minutos? ¿O dormir 7 horas? Enfócate solo en eso durante una semana.',
        },
        medium: {
          interpretation: 'A veces lo haces bien, a veces mal. Eres consciente de lo que "deberías" hacer, pero te falta consistencia. Tienes puntos de mejora claros para sentirte con más energía.',
          recommendation: 'La clave para ti es la planificación. Planifica tus comidas del fin de semana o deja lista tu ropa de ejercicio la noche anterior. Agenda tus entrenamientos en el calendario como si fueran una reunión. La consistencia vence a la intensidad.',
        },
        high: {
          interpretation: '¡Felicidades! Tienes una rutina sólida de alimentación, descanso y ejercicio. Te sientes con energía y vitalidad la mayor parte del tiempo.',
          recommendation: 'Es hora de un nuevo desafío para no aburrirte. Ponte un reto físico que te ponga incómodo: ¿correr una 10k? ¿Probar un nuevo deporte como la escalada o el boxeo? ¿Aprender a cocinar recetas de alta cocina saludable? Sigue evolucionando.',
        },
      },
      finances: {
        low: {
          interpretation: 'Sientes estrés, ansiedad o escasez en relación al dinero. Quizás las deudas te agobian, no llegas a fin de mes o simplemente no tienes control sobre a dónde se va tu dinero.',
          recommendation: 'El primer paso es la claridad. Haz un presupuesto simple. Durante una semana, anota absolutamente todos tus gastos. Te sorprenderás. Identifica un "gasto hormiga" (como ese café diario) que puedas reducir.',
        },
        medium: {
          interpretation: 'Cubres tus gastos, pero no avanzas. Vives "al día" o ahorras muy poco y sin constancia. Sientes que podrías administrarte mejor y generar más, pero no sabes por dónde empezar.',
          recommendation: 'Automatiza tu ahorro. Configura una transferencia automática para que, apenas recibas tu sueldo, un 5% o 10% se vaya a una cuenta de ahorros que no toques. Empieza a leer sobre cómo generar ingresos adicionales.',
        },
        high: {
          interpretation: 'Tienes control de tus finanzas, ahorras de forma consistente y vives con tranquilidad financiera.',
          recommendation: 'El siguiente nivel es hacer que tu dinero trabaje para ti. Si solo estás ahorrando, tu dinero está perdiendo valor. Es hora de aprender sobre inversiones (fondos, acciones, etc.) para construir patrimonio a largo plazo y no estancarte solo en "ahorrar".',
        },
      },
      family: {
        low: {
          interpretation: 'Es probable que te sientas solo, desconectado o que tengas relaciones conflictivas con tus seres queridos. La rutina te ha alejado de tus amigos o familia.',
          recommendation: 'Esta área requiere proactividad. Revisa tu lista de contactos. Elige a una persona (amigo o familiar) con la que no hablas hace tiempo y envíale un mensaje hoy mismo, solo para saber cómo está.',
        },
        medium: {
          interpretation: 'Tienes buenas relaciones, pero quizás las das por sentado. La rutina y el trabajo consumen tu tiempo y ves menos de lo que te gustaría a la gente que quieres. Hay mucho potencial para reconectar.',
          recommendation: 'Enfócate en la calidad sobre la cantidad. Agenda una "cita" (un café, una comida, una videollamada) con un amigo o familiar esta semana. Ponlo en tu calendario. Un momento de conexión real es mejor que mil mensajes de texto.',
        },
        high: {
          interpretation: 'Tienes una red de apoyo sólida, te sientes querido y dedicas tiempo de calidad a tus relaciones. ¡Es un pilar en tu vida!',
          recommendation: 'Tu reto es no darlo por sentado y ser el pilar para otros. ¿Cómo puedes profundizar aún más esas conexiones? Organiza tú el próximo encuentro. Expresa tu gratitud activamente. Piensa en cómo puedes ayudar a tus amigos a conectar entre ellos.',
        },
      },
      love: {
        low: {
          interpretation: '(Si estás en pareja) Es probable que haya conflicto, distancia, aburrimiento o falta de comunicación. (Si estás soltero) Es probable que te sientas frustrado, solo o pesimista respecto a encontrar a alguien.',
          recommendation: '(En pareja) Inicia una conversación honesta. Pregunta: "¿Cómo estás realmente con nosotros?". (Soltero) Deja de buscar fuera y trabaja en la relación contigo mismo. Haz esa actividad que siempre has querido hacer a solas.',
        },
        medium: {
          interpretation: '(En pareja) La relación es estable, pero ha caído en la rutina. Se quieren, pero falta "chispa". (Si estás soltero) Estás bien contigo mismo, pero te gustaría conocer a alguien y tener una conexión.',
          recommendation: '(En pareja) ¡Salgan de la rutina! Establezcan una "noche de cita" semanal, sin teléfonos, para reconectar. (Soltero) Apúntate a una actividad social nueva (clases de baile, club de lectura, gimnasio) donde puedas conocer gente nueva con tus mismos intereses.',
        },
        high: {
          interpretation: '¡Felicidades! Te sientes pleno, conectado, amado y feliz en esta área, ya sea en una relación próspera o en una soltería elegida y disfrutada.',
          recommendation: 'El reto es seguir nutriendo esta área. Las relaciones (contigo o con otro) son como plantas. Sigan "conquistándose" a diario. Establezcan metas a futuro juntos (o contigo mismo). ¿Qué gran aventura pueden planear para seguir evolucionando?',
        },
      },
    };

    const level = score <= 4 ? 'low' : score <= 7 ? 'medium' : 'high';
    return interpretations[area]?.[level] || { interpretation: '', recommendation: '' };
  }

  async generateDiagnosticPdf(data: DiagnosticData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margins: { top: 40, bottom: 40, left: 40, right: 40 },
        });

        const chunks: Buffer[] = [];
        doc.on('data', (chunk: Buffer) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        const pageWidth = 595 - 80; // A4 width minus margins

        // Page 1: Cover with introduction
        // Header gradient
        this.drawGradientBackground(doc, 0, 0, 595, 200, '#8b5cf6', '#3b82f6');

        // Title
        doc
          .fontSize(28)
          .fillColor('#ffffff')
          .text('Tu Diagnóstico Personalizado', 50, 50, {
            align: 'center',
          });
        
        doc
          .fontSize(16)
          .fillColor('#ffffff')
          .opacity(0.9)
          .text('El Informe de tu Rueda de la Vida', 50, 90, {
            align: 'center',
          });

        // User info card
        this.drawCard(doc, 50, 140, pageWidth, 80);
        doc
          .fontSize(12)
          .fillColor('#6b7280')
          .opacity(1)
          .text('Preparado para:', 70, 155);
        doc
          .fontSize(16)
          .fillColor('#111827')
          .text(data.name, 70, 175);
        doc
          .fontSize(11)
          .fillColor('#6b7280')
          .text(data.email, 70, 198);

        // Introduction section
        doc
          .fontSize(16)
          .fillColor('#111827')
          .text('¿Qué es la Rueda de la Vida?', 50, 250);
        
        doc
          .fontSize(11)
          .fillColor('#374151')
          .text(`¡Hola, ${data.name}!`, 50, 280);
        
        doc
          .fontSize(10)
          .fillColor('#374151')
          .text(
            'Felicidades por tomarte el tiempo para hacer este ejercicio. Lo que tienes en tus manos es un diagnóstico basado en la Rueda de la Vida, una de las herramientas de coaching y autoconocimiento más poderosas que existen.',
            50,
            305,
            { width: pageWidth, align: 'justify' }
          );

        doc.text(
          'Su objetivo es simple: darte una visión gráfica y honesta de cómo te sientes con respecto a las áreas clave de tu vida en este preciso momento.',
          50,
          355,
          { width: pageWidth, align: 'justify' }
        );

        doc.text(
          'Imagina tu vida como una rueda. Si algunos radios (las áreas) son muy cortos (puntuación baja) y otros muy largos (puntuación alta), la rueda no podrá girar suavemente. Esto se traduce en estrés, estancamiento y sensación de desequilibrio.',
          50,
          405,
          { width: pageWidth, align: 'justify' }
        );

        doc.text(
          'El objetivo no es tener un "10" en todo, sino encontrar un equilibrio que te brinde satisfacción y te permita avanzar con fluidez. Este informe es tu punto de partida. No es "bueno" ni "malo", es simplemente tu mapa actual. Y ahora que tienes el mapa, puedes decidir la ruta.',
          50,
          475,
          { width: pageWidth, align: 'justify' }
        );

        // Average score at bottom
        this.drawCard(doc, 150, 580, 315, 100);
        doc
          .fontSize(12)
          .fillColor('#6b7280')
          .text('Puntuación Promedio', 0, 595, { align: 'center' });
        doc
          .fontSize(42)
          .fillColor('#8b5cf6')
          .text(`${data.average.toFixed(1)}`, 0, 615, { align: 'center' });
        doc
          .fontSize(16)
          .fillColor('#6b7280')
          .text('/10', 0, 655, { align: 'center' });

        // Page 2: Areas explanation
        doc.addPage();

        doc
          .fontSize(20)
          .fillColor('#111827')
          .text('Las Áreas que Componen tu Rueda', 50, 50);

        let yPos = 90;
        const areaOrder = ['personal', 'professional', 'health', 'finances', 'family', 'love'];

        areaOrder.forEach((area) => {
          if (yPos > 650) {
            doc.addPage();
            yPos = 60;
          }

          const color = this.getAreaColor(area);
          const label = this.getAreaLabel(area);
          const description = this.getAreaDescription(area);

          doc
            .fontSize(12)
            .fillColor(color)
            .text(label, 50, yPos);
          
          doc
            .fontSize(9)
            .fillColor('#374151')
            .text(description, 50, yPos + 18, { width: pageWidth, align: 'justify' });

          yPos += 80;
        });

        // Page 3: Results with radar chart
        doc.addPage();

        doc
          .fontSize(20)
          .fillColor('#111827')
          .text(`Tus Resultados: ${data.name}`, 50, 50);

        doc
          .fontSize(14)
          .fillColor('#6b7280')
          .text(`Puntuación Promedio: ${data.average.toFixed(1)} / 10`, 50, 80);

        // Hexagon radar chart
        this.drawHexagonRadar(doc, 297, 250, 100, data.scores);

        // Individual scores
        let scoreY = 380;
        areaOrder.forEach((area) => {
          const score = data.scores[area as keyof typeof data.scores] || 0;
          const color = this.getAreaColor(area);
          const label = this.getAreaLabel(area);

          this.drawCard(doc, 50, scoreY, pageWidth, 60);
          
          doc
            .fontSize(11)
            .fillColor('#111827')
            .text(label, 70, scoreY + 12);
          
          doc
            .fontSize(18)
            .fillColor(color)
            .text(`${score}/10`, pageWidth - 30, scoreY + 10, {
              width: 60,
              align: 'right',
            });

          this.drawProgressBar(
            doc,
            70,
            scoreY + 35,
            pageWidth - 140,
            10,
            score,
            10,
            color,
            false,
          );

          scoreY += 70;
        });

        // Page 4+: Detailed analysis per area
        doc.addPage();

        doc
          .fontSize(20)
          .fillColor('#111827')
          .text('Qué Significan tus Puntuaciones', 50, 50);
        
        doc
          .fontSize(11)
          .fillColor('#6b7280')
          .text(
            'A continuación, analizamos cada área de tu vida según la puntuación que asignaste. Usa esto como una guía para reflexionar y decidir tus próximos pasos.',
            50,
            80,
            { width: pageWidth, align: 'justify' }
          );

        yPos = 120;

        areaOrder.forEach((area) => {
          const score = data.scores[area as keyof typeof data.scores] || 0;
          const color = this.getAreaColor(area);
          const label = this.getAreaLabel(area);
          const { interpretation, recommendation } = this.getAreaInterpretation(area, score);
          
          const level = score <= 4 ? 'Área de Atención Prioritaria' : 
                        score <= 7 ? 'Área con Potencial de Mejora' : 
                        'Área Óptima';

          // Check if we need a new page
          if (yPos > 500) {
            doc.addPage();
            yPos = 60;
          }

          // Area header
          doc
            .fontSize(14)
            .fillColor(color)
            .text(`Área: ${label}`, 50, yPos);
          
          doc
            .fontSize(12)
            .fillColor('#111827')
            .text(`Tu Puntuación: ${score} / 10`, 50, yPos + 20);
          
          doc
            .fontSize(10)
            .fillColor('#6b7280')
            .text(`Nivel: ${level}`, 50, yPos + 38);

          // Interpretation
          doc
            .fontSize(10)
            .fillColor('#111827')
            .text('Interpretación:', 50, yPos + 58);
          
          doc
            .fontSize(9)
            .fillColor('#374151')
            .text(interpretation, 50, yPos + 75, { width: pageWidth, align: 'justify' });

          // Recommendation
          doc
            .fontSize(10)
            .fillColor('#111827')
            .text('Recomendación:', 50, yPos + 145);
          
          doc
            .fontSize(9)
            .fillColor('#374151')
            .text(recommendation, 50, yPos + 162, { width: pageWidth, align: 'justify' });

          yPos += 250;
        });

        // Final page: Call to action
        doc.addPage();

        // Call to action header
        this.drawGradientBackground(doc, 0, 0, 595, 150, '#f97316', '#dc2626');
        
        doc
          .fontSize(24)
          .fillColor('#ffffff')
          .text('Tienes tu Diagnóstico. ¿Y ahora qué?', 50, 50, {
            align: 'center',
          });

        doc
          .fontSize(13)
          .fillColor('#ffffff')
          .opacity(0.95)
          .text(`Felicidades, ${data.name}.`, 50, 90, { align: 'center' });
        
        doc
          .fontSize(11)
          .fillColor('#ffffff')
          .text(
            'Acabas de hacer algo que el 90% de las personas evita: mirarte honestamente en el espejo.',
            50,
            110,
            { align: 'center' }
          );

        // Action text
        doc
          .fontSize(11)
          .fillColor('#111827')
          .opacity(1)
          .text(
            'Ahora tienes claridad total. Sabes exactamente qué áreas de tu vida están frenando tu potencial. Sabes dónde estás estancado.',
            50,
            180,
            { width: pageWidth, align: 'justify' }
          );

        doc
          .fontSize(11)
          .fillColor('#111827')
          .text(
            'Pero seamos brutalmente honestos: La claridad es inútil si no va seguida de ACCIÓN.',
            50,
            220,
            { width: pageWidth, align: 'justify' }
          );

        doc
          .fontSize(11)
          .fillColor('#374151')
          .text(
            'Este PDF es tu mapa. Es la "radiografía" de tu situación actual. Pero no es la cura.',
            50,
            260,
            { width: pageWidth, align: 'justify' }
          );

        doc
          .fontSize(11)
          .fillColor('#374151')
          .text(
            'Esos números bajos que viste no van a subir mágicamente. El estrés financiero, la falta de energía o la insatisfacción profesional no desaparecen solo porque ahora les pusiste un número.',
            50,
            300,
            { width: pageWidth, align: 'justify' }
          );

        doc
          .fontSize(11)
          .fillColor('#111827')
          .text(
            'Sin un plan. Sin un sistema. Sin la guía correcta... es muy probable que en 6 meses tu Rueda de la Vida se vea exactamente igual.',
            50,
            360,
            { width: pageWidth, align: 'justify' }
          );

        doc
          .fontSize(12)
          .fillColor('#111827')
          .text('La pregunta es: ¿Qué vas a hacer al respecto?', 50, 410);

        doc
          .fontSize(11)
          .fillColor('#374151')
          .text(
            'Puedes cerrar este PDF, guardarlo en una carpeta y volver a la rutina que te dio estos resultados...',
            50,
            440,
            { width: pageWidth, align: 'justify' }
          );

        doc
          .fontSize(11)
          .fillColor('#111827')
          .text(
            '...O puedes tomar una decisión.',
            50,
            480,
            { width: pageWidth, align: 'justify' }
          );

        doc
          .fontSize(11)
          .fillColor('#111827')
          .text(
            'La decisión de que este diagnóstico no sea un final, sino el punto de partida de tu transformación.',
            50,
            510,
            { width: pageWidth, align: 'justify' }
          );

        // CTA section
        this.drawCard(doc, 50, 560, pageWidth, 140);
        
        doc
          .fontSize(11)
          .fillColor('#111827')
          .text(
            'VUELVE AHORA MISMO A LA PÁGINA DONDE HICISTE TU RUEDA DE LA VIDA.',
            70,
            580,
            { width: pageWidth - 40, align: 'center' }
          );

        doc
          .fontSize(10)
          .fillColor('#6b7280')
          .text(
            'Justo allí, debajo de la herramienta que acabas de usar, he revelado la solución exacta que necesitas para pasar del diagnóstico a la transformación real.',
            70,
            610,
            { width: pageWidth - 40, align: 'center' }
          );

        // CTA button
        const btnY = 660;
        this.drawGradientBackground(doc, 150, btnY, 315, 40, '#8b5cf6', '#3b82f6');
        doc
          .roundedRect(150, btnY, 315, 40, 20)
          .lineWidth(0)
          .stroke();
        
        doc
          .fontSize(11)
          .fillColor('#ffffff')
          .text('VOLVER AHORA Y DESCUBRIR MI PLAN DE ACCIÓN', 150, btnY + 14, {
            width: 315,
            align: 'center',
          });
        
        // Make button clickable
        doc.link(150, btnY, 315, 40, 'https://ifraindmg.com/');

        // Finalize PDF
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}