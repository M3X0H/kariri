/* ═══════════════════════════════════════════════════════════════
   Every string the site renders, in both languages.

   The facts here are the real ones — roles, dates, employers,
   credentials and the single real project. The wording around them is
   written for this site; the substance is not invented.

   Two rules this file is held to:

   1. The IT Specialist post ran Jun–Dec 2025. It is written in the
      past tense throughout. Nothing here claims it is current.
   2. AI, automation and the business side are written as direction,
      never as experience. Every one of them is anchored to something
      already proved elsewhere on this page — a degree, a desk, a
      certificate. See `direction.items[].fromV`.
   ═══════════════════════════════════════════════════════════════ */

export type Lang = 'ar' | 'en';

export const LINKS = {
  whatsapp: 'https://wa.me/966506036322',
  phone: 'tel:+966506036322',
  phoneLabel: '+966 50 603 6322',
  email: 'mailto:m.e.k05060@gmail.com',
  emailLabel: 'm.e.k05060@gmail.com',
  linkedin: 'https://www.linkedin.com/in/mohammed-kariri-27665b200',
  github: 'https://github.com/M3X0H',
  repo: 'https://github.com/M3X0H/kariri',
  live: 'https://m3x0h.github.io/kariri/',
  cv: './CVMK.pdf',
  portrait: './me.jpg'
} as const;

/* The capability graph. `links` are indices of related capabilities —
   hovering one lights the others, which is the whole point of the
   ecosystem rather than a grid of badges. */
export const CAPABILITIES = [
  { id: 'support', tech: ['Windows', 'Troubleshooting', 'AnyDesk', 'Remote Support'], links: [1, 2, 3] },
  { id: 'systems', tech: ['System Administration', 'Monitoring'], links: [0, 2, 4] },
  { id: 'network', tech: ['LAN', 'TCP/IP', 'Internet', 'Diagnostics'], links: [0, 1, 4] },
  { id: 'hardware', tech: ['PCs', 'Printers', 'Mobile Devices', 'Repair'], links: [0, 4] },
  { id: 'cctv', tech: ['Surveillance', 'Site Security', 'Monitoring'], links: [1, 2, 3] },
  { id: 'dev', tech: ['Java', 'OOP', 'SQL', 'RDBMS', 'HTML/CSS', 'Android'], links: [1] }
] as const;

export const STACK = [
  'Windows', 'AnyDesk', 'LAN', 'TCP/IP', 'CCTV', 'Printers',
  'Java', 'SQL', 'RDBMS', 'Android', 'HTML', 'CSS', 'Git', 'GitHub', 'VS Code'
];

