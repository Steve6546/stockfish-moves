// Stockfish Web Worker - Bundled Version
// Loads Stockfish from local project files (no external CDN dependency)

const wasmSupported = typeof WebAssembly === 'object' && 
  WebAssembly.validate(Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00));

// Load Stockfish from local bundled files
const stockfishUrl = wasmSupported 
  ? '/stockfish/stockfish-nnue-17.1.js'
  : '/stockfish/stockfish-nnue-17.1.js';

// Import the Stockfish script from local files
importScripts(stockfishUrl);

let engine;

// Initialize engine when loaded
if (typeof Stockfish === 'function') {
  Stockfish().then((sf) => {
    engine = sf;
    
    // Forward all messages from engine to main thread
    engine.addMessageListener((message) => {
      self.postMessage(message);
    });
    
    // Signal that we're ready
    self.postMessage('worker_ready');
  }).catch((error) => {
    self.postMessage('error: ' + error.message);
  });
}

// Handle messages from main thread
self.onmessage = function(event) {
  if (engine) {
    engine.postMessage(event.data);
  }
};
