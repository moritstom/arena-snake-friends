import React from 'react';
import { Lobby } from './Lobby';
import { GameCanvas } from './GameCanvas';
import { GameUI } from './GameUI';
import { useGameLogic } from '@/hooks/useGameLogic';

export const Game: React.FC = () => {
  const {
    lobby,
    gameState,
    playerId,
    createLobby,
    joinLobby,
    startGame,
    leaveLobby,
    updatePlayerDirection
  } = useGameLogic();

  const isHost = lobby?.players.find(p => p.id === playerId)?.isHost || false;

  // Show lobby if game hasn't started
  if (!lobby?.gameStarted) {
    return (
      <Lobby
        lobbyCode={lobby?.code}
        players={lobby?.players || []}
        currentPlayerId={playerId}
        isHost={isHost}
        onCreateLobby={createLobby}
        onJoinLobby={joinLobby}
        onStartGame={startGame}
        onLeaveLobby={leaveLobby}
      />
    );
  }

  // Show game canvas and UI
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative">
      <GameCanvas
        gameState={gameState}
        playerId={playerId}
        onPlayerInput={updatePlayerDirection}
        className="z-10"
      />
      
      <GameUI
        gameState={gameState}
        playerId={playerId}
        onBackToLobby={leaveLobby}
      />
    </div>
  );
};