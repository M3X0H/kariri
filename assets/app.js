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
      metaDesc: 'أخصائي تقنية معلومات في الرياض، معتمد من الهيئة السعودية للمهندسين كأخصائي علوم حاسب. دعم فني، أنظمة، شبكات، أجهزة، ومراقبة CCTV.',

      skip: 'تخطّي إلى المحتوى',
      brand: 'محمد كريري',
      nav_menu: 'القائمة',
      nav_home: 'الرئيسية',
      nav_about: 'نبذة',
      nav_caps: 'القدرات',
      nav_career: 'المسار',
      nav_work: 'الأعمال',
      nav_cred: 'الاعتمادات',
      nav_contact: 'تواصل',
      lang_switch: 'التبديل إلى الإنجليزية',
      theme_switch: 'تبديل المظهر',

      meta_role: 'أخصائي تقنية معلومات',
      meta_open: 'متاح للعمل',
      hero_first: 'محمد',
      hero_last: 'كريري',
      hero_say: 'أُشغّل الأنظمة التي يعتمد عليها يوم العمل — دعمًا وشبكاتٍ وأجهزةً ومراقبة.',
      plate_cap: 'معتمد من الهيئة السعودية للمهندسين',
      cue: 'مرّر للأسفل',

      say_1: 'أُبقي الأنظمة',
      say_2: 'تعمل،',
      say_3: 'والناس تُنجز.',
      about_1: 'خريج علوم الحاسب من جامعة تبوك، ومعتمد من الهيئة السعودية للمهندسين كأخصائي علوم حاسب. عملي يبدأ حيث تلتقي الأنظمة بالناس: موظف لا يستطيع الطباعة، شبكة تتقطع، كاميرا توقفت عن التسجيل.',
      about_2: 'أميل إلى المشاكل المتكررة أكثر من العاجلة: العاجل يُغلق تذكرة، والمتكرر يُغلق سببه. هكذا ينتقل الدعم من ردّ فعل إلى إجراء ثابت.',
      f1_k: 'التعليم',
      f1_v: 'بكالوريوس علوم الحاسب — جامعة تبوك، 2025',
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
      j1_b1: 'نقطة الاتصال الأولى لأي عطل تقني يوقف موظفًا عن عمله.',
      j1_b2: 'صيانة دورية وطارئة للحواسيب والطابعات والملحقات.',
      j1_b3: 'إدارة ومراقبة أنظمة CCTV لضمان أمن المواقع.',
      j1_b4: 'دعم شامل للأنظمة واتصالات الشبكة.',
      more: 'الأثر والمسؤوليات',
      j1_impact: 'مكتب تقنية معلومات واحد يخدم أربع شركات تحت إدارة واحدة. هذا يعني ترتيب الأولويات بين أربعة أماكن عمل في اليوم نفسه، وتحويل كل عطل يتكرر إلى إجراء ثابت بدل معالجته من جديد في كل مرة.',
      j1_i1: 'دعم عن بُعد عبر AnyDesk لموظفين داخل الرياض وخارجها.',
      j1_i2: 'الإنترنت والشبكات والأجهزة والطابعات والأنظمة من نقطة واحدة.',
      j1_i3: 'اقتراحات تطويرية للإدارة، وإنهاء مشاكل متكررة في قسم تقنية المعلومات.',
      j1_i4: 'استجابة سريعة وتعاون مباشر مع الموظفين.',
      edu_deg: 'بكالوريوس علوم الحاسب',
      edu_org: 'جامعة تبوك',
      edu_kind: 'تعليم',
      edu_b1: 'معترف بها رسميًا من الهيئة السعودية للمهندسين كأخصائي علوم حاسب.',
      edu_b2: 'التركيز: هندسة البرمجيات، وقواعد البيانات العلائقية، وأساسيات الشبكات والدعم الفني.',
      j2_role: 'متدرّب تقنية معلومات',
      j2_org: 'تجمع تبوك الصحي',
      j2_kind: 'تدريب',
      j2_b1: 'المساعدة في إصلاح أعطال الحواسيب والأجهزة المحمولة واستكشافها.',
      j2_b2: 'تحديد أخطاء الأنظمة ومعالجتها دعمًا للبنية الرقمية للمنشأة.',
      j2_b3: 'العمل مع فريق تقنية المعلومات على حلول ترفع جودة الخدمة.',

      work_tag: 'أعمال مختارة',
      p1_t: 'هذا الموقع',
      p1_d: 'موقع ثابت بلا إطار عمل وبلا اعتماديات. عربي وإنجليزي بقلب كامل لاتجاه الصفحة، ووضع فاتح وداكن، ومجسّم ثلاثي الأبعاد مرسوم بحسابات إسقاط مكتوبة يدويًا على canvas. يعمل بالكامل من لوحة المفاتيح، ويحترم تقليل الحركة.',
      p_stack: 'التقنيات',
      p_focus: 'التركيز',
      p_code: 'الكود المصدري',
      p_live: 'أنت تتصفّحه الآن',
      soon: 'مشاريع أخرى قيد التطوير. أنشرها على GitHub أولًا بأول.',

      cred_tag: 'الاعتمادات',
      cred_o: 'الهيئة السعودية للمهندسين — 2025',

      end_1: 'لنبنِ شيئًا',
      end_2: 'يستحق التشغيل.',
      end_say: 'متاح لفرص في الدعم الفني وتقنية المعلومات. واتساب أسرع وسيلة للوصول إليّ — وأرد عادةً في نفس اليوم.',
      way_cv: 'السيرة الذاتية',
      way_call: 'اتصال مباشر',
      portrait_alt: 'محمد إسماعيل كريري — أخصائي تقنية معلومات',
      foot_name: 'محمد إسماعيل كريري'
    },

    en: {
      metaTitle: 'Mohammed Ismail Kariri — IT Specialist',
      metaDesc: 'IT Specialist in Riyadh, recognized by the Saudi Council of Engineers as a Computer Science Specialist. IT support, systems, networking, hardware, and CCTV.',

      skip: 'Skip to content',
      brand: 'Mohammed Kariri',
      nav_menu: 'Menu',
      nav_home: 'Home',
      nav_about: 'About',
      nav_caps: 'Capabilities',
      nav_career: 'Career',
      nav_work: 'Work',
      nav_cred: 'Credentials',
      nav_contact: 'Contact',
      lang_switch: 'Switch to Arabic',
      theme_switch: 'Switch theme',

      meta_role: 'IT Specialist',
      meta_open: 'Open to work',
      hero_first: 'MOHAMMED',
      hero_last: 'KARIRI',
      hero_say: 'I keep the systems a workday depends on running — support, networks, hardware, and surveillance.',
      plate_cap: 'Recognized by the Saudi Council of Engineers',
      cue: 'Scroll',

      say_1: 'I keep systems',
      say_2: 'running,',
      say_3: 'and people working.',
      about_1: 'Computer Science graduate from the University of Tabuk, recognized by the Saudi Council of Engineers as a Computer Science Specialist. My work starts where systems meet people: someone who cannot print, a connection that keeps dropping, a camera that stopped recording.',
      about_2: 'I gravitate toward recurring problems more than urgent ones: urgent closes a ticket, recurring closes the reason for it. That is how support turns from reaction into procedure.',
      f1_k: 'Education',
      f1_v: 'B.Sc. Computer Science — University of Tabuk, 2025',
      f2_k: 'Recognition',
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
      j1_b1: 'First point of contact for any technical fault that stopped someone working.',
      j1_b2: 'Routine and emergency maintenance for computers, printers, and peripherals.',
      j1_b3: 'Managed and monitored CCTV systems to keep sites secure.',
      j1_b4: 'End-to-end support for systems and network connectivity.',
      more: 'Impact & responsibilities',
      j1_impact: 'One IT desk serving four companies under a single ownership. That meant triaging four workplaces on the same day, and turning every fault that came back into a fixed procedure instead of solving it from scratch each time.',
      j1_i1: 'Remote support over AnyDesk for staff inside and outside Riyadh.',
      j1_i2: 'Internet, networking, hardware, printers, and systems from one point of contact.',
      j1_i3: 'Improvement proposals to management, and recurring IT department issues closed for good.',
      j1_i4: 'Fast response and direct collaboration with staff.',
      edu_deg: 'B.Sc. Computer Science',
      edu_org: 'University of Tabuk',
      edu_kind: 'Education',
      edu_b1: 'Officially recognized by the Saudi Council of Engineers as a Computer Science Specialist.',
      edu_b2: 'Focus: software engineering, relational databases, networking fundamentals, and IT support.',
      j2_role: 'IT Trainee',
      j2_org: 'Tabuk Health Cluster',
      j2_kind: 'Internship',
      j2_b1: 'Assisted in repairing and troubleshooting computer hardware and mobile devices.',
      j2_b2: 'Identified and resolved system errors, supporting the facility\'s digital infrastructure.',
      j2_b3: 'Worked with the IT team on solutions that raised service quality.',

      work_tag: 'Selected work',
      p1_t: 'This site',
      p1_d: 'A static site with no framework and no dependencies. Arabic and English with a full page-direction flip, light and dark themes, and a three-dimensional lattice drawn from hand-written projection maths on canvas. Fully keyboard-operable, and it respects reduced motion.',
      p_stack: 'Stack',
      p_focus: 'Focus',
      p_code: 'Source code',
      p_live: 'You are looking at it',
      soon: 'More projects in development. I publish them on GitHub as they land.',

      cred_tag: 'Credentials',
      cred_o: 'Saudi Council of Engineers — 2025',

      end_1: 'Let’s build something',
      end_2: 'worth running.',
      end_say: 'Open to IT support and IT specialist roles. WhatsApp is the fastest way to reach me — I usually reply the same day.',
      way_cv: 'CV',
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

    // Dark is the identity and the default; light is the opt-in.
    function current() {
      return root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    }

    function paint() {
      var dark = current() === 'dark';
      ico.setAttribute('href', dark ? '#i-sun' : '#i-moon');
      btn.setAttribute('aria-pressed', String(dark));
      if (meta) meta.setAttribute('content', dark ? '#07080d' : '#efeee9');
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


  /* ── reveal ──────────────────────────────────────────────────
     One observer for the whole page. `.reveal` is a plain rise;
     `data-in` adds a direction, and `data-in-stagger` hands the
     animation to the children so a list arrives as a list rather
     than as one block.
     ──────────────────────────────────────────────────────────── */
  var reveal = (function () {
    /* A unit is whatever actually receives `is-in`. For most elements
       that is the element itself. For a `data-in-each` container it is
       each child, given its own observer — so a long list arrives item
       by item as you reach it, rather than all at once the moment the
       container's top edge clears. */
    var all = [];

    [].forEach.call(document.querySelectorAll('.reveal, [data-in]'), function (host) {
      if (!host.hasAttribute('data-in-each')) {
        if (all.indexOf(host) < 0) all.push(host);
        return;
      }

      // The stylesheet hangs every child's start state off
      // `[data-in-stagger] > *`, so the attribute has to be present even
      // when the offset is zero, or the children never start hidden.
      if (!host.hasAttribute('data-in-stagger')) host.setAttribute('data-in-stagger', '0');
      var step = parseFloat(host.getAttribute('data-in-stagger')) || 0;

      [].forEach.call(host.children, function (child, i) {
        // Modulo rather than the running index: with one observer per
        // child the sequence already comes from the scroll itself, and a
        // cumulative delay would leave the eleventh row waiting half a
        // second after it is plainly on screen.
        if (step > 0) child.style.setProperty('--d', ((i % 4) * step) + 'ms');
        if (all.indexOf(child) < 0) all.push(child);
      });
    });

    function show(el) {
      if (el.classList.contains('is-in')) return;

      var stagger = parseFloat(el.getAttribute('data-in-stagger'));
      if (stagger > 0) {
        [].forEach.call(el.children, function (child, i) {
          child.style.setProperty('--d', (i * stagger) + 'ms');
          child.classList.add('is-in');
        });
      }

      var delay = parseFloat(el.getAttribute('data-in-delay'));
      if (delay > 0) el.style.setProperty('--d', delay + 'ms');
      el.classList.add('is-in');
    }

    function showAll() { all.forEach(show); }

    if (!('IntersectionObserver' in window) || mLessMotion.matches) {
      showAll();
      return { showAll: showAll };
    }

    /* threshold 0 with only a shallow bottom inset. Anything deeper
       leaves a band at the foot of the viewport where an element is on
       screen but has not been told to reveal — which a jump straight to
       an anchor lands in, and never recovers from. */
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        show(e.target.revealFor || e.target);
        io.unobserve(e.target);
      });
    }, { threshold: 0, rootMargin: '0px 0px -24px 0px' });

    /* A .mask__in waits at translateY(105%), which parks it completely
       outside its own mask's overflow box. The observer clips a target
       against its ancestors, so that element reports zero intersection
       for good and would never be told to rise. Watch the mask — which
       never moves — and reveal the line it holds. */
    all.forEach(function (el) {
      var watch = el;
      if (el.classList.contains('mask__in') && el.parentNode) {
        watch = el.parentNode;
        watch.revealFor = el;
      }
      io.observe(watch);
    });
    return { showAll: showAll };
  })();

  /* ── magnetic ────────────────────────────────────────────────
     Controls lean toward the pointer while it is over them, and spring
     back when it leaves. The pull is written to --mx/--my and applied
     with `translate`, which leaves `transform` free for the hover indent
     already on these rows. Fine pointers only: a thumb has no hover
     state to lead with.
     ──────────────────────────────────────────────────────────── */
  (function () {
    if (mLessMotion.matches || !mFinePointer.matches) return;

    var cap = function (v, a, b) { return v < a ? a : v > b ? b : v; };
    var pull = [].slice.call(document.querySelectorAll('.way, .lnk, .ctl, .hero__cue'));

    pull.forEach(function (el) {
      el.classList.add('magnetic');

      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        if (!r.width || !r.height) return;
        // Capped hard: a full-width contact row tracking the pointer
        // one-to-one would drag itself out from under the cursor that is
        // steering it.
        el.style.setProperty('--mx',
          cap(((e.clientX - r.left) / r.width - 0.5) * 26, -13, 13).toFixed(1) + 'px');
        el.style.setProperty('--my',
          cap(((e.clientY - r.top) / r.height - 0.5) * 14, -7, 7).toFixed(1) + 'px');
        el.classList.add('is-pulled');
      }, { passive: true });

      el.addEventListener('pointerleave', function () {
        el.classList.remove('is-pulled');
        el.style.setProperty('--mx', '0px');
        el.style.setProperty('--my', '0px');
      }, { passive: true });
    });
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
    var onScreen = true;
    var yaw = 0, pitch = 0, tYaw = 0, tPitch = 0, spin = 0, scrollK = 0, bob = 0;
    var inkRGB = '238,241,247', accentRGB = '56,189,248', accent2RGB = '129,140,248';

    // Reused scratch for the edge batching in step(); never reallocated.
    var BUCKETS = 6, bucket = [];
    for (var q0 = 0; q0 < BUCKETS; q0++) bucket.push([]);

    function readInk() {
      var cs = getComputedStyle(root);
      inkRGB = toRGB(cs.getPropertyValue('--ink')) || inkRGB;
      accentRGB = toRGB(cs.getPropertyValue('--accent')) || accentRGB;
      accent2RGB = toRGB(cs.getPropertyValue('--accent-2')) || accent2RGB;
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

      /* Capped at 1.5 rather than 2. The lattice is hairlines and small
         discs over most of the viewport, so the backing store dominates
         its cost — and 2x quadruples the pixels for a difference you
         cannot see on strokes this thin. */
      dpr = Math.min(devicePixelRatio || 1, 1.5);
      w = Math.round(r.width);
      h = Math.round(r.height);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build(mCompact.matches ? 90 : 150);
      return true;
    }

    /* Stepped by the engine's frame rather than owning a loop, so the
       page has exactly one rAF. dt keeps the drift rate honest on a
       slow frame, and the scroll rate spins the object as you move. */
    function step(dt, rate) {
      if (!onScreen || !w || !h) return;

      spin += dt * 0.0001 + (rate || 0) * 0.0006;
      yaw += (tYaw - yaw) * 0.05;
      pitch += (tPitch - pitch) * 0.05;

      ctx.clearRect(0, 0, w, h);

      // Sit opposite the name rather than behind it: the name hugs the
      // inline-end edge, so the object anchors the opposite side and the
      // two balance instead of colliding. Narrow screens stack, so it
      // recentres there.
      /* A slow, continuous drift, independent of the spin — two sines at
         unrelated periods so the object never visibly repeats. Small
         enough to read as the thing hanging in space rather than as an
         animation playing. */
      bob += dt * 0.00035;
      var floatX = Math.sin(bob) * 0.014;
      var floatY = Math.sin(bob * 0.73 + 1.1) * 0.018;

      var rtl = root.getAttribute('dir') !== 'ltr';
      var narrow = mCompact.matches;
      var cx = (narrow ? w * 0.42 : w * (rtl ? 0.30 : 0.70)) + w * floatX;
      // On narrow screens everything stacks, so the object rides up behind
      // the name instead of cutting through the portrait and body copy.
      var cy = (narrow ? h * 0.30 : h * 0.5) + h * floatY;
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

      /* Every edge wants its own depth alpha, but at 150 nodes that is
         ~400 strokeStyle changes and ~400 stroke() calls a frame.
         Bucketing the alphas collapses it to one path per bucket, which
         is indistinguishable on screen and far cheaper. */
      ctx.lineWidth = 1;
      for (var q = 0; q < BUCKETS; q++) bucket[q].length = 0;

      for (var e = 0; e < edges.length; e++) {
        var a = proj[edges[e][0]], b = proj[edges[e][1]];
        var depth = 1 - (a.d + b.d) / 2;
        var slot = Math.min(BUCKETS - 1, Math.floor(depth * BUCKETS));
        bucket[slot].push(a.x, a.y, b.x, b.y);
      }

      for (var g = 0; g < BUCKETS; g++) {
        var seg = bucket[g];
        if (!seg.length) continue;
        var alpha = (0.07 + ((g + 0.5) / BUCKETS) * 0.34) * fade;
        ctx.strokeStyle = 'rgba(' + inkRGB + ',' + alpha.toFixed(3) + ')';
        ctx.beginPath();
        for (var s = 0; s < seg.length; s += 4) {
          ctx.moveTo(seg[s], seg[s + 1]);
          ctx.lineTo(seg[s + 2], seg[s + 3]);
        }
        ctx.stroke();
      }

      for (var n = 0; n < proj.length; n++) {
        var q = proj[n];
        var front = 1 - q.d;
        var lit = n % 17 === 0, alt = n % 11 === 0;
        ctx.fillStyle = lit
          ? 'rgba(' + accentRGB + ',' + ((0.30 + front * 0.65) * fade).toFixed(3) + ')'
          : alt
            ? 'rgba(' + accent2RGB + ',' + ((0.20 + front * 0.55) * fade).toFixed(3) + ')'
            : 'rgba(' + inkRGB + ',' + ((0.12 + front * 0.45) * fade).toFixed(3) + ')';
        ctx.beginPath();
        ctx.arc(q.x, q.y, (lit ? 2.3 : 1.4) * q.k, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function onPointer(e) {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      tYaw = ((e.clientX / innerWidth) - 0.5) * 1.1;
      tPitch = ((e.clientY / innerHeight) - 0.5) * -0.7;
    }

    var resizeTimer;
    function onResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 160);
    }

    addEventListener('pointermove', onPointer, { passive: true });
    addEventListener('resize', onResize);

    // The hero is the only place this is drawn, so once it is off screen
    // there is nothing to paint — the engine keeps running for the rest
    // of the page, this simply stops contributing to the frame.
    var io = null;
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(function (en) {
        onScreen = en[0].isIntersecting;
        if (!onScreen) ctx.clearRect(0, 0, w, h);
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

    // Retry until the element actually has a box, for engines that run
    // deferred scripts before first layout.
    if (!resize()) requestAnimationFrame(function () { resize(); });

    return {
      step: step,
      // The hero's own scroll progress, handed over by the engine so the
      // object tips as the section leaves without a second layout read.
      setScroll: function (k) { scrollK = k; },
      destroy: function () {
        removeEventListener('pointermove', onPointer);
        removeEventListener('resize', onResize);
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
    var tilts = [].slice.call(document.querySelectorAll('[data-tilt]'));
    var px = innerWidth / 2, py = innerHeight / 2, cx = px, cy = py;
    var wide = false, raf = 0, moved = false;

    dot.classList.add('is-on');

    function tick() {
      raf = 0;

      // read — every measurement first, so no write can force a reflow
      // in the middle of the batch below
      var plateRect = (moved && depth) ? plate.getBoundingClientRect() : null;
      var tiltRects = null;
      if (moved && tilts.length) {
        tiltRects = tilts.map(function (el) {
          var r = el.getBoundingClientRect();
          return (r.bottom < -200 || r.top > innerHeight + 200) ? null : r;
        });
      }

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

        // Shallow: enough to read as a plane in space, not enough to
        // look like a novelty card. Neutralised once the pointer is
        // outside the element, so it settles rather than sticking.
        if (tiltRects) {
          for (var i = 0; i < tilts.length; i++) {
            var tr = tiltRects[i];
            if (!tr) continue;
            var inside = px >= tr.left && px <= tr.right && py >= tr.top && py <= tr.bottom;
            var el = tilts[i];
            if (!inside) {
              el.style.setProperty('--rx', '0deg');
              el.style.setProperty('--ry', '0deg');
              continue;
            }
            el.style.setProperty('--rx',
              (((py - tr.top) / tr.height - 0.5) * -7).toFixed(2) + 'deg');
            el.style.setProperty('--ry',
              (((px - tr.left) / tr.width - 0.5) * 7).toFixed(2) + 'deg');
          }
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

  /* ── engine ──────────────────────────────────────────────────
     The only scroll listener and the only continuous rAF on the page.
     Each frame it reads layout once, then writes custom properties
     that the stylesheet turns into movement:

       --p     reading position on the rail
       --t     a tracked section's own progress (drives the hero exit)
       --f     the career rail's fill
       --py    parallax offset, per element
       --cy    the project wireframe's drift inside its frame
       --bandx the marquee's offset
       --ah/--as/--al  ambient hue, eased toward the live section

     The lattice is stepped from here too, so pointer and scroll input
     cost one listener each rather than one per effect.
     ──────────────────────────────────────────────────────────── */
  var engine = (function () {
    var read = document.getElementById('read');
    var aura = document.getElementById('aura');
    var tracks = [].slice.call(document.querySelectorAll('[data-track]'));
    var parallax = [].slice.call(document.querySelectorAll('[data-par]'));
    var auraSecs = [].slice.call(document.querySelectorAll('[data-aura]'));
    // The <ol>, not the <section> — #career is the section's nav anchor,
    // and two elements sharing that id would silently hand this the
    // wrong one, so the list carries its own.
    var career = document.getElementById('careerTrack');
    var stops = [].slice.call(document.querySelectorAll('.stop'));
    var frame = document.querySelector('.proj__frame');
    var strip = document.getElementById('strip');

    var liveStop = null, activeSec = null;
    var lastY = scrollY, rate = 0;
    var stripX = 0, stripSpan = 0;
    var dirty = true, running = false, last = 0;

    var hue = { h: 199, s: 90, l: 55 };
    var hueTo = { h: 199, s: 90, l: 55 };
    var wrote = '';

    var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
    var lerp = function (a, b, t) { return a + (b - a) * t; };

    function measure() {
      // The strip's markup is duplicated, so half of it is one clean loop.
      if (strip) stripSpan = strip.scrollWidth / 2;
    }

    function mark() { dirty = true; }

    function pass() {
      var y = scrollY, vh = innerHeight;
      var max = root.scrollHeight - vh;

      nav.update(y);
      if (read) read.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : 0);

      for (var t = 0; t < tracks.length; t++) {
        var el = tracks[t], r = el.getBoundingClientRect();
        if (el.getAttribute('data-track') === 'hero') {
          // How far the hero has scrolled past the top edge.
          var tv = clamp(-r.top / Math.max(1, r.height), 0, 1);
          el.style.setProperty('--t', tv.toFixed(4));
          if (lattice) lattice.setScroll(tv);
        } else {
          // Fills from the moment the block reaches mid-viewport until
          // its end passes the same line.
          el.style.setProperty('--f',
            clamp((vh * 0.55 - r.top) / Math.max(1, r.height), 0, 1).toFixed(4));
        }
      }

      for (var p = 0; p < parallax.length; p++) {
        var pe = parallax[p], pr = pe.getBoundingClientRect();
        if (pr.bottom < -200 || pr.top > vh + 200) continue;
        var f = parseFloat(pe.getAttribute('data-par')) || 0;
        var mid = (pr.top + pr.height / 2) - vh / 2;
        // Clamped, so a long page can never push an element out of reach.
        pe.style.setProperty('--py', clamp(mid * f, -80, 80).toFixed(1) + 'px');
      }

      if (frame) {
        var fr = frame.getBoundingClientRect();
        if (fr.bottom > -200 && fr.top < vh + 200) {
          var through = clamp((vh - fr.top) / (vh + fr.height), 0, 1);
          frame.style.setProperty('--cy', ((through - 0.5) * -40).toFixed(1) + 'px');
        }
      }

      // The ambient hue follows whichever data-aura section is nearest
      // the top of the viewport.
      var near = null, best = Infinity;
      for (var s = 0; s < auraSecs.length; s++) {
        var sr = auraSecs[s].getBoundingClientRect();
        var d = Math.abs(sr.top - vh * 0.3);
        if (sr.top <= vh * 0.6 && d < best) { best = d; near = auraSecs[s]; }
      }
      if (!near) near = auraSecs[0];
      if (near && near !== activeSec) {
        activeSec = near;
        var raw = (near.getAttribute('data-aura') || '199 90% 55%').split(/\s+/);
        hueTo = { h: parseFloat(raw[0]) || 199, s: parseFloat(raw[1]) || 90, l: parseFloat(raw[2]) || 55 };
      }

      if (career && stops.length) {
        var cr = career.getBoundingClientRect();
        var tracking = cr.top < vh * 0.7 && cr.bottom > vh * 0.3;
        career.classList.toggle('is-tracking', tracking);

        if (tracking) {
          var pick = null, closest = Infinity;
          for (var k = 0; k < stops.length; k++) {
            var kr = stops[k].getBoundingClientRect();
            var gap = Math.abs((kr.top + kr.height / 2) - vh * 0.45);
            if (gap < closest) { closest = gap; pick = stops[k]; }
          }
          if (pick !== liveStop) {
            stops.forEach(function (st) { st.classList.toggle('is-live', st === pick); });
            liveStop = pick;
          }
        }
      }

      // Written on the layer itself, not on :root — these change every
      // scrolled frame and only .paper__aura reads them.
      if (aura) {
        var g = max > 0 ? y / max : 0;
        aura.style.setProperty('--ax', (76 - g * 26).toFixed(1) + '%');
        aura.style.setProperty('--ay', (14 + g * 44).toFixed(1) + '%');
        aura.style.setProperty('--bx', (14 + g * 30).toFixed(1) + '%');
        aura.style.setProperty('--by', (74 - g * 40).toFixed(1) + '%');
      }
    }

    function tick(now) {
      if (!running) return;
      var dt = Math.min(now - last, 50) || 16;
      last = now;

      var y = scrollY;
      rate = lerp(rate, y - lastY, 0.16);
      lastY = y;

      if (dirty) { dirty = false; pass(); }

      if (!mLessMotion.matches) {
        var k = clamp(dt * 0.0018, 0, 0.08);
        var dh = ((hueTo.h - hue.h + 540) % 360) - 180;   // shortest way round
        hue.h = (hue.h + dh * k + 360) % 360;
        hue.s = lerp(hue.s, hueTo.s, k);
        hue.l = lerp(hue.l, hueTo.l, k);

        var stamp = hue.h.toFixed(1) + hue.s.toFixed(1) + hue.l.toFixed(1);
        if (stamp !== wrote) {
          wrote = stamp;
          root.style.setProperty('--ah', hue.h.toFixed(1));
          root.style.setProperty('--as', hue.s.toFixed(1) + '%');
          root.style.setProperty('--al', hue.l.toFixed(1) + '%');
          root.style.setProperty('--bh', ((hue.h + 62) % 360).toFixed(1));
        }

        // The strip answers to scroll: faster when you move, reversing
        // when you do. The base drift keeps it alive when you are still.
        if (strip && stripSpan > 0) {
          stripX -= (dt * 0.02) + rate * 0.5;
          if (stripX <= -stripSpan) stripX += stripSpan;
          if (stripX > 0) stripX -= stripSpan;
          strip.style.setProperty('--bandx', stripX.toFixed(1) + 'px');
        }
      }

      if (lattice) lattice.step(dt, rate);
      requestAnimationFrame(tick);
    }

    function start() {
      if (running) return;
      running = true;
      last = performance.now();
      requestAnimationFrame(tick);
    }

    addEventListener('scroll', mark, { passive: true });
    addEventListener('resize', function () { measure(); mark(); });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) running = false;
      else { mark(); start(); }
    });

    return { mark: mark, start: start, measure: measure, pass: pass };
  })();

  /* ── count-in ────────────────────────────────────────────────
     Runs to 100 over about a second, then wipes. `clear` is idempotent
     and also fires on a hard timer, so nothing about the page's state
     can leave a visitor stuck behind the overlay.
     ──────────────────────────────────────────────────────────── */
  function countIn(done) {
    var boot = document.getElementById('boot');
    var n = document.getElementById('bootN');
    var bar = document.getElementById('bootBar');

    if (!boot || mLessMotion.matches) {
      if (boot) boot.classList.add('boot--gone');
      done();
      return;
    }

    var span = 950, started = performance.now(), cleared = false;

    function clear() {
      if (cleared) return;
      cleared = true;
      boot.classList.add('boot--gone');
      done();
      setTimeout(function () {
        if (boot.parentNode) boot.parentNode.removeChild(boot);
      }, 1000);
    }

    function tick(now) {
      var p = Math.min((now - started) / span, 1);
      var eased = 1 - Math.pow(1 - p, 3);   // slows as it lands
      n.textContent = String(Math.round(eased * 100)).padStart(3, '0');
      bar.style.setProperty('--p', eased.toFixed(3));
      if (p < 1) requestAnimationFrame(tick);
      else setTimeout(clear, 80);
    }

    requestAnimationFrame(tick);
    setTimeout(clear, 2000);   // the backstop
  }

  /* ── letter split ────────────────────────────────────────────
     Wraps each character of a [data-split] line so the name can arrive
     letter by letter.

     Latin only, and deliberately so: Arabic is cursive, and every
     letter's drawn form depends on the letters either side of it. Each
     glyph in its own inline box breaks those joins — "محمد" comes apart
     into four isolated shapes. So Arabic keeps the whole-line rise, and
     `is-split` is only ever set on text with no Arabic in it.
     ──────────────────────────────────────────────────────────── */
  function splitLines() {
    var arabic = /[؀-ۿݐ-ݿﭐ-﻿]/;

    [].forEach.call(document.querySelectorAll('[data-split]'), function (el) {
      var text = (el.getAttribute('data-text') || el.textContent).trim();

      // Stash the original once, so a language switch can re-split from
      // clean text rather than from a DOM full of previous spans.
      if (!el.hasAttribute('data-text')) el.setAttribute('data-text', text);

      if (arabic.test(text)) {
        el.classList.remove('is-split');
        el.textContent = text;
        return;
      }

      el.textContent = '';
      el.classList.add('is-split');

      text.split('').forEach(function (chr, i) {
        if (chr === ' ') {
          el.appendChild(document.createTextNode(' '));
          return;
        }
        var span = document.createElement('span');
        span.className = 'ch';
        span.style.setProperty('--ci', i);
        span.textContent = chr;
        el.appendChild(span);
      });
    });
  }

  /* ── boot ────────────────────────────────────────────────── */
  document.getElementById('year').textContent = String(new Date().getFullYear());

  // Stagger values for the hero's clip reveal.
  document.querySelectorAll('[data-rise]').forEach(function (el) {
    el.style.setProperty('--rise', el.getAttribute('data-rise'));
  });

  lang.apply(store.get('lang') === 'en' ? 'en' : 'ar');
  lang.onChange(function () {
    // apply() rewrote textContent, so the spans are gone; rebuild them.
    document.querySelectorAll('[data-split]').forEach(function (el) {
      el.removeAttribute('data-text');
    });
    splitLines();
    engine.measure();
    engine.mark();
  });

  splitLines();

  considerLattice();
  mountPointer();

  engine.measure();
  engine.pass();
  engine.start();

  countIn(function () { root.classList.add('is-ready'); });

  // Fonts land after first paint and reflow the copy; re-measure once.
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { engine.measure(); engine.mark(); });
  }

  // Deep-link handling lives in the in-page navigation module above.
})();
