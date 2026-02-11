import { GameConfig, Skin, ThemeType } from './types';

export const CONFIG: GameConfig = {
  mapWidth: 3000, // Increased slightly for more exploration
  mapHeight: 3000,
  roundTime: 120,
};

export const THEMES: Record<ThemeType, any> = {
  CITY: {
    name: "Metro City",
    description: "Consume cars, skyscrapers, and pedestrians in a bustling metropolis.",
    ground: '#cbd5e1', // Concrete
    road: '#334155',
    roadMarking: '#fbbf24',
    accent: '#3b82f6', // UI Color
  },
  FOREST: {
    name: "Whispering Woods",
    description: "Devour campers, cabins, and wildlife in a serene forest.",
    ground: '#4d7c0f', // Dark green grass
    road: '#a16207', // Dirt paths
    roadMarking: 'transparent',
    accent: '#22c55e',
  },
  DINO: {
    name: "Jurassic Valley",
    description: "Go back in time! Eat dinosaurs, volcanoes, and giant ferns.",
    ground: '#78350f', // Reddish dirt
    road: '#7c2d12', // Darker lava rock paths
    roadMarking: 'transparent',
    accent: '#ea580c',
  }
};

export const SKINS: Skin[] = [
  { id: 'default', name: 'Black Hole', color: '#1e293b', innerColor: '#000000' },
  { id: 'inferno', name: 'Magma', color: '#ef4444', innerColor: '#7f1d1d' },
  { id: 'toxic', name: 'Acid', color: '#84cc16', innerColor: '#3f6212' },
  { id: 'galaxy', name: 'Galaxy', color: '#6366f1', innerColor: '#312e81' },
  { id: 'gold', name: 'Midas', color: '#eab308', innerColor: '#713f12' },
  { id: 'ice', name: 'Glacier', color: '#06b6d4', innerColor: '#164e63' },
];

export const PROP_TYPES = {
  // CITY
  PEDESTRIAN: { minRadius: 4, maxRadius: 4, depth: 8, points: 1, growth: 0.1 },
  TRAFFIC_LIGHT: { minRadius: 3, maxRadius: 3, depth: 40, points: 10, growth: 0.2 },
  BIKE: { minRadius: 6, maxRadius: 6, depth: 8, points: 10, growth: 0.3 },
  CAR: { minRadius: 12, maxRadius: 14, depth: 14, points: 25, growth: 1.0 },
  TRUCK: { minRadius: 18, maxRadius: 22, depth: 25, points: 60, growth: 2.0 },
  STORE: { minRadius: 30, maxRadius: 40, depth: 30, points: 120, growth: 4.0 },
  BUILDING: { minRadius: 45, maxRadius: 55, depth: 80, points: 250, growth: 6.0 },
  SKYSCRAPER: { minRadius: 70, maxRadius: 90, depth: 200, points: 1500, growth: 15.0 },
  
  // FOREST
  BUSH: { minRadius: 6, maxRadius: 8, depth: 6, points: 2, growth: 0.1 },
  ROCK: { minRadius: 10, maxRadius: 15, depth: 10, points: 15, growth: 0.5 },
  TREE: { minRadius: 10, maxRadius: 14, depth: 60, points: 20, growth: 0.8 },
  TENT: { minRadius: 15, maxRadius: 20, depth: 15, points: 50, growth: 1.5 },
  CABIN: { minRadius: 35, maxRadius: 45, depth: 40, points: 200, growth: 5.0 },
  
  // DINO
  DINO_EGG: { minRadius: 5, maxRadius: 6, depth: 8, points: 5, growth: 0.2 },
  FERN: { minRadius: 12, maxRadius: 16, depth: 30, points: 15, growth: 0.5 },
  BONE: { minRadius: 15, maxRadius: 25, depth: 5, points: 30, growth: 0.8 },
  DINO_SMALL: { minRadius: 8, maxRadius: 10, depth: 12, points: 20, growth: 0.6 },
  DINO_MEDIUM: { minRadius: 20, maxRadius: 25, depth: 25, points: 100, growth: 2.5 },
  DINO_LARGE: { minRadius: 40, maxRadius: 50, depth: 60, points: 500, growth: 10.0 },
  VOLCANO: { minRadius: 80, maxRadius: 100, depth: 150, points: 2000, growth: 20.0 },
};

export const BOT_NAMES = [
  "AbyssMaw", "DarkStar", "VoidRunner", "Nebula", "Quasar",
  "Singularity", "EventHorizon", "GravityWell", "Supernova", "BlackSun",
  "TitanEater", "PlanetCrusher", "CosmicDust", "ZeroPoint", "Entropy"
];

export const PLAYER_START_RADIUS = 30;
export const MAX_VELOCITY = 6;
export const BOT_VELOCITY = 5.5;
