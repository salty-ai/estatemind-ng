'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Loader2, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { listingStep1Schema, type ListingStep1Data } from '@/lib/validations/listing';
import { createClient } from '@/lib/supabase/client';
import { NIGERIAN_STATES, getCitiesForState } from '@/lib/data/locations';
import type { Property } from '@/lib/database.types';
import { updateProperty } from '@/app/dashboard/listings/actions';

interface EditListingPageProps {
  params: Promise<{ id: string }>;
}

export default function EditListingPage({ params }: EditListingPageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [selectedState, setSelectedState] = useState('Lagos');
  const [cities, setCities] = useState<string[]>(getCitiesForState('Lagos'));
  const [propertyId, setPropertyId] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<ListingStep1Data>({
    resolver: zodResolver(listingStep1Schema),
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const propertyType = watch('type');

  useEffect(() => {
    async function fetchProperty() {
      const { id } = await params;
      setPropertyId(id);

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .eq('owner_id', user.id)
        .single();

      if (error || !data) {
        setSubmitError('Property not found or you do not have permission to edit it.');
        setLoading(false);
        return;
      }

      setProperty(data as Property);
      setSelectedState(data.state || 'Lagos');
      setCities(getCitiesForState(data.state || 'Lagos'));

      reset({
        title: data.title,
        type: data.type,
        description: data.description || '',
        price: data.price,
        period: data.period || 'year',
        address: data.address,
        area: data.area || '',
        city: data.city,
        state: data.state,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        toilets: data.toilets,
        parking: data.parking,
      });

      setLoading(false);
    }

    fetchProperty();
  }, [params, reset, router]);

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newState = e.target.value;
    setSelectedState(newState);
    const newCities = getCitiesForState(newState);
    setCities(newCities);
    setValue('state', newState);
    setValue('city', newCities[0] || '');
  };

  const onSubmit = async (data: ListingStep1Data) => {
    setSaving(true);
    setSubmitError(null);

    try {
      // Determine period based on type
      let period = data.period;
      if (data.type === 'sale') {
        period = undefined;
      } else if (data.type === 'short_let') {
        period = 'night';
      }

      const result = await updateProperty(propertyId, {
        title: data.title,
        description: data.description,
        price: data.price,
        type: data.type,
        period: period,
        address: data.address,
        area: data.area || undefined,
        city: data.city,
        state: data.state,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        toilets: data.toilets,
        parking: data.parking,
      });

      if (result?.error) {
        setSubmitError(result.error);
        setSaving(false);
        return;
      }

      router.push('/dashboard/listings?updated=true');
    } catch (err) {
      console.error('Submit error:', err);
      setSubmitError('An unexpected error occurred. Please try again.');
      setSaving(false);
    }
  };

  const inputClass = (hasError: boolean) =>
    `w-full px-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-colors ${
      hasError ? 'border-red-300 bg-red-50' : 'border-slate-200'
    }`;

  const ErrorMessage = ({ message }: { message?: string }) =>
    message ? <p className="text-red-500 text-sm mt-1">{message}</p> : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-xl">
          <h2 className="font-bold text-lg mb-2">Unable to load property</h2>
          <p>{submitError || 'Property not found.'}</p>
          <Link
            href="/dashboard/listings"
            className="inline-block mt-4 text-emerald-600 font-semibold hover:text-emerald-700"
          >
            ← Back to Listings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <Link
          href="/dashboard/listings"
          className="flex items-center text-slate-500 hover:text-emerald-600 mb-4 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Listings
        </Link>
        <h1 className="text-3xl font-bold text-slate-900">Edit Property</h1>
        <p className="text-slate-500 mt-2">Update the details of your listing.</p>
      </div>

      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl mb-6">
          {submitError}
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8"
      >
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Luxury 3-Bed in Lekki"
                {...register('title')}
                className={inputClass(!!errors.title)}
              />
              <ErrorMessage message={errors.title?.message} />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Type <span className="text-red-500">*</span>
              </label>
              <select {...register('type')} className={inputClass(!!errors.type)}>
                <option value="rent">For Rent</option>
                <option value="sale">For Sale</option>
                <option value="short_let">Short-let</option>
              </select>
              <ErrorMessage message={errors.type?.message} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              {...register('description')}
              className={inputClass(!!errors.description)}
              placeholder="Describe the property features, amenities, and neighborhood..."
            />
            <ErrorMessage message={errors.description?.message} />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Price (₦) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                {...register('price', { valueAsNumber: true })}
                className={inputClass(!!errors.price)}
                placeholder="e.g. 5000000"
              />
              <ErrorMessage message={errors.price?.message} />
            </div>
            {propertyType !== 'sale' && (
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Price Period <span className="text-red-500">*</span>
                </label>
                <select {...register('period')} className={inputClass(!!errors.period)}>
                  {propertyType === 'short_let' ? (
                    <option value="night">Per Night</option>
                  ) : (
                    <>
                      <option value="year">Per Year</option>
                      <option value="month">Per Month</option>
                    </>
                  )}
                </select>
                <ErrorMessage message={errors.period?.message} />
              </div>
            )}
          </div>

          {/* Location Section */}
          <div className="border-t border-slate-100 pt-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" />
              Location
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  State <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedState}
                  onChange={handleStateChange}
                  className={inputClass(!!errors.state)}
                >
                  {NIGERIAN_STATES.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
                <input type="hidden" {...register('state')} />
                <ErrorMessage message={errors.state?.message} />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  City/Area <span className="text-red-500">*</span>
                </label>
                {cities.length > 0 ? (
                  <select {...register('city')} className={inputClass(!!errors.city)}>
                    {cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    {...register('city')}
                    className={inputClass(!!errors.city)}
                    placeholder="Enter city"
                  />
                )}
                <ErrorMessage message={errors.city?.message} />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6 mt-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Specific Area/Estate
                </label>
                <input
                  type="text"
                  {...register('area')}
                  className={inputClass(!!errors.area)}
                  placeholder="e.g. Lekki Phase 1, Banana Island"
                />
                <ErrorMessage message={errors.area?.message} />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Street Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('address')}
                  className={inputClass(!!errors.address)}
                  placeholder="e.g. 15 Admiralty Way"
                />
                <ErrorMessage message={errors.address?.message} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Bedrooms', name: 'bedrooms' as const },
              { label: 'Bathrooms', name: 'bathrooms' as const },
              { label: 'Toilets', name: 'toilets' as const },
              { label: 'Parking', name: 'parking' as const },
            ].map((field) => (
              <div key={field.name}>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">
                  {field.label}
                </label>
                <input
                  type="number"
                  {...register(field.name, { valueAsNumber: true })}
                  className={`w-full px-3 py-2 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none ${
                    errors[field.name] ? 'border-red-300' : 'border-slate-200'
                  }`}
                  min="0"
                />
                <ErrorMessage message={errors[field.name]?.message} />
              </div>
            ))}
          </div>

          <div className="pt-4 flex justify-between items-center border-t border-slate-100">
            <Link
              href="/dashboard/listings"
              className="px-6 py-3 text-slate-500 font-bold hover:text-slate-800 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
