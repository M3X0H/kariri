/* ═════════════════════════════════════════════════════════════
   SPECIMEN — behaviour
   Each block below is a module: a small interface over as much
   implementation as it can absorb. No dependencies.
   ═════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var root = document.documentElement;
  root.setAttribute('data-booted', '');

  var mLessMotion = matchMedia('(prefers-reduced-motion: reduce)');
  var mFinePointer = matchMedia('(pointer: fine)');
  var mCompact = matchMedia('(max-width: 900px)');

  /* ── store ───────────────────────────────────────────────── */
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  /* ── copy ────────────────────────────────────────────────── */
  var copy = {
    ar: {
      metaTitle: 'محمد إسماعيل كريري — أخصائي تقنية معلومات',
      metaDesc: 'محمد إسماعيل كريري — أخصائي تقنية معلومات وأخصائي علوم حاسب معتمد من الهيئة السعودية للمهندسين. دعم فني، أنظمة، شبكات، أجهزة، ومراقبة CCTV في الرياض.',

      skip: 'تخطّي إلى المحتوى',
      brand: 'محمد كريري',
      nav_menu: 'القائمة',
      nav_home: 'الرئيسية',
      nav_about: 'نبذة',
      nav_caps: 'القدرات',
      nav_career: 'المسار',
      nav_work: 'الأعمال',
      nav_contact: 'تواصل',
      lang_switch: 'التبديل إلى الإنجليزية',
      theme_switch: 'تبديل المظهر',

      meta_role: 'أخصائي تقنية معلومات',
      meta_open: 'متاح للعمل',
      hero_first: 'محمد',
      hero_last: 'كريري',
      hero_say: 'أبقي الأنظمة التي يعمل عليها الناس واقفة على قدميها — دعمًا وصيانةً وشبكاتٍ ومراقبة.',
      plate_cap: 'معتمد من الهيئة السعودية للمهندسين',
      cue: 'اسحب للأسفل',

      say_1: 'أبني الأنظمة',
      say_2: 'وأصونها',
      say_3: 'وأبقيها تعمل.',
      about_1: 'خريج علوم حاسب من جامعة تبوك، ومعتمد رسميًا من الهيئة السعودية للمهندسين. عملي يبدأ حيث تلتقي الأنظمة بالناس: موظف لا يستطيع الطباعة، شبكة تتقطع، كاميرا توقفت عن التسجيل.',
      about_2: 'كنت نقطة الاعتماد الأساسية للدعم الفني اليومي لأربع شركات تحت إدارة واحدة، حضوريًا في المقر وعن بُعد لموظفين داخل الرياض وخارجها. أميل إلى المشاكل المتكررة، لأنها وحدها التي يمكن إنهاؤها نهائيًا.',
      f1_k: 'التعليم',
      f1_v: 'بكالوريوس علوم حاسب — جامعة تبوك، 2025',
      f2_k: 'الاعتماد',
      f2_v: 'أخصائي علوم حاسب — الهيئة السعودية للمهندسين، 2025',
      f3_k: 'الموقع',
      f3_v: 'الرياض، السعودية',
      f4_k: 'اللغات',
      f4_v: 'العربية · الإنجليزية',
      t1: 'حل المشكلات', t2: 'التفكير الإبداعي', t3: 'التواصل الفعّال', t4: 'إدارة الوقت',
      t5: 'سرعة التعلّم', t6: 'القيادة', t7: 'الابتكار', t8: 'التصميم الجرافيكي',

      caps_tag: 'ماذا أفعل',
      cap1: 'الدعم اليومي للموظفين، وحل الأعطال قبل أن توقف العمل.',
      cap2: 'تشغيل الأنظمة ومتابعة استقرارها على مدار يوم العمل.',
      cap3: 'تشخيص انقطاع الإنترنت والشبكات المحلية وإعادتها للعمل.',
      cap4: 'صيانة دورية وطارئة، وتشخيص الأعطال وتبديل القطع.',
      cap5: 'إدارة أنظمة المراقبة والتأكد من عملها دون انقطاع.',
      cap6: 'أساس أكاديمي في البرمجة وقواعد البيانات وبناء الويب.',

      career_tag: 'المسار المهني',
      j1_role: 'أخصائي تقنية معلومات',
      j1_org: 'شركة بشائر البناء للمقاولات — الرياض',
      j1_kind: 'دوام كامل',
      j1_b1: 'نقطة الاتصال الأساسية لمشاكل الموظفين التقنية لضمان استمرارية العمل.',
      j1_b2: 'صيانة دورية وطارئة للحواسيب والطابعات والملحقات.',
      j1_b3: 'إدارة ومراقبة أنظمة CCTV لضمان أمن المواقع.',
      j1_b4: 'دعم شامل للأنظمة واتصالات الشبكة.',
      more: 'الأثر والمسؤوليات',
      j1_impact: 'عملت كأخصائي تقنية معلومات داخل مقر الشركة، وكنت نقطة الاعتماد الأساسية للدعم الفني اليومي لأربع شركات تابعة لمالك واحد. قدّمت دعمًا حضوريًا داخل الشركة، إضافةً إلى دعم عن بُعد لموظفين داخل وخارج الرياض باستخدام AnyDesk. شمل عملي معالجة مشاكل الإنترنت والشبكات والأجهزة والطابعات والأنظمة بسرعة استجابة عالية وتعاون مباشر مع الموظفين. كما ساهمت في تقديم اقتراحات تطويرية للإدارة وحل مشاكل سابقة ومتكررة داخل قسم تقنية المعلومات، مما ساعد على تحسين آلية العمل ورفع استقرار الأنظمة.',
      j1_i1: 'دعم حضوري + دعم عن بُعد داخل الرياض وخارجها (AnyDesk).',
      j1_i2: 'خدمة أربع شركات تحت إدارة واحدة.',
      j1_i3: 'حل مشاكل الشبكات والإنترنت والأجهزة والطابعات والأنظمة.',
      j1_i4: 'سرعة استجابة عالية وتعاون فعّال مع الموظفين.',
      j1_i5: 'اقتراحات تطويرية وتحسين إجراءات قسم تقنية المعلومات.',
      edu_deg: 'بكالوريوس علوم الحاسب',
      edu_org: 'جامعة تبوك',
      edu_kind: 'تعليم',
      edu_b1: 'معترف بها رسميًا من الهيئة السعودية للمهندسين كأخصائي علوم حاسب.',
      edu_b2: 'التركيز: هندسة البرمجيات، قواعد البيانات العلائقية، ومفاهيم الشبكات والدعم الفني.',
      j2_role: 'متدرّب — تقنية المعلومات',
      j2_org: 'تجمع تبوك الصحي',
      j2_kind: 'تدريب',
      j2_b1: 'المساعدة في إصلاح الأعطال واستكشاف مشاكل أجهزة الحاسب والجوالات.',
      j2_b2: 'تحديد أخطاء الأنظمة ومعالجتها لدعم البنية الرقمية للمنشأة.',
      j2_b3: 'التعاون مع فريق تقنية المعلومات لتنفيذ حلول تحسّن جودة الخدمة.',

      work_tag: 'أعمال مختارة',
      p1_t: 'هذا الموقع',
      p1_d: 'موقع ثابت بلا إطار عمل وبلا اعتماديات خارجية. يدعم العربية والإنجليزية مع قلب كامل لاتجاه الصفحة، ووضعًا فاتحًا وداكنًا، ومجسّمًا ثلاثي الأبعاد مرسومًا بحسابات إسقاط يدوية على canvas. مبني ليعمل بلوحة المفاتيح ويحترم تقليل الحركة.',
      p_stack: 'التقنيات',
      p_focus: 'التركيز',
      p_code: 'الكود المصدري',
      p_live: 'أنت تتصفّحه الآن',
      soon: 'مشاريع أخرى قيد العمل. ما أنشره أولًا بأول يظهر على GitHub.',

      cred_tag: 'الاعتمادات',
      cred_o: 'الهيئة السعودية للمهندسين — 2025',

      end_1: 'لنبنِ شيئًا',
      end_2: 'يستحق التشغيل.',
      end_say: 'متاح لفرص عمل في الدعم الفني وتقنية المعلومات. واتساب أسرع طريقة للوصول إليّ، وأرد عادةً في نفس اليوم.',
      way_cv: 'السيرة الذاتية',
      way_call: 'اتصال مباشر',
      portrait_alt: 'محمد إسماعيل كريري — أخصائي تقنية معلومات',
      foot_name: 'محمد إسماعيل كريري'
    },

    en: {
      metaTitle: 'Mohammed Ismail Kariri — IT Specialist',
      metaDesc: 'Mohammed Ismail Kariri — IT Specialist and Computer Science Specialist recognized by the Saudi Council of Engineers. IT support, systems, networking, hardware, and CCTV in Riyadh.',

      skip: 'Skip to content',
      brand: 'Mohammed Kariri',
      nav_menu: 'Menu',
      nav_home: 'Home',
      nav_about: 'About',
      nav_caps: 'Capabilities',
      nav_career: 'Career',
      nav_work: 'Work',
      nav_contact: 'Contact',
      lang_switch: 'Switch to Arabic',
      theme_switch: 'Switch theme',

      meta_role: 'IT Specialist',
      meta_open: 'Open to work',
      hero_first: 'MOHAMMED',
      hero_last: 'KARIRI',
      hero_say: 'I keep the systems people work on standing — support, maintenance, networks, and surveillance.',
      plate_cap: 'Recognized by the Saudi Council of Engineers',
      cue: 'Scroll',

      say_1: 'I build systems,',
      say_2: 'maintain them,',
      say_3: 'and keep them running.',
      about_1: 'Computer Science graduate from the University of Tabuk, officially recognized by the Saudi Council of Engineers. My work starts where systems meet people: someone who cannot print, a connection that keeps dropping, a camera that stopped recording.',
      about_2: 'I was the day-to-day point of contact for IT support across four companies under one ownership — on site at the office and remotely for employees inside and outside Riyadh. I gravitate toward recurring problems, because those are the only ones you can end for good.',
      f1_k: 'Education',
      f1_v: 'B.Sc. Computer Science — University of Tabuk, 2025',
      f2_k: 'Accreditation',
      f2_v: 'Computer Science Specialist — Saudi Council of Engineers, 2025',
      f3_k: 'Location',
      f3_v: 'Riyadh, Saudi Arabia',
      f4_k: 'Languages',
      f4_v: 'Arabic · English',
      t1: 'Problem solving', t2: 'Creative thinking', t3: 'Effective communication', t4: 'Time management',
      t5: 'Fast learning', t6: 'Leadership', t7: 'Innovation', t8: 'Graphic design',

      caps_tag: 'What I do',
      cap1: 'Day-to-day support for staff, clearing faults before they stop the work.',
      cap2: 'Running systems and holding them stable across the working day.',
      cap3: 'Diagnosing dropped internet and local network faults and restoring service.',
      cap4: 'Routine and emergency maintenance, fault diagnosis, and parts replacement.',
      cap5: 'Managing surveillance systems and verifying they run without interruption.',
      cap6: 'Academic grounding in programming, databases, and building for the web.',

      career_tag: 'Career',
      j1_role: 'IT Specialist',
      j1_org: 'Bashaer Al-Benaa Contracting Company — Riyadh',
      j1_kind: 'Full-time',
      j1_b1: 'Primary point of contact for staff technical issues, keeping work uninterrupted.',
      j1_b2: 'Routine and emergency maintenance for computers, printers, and peripherals.',
      j1_b3: 'Managed and monitored CCTV systems to keep sites secure.',
      j1_b4: 'End-to-end support for systems and network connectivity.',
      more: 'Impact & responsibilities',
      j1_impact: 'Worked on site as an IT Specialist and became the primary point of contact for daily IT support across four companies under one ownership. Provided in-office support at the workplace, in addition to remote support for employees inside and outside Riyadh using AnyDesk. Handled internet connectivity, networking, hardware, printer, and system-related issues with fast response and strong collaboration. Also contributed by proposing improvement suggestions to management and resolving recurring IT department issues to improve workflows and system stability.',
      j1_i1: 'On-site support plus remote support inside and outside Riyadh (AnyDesk).',
      j1_i2: 'Supported four companies under one owner.',
      j1_i3: 'Troubleshot networking, internet, hardware, printer, and system issues.',
      j1_i4: 'Fast response and effective collaboration with staff.',
      j1_i5: 'Proposed improvements and refined IT department procedures.',
      edu_deg: 'B.Sc. in Computer Science',
      edu_org: 'University of Tabuk',
      edu_kind: 'Education',
      edu_b1: 'Officially recognized by the Saudi Council of Engineers as a Computer Science Specialist.',
      edu_b2: 'Focus: software engineering, relational databases, networking fundamentals, and IT support.',
      j2_role: 'Trainee — Information Technology',
      j2_org: 'Tabuk Health Cluster',
      j2_kind: 'Internship',
      j2_b1: 'Assisted in troubleshooting and repairing computer hardware and mobile devices.',
      j2_b2: 'Identified and resolved system errors to support digital infrastructure.',
      j2_b3: 'Worked with the IT team to implement solutions that improved service delivery.',

      work_tag: 'Selected work',
      p1_t: 'This site',
      p1_d: 'A static site with no framework and no external dependencies. It carries Arabic and English with a full page-direction flip, light and dark themes, and a three-dimensional lattice drawn from hand-written projection maths on canvas. Built to work from the keyboard and to respect reduced motion.',
      p_stack: 'Stack',
      p_focus: 'Focus',
      p_code: 'Source code',
      p_live: 'You are looking at it',
      soon: 'More projects are in progress. Whatever I publish first appears on GitHub.',

      cred_tag: 'Credentials',
      cred_o: 'Saudi Council of Engineers — 2025',

      end_1: 'Let’s build something',
      end_2: 'worth running.',
      end_say: 'Open to IT support and IT specialist roles. WhatsApp is the fastest way to reach me, and I usually reply the same day.',
      way_cv: 'Curriculum Vitae',
      way_call: 'Direct call',
      portrait_alt: 'Mohammed Ismail Kariri — IT Specialist',
      foot_name: 'Mohammed Ismail Kariri'
    }
  };

  /* ── theme ───────────────────────────────────────────────── */
  var theme = (function () {
    var btn = document.getElementById('themeBtn');
    var ico = document.querySelector('#themeIco use');
    var meta = document.querySelector('meta[name="theme-color"]');
    var listeners = [];

    function current() {
      return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    }

    function paint() {
      var dark = current() === 'dark';
      ico.setAttribute('href', dark ? '#i-sun' : '#i-moon');
      btn.setAttribute('aria-pressed', String(dark));
      if (meta) meta.setAttribute('content', dark ? '#0b0b0a' : '#efeee9');
    }

    btn.addEventListener('click', function () {
      var next = current() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      store.set('theme', next);
      paint();
      listeners.forEach(function (fn) { fn(next); });
    });

    paint();
    return { current: current, onChange: function (fn) { listeners.push(fn); } };
  })();

  /* ── language ────────────────────────────────────────────── */
  var lang = (function () {
    var btn = document.getElementById('langBtn');
    var label = document.getElementById('langLabel');
    var desc = document.querySelector('meta[name="description"]');
    var now = 'ar';
    var listeners = [];

    function apply(code) {
      var dict = copy[code];
      if (!dict) return;
      now = code;

      root.setAttribute('lang', code);
      root.setAttribute('dir', code === 'en' ? 'ltr' : 'rtl');
      label.textContent = code === 'en' ? 'ع' : 'EN';
      document.title = dict.metaTitle;
      if (desc) desc.setAttribute('content', dict.metaDesc);

      document.querySelectorAll('[data-i18n]').forEach(function (el) {
        var v = dict[el.getAttribute('data-i18n')];
        if (v !== undefined) el.textContent = v;
      });
      document.querySelectorAll('[data-i18n-label]').forEach(function (el) {
        var v = dict[el.getAttribute('data-i18n-label')];
        if (v !== undefined) el.setAttribute('aria-label', v);
      });

      document.querySelectorAll('[data-i18n-alt]').forEach(function (el) {
        var v = dict[el.getAttribute('data-i18n-alt')];
        if (v !== undefined) el.setAttribute('alt', v);
      });

      store.set('lang', code);
      listeners.forEach(function (fn) { fn(code); });
    }

    btn.addEventListener('click', function () { apply(now === 'ar' ? 'en' : 'ar'); });

    return { apply: apply, onChange: function (fn) { listeners.push(fn); } };
  })();

  /* ── navigation ──────────────────────────────────────────── */
  var nav = (function () {
    var rail = document.querySelector('.rail');
    var sheet = document.getElementById('sheet');
    var menuBtn = document.getElementById('menuBtn');
    var items = [].slice.call(document.querySelectorAll('.index__item, .sheet__item'));

    // Section per href, de-duplicated across the two link lists.
    var order = [];
    items.forEach(function (a) {
      var id = a.getAttribute('href');
      if (order.indexOf(id) === -1) order.push(id);
    });
    var sections = order.map(function (id) { return document.querySelector(id); });

    var activeId = null;

    function setMenu(open) {
      sheet.hidden = !open;
      menuBtn.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    }

    menuBtn.addEventListener('click', function () { setMenu(sheet.hidden); });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !sheet.hidden) { setMenu(false); menuBtn.focus(); }
    });

    mCompact.addEventListener('change', function () {
      if (!mCompact.matches) setMenu(false);
    });

    function mark(id) {
      if (id === activeId) return;
      activeId = id;
      items.forEach(function (a) {
        if (a.getAttribute('href') === id) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    }

    function update(y) {
      rail.classList.toggle('is-stuck', y > 16);
      if (!sections.length) return;

      var i, idx = 0;
      for (i = 0; i < sections.length; i++) {
        if (sections[i] && sections[i].getBoundingClientRect().top <= 140) idx = i;
      }
      if (innerHeight + y >= root.scrollHeight - 4) idx = sections.length - 1;
      mark(order[idx]);
    }

    return {
      update: update,
      close: function () { setMenu(false); },
      isOpen: function () { return !sheet.hidden; }
    };
  })();


  /* ── reveal ──────────────────────────────────────────────── */
  var reveal = (function () {
    var all = [].slice.call(document.querySelectorAll('.reveal'));

    function showAll() {
      all.forEach(function (el) { el.classList.add('is-in'); });
    }

    if (!('IntersectionObserver' in window)) {
      showAll();
      return { showAll: showAll };
    }

    var seen = new WeakSet();
    var io = new IntersectionObserver(function (entries) {
      entries.filter(function (e) { return e.isIntersecting; })
        .forEach(function (e, i) {
          if (seen.has(e.target)) return;
          seen.add(e.target);
          e.target.style.setProperty('--d', (i * 70) + 'ms');
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -60px 0px' });

    all.forEach(function (el) { io.observe(el); });
    return { showAll: showAll };
  })();

  /* ── in-page navigation ──────────────────────────────────────
     Same-page links are driven here rather than left to the browser's
     fragment jump. Three reasons:

       · The fixed rail would otherwise cover the top of the target.
       · Closing the sheet inside the link's own click handler removes
         that link's ancestor mid-click, which can cancel the jump. The
         symptom is a link that changes the URL but never moves the
         page — i.e. one that "only works in a new tab".
       · Modified clicks (⌘/Ctrl/middle) must still open a new tab, and
         first load, refresh, Back, Forward and pasted deep links all
         need to land in the same place.
     ──────────────────────────────────────────────────────────── */
  (function () {
    var lastHash = '', lastAt = 0;

    function targetFor(hash) {
      if (!hash || hash.charAt(0) !== '#' || hash.length < 2) return null;
      return document.getElementById(hash.slice(1));
    }

    function goTo(el, smooth) {
      lastHash = '#' + el.id;
      lastAt = Date.now();

      // scroll-margin-block-start on the section is the single source of
      // truth for the rail's clearance, so it is read, not re-guessed.
      var margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
      var top = Math.max(0, Math.round(el.getBoundingClientRect().top + scrollY - margin));
      scrollTo({ top: top, behavior: smooth && !mLessMotion.matches ? 'smooth' : 'auto' });

      // Send the keyboard where the eye just went, without a second jump.
      if (el.tabIndex < 0) el.setAttribute('tabindex', '-1');
      el.focus({ preventScroll: true });
    }

    // One hash change can raise both popstate and hashchange; collapse
    // them or the page visibly jumps to the same place twice.
    function syncToHash(smooth) {
      if (location.hash === lastHash && Date.now() - lastAt < 500) return;
      var el = targetFor(location.hash);
      if (el) goTo(el, smooth);
    }

    document.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      var link = e.target.closest ? e.target.closest('a[href]') : null;
      if (!link || link.target === '_blank') return;

      var href = link.getAttribute('href') || '';
      if (href.charAt(0) !== '#') return;

      var el = targetFor(href);
      if (!el) return;

      // Scroll first, then close the sheet — never the other way round.
      e.preventDefault();
      goTo(el, true);
      if (nav.isOpen()) nav.close();

      if (location.hash !== href) history.pushState(null, '', href);
      reveal.showAll();
    });

    addEventListener('popstate', function () { nav.close(); syncToHash(false); });
    addEventListener('hashchange', function () { nav.close(); syncToHash(false); });

    // A deep link on first load lands after layout, not before it.
    if (targetFor(location.hash)) {
      reveal.showAll();
      requestAnimationFrame(function () { syncToHash(false); });
    }
  })();

  /* ── lattice ─────────────────────────────────────────────────
     The hero's 3D object. A Fibonacci-distributed point shell with
     edges between near neighbours, rotated by real matrices and
     drawn with a perspective divide. Depth drives both line alpha
     and node radius, which is what sells the volume.

     Interface: mount(canvas, host) -> { destroy }
     Everything else — sizing, input, visibility, theming — is
     handled inside.
     ──────────────────────────────────────────────────────────── */
  function mountLattice(canvas, host) {
    if (!canvas || !canvas.getContext) return null;
    var ctx = canvas.getContext('2d');
    if (!ctx) return null;

    var dpr = 1, w = 0, h = 0;
    var pts = [], edges = [];
    var raf = 0, running = false, onScreen = true;
    var yaw = 0, pitch = 0, tYaw = 0, tPitch = 0, spin = 0, scrollK = 0;
    var inkRGB = '14,14,13', accentRGB = '27,62,245';

    function readInk() {
      var cs = getComputedStyle(root);
      inkRGB = toRGB(cs.getPropertyValue('--ink')) || inkRGB;
      accentRGB = toRGB(cs.getPropertyValue('--accent')) || accentRGB;
    }

    function toRGB(hex) {
      hex = (hex || '').trim();
      var m = hex.match(/^#?([0-9a-f]{6})$/i);
      if (!m) return null;
      var n = parseInt(m[1], 16);
      return ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255);
    }

    // Fibonacci sphere: even coverage without clustering at the poles.
    function build(count) {
      pts = [];
      var golden = Math.PI * (3 - Math.sqrt(5));
      for (var i = 0; i < count; i++) {
        var y = 1 - (i / (count - 1)) * 2;
        var r = Math.sqrt(Math.max(0, 1 - y * y));
        var th = golden * i;
        pts.push({ x: Math.cos(th) * r, y: y, z: Math.sin(th) * r });
      }

      // Connect neighbours once each. Even points on a unit sphere sit
      // about sqrt(4π/N) apart, so the threshold is set just above that
      // (4.8/√N ≈ 1.35×) to give roughly five or six neighbours each —
      // a lattice that still reads open rather than a solid mesh.
      edges = [];
      var limit = 4.8 / Math.sqrt(count);
      for (var a = 0; a < pts.length; a++) {
        for (var b = a + 1; b < pts.length; b++) {
          var dx = pts[a].x - pts[b].x, dy = pts[a].y - pts[b].y, dz = pts[a].z - pts[b].z;
          if (dx * dx + dy * dy + dz * dz < limit * limit) edges.push([a, b]);
        }
      }
    }

    /* CSS owns the canvas's display size; this only sizes the backing
       store to match. Measuring the canvas itself (never the host) means
       an early or bogus measurement is corrected by the next observation
       instead of being frozen into an inline style. */
    function resize() {
      var r = canvas.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return false;

      dpr = Math.min(devicePixelRatio || 1, 2);
      w = Math.round(r.width);
      h = Math.round(r.height);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build(mCompact.matches ? 90 : 150);
      return true;
    }

    function frame() {
      raf = 0;
      spin += 0.0016;
      yaw += (tYaw - yaw) * 0.05;
      pitch += (tPitch - pitch) * 0.05;

      ctx.clearRect(0, 0, w, h);

      // Sit opposite the name rather than behind it: the name hugs the
      // inline-end edge, so the object anchors the opposite side and the
      // two balance instead of colliding. Narrow screens stack, so it
      // recentres there.
      var rtl = root.getAttribute('dir') !== 'ltr';
      var narrow = mCompact.matches;
      var cx = narrow ? w * 0.42 : w * (rtl ? 0.30 : 0.70);
      // On narrow screens everything stacks, so the object rides up behind
      // the name instead of cutting through the portrait and body copy.
      var cy = narrow ? h * 0.30 : h * 0.5;
      var radius = Math.min(w, h) * (narrow ? 0.34 : 0.36);
      var fade = narrow ? 0.55 : 1;
      var focal = 2.6;

      var ay = yaw + spin, ax = pitch + scrollK * 0.6;
      var sy = Math.sin(ay), cyaw = Math.cos(ay);
      var sx = Math.sin(ax), cxp = Math.cos(ax);

      // Project once per frame, reuse for edges and nodes.
      var proj = new Array(pts.length);
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        var x1 = p.x * cyaw - p.z * sy;
        var z1 = p.x * sy + p.z * cyaw;
        var y2 = p.y * cxp - z1 * sx;
        var z2 = p.y * sx + z1 * cxp;
        var k = focal / (focal + z2);
        proj[i] = { x: cx + x1 * radius * k, y: cy + y2 * radius * k, d: (z2 + 1) / 2, k: k };
      }

      ctx.lineWidth = 1;
      for (var e = 0; e < edges.length; e++) {
        var a = proj[edges[e][0]], b = proj[edges[e][1]];
        var depth = 1 - (a.d + b.d) / 2;
        ctx.strokeStyle = 'rgba(' + inkRGB + ',' + ((0.07 + depth * 0.34) * fade).toFixed(3) + ')';
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      for (var n = 0; n < proj.length; n++) {
        var q = proj[n];
        var front = 1 - q.d;
        ctx.fillStyle = n % 17 === 0
          ? 'rgba(' + accentRGB + ',' + ((0.30 + front * 0.65) * fade).toFixed(3) + ')'
          : 'rgba(' + inkRGB + ',' + ((0.12 + front * 0.45) * fade).toFixed(3) + ')';
        ctx.beginPath();
        ctx.arc(q.x, q.y, (n % 17 === 0 ? 2.3 : 1.4) * q.k, 0, Math.PI * 2);
        ctx.fill();
      }

      if (running) raf = requestAnimationFrame(frame);
    }

    function start() {
      if (running || !onScreen || document.hidden) return;
      running = true;
      if (!raf) raf = requestAnimationFrame(frame);
    }

    function stop() {
      running = false;
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
    }

    function onPointer(e) {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      tYaw = ((e.clientX / innerWidth) - 0.5) * 1.1;
      tPitch = ((e.clientY / innerHeight) - 0.5) * -0.7;
    }

    function onScroll() {
      var r = host.getBoundingClientRect();
      scrollK = Math.max(-1, Math.min(1, -r.top / Math.max(1, r.height)));
    }

    var resizeTimer;
    function onResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 160);
    }

    function onVisibility() { document.hidden ? stop() : start(); }

    addEventListener('pointermove', onPointer, { passive: true });
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVisibility);

    var io = null;
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(function (en) {
        onScreen = en[0].isIntersecting;
        onScreen ? start() : stop();
      }, { threshold: 0 });
      io.observe(host);
    }

    // Re-sizes whenever the canvas's own box changes, which also covers
    // the first correct measurement if layout was not ready at boot.
    var ro = null;
    if ('ResizeObserver' in window) {
      ro = new ResizeObserver(function () { resize(); });
      ro.observe(canvas);
    }

    theme.onChange(readInk);
    readInk();
    onScroll();

    // Retry until the element actually has a box, for engines that run
    // deferred scripts before first layout.
    if (!resize()) requestAnimationFrame(function () { resize(); });
    start();

    return {
      destroy: function () {
        stop();
        removeEventListener('pointermove', onPointer);
        removeEventListener('scroll', onScroll);
        removeEventListener('resize', onResize);
        document.removeEventListener('visibilitychange', onVisibility);
        if (io) io.disconnect();
        if (ro) ro.disconnect();
        ctx.clearRect(0, 0, w, h);
      }
    };
  }

  var lattice = null;
  function considerLattice() {
    var wanted = !mLessMotion.matches;
    if (wanted && !lattice) {
      lattice = mountLattice(document.getElementById('lattice'), document.querySelector('.hero'));
    } else if (!wanted && lattice) {
      lattice.destroy();
      lattice = null;
    }
  }
  mLessMotion.addEventListener('change', considerLattice);

  /* ── pointer polish ──────────────────────────────────────────
     Cursor dot and the portrait's depth tilt. One rAF, reads
     before writes, desktop only.
     ──────────────────────────────────────────────────────────── */
  function mountPointer() {
    if (mLessMotion.matches || !mFinePointer.matches) return;

    var dot = document.getElementById('dot');
    var plate = document.getElementById('plate');
    var depth = plate ? plate.querySelector('.plate__depth') : null;
    var px = innerWidth / 2, py = innerHeight / 2, cx = px, cy = py;
    var wide = false, raf = 0, moved = false;

    dot.classList.add('is-on');

    function tick() {
      raf = 0;

      // read
      var plateRect = (moved && depth) ? plate.getBoundingClientRect() : null;

      // write
      cx += (px - cx) * 0.2;
      cy += (py - cy) * 0.2;
      dot.style.transform = 'translate3d(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px,0)';

      if (moved) {
        moved = false;
        dot.classList.toggle('is-wide', wide);
        if (plateRect) {
          var rx = ((py - plateRect.top) / plateRect.height - 0.5) * -14;
          var ry = ((px - plateRect.left) / plateRect.width - 0.5) * 14;
          depth.style.setProperty('--px', rx.toFixed(2) + 'deg');
          depth.style.setProperty('--py', ry.toFixed(2) + 'deg');
        }
      }

      if (Math.abs(px - cx) > 0.4 || Math.abs(py - cy) > 0.4) raf = requestAnimationFrame(tick);
    }

    addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      px = e.clientX; py = e.clientY; moved = true;
      wide = !!(e.target.closest && e.target.closest('a,button,summary,.cap'));
      if (!raf) raf = requestAnimationFrame(tick);
    }, { passive: true });

    document.addEventListener('pointerleave', function () { dot.classList.remove('is-on'); });
    document.addEventListener('pointerenter', function () { dot.classList.add('is-on'); });
  }

  /* ── scroll driver ───────────────────────────────────────── */
  (function () {
    var ticking = false;
    function run() { ticking = false; nav.update(scrollY); }
    addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(run);
    }, { passive: true });
    addEventListener('resize', run);
    run();
  })();

  /* ── boot ────────────────────────────────────────────────── */
  document.getElementById('year').textContent = String(new Date().getFullYear());

  // Stagger values for the hero's clip reveal.
  document.querySelectorAll('[data-rise]').forEach(function (el) {
    el.style.setProperty('--rise', el.getAttribute('data-rise'));
  });

  lang.apply(store.get('lang') === 'en' ? 'en' : 'ar');
  lang.onChange(function () { nav.update(scrollY); });

  considerLattice();
  mountPointer();

  // Deep-link handling lives in the in-page navigation module above.

  function release() { root.classList.add('is-ready'); }
  requestAnimationFrame(function () { requestAnimationFrame(release); });
  setTimeout(release, 500);
})();
