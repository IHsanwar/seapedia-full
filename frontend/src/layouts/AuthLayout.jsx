import { Outlet, Link } from 'react-router-dom';
import { Anchor } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#003f87]/5 via-[#f8f9ff] to-[#f8f9ff] p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-[#003f87]/10 p-2 rounded-sm">
              <Anchor className="h-8 w-8 text-[#003f87]" />
            </div>
            <span className="font-bold text-2xl tracking-tight text-[#003f87]">SEAPEDIA</span>
          </Link>
        </div>
        <div className="bg-white border border-border shadow-lg rounded-sm">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
