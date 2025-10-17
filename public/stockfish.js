// Stockfish.js Web Worker wrapper
// This file loads the Stockfish engine from CDN

importScripts('https://cdn.jsdelivr.net/npm/stockfish@16.1.0/stockfish.js');

let engine;

// Initialize when messages arrive
self.onmessage = function(event) {
  const message = event.data;
  
  if (!engine) {
    // First message initializes the engine
    Stockfish().then(function(sf) {
      engine = sf;
      
      // Set up message handler
      engine.addMessageListener(function(line) {
        self.postMessage(line);
      });
      
      // Process the queued message
      engine.postMessage(message);
    });
  } else {
    // Engine is ready, pass the message
    engine.postMessage(message);
  }
};
