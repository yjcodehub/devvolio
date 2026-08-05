export const defaultAdmin = {
  username: 'yjcodehub',
  email: 'lakshraj2121@gmail.com',
  password: 'Adminyash@1234', // Default password (hashed in Mongoose pre-save hook)
  role: 'admin'
};

export const initialSettings = {
  hero: {
    title: 'Engineering Premium Digital Experiences.',
    subtitle: 'Frontend & POS Software Architect',
    tagline: 'I build high-performance POS platforms, salon SaaS dashboards, and state-of-the-art interactive frontends styled with Stripe-level precision.',
    terminalSequence: [
      { type: 'input', text: 'yash --role --skills' },
      { type: 'output', text: '> Software Engineer (Frontend) | 6+ Years' },
      { type: 'output', text: '> Core: React, Next.js, Angular, Javascript ES6, Typescript' },
      { type: 'input', text: 'yash --status' },
      { type: 'output', text: '> Immediate Joiner' },
      { type: 'output', text: '> Open to Pune, Hyderabad, Mumbai, Bengaluru, Nagpur' }
    ]
  },
  about: {
    bio: '6+ years of engineering operational software. I construct stable product modules and optimize API speeds.',
    profileImage: 'https://res.cloudinary.com/demo/image/upload/v1600000000/sample.jpg',
    expertises: [
      {
        icon: 'monitor',
        title: 'POS & Restaurant Tech',
        desc: 'Deep specialization in restaurant billing systems. Engineered digital menus (GoDirekt), kitchen display screens (KDS), and real-time inventory trackers at Relfor Labs.'
      },
      {
        icon: 'layers',
        title: 'Salon SaaS & CRM',
        desc: 'Helped design and scale Respark salon software (respark.in). Built modules for appointment calendar schedulers, client relationship cards (CRM), and credit card payments.'
      },
      {
        icon: 'database',
        title: 'Full Stack Engineering',
        desc: 'Engineered FitPulse Pro gym reports and BMI tracker using Next.js, Node.js, and MongoDB. Familiar with roles-based dashboard rendering and automated PDF compile engines.'
      },
      {
        icon: 'globe',
        title: 'Instruction & Mentoring',
        desc: 'Former Fullstack Web Developer and Lead Trainer at Webgurukul. Educated 350+ students in JS, PHP, and databases, contributing to over 150 student placements.'
      }
    ]
  },
  cvFileUrl: '',
  socialLinks: {
    github: 'https://github.com/yjcodehub',
    linkedin: 'https://www.linkedin.com/in/yashjais97',
    email: 'lakshraj2121@gmail.com'
  },
  seo: {
    metaTitle: 'Yashkumar Jais | Senior Frontend Engineer Portfolio',
    metaDescription: 'Explore the professional portfolio, experience, and projects of Yashkumar Jais, a Frontend Engineer specializing in Next.js, React, and Angular.',
    keywords: ['Yashkumar Jais', 'Frontend Engineer', 'Angular Developer', 'React Developer', 'NextJS Portfolio', 'Web Performance Optimization'],
    openGraphImage: 'https://res.cloudinary.com/demo/image/upload/v1600000000/sample.jpg'
  },
  analytics: {
    googleAnalyticsId: ''
  },
  stats: {
    githubUsername: 'yjcodehub',
    leetcodeEasySolved: 142,
    leetcodeEasyTotal: 200,
    leetcodeMediumSolved: 210,
    leetcodeMediumTotal: 450,
    leetcodeHardSolved: 38,
    leetcodeHardTotal: 150,
    spotifyIsPlaying: false,
    spotifyTrackTitle: 'Chill Vibes Loop',
    spotifyTrackArtist: 'Yash Jais Studio Mix'
  },
  contact: {
    title: "Let's Collaborate",
    subtitle: 'Have an exciting project or role? Send me a message and let\'s start talking.',
    email: 'lakshraj2121@gmail.com'
  },
  sectionVisibility: {
    skills: { label: 'Skills Section | Technical Arsenal', visible: true },
    core: { label: 'Core Section (About & Expertises)', visible: true },
    aboutDescription: { label: 'About Biography / Description', visible: true },
    coreExpertise: { label: 'About Core Expertise Cards', visible: true },
    contact: { label: 'Contact Section', visible: true },
    developerMatrix: { label: 'Developer Matrix Section (GitHub, LeetCode, Spotify)', visible: true },
    githubActivity: { label: 'Developer Matrix GitHub Activity Graph', visible: true },
    leetcodeActivity: { label: 'Developer Matrix LeetCode Performance Matrix', visible: true },
    spotifyActivity: { label: 'Developer Matrix Spotify Now Playing Widget', visible: true },
    motionTerminal: { label: 'Motion Terminal Section (Interactive Hero Widget)', visible: true },
    projects: { label: 'Projects Section (Grid & Filtering)', visible: true },
    experience: { label: 'Experience & Education Timeline Section', visible: true },
    workExperience: { label: 'Experience Work Timeline', visible: true },
    education: { label: 'Experience Education Timeline', visible: true }
  }
};

