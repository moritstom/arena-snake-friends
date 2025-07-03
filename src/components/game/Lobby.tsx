import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, Crown, Users, Play } from 'lucide-react';
import { Player } from '@/types/game';
import { toast } from 'sonner';

interface LobbyProps {
  lobbyCode?: string;
  players: Player[];
  currentPlayerId: string;
  isHost: boolean;
  onCreateLobby: (playerName: string) => void;
  onJoinLobby: (lobbyCode: string, playerName: string) => void;
  onStartGame: () => void;
  onLeaveLobby: () => void;
}

export const Lobby: React.FC<LobbyProps> = ({
  lobbyCode,
  players,
  currentPlayerId,
  isHost,
  onCreateLobby,
  onJoinLobby,
  onStartGame,
  onLeaveLobby
}) => {
  const [playerName, setPlayerName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [showJoin, setShowJoin] = useState(false);

  const handleCreateLobby = () => {
    if (!playerName.trim()) {
      toast.error('Please enter your name');
      return;
    }
    onCreateLobby(playerName.trim());
  };

  const handleJoinLobby = () => {
    if (!playerName.trim()) {
      toast.error('Please enter your name');
      return;
    }
    if (!joinCode.trim()) {
      toast.error('Please enter lobby code');
      return;
    }
    onJoinLobby(joinCode.trim().toUpperCase(), playerName.trim());
  };

  const copyLobbyCode = () => {
    if (lobbyCode) {
      navigator.clipboard.writeText(lobbyCode);
      toast.success('Lobby code copied!');
    }
  };

  // If not in a lobby, show the join/create interface
  if (!lobbyCode) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              🐍 Slither.io
            </h1>
            <p className="text-muted-foreground">
              Enter the arena and become the longest snake!
            </p>
          </div>

          <Card className="bg-card/50 backdrop-blur border-primary/20">
            <CardHeader>
              <CardTitle className="text-center">Join the Game</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                type="text"
                placeholder="Enter your name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="text-center text-lg"
                maxLength={20}
              />

              <div className="space-y-3">
                <Button 
                  variant="game" 
                  size="lg" 
                  className="w-full"
                  onClick={handleCreateLobby}
                  disabled={!playerName.trim()}
                >
                  <Crown className="mr-2 h-4 w-4" />
                  Create Lobby
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-primary/20" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">or</span>
                  </div>
                </div>

                {!showJoin ? (
                  <Button 
                    variant="lobby" 
                    size="lg" 
                    className="w-full"
                    onClick={() => setShowJoin(true)}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Join Existing Lobby
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Input
                      type="text"
                      placeholder="Enter lobby code"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      className="text-center tracking-widest"
                      maxLength={6}
                    />
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => setShowJoin(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        variant="lobby" 
                        className="flex-1"
                        onClick={handleJoinLobby}
                        disabled={!playerName.trim() || !joinCode.trim()}
                      >
                        Join
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // If in a lobby, show the lobby interface
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Game Lobby
          </h1>
          <div className="flex items-center justify-center gap-2">
            <span className="text-muted-foreground">Code:</span>
            <Badge 
              variant="outline" 
              className="text-xl font-mono tracking-widest cursor-pointer hover:bg-primary/10 transition-colors"
              onClick={copyLobbyCode}
            >
              {lobbyCode}
              <Copy className="ml-2 h-4 w-4" />
            </Badge>
          </div>
        </div>

        <Card className="bg-card/50 backdrop-blur border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Players ({players.length}/10)
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={onLeaveLobby}
              >
                Leave
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {players.map((player) => (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all
                    ${player.id === currentPlayerId 
                      ? 'border-primary bg-primary/5' 
                      : 'border-muted bg-muted/5'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    {player.isHost && (
                      <Crown className="h-4 w-4 text-accent" />
                    )}
                    <span className="font-medium">
                      {player.name}
                      {player.id === currentPlayerId && ' (You)'}
                    </span>
                  </div>
                  <Badge 
                    variant={player.isReady ? 'default' : 'secondary'}
                    className={player.isReady ? 'bg-secondary text-secondary-foreground' : ''}
                  >
                    {player.isReady ? 'Ready' : 'Waiting'}
                  </Badge>
                </div>
              ))}
            </div>

            {isHost && (
              <div className="mt-6 space-y-3">
                <Button 
                  variant="game" 
                  size="lg" 
                  className="w-full"
                  onClick={onStartGame}
                  disabled={players.length < 2}
                >
                  <Play className="mr-2 h-4 w-4" />
                  Start Game
                  {players.length < 2 && (
                    <span className="ml-2 text-xs opacity-80">
                      (Need at least 2 players)
                    </span>
                  )}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  Share the lobby code with friends to invite them!
                </p>
              </div>
            )}

            {!isHost && (
              <div className="mt-6 text-center">
                <p className="text-muted-foreground">
                  Waiting for host to start the game...
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};