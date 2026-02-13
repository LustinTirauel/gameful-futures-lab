import { type CharacterConfig, validateCharacterConfig } from '../lib/characterOptions';

export type Person = {
  id: string;
  name: string;
  bio: string;
  tags: string[];
  tileX: number;
  tileY: number;
  x: number;
  y: number;
  zIndex: number;
};

type ScenePlacement = {
  tileX: number;
  tileY: number;
  x: number;
  y: number;
  zIndex: number;
};

const isoSceneConfig = {
  originXPercent: 50,
  originYPercent: 64,
  tileWidthPercent: 12,
  tileHeightPercent: 6.5,
  depthBase: 10,
  depthStep: 4,
  /**
   * Guardrails for future expansion:
   * - Keep Manhattan distance >= minTileGap between any two members to avoid silhouette overlap.
   * - Keep at most maxMembersPerTileCluster within a 3x3 cluster to prevent density spikes.
   */
  minTileGap: 1,
  maxMembersPerTileCluster: 3,
} as const;

function createScenePlacement(tileX: number, tileY: number): ScenePlacement {
  const x =
    isoSceneConfig.originXPercent +
    (tileX - tileY) * (isoSceneConfig.tileWidthPercent / 2);
  const y =
    isoSceneConfig.originYPercent +
    (tileX + tileY) * (isoSceneConfig.tileHeightPercent / 2);

  return {
    tileX,
    tileY,
    x,
    y,
    zIndex: isoSceneConfig.depthBase + (tileX + tileY) * isoSceneConfig.depthStep,
  };
}

export type Project = {
  id: string;
  title: string;
  summary: string;
  detailsHtml: string;
  memberIds: string[];
};

export const people: Person[] = [
  {
    id: 'alex',
    name: 'Alex',
    bio: 'Designs playful foresight methods.',
    tags: ['supervisor', 'qualitative'],
    ...createScenePlacement(-2, 0),
  },
  {
    id: 'bea',
    name: 'Bea',
    bio: 'Builds interactive world systems.',
    tags: ['quantitative', 'simulation'],
    ...createScenePlacement(-1, 1),
  },
  {
    id: 'chen',
    name: 'Chen',
    bio: 'Studies game narratives and futures.',
    tags: ['storytelling'],
    ...createScenePlacement(0, 0),
  },
  {
    id: 'dina',
    name: 'Dina',
    bio: 'Runs lab operations and outreach.',
    tags: ['coordination'],
    ...createScenePlacement(1, 1),
  },
  {
    id: 'eli',
    name: 'Eli',
    bio: 'Explores playful learning ecosystems.',
    tags: ['supervisor', 'learning'],
    ...createScenePlacement(2, 0),
  },
];

export const characterConfigs: Record<Person['id'], CharacterConfig> = {
  alex: validateCharacterConfig({
    pose: 'fishing',
    position: [-1.9, -0.24, -1.35],
    rotation: [0, 0.45, 0],
    headShape: 'sphere',
    bodyShape: 'cylinder',
    legShape: 'box',
    accessories: ['fishingRod', 'hat'],
    colors: {
      skin: '#ffd4aa',
      body: '#5ca5d8',
      legs: '#385a79',
      feet: '#233448',
      accessory: '#f2b96a',
    },
  }),
  bea: validateCharacterConfig({
    pose: 'sleeping',
    position: [-1.05, -0.24, -1.0],
    rotation: [0, -0.15, 0],
    headShape: 'box',
    bodyShape: 'box',
    legShape: 'box',
    accessories: ['pillow'],
    colors: {
      skin: '#f7d2b1',
      body: '#8bb17f',
      legs: '#566a50',
      feet: '#374630',
      accessory: '#d9f2ff',
    },
  }),
  chen: validateCharacterConfig({
    pose: 'chatting',
    position: [0.0, -0.24, -0.75],
    rotation: [0, -0.25, 0],
    headShape: 'cone',
    bodyShape: 'cone',
    legShape: 'cylinder',
    accessories: ['speechBubble', 'backpack'],
    colors: {
      skin: '#f7d4c0',
      body: '#cb8bb8',
      legs: '#755282',
      feet: '#4f3657',
      accessory: '#f7f0cb',
    },
  }),
  dina: validateCharacterConfig({
    pose: 'campfire-sit',
    position: [1.05, -0.24, -1.15],
    rotation: [0, -0.8, 0],
    headShape: 'sphere',
    bodyShape: 'box',
    legShape: 'cylinder',
    accessories: ['mug'],
    colors: {
      skin: '#ffd0b8',
      body: '#cb7b65',
      legs: '#7c4a4f',
      feet: '#50333a',
      accessory: '#f6c36f',
    },
  }),
  eli: validateCharacterConfig({
    pose: 'standing',
    position: [2.0, -0.24, -1.5],
    rotation: [0, -0.3, 0],
    headShape: 'box',
    bodyShape: 'cylinder',
    legShape: 'box',
    accessories: ['hat', 'backpack'],
    colors: {
      skin: '#ffd8b5',
      body: '#6fb790',
      legs: '#3f6c57',
      feet: '#2f4d3f',
      accessory: '#ffde8f',
    },
  }),
};

export const projects: Project[] = [
  {
    id: 'proto-worlds',
    title: 'Proto Worlds',
    summary: 'Rapid-play prototypes for speculative futures.',
    memberIds: ['alex', 'bea', 'chen'],
    detailsHtml:
      '<p>Proto Worlds combines workshops, playable scenes and storytelling prompts to evaluate alternative futures.</p><p><strong>Outputs:</strong> toolkits, showcases, and open resources.</p>',
  },
  {
    id: 'lake-signals',
    title: 'Lake Signals',
    summary: 'Collaborative sensing and narrative mapping.',
    memberIds: ['bea', 'dina', 'eli'],
    detailsHtml:
      '<p>Lake Signals investigates local environmental stories through low-tech sensing and roleplay.</p><p><strong>Publications:</strong> 2 conference papers and 1 exhibition piece.</p>',
  },
];