type Dict = {
  meta: { title: string; desc: string };
  nav: {
    home: string; about: string; caps: string; career: string;
    work: string; direction: string; contact: string; menu: string; lang: string;
  };
  skip: string;
  brand: string;
  loading: string;

  hero: {
    first: string; last: string; role: string; field: string;
    open: string; place: string;
    /** The one line a recruiter is guaranteed to read. */
    claim: string;
    /** Where it is going next — set quieter than the claim on purpose. */
    next: string;
    cue: string; cta: string; cv: string; see: string;
  };
  /* The rail under the name. `focus` replaced `languages` here: the
     languages are already stated in `about.facts`, and the direction was
     not stated anywhere above the fold. */
  spec: { role: string; base: string; since: string; focus: string; roleV: string; baseV: string; sinceV: string; focusV: string };

  statement: { l1: string; l2: string };
  stackTag: string;

  /* The three faults are the ones already named in `about.p1` — the same
     examples, pulled out so the page can walk through them one at a time
     instead of burying them in a clause. Nothing new is claimed. */
  fault: {
    tag: string;
    lead: string;
    items: { code: string; state: string; line: string }[];
  };

  about: {
    tag: string;
    p1: string;
    p2: string;
    facts: { k: string; v: string }[];
    /* Counted from what is already on this page — certifications listed,
       capability areas, and the companies the one IT desk covered. */
    stats: { n: number; k: string }[];
  };

  caps: {
    tag: string;
    lead: string;
    /* The map's own affordance line, and the labels on its core node. */
    hint: string;
    core: string;
    coreRole: string;
    /** `group` is the professional category the node belongs to. */
    items: { name: string; group: string; desc: string }[];
  };
  career: {
    tag: string;
    entries: { year: string; span: string; kind: string; role: string; org: string; points: string[]; impact?: string }[];
  };
  work: {
    tag: string;
    project: {
      no: string; kind: string; title: string; desc: string;
      stack: string; focus: string; live: string; code: string;
      notesTag: string; notes: string[];
    };
    soon: string;
  };
  cred: { tag: string; lead: string; leadBy: string; all: string; items: string[] };

  /* Where he is heading. Every vector carries a `fromV` naming the real
     thing it grows out of, and `honest` says plainly that these are
     directions rather than posts held. Both are load-bearing: without
     them this chapter is ambition with nothing under it. */
  direction: {
    tag: string;
    lead: string;
    honest: string;
    fromK: string;
    items: { name: string; desc: string; fromV: string }[];
    /* Two lines, not one sentence: `.mask-line` clips a wrapped block's
       descenders, and the fault chapter closes on exactly this shape.
       The rhyme is the point — 00 and 06 answer each other. */
    close: { l1: string; l2: string };
  };

  contact: { tag: string; l1: string; l2: string; say: string; cta: string; ways: { k: string; v: string }[] };
  footer: { name: string; built: string; strip: string[] };
  portraitAlt: string;
};

