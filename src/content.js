// =====================================================================
//  EDIT THIS FILE. Everything on the page comes from here.
//  All text below is PLACEHOLDER — replace it with your own.
// =====================================================================

export const content = {
  name: 'Your Name',
  initials: 'YN',
  role: 'Developer · Designer · Tinkerer',

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
      'Write two or three short sentences about who you are and what you build.',
      'Say what you love working on, and what you are learning right now.',
    ],
    facts: [
      ['Based in', 'City, Country'],
      ['Focus', 'Your main focus'],
      ['Currently', 'What you are learning'],
    ],
  },

  // Six skills — they sit on the six signs on the building.
  skills: [
    { name: 'Skill One', note: 'One short line' },
    { name: 'Skill Two', note: 'One short line' },
    { name: 'Skill Three', note: 'One short line' },
    { name: 'Skill Four', note: 'One short line' },
    { name: 'Skill Five', note: 'One short line' },
    { name: 'Skill Six', note: 'One short line' },
  ],

  // Six projects — they sit in the six windows of the metro train.
  projects: [
    { title: 'Project One', blurb: 'One line about the problem it solves.', tags: ['Tech', 'Tech', 'Tech'], href: '#' },
    { title: 'Project Two', blurb: 'One line about the problem it solves.', tags: ['Tech', 'Tech', 'Tech'], href: '#' },
    { title: 'Project Three', blurb: 'One line about the problem it solves.', tags: ['Tech', 'Tech', 'Tech'], href: '#' },
    { title: 'Project Four', blurb: 'One line about the problem it solves.', tags: ['Tech', 'Tech', 'Tech'], href: '#' },
    { title: 'Project Five', blurb: 'One line about the problem it solves.', tags: ['Tech', 'Tech', 'Tech'], href: '#' },
    { title: 'Project Six', blurb: 'One line about the problem it solves.', tags: ['Tech', 'Tech', 'Tech'], href: '#' },
  ],

  experience: {
    title: 'Experience',
    items: [
      { when: '20XX — Now', role: 'Role title', where: 'Company', text: 'One line about what you did and the result.' },
      { when: '20XX — 20XX', role: 'Role title', where: 'Company', text: 'One line about what you did and the result.' },
      { when: '20XX — 20XX', role: 'Role title', where: 'Company', text: 'One line about what you did and the result.' },
      { when: '20XX — 20XX', role: 'Role title', where: 'Company', text: 'One line about what you did and the result.' },
    ],
  },

  contact: {
    title: 'Contact',
    headline: 'Let’s build something together.',
    links: [
      { label: 'Email', value: 'you@example.com', href: 'mailto:you@example.com' },
      { label: 'LinkedIn', value: 'linkedin.com/in/you', href: 'https://linkedin.com/in/you' },
      { label: 'GitHub', value: 'github.com/you', href: 'https://github.com/you' },
    ],
  },
};
