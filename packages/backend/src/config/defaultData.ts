export const defaultAdmin = {
  username: 'yjcodehub',
  email: 'yash@devvolio.in',
  password: 'Devvolio123$', // Default password (hashed in Mongoose pre-save hook)
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
