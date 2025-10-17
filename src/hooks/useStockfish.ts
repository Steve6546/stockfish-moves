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
  const [engineStatus, setEngineStatus] = useState<'loading' | 'uci_init' | 'ready' | 'error'>('loading');

  useEffect(() => {
    let mounted = true;
    
    try {
      // Create worker from public folder
      const worker = new Worker('/stockfish-worker.js');
      engineRef.current = worker;

      worker.onmessage = (event) => {
        if (!mounted) return;
        
        const message = event.data;
        
        if (message === 'worker_ready') {
          // Worker loaded, now initialize UCI protocol
          setEngineStatus('uci_init');
          worker.postMessage('uci');
        } else if (message === 'uciok') {
          // UCI initialized, now configure engine and check readiness
          worker.postMessage('setoption name Ponder value true');
          worker.postMessage('isready');
        } else if (message === 'readyok') {
          // Engine fully ready to accept commands
          setEngineStatus('ready');
          setIsReady(true);
        } else if (message.startsWith('bestmove')) {
          setIsAnalyzing(false);
          const parts = message.split(' ');
          if (parts[1] && parts[1] !== '(none)') {
            const moveStr = parts[1];
            setBestMove({
              from: moveStr.substring(0, 2),
              to: moveStr.substring(2, 4),
            });
          }
        } else if (message.startsWith('error:')) {
          console.error('Stockfish error:', message);
          setEngineStatus('error');
        }
      };

      worker.onerror = (error) => {
        console.error('Worker error:', error);
      };
    } catch (error) {
      console.error('Failed to initialize Stockfish worker:', error);
    }

    return () => {
      mounted = false;
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
    engineStatus,
    analyzePosition,
    stopAnalysis,
  };
};
