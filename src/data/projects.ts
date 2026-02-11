export type Project = {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  images: string[];
  publications: string[];
  memberIds: string[];
  position: [number, number, number];
};

export const projects: Project[] = [
  {
    id: 'civic-play',
    slug: 'civic-play',
    title: 'Civic Play',
    tagline: 'Civic imagination through multiplayer urban play.',
    description:
      'Designing location-based and tabletop play experiences that help communities rehearse civic action and policy dialogue.',
    images: ['/images/projects/civic-play-1.jpg', '/images/projects/civic-play-2.jpg'],
    publications: ['Playful Civics Toolkit (CHI 2025)', 'Urban Roleplay Methods (DIS 2024)'],
    memberIds: ['alex-kim', 'chris-ng', 'maya-lee', 'sam-zhou'],
    position: [-4, 0, -2],
  },
  {
    id: 'climate-storyworlds',
    slug: 'climate-storyworlds',
    title: 'Climate Storyworlds',
    tagline: 'Speculative futures for climate adaptation.',
    description:
      'Co-creating interactive narratives and worldbuilding frameworks that surface local values in climate transition planning.',
    images: ['/images/projects/climate-storyworlds-1.jpg', '/images/projects/climate-storyworlds-2.jpg'],
    publications: ['Storyworlding for Adaptation (TEI 2025)'],
    memberIds: ['alex-kim', 'jordan-singh', 'ravi-patel'],
    position: [0, 0, -1],
  },
  {
    id: 'care-ai',
    slug: 'care-ai',
    title: 'Care + AI',
    tagline: 'Human-centered AI for care collectives.',
    description:
      'Prototyping assistive AI systems that strengthen coordination, trust, and agency in neighborhood and institutional care settings.',
    images: ['/images/projects/care-ai-1.jpg', '/images/projects/care-ai-2.jpg'],
    publications: ['Participatory Care Agents (CSCW 2024)', 'Designing Accountable AI Care Tools (FAccT 2025)'],
    memberIds: ['chris-ng', 'maya-lee', 'ravi-patel'],
    position: [4, 0, -2],
  },
];
