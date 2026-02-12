export type Person = {
  id: string;
  name: string;
  bio: string;
  tags: string[];
};

export type Project = {
  id: string;
  title: string;
  summary: string;
  detailsHtml: string;
  memberIds: string[];
};

export const people: Person[] = [
  { id: 'alex', name: 'Alex', bio: 'Designs playful foresight methods.', tags: ['supervisor', 'qualitative'] },
  { id: 'bea', name: 'Bea', bio: 'Builds interactive world systems.', tags: ['quantitative', 'simulation'] },
  { id: 'chen', name: 'Chen', bio: 'Studies game narratives and futures.', tags: ['storytelling'] },
  { id: 'dina', name: 'Dina', bio: 'Runs lab operations and outreach.', tags: ['coordination'] },
  { id: 'eli', name: 'Eli', bio: 'Explores playful learning ecosystems.', tags: ['supervisor', 'learning'] }
];

export const projects: Project[] = [
  {
    id: 'proto-worlds',
    title: 'Proto Worlds',
    summary: 'Rapid-play prototypes for speculative futures.',
    memberIds: ['alex', 'bea', 'chen'],
    detailsHtml: '<p>Proto Worlds combines workshops, playable scenes and storytelling prompts to evaluate alternative futures.</p><p><strong>Outputs:</strong> toolkits, showcases, and open resources.</p>'
  },
  {
    id: 'lake-signals',
    title: 'Lake Signals',
    summary: 'Collaborative sensing and narrative mapping.',
    memberIds: ['bea', 'dina', 'eli'],
    detailsHtml: '<p>Lake Signals investigates local environmental stories through low-tech sensing and roleplay.</p><p><strong>Publications:</strong> 2 conference papers and 1 exhibition piece.</p>'
  }
];
