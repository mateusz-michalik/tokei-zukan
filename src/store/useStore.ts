import { createContext, useContext } from 'react';
import type { UserState, Watch } from './types';

export interface Store {
  state: UserState;
  /** The user's list, each entry merged with its catalogue data. */
  watches: Watch[];
  byId: (id: string | undefined) => Watch | undefined;
  /** The watch sizes are compared against: the one chosen in settings, else the first one owned. */
  refWatch: Watch | undefined;
  /** The page is in its dark theme, chosen or following the device. Independent of how the watches are lit. */
  dark: boolean;
  /** Applies a change to a copy of the state, then saves it. */
  update: (fn: (s: UserState) => void) => void;
  /** Marks a watch owned or not; unowning takes it out of every box, and never touches its like. */
  setOwned: (id: string, on: boolean) => void;
  toast: (msg: string) => void;
  toasts: { id: number; msg: string }[];
}

export const StoreContext = createContext<Store | null>(null);

export function useStore() {
  const s = useContext(StoreContext);
  if (!s) throw new Error('useStore outside StoreProvider');
  return s;
}
