import { Building } from 'lucide-react';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Building className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-2xl tracking-tight text-emerald-950">EstateMind</span>
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
