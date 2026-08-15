/* =============================================================
   Mohammed Ismail Kariri — portfolio behaviour
   Theme · Language · Navigation · Scroll spy · Reveal
   No dependencies. Runs deferred, after the DOM is parsed.
   ============================================================= */
(function () {
  'use strict';

  var root = document.documentElement;

  // Tells the inline head script that scripting is alive, so it keeps the
  // scroll-reveal styles armed instead of dropping them.
  root.setAttribute('data-booted', '');

  /* -----------------------------------------------------------
     Storage — private browsing can make localStorage throw.
     ----------------------------------------------------------- */
  var store = {
    get: function (key) {
      try { return localStorage.getItem(key); } catch (e) { return null; }
    },
    set: function (key, value) {
      try { localStorage.setItem(key, value); } catch (e) { /* ignore */ }
    }
  };

  /* -----------------------------------------------------------
     Translations
     ----------------------------------------------------------- */
  var translations = {
    ar: {
      metaTitle: 'محمد إسماعيل كريري — أخصائي تقنية معلومات',
      metaDesc: 'بورتفوليو محمد إسماعيل كريري — أخصائي تقنية معلومات (IT Support / Hardware / CCTV) في الرياض. خبرات، مهارات، دورات، وإنجازات.',

      skip: 'تخطّي إلى المحتوى',
      brand: 'محمد كريري',
      nav_menu: 'القائمة',
      nav_about: 'نبذة',
      nav_skills: 'مهارات',
      nav_exp: 'خبرات',
      nav_edu: 'تعليم',
      nav_certs: 'دورات',
      nav_high: 'إنجازات',
      nav_contact: 'تواصل',
      lang_switch: 'التبديل إلى الإنجليزية',
      theme_switch: 'تبديل المظهر',
      to_top: 'العودة إلى الأعلى',

      status_open: 'متاح للعمل',
      hero_hi: 'مرحبًا، أنا',
      hero_name: 'محمد إسماعيل كريري',
      hero_lead: 'أخصائي تقنية معلومات بخبرة عملية في الدعم الفني وصيانة الأنظمة. أقدّم دعمًا شاملاً لمشاكل الموظفين التقنية، وصيانة للأجهزة والطابعات، وإدارة أنظمة المراقبة CCTV، لضمان أقل وقت توقف ورفع الكفاءة التشغيلية.',
      chip_loc: 'الرياض، السعودية',
      btn_cv: 'تحميل السيرة الذاتية',
      btn_viewcv: 'عرض السيرة الذاتية',
      btn_whatsapp: 'واتساب',

      stat_companies: 'شركات مدعومة تحت إدارة واحدة',
      stat_certs: 'دورة وشهادة مهنية',
      stat_degree: 'بكالوريوس علوم الحاسب — جامعة تبوك',

      skills_title: 'المهارات التقنية',
      svc1_title: 'الدعم الفني',
      svc1_desc: 'دعم تقني متعدد المستويات + حل مشاكل المستخدمين لرفع الإنتاجية.',
      svc2_title: 'صيانة الأجهزة',
      svc2_desc: 'صيانة دورية وطارئة للحواسيب والطابعات والملحقات.',
      svc3_title: 'أنظمة المراقبة',
      svc3_desc: 'مراقبة وإدارة أنظمة الكاميرات لضمان أمن واستقرار الموقع.',
      tools_title: 'أدوات وتقنيات',
      soft_title: 'مهارات شخصية',
      soft1: 'التواصل الفعّال + العمل ضمن فريق + تعاون.',
      soft2: 'حل المشكلات والتفكير التحليلي + سرعة التعلم.',
      soft3: 'إدارة وقت + إنجاز مهام بسرعة ودقة.',

      exp_title: 'الخبرات',
      job1_title: 'أخصائي تقنية معلومات — شركة بشائر البناء للمقاولات',
      job_fulltime: 'دوام كامل',
      job_intern: 'تدريب',
      job1_b1: 'نقطة الاتصال الأساسية لمشاكل الموظفين التقنية (سوفت/هارد) لضمان استمرارية الإنتاجية.',
      job1_b2: 'صيانة أجهزة متعددة (كمبيوتر، طابعات، ملحقات) بشكل دوري وطارئ.',
      job1_b3: 'إدارة ومراقبة أنظمة CCTV لضمان أمن المواقع واستمرارية المراقبة.',
      job1_b4: 'دعم شامل للأنظمة واتصالات الشبكة لاستقرار أدوات العمل.',

      impact_h: 'الأثر والمسؤوليات',
      impact_p: 'عملت كأخصائي تقنية معلومات داخل مقر الشركة، وكنت نقطة الاعتماد الأساسية للدعم الفني اليومي لأربع شركات تابعة لمالك واحد. قدّمت دعمًا حضوريًا داخل الشركة، إضافةً إلى دعم عن بُعد لموظفين داخل وخارج الرياض باستخدام AnyDesk. شمل عملي معالجة مشاكل الإنترنت والشبكات والأجهزة والطابعات والأنظمة بسرعة استجابة عالية وتعاون مباشر مع الموظفين. كما ساهمت في تقديم اقتراحات تطويرية للإدارة وحل مشاكل سابقة ومتكررة داخل قسم تقنية المعلومات، مما ساعد على تحسين آلية العمل ورفع استقرار الأنظمة.',
      impact_b1: 'دعم حضوري داخل الشركة + دعم عن بُعد لموظفين داخل وخارج الرياض (AnyDesk).',
      impact_b2: 'خدمة أربع شركات تحت إدارة واحدة.',
      impact_b3: 'حل مشاكل الشبكات والإنترنت والأجهزة والطابعات والأنظمة.',
      impact_b4: 'سرعة استجابة عالية وتعاون فعّال مع الموظفين.',
      impact_b5: 'تقديم اقتراحات تطويرية وتحسين إجراءات قسم IT.',

      job2_title: 'متدرّب — Tabuk Health Cluster',
      job2_b1: 'المساعدة في إصلاح الأعطال واستكشاف مشاكل أجهزة الكمبيوتر والجوالات.',
      job2_b2: 'تحديد أخطاء الأنظمة ومعالجتها لدعم البنية الرقمية للمنشأة.',
      job2_b3: 'التعاون مع فريق تقنية المعلومات لتنفيذ حلول تحسّن جودة الخدمة.',

      edu_title: 'التعليم',
      edu_degree: 'بكالوريوس علوم الحاسب',
      edu_school: 'جامعة تبوك — 2025',
      edu_b1: 'معترف بها رسميًا من الهيئة السعودية للمهندسين كأخصائي علوم حاسب.',
      edu_b2: 'التركيز: هندسة البرمجيات، قواعد البيانات العلائقية (RDBMS)، ومفاهيم الشبكات والدعم الفني.',

      certs_title: 'الدورات والشهادات',
      c2s: 'مقدمة لتطوير تطبيقات أندرويد',
      c3s: 'بناء موقع بورتفوليو باستخدام HTML و CSS',
      c4s: 'تحسين محركات البحث',
      c5s: 'أساسيات الكمبيوتر',
      c6s: 'أساسيات أدوات التصميم',
      c7s: 'برمجة كائنية التوجه (Java) — مستوى متوسط',
      c8s: 'مقدمة لقواعد البيانات العلائقية',
      c9s: 'أفضل الممارسات لبناء برامج عالية الجودة',
      c10s: 'أساسيات التسويق',
      c11s: 'مهارات إدخال البيانات',

      high_title: 'إنجازات ومهام',
      h1_t: 'الدعم الفني',
      h1_b1: 'حل مشاكل البرامج والأجهزة لضمان استمرارية الإنتاجية.',
      h1_b2: 'إعداد أجهزة المستخدمين وربط الطابعات والملحقات.',
      h2_t: 'الصيانة',
      h2_b1: 'صيانة دورية وطارئة للحواسيب والطابعات.',
      h2_b2: 'تشخيص الأعطال وتبديل القطع عند الحاجة.',
      h3_t: 'أنظمة المراقبة',
      h3_b1: 'متابعة كاميرات المراقبة والتأكد من عملها باستمرار.',
      h3_b2: 'ضمان استقرار الأنظمة والاتصالات الأساسية.',

      contact_title: 'تواصل',
      contact_head: 'هل تبحث عن أخصائي تقنية معلومات؟',
      contact_sub: 'متاح للتواصل والتوظيف في مجال IT Support / IT Specialist. أسرع طريقة للوصول إليّ هي واتساب.',
      footer_name: 'محمد إسماعيل كريري',
      footer_rights: 'جميع الحقوق محفوظة'
    },

    en: {
      metaTitle: 'Mohammed Ismail Kariri — IT Specialist',
      metaDesc: 'Mohammed Ismail Kariri — IT Specialist (IT Support / Hardware / CCTV) based in Riyadh. Experience, skills, certifications, and highlights.',

      skip: 'Skip to content',
      brand: 'Mohammed Kariri',
      nav_menu: 'Menu',
      nav_about: 'About',
      nav_skills: 'Skills',
      nav_exp: 'Experience',
      nav_edu: 'Education',
      nav_certs: 'Certifications',
      nav_high: 'Highlights',
      nav_contact: 'Contact',
      lang_switch: 'Switch to Arabic',
      theme_switch: 'Switch theme',
      to_top: 'Back to top',

      status_open: 'Open to work',
      hero_hi: "Hi, I'm",
      hero_name: 'Mohammed Ismail Kariri',
      hero_lead: 'An IT Specialist with hands-on experience in technical support and system maintenance. Skilled in resolving end-user issues, maintaining hardware and printers, and managing CCTV surveillance to minimize downtime and keep operations running smoothly.',
      chip_loc: 'Riyadh, Saudi Arabia',
      btn_cv: 'Download CV',
      btn_viewcv: 'View CV',
      btn_whatsapp: 'WhatsApp',

      stat_companies: 'Companies supported under one ownership',
      stat_certs: 'Certifications and training courses',
      stat_degree: 'B.Sc. Computer Science — University of Tabuk',

      skills_title: 'Technical Skills',
      svc1_title: 'IT Support',
      svc1_desc: 'Multi-level technical support and end-user troubleshooting to maintain productivity.',
      svc2_title: 'Hardware & Maintenance',
      svc2_desc: 'Routine and emergency maintenance for PCs, printers, and peripherals.',
      svc3_title: 'CCTV Monitoring',
      svc3_desc: 'Monitor and manage CCTV systems to support site security and oversight.',
      tools_title: 'Tools & Technologies',
      soft_title: 'Core Strengths',
      soft1: 'Strong communication, teamwork, and collaboration.',
      soft2: 'Problem-solving mindset with fast learning and adaptability.',
      soft3: 'Time management, reliability, and delivering with accuracy.',

      exp_title: 'Experience',
      job1_title: 'IT Specialist — Bashaer Al-Benaa Contracting Company',
      job_fulltime: 'Full-time',
      job_intern: 'Internship',
      job1_b1: 'Primary point of contact for employee technical issues (software & hardware) to maintain productivity.',
      job1_b2: 'Performed routine and emergency maintenance for computers, printers, and peripherals.',
      job1_b3: 'Managed and monitored CCTV systems to ensure continuous site security.',
      job1_b4: 'Provided end-to-end support for systems and network stability.',

      impact_h: 'Impact & Responsibilities',
      impact_p: 'Worked on-site as an IT Specialist and became the primary point of contact for daily IT support across four companies under one ownership. Provided in-office support at the workplace, in addition to remote support for employees inside and outside Riyadh using AnyDesk. Handled internet connectivity, networking, hardware, printer, and system-related issues with fast response and strong collaboration. Also contributed by proposing improvement suggestions to management and resolving recurring IT department issues to improve workflows and system stability.',
      impact_b1: 'On-site support + remote support for employees inside/outside Riyadh (AnyDesk).',
      impact_b2: 'Supported four companies under one owner.',
      impact_b3: 'Troubleshot internet, networking, hardware, printers, and system issues.',
      impact_b4: 'Known for fast response and strong collaboration.',
      impact_b5: 'Suggested improvements and enhanced IT workflows.',

      job2_title: 'Trainee — Tabuk Health Cluster',
      job2_b1: 'Assisted in troubleshooting and repairing computer hardware and mobile devices.',
      job2_b2: 'Identified and resolved system errors to support digital infrastructure.',
      job2_b3: 'Worked with the IT team to implement solutions that improved service delivery.',

      edu_title: 'Education',
      edu_degree: 'B.Sc. in Computer Science',
      edu_school: 'University of Tabuk — 2025',
      edu_b1: 'Officially recognized by the Saudi Council of Engineers (Computer Science Specialist).',
      edu_b2: 'Focus: software engineering, relational databases (RDBMS), networking fundamentals, and IT support.',

      certs_title: 'Certifications & Training',
      c2s: 'Android application development fundamentals',
      c3s: 'Portfolio website built with HTML and CSS',
      c4s: 'Search engine optimization fundamentals',
      c5s: 'Core computer literacy',
      c6s: 'Fundamentals of design tools',
      c7s: 'Object-oriented programming in Java — intermediate',
      c8s: 'Relational database fundamentals',
      c9s: 'Best practices for building high-quality software',
      c10s: 'Marketing fundamentals',
      c11s: 'Accurate and efficient data entry',

      high_title: 'Highlights',
      h1_t: 'Technical Support',
      h1_b1: 'Resolved software and hardware issues to minimize downtime and maintain productivity.',
      h1_b2: 'Set up user devices and configured printers and peripherals.',
      h2_t: 'Maintenance',
      h2_b1: 'Handled routine and emergency maintenance for PCs and printers.',
      h2_b2: 'Diagnosed issues and replaced parts when needed.',
      h3_t: 'CCTV & Systems',
      h3_b1: 'Monitored CCTV systems and ensured continuous operation.',
      h3_b2: 'Supported system and connectivity stability.',

      contact_title: 'Contact',
      contact_head: 'Looking for an IT Specialist?',
      contact_sub: 'Open to IT Support / IT Specialist opportunities. WhatsApp is the fastest way to reach me.',
      footer_name: 'Mohammed Ismail Kariri',
      footer_rights: 'All rights reserved'
    }
  };

  /* -----------------------------------------------------------
     Theme
     ----------------------------------------------------------- */
  var themeBtn = document.getElementById('themeBtn');
  var themeIcon = document.getElementById('themeIcon').querySelector('use');
  var systemDark = window.matchMedia('(prefers-color-scheme: dark)');

  function activeTheme() {
    var pinned = root.getAttribute('data-theme');
    if (pinned === 'dark' || pinned === 'light') return pinned;
    return systemDark.matches ? 'dark' : 'light';
  }

  function paintThemeButton() {
    var dark = activeTheme() === 'dark';
    // The icon shows the theme you would switch *to*.
    themeIcon.setAttribute('href', dark ? '#i-sun' : '#i-moon');
    themeBtn.setAttribute('aria-pressed', String(dark));
  }

  themeBtn.addEventListener('click', function () {
    var next = activeTheme() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    store.set('theme', next);
    paintThemeButton();
  });

  // Follow the OS while the visitor has not pinned a theme.
  systemDark.addEventListener('change', function () {
    if (!root.hasAttribute('data-theme')) paintThemeButton();
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
      var value = dict[el.getAttribute('data-i18n')];
      if (value !== undefined) el.textContent = value;
    });

    document.querySelectorAll('[data-i18n-label]').forEach(function (el) {
      var value = dict[el.getAttribute('data-i18n-label')];
      if (value !== undefined) el.setAttribute('aria-label', value);
    });

    store.set('lang', lang);
  }

  langBtn.addEventListener('click', function () {
    applyLanguage(currentLang === 'ar' ? 'en' : 'ar');
  });

  applyLanguage(store.get('lang') === 'en' ? 'en' : 'ar');

  /* -----------------------------------------------------------
     Mobile navigation
     ----------------------------------------------------------- */
  var nav = document.getElementById('nav');
  var navToggle = document.getElementById('navToggle');
  var navToggleIcon = document.getElementById('navToggleIcon').querySelector('use');
  var compact = window.matchMedia('(max-width: 860px)');

  function setMenu(open) {
    // [hidden] keeps the closed menu out of the tab order and the
    // accessibility tree, not merely invisible.
    nav.hidden = !open;
    navToggle.setAttribute('aria-expanded', String(open));
    navToggleIcon.setAttribute('href', open ? '#i-close' : '#i-menu');
  }

  var wasCompact = compact.matches;

  function syncMenuToViewport() {
    var isCompact = compact.matches;

    if (!isCompact) {
      // Always restore the desktop bar, including its accessibility tree.
      nav.hidden = false;
      navToggle.setAttribute('aria-expanded', 'false');
      navToggleIcon.setAttribute('href', '#i-menu');
    } else if (!wasCompact) {
      // Only collapse when crossing into compact, so an open menu is not
      // dismissed by the mobile address bar resizing the viewport.
      setMenu(false);
    }

    wasCompact = isCompact;
  }

  navToggle.addEventListener('click', function () {
    setMenu(nav.hidden);
  });

  nav.addEventListener('click', function (event) {
    if (compact.matches && event.target.closest('.nav__link')) setMenu(false);
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && compact.matches && !nav.hidden) {
      setMenu(false);
      navToggle.focus();
    }
  });

  document.addEventListener('click', function (event) {
    if (!compact.matches || nav.hidden) return;
    if (!nav.contains(event.target) && !navToggle.contains(event.target)) setMenu(false);
  });

  compact.addEventListener('change', syncMenuToViewport);
  window.addEventListener('resize', syncMenuToViewport);
  setMenu(false);
  syncMenuToViewport();

  /* -----------------------------------------------------------
     Reveal on scroll — staggered per section
     ----------------------------------------------------------- */
  var reveals = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach(function (el) { revealObserver.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* -----------------------------------------------------------
     Scroll spy + back-to-top, batched into one rAF pass
     ----------------------------------------------------------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav__link'));
  var sections = navLinks
    .map(function (link) { return document.querySelector(link.getAttribute('href')); })
    .filter(Boolean);
  var toTop = document.getElementById('toTop');
  var ticking = false;
  var activeLink = null;

  function onScroll() {
    var offset = 120;
    var index = 0;

    for (var i = 0; i < sections.length; i++) {
      if (sections[i].getBoundingClientRect().top <= offset) index = i;
    }

    // The last section can be too short to ever reach the offset, so pin it
    // once the page is scrolled to the bottom.
    if (window.innerHeight + window.scrollY >= root.scrollHeight - 4) {
      index = sections.length - 1;
    }

    var link = navLinks[index];
    if (link !== activeLink) {
      if (activeLink) activeLink.removeAttribute('aria-current');
      link.setAttribute('aria-current', 'true');
      activeLink = link;
    }

    toTop.classList.toggle('is-visible', window.scrollY > 600);
    ticking = false;
  }

  function requestScrollUpdate() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(onScroll);
  }

  if (sections.length) {
    window.addEventListener('scroll', requestScrollUpdate, { passive: true });
    window.addEventListener('resize', requestScrollUpdate);
    onScroll();
  }

  toTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* -----------------------------------------------------------
     Footer year
     ----------------------------------------------------------- */
  document.getElementById('year').textContent = String(new Date().getFullYear());
})();
