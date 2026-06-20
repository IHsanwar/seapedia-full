import { Outlet, Link } from 'react-router-dom';
import { Anchor } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-xl">
              <Anchor className="h-8 w-8 text-primary" />
            </div>
            <span className="font-bold text-2xl tracking-tight">SEAPEDIA</span>
          </Link>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
