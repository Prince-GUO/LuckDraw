
export interface Member {
  id: string;
  name: string;
  department?: string;
}

export interface Award {
  id: string;
  name: string;
  count: number;
  batchSize?: number; // Number of people to draw per round
  images?: string[]; // Support multiple prize images
  winners: Member[];
}

export interface AppConfig {
  bgImage?: string;
  bgMusic?: string;
  themeColor: string;
}

export enum AppState {
  SETUP = 'SETUP',
  READY = 'READY',
  DRAWING = 'DRAWING',
  RESULT = 'RESULT'
}
