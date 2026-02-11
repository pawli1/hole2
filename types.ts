export interface Point {
  x: number;
  y: number;
}

export interface GameObject {
  id: string;
  x: number;
  y: number;
  radius: number; // For collision/rendering
  color: string;
}

export enum PropType {
  // City
  Pedestrian = 'PEDESTRIAN',
  TrafficLight = 'TRAFFIC_LIGHT',
  Bike = 'BIKE',
  Car = 'CAR',
  Truck = 'TRUCK',
  Store = 'STORE',
  Building = 'BUILDING',
  Skyscraper = 'SKYSCRAPER',
  
  // Forest
  Tree = 'TREE',
  Rock = 'ROCK',
  Bush = 'BUSH',
  Cabin = 'CABIN',
  Tent = 'TENT',
  
  // Dino
  DinoEgg = 'DINO_EGG',
  DinoSmall = 'DINO_SMALL', // Raptor-ish
  DinoMedium = 'DINO_MEDIUM', // Triceratops-ish
  DinoLarge = 'DINO_LARGE', // Bronto-ish
  Fern = 'FERN',
  Volcano = 'VOLCANO',
  Bone = 'BONE'
}

export interface MapProp extends GameObject {
  type: PropType;
  width: number;
  height: number;
  depth: number; // 2.5D Height
  rotation: number;
  points: number; // Score value
  isFalling?: boolean; // Animation state
  fallingTo?: string; // ID of hole eating it
  fallScale?: number; // 0 to 1
  shape: 'circle' | 'rect' | 'poly'; // Added poly for more complex shapes like trees/volcanoes
  colorDetail?: string; // Secondary color
  velocity?: Point; // For moving objects
}

export interface Skin {
  id: string;
  name: string;
  color: string; // Main ring color
  innerColor: string; // Inner glow
}

export interface Hole extends GameObject {
  name: string;
  score: number;
  isBot: boolean;
  target?: Point; // For bot AI
  velocity: Point;
  skin: Skin; 
}

export interface GameConfig {
  mapWidth: number;
  mapHeight: number;
  roundTime: number; // seconds
}

export interface GameState {
  isPlaying: boolean;
  isGameOver: boolean;
  timeLeft: number;
  player: Hole | null;
  bots: Hole[];
  props: MapProp[];
  winner: string | null;
}

export type ThemeType = 'CITY' | 'FOREST' | 'DINO';
