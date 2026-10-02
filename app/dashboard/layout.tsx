import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import DashboardSidebar from '@/components/DashboardSidebar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch user profile for role info
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single();

  const userData = {
    email: user.email || null,
    fullName: profile?.full_name || null,
    role: profile?.role || null,
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <DashboardSidebar user={userData} />

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-8 pt-16 md:pt-8">{children}</main>
    </div>
  );
}
