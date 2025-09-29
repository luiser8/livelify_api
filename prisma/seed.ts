/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-misused-promises */

import { PrismaClient, PlanType } from '@prisma/client';

const prisma = new PrismaClient();

// Get current environment
const environment = process.env.APP_ENV || process.env.NODE_ENV || 'development';

async function main() {
  console.log(`🌱 Seeding database for environment: ${environment}...`);

  // ======================
  // Subscription Plans
  // ======================
  const subscriptionPlans = [
    {
      name: PlanType.BASICO,
      description: 'Plan básico con funcionalidades limitadas',
      price: 9.99,
      features: {
        projects: 3,
        actions: 50,
        analytics: false,
      },
    },
    {
      name: PlanType.INTERMEDIO,
      description: 'Plan intermedio con funciones avanzadas',
      price: 19.99,
      features: {
        projects: 10,
        actions: 500,
        analytics: true,
      },
    },
    {
      name: PlanType.AVANZADO,
      description: 'Plan avanzado con todas las funcionalidades',
      price: 49.99,
      features: {
        projects: 'ilimitados',
        actions: 'ilimitadas',
        analytics: true,
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
      questions: [
        { text: '¿Dedicas tiempo regularmente a aprender algo nuevo?' },
        { text: '¿Sientes que estás creciendo como persona?' },
        { text: '¿Tienes metas claras para tu desarrollo personal?' },
        { text: '¿Practicas la autocompasión y te perdonas por tus errores?' },
        { text: '¿Sales de tu zona de confort con regularidad?' },
        { text: '¿Lees libros o consumes contenido que te enriquece?' },
        { text: '¿Tienes un hobby o pasatiempo que te apasiona?' },
        { text: '¿Sientes que manejas bien el estrés en tu vida?' },
        { text: '¿Inviertes en tu educación o desarrollo de habilidades?' },
        { text: '¿Estás satisfecho con quién eres en este momento?' },
      ],
    },
    {
      name: 'PROFESSIONAL_ACTIVITY',
      questions: [
        { text: '¿Disfrutas de tu trabajo o actividad principal?' },
        { text: '¿Sientes que tu trabajo tiene un propósito o significado?' },
        { text: '¿Tienes oportunidades de crecimiento en tu carrera?' },
        { text: '¿Tu ambiente laboral es positivo y colaborativo?' },
        { text: '¿Recibes un reconocimiento justo por tu esfuerzo?' },
        { text: '¿El balance entre tu vida laboral y personal es adecuado?' },
        { text: '¿Estás desarrollando nuevas habilidades en tu trabajo?' },
        { text: '¿Sientes que tu compensación económica es justa?' },
        { text: '¿Tienes una buena relación con tus colegas y superiores?' },
        {
          text: '¿Te sientes motivado la mayor parte de los días para ir a trabajar?',
        },
      ],
    },
    {
      name: 'HEALTH_NUTRITION',
      questions: [
        {
          text: '¿Realizas actividad física de forma regular (al menos 3 veces por semana)?',
        },
        { text: '¿Tu dieta es mayormente balanceada y nutritiva?' },
        { text: '¿Duermes las horas suficientes para sentirte descansado?' },
        { text: '¿Bebes suficiente agua a lo largo del día?' },
        { text: '¿Te sientes con energía durante la mayor parte del día?' },
        {
          text: '¿Gestionas tu salud de manera proactiva (chequeos médicos, etc.)?',
        },
        {
          text: '¿Limitas el consumo de alimentos procesados, azúcar y alcohol?',
        },
        {
          text: '¿Tu peso corporal se encuentra en un rango saludable para ti?',
        },
        { text: '¿Prestas atención a tu salud mental y emocional?' },
        { text: '¿Te sientes bien con tu estado físico general?' },
      ],
    },
    {
      name: 'MONEY_FINANCES',
      questions: [
        { text: '¿Tienes un presupuesto mensual y te apegas a él?' },
        { text: '¿Estás satisfecho con tus ingresos actuales?' },
        { text: '¿Tienes un fondo de ahorros para emergencias?' },
        {
          text: '¿Estás ahorrando o invirtiendo para tu futuro (retiro, metas a largo plazo)?',
        },
        { text: '¿Sientes que tienes control sobre tus deudas?' },
        { text: '¿Tomas decisiones financieras de manera informada?' },
        {
          text: '¿Tus ingresos son mayores que tus gastos de forma consistente?',
        },
        { text: '¿Te sientes tranquilo respecto a tu situación financiera?' },
        {
          text: '¿Tienes metas financieras claras y un plan para alcanzarlas?',
        },
        { text: '¿Evitas las compras impulsivas o innecesarias?' },
      ],
    },
    {
      name: 'SOCIAL_RELATIONSHIPS',
      questions: [
        { text: '¿Pasas tiempo de calidad con tus amigos y familiares?' },
        {
          text: '¿Sientes que tienes un sistema de apoyo en el que puedes confiar?',
        },
        {
          text: '¿La comunicación con tus seres queridos es abierta y honesta?',
        },
        { text: '¿Participas en actividades sociales que disfrutas?' },
        {
          text: '¿Sientes que aportas valor a la vida de tus amigos y familiares?',
        },
        { text: '¿Estableces límites saludables en tus relaciones?' },
        { text: '¿Conoces gente nueva y expandes tu círculo social?' },
        {
          text: '¿Te sientes escuchado y valorado por las personas importantes para ti?',
        },
        {
          text: '¿Ofreces tu apoyo a tus amigos y familiares cuando lo necesitan?',
        },
        {
          text: '¿Estás satisfecho con la calidad de tus relaciones sociales?',
        },
      ],
    },
    {
      name: 'COUPLE_INTIMACY',
      questions: [
        { text: '¿Sientes una conexión emocional profunda con tu pareja?' },
        { text: '¿La comunicación en tu relación es efectiva y respetuosa?' },
        { text: '¿Comparten metas y valores importantes para el futuro?' },
        { text: '¿Disfrutan de pasar tiempo de calidad juntos?' },
        {
          text: '¿Se apoyan mutuamente en sus metas personales y profesionales?',
        },
        {
          text: '¿Sientes que la confianza es un pilar sólido en tu relación?',
        },
        {
          text: '¿Estás satisfecho con la intimidad física y emocional en tu relación?',
        },
        { text: '¿Resuelven los conflictos de manera constructiva?' },
        { text: '¿Sientes que puedes ser tú mismo/a en la relación?' },
        {
          text: '¿Tu relación contribuye positivamente a tu felicidad general?',
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
