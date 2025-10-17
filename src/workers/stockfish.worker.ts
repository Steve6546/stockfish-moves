// Stockfish Web Worker - Single-threaded version (no SharedArrayBuffer required)
// This loads Stockfish from the installed stockfish npm package

// @ts-ignore - stockfish doesn't have proper type definitions
import Stockfish from 'stockfish';

let engine: any;

// Initialize engine when loaded
Stockfish().then((sf: any) => {
  engine = sf;
  
  // Forward all messages from engine to main thread
  engine.addMessageListener((message: string) => {
    self.postMessage(message);
  });
  
  // Signal that we're ready
  self.postMessage('worker_ready');
}).catch((error: Error) => {
  self.postMessage('error: ' + error.message);
});

// Handle messages from main thread
self.onmessage = function(event: MessageEvent) {
  if (engine) {
    engine.postMessage(event.data);
  }
};
