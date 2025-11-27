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
      basePrice: 38.99,
      pricePerMonth: 38.99,
      savings: 0,
      discount: 0,
      billingCycle: 1,
      bestFor: 'Mensual',
      features: {
        projects: 2,
        actions: 100,
        analytics: 'ENABLED',
      },
    },
    {
      name: PlanType.QUARTERLY,
      description: 'Best value for 3 months',
      basePrice: 97,
      pricePerMonth: 32.33,
      savings: 19.97,
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
      basePrice: 175,
      pricePerMonth: 29.17,
      savings: 58.94,
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
      basePrice: 297,
      pricePerMonth: 24.75,
      savings: 170.88,
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
          tip: 'Evalúa si activamente dedicas dinero (en libros, cursos, terapia) o tiempo (en estudiar, meditar) a tu crecimiento interno y a ser una mejor versión de ti mismo/a.',
        },
        {
          text: '¿Lees, escuchas podcasts o has hecho algún curso sobre autoconocimiento?',
          haveMoreQuestions: false,
          tip: 'Piensa si consumes contenido que te ayude a entender por qué eres como eres, cómo funcionas y cómo mejorar tus patrones de pensamiento.',
        },
        {
          text: '¿Has realizado o haces actualmente algún tipo de terapia o coaching?',
          haveMoreQuestions: false,
          tip: 'Responde "Sí" si has buscado (o estás buscando) ayuda profesional para trabajar en tus metas, bloqueos, heridas o salud mental.',
        },
        {
          text: '¿Te dedicas tiempo de calidad a ti mismo/a?',
          haveMoreQuestions: false,
          tip: '¿Tienes momentos en tu agenda solo para ti? (Ej. un hobby, un baño relajante, un paseo en solitario). Tiempo donde no estás produciendo para otros, solo recargando tu energía.',
        },
        {
          text: '¿Sabes cómo gestionar tus emociones de forma saludable?',
          haveMoreQuestions: false,
          tip: 'Cuando sientes rabia, tristeza o miedo, ¿logras identificar la emoción y procesarla sin explotar contra otros o reprimirla por completo?',
        },
        {
          text: '¿Meditas o practicas algún tipo de ejercicio para conectar contigo mismo/a?',
          haveMoreQuestions: false,
          tip: 'Esto incluye meditación, mindfulness, yoga, escribir un diario o incluso pasear en silencio por la naturaleza. ¿Buscas activamente espacios de calma mental?',
        },
        {
          text: '¿Sientes que has sanado o trabajado tus heridas del pasado (traumas)?',
          haveMoreQuestions: false,
          tip: '¿Sientes que las experiencias difíciles de tu pasado ya no dictan tus reacciones automáticas en el presente? ¿Has trabajado en ellas para que no te limiten?',
        },
        {
          text: '¿Sientes que creces y evolucionas constantemente?',
          haveMoreQuestions: false,
          tip: '¿Si miras a la persona que eras hace un año, sientes que has aprendido lecciones importantes y has mejorado como ser humano?',
        },
        {
          text: '¿Estás satisfecho/a con tu evolución personal de los últimos años?',
          haveMoreQuestions: false,
          tip: 'Más allá de si has cambiado, ¿te gusta la dirección en la que lo estás haciendo? ¿Te enorgullece la persona en la que te estás convirtiendo?',
        },
        {
          text: '¿Sientes que te conoces bien a ti mismo/a?',
          haveMoreQuestions: false,
          tip: '¿Tienes claros cuáles son tus valores no negociables, tus fortalezas, tus debilidades y lo que realmente quieres en la vida?',
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
          tip: 'Más allá del estrés puntual, ¿disfrutas de tus tareas diarias y del ambiente laboral la mayor parte del tiempo?',
        },
        {
          text: '¿Te sientes realizado/a profesionalmente?',
          haveMoreQuestions: false,
          tip: '¿Sientes que tu trabajo te permite usar tus talentos y que estás logrando cosas que consideras valiosas e importantes?',
        },
        {
          text: '¿Sientes que tu profesión está alineada con lo que querías hacer?',
          haveMoreQuestions: false,
          tip: '¿Tu trabajo actual se parece a lo que soñabas o a lo que te propusiste cuando decidiste tu carrera, o sientes que estás en un lugar muy diferente?',
        },
        {
          text: '¿Sabes cuáles son tus pasiones profesionales?',
          haveMoreQuestions: false,
          tip: '¿Puedes identificar qué tipo de tareas o temas te entusiasman tanto que podrías hacerlos incluso si no fueran "trabajo"?',
        },
        {
          text: '¿Tu trabajo diario te permite hacer cosas que te apasionan?',
          haveMoreQuestions: false,
          tip: '¿Hay espacio en tu jornada laboral para aplicar esas pasiones, o sientes que la mayor parte del tiempo estás en "piloto automático"?',
        },
        {
          text: '¿Sueles ir a trabajar motivado/a?',
          haveMoreQuestions: false,
          tip: 'Piensa en la mayoría de los días de la semana (no solo los lunes). ¿Sientes energía para empezar o predomina la sensación de "tener que ir"?',
        },
        {
          text: '¿Te levantas por la mañana con ganas de empezar tu jornada laboral?',
          haveMoreQuestions: false,
          tip: '¿Sientes un sentido de propósito al despertar, o la primera sensación que tienes al pensar en el trabajo es de pereza o agobio?',
        },
        {
          text: '¿Sientes que aportas valor con tu trabajo?',
          haveMoreQuestions: false,
          tip: '¿Percibes que lo que haces marca una diferencia positiva, ya sea en tus clientes, en tu equipo o en los resultados de la empresa?',
        },
        {
          text: '¿Sientes que tu trabajo tiene un propósito claro?',
          haveMoreQuestions: false,
          tip: '¿Entiendes el "por qué" o el "para qué" de tu trabajo, más allá de simplemente recibir un sueldo a fin de mes?',
        },
        {
          text: '¿Tu trabajo está alineado con tus valores personales?',
          haveMoreQuestions: false,
          tip: '¿Sientes que la forma en que trabajas (y la empresa) respeta tus principios fundamentales (honestidad, creatividad, servicio, equilibrio, etc.)?',
        },
      ],
    },
    {
      name: 'HEALTH_NUTRITION',
      description: 'Salud y Nutrición',
      questions: [
        {
          text: '¿Te sientes bien físicamente la mayoría del tiempo?',
          haveMoreQuestions: false,
          tip: 'Evalúa tu estado general en el día a día. ¿Te sientes ágil, sin dolores constantes o malestares frecuentes?',
        },
        {
          text: '¿Sueles gozar de buena salud (te enfermas poco)?',
          haveMoreQuestions: false,
          tip: '¿Con qué frecuencia coges resfriados, virus o tienes problemas de salud que te obligan a parar tu rutina?',
        },
        {
          text: '¿Consideras que llevas un estilo de vida saludable?',
          haveMoreQuestions: false,
          tip: 'Piensa en el balance general de tu vida: tu alimentación, tu actividad física, tu descanso y tu manejo del estrés.',
        },
        {
          text: '¿Te alimentas de manera consciente y equilibrada?',
          haveMoreQuestions: false,
          tip: '¿Prestas atención a lo que eats? ¿Priorizas alimentos nutritivos (frutas, verduras, proteínas) sobre la comida ultraprocesada la mayor parte del tiempo?',
        },
        {
          text: '¿Practicas algún tipo de deporte o haces ejercicio físico con frecuencia?',
          haveMoreQuestions: false,
          tip: '¿Dedicas tiempo de forma regular (ej. 2-3 veces por semana) a mover tu cuerpo de forma intencionada (caminar rápido, gimnasio, correr, bailar)?',
        },
        {
          text: '¿Duermes bien y te sientes descansado/a habitualmente?',
          haveMoreQuestions: false,
          tip: '¿Duermes las horas suficientes (7-8) y te despiertas sintiendo que tu cuerpo y mente realmente han recargado baterías?',
        },
        {
          text: '¿Tu estado de salud te permite vivir sin limitaciones importantes?',
          haveMoreQuestions: false,
          tip: '¿Puedes hacer las actividades que te gustan (viajar, jugar, trabajar) sin que tu salud física sea un impedimento constante?',
        },
        {
          text: '¿Te notas vital y lleno/a de energía en tu día a día?',
          haveMoreQuestions: false,
          tip: '¿Tienes suficiente energía para cumplir con tus obligaciones y además disfrutar de tu tiempo libre, o sueles sentirte agotado/a?',
        },
        {
          text: '¿Te sientes cómodo/a y a gusto con tu cuerpo?',
          haveMoreQuestions: false,
          tip: 'Más allá de los cánones de belleza, ¿aceptas y agradeces a tu cuerpo por lo que te permite hacer? ¿Te sientes "en casa" en él?',
        },
        {
          text: '¿Trabajas activamente para mantener o mejorar tus hábitos de salud?',
          haveMoreQuestions: false,
          tip: '¿Tomas decisiones proactivas (como ir a chequeos médicos, elegir la opción sana en el menú, beber agua) para cuidar tu salud a largo plazo?',
        },
      ],
    },
    {
      name: 'MONEY_FINANCES',
      description: 'Dinero y Finanzas',
      questions: [
        {
          text: '¿Estás satisfecho/a con tu calidad de vida actual?',
          haveMoreQuestions: false,
          tip: '¿Sientes que tu dinero te permite vivir en un entorno (casa, barrio) y con unas comodidades (comida, ropa, servicios) que te hacen sentir bien?',
        },
        {
          text: '¿Sientes que tus ingresos son justos y adecuados a tu valor?',
          haveMoreQuestions: false,
          tip: '¿Consideras que lo que ganas (tu sueldo, tus honorarios) es un reflejo justo de tu experiencia, esfuerzo y el valor que aportas en tu trabajo?',
        },
        {
          text: '¿Ahorras dinero de forma regular (por ejemplo, cada mes)?',
          haveMoreQuestions: false,
          tip: '¿Tienes el hábito de guardar un porcentaje de tus ingresos (por pequeño que sea) de forma sistemática, o solo ahorras "lo que sobra" (si es que sobra)?',
        },
        {
          text: '¿Tienes suficientes ahorros para afrontar un imprevisto importante?',
          haveMoreQuestions: false,
          tip: 'Si hoy tuvieras un gasto fuerte e inesperado (ej. una avería grave del coche, un gasto médico), ¿podrías cubrirlo sin endeudarte?',
        },
        {
          text: '¿Cuentas con un colchón de seguridad económico?',
          haveMoreQuestions: false,
          tip: '¿Tienes ahorros que te permitirían vivir varios meses (ej. 3-6 meses) si hoy perdieras tu fuente principal de ingresos?',
        },
        {
          text: '¿Pagas tus facturas a tiempo y sin dificultad?',
          haveMoreQuestions: false,
          tip: '¿Llegas a fin de mes cubriendo todos tus gastos fijos (alquiler/hipoteca, luz, agua, comida) sin agobio y sin generar retrasos?',
        },
        {
          text: '¿Puedes permitirte "caprichos" o gastos para disfrutar de vez en cuando?',
          haveMoreQuestions: false,
          tip: '¿Tu presupuesto te permite destinar dinero a ocio, vacaciones, cenas o hobbies sin sentir culpa o desestabilizar tus finanzas del mes?',
        },
        {
          text: '¿Tienes tus deudas (si las tienes) bajo control?',
          haveMoreQuestions: false,
          tip: 'Si tienes deudas (hipoteca, crédito coche, tarjetas), ¿son manejables y están planificadas ("deuda buena"), o sientes que te ahogan y crecen cada mes ("deuda mala")?',
        },
        {
          text: '¿Generas ingresos de más de una fuente (activa o pasiva)?',
          haveMoreQuestions: false,
          tip: '¿Todo tu dinero proviene de un solo lugar (ej. un solo empleo) o has buscado/creado otras vías (inversiones, un pequeño negocio, freelancing)?',
        },
        {
          text: '¿Te consideras financieramente estable o libre?',
          haveMoreQuestions: false,
          tip: '¿Sientes que tienes el control de tu dinero y que tus decisiones financieras te acercan a tus metas, en lugar de vivir "al día" o esclavo del dinero?',
        },
      ],
    },
    {
      name: 'SOCIAL_RELATIONSHIPS',
      description: 'Relaciones Sociales',
      questions: [
        {
          text: '¿Tienes una buena relación con tus familiares y amigos cercanos?',
          haveMoreQuestions: false,
          tip: 'Evalúa si el trato general es de respeto y cariño, aunque existan discusiones ocasionales (lo cual es normal).',
        },
        {
          text: '¿Sientes que la comunicación con ellos fluye de manera positiva?',
          haveMoreQuestions: false,
          tip: '¿Puedes hablar con ellos de forma constructiva y sentirte escuchado/a, o las conversaciones suelen terminar en conflicto o malentendidos?',
        },
        {
          text: '¿Sientes que puedes hablar abiertamente de lo que te importa con ellos?',
          haveMoreQuestions: false,
          tip: '¿Puedes compartir tus éxitos sin que sientan envidia y tus fracasos sin sentirte juzgado/a?',
        },
        {
          text: '¿Te sientes satisfecho/a con el rol que ocupas en tu familia?',
          haveMoreQuestions: false,
          tip: '¿Te gusta el papel que desempeñas (ej. el que cuida, el que organiza, el independiente) o te sientes atrapado en una etiqueta que te pusieron hace años?',
        },
        {
          text: '¿Disfrutas genuinamente del tiempo que pasas con tu familia?',
          haveMoreQuestions: false,
          tip: 'Cuando estás con ellos, ¿te sientes a gusto y recargas energías, o sientes que es un compromiso que te drena o te genera tensión?',
        },
        {
          text: '¿Inviertes tiempo y energía en cuidar tus relaciones con amigos y familia?',
          haveMoreQuestions: false,
          tip: '¿Eres proactivo/a en llamar, organizar encuentros o simplemente preguntar "¿cómo estás?"? ¿O sueles esperar a que te busquen a ti?',
        },
        {
          text: '¿Sientes que tienes amigos de verdad en quienes puedes confiar?',
          haveMoreQuestions: false,
          tip: '¿Tienes al menos una o dos personas (que no sean tu pareja) a las que podrías llamar en mitad de la noche si tuvieras un problema grave?',
        },
        {
          text: '¿Sientes que conoces bien a tus seres queridos y ellos a ti?',
          haveMoreQuestions: false,
          tip: '¿Existe un interés mutuo y real por entenderse, conocer sus gustos, sus miedos y sus sueños actuales?',
        },
        {
          text: '¿Te sientes apoyado/a por tus familiares y amigos?',
          haveMoreQuestions: false,
          tip: 'Cuando tomas decisiones importantes para tu vida (ej. cambiar de trabajo, mudarte), ¿sientes que respetan tus elecciones y te animan?',
        },
        {
          text: '¿Te permites ser 100% tú mismo/a cuando estás con ellos?',
          haveMoreQuestions: false,
          tip: '¿Sientes que puedes mostrarse vulnerable y auténtico/a (con tus virtudes y defectos), o necesitas usar una "máscara" para ser aceptado/a?',
        },
      ],
    },
    {
      name: 'COUPLE_INTIMACY',
      description: 'Pareja e Intimidad',
      questions: [
        {
          text: '¿Te sientes feliz y satisfecho/a en tu relación de pareja?',
          haveMoreQuestions: false,
          tip: 'Evalúa tu sensación general de bienestar en el día a día. Más allá de los altibajos normales, ¿sientes que esta relación te suma alegría y paz?',
        },
        {
          text: '¿Sientes que existe una buena y honesta comunicación entre ustedes?',
          haveMoreQuestions: false,
          tip: '¿Pueden hablar de temas importantes (dinero, futuro, miedos) con apertura? ¿Sientes que puedes expresarte y que eres escuchado/a (y viceversa)?',
        },
        {
          text: '¿Te sientes apoyado/a por tu pareja en tus metas y proyectos personales?',
          haveMoreQuestions: false,
          tip: '¿Sientes que tu pareja te anima a crecer profesional y personalmente? ¿Celebra tus éxitos, o sientes que frena tus ambiciones o minimiza tus logros?',
        },
        {
          text: '¿Sientes que puedes ser 100% tú mismo/a en la relación?',
          haveMoreQuestions: false,
          tip: '¿Te sientes libre de mostrarte vulnerable, con tus defectos y virtudes, sin miedo a ser juzgado/a o rechazado/a? ¿O sientes que debes usar una "máscara"?',
        },
        {
          text: '¿Confías plenamente en tu pareja?',
          haveMoreQuestions: false,
          tip: 'Piensa si sientes tranquilidad respecto a su lealtad, su honestidad contigo y sus intenciones. ¿Sientes que busca tu bienestar?',
        },
        {
          text: '¿Resuelven sus desacuerdos de forma constructiva y respetuosa?',
          haveMoreQuestions: false,
          tip: 'Las discusiones son normales. La clave es: cuando discuten, ¿lo hacen para encontrar una solución (aunque no estén de acuerdo) o para "ganar" y herirse?',
        },
        {
          text: '¿Estás satisfecho/a con la conexión afectiva y física entre ustedes?',
          haveMoreQuestions: false,
          tip: 'Esto incluye la intimidad sexual (si aplica), pero también los gestos diarios de cariño: abrazos, besos, palabras de afirmación, tiempo de calidad. ¿Te sientes querido/a?',
        },
        {
          text: '¿Sientes que admiras y respetas a tu pareja?',
          haveMoreQuestions: false,
          tip: '¿Valoras sus cualidades como persona? ¿Te enorgullece? ¿Tratas sus opiniones y sentimientos con dignidad, incluso cuando difieren de los tuyos?',
        },
        {
          text: '¿Sientes que tu pareja te respeta y te valora a ti?',
          haveMoreQuestions: false,
          tip: '¿Tu pareja tiene en cuenta tus necesidades y opiniones al tomar decisiones? ¿Te trata con amabilidad y consideración en público y en privado?',
        },
        {
          text: '¿Sienten que son un "buen equipo" para afrontar la vida?',
          haveMoreQuestions: false,
          tip: '¿Sientes que reman en la misma dirección? ¿Se reparten las cargas y responsabilidades (del hogar, finanzas, etc.) de forma justa y colaborativa?',
        },
        // NUEVAS PREGUNTAS PARA PERSONAS SOLTERAS
        {
          text: '¿Sientes que tienes una buena relación contigo mismo/a?',
          haveMoreQuestions: true,
          tip: 'Evalúa si te tratas con amabilidad, respeto y compasión. ¿Eres tu propio/a amigo/a y aliado/a?',
        },
        {
          text: '¿Disfrutas de tu tiempo en soledad?',
          haveMoreQuestions: true,
          tip: '¿Te sientes cómodo/a y en paz cuando estás solo/a, o buscas constantemente compañía o distracciones para evitar estar contigo mismo/a?',
        },
        {
          text: '¿Sientes que has sanado heridas de relaciones pasadas?',
          haveMoreQuestions: true,
          tip: '¿Sientes que el "equipaje" de tus rupturas anteriores (rencor, miedo, desconfianza) ya no condiciona tu presente ni tu visión del amor?',
        },
        {
          text: '¿Sientes que has aprendido de tus relaciones anteriores?',
          haveMoreQuestions: true,
          tip: '¿Has identificado patrones o lecciones de lo que salió mal en el pasado, y sientes que no volverías a cometer los mismos errores?',
        },
        {
          text: '¿Sientes que eres una persona "completa" sin necesidad de una pareja?',
          haveMoreQuestions: true,
          tip: '¿Tu felicidad y tu sentido de valía dependen de ti mismo/a, o sientes un "vacío" que crees que solo una pareja puede llenar?',
        },
        {
          text: '¿Te sientes merecedor/a de una relación sana y feliz?',
          haveMoreQuestions: true,
          tip: 'En el fondo, ¿crees que mereces amor, respeto y felicidad, o sientes que "no tienes suerte en el amor" o que el amor no es para ti?',
        },
        {
          text: '¿Tienes claro qué tipo de relación te gustaría construir?',
          haveMoreQuestions: true,
          tip: '¿Has reflexionado sobre cómo sería tu relación ideal? ¿Qué valores (comunicación, lealtad, aventura, etc.) son importantes para ti?',
        },
        {
          text: '¿Tienes claros tus "límites" o "no negociables" en el amor?',
          haveMoreQuestions: true,
          tip: '¿Sabes qué comportamientos o actitudes (ej. falta de respeto, mentiras, celos) no estás dispuesto/a a tolerar en una futura relación?',
        },
        {
          text: '¿Estás abierto/a (si es lo que deseas) a conocer gente nueva?',
          haveMoreQuestions: true,
          tip: '¿Tienes una actitud receptiva hacia el amor? (Esto no significa estar buscando activamente, sino no estar "cerrado en banda" por miedo).',
        },
        {
          text: '¿Creas oportunidades para socializar y conectar con personas afines?',
          haveMoreQuestions: true,
          tip: '¿Participas en hobbies, actividades o círculos sociales donde puedes conocer gente (ya sea para amistad o algo más) que comparta tus intereses y valores?',
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
