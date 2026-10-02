import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, BedDouble, Bath, Car, Shield, Filter, Star, Search } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import type { Property, PropertyType } from '@/lib/database.types';
import { MOCK_PROPERTIES } from '@/app/data/properties';

function formatPrice(price: number, type: string, period?: string | null) {
  const formatted = new Intl.NumberFormat('en-NG').format(price);
  if (type === 'sale') {
    return { price: `₦${formatted}`, period: null };
  }
  if (type === 'short_let') {
    return { price: `₦${formatted}`, period: 'night' };
  }
  return { price: `₦${formatted}`, period: period === 'month' ? 'mo' : 'yr' };
}

function getTypeBadgeColor(type: string) {
  switch (type) {
    case 'rent':
      return 'bg-blue-600 text-white';
    case 'sale':
      return 'bg-emerald-600 text-white';
    case 'short_let':
      return 'bg-orange-500 text-white';
    default:
      return 'bg-slate-600 text-white';
  }
}

interface SearchPageProps {
  searchParams: Promise<{ type?: string; city?: string; q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  // Build query for active properties
  let query = supabase
    .from('properties')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  // Filter by type if specified
  if (params.type && ['rent', 'sale', 'short_let'].includes(params.type)) {
    query = query.eq('type', params.type);
  }

  // Filter by city if specified
  if (params.city) {
    const escapedCity = params.city.replace(/[%_\\]/g, '\\$&');
    query = query.ilike('city', `%${escapedCity}%`);
  }

  const { data: properties, error } = await query.limit(20);

  let listings: Property[] = [];

  if (error || !properties || properties.length === 0) {
    if (error) console.error('Supabase search error (using mocks):', error);
    
    // Fallback to mock data if DB fails or is empty
    const mockData = MOCK_PROPERTIES.map(p => ({
      id: p.id,
      owner_id: 'mock-owner',
      title: p.title,
      description: 'Mock description',
      price: p.price,
      currency: p.currency,
      period: p.period || null,
      type: p.type.toLowerCase().replace('-', '_') as PropertyType,
      status: 'active' as const,
      address: p.location.address,
      area: p.location.area,
      city: p.location.city,
      state: p.location.state,
      bedrooms: p.specs.bedrooms,
      bathrooms: p.specs.bathrooms,
      toilets: p.specs.toilets,
      parking: p.specs.parking,
      images: p.images,
      video_url: null,
      is_verified_listing: p.verified,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    // Apply basic filtering to mock data
    listings = mockData.filter(p => {
        if (params.type && p.type !== params.type) return false;
        if (params.city && !p.city.toLowerCase().includes(params.city.toLowerCase())) return false;
        return true;
    });
  } else {
    listings = properties as Property[];
  }

  // Get type label for display
  const typeLabel = params.type
    ? params.type === 'short_let'
      ? 'Short-let'
      : params.type.charAt(0).toUpperCase() + params.type.slice(1)
    : 'All';

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header & Filter Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Properties {params.city ? `in ${params.city}` : 'in Nigeria'}
            </h1>
            <p className="text-slate-500">
              {listings.length === 0
                ? 'No properties found'
                : `Showing ${listings.length} ${typeLabel.toLowerCase()} ${listings.length === 1 ? 'property' : 'properties'}`}
            </p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 font-medium">
              <Filter className="w-4 h-4" />
              Filters
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium shadow-sm">
              <Star className="w-4 h-4" />
              Ask AI Agent
            </button>
          </div>
        </div>

        {/* Quick Filter Pills */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <Link
            href={{ pathname: '/search', query: { ...params, type: undefined } }}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              !params.type ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            All
          </Link>
          <Link
            href={{ pathname: '/search', query: { ...params, type: 'rent' } }}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              params.type === 'rent' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            For Rent
          </Link>
          <Link
            href={{ pathname: '/search', query: { ...params, type: 'sale' } }}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              params.type === 'sale' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            For Sale
          </Link>
          <Link
            href={{ pathname: '/search', query: { ...params, type: 'short_let' } }}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              params.type === 'short_let' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            Short-let
          </Link>
        </div>

        {/* Empty State */}
        {listings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">No properties found</h3>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">
              We couldn&apos;t find any {typeLabel.toLowerCase()} properties matching your criteria.
              Try adjusting your filters or check back later.
            </p>
            <Link
              href="/search"
              className="text-emerald-600 font-semibold hover:text-emerald-700"
            >
              View all properties
            </Link>
          </div>
        ) : (
          /* Results Grid */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {listings.map((property) => {
              const priceInfo = formatPrice(property.price, property.type, property.period);
              return (
                <Link
                  href={`/properties/${property.id}`}
                  key={property.id}
                  className="group block bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  {/* Image Section */}
                  <div className="relative h-64 bg-slate-200">
                    {property.images && property.images[0] ? (
                      <Image
                        src={property.images[0]}
                        alt={property.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 1024px) 100vw, 33vw"
                      />
                    ) : (
                      <Image
                        src={
                          property.type === 'short_let'
                            ? '/images/apartment.png'
                            : '/images/house.png'
                        }
                        alt={property.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 1024px) 100vw, 33vw"
                      />
                    )}
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getTypeBadgeColor(property.type)}`}>
                        For {property.type.replace('_', '-')}
                      </span>
                      {property.is_verified_listing && (
                        <span className="flex items-center gap-1 px-2 py-1 bg-white/90 backdrop-blur text-emerald-700 text-xs font-bold rounded-full">
                          <Shield className="w-3 h-3 fill-emerald-700" />
                          Verified
                        </span>
                      )}
                    </div>
                    <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur text-white px-3 py-1 rounded-lg text-sm font-semibold">
                      {priceInfo.price}
                      {priceInfo.period && <span className="text-slate-300 font-normal">/{priceInfo.period}</span>}
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-bold text-slate-900 line-clamp-1 group-hover:text-emerald-600 transition-colors">
                        {property.title}
                      </h3>
                    </div>

                    <div className="flex items-center text-slate-500 text-sm mb-4">
                      <MapPin className="w-4 h-4 mr-1 text-slate-400" />
                      {property.address}, {property.city}
                    </div>

                    <div className="flex items-center gap-6 mb-4 text-slate-700 text-sm">
                      <div className="flex items-center gap-2">
                        <BedDouble className="w-4 h-4 text-emerald-600" />
                        <span className="font-semibold">{property.bedrooms}</span>
                        <span className="text-slate-400">Bed</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Bath className="w-4 h-4 text-emerald-600" />
                        <span className="font-semibold">{property.bathrooms}</span>
                        <span className="text-slate-400">Bath</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Car className="w-4 h-4 text-emerald-600" />
                        <span className="font-semibold">{property.parking}</span>
                        <span className="text-slate-400">Park</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                      <div className="text-xs text-slate-500">
                        {property.area ? `${property.area}, ` : ''}{property.state}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
