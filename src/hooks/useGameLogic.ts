import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  GameState, 
  Snake, 
  Pellet, 
  Position, 
  Player, 
  Lobby,
  GAME_CONSTANTS 
} from '@/types/game';
import { toast } from 'sonner';

// Mock WebSocket implementation for demo purposes
// In a real implementation, this would connect to an actual WebSocket server
class MockWebSocket {
  private listeners: Map<string, ((data: any) => void)[]> = new Map();
  private gameLogic: GameLogic;

  constructor(gameLogic: GameLogic) {
    this.gameLogic = gameLogic;
  }

  on(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  emit(event: string, data: any) {
    // Simulate server processing with slight delay
    setTimeout(() => {
      this.gameLogic.handleServerMessage(event, data);
    }, 50);
  }

  trigger(event: string, data: any) {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(callback => callback(data));
  }
}

class GameLogic {
  private socket: MockWebSocket;
  private gameState: GameState;
  private lobby: Lobby | null = null;
  private currentPlayerId: string;
  private updateInterval: NodeJS.Timeout | null = null;
  private onStateUpdate: (state: any) => void;

  constructor(onStateUpdate: (state: any) => void) {
    this.onStateUpdate = onStateUpdate;
    this.currentPlayerId = this.generateId();
    this.socket = new MockWebSocket(this);
    this.gameState = this.createEmptyGameState();
    
    this.setupSocketListeners();
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private generateLobbyCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private createEmptyGameState(): GameState {
    return {
      snakes: [],
      pellets: [],
      gameStarted: false,
      gameEnded: false,
      timestamp: Date.now()
    };
  }

  private setupSocketListeners() {
    // These would be real WebSocket events in a full implementation
  }

  // Public methods for the hook
  createLobby(playerName: string) {
    const lobbyCode = this.generateLobbyCode();
    const hostPlayer: Player = {
      id: this.currentPlayerId,
      name: playerName,
      isReady: true,
      isHost: true
    };

    this.lobby = {
      code: lobbyCode,
      players: [hostPlayer],
      maxPlayers: GAME_CONSTANTS.MAX_PLAYERS,
      gameStarted: false,
      hostId: this.currentPlayerId
    };

    this.onStateUpdate({
      lobby: this.lobby,
      gameState: this.gameState,
      playerId: this.currentPlayerId
    });

    toast.success(`Lobby created! Code: ${lobbyCode}`);
  }

  joinLobby(lobbyCode: string, playerName: string) {
    // In a real implementation, this would validate the lobby exists on the server
    if (!this.lobby || this.lobby.code !== lobbyCode) {
      // Create a mock lobby for demo
      this.lobby = {
        code: lobbyCode,
        players: [
          {
            id: 'mock-host',
            name: 'Host Player',
            isReady: true,
            isHost: true
          }
        ],
        maxPlayers: GAME_CONSTANTS.MAX_PLAYERS,
        gameStarted: false,
        hostId: 'mock-host'
      };
    }

    const newPlayer: Player = {
      id: this.currentPlayerId,
      name: playerName,
      isReady: true,
      isHost: false
    };

    this.lobby.players.push(newPlayer);

    this.onStateUpdate({
      lobby: this.lobby,
      gameState: this.gameState,
      playerId: this.currentPlayerId
    });

    toast.success(`Joined lobby ${lobbyCode}!`);
  }

  startGame() {
    if (!this.lobby) return;

    // Initialize game state
    this.gameState = this.createInitialGameState(this.lobby.players);
    this.lobby.gameStarted = true;

    this.onStateUpdate({
      lobby: this.lobby,
      gameState: this.gameState,
      playerId: this.currentPlayerId
    });

    // Start game loop
    this.startGameLoop();
    toast.success('Game started!');
  }

  leaveLobby() {
    this.lobby = null;
    this.gameState = this.createEmptyGameState();
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    this.onStateUpdate({
      lobby: null,
      gameState: this.gameState,
      playerId: this.currentPlayerId
    });
  }

  updatePlayerDirection(direction: number) {
    const playerSnake = this.gameState.snakes.find(s => s.playerId === this.currentPlayerId);
    if (playerSnake && playerSnake.isAlive) {
      playerSnake.direction = direction;
    }
  }

  // Game logic methods
  private createInitialGameState(players: Player[]): GameState {
    const snakes: Snake[] = players.map((player, index) => {
      const angle = (index / players.length) * Math.PI * 2;
      const startX = GAME_CONSTANTS.ARENA_WIDTH / 2 + Math.cos(angle) * 100;
      const startY = GAME_CONSTANTS.ARENA_HEIGHT / 2 + Math.sin(angle) * 100;

      return {
        id: this.generateId(),
        playerId: player.id,
        playerName: player.name,
        segments: [
          { x: startX, y: startY },
          { x: startX - Math.cos(angle) * 10, y: startY - Math.sin(angle) * 10 },
          { x: startX - Math.cos(angle) * 20, y: startY - Math.sin(angle) * 20 }
        ],
        direction: angle,
        color: GAME_CONSTANTS.SNAKE_COLORS[index % GAME_CONSTANTS.SNAKE_COLORS.length],
        isAlive: true,
        score: 3
      };
    });

    const pellets: Pellet[] = [];
    for (let i = 0; i < GAME_CONSTANTS.PELLET_COUNT; i++) {
      pellets.push(this.createRandomPellet());
    }

    return {
      snakes,
      pellets,
      gameStarted: true,
      gameEnded: false,
      timestamp: Date.now()
    };
  }

  private createRandomPellet(): Pellet {
    return {
      id: this.generateId(),
      position: {
        x: Math.random() * (GAME_CONSTANTS.ARENA_WIDTH - 40) + 20,
        y: Math.random() * (GAME_CONSTANTS.ARENA_HEIGHT - 40) + 20
      },
      color: GAME_CONSTANTS.PELLET_COLORS[Math.floor(Math.random() * GAME_CONSTANTS.PELLET_COLORS.length)],
      value: 1
    };
  }

  private startGameLoop() {
    this.updateInterval = setInterval(() => {
      this.updateGame();
    }, 1000 / 30); // 30 FPS
  }

  private updateGame() {
    if (!this.gameState.gameStarted || this.gameState.gameEnded) return;

    // Update snake positions
    this.gameState.snakes.forEach(snake => {
      if (!snake.isAlive) return;

      // Move snake head
      const head = snake.segments[0];
      const newHead: Position = {
        x: head.x + Math.cos(snake.direction) * GAME_CONSTANTS.SNAKE_SPEED,
        y: head.y + Math.sin(snake.direction) * GAME_CONSTANTS.SNAKE_SPEED
      };

      // Check arena boundaries
      if (newHead.x < 0 || newHead.x > GAME_CONSTANTS.ARENA_WIDTH ||
          newHead.y < 0 || newHead.y > GAME_CONSTANTS.ARENA_HEIGHT) {
        snake.isAlive = false;
        return;
      }

      // Check collision with other snakes
      for (const otherSnake of this.gameState.snakes) {
        if (otherSnake.id === snake.id || !otherSnake.isAlive) continue;
        
        for (const segment of otherSnake.segments) {
          const distance = Math.sqrt(
            Math.pow(newHead.x - segment.x, 2) + Math.pow(newHead.y - segment.y, 2)
          );
          if (distance < GAME_CONSTANTS.SNAKE_SEGMENT_SIZE) {
            snake.isAlive = false;
            return;
          }
        }
      }

      // Check self collision (skip head)
      for (let i = 1; i < snake.segments.length; i++) {
        const segment = snake.segments[i];
        const distance = Math.sqrt(
          Math.pow(newHead.x - segment.x, 2) + Math.pow(newHead.y - segment.y, 2)
        );
        if (distance < GAME_CONSTANTS.SNAKE_SEGMENT_SIZE) {
          snake.isAlive = false;
          return;
        }
      }

      // Check pellet collision
      let ateFood = false;
      this.gameState.pellets = this.gameState.pellets.filter(pellet => {
        const distance = Math.sqrt(
          Math.pow(newHead.x - pellet.position.x, 2) + Math.pow(newHead.y - pellet.position.y, 2)
        );
        if (distance < GAME_CONSTANTS.SNAKE_SEGMENT_SIZE + GAME_CONSTANTS.PELLET_SIZE) {
          snake.score += pellet.value;
          ateFood = true;
          return false; // Remove pellet
        }
        return true;
      });

      // Update snake segments
      snake.segments.unshift(newHead);
      if (!ateFood) {
        snake.segments.pop(); // Remove tail if no food eaten
      }
    });

    // Respawn pellets
    while (this.gameState.pellets.length < GAME_CONSTANTS.PELLET_COUNT) {
      this.gameState.pellets.push(this.createRandomPellet());
    }

    // Check win condition
    const aliveSnakes = this.gameState.snakes.filter(s => s.isAlive);
    if (aliveSnakes.length <= 1) {
      this.gameState.gameEnded = true;
      if (aliveSnakes.length === 1) {
        this.gameState.winner = aliveSnakes[0].playerId;
      }
      if (this.updateInterval) {
        clearInterval(this.updateInterval);
        this.updateInterval = null;
      }
    }

    this.gameState.timestamp = Date.now();
    this.onStateUpdate({
      lobby: this.lobby,
      gameState: this.gameState,
      playerId: this.currentPlayerId
    });
  }

  // Handle server messages (for real WebSocket implementation)
  handleServerMessage(event: string, data: any) {
    // This would handle real server messages
  }

  cleanup() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }
}

export const useGameLogic = () => {
  const [state, setState] = useState<{
    lobby: Lobby | null;
    gameState: GameState;
    playerId: string;
  }>({
    lobby: null,
    gameState: {
      snakes: [],
      pellets: [],
      gameStarted: false,
      gameEnded: false,
      timestamp: Date.now()
    },
    playerId: ''
  });

  const gameLogicRef = useRef<GameLogic | null>(null);

  useEffect(() => {
    gameLogicRef.current = new GameLogic(setState);
    
    return () => {
      gameLogicRef.current?.cleanup();
    };
  }, []);

  const createLobby = useCallback((playerName: string) => {
    gameLogicRef.current?.createLobby(playerName);
  }, []);

  const joinLobby = useCallback((lobbyCode: string, playerName: string) => {
    gameLogicRef.current?.joinLobby(lobbyCode, playerName);
  }, []);

  const startGame = useCallback(() => {
    gameLogicRef.current?.startGame();
  }, []);

  const leaveLobby = useCallback(() => {
    gameLogicRef.current?.leaveLobby();
  }, []);

  const updatePlayerDirection = useCallback((direction: number) => {
    gameLogicRef.current?.updatePlayerDirection(direction);
  }, []);

  return {
    lobby: state.lobby,
    gameState: state.gameState,
    playerId: state.playerId,
    createLobby,
    joinLobby,
    startGame,
    leaveLobby,
    updatePlayerDirection
  };
};