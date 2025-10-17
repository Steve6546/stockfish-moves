// Stockfish Web Worker
// This worker loads the Stockfish engine and handles UCI communication

const wasmSupported = typeof WebAssembly === 'object' && 
  WebAssembly.validate(Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00));

// Load Stockfish from unpkg CDN (more reliable than jsdelivr)
const stockfishUrl = wasmSupported 
  ? 'https://unpkg.com/stockfish@16.1.0/src/stockfish.wasm.js'
  : 'https://unpkg.com/stockfish@16.1.0/src/stockfish.js';

// Import the Stockfish script
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
