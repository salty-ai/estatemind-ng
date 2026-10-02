'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Home,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const MENU_ITEMS = [
  { label: 'Overview', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'My Listings', icon: Home, href: '/dashboard/listings' },
  { label: 'Messages', icon: MessageSquare, href: '/dashboard/messages' },
  { label: 'Settings', icon: Settings, href: '/dashboard/settings' },
];

interface SidebarContentProps {
  user: DashboardSidebarProps['user'];
  pathname: string;
  displayName: string;
  roleDisplay: string;
  signingOut: boolean;
  signOutError: string | null;
  onSignOut: () => Promise<void>;
  onNavigate: () => void;
}

function SidebarContent({
  user,
  pathname,
  displayName,
  roleDisplay,
  signingOut,
  signOutError,
  onSignOut,
  onNavigate,
}: SidebarContentProps) {
  const getInitials = (name: string | null, email: string | null) => {
    if (name) {
      return name
        .split(' ')
        .filter((part) => part.length > 0)
        .map((part) => part[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return 'U';
  };

  return (
    <>
      <div className="p-6 border-b border-slate-800">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/images/logo.png"
            alt="EstateMind Logo"
            width={140}
            height={36}
            className="h-9 w-auto brightness-0 invert"
          />
        </Link>
        <div className="mt-4 px-3 py-2 bg-slate-800 rounded-lg flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-sm text-white">
            {getInitials(user.fullName, user.email)}
          </div>
          <div className="overflow-hidden">
            <div className="text-sm font-bold truncate text-white">{displayName}</div>
            <div className="text-xs text-slate-400 truncate">{roleDisplay}</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {MENU_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${
                isActive
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={onSignOut}
          disabled={signingOut}
          className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:text-red-400 transition-colors font-medium disabled:opacity-50"
        >
          <LogOut className="w-5 h-5" />
          {signingOut ? 'Signing out...' : 'Sign Out'}
        </button>
        {signOutError ? (
          <p className="mt-2 text-xs text-red-400">{signOutError}</p>
        ) : null}
      </div>
    </>
  );
}

interface DashboardSidebarProps {
  user: {
    email: string | null;
    fullName: string | null;
    role: string | null;
  };
}

export default function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);

  const handleSignOut = async () => {
    setSigningOut(true);
    setSignOutError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error(error);
        setSigningOut(false);
        setSignOutError(error.message || 'Sign out failed. Please try again.');
        return;
      }
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error(err);
      setSigningOut(false);
      setSignOutError('Sign out failed. Please try again.');
    }
  };

  const displayName = user.fullName || user.email?.split('@')[0] || 'User';
  const roleDisplay = user.role === 'agent' ? 'Agent' : 'Property Seeker';

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileMenuOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-slate-900 text-white rounded-lg shadow-lg"
        aria-label="Open main menu"
        aria-expanded={mobileMenuOpen}
        aria-controls="mobile-dashboard-sidebar"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile drawer overlay */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-50"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        id="mobile-dashboard-sidebar"
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
          aria-label="Close main menu"
        >
          <X className="w-6 h-6" />
        </button>
        <SidebarContent
          user={user}
          pathname={pathname}
          displayName={displayName}
          roleDisplay={roleDisplay}
          signingOut={signingOut}
          signOutError={signOutError}
          onSignOut={handleSignOut}
          onNavigate={() => setMobileMenuOpen(false)}
        />
      </aside>

      {/* Desktop sidebar */}
      <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col fixed h-full">
        <SidebarContent
          user={user}
          pathname={pathname}
          displayName={displayName}
          roleDisplay={roleDisplay}
          signingOut={signingOut}
          signOutError={signOutError}
          onSignOut={handleSignOut}
          onNavigate={() => undefined}
        />
      </aside>
    </>
  );
}
