import { create } from 'zustand';
import { RouteKey } from '../scene/layouts';

type LabWorldState = {
  route: RouteKey;
  setRoute: (route: RouteKey) => void;
};

export const useLabWorldStore = create<LabWorldState>((set) => ({
  route: 'home',
  setRoute: (route) => set({ route }),
}));
