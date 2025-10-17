import { ChessBoard } from '@/components/ChessBoard';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Smart Chess Assistant
          </h1>
          <p className="text-lg text-muted-foreground">
            Powered by Stockfish Engine - Drag pieces to analyze positions
          </p>
        </div>
        
        <ChessBoard />
      </div>
    </div>
  );
};

export default Index;
