export type Person = {
  id: string;
  firstName: string;
  lastName: string;
  slug: string;
  role: string;
  bioShort: string;
  headshotUrl: string;
  avatarColor: string;
  projectIds: string[];
};

export const people: Person[] = [
  {
    id: 'alex-kim',
    firstName: 'Alex',
    lastName: 'Kim',
    slug: 'alex-kim',
    role: 'PhD Student',
    bioShort: 'Investigates play-based civic participation and cooperative learning systems.',
    headshotUrl: '/images/people/alex-kim.jpg',
    avatarColor: '#ff8fab',
    projectIds: ['civic-play', 'climate-storyworlds'],
  },
  {
    id: 'chris-ng',
    firstName: 'Chris',
    lastName: 'Ng',
    slug: 'chris-ng',
    role: 'Research Engineer',
    bioShort: 'Builds interactive prototypes, simulation tooling, and data-driven web experiences.',
    headshotUrl: '/images/people/chris-ng.jpg',
    avatarColor: '#9bf6ff',
    projectIds: ['care-ai', 'civic-play'],
  },
  {
    id: 'jordan-singh',
    firstName: 'Jordan',
    lastName: 'Singh',
    slug: 'jordan-singh',
    role: 'Postdoc',
    bioShort: 'Studies speculative design methods for inclusive climate futures and adaptation.',
    headshotUrl: '/images/people/jordan-singh.jpg',
    avatarColor: '#bdb2ff',
    projectIds: ['climate-storyworlds'],
  },
  {
    id: 'maya-lee',
    firstName: 'Maya',
    lastName: 'Lee',
    slug: 'maya-lee',
    role: 'Professor',
    bioShort: 'Leads the lab at the intersection of game design, HCI, and social impact.',
    headshotUrl: '/images/people/maya-lee.jpg',
    avatarColor: '#ffd6a5',
    projectIds: ['civic-play', 'care-ai'],
  },
  {
    id: 'ravi-patel',
    firstName: 'Ravi',
    lastName: 'Patel',
    slug: 'ravi-patel',
    role: 'Designer',
    bioShort: 'Designs tangible and narrative systems for collaborative and reflective play.',
    headshotUrl: '/images/people/ravi-patel.jpg',
    avatarColor: '#caffbf',
    projectIds: ['care-ai', 'climate-storyworlds'],
  },
  {
    id: 'sam-zhou',
    firstName: 'Sam',
    lastName: 'Zhou',
    slug: 'sam-zhou',
    role: 'RA',
    bioShort: 'Supports community co-design workshops and mixed-methods research synthesis.',
    headshotUrl: '/images/people/sam-zhou.jpg',
    avatarColor: '#f1c0e8',
    projectIds: ['civic-play'],
  },
];

export const getAlphabeticalPeople = (): Person[] =>
  [...people].sort((a, b) => {
    const lastNameCompare = a.lastName.localeCompare(b.lastName);
    if (lastNameCompare !== 0) {
      return lastNameCompare;
    }

    const firstNameCompare = a.firstName.localeCompare(b.firstName);
    if (firstNameCompare !== 0) {
      return firstNameCompare;
    }

    return a.id.localeCompare(b.id);
  });