export const COPY: Record<Lang, Dict> = {
  ar: {
    meta: {
      title: 'محمد كريري — أخصائي تقنية معلومات',
      desc: 'أخصائي تقنية معلومات في الرياض، خريج علوم حاسب ومعتمد من الهيئة السعودية للمهندسين. دعم فني وأنظمة وشبكات وأجهزة ومراقبة، ووجهة نحو الذكاء الاصطناعي والأتمتة.'
    },
    nav: {
      home: 'البداية', about: 'نبذة', caps: 'القدرات', career: 'الخبرة',
      work: 'العمل', direction: 'الاتجاه', contact: 'تواصل',
      menu: 'القائمة', lang: 'التبديل إلى الإنجليزية'
    },
    skip: 'تخطّي إلى المحتوى',
    brand: 'محمد كريري',
    loading: 'جارٍ التحميل',

    hero: {
      first: 'محمد',
      last: 'كريري',
      role: 'أخصائي تقنية معلومات',
      field: 'علوم الحاسب',
      open: 'متاح للعمل',
      place: 'الرياض',
      claim: 'أربع شركات على مكتب تقنية واحد. كنت أنا هذا المكتب.',
      next: 'علوم الحاسب تحته، والذكاء الاصطناعي والأتمتة والجانب التجاري للتقنية أمامه.',
      cue: 'مرّر',
      cta: 'راسلني على واتساب',
      cv: 'تحميل السيرة الذاتية',
      see: 'استعرض الخبرة'
    },
    spec: {
      role: 'الدور', roleV: 'أخصائي تقنية معلومات',
      base: 'المقر', baseV: 'الرياض، السعودية',
      since: 'الاعتماد', sinceV: 'الهيئة السعودية للمهندسين، 2025',
      focus: 'الاتجاه', focusV: 'ذكاء اصطناعي · أتمتة · برمجة'
    },

    statement: { l1: 'علوم حاسب دراسةً.', l2: 'أنظمة ممارسةً.' },
    stackTag: 'أدوات العمل',

    fault: {
      tag: 'حيث يبدأ العمل',
      lead: 'ثلاثة أعطال من يوم عادي. كلٌّ منها يوقف شخصًا عن عمله.',
      items: [
        { code: 'PRN', state: 'تعطّل', line: 'موظف لا يستطيع الطباعة.' },
        { code: 'NET', state: 'انقطاع', line: 'شبكة تتقطّع طوال اليوم.' },
        { code: 'CCTV', state: 'توقّف', line: 'كاميرا توقفت عن التسجيل.' }
      ]
    },

    about: {
      tag: 'نبذة',
      p1: 'محمد كريري، أخصائي تقنية معلومات في الرياض. خريج علوم حاسب من جامعة تبوك، ومعتمد من الهيئة السعودية للمهندسين. وآخر ما توليته: مكتب تقنية المعلومات كاملًا لأربع شركات تحت إدارة واحدة — أجهزتها وشبكتها وكاميراتها.',
      p2: 'أميل إلى المشاكل المتكررة أكثر من العاجلة. العاجل يُغلق تذكرة، والمتكرر يُغلق سببه. وهذا الميل نفسه هو ما يدفعني نحو الأتمتة، وإلى جانب البرمجة الذي بدأته دراستي.',
      facts: [
        { k: 'التعليم', v: 'بكالوريوس علوم الحاسب — جامعة تبوك، 2025' },
        { k: 'الاعتماد', v: 'أخصائي علوم حاسب — الهيئة السعودية للمهندسين، 2025' },
        { k: 'المقر', v: 'الرياض، السعودية' },
        { k: 'اللغات', v: 'العربية (لغة أم) · الإنجليزية (إتقان مهني)' }
      ],
      stats: [
        { n: 11, k: 'شهادة مهنية' },
        { n: 6, k: 'مجالات عمل متصلة' },
        { n: 4, k: 'شركات على مكتب تقنية واحد' }
      ]
    },

    caps: {
      tag: 'خريطة القدرات',
      lead: 'ستة مجالات، موصولة كما تتصل فعلًا. كل عطل يمرّ بأكثر من واحد منها.',
      hint: 'اختر أي عقدة',
      core: 'محمد كريري',
      coreRole: 'أخصائي تقنية معلومات',
      items: [
        { name: 'الدعم الفني', group: 'تقنية أساسية', desc: 'أول نقطة اتصال لأي عطل يوقف موظفًا — حضوريًا أو عن بُعد عبر AnyDesk.' },
        { name: 'الأنظمة', group: 'تقنية أساسية', desc: 'إبقاء أنظمة الشركة مستقرة ومتاحة طوال يوم العمل.' },
        { name: 'الشبكات', group: 'بنية تحتية', desc: 'تشخيص انقطاع الاتصال وأعطال الشبكة المحلية، وإعادة الخدمة.' },
        { name: 'الأجهزة', group: 'بنية تحتية', desc: 'صيانة دورية وطارئة للحواسيب والطابعات والأجهزة المحمولة والملحقات.' },
        { name: 'المراقبة', group: 'بنية تحتية', desc: 'تشغيل كاميرات المراقبة عبر مواقع الشركة، والتأكد من أن التغطية لا تنقطع.' },
        { name: 'البرمجة', group: 'برمجة', desc: 'جافا وبرمجة كائنية، وقواعد بيانات علائقية، وHTML وCSS وأندرويد — أساس علوم الحاسب الذي أبني عليه.' }
      ]
    },

    career: {
      tag: 'الخبرة',
      entries: [
        {
          year: '2025', span: 'يونيو 2025 — ديسمبر 2025', kind: 'دوام كامل',
          role: 'أخصائي تقنية معلومات', org: 'شركة بشائر البناء للمقاولات — الرياض',
          points: [
            'نقطة الاتصال الوحيدة لأي عطل تقني في أربع شركات تحت إدارة واحدة — من طابعة متوقفة إلى قطاع شبكة لا يثبت.',
            'مسؤول عن الصيانة الدورية والطارئة للحواسيب والطابعات والأجهزة المحمولة والملحقات، حتى لا يتحوّل عطل جهاز إلى توقف عمل.',
            'تشغيل ومتابعة أنظمة المراقبة التي تغطي مواقع الشركة، بما يُبقي التغطية الأمنية متصلة.',
            'دعم شامل لأنظمة الشركة واتصالات الشبكة — الأدوات الرقمية التي يقوم عليها عمل المقاولات.'
          ],
          impact: 'مكتب تقنية واحد لأربع شركات، مع دعم عن بُعد عبر AnyDesk لموظفين داخل الرياض وخارجها.'
        },
        {
          year: '2025', span: 'مايو 2025', kind: 'تعليم',
          role: 'بكالوريوس علوم الحاسب', org: 'جامعة تبوك',
          points: [
            'معتمد من الهيئة السعودية للمهندسين كأخصائي علوم حاسب.',
            'التركيز: هندسة البرمجيات، وقواعد البيانات العلائقية، وتشخيص أعطال العتاد.'
          ]
        },
        {
          year: '2024', span: 'يونيو 2024 — أغسطس 2024', kind: 'تدريب',
          role: 'متدرّب تقنية معلومات', org: 'تجمع تبوك الصحي',
          points: [
            'إصلاح الحواسيب والأجهزة المحمولة واستكشاف أعطالها داخل بيئة صحية فعلية.',
            'تحديد أخطاء الأنظمة ومعالجتها دعمًا للبنية الرقمية للمنشأة.',
            'العمل مع فريق تقنية المعلومات على حلول رفعت جودة الخدمة اليومية.'
          ]
        }
      ]
    },

    work: {
      tag: 'العمل',
      project: {
        no: '001',
        kind: 'موقع شخصي',
        title: 'هذا الموقع',
        desc: 'مصمَّم ومبنيّ من مجلد فارغ: React وTypeScript، وممر ثلاثي الأبعاد بـThree.js تسير فيه الصفحة كاملة، وحركة مقودة بالتمرير عبر GSAP، وعربي وإنجليزي كتكوينين مستقلين لا نسخة معكوسة. يعمل بالكامل من لوحة المفاتيح، ويتخلى عن الحِمل الثقيل عند تقليل الحركة أو على جهاز ضعيف.',
        stack: 'التقنيات',
        focus: 'التركيز',
        live: 'أنت تتصفّحه الآن',
        code: 'الكود المصدري',
        notesTag: 'قرارات هندسية',
        notes: [
          'مشهد WebGL واحد للصفحة كلها — لوحة واحدة بدل ثمانٍ — يُحمَّل عند الحاجة ويتوقف خارج الشاشة.',
          'ثنائي اللغة بالبناء: لكل لغة تكوينها ومقياسها الطباعي، لا انعكاس للأخرى.',
          'الحركة مكتوبة كحالات بداية، فلا يختفي شيء إن تعطّل التنفيذ أو قُلّلت الحركة.',
          'مُختبَر حتى عرض 375 بكسل في الاتجاهين، بلا أي تمرير أفقي.'
        ]
      },
      soon: 'مشروع واحد، مبنيّ من طرفه إلى طرفه وقيد التشغيل. وما يليه يُنشر على GitHub أولًا بأول.'
    },

    cred: {
      tag: 'الاعتمادات',
      lead: 'أخصائي علوم حاسب',
      leadBy: 'الهيئة السعودية للمهندسين — 2025',
      all: 'جميع الشهادات',
      items: [
        'Intermediate Object-Oriented Programming with Java',
        'Introduction to Relational Databases (RDBMS)',
        'Introduction to Android Mobile Application Development',
        'Software Engineering & Best Practices',
        'Build Your Portfolio Website with HTML and CSS',
        'Programming Fundamentals',
        'Search Engine Optimization (SEO)',
        'Marketing Fundamentals',
        'Computer Basics',
        'Basics of Design Tools',
        'Data Entry Skills'
      ]
    },

    direction: {
      tag: 'الاتجاه الحالي',
      lead: 'إلى أين أتجه، وممّ ينطلق كل اتجاه.',
      honest: 'هذه اتجاهات أعمل عليها، لا مناصب شغلتها. وكل واحد منها ينطلق من شيء مذكور في هذه الصفحة أصلًا.',
      fromK: 'ينطلق من',
      items: [
        {
          name: 'الذكاء الاصطناعي',
          desc: 'كيف تُبنى النماذج والوكلاء وتُشغَّل فعليًا، وأين تستحق مكانها في تشغيل حقيقي لا في عرض تجريبي.',
          fromV: 'علوم الحاسب — جامعة تبوك'
        },
        {
          name: 'الأتمتة',
          desc: 'تحويل الجزء المتكرر من عمل التقنية إلى إجراءات تعمل دون تدخل.',
          fromV: 'مكتب تقنية لأربع شركات'
        },
        {
          name: 'البرمجة',
          desc: 'توسيع أساس جافا وقواعد البيانات والويب من الدراسة إلى ما أنشره فعلًا.',
          fromV: 'Java · RDBMS · HTML/CSS · Android'
        },
        {
          name: 'التجارة وريادة الأعمال',
          desc: 'الجانب التجاري للتقنية: كيف يجد المنتج عميله ويغطي تكلفته.',
          fromV: 'أساسيات التسويق و SEO — شهادتان'
        }
      ],
      close: { l1: 'أعرف ما يلزم لإبقاء الأنظمة تعمل.', l2: 'والاتجاه أنظمة تحتاج إلى ذلك أقل.' }
    },

    contact: {
      tag: 'تواصل',
      l1: 'لنبنِ شيئًا',
      l2: 'يستحق التشغيل.',
      say: 'متاح لفرص في تقنية المعلومات والدعم الفني والعمليات التقنية في الرياض، ولفرق تعمل بجدّية على الأتمتة والذكاء الاصطناعي. واتساب أسرع وسيلة للوصول إليّ، وأرد عادةً في نفس اليوم.',
      cta: 'راسلني على واتساب',
      ways: [
        { k: 'واتساب', v: '+966 50 603 6322' },
        { k: 'البريد', v: 'm.e.k05060@gmail.com' },
        { k: 'لينكدإن', v: 'mohammed-kariri' },
        { k: 'GitHub', v: 'M3X0H' },
        { k: 'السيرة الذاتية', v: 'PDF' }
      ]
    },

    footer: {
      name: 'محمد إسماعيل كريري',
      built: 'React · GSAP · Three.js · Lightswind',
      strip: ['أخصائي تقنية معلومات', 'علوم الحاسب', 'الرياض', 'ذكاء اصطناعي وأتمتة', 'متاح للعمل']
    },
    portraitAlt: 'محمد إسماعيل كريري — أخصائي تقنية معلومات'
  },

  en: {
    meta: {
      title: 'Mohammed Kariri — IT Specialist & Computer Science',
      desc: 'IT Specialist in Riyadh. Computer Science graduate recognized by the Saudi Council of Engineers. Support, systems, networking, hardware and CCTV — heading toward AI and automation.'
    },
    nav: {
      home: 'Start', about: 'About', caps: 'Capabilities', career: 'Experience',
      work: 'Work', direction: 'Direction', contact: 'Contact',
      menu: 'Menu', lang: 'Switch to Arabic'
    },
    skip: 'Skip to content',
    brand: 'Mohammed Kariri',
    loading: 'Loading',

    hero: {
      first: 'MOHAMMED',
      last: 'KARIRI',
      role: 'IT Specialist',
      field: 'Computer Science',
      open: 'Open to work',
      place: 'Riyadh',
      claim: 'One IT desk carried four companies. I was it.',
      next: 'Computer Science under it. AI, automation and the business of technology ahead of it.',
      cue: 'Scroll',
      cta: 'Message me on WhatsApp',
      cv: 'Download CV',
      see: 'View experience'
    },
    spec: {
      role: 'Role', roleV: 'IT Specialist',
      base: 'Based', baseV: 'Riyadh, Saudi Arabia',
      since: 'Recognized', sinceV: 'Saudi Council of Engineers, 2025',
      focus: 'Direction', focusV: 'AI · Automation · Software'
    },

    statement: { l1: 'Computer Science by training.', l2: 'Systems by practice.' },
    stackTag: 'Working stack',

    fault: {
      tag: 'Where the work starts',
      lead: 'Three faults from an ordinary day. Each one stops someone from working.',
      items: [
        { code: 'PRN', state: 'Blocked', line: 'Someone who cannot print.' },
        { code: 'NET', state: 'Dropping', line: 'A connection that keeps dropping.' },
        { code: 'CCTV', state: 'Offline', line: 'A camera that stopped recording.' }
      ]
    },

    about: {
      tag: 'About',
      p1: 'I am Mohammed Kariri, an IT Specialist in Riyadh. Computer Science from the University of Tabuk, recognized by the Saudi Council of Engineers. Most recently I was the entire IT desk for four companies under one owner: every device, every connection, every camera.',
      p2: 'I gravitate toward recurring problems more than urgent ones. Urgent closes a ticket; recurring closes the reason for it. That instinct is what pulls me toward automation — and back into the software side my degree started me on.',
      facts: [
        { k: 'Education', v: 'B.Sc. Computer Science — University of Tabuk, 2025' },
        { k: 'Recognition', v: 'Computer Science Specialist — Saudi Council of Engineers, 2025' },
        { k: 'Based', v: 'Riyadh, Saudi Arabia' },
        { k: 'Languages', v: 'Arabic (native) · English (professional)' }
      ],
      stats: [
        { n: 11, k: 'Professional certifications' },
        { n: 6, k: 'Connected capability areas' },
        { n: 4, k: 'Companies on one IT desk' }
      ]
    },

    caps: {
      tag: 'Capability map',
      lead: 'Six areas, wired the way they actually connect. Every fault runs through more than one of them.',
      hint: 'Select any node',
      core: 'Mohammed Kariri',
      coreRole: 'IT Specialist',
      items: [
        { name: 'IT Support', group: 'Core IT', desc: 'First contact for anything that stops an employee working — at the desk or over AnyDesk.' },
        { name: 'Systems', group: 'Core IT', desc: 'Keeping company systems stable and available across the whole working day.' },
        { name: 'Networking', group: 'Infrastructure', desc: 'Diagnosing dropped connections and local network faults, and restoring service.' },
        { name: 'Hardware', group: 'Infrastructure', desc: 'Routine and emergency repair across computers, printers, mobile devices and peripherals.' },
        { name: 'Surveillance', group: 'Infrastructure', desc: 'Running the CCTV covering company sites, and verifying the coverage never goes dark.' },
        { name: 'Software', group: 'Software', desc: 'Java and OOP, relational databases, HTML/CSS and Android — the Computer Science foundation I build on.' }
      ]
    },

    career: {
      tag: 'Experience',
      entries: [
        {
          year: '2025', span: 'Jun 2025 — Dec 2025', kind: 'Full-time',
          role: 'IT Specialist', org: 'Bashaer Al-Benaa Contracting — Riyadh',
          points: [
            'Single point of contact for every technical fault across four companies under one owner — from a jammed printer to a network segment that would not hold.',
            'Owned routine and emergency maintenance across computers, printers, mobile devices and peripherals, so equipment failures did not turn into downtime.',
            'Ran and monitored the CCTV systems covering the company sites, keeping security coverage continuous.',
            'Delivered end-to-end support for company systems and network connectivity — the digital tools contracting work runs on.'
          ],
          impact: 'One IT desk, four companies, with remote support over AnyDesk for staff inside and outside Riyadh.'
        },
        {
          year: '2025', span: 'May 2025', kind: 'Education',
          role: 'B.Sc. Computer Science', org: 'University of Tabuk',
          points: [
            'Recognized by the Saudi Council of Engineers as a Computer Science Specialist.',
            'Core focus: software engineering, relational databases, and hardware fault diagnosis.'
          ]
        },
        {
          year: '2024', span: 'Jun 2024 — Aug 2024', kind: 'Internship',
          role: 'IT Trainee', org: 'Tabuk Health Cluster',
          points: [
            'Repaired and troubleshot computers and mobile devices inside a live healthcare environment.',
            'Identified and resolved system errors supporting the facility’s digital infrastructure.',
            'Worked alongside the IT department on fixes that improved day-to-day service delivery.'
          ]
        }
      ]
    },

    work: {
      tag: 'Work',
      project: {
        no: '001',
        kind: 'Personal site',
        title: 'This site',
        desc: 'Designed and built from an empty folder: React and TypeScript, a WebGL corridor in Three.js the whole page travels down, scroll-driven motion in GSAP, and Arabic and English as two separate compositions rather than one mirrored layout. Keyboard operable end to end, and it sheds the heavy work under reduced motion or on a weak device.',
        stack: 'Stack',
        focus: 'Focus',
        live: 'You are looking at it',
        code: 'Source code',
        notesTag: 'Engineering decisions',
        notes: [
          'One WebGL scene mounted once for the whole page — one canvas instead of eight — lazy-loaded and idled off-screen.',
          'Bilingual by construction: each language gets its own composition and type scale, not a flipped copy.',
          'Motion is written as from-states, so nothing is hidden if scripting fails or motion is reduced.',
          'Verified down to 375px in both directions with no horizontal overflow.'
        ]
      },
      soon: 'One project, built end to end and in production. The next ones go up on GitHub as they land.'
    },

    cred: {
      tag: 'Credentials',
      lead: 'Computer Science Specialist',
      leadBy: 'Saudi Council of Engineers — 2025',
      all: 'All certifications',
      items: [
        'Intermediate Object-Oriented Programming with Java',
        'Introduction to Relational Databases (RDBMS)',
        'Introduction to Android Mobile Application Development',
        'Software Engineering & Best Practices',
        'Build Your Portfolio Website with HTML and CSS',
        'Programming Fundamentals',
        'Search Engine Optimization (SEO)',
        'Marketing Fundamentals',
        'Computer Basics',
        'Basics of Design Tools',
        'Data Entry Skills'
      ]
    },

    direction: {
      tag: 'Current direction',
      lead: 'Where I am heading, and what each direction starts from.',
      honest: 'These are directions I am working in, not roles I have held. Each one starts from something already on this page.',
      fromK: 'Starting from',
      items: [
        {
          name: 'Artificial intelligence',
          desc: 'How models and agents are actually built and run, and where they earn a place in real operations rather than in a demo.',
          fromV: 'Computer Science — University of Tabuk'
        },
        {
          name: 'Automation',
          desc: 'Turning the repeating part of IT work into procedures that run without a person in the loop.',
          fromV: 'An IT desk covering four companies'
        },
        {
          name: 'Software',
          desc: 'Extending the Java, database and web foundation from my degree into things I actually ship.',
          fromV: 'Java · RDBMS · HTML/CSS · Android'
        },
        {
          name: 'Business & entrepreneurship',
          desc: 'The commercial side of technology: how a product finds its customers and pays for itself.',
          fromV: 'Marketing & SEO fundamentals — certified'
        }
      ],
      close: { l1: 'I know what it takes to keep systems running.', l2: 'The direction is systems that need less keeping.' }
    },

    contact: {
      tag: 'Contact',
      l1: 'Let’s build something',
      l2: 'worth running.',
      say: 'Open to IT specialist, IT support and technical operations roles in Riyadh — and to teams doing serious work with automation and AI. WhatsApp is the fastest way to reach me, and I usually reply the same day.',
      cta: 'Message me on WhatsApp',
      ways: [
        { k: 'WhatsApp', v: '+966 50 603 6322' },
        { k: 'Email', v: 'm.e.k05060@gmail.com' },
        { k: 'LinkedIn', v: 'mohammed-kariri' },
        { k: 'GitHub', v: 'M3X0H' },
        { k: 'Curriculum vitae', v: 'PDF' }
      ]
    },

    footer: {
      name: 'Mohammed Ismail Kariri',
      built: 'React · GSAP · Three.js · Lightswind',
      strip: ['IT Specialist', 'Computer Science', 'Riyadh', 'AI & Automation', 'Open to work']
    },
    portraitAlt: 'Mohammed Ismail Kariri — IT Specialist'
  }
};
