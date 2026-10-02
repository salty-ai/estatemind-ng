import React from 'react';
import { createClient } from '@/lib/supabase/server';
import type { Property } from '@/lib/database.types';
import MyListingsClient from './MyListingsClient';

export default async function MyListingsPage() {
  const supabase = await createClient();

  const { data, error: authErrorRaw } = await supabase.auth.getUser();
  const user = data.user;
  const authError = authErrorRaw as { message?: string } | null;

  if (authError) {
    return (
      <MyListingsClient
        initialListings={[]}
        initialError={authError.message ?? 'Unable to fetch user session.'}
      />
    );
  }

  // Fetch user's properties
  const { data: properties, error: propertiesError } = user
    ? await supabase
        .from('properties')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })
    : { data: [], error: null };

  const listings = (properties || []) as Property[];

  const initialError = propertiesError?.message || null;

  return <MyListingsClient initialListings={listings} initialError={initialError} />;
}
