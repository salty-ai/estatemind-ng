import React from 'react';
import Link from 'next/link';
import { TrendingUp, Users, Home, Eye } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export default async function DashboardOverview() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch user profile
  const { data: profile } = user
    ? await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()
    : { data: null };

  // Fetch listing count for this user
  const { count: listingCount } = user
    ? await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', user.id)
    : { count: 0 };

  const displayName = profile?.full_name?.split(' ')[0] || 'there';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
        <p className="text-slate-500">
          Welcome back, {displayName}. Here&apos;s what&apos;s happening with your listings.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: 'Total Listings',
            value: listingCount?.toString() || '0',
            icon: Home,
            color: 'bg-blue-500',
          },
          { label: 'Total Views', value: '0', icon: Eye, color: 'bg-purple-500' },
          { label: 'Leads (This Week)', value: '0', icon: Users, color: 'bg-emerald-500' },
          { label: 'Avg. Response Time', value: '--', icon: TrendingUp, color: 'bg-orange-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center text-white ${stat.color}`}
              >
                <stat.icon className="w-5 h-5" />
              </div>
              
            </div>
            <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
            <div className="text-sm text-slate-500 font-medium">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Recent Enquiries</h2>
          <div className="space-y-4">
            {listingCount && listingCount > 0 ? (
              <p className="text-slate-500 text-center py-8">
                Enquiries will appear here when you receive them.
              </p>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-500 mb-4">
                  You haven&apos;t posted any listings yet.
                </p>
                <Link
                  href="/dashboard/listings/new"
                  className="text-emerald-600 font-semibold hover:text-emerald-700"
                >
                  Post your first listing
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/dashboard/listings/new"
              className="p-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl font-bold text-left transition-colors flex flex-col gap-2"
            >
              <span className="text-2xl">+</span>
              Post New Listing
            </Link>
            <button className="p-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl font-bold text-left transition-colors flex flex-col gap-2">
              <span className="text-2xl">⚡</span>
              Boost Listings
            </button>
            <button className="p-4 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl font-bold text-left transition-colors flex flex-col gap-2">
              <span className="text-2xl">📹</span>
              Verify Video
            </button>
            <Link
              href="/dashboard/settings"
              className="p-4 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-xl font-bold text-left transition-colors flex flex-col gap-2"
            >
              <span className="text-2xl">⚙️</span>
              Edit Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