export const initialExperiences = [
  {
    role: 'Software Engineer (Frontend)',
    company: 'Relfor Labs Pvt Ltd',
    location: 'Pune',
    type: 'work',
    startDate: new Date('2022-05-01'),
    endDate: new Date('2026-05-01'),
    isCurrent: false,
    description: 'Led frontend configurations for SaaS spa management dashboards (Respark) and restaurant POS frameworks. Built and refined GoDirekt digital QR menus, Kitchen Displays, and order queues.',
    highlights: [
      'Built and optimized key modules including Digital Menu (GoDirekt), Inventory Management, and Kitchen Display System (KDS).',
      'Improved application performance by optimizing API calls and reducing page load time.',
      'Integrated REST APIs for seamless communication between frontend and backend systems.',
      'Enhanced system stability by identifying and resolving critical production bugs.',
      'Collaborated with cross-functional teams in an Agile environment to deliver scalable, production-ready features.',
      'Contributed to Respark, a Salon & Spa Management Software product (respark.in), building features for appointment booking, CRM, and payments.'
    ],
    skillsUsed: ['React.js', 'AngularJS', 'TypeScript', 'REST APIs', 'Tailwind CSS']
  },
  {
    role: 'Trainer & Web Developer',
    company: 'Webgurukul',
    location: 'Nagpur',
    type: 'work',
    startDate: new Date('2019-05-01'),
    endDate: new Date('2022-05-01'),
    isCurrent: false,
    description: 'Instructed 350+ developers in responsive designs, vanilla Javascript DOM bindings, PHP server architectures, and MySQL databases. Designed administrative panels and authentication setups.',
    highlights: [
      'Trained 350+ students in full-stack web development: HTML, CSS, JavaScript, Bootstrap, PHP, MySQL, and Responsive Web Design.',
      'Contributed to 150+ successful student placements across companies and MNCs.',
      'Designed and developed UI templates including dashboards, authentication systems, and admin panels.',
      'Mentored students on real-world projects, coding best practices, and interview preparation.',
      'Assisted in curriculum planning and conducted hands-on practical workshops.'
    ],
    skillsUsed: ['JavaScript', 'HTML5', 'CSS3', 'Bootstrap', 'PHP', 'MySQL']
  },
  {
    role: 'B.Tech / B.E. in Computer Science and Engineering',
    company: 'Priyadarshini JL College of Engineering',
    location: 'Nagpur',
    type: 'education',
    startDate: new Date('2015-08-01'),
    endDate: new Date('2019-06-01'),
    isCurrent: false,
    description: 'Completed B.Tech engineering studies in Computer Science. Graduated with a CGPA of 8.3/10.',
    highlights: [
      'Studied foundational computer science: Data Structures, Algorithms, DBMS, Operating Systems, Software Engineering.',
      'Completed academic projects using PHP and JavaScript.'
    ],
    skillsUsed: ['Data Structures', 'DBMS', 'Algorithms', 'Software Engineering']
  }
];

