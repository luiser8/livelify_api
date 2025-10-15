/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-misused-promises */

import { PrismaClient, PlanType } from '@prisma/client';

const prisma = new PrismaClient();

// Get current environment
const environment =
  process.env.APP_ENV || process.env.NODE_ENV || 'development';

async function main() {
  console.log(`🌱 Seeding database for environment: ${environment}...`);

  // ======================
  // Subscription Plans
  // ======================
  const subscriptionPlans = [
    {
      name: PlanType.MONTHLY,
      description: 'Perfect for trying out the platform',
      basePrice: 19.99,
      pricePerMonth: 19.99,
      savings: 0,
      discount: 0,
      billingCycle: 1,
      bestFor: 'Mensual',
      features: {
        projects: 3,
        actions: 100,
        analytics: 'ENABLED',
      },
    },
    {
      name: PlanType.QUARTERLY,
      description: 'Best value for 3 months',
      basePrice: 49.99,
      pricePerMonth: 16.66,
      savings: 10,
      discount: 17,
      billingCycle: 3,
      bestFor: 'Trimestral',
      features: {
        projects: 5,
        actions: 200,
        analytics: 'ENABLED',
      },
    },
    {
      name: PlanType.SEMESTER,
      description: 'Great savings for 6 months',
      basePrice: 89.99,
      pricePerMonth: 15,
      savings: 30,
      discount: 25,
      billingCycle: 6,
      bestFor: 'Semestral',
      features: {
        projects: 7,
        actions: 300,
        analytics: 'ENABLED',
      },
    },
    {
      name: PlanType.ANNUAL,
      description: 'Maximum savings for the full year',
      basePrice: 150,
      pricePerMonth: 12.5,
      savings: 90,
      discount: 37,
      billingCycle: 12,
      bestFor: 'Anual',
      features: {
        projects: 10,
        actions: 500,
        analytics: 'ENABLED',
      },
    },
  ];

  for (const plan of subscriptionPlans) {
    await prisma.subscriptionPlan.upsert({
      where: { name: plan.name },
      update: {},
      create: plan,
    });
  }

  // ======================
  // Currencies
  // ======================
  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'MXN', name: 'Peso Mexicano', symbol: '₱' },
    { code: 'CLP', name: 'Peso Chileno', symbol: '₱' },
  ];

  for (const currency of currencies) {
    await prisma.currency.upsert({
      where: { code: currency.code },
      update: {},
      create: currency,
    });
  }

  // ==================================
  // Areas and Questions
  // ==================================
  const areasWithQuestions = [
    {
      name: 'PERSONAL_DEVELOPMENT',
      description: 'Desarrollo Personal',
      questions: [
        {
          text: '¿Inviertes tiempo y recursos en tu desarrollo personal?',
          haveMoreQuestions: false,
          tip: 'El desarrollo personal requiere dedicación constante. Considera asignar tiempo específico cada semana para tu crecimiento.',
        },
        {
          text: '¿Lees, escuchas podcasts o has hecho algún curso sobre autoconocimiento?',
          haveMoreQuestions: false,
          tip: 'El autoconocimiento es la base del crecimiento. Explora diferentes formatos hasta encontrar el que más te resuene.',
        },
        {
          text: '¿Has realizado o haces actualmente algún tipo de terapia?',
          haveMoreQuestions: false,
          tip: 'La terapia es una herramienta poderosa para el autodescubrimiento. No dudes en buscar ayuda profesional cuando lo necesites.',
        },
        {
          text: '¿Te dedicas tiempo?',
          haveMoreQuestions: false,
          tip: 'Dedicarte tiempo no es egoísmo, es autocuidado. Programa momentos solo para ti en tu agenda.',
        },
        {
          text: '¿Sabes cómo Gestionar tus emociones?',
          haveMoreQuestions: false,
          tip: 'La gestión emocional es una habilidad que se desarrolla. Practica identificar y nombrar lo que sientes.',
        },
        {
          text: '¿Meditas o practicas algún tipo de ejercicio para conectar contigo mismo?',
          haveMoreQuestions: false,
          tip: 'La meditación no requiere horas. Comienza con 5 minutos diarios y observa los beneficios.',
        },
        {
          text: '¿Has trabajado tus traumas infantiles?',
          haveMoreQuestions: false,
          tip: 'Reconocer y trabajar los traumas del pasado es fundamental para vivir plenamente el presente.',
        },
        {
          text: '¿Sientes que creces y evolucionas?',
          haveMoreQuestions: false,
          tip: 'El crecimiento personal es un proceso, no un destino. Celebra los pequeños avances.',
        },
        {
          text: '¿Has cambiado mucho en los últimos años?',
          haveMoreQuestions: false,
          tip: 'El cambio es señal de vida. Reflexiona sobre cómo has evolucionado y qué has aprendido.',
        },
        {
          text: '¿Te conoces?',
          haveMoreQuestions: false,
          tip: 'El autoconocimiento es un viaje de toda la vida. Sigue explorando quién eres y qué quieres.',
        },
      ],
    },
    {
      name: 'PROFESSIONAL_ACTIVITY',
      description: 'Actividad Profesional',
      questions: [
        {
          text: '¿Te gusta tu trabajo actualmente?',
          haveMoreQuestions: false,
          tip: 'Tu trabajo ocupa gran parte de tu vida. Si no te apasiona, explora qué cambios podrías hacer.',
        },
        {
          text: '¿Te sientes realizado profesionalmente?',
          haveMoreQuestions: false,
          tip: 'La realización profesional va más allá del salario. Considera si tu trabajo alinea con tus valores.',
        },
        {
          text: '¿Sientes que tu profesión es lo que siempre habías querido hacer?',
          haveMoreQuestions: false,
          tip: 'No es tarde para redirigir tu carrera hacia lo que realmente te apasiona.',
        },
        {
          text: '¿Sabes lo que amas?',
          haveMoreQuestions: false,
          tip: 'Identifica qué actividades te hacen perder la noción del tiempo - ahí está tu pasión.',
        },
        {
          text: '¿Haces lo que te apasiona?',
          haveMoreQuestions: false,
          tip: 'Convertir tu pasión en profesión requiere planificación y valentía, pero el resultado vale la pena.',
        },
        {
          text: '¿Vas a trabajar supermotivado?',
          haveMoreQuestions: false,
          tip: 'La motivación fluctúa, pero si la falta es constante, podría ser señal de necesitar un cambio.',
        },
        {
          text: '¿Te levantas de la cama con ganas?',
          haveMoreQuestions: false,
          tip: 'Cómo empiezas tu día influye en tu productividad. Crea una rutina matutina que te inspire.',
        },
        {
          text: '¿Sientes que aportas valor?',
          haveMoreQuestions: false,
          tip: 'Reconocer tu contribución única aumenta la satisfacción laboral.',
        },
        {
          text: '¿Has encontrado tu propósito profesional?',
          haveMoreQuestions: false,
          tip: 'El propósito profesional evoluciona. Permítete explorar diferentes caminos.',
        },
        {
          text: '¿Has pensado en emprender tu propio proyecto?',
          haveMoreQuestions: false,
          tip: 'Emprender requiere preparación. Investiga y valida tu idea antes de lanzarte.',
        },
      ],
    },
    {
      name: 'HEALTH_NUTRITION',
      description: 'Salud y Nutrición',
      questions: [
        {
          text: '¿Te sientes bien físicamente?',
          haveMoreQuestions: false,
          tip: 'Escucha a tu cuerpo - es tu mejor guía para saber cómo estás realmente.',
        },
        {
          text: '¿Sueles estar sin enfermedad?',
          haveMoreQuestions: false,
          tip: 'La salud es un estado de equilibrio. Fortalece tu sistema inmunológico con hábitos consistentes.',
        },
        {
          text: '¿Llevas una vida sana?',
          haveMoreQuestions: false,
          tip: 'Pequeños cambios sostenibles son más efectivos que grandes esfuerzos temporales.',
        },
        {
          text: '¿Te alimentas de manera consciente?',
          haveMoreQuestions: false,
          tip: 'Come despacio, saborea cada bocado y escucha las señales de saciedad de tu cuerpo.',
        },
        {
          text: '¿Practicas algún tipo de deporte o haces ejercicio físico con frecuencia?',
          haveMoreQuestions: false,
          tip: 'Encuentra una actividad física que disfrutes - será más fácil mantenerla en el tiempo.',
        },
        {
          text: '¿Te mueves?',
          haveMoreQuestions: false,
          tip: 'El movimiento es vida. Incorpora actividad física en tu rutina diaria, aunque sea caminar.',
        },
        {
          text: '¿Tu estado de salud te permite vivir sin complicaciones?',
          haveMoreQuestions: false,
          tip: 'La salud óptima te permite enfocarte en lo que realmente importa en la vida.',
        },
        {
          text: '¿Te notas vital y lleno de energía?',
          haveMoreQuestions: false,
          tip: 'La energía viene de hábitos consistentes: sueño, nutrición, ejercicio y manejo del estrés.',
        },
        {
          text: '¿Te sientes cómodo con tu cuerpo?',
          haveMoreQuestions: false,
          tip: 'La comodidad con tu cuerpo viene de aceptación y cuidado, no de perfección.',
        },
        {
          text: '¿Te has cuestionado tus hábitos alguna vez?',
          haveMoreQuestions: false,
          tip: 'Cuestionar tus hábitos es el primer paso hacia cambios positivos y duraderos.',
        },
      ],
    },
    {
      name: 'MONEY_FINANCES',
      description: 'Dinero y Finanzas',
      questions: [
        {
          text: '¿Estás satisfecho con tu calidad de vida?',
          haveMoreQuestions: false,
          tip: 'La calidad de vida no es solo lo material - incluye tiempo, relaciones y bienestar emocional.',
        },
        {
          text: '¿Ganas todo lo que te gustaría y mereces?',
          haveMoreQuestions: false,
          tip: 'Tu valor profesional se refleja en tus ingresos. Si no estás satisfecho, crea un plan para aumentarlos.',
        },
        {
          text: '¿Ahorras algo o llegas con lo justo a final de mes?',
          haveMoreQuestions: false,
          tip: 'El ahorro comienza con el primer paso, por pequeño que sea. Automatízalo para que sea constante.',
        },
        {
          text: '¿Tienes suficiente dinero ahorrado para afrontar cualquier imprevisto?',
          haveMoreQuestions: false,
          tip: 'Un fondo de emergencia de 3-6 meses de gastos te da tranquilidad financiera.',
        },
        {
          text: '¿Cuentas con un colchón económico?',
          haveMoreQuestions: false,
          tip: 'Tu colchón económico es tu red de seguridad - prioriza construirlo.',
        },
        {
          text: '¿Te falta dinero para pagar tus facturas?',
          haveMoreQuestions: false,
          tip: 'Si el dinero no alcanza, revisa tus gastos y considera formas de aumentar tus ingresos.',
        },
        {
          text: '¿Puedes permitirte caprichos?',
          haveMoreQuestions: false,
          tip: 'Los caprichos planificados son saludables - evita solo las compras impulsivas.',
        },
        {
          text: '¿Acumulas demasiadas deudas?',
          haveMoreQuestions: false,
          tip: 'Las deudas controladas son herramientas; las descontroladas, cargas. Crea un plan de pago.',
        },
        {
          text: '¿Has conseguido cierta independencia económica o dependes de una única fuente de ingresos?',
          haveMoreQuestions: false,
          tip: 'Diversificar tus fuentes de ingreso te da estabilidad y libertad.',
        },
        {
          text: '¿Eres libre financieramente?',
          haveMoreQuestions: false,
          tip: 'La libertad financiera es un proceso. Define qué significa para ti y trabaja hacia ello.',
        },
      ],
    },
    {
      name: 'SOCIAL_RELATIONSHIPS',
      description: 'Relaciones Sociales',
      questions: [
        {
          text: '¿Tienes buena relación con tus familiares y amigos?',
          haveMoreQuestions: false,
          tip: 'Las relaciones requieren atención y cuidado constante, como un jardín.',
        },
        {
          text: '¿Sientes que todo fluye de la mejor manera posible?',
          haveMoreQuestions: false,
          tip: 'Cuando las relaciones fluyen, hay respeto mutuo y comunicación abierta.',
        },
        {
          text: '¿Has hablado todo lo que quieres hablar con ellos?',
          haveMoreQuestions: false,
          tip: 'Las conversaciones pendientes pesan. Encuentra el momento y la forma de expresar lo que sientes.',
        },
        {
          text: '¿Te sientes satisfecho con tu pertenencia a tu familia?',
          haveMoreQuestions: false,
          tip: 'La familia se elige y se construye, no solo se hereda.',
        },
        {
          text: '¿Tienes una familia "modelo" que te gustaría construir?',
          haveMoreQuestions: false,
          tip: 'Visualiza el tipo de relaciones familiares que deseas y trabaja hacia esa visión.',
        },
        {
          text: '¿Haces algo para mejorar a tu familia y la relación con tus amigos?',
          haveMoreQuestions: false,
          tip: 'Pequeños gestos de aprecio fortalecen los lazos con el tiempo.',
        },
        {
          text: '¿Tienes amigos de verdad?',
          haveMoreQuestions: false,
          tip: 'Los amigos verdaderos están en las buenas y en las malas, sin juicios.',
        },
        {
          text: '¿Los conoces bien?',
          haveMoreQuestions: false,
          tip: 'Conocer realmente a alguien requiere escuchar con atención y mostrar interés genuino.',
        },
        {
          text: '¿Tus familiares y amigos te apoyan?',
          haveMoreQuestions: false,
          tip: 'Rodéate de personas que celebren tus éxitos y te apoyen en tus desafíos.',
        },
        {
          text: '¿Te permites ser 100% tú cuando estás con ellos?',
          haveMoreQuestions: false,
          tip: 'La autenticidad atrae relaciones genuinas. Sé tú mismo sin miedo.',
        },
      ],
    },
    {
      name: 'COUPLE_INTIMACY',
      description: 'Pareja e Intimidad',
      questions: [
        {
          text: '¿Amas a tu pareja?',
          haveMoreQuestions: false,
          tip: 'El amor es elección diaria, no solo sentimiento. Se construye con acciones consistentes.',
        },
        {
          text: '¿Eres feliz con esa persona?',
          haveMoreQuestions: false,
          tip: 'Tu pareja debería sumar a tu felicidad, no ser la fuente única de ella.',
        },
        {
          text: '¿Crees que tienen una relación consciente?',
          haveMoreQuestions: false,
          tip: 'Las relaciones conscientes requieren comunicación honesta y crecimiento mutuo.',
        },
        {
          text: '¿Respeta tu libertad y viceversa?',
          haveMoreQuestions: false,
          tip: 'En el amor sano, dos personas completas eligen compartir sus vidas, no completarse.',
        },
        {
          text: '¿No tienes pareja y la buscas?',
          haveMoreQuestions: false,
          tip: 'Enfócate en ser la persona con quien querrías estar - la atracción seguirá naturalmente.',
        },
        {
          text: '¿Disfrutas 100% de tu soledad?',
          haveMoreQuestions: false,
          tip: 'Amar tu propia compañía es el mejor fundamento para cualquier relación.',
        },
        {
          text: '¿Tienes tiempo suficiente para conocer a otras personas?',
          haveMoreQuestions: false,
          tip: 'Abrir espacio en tu vida atrae nuevas conexiones significativas.',
        },
        {
          text: '¿Estás en un ambiente sano y consciente?',
          haveMoreQuestions: false,
          tip: 'Tu entorno influye en tu capacidad para conectar profundamente con otros.',
        },
        {
          text: '¿Se respetan sus espacios?',
          haveMoreQuestions: false,
          tip: 'El espacio personal fortalece la relación - permite el crecimiento individual y colectivo.',
        },
        {
          text: '¿Pueden tener conversaciones difíciles?',
          haveMoreQuestions: false,
          tip: 'Las conversaciones incómodas, hechas con respeto, fortalecen la confianza y intimidad.',
        },
        // NUEVAS PREGUNTAS PARA PERSONAS SOLTERAS
        {
          text: '¿Qué tipo de relación buscas actualmente?',
          haveMoreQuestions: true,
          tip: 'Definir qué buscas te ayuda a atraer relaciones alineadas con tus valores y metas personales.',
        },
        {
          text: '¿Cómo manejas la presión social de estar en pareja?',
          haveMoreQuestions: true,
          tip: 'Tu tiempo y decisiones son tuyos. No permitas que expectativas externas dicten tu ritmo de vida.',
        },
        {
          text: '¿Qué has aprendido de tus relaciones anteriores?',
          haveMoreQuestions: true,
          tip: 'Cada relación, aunque haya terminado, deja enseñanzas valiosas para tu crecimiento personal.',
        },
        {
          text: '¿Estás abierto/a a conocer personas de formas diferentes a las convencionales?',
          haveMoreQuestions: true,
          tip: 'Ampliar tus métodos para conocer personas puede llevarte a conexiones más auténticas y significativas.',
        },
        {
          text: '¿Cómo cultivas tu autoestima mientras estás soltero/a?',
          haveMoreQuestions: true,
          tip: 'Tu valor no depende de tu estado civil. Fortalecer tu autoestima atrae relaciones más saludables.',
        },
        {
          text: '¿Qué actividades disfrutas hacer solo/a que te hacen sentir pleno/a?',
          haveMoreQuestions: true,
          tip: 'Disfrutar tu propia compañía es una señal de madurez emocional y autosuficiencia.',
        },
        {
          text: '¿Cómo manejas los momentos de soledad?',
          haveMoreQuestions: true,
          tip: 'La soledad y la loneliness son diferentes. Aprender a disfrutar de tu propia compañía es un superpoder.',
        },
        {
          text: '¿Qué cualidades valoras más en una posible pareja?',
          haveMoreQuestions: true,
          tip: 'Conocer tus non-negotiables te ayuda a identificar relaciones potencialmente compatibles.',
        },
        {
          text: '¿Cómo equilibras tu deseo de pareja con tu independencia?',
          haveMoreQuestions: true,
          tip: 'Buscar pareja desde la plenitud, no desde la carencia, atrae relaciones más equilibradas.',
        },
        {
          text: '¿Qué aspectos de tu vida quieres fortalecer antes de comprometerte con una relación?',
          haveMoreQuestions: true,
          tip: 'Invertir en tu desarrollo personal durante la soltería crea bases sólidas para futuras relaciones.',
        },
      ],
    },
  ];

  for (const areaData of areasWithQuestions) {
    // Usamos upsert para crear el área y sus preguntas solo si no existen
    await prisma.area.upsert({
      where: { name: areaData.name },
      update: {},
      create: {
        name: areaData.name,
        description: areaData.description,
        questions: {
          create: areaData.questions,
        },
      },
    });
  }

  console.log('✅ Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
