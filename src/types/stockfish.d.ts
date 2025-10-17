declare module 'stockfish' {
  interface StockfishEngine {
    postMessage(message: string): void;
    addMessageListener(callback: (message: string) => void): void;
    terminate(): void;
  }

  function Stockfish(): StockfishEngine;
  export default Stockfish;
}
