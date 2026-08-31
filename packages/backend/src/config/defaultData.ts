export const defaultAdmin = {
  username: process.env.ADMIN_DEFAULT_USERNAME || 'yjcodehub',
  email: process.env.ADMIN_DEFAULT_EMAIL || 'yash@devvolio.in',
  password: process.env.ADMIN_DEFAULT_PASSWORD || process.env.DEFAULT_ADMIN_PASSWORD || '',
  role: 'superAdmin'
};

export const initialSettings = {
  hero: {
    title: 'Building Modern Digital Experiences',
    subtitle: 'Full Stack Engineer & Web Architect',
    tagline: 'Designing and engineering high-performance web applications and scalable digital solutions.',
    terminalSequence: [
      { type: 'input', text: 'devvolio --role --skills' },
      { type: 'output', text: '> Software Engineer | Building modern web solutions' },
      { type: 'output', text: '> Core: JavaScript, TypeScript, React, Next.js, Node.js' },
      { type: 'input', text: 'devvolio --status' },
      { type: 'output', text: '> Available for projects & engineering opportunities' },
      { type: 'output', text: '> Powered by Devvolio Platform' }
    ]
  },
  about: {
    bio: 'Welcome to your developer portfolio platform powered by Devvolio. You can customize this section with your bio, professional summary, and core technical expertise through your admin dashboard.',
    profileImage: '',
    expertises: [
      {
        icon: 'monitor',
        title: 'Frontend Engineering',
        desc: 'Building responsive, modern, and user-centric interfaces using modern web technologies.'
      },
      {
        icon: 'database',
        title: 'Backend Systems & APIs',
        desc: 'Architecting RESTful APIs, database schemas, and robust backend services.'
      }
    ]
  },
  cvFileUrl: '',
  socialLinks: {
    github: '',
    linkedin: '',
    twitter: '',
    email: ''
  },
  seo: {
    metaTitle: 'Developer Portfolio | Devvolio',
    metaDescription: 'Interactive developer portfolio and project showcase powered by Devvolio.',
    keywords: ['Developer Portfolio', 'Full Stack', 'Software Engineer', 'Devvolio'],
    openGraphImage: ''
  },
  analytics: {
    googleAnalyticsId: ''
  },
  stats: {
    githubUsername: '',
    leetcodeEasySolved: 0,
    leetcodeEasyTotal: 0,
    leetcodeMediumSolved: 0,
    leetcodeMediumTotal: 0,
    leetcodeHardSolved: 0,
    leetcodeHardTotal: 0,
    spotifyIsPlaying: false,
    spotifyTrackTitle: '',
    spotifyTrackArtist: ''
  },
  contact: {
    title: "Let's Collaborate",
    subtitle: "Have a project idea or role to discuss? Get in touch using the contact section.",
    email: ''
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

export const initialExperiences: any[] = [];
export const initialProjects: any[] = [];
export const initialSkills: any[] = [];

export const masterSkillsList = [
  // Languages
  { name: 'JavaScript', category: 'Languages', icon: 'SiJavascript', isSystem: true },
  { name: 'TypeScript', category: 'Languages', icon: 'SiTypescript', isSystem: true },
  { name: 'Python', category: 'Languages', icon: 'SiPython', isSystem: true },
  { name: 'Go (Golang)', category: 'Languages', icon: 'FaCode', isSystem: true },
  { name: 'Rust', category: 'Languages', icon: 'FaCode', isSystem: true },
  { name: 'Java', category: 'Languages', icon: 'FaCode', isSystem: true },
  { name: 'C++', category: 'Languages', icon: 'FaCode', isSystem: true },
  { name: 'C#', category: 'Languages', icon: 'FaCode', isSystem: true },
  { name: 'PHP', category: 'Languages', icon: 'SiPhp', isSystem: true },
  { name: 'Ruby', category: 'Languages', icon: 'FaCode', isSystem: true },
  { name: 'SQL', category: 'Languages', icon: 'FaDatabase', isSystem: true },
  { name: 'HTML5', category: 'Languages', icon: 'SiHtml5', isSystem: true },
  { name: 'CSS3', category: 'Languages', icon: 'SiHtml5', isSystem: true },
  
  // Frameworks & Libraries
  { name: 'React.js', category: 'Frameworks & Libraries', icon: 'SiReact', isSystem: true },
  { name: 'Next.js', category: 'Frameworks & Libraries', icon: 'SiNextdotjs', isSystem: true },
  { name: 'Vue.js', category: 'Frameworks & Libraries', icon: 'FaCode', isSystem: true },
  { name: 'Nuxt.js', category: 'Frameworks & Libraries', icon: 'FaCode', isSystem: true },
  { name: 'Angular', category: 'Frameworks & Libraries', icon: 'SiAngular', isSystem: true },
  { name: 'Svelte', category: 'Frameworks & Libraries', icon: 'FaCode', isSystem: true },
  { name: 'Node.js', category: 'Frameworks & Libraries', icon: 'SiNodedotjs', isSystem: true },
  { name: 'Express.js', category: 'Frameworks & Libraries', icon: 'SiExpress', isSystem: true },
  { name: 'NestJS', category: 'Frameworks & Libraries', icon: 'SiNestjs', isSystem: true },
  { name: 'Django', category: 'Frameworks & Libraries', icon: 'FaCode', isSystem: true },
  { name: 'FastAPI', category: 'Frameworks & Libraries', icon: 'FaCode', isSystem: true },
  { name: 'Spring Boot', category: 'Frameworks & Libraries', icon: 'FaCode', isSystem: true },
  { name: 'Tailwind CSS', category: 'Frameworks & Libraries', icon: 'SiTailwindcss', isSystem: true },
  { name: 'Bootstrap', category: 'Frameworks & Libraries', icon: 'SiBootstrap', isSystem: true },
  { name: 'Framer Motion', category: 'Frameworks & Libraries', icon: 'FaCode', isSystem: true },
  { name: 'Redux Toolkit', category: 'Frameworks & Libraries', icon: 'SiRedux', isSystem: true },
  { name: 'GraphQL', category: 'Frameworks & Libraries', icon: 'SiGraphql', isSystem: true },

  // Databases
  { name: 'MongoDB', category: 'Databases', icon: 'SiMongodb', isSystem: true },
  { name: 'PostgreSQL', category: 'Databases', icon: 'FaDatabase', isSystem: true },
  { name: 'MySQL', category: 'Databases', icon: 'SiMysql', isSystem: true },
  { name: 'Redis', category: 'Databases', icon: 'FaDatabase', isSystem: true },
  { name: 'Firebase', category: 'Databases', icon: 'SiFirebase', isSystem: true },
  { name: 'Supabase', category: 'Databases', icon: 'FaDatabase', isSystem: true },
  { name: 'Elasticsearch', category: 'Databases', icon: 'FaDatabase', isSystem: true },
  { name: 'Prisma ORM', category: 'Databases', icon: 'FaDatabase', isSystem: true },

  // DevOps & Cloud
  { name: 'Docker', category: 'DevOps & Cloud', icon: 'SiDocker', isSystem: true },
  { name: 'Kubernetes', category: 'DevOps & Cloud', icon: 'FaServer', isSystem: true },
  { name: 'AWS', category: 'DevOps & Cloud', icon: 'FaServer', isSystem: true },
  { name: 'Google Cloud (GCP)', category: 'DevOps & Cloud', icon: 'FaServer', isSystem: true },
  { name: 'Microsoft Azure', category: 'DevOps & Cloud', icon: 'FaServer', isSystem: true },
  { name: 'Vercel', category: 'DevOps & Cloud', icon: 'SiVercel', isSystem: true },
  { name: 'GitHub Actions', category: 'DevOps & Cloud', icon: 'SiGithub', isSystem: true },
  { name: 'CI/CD Pipelines', category: 'DevOps & Cloud', icon: 'FaServer', isSystem: true },
  { name: 'Nginx', category: 'DevOps & Cloud', icon: 'FaServer', isSystem: true },
  { name: 'Linux / Bash', category: 'DevOps & Cloud', icon: 'FaServer', isSystem: true },

  // Tools & Platforms
  { name: 'Git & GitHub', category: 'Tools & Platforms', icon: 'SiGithub', isSystem: true },
  { name: 'Postman', category: 'Tools & Platforms', icon: 'SiPostman', isSystem: true },
  { name: 'VS Code', category: 'Tools & Platforms', icon: 'FaCode', isSystem: true },
  { name: 'Jira', category: 'Tools & Platforms', icon: 'FaCode', isSystem: true },
  { name: 'Webpack / Vite', category: 'Tools & Platforms', icon: 'FaCode', isSystem: true },

  // UI/UX & Design
  { name: 'Figma', category: 'UI/UX & Design', icon: 'FaBrain', isSystem: true },
  { name: 'UI/UX Design', category: 'UI/UX & Design', icon: 'FaBrain', isSystem: true },
  { name: 'Design Systems', category: 'UI/UX & Design', icon: 'FaBrain', isSystem: true },
  { name: 'Wireframing & Prototyping', category: 'UI/UX & Design', icon: 'FaBrain', isSystem: true },
  { name: 'Adobe XD', category: 'UI/UX & Design', icon: 'FaBrain', isSystem: true },
  { name: 'Responsive Design', category: 'UI/UX & Design', icon: 'FaLaptopCode', isSystem: true },

  // AI & Machine Learning
  { name: 'OpenAI API / GPT-4o', category: 'AI & Machine Learning', icon: 'FaRobot', isSystem: true },
  { name: 'LangChain', category: 'AI & Machine Learning', icon: 'FaRobot', isSystem: true },
  { name: 'Prompt Engineering', category: 'AI & Machine Learning', icon: 'FaRobot', isSystem: true },
  { name: 'Vector Databases', category: 'AI & Machine Learning', icon: 'FaDatabase', isSystem: true },
  { name: 'PyTorch / TensorFlow', category: 'AI & Machine Learning', icon: 'FaRobot', isSystem: true },

  // Methodologies & Architecture
  { name: 'RESTful APIs', category: 'Methodologies & Architecture', icon: 'FaServer', isSystem: true },
  { name: 'Microservices', category: 'Methodologies & Architecture', icon: 'FaServer', isSystem: true },
  { name: 'System Design', category: 'Methodologies & Architecture', icon: 'FaServer', isSystem: true },
  { name: 'Agile & Scrum', category: 'Methodologies & Architecture', icon: 'FaCode', isSystem: true },
  { name: 'Test Driven Development (TDD)', category: 'Methodologies & Architecture', icon: 'FaCode', isSystem: true }
];