export const initialProjects = [
  {
    title: 'FitPulse Pro',
    slug: 'fitpulse-pro',
    description: 'A mobile-first gym body analysis and BMI tracking system to digitize paper-based fitness workflows, featuring distinct dashboards and automated PDF reports.',
    detailedBody: '# FitPulse Pro Case Study\n\n### Overview\nFitPulse Pro is a mobile-first BMI and gym analysis tracking software product designed to solve paper-based bottlenecks in local fitness clubs. \n\n### Tech Stack\n* **Frontend**: Next.js 15, TypeScript, Tailwind CSS\n* **Backend**: Node.js, Express.js, TypeScript\n* **Database**: MongoDB\n* **Reports**: PDFKit PDF compiler\n\n### Features\n- **Role-Based Access Control (RBAC)**: Custom logins for Owner, Staff, and Client.\n- **Report Engine**: Automated compilation of body metric records to PDF reports.\n- **Performance**: High fidelity dashboards with responsive layout scaling.',
    thumbnail: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&q=80',
    githubUrl: 'https://github.com/yjcodehub/bmitracker',
    liveUrl: 'https://fitpulsepro.vercel.app',
    technologies: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Node.js', 'Express.js', 'MongoDB'],
    category: 'Full Stack',
    featured: true,
    order: 1
  },
  {
    title: 'Respark',
    slug: 'respark',
    description: 'Cloud-based salon management platform automating appointment bookings, client relationships (CRM), and credit card checkouts.',
    detailedBody: '# Respark Salon Management SaaS\n\nRespark is an enterprise spa software helping merchants automate bookings and billing.\n\n* **React / TypeScript** for the single page web dashboard.\n* **REST API** endpoint integrations.\n* **CRM** integrations to log consumer appointment details and payment invoices.',
    thumbnail: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80',
    liveUrl: 'https://respark.in',
    technologies: ['React.js', 'TypeScript', 'REST APIs', 'Tailwind CSS'],
    category: 'SaaS',
    featured: true,
    order: 2
  },
  {
    title: 'Devourin',
    slug: 'devourin',
    description: 'End-to-end POS and inventory display software designed for streamlined restaurant operations and real-time kitchen tracking.',
    thumbnail: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&q=80',
    technologies: ['AngularJS', 'JavaScript', 'REST APIs', 'MySQL'],
    category: 'Frontend',
    featured: false,
    order: 3
  },
  {
    title: 'Examzest',
    slug: 'examzest',
    description: 'Q&A and test management application for schools, supporting student grading matrices and technical notification hubs.',
    thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80',
    technologies: ['Bootstrap', 'JavaScript', 'PHP', 'MySQL'],
    category: 'Other',
    featured: false,
    order: 4
  },
  {
    title: 'Sevadeep',
    slug: 'sevadeep',
    description: 'Web platform connecting donors with local NGOs, featuring donation scheduling, verification dashboards, and logistics trackers.',
    thumbnail: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80',
    technologies: ['Angular', 'TypeScript', 'CSS3'],
    category: 'Frontend',
    featured: false,
    order: 5
  },
  {
    title: 'GreenField',
    slug: 'greenfield',
    description: 'Product display systems for nursery catalogs, implementing listings, dynamic item searches, and wholesale pricing tables.',
    thumbnail: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800&q=80',
    technologies: ['Bootstrap', 'JavaScript', 'PHP', 'MySQL'],
    category: 'Other',
    featured: false,
    order: 6
  }
];

export const initialSkills = [
  // Frameworks
  { name: 'Angular', category: 'Frameworks & Libraries', proficiency: 90, icon: 'SiAngular', featured: true, order: 1 },
  { name: 'React.js', category: 'Frameworks & Libraries', proficiency: 85, icon: 'SiReact', featured: true, order: 2 },
  { name: 'Next.js', category: 'Frameworks & Libraries', proficiency: 80, icon: 'SiNextdotjs', featured: true, order: 3 },
  { name: 'Node.js', category: 'Frameworks & Libraries', proficiency: 75, icon: 'SiNodedotjs', featured: false, order: 4 },
  { name: 'AngularJS', category: 'Frameworks & Libraries', proficiency: 85, icon: 'SiAngular', featured: false, order: 5 },

  // Languages
  { name: 'JavaScript', category: 'Languages', proficiency: 92, icon: 'SiJavascript', featured: true, order: 6 },
  { name: 'TypeScript', category: 'Languages', proficiency: 88, icon: 'SiTypescript', featured: true, order: 7 },
  { name: 'HTML5 & CSS3', category: 'Languages', proficiency: 95, icon: 'SiHtml5', featured: false, order: 8 },
  { name: 'PHP', category: 'Languages', proficiency: 70, icon: 'SiPhp', featured: false, order: 10 },

  // Tools
  { name: 'Git', category: 'Tools & Platforms', proficiency: 85, icon: 'SiGit', featured: false, order: 11 },
  { name: 'REST APIs', category: 'AI Tools & Databases', proficiency: 90, icon: 'SiPostman', featured: true, order: 12 },
  { name: 'Bootstrap', category: 'Tools & Platforms', proficiency: 90, icon: 'SiBootstrap', featured: false, order: 13 },
  { name: 'Tailwind CSS', category: 'Tools & Platforms', proficiency: 85, icon: 'SiTailwindcss', featured: true, order: 14 },

  // Databases
  { name: 'MySQL', category: 'AI Tools & Databases', proficiency: 75, icon: 'SiMysql', featured: false, order: 15 },
  { name: 'MongoDB', category: 'AI Tools & Databases', proficiency: 72, icon: 'SiMongodb', featured: false, order: 16 },

  // AI Tools
  { name: 'Cursor AI', category: 'AI Tools & Databases', proficiency: 90, icon: 'SiOpenai', featured: true, order: 17 }
];
