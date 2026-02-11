export type Project = {
  id: string;
  title: string;
  position: [number, number, number];
};

export const projects: Project[] = [
  { id: 'civic-play', title: 'Civic Play', position: [-4, 0, -2] },
  { id: 'climate-storyworlds', title: 'Climate Storyworlds', position: [0, 0, -1] },
  { id: 'care-ai', title: 'Care + AI', position: [4, 0, -2] },
];
