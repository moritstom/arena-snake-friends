// Shared types for the Slither.io game
// These types would be shared between client and server in a real implementation

export interface Position {
  x: number;
  y: number;
}

export interface Snake {
  id: string;
  playerId: string;
  playerName: string;
  segments: Position[];
  direction: number; // angle in radians
  color: string;
  isAlive: boolean;
  score: number;
}

export interface Pellet {
  id: string;
  position: Position;
  color: string;
  value: number; // score value when eaten
}

export interface GameState {
  snakes: Snake[];
  pellets: Pellet[];
  gameStarted: boolean;
  gameEnded: boolean;
  winner?: string;
  timestamp: number;
}

export interface Player {
  id: string;
  name: string;
  isReady: boolean;
  isHost: boolean;
}

export interface Lobby {
  code: string;
  players: Player[];
  maxPlayers: number;
  gameStarted: boolean;
  hostId: string;
}

export interface GameSettings {
  arenaWidth: number;
  arenaHeight: number;
  maxPlayers: number;
  pelletCount: number;
  snakeSpeed: number;
  turnSpeed: number;
}

// WebSocket message types
export interface WSMessage {
  type: string;
  data: any;
  timestamp: number;
}

export interface JoinLobbyMessage extends WSMessage {
  type: 'JOIN_LOBBY';
  data: {
    lobbyCode: string;
    playerName: string;
  };
}

export interface CreateLobbyMessage extends WSMessage {
  type: 'CREATE_LOBBY';
  data: {
    playerName: string;
  };
}

export interface StartGameMessage extends WSMessage {
  type: 'START_GAME';
  data: {};
}

export interface PlayerInputMessage extends WSMessage {
  type: 'PLAYER_INPUT';
  data: {
    direction: number;
    timestamp: number;
  };
}

export interface GameUpdateMessage extends WSMessage {
  type: 'GAME_UPDATE';
  data: GameState;
}

export interface LobbyUpdateMessage extends WSMessage {
  type: 'LOBBY_UPDATE';
  data: Lobby;
}

// Game constants
export const GAME_CONSTANTS = {
  ARENA_WIDTH: 1200,
  ARENA_HEIGHT: 800,
  SNAKE_SEGMENT_SIZE: 8,
  PELLET_SIZE: 6,
  SNAKE_SPEED: 2,
  TURN_SPEED: 0.05,
  PELLET_COUNT: 50,
  MAX_PLAYERS: 10,
  SNAKE_COLORS: [
    'hsl(200, 100%, 50%)', // Primary blue
    'hsl(120, 100%, 50%)', // Green  
    'hsl(280, 100%, 60%)', // Purple
    'hsl(0, 100%, 60%)',   // Red
    'hsl(30, 100%, 60%)',  // Orange
    'hsl(180, 100%, 50%)', // Cyan
    'hsl(300, 100%, 60%)', // Magenta
    'hsl(60, 100%, 50%)',  // Yellow
    'hsl(240, 100%, 60%)', // Blue purple
    'hsl(150, 100%, 50%)', // Teal
  ],
  PELLET_COLORS: [
    'hsl(60, 100%, 60%)',  // Yellow
    'hsl(30, 100%, 60%)',  // Orange
    'hsl(300, 100%, 60%)', // Magenta
    'hsl(180, 100%, 50%)', // Cyan
  ]
};