import React, { useRef, useEffect, useCallback } from 'react';
import { GameState, Position, Snake, Pellet, GAME_CONSTANTS } from '@/types/game';

interface GameCanvasProps {
  gameState: GameState;
  playerId: string;
  onPlayerInput: (direction: number) => void;
  className?: string;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  gameState,
  playerId,
  onPlayerInput,
  className
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const keysPressed = useRef<Set<string>>(new Set());

  // Handle keyboard input
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    keysPressed.current.add(event.code);
  }, []);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    keysPressed.current.delete(event.code);
  }, []);

  // Process input and update direction
  const processInput = useCallback(() => {
    const playerSnake = gameState.snakes.find(snake => snake.playerId === playerId);
    if (!playerSnake || !playerSnake.isAlive) return;

    let newDirection = playerSnake.direction;
    
    if (keysPressed.current.has('ArrowLeft') || keysPressed.current.has('KeyA')) {
      newDirection -= GAME_CONSTANTS.TURN_SPEED;
    }
    if (keysPressed.current.has('ArrowRight') || keysPressed.current.has('KeyD')) {
      newDirection += GAME_CONSTANTS.TURN_SPEED;
    }
    if (keysPressed.current.has('ArrowUp') || keysPressed.current.has('KeyW')) {
      // Optional: boost speed (could be a power-up)
    }
    if (keysPressed.current.has('ArrowDown') || keysPressed.current.has('KeyS')) {
      // Optional: slow down
    }

    if (newDirection !== playerSnake.direction) {
      onPlayerInput(newDirection);
    }
  }, [gameState.snakes, playerId, onPlayerInput]);

  // Render game on canvas
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with game background
    ctx.fillStyle = 'hsl(220, 30%, 12%)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw arena border
    ctx.strokeStyle = 'hsl(220, 20%, 25%)';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // Draw pellets
    gameState.pellets.forEach(pellet => {
      drawPellet(ctx, pellet);
    });

    // Draw snakes
    gameState.snakes.forEach(snake => {
      if (snake.isAlive) {
        drawSnake(ctx, snake, snake.playerId === playerId);
      }
    });

    // Continue animation
    processInput();
    animationFrameRef.current = requestAnimationFrame(render);
  }, [gameState, playerId, processInput]);

  // Draw a snake with glow effect
  const drawSnake = (ctx: CanvasRenderingContext2D, snake: Snake, isPlayer: boolean) => {
    const segmentSize = GAME_CONSTANTS.SNAKE_SEGMENT_SIZE;
    
    snake.segments.forEach((segment, index) => {
      const isHead = index === 0;
      const alpha = isHead ? 1 : Math.max(0.3, 1 - (index * 0.1));
      
      // Add glow effect for player snake
      if (isPlayer && isHead) {
        ctx.shadowColor = snake.color;
        ctx.shadowBlur = 15;
      } else {
        ctx.shadowBlur = 0;
      }
      
      ctx.fillStyle = snake.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
      ctx.beginPath();
      ctx.arc(segment.x, segment.y, segmentSize, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw eyes on head
      if (isHead) {
        drawSnakeHead(ctx, segment, snake.direction, segmentSize, isPlayer);
      }
    });
    
    ctx.shadowBlur = 0; // Reset shadow
  };

  // Draw snake head with eyes
  const drawSnakeHead = (
    ctx: CanvasRenderingContext2D, 
    position: Position, 
    direction: number, 
    size: number,
    isPlayer: boolean
  ) => {
    const eyeOffset = size * 0.3;
    const eyeSize = size * 0.2;
    
    // Calculate eye positions
    const leftEyeX = position.x + Math.cos(direction - 0.5) * eyeOffset;
    const leftEyeY = position.y + Math.sin(direction - 0.5) * eyeOffset;
    const rightEyeX = position.x + Math.cos(direction + 0.5) * eyeOffset;
    const rightEyeY = position.y + Math.sin(direction + 0.5) * eyeOffset;
    
    // Draw eyes
    ctx.fillStyle = isPlayer ? '#ffffff' : '#ffffff';
    ctx.beginPath();
    ctx.arc(leftEyeX, leftEyeY, eyeSize, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(rightEyeX, rightEyeY, eyeSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw pupils
    ctx.fillStyle = '#000000';
    const pupilSize = eyeSize * 0.6;
    ctx.beginPath();
    ctx.arc(leftEyeX, leftEyeY, pupilSize, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(rightEyeX, rightEyeY, pupilSize, 0, Math.PI * 2);
    ctx.fill();
  };

  // Draw pellet with glow
  const drawPellet = (ctx: CanvasRenderingContext2D, pellet: Pellet) => {
    const size = GAME_CONSTANTS.PELLET_SIZE;
    
    // Add glow effect
    ctx.shadowColor = pellet.color;
    ctx.shadowBlur = 10;
    
    ctx.fillStyle = pellet.color;
    ctx.beginPath();
    ctx.arc(pellet.position.x, pellet.position.y, size, 0, Math.PI * 2);
    ctx.fill();
    
    // Inner highlight
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(pellet.position.x - size * 0.3, pellet.position.y - size * 0.3, size * 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.shadowBlur = 0; // Reset shadow
  };

  // Set up canvas and event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    canvas.width = GAME_CONSTANTS.ARENA_WIDTH;
    canvas.height = GAME_CONSTANTS.ARENA_HEIGHT;

    // Add event listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Start render loop
    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [handleKeyDown, handleKeyUp, render]);

  return (
    <canvas
      ref={canvasRef}
      className={`border-2 border-primary rounded-lg shadow-glow-primary ${className}`}
      style={{
        maxWidth: '100%',
        maxHeight: '70vh',
        aspectRatio: `${GAME_CONSTANTS.ARENA_WIDTH}/${GAME_CONSTANTS.ARENA_HEIGHT}`
      }}
    />
  );
};