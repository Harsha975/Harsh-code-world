// =====================================================================
//  EDIT THIS FILE. Everything on the page comes from here.
//  All text below is PLACEHOLDER — replace it with your own.
// =====================================================================

export const content = {
  name: 'Harsha M',
  initials: 'HM',
  role: 'AI Enthusiast · Full-stack Developer',

  menu: [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'skills', label: 'Skills' },
    { id: 'projects', label: 'Projects' },
    { id: 'experience', label: 'Experience' },
    { id: 'contact', label: 'Contact' },
  ],

  about: {
    title: 'About',
    paragraphs: [
      "I write code the way some people doodle: because it's fun and I can't stop. Backend services, AI agents, full-stack apps. Oh, and a 9.5 CGPA from REVA University, but that was never really the point."
    ],
    facts: [
      ['Education', 'B.Tech Computer Science'],
      ['Graduated', 'REVA University · 2025 · 9.5 CGPA'],
      ['Based in', 'Bangalore, India'],
    ],
  },

  // Six skills — they sit on the six signs on the building.
  skills: [
    { name: 'Java + Spring Boot', note: 'REST APIs · Microservices' },
    { name: 'Python + MCP', note: 'AI agents · Developer tools' },
    { name: 'React + Node.js', note: 'Full-stack applications' },
    { name: 'PostgreSQL + Kafka', note: 'Data · Event-driven systems' },
    { name: 'AWS + API Gateway', note: 'Cloud services · SageMaker' },
    { name: 'Docker + Kubernetes', note: 'CI/CD · OpenShift · Jenkins' },
  ],

  // Six projects — they sit in the six windows of the metro train.
  projects: [
    { title: 'Autonomous Feature Engineering Agent', blurb: 'Built an MCP-powered agent that turns requirements into plans and generated code, then executes and integrates results with CI/CD; reduced manual effort by 80%.', tags: ['Python', 'MCP', 'CI/CD'], href: '#' },
    { title: 'MR/PR Agent', blurb: 'Customized Qodo PR-Agent with Jira, Confluence, and GitHub context to automate reviews and reduce manual effort by 60%.', tags: ['Python', 'Qodo', 'GitLab CI/CD'], href: 'https://docs.qodo.ai/code-review' },
    { title: 'Movie Booking & Payment', blurb: 'A Spring Boot microservices system with Kafka booking workflows, seat locking, transactional outbox, and Stripe Checkout.', tags: ['Java', 'Kafka', 'PostgreSQL'], href: 'https://github.com/Harsha975/Booking_service.git' },
    { title: 'AI Resume Processing', blurb: 'Built an Ollama-based resume workflow that reduced manual resume data entry by 90%.', tags: ['Python', 'Ollama', 'AI'], href: '#' },
    { title: 'Cost-Efficient LLM Deployment', blurb: 'Deployed a fine-tuned open-source model with SageMaker and API Gateway, reducing chat model API costs by 40%.', tags: ['AWS', 'SageMaker', 'LLM'], href: '#' },
    { title: 'Fetal Health Prediction Study', blurb: 'Compared machine learning algorithms for fetal health prediction using cardiotocography data; published at IEEE ICITIIT 2025.', tags: ['Machine Learning', 'Research', 'IEEE'], href: 'https://doi.org/10.1109/ICITIIT64777.2025.11040542' },
  ],

  experience: {
    title: 'Experience',
    items: [
      { when: 'Jun 2025 — Now', role: 'SDET - FTE', where: 'Black Duck Software', text: 'Develop cross-cloud Java automation for Cloud Native Coverity on OpenShift, AWS, GCP, and Azure; integrate suites with Jenkins CI/CD for continuous validation.' },
      { when: 'Sep — Dec 2024', role: 'Machine Learning Intern', where: 'Kridaverse', text: 'Built an AI resume workflow that cut manual data entry by 90% and deployed a fine-tuned LLM that reduced API costs by 40%.' },
    ],
  },

  contact: {
    title: 'Contact',
    headline: "Let's build something together.",
    links: [
      { label: 'Email', value: 'harsham975@gmail.com', href: 'mailto:harsham975@gmail.com' },
      { label: 'LinkedIn', value: 'linkedin.com/in/harsha-m-649a46268', href: 'https://www.linkedin.com/in/harsha-m-649a46268/' },
      { label: 'GitHub', value: 'github.com/Harsha975', href: 'https://github.com/Harsha975' },
    ],
  },
};
