import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';

export default function NotFoundPage() {
  return (
    <div className="flex-1 flex items-center justify-center py-20 px-4">
      <div className="text-center space-y-6">
        <h1 className="text-9xl font-bold text-primary/20">404</h1>
        <h2 className="text-3xl font-bold">Page Not Found</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Oops! The page you are looking for doesn't exist or has been moved.
        </p>
        <Button asChild size="lg">
          <Link to="/">Return to Home</Link>
        </Button>
      </div>
    </div>
  );
}
