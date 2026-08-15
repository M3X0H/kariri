/* =============================================================
   Mohammed Ismail Kariri — portfolio behaviour
   Theme · Language · Navigation · Reveal · Hero field · Pointer
   No dependencies. Deferred, so the DOM is already parsed.
   ============================================================= */
(function () {
  'use strict';

  var root = document.documentElement;

  // Signals the inline head script that scripting is alive, so it keeps
  // the entrance/reveal styles armed instead of dropping them.
  root.setAttribute('data-booted', '');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var finePointer = window.matchMedia('(pointer: fine)');
  var compact = window.matchMedia('(max-width: 860px)');
  var smallScreen = window.matchMedia('(max-width: 900px)');

  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } }
  };

  /* -----------------------------------------------------------
     Translations
     ----------------------------------------------------------- */
  var translations = {
    ar: {
      metaTitle: 'محمد إسماعيل كريري — أخصائي تقنية معلومات',
      metaDesc: 'محمد إسماعيل كريري — أخصائي تقنية معلومات وأخصائي علوم حاسب معتمد من الهيئة السعودية للمهندسين. دعم فني، صيانة أجهزة، شبكات، وأنظمة مراقبة CCTV في الرياض.',

      skip: 'تخطّي إلى المحتوى',
      brand: 'محمد كريري',
      nav_menu: 'القائمة',
      nav_about: 'نبذة',
      nav_skills: 'المهارات',
      nav_projects: 'المشاريع',
      nav_exp: 'الخبرة',
      nav_certs: 'الشهادات',
      nav_contact: 'تواصل',
      lang_switch: 'التبديل إلى الإنجليزية',
      theme_switch: 'تبديل المظهر',
      to_top: 'العودة إلى الأعلى',

      status_open: 'متاح لفرص عمل',
      hero_name: 'محمد إسماعيل كريري',
      hero_role_1: 'أخصائي تقنية معلومات',
      hero_role_2: 'أخصائي علوم حاسب',
      hero_lead: 'خريج علوم حاسب من جامعة تبوك، ومعتمد رسميًا من الهيئة السعودية للمهندسين. أبقي أنظمة العمل تعمل بلا توقف: دعم فني للموظفين، صيانة أجهزة وطابعات، شبكات، وأنظمة مراقبة.',
      cta_talk: 'لنتحدث',
      btn_cv: 'تحميل السيرة الذاتية',
      btn_viewcv: 'السيرة الذاتية',
      btn_email: 'البريد الإلكتروني',

      stat_companies: 'شركات مدعومة',
      stat_certs: 'دورة وشهادة',
      stat_degree: 'بكالوريوس علوم حاسب',

      about_title: 'من أنا',
      about_p1: 'بدأت من علوم الحاسب، وانتهيت في الميدان. اليوم أعمل حيث تلتقي الأنظمة بالناس: موظف لا يستطيع الطباعة، شبكة تتقطع، كاميرا توقفت عن التسجيل.',
      about_p2: 'خلال عملي كنت نقطة الاعتماد الأساسية للدعم الفني اليومي لأربع شركات تحت إدارة واحدة، حضوريًا في المقر وعن بُعد لموظفين داخل الرياض وخارجها. أحب المشاكل التي تتكرر، لأنها الوحيدة التي يمكن إصلاحها نهائيًا.',
      trait1: 'حل المشكلات',
      trait2: 'التفكير الإبداعي',
      trait3: 'التواصل الفعّال',
      trait4: 'إدارة الوقت',
      trait5: 'سرعة التعلّم',
      trait6: 'القيادة',
      trait7: 'الابتكار',
      trait8: 'التصميم الجرافيكي',
      fact1_l: 'التعليم',
      fact1_v: 'بكالوريوس علوم حاسب — جامعة تبوك',
      fact2_l: 'الاعتماد',
      fact2_v: 'الهيئة السعودية للمهندسين — 2025',
      fact3_l: 'الموقع',
      fact3_v: 'الرياض، السعودية',
      fact4_l: 'اللغات',
      fact4_v: 'العربية · الإنجليزية',

      skills_title: 'المهارات التقنية',
      skills_note: 'خمسة مجالات أعمل فيها يوميًا',
      skill1_d: 'الدعم اليومي للموظفين وحل الأعطال قبل أن تعطّل العمل.',
      skill2_d: 'تشخيص انقطاع الإنترنت والشبكات المحلية وإعادتها للعمل.',
      skill3_d: 'تشغيل أنظمة المراقبة ومتابعة استقرارها على مدار العمل.',
      skill4_d: 'أساس أكاديمي في البرمجة وقواعد البيانات وبناء الويب.',
      skill5_d: 'الأدوات التي أستخدمها في التطوير والدعم عن بُعد.',

      projects_title: 'مشاريع مختارة',
      proj1_t: 'بورتفوليو شخصي ثنائي اللغة',
      proj1_d: 'موقع ثابت بدون أي إطار عمل أو اعتماديات خارجية. يدعم العربية والإنجليزية مع تبديل كامل لاتجاه الصفحة، ووضعًا داكنًا وفاتحًا، وأيقونات SVG مضمّنة بدل مكتبة خارجية. مبني ليكون سريعًا ومتاحًا للاستخدام بلوحة المفاتيح.',
      proj_live: 'معاينة مباشرة',
      proj_code: 'الكود المصدري',
      soon_t: 'مساحة لمشاريع قادمة',
      soon_d: 'أعمل حاليًا على إضافة مشاريع جديدة هنا. للاطلاع على ما أنشره أولًا بأول، تابع حسابي على GitHub.',

      exp_title: 'المسار المهني',
      job1_title: 'أخصائي تقنية معلومات',
      job1_org: 'شركة بشائر البناء للمقاولات — الرياض',
      job1_b1: 'نقطة الاتصال الأساسية لمشاكل الموظفين التقنية لضمان استمرارية العمل.',
      job1_b2: 'صيانة دورية وطارئة للحواسيب والطابعات والملحقات.',
      job1_b3: 'إدارة ومراقبة أنظمة CCTV لضمان أمن المواقع.',
      job1_b4: 'دعم شامل للأنظمة واتصالات الشبكة.',
      more_impact: 'الأثر والمسؤوليات',
      impact_p: 'عملت كأخصائي تقنية معلومات داخل مقر الشركة، وكنت نقطة الاعتماد الأساسية للدعم الفني اليومي لأربع شركات تابعة لمالك واحد. قدّمت دعمًا حضوريًا داخل الشركة، إضافةً إلى دعم عن بُعد لموظفين داخل وخارج الرياض باستخدام AnyDesk. شمل عملي معالجة مشاكل الإنترنت والشبكات والأجهزة والطابعات والأنظمة بسرعة استجابة عالية وتعاون مباشر مع الموظفين. كما ساهمت في تقديم اقتراحات تطويرية للإدارة وحل مشاكل سابقة ومتكررة داخل قسم تقنية المعلومات، مما ساعد على تحسين آلية العمل ورفع استقرار الأنظمة.',
      impact_b1: 'دعم حضوري + دعم عن بُعد داخل الرياض وخارجها (AnyDesk).',
      impact_b2: 'خدمة أربع شركات تحت إدارة واحدة.',
      impact_b3: 'حل مشاكل الشبكات والإنترنت والأجهزة والطابعات والأنظمة.',
      impact_b4: 'سرعة استجابة عالية وتعاون فعّال مع الموظفين.',
      impact_b5: 'اقتراحات تطويرية وتحسين إجراءات قسم تقنية المعلومات.',
      job_fulltime: 'دوام كامل',
      job_intern: 'تدريب',
      edu_kind: 'تعليم',
      edu_degree: 'بكالوريوس علوم الحاسب',
      edu_school: 'جامعة تبوك',
      edu_b1: 'معترف بها رسميًا من الهيئة السعودية للمهندسين كأخصائي علوم حاسب.',
      edu_b2: 'التركيز: هندسة البرمجيات، قواعد البيانات العلائقية (RDBMS)، ومفاهيم الشبكات والدعم الفني.',
      job2_title: 'متدرّب — تقنية المعلومات',
      job2_org: 'تجمع تبوك الصحي',
      job2_b1: 'المساعدة في إصلاح الأعطال واستكشاف مشاكل أجهزة الحاسب والجوالات.',
      job2_b2: 'تحديد أخطاء الأنظمة ومعالجتها لدعم البنية الرقمية للمنشأة.',
      job2_b3: 'التعاون مع فريق تقنية المعلومات لتنفيذ حلول تحسّن جودة الخدمة.',

      high_title: 'ما أتقنه في الميدان',
      h1_t: 'الدعم الفني',
      h1_d: 'حل مشاكل البرامج والأجهزة، وإعداد أجهزة المستخدمين وربط الطابعات والملحقات.',
      h2_t: 'الصيانة',
      h2_d: 'صيانة دورية وطارئة للحواسيب والطابعات، وتشخيص الأعطال وتبديل القطع عند الحاجة.',
      h3_t: 'المراقبة والأنظمة',
      h3_d: 'متابعة كاميرات المراقبة والتأكد من عملها، وضمان استقرار الأنظمة والاتصالات الأساسية.',

      certs_title: 'الشهادات والدورات',
      cert1_org: 'الهيئة السعودية للمهندسين — 2025',
      cert2_org: 'برمجة كائنية التوجه — مستوى متوسط',
      cert3_org: 'قواعد البيانات العلائقية',
      cert4_org: 'تطوير تطبيقات أندرويد',
      cert5_org: 'بناء برامج عالية الجودة',
      cert6_org: 'تطوير الويب',
      certs_more: 'دورات إضافية',

      cta_title: 'لديك فرصة أو مشروع؟ لنتحدث.',
      cta_text: 'متاح لفرص عمل في الدعم الفني وتقنية المعلومات. أسرع طريقة للوصول إليّ هي واتساب، وأرد عادةً في نفس اليوم.',
      footer_name: 'محمد إسماعيل كريري',
      footer_rights: 'جميع الحقوق محفوظة'
    },

    en: {
      metaTitle: 'Mohammed Ismail Kariri — IT Specialist',
      metaDesc: 'Mohammed Ismail Kariri — IT Specialist and Computer Science Specialist recognized by the Saudi Council of Engineers. IT support, hardware maintenance, networking, and CCTV systems in Riyadh.',

      skip: 'Skip to content',
      brand: 'Mohammed Kariri',
      nav_menu: 'Menu',
      nav_about: 'About',
      nav_skills: 'Skills',
      nav_projects: 'Projects',
      nav_exp: 'Experience',
      nav_certs: 'Certifications',
      nav_contact: 'Contact',
      lang_switch: 'Switch to Arabic',
      theme_switch: 'Switch theme',
      to_top: 'Back to top',

      status_open: 'Open to opportunities',
      hero_name: 'Mohammed Ismail Kariri',
      hero_role_1: 'IT Specialist',
      hero_role_2: 'Computer Science Specialist',
      hero_lead: 'Computer Science graduate from the University of Tabuk, officially recognized by the Saudi Council of Engineers. I keep the systems people work on running: employee support, hardware and printer maintenance, networking, and CCTV.',
      cta_talk: "Let's talk",
      btn_cv: 'Download CV',
      btn_viewcv: 'View CV',
      btn_email: 'Email',

      stat_companies: 'Companies supported',
      stat_certs: 'Certifications',
      stat_degree: 'B.Sc. Computer Science',

      about_title: 'About me',
      about_p1: 'I started in computer science and ended up in the field. I work where systems meet people: someone who cannot print, a connection that keeps dropping, a camera that stopped recording.',
      about_p2: 'I was the day-to-day point of contact for IT support across four companies under one ownership — on-site at the office and remotely for employees inside and outside Riyadh. I like recurring problems, because those are the only ones you can fix for good.',
      trait1: 'Problem solving',
      trait2: 'Creative thinking',
      trait3: 'Effective communication',
      trait4: 'Time management',
      trait5: 'Fast learning',
      trait6: 'Leadership',
      trait7: 'Innovation',
      trait8: 'Graphic design',
      fact1_l: 'Education',
      fact1_v: 'B.Sc. Computer Science — University of Tabuk',
      fact2_l: 'Accreditation',
      fact2_v: 'Saudi Council of Engineers — 2025',
      fact3_l: 'Location',
      fact3_v: 'Riyadh, Saudi Arabia',
      fact4_l: 'Languages',
      fact4_v: 'Arabic · English',

      skills_title: 'Technical skills',
      skills_note: 'Five areas I work in every day',
      skill1_d: 'Day-to-day employee support, resolving faults before they stop the work.',
      skill2_d: 'Diagnosing dropped internet and local network issues and restoring service.',
      skill3_d: 'Running surveillance systems and keeping them stable throughout the day.',
      skill4_d: 'Academic grounding in programming, databases, and building for the web.',
      skill5_d: 'The tools I use for development and remote support.',

      projects_title: 'Selected work',
      proj1_t: 'Bilingual personal portfolio',
      proj1_d: 'A static site with no framework and no external dependencies. It supports Arabic and English with a full page-direction switch, dark and light themes, and an inline SVG sprite instead of an icon library. Built to be fast and fully keyboard accessible.',
      proj_live: 'Live preview',
      proj_code: 'Source code',
      soon_t: 'Room for what comes next',
      soon_d: 'I am adding new projects here as I build them. To see what I publish first, follow my GitHub.',

      exp_title: 'Career path',
      job1_title: 'IT Specialist',
      job1_org: 'Bashaer Al-Benaa Contracting Company — Riyadh',
      job1_b1: 'Primary point of contact for employee technical issues, keeping work uninterrupted.',
      job1_b2: 'Routine and emergency maintenance for computers, printers, and peripherals.',
      job1_b3: 'Managed and monitored CCTV systems to keep sites secure.',
      job1_b4: 'End-to-end support for systems and network connectivity.',
      more_impact: 'Impact & responsibilities',
      impact_p: 'Worked on-site as an IT Specialist and became the primary point of contact for daily IT support across four companies under one ownership. Provided in-office support at the workplace, in addition to remote support for employees inside and outside Riyadh using AnyDesk. Handled internet connectivity, networking, hardware, printer, and system-related issues with fast response and strong collaboration. Also contributed by proposing improvement suggestions to management and resolving recurring IT department issues to improve workflows and system stability.',
      impact_b1: 'On-site support plus remote support inside and outside Riyadh (AnyDesk).',
      impact_b2: 'Supported four companies under one owner.',
      impact_b3: 'Troubleshot networking, internet, hardware, printer, and system issues.',
      impact_b4: 'Fast response and effective collaboration with employees.',
      impact_b5: 'Proposed improvements and refined IT department procedures.',
      job_fulltime: 'Full-time',
      job_intern: 'Internship',
      edu_kind: 'Education',
      edu_degree: 'B.Sc. in Computer Science',
      edu_school: 'University of Tabuk',
      edu_b1: 'Officially recognized by the Saudi Council of Engineers as a Computer Science Specialist.',
      edu_b2: 'Focus: software engineering, relational databases (RDBMS), networking fundamentals, and IT support.',
      job2_title: 'Trainee — Information Technology',
      job2_org: 'Tabuk Health Cluster',
      job2_b1: 'Assisted in troubleshooting and repairing computer hardware and mobile devices.',
      job2_b2: 'Identified and resolved system errors to support digital infrastructure.',
      job2_b3: 'Worked with the IT team to implement solutions that improved service delivery.',

      high_title: 'What I do in the field',
      h1_t: 'Technical support',
      h1_d: 'Resolving software and hardware issues, setting up user devices, and configuring printers and peripherals.',
      h2_t: 'Maintenance',
      h2_d: 'Routine and emergency maintenance for PCs and printers, diagnosing faults and replacing parts when needed.',
      h3_t: 'Monitoring & systems',
      h3_d: 'Keeping CCTV cameras running and verified, and holding core systems and connectivity stable.',

      certs_title: 'Certifications & training',
      cert1_org: 'Saudi Council of Engineers — 2025',
      cert2_org: 'Object-oriented programming — intermediate',
      cert3_org: 'Relational databases',
      cert4_org: 'Android application development',
      cert5_org: 'Building high-quality programs',
      cert6_org: 'Web development',
      certs_more: 'Additional training',

      cta_title: 'Got an opportunity or a project? Let’s talk.',
      cta_text: 'Open to IT support and IT specialist roles. WhatsApp is the fastest way to reach me, and I usually reply the same day.',
      footer_name: 'Mohammed Ismail Kariri',
      footer_rights: 'All rights reserved'
    }
  };

  /* -----------------------------------------------------------
     Theme
     ----------------------------------------------------------- */
  var themeBtn = document.getElementById('themeBtn');
  var themeIcon = document.querySelector('#themeIcon use');
  var themeColor = document.querySelector('meta[name="theme-color"]');

  function activeTheme() {
    var pinned = root.getAttribute('data-theme');
    // Dark is the site's identity and the default everywhere; light is a
    // deliberate choice the visitor makes, and it is then remembered.
    return pinned === 'light' ? 'light' : 'dark';
  }

  function paintThemeButton() {
    var dark = activeTheme() === 'dark';
    // The icon shows the theme the button would switch you to.
    themeIcon.setAttribute('href', dark ? '#i-sun' : '#i-moon');
    themeBtn.setAttribute('aria-pressed', String(dark));
    // Keep the browser chrome in step with the page.
    if (themeColor) themeColor.setAttribute('content', dark ? '#060910' : '#f6f8fc');
  }

  themeBtn.addEventListener('click', function () {
    var next = activeTheme() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    store.set('theme', next);
    paintThemeButton();
    if (field) field.recolor();
  });

  paintThemeButton();

  /* -----------------------------------------------------------
     Language
     ----------------------------------------------------------- */
  var langBtn = document.getElementById('langBtn');
  var langLabel = document.getElementById('langLabel');
  var metaDesc = document.querySelector('meta[name="description"]');
  var currentLang = 'ar';

  function applyLanguage(lang) {
    var dict = translations[lang];
    if (!dict) return;

    currentLang = lang;
    root.setAttribute('lang', lang);
    root.setAttribute('dir', lang === 'en' ? 'ltr' : 'rtl');
    langLabel.textContent = lang === 'en' ? 'ع' : 'EN';

    document.title = dict.metaTitle;
    if (metaDesc) metaDesc.setAttribute('content', dict.metaDesc);

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var v = dict[el.getAttribute('data-i18n')];
      if (v !== undefined) el.textContent = v;
    });

    document.querySelectorAll('[data-i18n-label]').forEach(function (el) {
      var v = dict[el.getAttribute('data-i18n-label')];
      if (v !== undefined) el.setAttribute('aria-label', v);
    });

    store.set('lang', lang);
    movePill();
  }

  langBtn.addEventListener('click', function () {
    applyLanguage(currentLang === 'ar' ? 'en' : 'ar');
  });

  /* -----------------------------------------------------------
     Navigation
     ----------------------------------------------------------- */
  var navShell = document.getElementById('navShell');
  var nav = document.getElementById('nav');
  var navToggle = document.getElementById('navToggle');
  var navToggleIcon = document.querySelector('#navToggleIcon use');
  var navPill = document.getElementById('navPill');
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav__link'));
  var wasCompact = compact.matches;

  function setMenu(open) {
    nav.hidden = !open;
    navToggle.setAttribute('aria-expanded', String(open));
    navToggleIcon.setAttribute('href', open ? '#i-close' : '#i-menu');
  }

  function syncMenuToViewport() {
    var isCompact = compact.matches;

    if (!isCompact) {
      nav.hidden = false;
      navToggle.setAttribute('aria-expanded', 'false');
      navToggleIcon.setAttribute('href', '#i-menu');
      movePill();
    } else if (!wasCompact) {
      // Collapse only when crossing into compact, so the mobile address
      // bar resizing the viewport does not dismiss an open menu.
      setMenu(false);
    }

    wasCompact = isCompact;
  }

  // Slides the active indicator. offsetLeft is physical, so this is
  // correct in both RTL and LTR.
  function movePill() {
    if (compact.matches) return;
    var active = nav.querySelector('.nav__link[aria-current="true"]');
    if (!active) { navPill.classList.remove('is-on'); return; }
    navPill.style.setProperty('--pill-x', active.offsetLeft + 'px');
    navPill.style.setProperty('--pill-w', active.offsetWidth + 'px');
    navPill.classList.add('is-on');
  }

  navToggle.addEventListener('click', function () { setMenu(nav.hidden); });

  nav.addEventListener('click', function (e) {
    if (compact.matches && e.target.closest('.nav__link')) setMenu(false);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && compact.matches && !nav.hidden) {
      setMenu(false);
      navToggle.focus();
    }
  });

  document.addEventListener('click', function (e) {
    if (!compact.matches || nav.hidden) return;
    if (!nav.contains(e.target) && !navToggle.contains(e.target)) setMenu(false);
  });

  compact.addEventListener('change', syncMenuToViewport);
  window.addEventListener('resize', function () { syncMenuToViewport(); movePill(); });
  setMenu(false);
  syncMenuToViewport();

  /* -----------------------------------------------------------
     Scroll reveal — staggered within each group
     ----------------------------------------------------------- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));

  if ('IntersectionObserver' in window) {
    var seen = new WeakMap();

    var revealObserver = new IntersectionObserver(function (entries) {
      // Stagger siblings that enter together, so groups cascade.
      var batch = entries.filter(function (e) { return e.isIntersecting; });
      batch.forEach(function (entry, i) {
        var el = entry.target;
        if (seen.get(el)) return;
        seen.set(el, true);
        el.style.setProperty('--d', (i * 80) + 'ms');
        el.classList.add('is-in');
        revealObserver.unobserve(el);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

    reveals.forEach(function (el) { revealObserver.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* -----------------------------------------------------------
     Scroll spy, nav state, back-to-top — one rAF pass
     ----------------------------------------------------------- */
  var sections = navLinks
    .map(function (l) { return document.querySelector(l.getAttribute('href')); })
    .filter(Boolean);
  var toTop = document.getElementById('toTop');
  var activeLink = null;
  var ticking = false;

  function onScroll() {
    ticking = false;
    var y = window.scrollY;

    navShell.classList.toggle('is-scrolled', y > 24);
    toTop.classList.toggle('is-visible', y > 700);

    if (!sections.length) return;

    var index = 0;
    for (var i = 0; i < sections.length; i++) {
      if (sections[i].getBoundingClientRect().top <= 140) index = i;
    }
    if (window.innerHeight + y >= root.scrollHeight - 4) index = sections.length - 1;

    var link = navLinks[index];
    if (link !== activeLink) {
      if (activeLink) activeLink.removeAttribute('aria-current');
      link.setAttribute('aria-current', 'true');
      activeLink = link;
      movePill();
    }
  }

  function requestScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(onScroll);
  }

  window.addEventListener('scroll', requestScroll, { passive: true });
  window.addEventListener('resize', requestScroll);

  toTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
  });

  /* -----------------------------------------------------------
     Hero node field
     A sparse network of nodes and links — the one animated layer
     on the page. Skipped entirely on small screens and when the
     visitor asks for reduced motion; paused when off-screen or
     when the tab is hidden.
     ----------------------------------------------------------- */
  var field = null;

  function buildField() {
    var canvas = document.getElementById('heroCanvas');
    var hero = document.querySelector('.hero');
    if (!canvas || !hero || !canvas.getContext) return null;

    var ctx = canvas.getContext('2d', { alpha: true });
    var dpr = 1, w = 0, h = 0, nodes = [], raf = 0;
    var onScreen = true, running = false;
    var pointer = { x: -1e4, y: -1e4, active: false };
    var ink = 'rgba(148,180,255,.5)', glow = 'rgba(56,189,248,1)';

    function readColors() {
      var cs = getComputedStyle(root);
      glow = (cs.getPropertyValue('--accent') || '#38bdf8').trim();
      ink = (cs.getPropertyValue('--ink-3') || '#8496b3').trim();
    }

    function resize() {
      var rect = hero.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = Math.max(1, Math.round(rect.width));
      h = Math.max(1, Math.round(rect.height));
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    }

    function seed() {
      var count = Math.round((w * h) / 26000);
      count = Math.max(22, Math.min(58, count));
      nodes = [];
      for (var i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.22,
          vy: (Math.random() - 0.5) * 0.22,
          r: Math.random() * 1.4 + 1
        });
      }
    }

    function step() {
      raf = 0;
      ctx.clearRect(0, 0, w, h);

      var linkDist = Math.min(170, Math.max(110, w / 9));
      var i, j, a, b, dx, dy, dist;

      for (i = 0; i < nodes.length; i++) {
        a = nodes[i];
        a.x += a.vx;
        a.y += a.vy;

        if (a.x < -20) a.x = w + 20; else if (a.x > w + 20) a.x = -20;
        if (a.y < -20) a.y = h + 20; else if (a.y > h + 20) a.y = -20;

        // Gentle drift toward the pointer, never a snap.
        if (pointer.active) {
          dx = pointer.x - a.x;
          dy = pointer.y - a.y;
          dist = Math.hypot(dx, dy);
          if (dist < 190 && dist > 0.5) {
            a.x += (dx / dist) * 0.35;
            a.y += (dy / dist) * 0.35;
          }
        }
      }

      // Links first, so nodes sit on top.
      ctx.lineWidth = 1;
      for (i = 0; i < nodes.length; i++) {
        a = nodes[i];
        for (j = i + 1; j < nodes.length; j++) {
          b = nodes[j];
          dx = a.x - b.x; dy = a.y - b.y;
          dist = Math.hypot(dx, dy);
          if (dist > linkDist) continue;
          ctx.globalAlpha = (1 - dist / linkDist) * 0.3;
          ctx.strokeStyle = ink;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      for (i = 0; i < nodes.length; i++) {
        a = nodes[i];
        dist = pointer.active ? Math.hypot(pointer.x - a.x, pointer.y - a.y) : 1e4;
        var near = dist < 190;
        ctx.globalAlpha = near ? 0.95 : 0.5;
        ctx.fillStyle = near ? glow : ink;
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      if (running) raf = window.requestAnimationFrame(step);
    }

    function start() {
      if (running || !onScreen || document.hidden) return;
      running = true;
      if (!raf) raf = window.requestAnimationFrame(step);
    }

    function stop() {
      running = false;
      if (raf) { window.cancelAnimationFrame(raf); raf = 0; }
    }

    hero.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      var rect = hero.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.active = true;
    }, { passive: true });

    hero.addEventListener('pointerleave', function () { pointer.active = false; });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop(); else start();
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        onScreen = entries[0].isIntersecting;
        if (onScreen) start(); else stop();
      }, { threshold: 0 }).observe(hero);
    }

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 180);
    });

    readColors();
    resize();
    start();

    return {
      recolor: readColors,
      destroy: function () { stop(); ctx.clearRect(0, 0, w, h); }
    };
  }

  function considerField() {
    var allowed = !reduceMotion.matches && !smallScreen.matches;
    if (allowed && !field) field = buildField();
    else if (!allowed && field) { field.destroy(); field = null; }
  }

  considerField();
  reduceMotion.addEventListener('change', considerField);
  smallScreen.addEventListener('change', considerField);

  /* -----------------------------------------------------------
     Pointer polish — spotlight borders, card tilt, cursor
     All of it is transform/opacity only, and desktop only.
     ----------------------------------------------------------- */
  var spotlights = Array.prototype.slice.call(document.querySelectorAll('.spotlight'));
  var tilts = Array.prototype.slice.call(document.querySelectorAll('.skill'));
  var cursor = document.getElementById('cursor');
  var magnets = Array.prototype.slice.call(document.querySelectorAll('.magnetic'));

  function enablePointerPolish() {
    if (reduceMotion.matches || !finePointer.matches) return;

    var px = window.innerWidth / 2, py = window.innerHeight / 2;
    var cx = px, cy = py;
    var target = null, tilted = null, hot = false;
    var raf = 0, moved = false;

    cursor.classList.add('is-on');

    // Every layout read and style write happens here, once per frame.
    function tick() {
      raf = 0;

      cx += (px - cx) * 0.18;
      cy += (py - cy) * 0.18;
      cursor.style.transform = 'translate3d(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px,0)';

      if (moved) {
        moved = false;

        if (target) {
          var r = target.getBoundingClientRect();
          target.style.setProperty('--mx', (px - r.left) + 'px');
          target.style.setProperty('--my', (py - r.top) + 'px');
        }

        if (tilted) {
          var t = tilted.getBoundingClientRect();
          tilted.style.setProperty('--rx', (((py - t.top) / t.height - 0.5) * -3).toFixed(2) + 'deg');
          tilted.style.setProperty('--ry', (((px - t.left) / t.width - 0.5) * 3).toFixed(2) + 'deg');
        }

        for (var i = 0; i < magnets.length; i++) {
          var m = magnets[i];
          var mr = m.getBoundingClientRect();
          if (!mr.width) continue;
          var dx = px - (mr.left + mr.width / 2);
          var dy = py - (mr.top + mr.height / 2);
          if (Math.abs(dx) < mr.width && Math.abs(dy) < mr.height * 2) {
            m.style.setProperty('--magx', (dx * 0.14).toFixed(1) + 'px');
            m.style.setProperty('--magy', (dy * 0.2).toFixed(1) + 'px');
          } else {
            m.style.removeProperty('--magx');
            m.style.removeProperty('--magy');
          }
        }

        cursor.classList.toggle('is-hot', hot);
      }

      // Keep the loop alive only while the follower still has ground to cover.
      if (Math.abs(px - cx) > 0.4 || Math.abs(py - cy) > 0.4) {
        raf = window.requestAnimationFrame(tick);
      }
    }

    function kick() {
      if (!raf) raf = window.requestAnimationFrame(tick);
    }

    document.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      px = e.clientX;
      py = e.clientY;
      moved = true;

      var el = e.target;
      var next = el && el.closest ? el.closest('.spotlight') : null;
      if (next !== target && target) {
        target.style.removeProperty('--mx');
        target.style.removeProperty('--my');
      }
      target = next;

      var nextTilt = el && el.closest ? el.closest('.skill') : null;
      if (nextTilt !== tilted && tilted) {
        tilted.style.setProperty('--rx', '0deg');
        tilted.style.setProperty('--ry', '0deg');
      }
      tilted = nextTilt;

      hot = !!(el && el.closest && el.closest('a,button,summary'));
      kick();
    }, { passive: true });

    document.addEventListener('pointerleave', function () {
      cursor.classList.remove('is-on');
      if (tilted) {
        tilted.style.setProperty('--rx', '0deg');
        tilted.style.setProperty('--ry', '0deg');
        tilted = null;
      }
    });

    document.addEventListener('pointerenter', function () { cursor.classList.add('is-on'); });
  }

  if (spotlights.length && tilts) enablePointerPolish();

  /* -----------------------------------------------------------
     Boot
     ----------------------------------------------------------- */
  document.getElementById('year').textContent = String(new Date().getFullYear());

  applyLanguage(store.get('lang') === 'en' ? 'en' : 'ar');
  onScroll();

  // Release the entrance animation once layout has settled. The timeout is
  // the safety net: rAF never fires in a background tab, and the hero must
  // not stay invisible if the page was opened there.
  function release() { root.classList.add('is-ready'); }

  window.requestAnimationFrame(function () {
    window.requestAnimationFrame(release);
  });
  setTimeout(release, 400);
})();
