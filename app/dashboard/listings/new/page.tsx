'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, Video, MapPin, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { listingStep1Schema, type ListingStep1Data } from '@/lib/validations/listing';
import { createClient } from '@/lib/supabase/client';
import { NIGERIAN_STATES, getCitiesForState } from '@/lib/data/locations';

export default function NewListingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState('Lagos');
  const [cities, setCities] = useState<string[]>(getCitiesForState('Lagos'));

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    watch,
    setValue,
  } = useForm<ListingStep1Data>({
    resolver: zodResolver(listingStep1Schema),
    defaultValues: {
      type: 'rent',
      bedrooms: 0,
      bathrooms: 0,
      toilets: 0,
      parking: 0,
      state: 'Lagos',
      city: 'Lekki',
      period: 'year',
    },
  });

  const propertyType = watch('type');

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newState = e.target.value;
    setSelectedState(newState);
    const newCities = getCitiesForState(newState);
    setCities(newCities);
    setValue('state', newState);
    setValue('city', newCities[0] || '');
  };

  const handleNextStep = async () => {
    const isValid = await trigger();
    if (isValid) {
      setStep(2);
    }
  };

  const onSubmit = async (data: ListingStep1Data) => {
    setLoading(true);
    setSubmitError(null);

    try {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setSubmitError('You must be logged in to post a listing');
        setLoading(false);
        return;
      }

      // Determine period based on type
      let period = data.period;
      if (data.type === 'sale') {
        period = undefined;
      } else if (data.type === 'short_let') {
        period = 'night';
      }

      const { error } = await supabase.from('properties').insert({
        owner_id: user.id,
        title: data.title,
        description: data.description,
        price: data.price,
        type: data.type,
        period: period,
        address: data.address,
        area: data.area || null,
        city: data.city,
        state: data.state,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        toilets: data.toilets,
        parking: data.parking,
        status: 'pending',
        currency: 'NGN',
      });

      if (error) {
        console.error('Insert error:', error);
        setSubmitError(error.message);
        setLoading(false);
        return;
      }

      router.push('/dashboard/listings?success=true');
    } catch (err) {
      console.error('Submit error:', err);
      setSubmitError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  const inputClass = (hasError: boolean) =>
    `w-full px-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-colors ${
      hasError ? 'border-red-300 bg-red-50' : 'border-slate-200'
    }`;

  const ErrorMessage = ({ message }: { message?: string }) =>
    message ? <p className="text-red-500 text-sm mt-1">{message}</p> : null;

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
        <h1 className="text-3xl font-bold text-slate-900">Post a New Property</h1>
        <p className="text-slate-500 mt-2">
          Step {step} of 2: {step === 1 ? 'Basic Details' : 'Media & Verification'}
        </p>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-slate-200 rounded-full mt-4 overflow-hidden">
          <div
            className="h-full bg-emerald-600 transition-all duration-500 ease-out"
            style={{ width: `${(step / 2) * 100}%` }}
          />
        </div>
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
        {/* STEP 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
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

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={handleNextStep}
                className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors"
              >
                Next Step
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Media & TrueVerify */}
        {step === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
            {/* Image Upload */}
            <div>
              <label className="block text-lg font-bold text-slate-900 mb-4">
                Property Photos
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-10 text-center hover:bg-slate-50 transition-colors cursor-pointer">
                <Upload className="w-10 h-10 text-slate-400 mx-auto mb-4" />
                <p className="font-medium text-slate-600">Click to upload or drag and drop</p>
                <p className="text-sm text-slate-400 mt-2">JPG, PNG up to 5MB (Coming soon)</p>
              </div>
            </div>

            {/* TrueVerify Video Section */}
            <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                  <Video className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-emerald-900 mb-1">
                    TrueVerify Video Requirement
                  </h3>
                  <p className="text-emerald-700 text-sm mb-4 leading-relaxed">
                    To get the &quot;Verified&quot; badge and 3x more views, you must upload a
                    continuous video walkthrough of the property starting from the street view.
                  </p>
                  <button
                    type="button"
                    className="px-5 py-2 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    Upload Walkthrough (Coming soon)
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-6 py-3 text-slate-500 font-bold hover:text-slate-800 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Post Property'
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
