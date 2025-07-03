import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skull, Trophy, Users, Home } from 'lucide-react';
import { GameState } from '@/types/game';

interface GameUIProps {
  gameState: GameState;
  playerId: string;
  onBackToLobby: () => void;
}

export const GameUI: React.FC<GameUIProps> = ({
  gameState,
  playerId,
  onBackToLobby
}) => {
  const playerSnake = gameState.snakes.find(snake => snake.playerId === playerId);
  const isPlayerAlive = playerSnake?.isAlive || false;
  const playerScore = playerSnake?.score || 0;

  // Create leaderboard sorted by score
  const leaderboard = gameState.snakes
    .slice()
    .sort((a, b) => b.score - a.score)
    .slice(0, 5); // Top 5 players

  if (gameState.gameEnded) {
    const winner = gameState.snakes.find(snake => snake.playerId === gameState.winner);
    
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-md bg-card/90 backdrop-blur border-primary/30">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="space-y-2">
              <Trophy className="h-12 w-12 text-accent mx-auto" />
              <h2 className="text-2xl font-bold">Game Over!</h2>
              {winner && (
                <p className="text-lg">
                  🏆 <span className="text-accent font-semibold">{winner.playerName}</span> wins!
                </p>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Final Leaderboard</h3>
              <div className="space-y-1">
                {leaderboard.map((snake, index) => (
                  <div key={snake.id} className="flex items-center justify-between p-2 rounded bg-muted/20">
                    <span className="flex items-center gap-2">
                      <Badge variant={index === 0 ? 'default' : 'secondary'} className="w-6 h-6 p-0 rounded-full">
                        {index + 1}
                      </Badge>
                      {snake.playerName}
                      {snake.playerId === playerId && ' (You)'}
                    </span>
                    <span className="font-mono">{snake.score}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button variant="game" size="lg" className="w-full" onClick={onBackToLobby}>
              <Home className="mr-2 h-4 w-4" />
              Back to Lobby
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isPlayerAlive) {
    return (
      <div className="fixed inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-md bg-card/90 backdrop-blur border-destructive/30">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="space-y-2">
              <Skull className="h-12 w-12 text-destructive mx-auto" />
              <h2 className="text-2xl font-bold text-destructive">You Died!</h2>
              <p className="text-muted-foreground">
                Final Score: <span className="font-mono text-lg">{playerScore}</span>
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Current Leaderboard</h3>
              <div className="space-y-1">
                {leaderboard.map((snake, index) => (
                  <div key={snake.id} className="flex items-center justify-between p-2 rounded bg-muted/20">
                    <span className="flex items-center gap-2">
                      <Badge variant={index === 0 ? 'default' : 'secondary'} className="w-6 h-6 p-0 rounded-full">
                        {index + 1}
                      </Badge>
                      {snake.playerName}
                      {!snake.isAlive && <Skull className="h-3 w-3 text-muted-foreground" />}
                    </span>
                    <span className="font-mono">{snake.score}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button variant="game" size="lg" className="w-full" onClick={onBackToLobby}>
              <Home className="mr-2 h-4 w-4" />
              Back to Lobby
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Game UI overlay for alive players
  return (
    <>
      {/* Top-left: Player score */}
      <Card className="fixed top-4 left-4 bg-card/80 backdrop-blur border-primary/30 z-40">
        <CardContent className="p-3">
          <div className="text-center space-y-1">
            <div className="text-xs text-muted-foreground">Your Score</div>
            <div className="text-xl font-mono font-bold text-primary">{playerScore}</div>
          </div>
        </CardContent>
      </Card>

      {/* Top-right: Leaderboard */}
      <Card className="fixed top-4 right-4 bg-card/80 backdrop-blur border-primary/30 z-40">
        <CardContent className="p-3">
          <div className="space-y-2 min-w-[200px]">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Trophy className="h-4 w-4" />
              Leaderboard
            </div>
            {leaderboard.slice(0, 3).map((snake, index) => (
              <div key={snake.id} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Badge 
                    variant={index === 0 ? 'default' : 'secondary'} 
                    className="w-5 h-5 p-0 rounded-full text-xs"
                  >
                    {index + 1}
                  </Badge>
                  <span className={snake.playerId === playerId ? 'text-primary font-semibold' : ''}>
                    {snake.playerName}
                  </span>
                  {!snake.isAlive && <Skull className="h-3 w-3 text-muted-foreground" />}
                </span>
                <span className="font-mono">{snake.score}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bottom-center: Controls help */}
      <Card className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-card/80 backdrop-blur border-primary/30 z-40">
        <CardContent className="p-3">
          <div className="text-center space-y-1">
            <div className="text-xs text-muted-foreground">Controls</div>
            <div className="text-xs">
              <kbd className="px-1 py-0.5 text-xs bg-muted rounded">←→</kbd> or{' '}
              <kbd className="px-1 py-0.5 text-xs bg-muted rounded">A</kbd>
              <kbd className="px-1 py-0.5 text-xs bg-muted rounded">D</kbd> to steer
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top-center: Players alive count */}
      <Card className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-card/80 backdrop-blur border-primary/30 z-40">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4" />
            <span>{gameState.snakes.filter(s => s.isAlive).length} players alive</span>
          </div>
        </CardContent>
      </Card>
    </>
  );
};