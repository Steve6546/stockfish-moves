// Stockfish Web Worker - Latest Version 17.1 with WASM
// This worker loads the Stockfish engine and handles UCI communication

const wasmSupported = typeof WebAssembly === 'object' && 
  WebAssembly.validate(Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00));

// Load latest Stockfish 17.1 from jsdelivr CDN with NNUE support
const stockfishUrl = wasmSupported 
  ? 'https://cdn.jsdelivr.net/npm/stockfish.js@17.1.0/stockfish-nnue-17.1.js'
  : 'https://cdn.jsdelivr.net/npm/stockfish.js@17.1.0/stockfish-17.1.js';

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
