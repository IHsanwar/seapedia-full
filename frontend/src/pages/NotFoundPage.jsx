import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';

export default function NotFoundPage() {
  return (
    <div className="bg-[#f8f9ff] min-h-screen">
      <div className="flex-1 flex items-center justify-center py-20 px-4">
        <div className="bg-white border border-border shadow-sm rounded-sm p-12 text-center space-y-6 max-w-lg">
          <h1 className="text-9xl font-bold text-[#003f87]">404</h1>
          <h2 className="text-3xl font-bold text-[#003f87]">Page Not Found</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Oops! The page you are looking for doesn't exist or has been moved.
          </p>
          <Button asChild size="lg" className="bg-[#003f87] hover:bg-[#002f65]">
            <Link to="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
