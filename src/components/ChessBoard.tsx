import { useState, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { useStockfish } from '@/hooks/useStockfish';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export const ChessBoard = () => {
  const [game, setGame] = useState(new Chess());
  const [position, setPosition] = useState(game.fen());
  const [playerSide, setPlayerSide] = useState<'w' | 'b'>('w'); // 'w' for white, 'b' for black
  const { isReady, bestMove, isAnalyzing, analyzePosition } = useStockfish();

  // Trigger analysis only when it's the player's turn
  useEffect(() => {
    if (isReady && position) {
      const currentTurn = game.turn();
      if (currentTurn === playerSide) {
        analyzePosition(position);
      }
    }
  }, [position, isReady, playerSide]);

  // Show toast when engine is ready
  useEffect(() => {
    if (isReady) {
      toast.success('Stockfish engine ready!');
    }
  }, [isReady]);

  const onDrop = (sourceSquare: string, targetSquare: string) => {
    try {
      const gameCopy = new Chess(game.fen());
      
      // Try to make the move
      const move = gameCopy.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q', // Always promote to queen for simplicity
      });

      // If move is illegal, return false
      if (move === null) return false;

      setGame(gameCopy);
      setPosition(gameCopy.fen());
      return true;
    } catch (error) {
      return false;
    }
  };

  const resetBoard = () => {
    const newGame = new Chess();
    setGame(newGame);
    setPosition(newGame.fen());
    toast.info('Board reset to starting position');
  };

  const togglePlayerSide = () => {
    setPlayerSide(prev => prev === 'w' ? 'b' : 'w');
    toast.info(`You are now playing as ${playerSide === 'w' ? 'Black' : 'White'}`);
  };

  const clearBoard = () => {
    const emptyFen = '8/8/8/8/8/8/8/8 w - - 0 1';
    const newGame = new Chess(emptyFen);
    setGame(newGame);
    setPosition(emptyFen);
    toast.info('Board cleared');
  };

  // Custom square styles to highlight best move (only on player's turn)
  const customSquareStyles: { [square: string]: React.CSSProperties } = {};
  const isPlayerTurn = game.turn() === playerSide;
  
  if (bestMove && isPlayerTurn) {
    customSquareStyles[bestMove.from] = {
      backgroundColor: 'hsl(var(--move-origin))',
      opacity: 0.7,
    };
    customSquareStyles[bestMove.to] = {
      backgroundColor: 'hsl(var(--move-destination))',
      opacity: 0.7,
    };
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="aspect-square w-full max-w-[600px] mx-auto">
            <Chessboard
              position={position}
              onPieceDrop={onDrop}
              customSquareStyles={customSquareStyles}
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Turn Status
            </CardTitle>
            <CardDescription>
              {isPlayerTurn ? (
                <span className="text-success font-semibold">
                  Your Turn: {isAnalyzing ? 'Analysis in progress...' : 'Ready'}
                </span>
              ) : (
                <span className="text-muted-foreground">
                  Opponent's Turn: Input opponent's move
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Label htmlFor="side-toggle" className="text-sm font-medium">
                Playing as: <span className="font-bold">{playerSide === 'w' ? 'White' : 'Black'}</span>
              </Label>
              <Switch
                id="side-toggle"
                checked={playerSide === 'b'}
                onCheckedChange={togglePlayerSide}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Controls
            </CardTitle>
            <CardDescription>
              Manage the chess board
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={resetBoard} 
              className="w-full"
              variant="secondary"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset Board
            </Button>
            <Button 
              onClick={clearBoard} 
              className="w-full"
              variant="outline"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear Board
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Engine Analysis
              {isAnalyzing && <Loader2 className="h-4 w-4 animate-spin" />}
            </CardTitle>
            <CardDescription>
              Stockfish best move suggestion
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Status:</span>
              {isReady ? (
                <Badge variant="default">Ready</Badge>
              ) : (
                <Badge variant="secondary">
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  Loading...
                </Badge>
              )}
            </div>

            {!isPlayerTurn && (
              <div className="text-sm text-muted-foreground text-center py-4 border rounded-lg bg-muted/30">
                Analysis paused - waiting for your turn
              </div>
            )}

            {bestMove && isPlayerTurn && (
              <div className="space-y-3">
                <div className="rounded-lg border bg-muted/50 p-4">
                  <div className="text-sm text-muted-foreground mb-1">Best Move</div>
                  <div className="text-2xl font-bold">
                    {bestMove.from} → {bestMove.to}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg border p-3 bg-success/10">
                    <div className="text-xs text-muted-foreground mb-1">Origin</div>
                    <div className="text-lg font-semibold text-success">
                      {bestMove.from}
                    </div>
                  </div>
                  <div className="rounded-lg border p-3 bg-destructive/10">
                    <div className="text-xs text-muted-foreground mb-1">Destination</div>
                    <div className="text-lg font-semibold text-destructive">
                      {bestMove.to}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!bestMove && isReady && !isAnalyzing && isPlayerTurn && (
              <div className="text-sm text-muted-foreground text-center py-4">
                Analyzing position...
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Legend</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 rounded bg-success"></div>
              <span>Origin square (green)</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 rounded bg-destructive"></div>
              <span>Destination square (red)</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
