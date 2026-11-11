// =========================================================
// Funciones de IA del sitio de Mauricio Miranda Avila
// 1) Calculadora de impacto de IA en atención a clientes (pymes)
// 2) Asistente virtual con preguntas frecuentes
//    Responde SOLO con información del CV de Mauricio.
//    Para agregar o editar respuestas, modifica la lista INTENTS.
// =========================================================

(function () {
  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function lang() { return root.getAttribute('data-lang') === 'en' ? 'en' : 'es'; }
  function $(id) { return document.getElementById(id); }

  // =======================================================
  // 1) CALCULADORA
  // =======================================================
  var WEEKS_PER_MONTH = 4.33;   // semanas promedio por mes
  var FULL_TIME_HOURS = 40;     // jornada semanal para el costo por hora

  var SCEN_NAMES = {
    '0.14': { es: 'Conservador (14%)', en: 'Conservative (14%)' },
    '0.30': { es: 'Moderado (30%)', en: 'Moderate (30%)' },
    '0.45': { es: 'Avanzado (45%)', en: 'Advanced (45%)' }
  };

  var form = $('calcForm');
  if (form) {
    var inPeople = $('cPeople'), inHours = $('cHours'), inCost = $('cCost');

    function money(n) {
      return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n);
    }
    function num(n, dec) {
      return new Intl.NumberFormat(lang() === 'en' ? 'en-US' : 'es-MX', {
        minimumFractionDigits: dec || 0, maximumFractionDigits: dec || 0
      }).format(n);
    }
    function paintFill(input) {
      var p = (input.value - input.min) / (input.max - input.min) * 100;
      input.style.setProperty('--fill', p + '%');
    }

    function updateCalc() {
      var people = +inPeople.value;
      var hours = +inHours.value;
      var cost = +inCost.value;
      var scenEl = form.querySelector('input[name="scen"]:checked');
      var gain = +scenEl.value;

      // Fórmulas
      var teamHoursMonth = people * hours * WEEKS_PER_MONTH;        // horas de atención al mes
      var freedHours = teamHoursMonth * gain;                        // horas liberadas
      var hourlyCost = cost / (FULL_TIME_HOURS * WEEKS_PER_MONTH);   // costo por hora por persona
      var valueMonth = freedHours * hourlyCost;                      // valor del tiempo liberado
      var fte = freedHours / (FULL_TIME_HOURS * WEEKS_PER_MONTH);    // personas de tiempo completo

      $('oPeople').textContent = num(people);
      $('oHours').textContent = num(hours) + ' h';
      $('oCost').textContent = money(cost);
      $('rHours').textContent = num(Math.round(freedHours));
      $('rFte').textContent = num(fte, 1);
      $('rMonth').textContent = money(valueMonth);
      $('rYear').textContent = money(valueMonth * 12);
      $('rBar').style.width = (gain * 100) + '%';
      [inPeople, inHours, inCost].forEach(paintFill);

      // Correo con los números ya escritos
      var L = lang();
      var subject = L === 'en' ? 'AI impact estimate from your website' : 'Estimación de impacto de IA desde tu sitio';
      var body = L === 'en'
        ? 'Hi Mauricio,\n\nI used the AI calculator on your website for my customer service team:\n' +
          '- People: ' + people + '\n- Hours per week each: ' + hours + '\n- Monthly cost per person: ' + money(cost) + ' MXN\n' +
          '- Scenario: ' + SCEN_NAMES[scenEl.value].en + '\n\nEstimate: about ' + num(Math.round(freedHours)) +
          ' hours per month (' + num(fte, 1) + ' full-time people), worth about ' + money(valueMonth) + ' MXN per month.\n\n' +
          "I'd like to talk about how to make it happen.\n"
        : 'Hola Mauricio:\n\nUsé la calculadora de IA de tu sitio para mi equipo de atención a clientes:\n' +
          '- Personas: ' + people + '\n- Horas a la semana por persona: ' + hours + '\n- Costo mensual por persona: ' + money(cost) + ' MXN\n' +
          '- Escenario: ' + SCEN_NAMES[scenEl.value].es + '\n\nEstimación: cerca de ' + num(Math.round(freedHours)) +
          ' horas al mes (' + num(fte, 1) + ' personas de tiempo completo), con un valor aproximado de ' + money(valueMonth) + ' MXN al mes.\n\n' +
          'Me gustaría platicar cómo lograrlo.\n';
      $('calcCta').href = 'mailto:mmiranda73@me.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    }

    form.addEventListener('input', updateCalc);
    form.addEventListener('change', updateCalc);
    updateCalc();
    new MutationObserver(updateCalc).observe(root, { attributes: true, attributeFilter: ['data-lang'] });
  }

  // =======================================================
  // 2) ASISTENTE VIRTUAL
  // =======================================================
  // Cada "intención" tiene: texto del botón (chip), palabras clave para
  // reconocer preguntas escritas, la respuesta en ES/EN y botones opcionales.
  // Palabras clave de 4+ letras funcionan como raíz: "tecnolog" reconoce
  // "tecnología", "tecnologías", etc.
  var CONTACT = [
    { href: 'mailto:mmiranda73@me.com', es: 'Escribirle', en: 'Email him' },
    { href: 'https://www.linkedin.com/in/mauricio-miranda-av', es: 'LinkedIn', en: 'LinkedIn', ext: true }
  ];

  var INTENTS = [
    {
      id: 'about',
      chip: { es: '¿Quién es Mauricio?', en: 'Who is Mauricio?' },
      keys: ['quien', 'perfil', 'resumen', 'who', 'about', 'profile', 'trayectoria', 'career', 'background'],
      weak: ['mauricio', 'experiencia', 'experience', 'sobre'],   // valen medio punto: palabras muy generales
      es: '<p><b>Mauricio Miranda Avila</b> es Director de Big Data en Totalplay desde febrero de 2026.</p><p>Tiene más de 27 años de experiencia en telecomunicaciones, desarrollo de software, plataformas críticas y transformación tecnológica. De 1997 a 2025 trabajó en Telcel, donde pasó de Jefe de Data Warehouse a Gerente de IT, Ventas y Renovaciones.</p>',
      en: '<p><b>Mauricio Miranda Avila</b> has been Director of Big Data at Totalplay since February 2026.</p><p>He has more than 27 years of experience in telecom, software development, mission-critical platforms and technology transformation. From 1997 to 2025 he worked at Telcel, growing from Data Warehouse Lead to IT Manager for Sales and Renewals.</p>'
    },
    {
      id: 'ai',
      chip: { es: '¿Qué experiencia tiene en IA?', en: 'What is his AI experience?' },
      keys: ['ia', 'ai', 'inteligencia', 'artificial', 'agente', 'agent', 'genai', 'gpt', 'chatbot', 'machine', 'automatiza', 'automat'],
      es: '<p>En Totalplay lideró el discovery y la definición de <b>Post Buy Addressable</b>: un portal de autoservicio construido sobre una fuente única de datos, con <b>agentes de inteligencia artificial</b> integrados. También definió su roadmap funcional y tecnológico; el Go Live está programado para diciembre de 2026.</p><p>Además impulsa iniciativas de Data as a Product, monetización de datos e IA para las áreas comerciales y operativas.</p>',
      en: '<p>At Totalplay he led the discovery and definition of <b>Post Buy Addressable</b>: a self-service portal built on a single source of data, with integrated <b>AI agents</b>. He also defined its functional and technology roadmap; go-live is scheduled for December 2026.</p><p>He also drives Data as a Product, data monetization and AI initiatives for commercial and operations teams.</p>',
      actions: [{ href: '#proyectos', es: 'Ver proyectos', en: 'See projects' }]
    },
    {
      id: 'wins',
      chip: { es: '¿Cuáles son sus principales logros?', en: 'What are his main achievements?' },
      keys: ['logro', 'resultado', 'impacto', 'metrica', 'achievement', 'result', 'impact', 'exito', 'success'],
      es: '<p>Algunos resultados de su trayectoria:</p><ul><li>Disponibilidad de la plataforma de ventas de <b>85% a 98%</b> con OpenShift y Dynatrace.</li><li><b>75% menos fallas</b> en producción y 20% menos tiempo de entrega.</li><li><b>30% menos incidentes</b> de clientes tras adoptar DevOps en seis meses.</li><li>Migración de mediación que procesa <b>10 mil millones de CDRs</b> al día.</li><li>TELARIX desplegado en <b>17 países</b> de América.</li></ul>',
      en: '<p>Some results from his career:</p><ul><li>Sales platform availability from <b>85% to 98%</b> with OpenShift and Dynatrace.</li><li><b>75% fewer production failures</b> and 20% faster delivery.</li><li><b>30% fewer customer incidents</b> after adopting DevOps in six months.</li><li>Mediation migration processing <b>10 billion CDRs</b> per day.</li><li>TELARIX rolled out across <b>17 countries</b> in the Americas.</li></ul>',
      actions: [{ href: '#impacto', es: 'Ver cifras', en: 'See figures' }]
    },
    {
      id: 'tech',
      chip: { es: '¿Con qué tecnologías trabaja?', en: 'Which technologies does he use?' },
      keys: ['tecnolog', 'stack', 'aws', 'gcp', 'google', 'cloud', 'nube', 'herramienta', 'bigquery', 'redshift', 'looker', 'openshift', 'devops', 'oracle', 'tool', 'plataforma', 'platform'],
      es: '<p><b>Cloud y datos:</b> AWS (S3, Redshift), Google Cloud (BigQuery, Looker, Cloud Run), Google Ad Manager y Oracle.</p><p><b>Operación:</b> Red Hat OpenShift, Dynatrace y JIRA, con prácticas de Data Engineering, Data Governance, DevOps, CI/CD y observabilidad.</p><p><b>Telecom:</b> INTEC, TELARIX, CALLIDUS e IPTV.</p>',
      en: '<p><b>Cloud and data:</b> AWS (S3, Redshift), Google Cloud (BigQuery, Looker, Cloud Run), Google Ad Manager and Oracle.</p><p><b>Operations:</b> Red Hat OpenShift, Dynatrace and JIRA, with Data Engineering, Data Governance, DevOps, CI/CD and observability practices.</p><p><b>Telecom:</b> INTEC, TELARIX, CALLIDUS and IPTV.</p>'
    },
    {
      id: 'lead',
      chip: { es: '¿Qué equipos y presupuestos ha dirigido?', en: 'What teams and budgets has he led?' },
      keys: ['equipo', 'team', 'presupuesto', 'budget', 'lider', 'leader', 'gestion', 'management', 'manage', 'persona', 'people', 'gerente', 'director'],
      es: '<p>Hoy dirige la organización de Big Data de Totalplay: <b>4 gerentes y un equipo de 12 personas</b>, con un presupuesto anual de <b>USD 1 millón</b> para AWS, GCP y consultoría especializada.</p><p>En Telcel administró un presupuesto de hasta <b>USD 7 millones</b> al año y desarrolló líderes dentro de su equipo con coaching y mentoría.</p>',
      en: '<p>He currently leads Totalplay\'s Big Data organization: <b>4 managers and a team of 12</b>, with a <b>USD 1 million</b> annual budget for AWS, GCP and specialized consulting.</p><p>At Telcel he managed a budget of up to <b>USD 7 million</b> per year and developed leaders within his team through coaching and mentoring.</p>'
    },
    {
      id: 'help',
      chip: { es: '¿Cómo puede ayudar a mi empresa?', en: 'How can he help my company?' },
      keys: ['ayud', 'empresa', 'negocio', 'consultor', 'servicio', 'contrat', 'pyme', 'proyecto', 'oportunidad', 'vacante', 'puesto', 'disponib', 'help', 'company', 'business', 'consult', 'service', 'hire', 'hiring', 'available', 'role', 'position', 'opportunit'],
      es: '<p>Mauricio está abierto a <b>posiciones de liderazgo</b> y a <b>proyectos de consultoría</b> en estrategia de datos, gobierno de datos, plataformas cloud y adopción de agentes de IA.</p><p>Si quieres dimensionar qué podría lograr la IA en tu equipo de atención a clientes, prueba la calculadora.</p>',
      en: '<p>Mauricio is open to <b>leadership roles</b> and <b>consulting projects</b> in data strategy, data governance, cloud platforms and AI agent adoption.</p><p>If you want to size what AI could do for your customer service team, try the calculator.</p>',
      actions: [{ href: '#calculadora', es: 'Abrir calculadora', en: 'Open calculator' }].concat(CONTACT.slice(0, 1))
    },
    {
      id: 'cdto',
      chip: { es: '¿Qué está estudiando ahora?', en: 'What is he studying now?' },
      keys: ['cdto', 'estudiando', 'cursa', 'curso', 'capacita', 'programa', 'transformacion', 'digital', 'power', 'ceo', 'tec', 'tecnologico', 'monterrey', 'roadmap', 'studying', 'course', 'training', 'transformation'],
      es: '<p>Actualmente cursa la <b>Certificación Chief Digital Transformation Officer (CDTO)</b> del Tecnológico de Monterrey: 160 horas y 13 módulos.</p><p>El programa cubre estrategia y visión (marcos de McKinsey, Capgemini y Gartner), tecnologías estratégicas como datos, IA generativa, nube, ciberseguridad y RPA, gestión del cambio y diseño centrado en la persona. Cierra con un proyecto integrador: un roadmap de transformación digital.</p>',
      en: '<p>He is currently completing the <b>Chief Digital Transformation Officer (CDTO) Certification</b> from Tecnológico de Monterrey: 160 hours and 13 modules.</p><p>The program covers strategy and vision (McKinsey, Capgemini and Gartner frameworks), strategic technologies such as data, generative AI, cloud, cybersecurity and RPA, change management and human-centered design. It ends with a capstone project: a digital transformation roadmap.</p>',
      actions: [{ href: '#power-ceo', es: 'Ver Power CEO', en: 'See Power CEO' }]
    },
    {
      id: 'edu',
      chip: { es: '¿Qué estudió?', en: 'What did he study?' },
      keys: ['estudi', 'formacion', 'educacion', 'universidad', 'carrera', 'titulo', 'licenciatura', 'certifica', 'upiicsa', 'education', 'degree', 'university', 'study', 'studied'],
      es: '<p><b>Licenciatura en Ciencias de la Informática</b> por la UPIICSA (1991–1995).</p><p><b>Certificación en Liderazgo y Relaciones Humanas</b>, Creando Conciencia, con reconocimiento de la SEP (2024).</p><p>En curso: <b>Certificación Chief Digital Transformation Officer</b>, Tecnológico de Monterrey.</p>',
      en: '<p><b>B.Sc. in Computer Science (Ciencias de la Informática)</b> from UPIICSA (1991–1995).</p><p><b>Certification in Leadership and Human Relations</b>, Creando Conciencia, SEP-recognized (2024).</p><p>In progress: <b>Chief Digital Transformation Officer Certification</b>, Tecnológico de Monterrey.</p>'
    },
    {
      id: 'lang',
      chip: { es: '¿Qué idiomas habla y dónde está?', en: 'Languages and location?' },
      keys: ['idioma', 'ingles', 'english', 'espanol', 'spanish', 'language', 'ubicacion', 'donde', 'ciudad', 'vive', 'location', 'where', 'mexico', 'city', 'based'],
      es: '<p>Radica en la <b>Ciudad de México</b>. Habla <b>español nativo</b> e <b>inglés C1</b> (competencia profesional).</p>',
      en: '<p>He is based in <b>Mexico City</b>. He speaks <b>native Spanish</b> and <b>C1 English</b> (professional proficiency).</p>'
    },
    {
      id: 'contact',
      chip: { es: '¿Cómo lo contacto?', en: 'How do I contact him?' },
      keys: ['contact', 'correo', 'email', 'mail', 'telefono', 'phone', 'linkedin', 'llamar', 'agendar', 'reunion', 'call', 'meeting', 'curriculum', 'cv', 'resume'],
      es: '<p><b>Correo:</b> <a href="mailto:mmiranda73@me.com">mmiranda73@me.com</a><br><b>Teléfono:</b> <a href="tel:+525510100727">+52 55 1010 0727</a><br><b>LinkedIn:</b> in/mauricio-miranda-av</p><p>También puedes descargar su CV.</p>',
      en: '<p><b>Email:</b> <a href="mailto:mmiranda73@me.com">mmiranda73@me.com</a><br><b>Phone:</b> <a href="tel:+525510100727">+52 55 1010 0727</a><br><b>LinkedIn:</b> in/mauricio-miranda-av</p><p>You can also download his CV.</p>',
      actions: CONTACT.concat([{ href: 'assets/cv/Mauricio-Miranda-Avila-CV.pdf', es: 'Descargar CV', en: 'Download CV', dl: true }])
    }
  ];

  // Temas que el asistente NO responde (no vienen en el CV)
  var BLOCKED = {
    keys: ['sueld', 'salari', 'salary', 'tarifa', 'precio', 'price', 'cobra', 'honorari', 'gana', 'ingreso', 'rate', 'rates', 'fee', 'fees', 'confidencial', 'confidential'],
    es: '<p>Ese tema no está en el CV de Mauricio, así que prefiero que lo platiques directamente con él.</p>',
    en: '<p>That topic is not in Mauricio\'s CV, so it\'s best to discuss it with him directly.</p>',
    actions: CONTACT
  };
  var GREETING = {
    keys: ['hola', 'buenas', 'buenos', 'hi', 'hello', 'hey'],
    es: '<p>¡Hola! Pregúntame sobre la experiencia de Mauricio, sus logros, su trabajo con IA o cómo puede ayudar a tu empresa.</p>',
    en: '<p>Hi! Ask me about Mauricio\'s experience, his achievements, his AI work or how he can help your company.</p>'
  };
  var THANKS = {
    keys: ['gracias', 'thanks', 'thank'],
    es: '<p>¡Con gusto! Si quieres seguir la conversación con Mauricio, escríbele directamente.</p>',
    en: '<p>You\'re welcome! If you want to continue the conversation with Mauricio, email him directly.</p>',
    actions: CONTACT
  };
  var FALLBACK = {
    es: '<p>No tengo información sobre eso: respondo solo con lo que está en el CV de Mauricio. Prueba con una de las preguntas de abajo o escríbele directamente.</p>',
    en: '<p>I don\'t have information on that: I only answer with what is in Mauricio\'s CV. Try one of the questions below or email him directly.</p>',
    actions: CONTACT
  };

  // ---------- Reconocer una pregunta escrita ----------
  function normalize(t) {
    return t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9ñ\s]/g, ' ');
  }
  function score(tokens, keys) {
    var s = 0;
    keys.forEach(function (k) {
      if (tokens.some(function (w) { return k.length >= 4 ? w.indexOf(k) === 0 : w === k; })) s++;
    });
    return s;
  }
  function match(text) {
    var tokens = normalize(text).split(/\s+/).filter(Boolean);
    if (score(tokens, BLOCKED.keys)) return BLOCKED;
    var best = null, bestScore = 0;
    INTENTS.forEach(function (it) {
      var s = score(tokens, it.keys) + (it.weak ? score(tokens, it.weak) * 0.5 : 0);
      if (s > bestScore) { best = it; bestScore = s; }
    });
    if (best) return best;
    if (score(tokens, THANKS.keys)) return THANKS;
    if (score(tokens, GREETING.keys)) return GREETING;
    return FALLBACK;
  }

  // ---------- Construir la interfaz ----------
  var ICON_CHAT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z"/><path d="M8.5 11h.01M12 11h.01M15.5 11h.01"/></svg>';
  var ICON_SEND = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  function both(es, en) { return '<span data-l="es">' + es + '</span><span data-l="en">' + en + '</span>'; }

  var launch = document.createElement('button');
  launch.type = 'button';
  launch.className = 'bot-launch';
  launch.setAttribute('aria-expanded', 'false');
  launch.setAttribute('aria-controls', 'bot');
  launch.innerHTML = ICON_CHAT + '<span class="bot-launch__text">' + both('Asistente IA', 'AI assistant') + '</span>';

  var teaser = document.createElement('div');
  teaser.className = 'bot-teaser';
  teaser.setAttribute('aria-hidden', 'true');
  teaser.innerHTML = both('¿Tienes preguntas sobre Mauricio? Pregúntame.', 'Questions about Mauricio? Ask me.');

  var panel = document.createElement('section');
  panel.className = 'bot';
  panel.id = 'bot';
  panel.hidden = true;
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Asistente virtual de Mauricio Miranda');
  panel.innerHTML =
    '<header class="bot__head">' +
      '<span class="bot__avatar" aria-hidden="true">MM</span>' +
      '<div class="bot__title"><b class="bot__name">' + both('Asistente de Mauricio', "Mauricio's assistant") + '</b><span class="bot__status">' + both('En línea', 'Online') + '</span></div>' +
      '<button type="button" class="bot__close" aria-label="Cerrar">×</button>' +
    '</header>' +
    '<div class="bot__log" role="log" aria-live="polite"></div>' +
    '<div class="bot__chips" aria-label="Preguntas sugeridas"></div>' +
    '<form class="bot__form" autocomplete="off">' +
      '<input type="text" maxlength="200" aria-label="Escribe tu pregunta">' +
      '<button type="submit" aria-label="Enviar">' + ICON_SEND + '</button>' +
    '</form>' +
    '<p class="bot__foot">' + both('Respuestas basadas en el CV de Mauricio', "Answers based on Mauricio's CV") + '</p>';

  document.body.appendChild(teaser);
  document.body.appendChild(launch);
  document.body.appendChild(panel);

  var log = panel.querySelector('.bot__log');
  var chips = panel.querySelector('.bot__chips');
  var input = panel.querySelector('input');
  var busy = false, greeted = false;

  function setPlaceholder() {
    input.placeholder = lang() === 'en' ? 'Type your question…' : 'Escribe tu pregunta…';
  }
  setPlaceholder();
  new MutationObserver(setPlaceholder).observe(root, { attributes: true, attributeFilter: ['data-lang'] });

  INTENTS.forEach(function (it) {
    var b = document.createElement('button');
    b.type = 'button';
    b.innerHTML = both(it.chip.es, it.chip.en);
    b.addEventListener('click', function () { ask(it.chip[lang()], it); });
    chips.appendChild(b);
  });

  function scrollDown() { log.scrollTop = log.scrollHeight; }

  function addUser(text) {
    var m = document.createElement('div');
    m.className = 'msg msg--user';
    m.textContent = text;            // textContent: lo que escribe el visitante nunca se ejecuta como HTML
    log.appendChild(m);
    scrollDown();
  }

  function addBot(r) {
    var m = document.createElement('div');
    m.className = 'msg msg--bot';
    var html = '<div data-l="es">' + r.es + '</div><div data-l="en">' + r.en + '</div>';
    if (r.actions) {
      html += '<div class="msg__actions">' + r.actions.map(function (a) {
        return '<a href="' + a.href + '"' + (a.ext ? ' target="_blank" rel="noopener"' : '') + (a.dl ? ' download' : '') + '>' + both(a.es, a.en) + '</a>';
      }).join('') + '</div>';
    }
    m.innerHTML = html;
    log.appendChild(m);
    scrollDown();
  }

  function reply(r) {
    if (reduceMotion) { addBot(r); busy = false; return; }
    var t = document.createElement('div');
    t.className = 'msg msg--bot msg--typing';
    t.setAttribute('aria-label', 'Escribiendo');
    t.innerHTML = '<i></i><i></i><i></i>';
    log.appendChild(t);
    scrollDown();
    var delay = 450 + Math.min(r.es.length / 3, 650);
    setTimeout(function () { t.remove(); addBot(r); busy = false; }, delay);
  }

  function ask(text, intent) {
    if (busy || !text.trim()) return;
    busy = true;
    addUser(text.trim());
    reply(intent || match(text));
  }

  panel.querySelector('form').addEventListener('submit', function (e) {
    e.preventDefault();
    var v = input.value;
    input.value = '';
    ask(v);
  });

  // Los enlaces internos (#calculadora, #proyectos) cierran el panel en celular
  log.addEventListener('click', function (e) {
    var a = e.target.closest('a');
    if (a && a.getAttribute('href').charAt(0) === '#' && window.innerWidth <= 640) close();
  });

  function open() {
    panel.hidden = false;
    launch.setAttribute('aria-expanded', 'true');
    teaser.classList.remove('is-on');
    if (!greeted) {
      greeted = true;
      addBot({
        es: '<p>Hola, soy el asistente virtual de Mauricio. Puedo contarte sobre su experiencia, sus logros, su trabajo con IA y cómo puede ayudar a tu empresa.</p><p>Elige una pregunta o escríbela.</p>',
        en: '<p>Hi, I\'m Mauricio\'s virtual assistant. I can tell you about his experience, achievements, AI work and how he can help your company.</p><p>Pick a question or type your own.</p>'
      });
    }
    setTimeout(function () { input.focus(); }, 50);
    try { sessionStorage.setItem('mm-bot-seen', '1'); } catch (e) { /* sin acceso */ }
  }
  function close() {
    panel.hidden = true;
    launch.setAttribute('aria-expanded', 'false');
    launch.focus();
  }

  launch.addEventListener('click', open);
  panel.querySelector('.bot__close').addEventListener('click', close);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) close(); });

  // Mensaje de invitación: una sola vez por visita, a los 8 segundos
  var seen = false;
  try { seen = sessionStorage.getItem('mm-bot-seen') === '1'; } catch (e) { /* sin acceso */ }
  if (!seen) {
    setTimeout(function () {
      if (panel.hidden) teaser.classList.add('is-on');
      setTimeout(function () { teaser.classList.remove('is-on'); }, 9000);
    }, 8000);
  }
})();
