import { useEffect, useRef, useState } from 'react';

interface StockfishMove {
  from: string;
  to: string;
  evaluation?: number;
}

export const useStockfish = () => {
  const engineRef = useRef<Worker | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [bestMove, setBestMove] = useState<StockfishMove | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    // Initialize Stockfish worker
    const wasmSupported = typeof WebAssembly === 'object';
    
    try {
      // Use stockfish.js from CDN
      const engine = new Worker('/stockfish.js');
      engineRef.current = engine;

      engine.onmessage = (event) => {
        const message = event.data;
        
        if (message === 'readyok') {
          setIsReady(true);
        } else if (message.startsWith('bestmove')) {
          setIsAnalyzing(false);
          // Parse bestmove e2e4 or bestmove e7e5 ponder e2e4
          const parts = message.split(' ');
          if (parts[1] && parts[1] !== '(none)') {
            const moveStr = parts[1];
            setBestMove({
              from: moveStr.substring(0, 2),
              to: moveStr.substring(2, 4),
            });
          }
        }
      };

      // Initialize UCI
      engine.postMessage('uci');
      // Enable pondering for faster analysis
      engine.postMessage('setoption name Ponder value true');
      engine.postMessage('isready');
      
    } catch (error) {
      console.error('Failed to initialize Stockfish:', error);
    }

    return () => {
      if (engineRef.current) {
        engineRef.current.terminate();
      }
    };
  }, []);

  const analyzePosition = (fen: string, depth: number = 20) => {
    if (!engineRef.current || !isReady) {
      console.warn('Engine not ready');
      return;
    }

    setIsAnalyzing(true);
    setBestMove(null);

    // Send UCI commands
    engineRef.current.postMessage('ucinewgame');
    engineRef.current.postMessage(`position fen ${fen}`);
    engineRef.current.postMessage(`go depth ${depth}`);
  };

  const stopAnalysis = () => {
    if (engineRef.current) {
      engineRef.current.postMessage('stop');
      setIsAnalyzing(false);
    }
  };

  return {
    isReady,
    bestMove,
    isAnalyzing,
    analyzePosition,
    stopAnalysis,
  };
};
