import { getAlphabeticalPeople, people } from '../data/people';
import { projects } from '../data/projects';

export type RouteKey = 'home' | 'projects' | 'people';

export type PositionMap = Record<string, [number, number, number]>;

const homeLayout: PositionMap = Object.fromEntries(
  people.map((person, index) => {
    const angle = (index / people.length) * Math.PI * 2;
    return [person.id, [Math.cos(angle) * 3, 0, Math.sin(angle) * 3] as [number, number, number]];
  }),
);

const projectLayout: PositionMap = Object.fromEntries(
  people.map((person, index) => {
    const project = projects[index % projects.length];
    const offset = (index % 2 === 0 ? 1 : -1) * (0.8 + (index % 3) * 0.15);
    return [
      person.id,
      [project.position[0] + offset, 0, project.position[2] + (index % 3) * 0.7] as [number, number, number],
    ];
  }),
);

const peopleLayout: PositionMap = Object.fromEntries(
  getAlphabeticalPeople().map((person, index) => {
    const columns = 3;
    const column = index % columns;
    const row = Math.floor(index / columns);
    const x = -3 + column * 3;
    const z = -1 + row * 2.5;

    return [person.id, [x, 0, z] as [number, number, number]];
  }),
);

export const routeLayouts: Record<RouteKey, PositionMap> = {
  home: homeLayout,
  projects: projectLayout,
  people: peopleLayout,
};
