/* ═══════════════════════════════════════════════════════════════
   Every string the site renders, in both languages.

   The facts here are the real ones — roles, dates, employers,
   credentials and the single real project. The wording around them is
   written for this site; the substance is not invented.
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
  { id: 'hardware', tech: ['PCs', 'Printers', 'Peripherals', 'Repair'], links: [0, 4] },
  { id: 'cctv', tech: ['Surveillance', 'Site Security', 'Monitoring'], links: [1, 2, 3] },
  { id: 'dev', tech: ['Java', 'SQL', 'RDBMS', 'HTML', 'CSS'], links: [1] }
] as const;

export const STACK = [
  'Windows', 'AnyDesk', 'LAN', 'TCP/IP', 'CCTV', 'Printers',
  'Java', 'SQL', 'RDBMS', 'HTML', 'CSS', 'Git', 'GitHub', 'VS Code'
];

type Dict = {
  meta: { title: string; desc: string };
  nav: { home: string; about: string; caps: string; career: string; work: string; contact: string; menu: string; lang: string };
  skip: string;
  brand: string;
  loading: string;

  hero: { first: string; last: string; role: string; field: string; open: string; place: string; claim: string; cue: string };
  spec: { role: string; base: string; since: string; langs: string; langsV: string; baseV: string; sinceV: string; roleV: string };

  statement: { l1: string; l2: string };
  about: { tag: string; p1: string; p2: string; facts: { k: string; v: string }[] };

  caps: { tag: string; lead: string; items: { name: string; desc: string }[] };
  career: {
    tag: string;
    entries: { year: string; span: string; kind: string; role: string; org: string; points: string[]; impact?: string }[];
  };
  work: {
    tag: string;
    project: { no: string; kind: string; title: string; desc: string; stack: string; focus: string; live: string; code: string };
    soon: string;
  };
  cred: { tag: string; lead: string; leadBy: string; all: string; items: string[] };
  contact: { tag: string; l1: string; l2: string; say: string; cta: string; ways: { k: string; v: string }[] };
  footer: { name: string; built: string };
  portraitAlt: string;
};

export const COPY: Record<Lang, Dict> = {
  ar: {
    meta: {
      title: 'محمد كريري — أخصائي تقنية معلومات',
      desc: 'أخصائي تقنية معلومات في الرياض، معتمد من الهيئة السعودية للمهندسين كأخصائي علوم حاسب. دعم فني، أنظمة، شبكات، أجهزة، ومراقبة.'
    },
    nav: { home: 'البداية', about: 'نبذة', caps: 'القدرات', career: 'المسار', work: 'العمل', contact: 'تواصل', menu: 'القائمة', lang: 'التبديل إلى الإنجليزية' },
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
      claim: 'أُبقي الأنظمة تعمل، والناس تُنجز.',
      cue: 'مرّر'
    },
    spec: {
      role: 'الدور', roleV: 'أخصائي تقنية معلومات',
      base: 'المقر', baseV: 'الرياض، السعودية',
      since: 'الاعتماد', sinceV: 'الهيئة السعودية للمهندسين',
      langs: 'اللغات', langsV: 'العربية · الإنجليزية'
    },

    statement: { l1: 'علوم حاسب دراسةً.', l2: 'أنظمة ممارسةً.' },
    about: {
      tag: 'نبذة',
      p1: 'خريج علوم الحاسب من جامعة تبوك، ومعتمد من الهيئة السعودية للمهندسين كأخصائي علوم حاسب. عملي يبدأ حيث تلتقي الأنظمة بالناس: موظف لا يستطيع الطباعة، شبكة تتقطع، كاميرا توقفت عن التسجيل.',
      p2: 'أميل إلى المشاكل المتكررة أكثر من العاجلة. العاجل يُغلق تذكرة، والمتكرر يُغلق سببه — وهكذا ينتقل الدعم من ردّ فعل إلى إجراء ثابت.',
      facts: [
        { k: 'التعليم', v: 'بكالوريوس علوم الحاسب — جامعة تبوك، 2025' },
        { k: 'الاعتماد', v: 'أخصائي علوم حاسب — الهيئة السعودية للمهندسين، 2025' },
        { k: 'المقر', v: 'الرياض، السعودية' },
        { k: 'اللغات', v: 'العربية · الإنجليزية' }
      ]
    },

    caps: {
      tag: 'ماذا أفعل',
      lead: 'ستة مجالات متصلة. كل عطل يمرّ بأكثر من واحد منها.',
      items: [
        { name: 'الدعم الفني', desc: 'الدعم اليومي للموظفين، وحل الأعطال قبل أن توقف العمل.' },
        { name: 'الأنظمة', desc: 'تشغيل الأنظمة ومتابعة استقرارها على مدار يوم العمل.' },
        { name: 'الشبكات', desc: 'تشخيص انقطاع الإنترنت والشبكات المحلية وإعادتها للعمل.' },
        { name: 'الأجهزة', desc: 'صيانة دورية وطارئة، وتشخيص الأعطال وتبديل القطع.' },
        { name: 'المراقبة', desc: 'إدارة أنظمة CCTV والتأكد من عملها دون انقطاع.' },
        { name: 'البرمجة', desc: 'أساس أكاديمي في البرمجة وقواعد البيانات وبناء الويب.' }
      ]
    },

    career: {
      tag: 'المسار',
      entries: [
        {
          year: '2025', span: 'يونيو 2025 — ديسمبر 2025', kind: 'دوام كامل',
          role: 'أخصائي تقنية معلومات', org: 'شركة بشائر البناء للمقاولات — الرياض',
          points: [
            'نقطة الاتصال الأولى لأي عطل تقني يوقف موظفًا عن عمله.',
            'صيانة دورية وطارئة للحواسيب والطابعات والملحقات.',
            'إدارة ومراقبة أنظمة CCTV لضمان أمن المواقع.',
            'دعم شامل للأنظمة واتصالات الشبكة.'
          ],
          impact: 'مكتب تقنية معلومات واحد يخدم أربع شركات تحت إدارة واحدة، مع دعم عن بُعد عبر AnyDesk لموظفين داخل الرياض وخارجها.'
        },
        {
          year: '2025', span: 'مايو 2025', kind: 'تعليم',
          role: 'بكالوريوس علوم الحاسب', org: 'جامعة تبوك',
          points: [
            'معترف بها رسميًا من الهيئة السعودية للمهندسين كأخصائي علوم حاسب.',
            'التركيز: هندسة البرمجيات، وقواعد البيانات العلائقية، وأساسيات الشبكات.'
          ]
        },
        {
          year: '2024', span: 'يونيو 2024 — أغسطس 2024', kind: 'تدريب',
          role: 'متدرّب تقنية معلومات', org: 'تجمع تبوك الصحي',
          points: [
            'المساعدة في إصلاح أعطال الحواسيب والأجهزة المحمولة واستكشافها.',
            'تحديد أخطاء الأنظمة ومعالجتها دعمًا للبنية الرقمية للمنشأة.',
            'العمل مع فريق تقنية المعلومات على حلول ترفع جودة الخدمة.'
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
        desc: 'واجهة شخصية مبنية من الصفر: مجسّم ثلاثي الأبعاد يستجيب للمؤشر، وحركة مقودة بالتمرير، وعربي وإنجليزي بقلب كامل لاتجاه الصفحة. يعمل بالكامل من لوحة المفاتيح، ويحترم تقليل الحركة.',
        stack: 'التقنيات',
        focus: 'التركيز',
        live: 'أنت تتصفّحه الآن',
        code: 'الكود المصدري'
      },
      soon: 'مشاريع أخرى قيد التطوير. أنشرها على GitHub أولًا بأول.'
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

    contact: {
      tag: 'تواصل',
      l1: 'لنبنِ شيئًا',
      l2: 'يستحق التشغيل.',
      say: 'متاح لفرص في الدعم الفني وتقنية المعلومات. واتساب أسرع وسيلة للوصول إليّ، وأرد عادةً في نفس اليوم.',
      cta: 'راسلني على واتساب',
      ways: [
        { k: 'واتساب', v: '+966 50 603 6322' },
        { k: 'البريد', v: 'm.e.k05060@gmail.com' },
        { k: 'لينكدإن', v: 'mohammed-kariri' },
        { k: 'GitHub', v: 'M3X0H' },
        { k: 'السيرة الذاتية', v: 'PDF' }
      ]
    },

    footer: { name: 'محمد إسماعيل كريري', built: 'React · GSAP · Three.js' },
    portraitAlt: 'محمد إسماعيل كريري — أخصائي تقنية معلومات'
  },

  en: {
    meta: {
      title: 'Mohammed Kariri — IT Specialist',
      desc: 'IT Specialist in Riyadh, recognized by the Saudi Council of Engineers as a Computer Science Specialist. Support, systems, networking, hardware and surveillance.'
    },
    nav: { home: 'Start', about: 'About', caps: 'Capabilities', career: 'Career', work: 'Work', contact: 'Contact', menu: 'Menu', lang: 'Switch to Arabic' },
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
      claim: 'I keep systems running, and people working.',
      cue: 'Scroll'
    },
    spec: {
      role: 'Role', roleV: 'IT Specialist',
      base: 'Based', baseV: 'Riyadh, Saudi Arabia',
      since: 'Recognized', sinceV: 'Saudi Council of Engineers',
      langs: 'Languages', langsV: 'Arabic · English'
    },

    statement: { l1: 'Computer Science by training.', l2: 'Systems by practice.' },
    about: {
      tag: 'About',
      p1: 'Computer Science graduate from the University of Tabuk, recognized by the Saudi Council of Engineers as a Computer Science Specialist. My work starts where systems meet people: someone who cannot print, a connection that keeps dropping, a camera that stopped recording.',
      p2: 'I gravitate toward recurring problems more than urgent ones. Urgent closes a ticket; recurring closes the reason for it — that is how support turns from reaction into procedure.',
      facts: [
        { k: 'Education', v: 'B.Sc. Computer Science — University of Tabuk, 2025' },
        { k: 'Recognition', v: 'Computer Science Specialist — Saudi Council of Engineers, 2025' },
        { k: 'Based', v: 'Riyadh, Saudi Arabia' },
        { k: 'Languages', v: 'Arabic · English' }
      ]
    },

    caps: {
      tag: 'What I do',
      lead: 'Six connected areas. Every fault runs through more than one of them.',
      items: [
        { name: 'IT Support', desc: 'Day-to-day employee support, resolving faults before they stop the work.' },
        { name: 'Systems', desc: 'Running the systems and keeping them stable across the working day.' },
        { name: 'Networking', desc: 'Diagnosing dropped internet and local networks, and restoring service.' },
        { name: 'Hardware', desc: 'Routine and emergency maintenance, fault diagnosis and part replacement.' },
        { name: 'Surveillance', desc: 'Managing CCTV systems and verifying they run without interruption.' },
        { name: 'Development', desc: 'Academic grounding in programming, databases and building for the web.' }
      ]
    },

    career: {
      tag: 'Career',
      entries: [
        {
          year: '2025', span: 'Jun 2025 — Dec 2025', kind: 'Full-time',
          role: 'IT Specialist', org: 'Bashaer Al-Benaa Contracting — Riyadh',
          points: [
            'First point of contact for any technical fault stopping an employee from working.',
            'Routine and emergency maintenance for computers, printers and peripherals.',
            'Managed and monitored CCTV systems to keep sites secure.',
            'End-to-end support for systems and network connectivity.'
          ],
          impact: 'One IT desk serving four companies under a single ownership, with remote support over AnyDesk for employees inside and outside Riyadh.'
        },
        {
          year: '2025', span: 'May 2025', kind: 'Education',
          role: 'B.Sc. Computer Science', org: 'University of Tabuk',
          points: [
            'Officially recognized by the Saudi Council of Engineers as a Computer Science Specialist.',
            'Focus: software engineering, relational databases and networking fundamentals.'
          ]
        },
        {
          year: '2024', span: 'Jun 2024 — Aug 2024', kind: 'Internship',
          role: 'IT Trainee', org: 'Tabuk Health Cluster',
          points: [
            'Assisted in troubleshooting and repairing computers and mobile devices.',
            'Identified and resolved system errors supporting the facility’s digital infrastructure.',
            'Worked with the IT team on solutions that improved service quality.'
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
        desc: 'A personal interface built from scratch: a pointer-reactive 3D object, scroll-driven motion, and Arabic and English with a full page-direction flip. Fully keyboard operable, and it respects reduced motion.',
        stack: 'Stack',
        focus: 'Focus',
        live: 'You are looking at it',
        code: 'Source code'
      },
      soon: 'More projects are in progress. I publish them on GitHub as they land.'
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

    contact: {
      tag: 'Contact',
      l1: 'Let’s build something',
      l2: 'worth running.',
      say: 'Open to IT support and IT specialist roles. WhatsApp is the fastest way to reach me, and I usually reply the same day.',
      cta: 'Message me on WhatsApp',
      ways: [
        { k: 'WhatsApp', v: '+966 50 603 6322' },
        { k: 'Email', v: 'm.e.k05060@gmail.com' },
        { k: 'LinkedIn', v: 'mohammed-kariri' },
        { k: 'GitHub', v: 'M3X0H' },
        { k: 'Curriculum vitae', v: 'PDF' }
      ]
    },

    footer: { name: 'Mohammed Ismail Kariri', built: 'React · GSAP · Three.js' },
    portraitAlt: 'Mohammed Ismail Kariri — IT Specialist'
  }
};
