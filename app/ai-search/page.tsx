'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sparkles,
  ArrowLeft,
  Send,
  MapPin,
  BedDouble,
  Bath,
  Shield,
  Bot,
  Loader2,
  Zap,
  TrendingUp,
  ThumbsUp,
  AlertTriangle,
  Home,
} from 'lucide-react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';

// AI Insight badges for properties
const AI_INSIGHTS = [
  { label: 'Hot Deal 🔥', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { label: 'Great Value', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { label: 'Popular Area', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { label: 'Quick Response', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { label: 'Price Drop', color: 'bg-pink-100 text-pink-700 border-pink-200' },
];

// Mock property results - in production this would come from AI analysis
const SAMPLE_PROPERTIES = [
  {
    id: '1',
    title: 'Luxury 3-Bedroom Apartment',
    location: 'Lekki Phase 1, Lagos',
    price: 4500000,
    period: 'year',
    type: 'rent',
    bedrooms: 3,
    bathrooms: 3,
    image: '/images/apartment.png',
    verified: true,
    aiInsight: 'Hot Deal 🔥',
    aiReason: '15% below market average for this area',
  },
  {
    id: '2',
    title: 'Modern 2-Bed Serviced Flat',
    location: 'Victoria Island, Lagos',
    price: 6000000,
    period: 'year',
    type: 'rent',
    bedrooms: 2,
    bathrooms: 2,
    image: '/images/house.png',
    verified: true,
    aiInsight: 'Great Value',
    aiReason: '24/7 power included, saves ₦500k/year on diesel',
  },
  {
    id: '3',
    title: 'Spacious 4-Bed Detached House',
    location: 'Magodo GRA, Lagos',
    price: 85000000,
    period: null,
    type: 'sale',
    bedrooms: 4,
    bathrooms: 4,
    image: '/images/house.png',
    verified: false,
    aiInsight: 'Popular Area',
    aiReason: 'Properties here appreciate 12% yearly',
  },
];

function AISearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';
  
  const [input, setInput] = useState(initialQuery);
  const [searchPhase, setSearchPhase] = useState<'idle' | 'thinking' | 'analyzing' | 'results'>(
    initialQuery ? 'thinking' : 'idle'
  );
  const [showResults, setShowResults] = useState(false);
  const [thinkingSteps, setThinkingSteps] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
  });

  const isLoading = status === 'streaming' || status === 'submitted';

  // Simulate AI thinking process
  useEffect(() => {
    if (initialQuery && searchPhase === 'thinking') {
      const steps = [
        'Understanding your requirements...',
        'Searching 2,847 verified properties...',
        'Analyzing price trends in target areas...',
        'Filtering by your preferences...',
        'Ranking by best match score...',
      ];
      
      let currentStep = 0;
      const interval = setInterval(() => {
        if (currentStep < steps.length) {
          setThinkingSteps(prev => [...prev, steps[currentStep]]);
          currentStep++;
        } else {
          clearInterval(interval);
          setSearchPhase('analyzing');
          // Send to actual AI
          sendMessage({ text: `Help me find: ${initialQuery}. List 3 specific property recommendations for Nigeria with prices in Naira.` });
        }
      }, 600);
      
      return () => clearInterval(interval);
    }
  }, [initialQuery, searchPhase]);

  // Show results when AI responds
  useEffect(() => {
    if (messages.length > 0 && searchPhase === 'analyzing') {
      setSearchPhase('results');
      setTimeout(() => setShowResults(true), 500);
    }
  }, [messages, searchPhase]);

  const getMessageContent = (message: typeof messages[0]) => {
    return message.parts
      .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
      .map((part) => part.text)
      .join('');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    router.push(`/ai-search?q=${encodeURIComponent(input.trim())}`);
    setSearchPhase('thinking');
    setThinkingSteps([]);
    setShowResults(false);
  };

  const formatPrice = (price: number, period: string | null) => {
    const formatted = new Intl.NumberFormat('en-NG').format(price);
    if (!period) return `₦${formatted}`;
    return `₦${formatted}/${period === 'year' ? 'yr' : period === 'month' ? 'mo' : 'night'}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 text-white/80 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <Image src="/images/logo.png" alt="EstateMind" width={120} height={30} className="h-7 w-auto brightness-0 invert opacity-80" />
          </Link>
          <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            AI Property Search
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Search Input */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 rounded-2xl opacity-50 blur-lg"></div>
            <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center p-2">
              <div className="pl-4 pr-2">
                <Sparkles className="w-6 h-6 text-emerald-400" />
              </div>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe your ideal property..."
                className="flex-1 bg-transparent text-white text-lg py-4 px-3 placeholder-white/40 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all"
              >
                <span>Search</span>
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

        {/* Main Content Area */}
        <div className="grid lg:grid-cols-5 gap-8">
          {/* AI Chat Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden sticky top-24">
              {/* AI Header */}
              <div className="p-4 border-b border-white/10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold">Chinedu AI</h3>
                  <p className="text-emerald-400 text-xs flex items-center gap-1">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                    {isLoading ? 'Analyzing...' : 'Ready to help'}
                  </p>
                </div>
              </div>

              {/* Chat Content */}
              <div className="p-4 h-[400px] overflow-y-auto space-y-4">
                {/* Initial state */}
                {searchPhase === 'idle' && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                      <Home className="w-8 h-8 text-white/40" />
                    </div>
                    <p className="text-white/60 text-sm">
                      Tell me what you&apos;re looking for, and I&apos;ll find the perfect properties for you.
                    </p>
                  </div>
                )}

                {/* Thinking steps */}
                {(searchPhase === 'thinking' || searchPhase === 'analyzing') && (
                  <div className="space-y-3">
                    <div className="text-white/80 text-sm mb-4">
                      <span className="text-emerald-400 font-medium">Searching for:</span> {initialQuery}
                    </div>
                    {thinkingSteps.map((step, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 text-white/70 text-sm animate-in slide-in-from-left-2"
                        style={{ animationDelay: `${idx * 100}ms` }}
                      >
                        <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                          <Sparkles className="w-3 h-3 text-emerald-400" />
                        </div>
                        {step}
                      </div>
                    ))}
                    {searchPhase === 'analyzing' && (
                      <div className="flex items-center gap-3 text-emerald-400 text-sm mt-4">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Generating personalized recommendations...
                      </div>
                    )}
                  </div>
                )}

                {/* AI Response */}
                {searchPhase === 'results' && messages.length > 0 && (
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div key={msg.id} className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">
                        {getMessageContent(msg)}
                      </div>
                    ))}
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Actions */}
              <div className="p-4 border-t border-white/10">
                <p className="text-white/40 text-xs mb-2">Quick filters:</p>
                <div className="flex flex-wrap gap-2">
                  {['Under ₦5M', '24/7 Power', 'Serviced', 'Gated Estate'].map((filter) => (
                    <button
                      key={filter}
                      className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white/70 text-xs transition-colors"
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Property Results */}
          <div className="lg:col-span-3">
            {searchPhase === 'idle' ? (
              /* Suggested Searches */
              <div className="space-y-6">
                <h2 className="text-white/60 text-sm font-medium uppercase tracking-wider">Popular Searches</h2>
                <div className="grid gap-4">
                  {[
                    { query: '3-bedroom in Lekki under 5 million', icon: TrendingUp },
                    { query: 'Serviced apartment in VI with pool', icon: ThumbsUp },
                    { query: 'Short-let in Abuja for a weekend', icon: Zap },
                  ].map((suggestion) => (
                    <button
                      key={suggestion.query}
                      onClick={() => {
                        setInput(suggestion.query);
                        router.push(`/ai-search?q=${encodeURIComponent(suggestion.query)}`);
                        setSearchPhase('thinking');
                      }}
                      className="group flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all text-left"
                    >
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors">
                        <suggestion.icon className="w-5 h-5 text-emerald-400" />
                      </div>
                      <span className="text-white/80 group-hover:text-white transition-colors">
                        &ldquo;{suggestion.query}&rdquo;
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Results */
              <div className="space-y-6">
                {!showResults ? (
                  /* Loading skeleton */
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 animate-pulse">
                        <div className="flex gap-4">
                          <div className="w-32 h-24 bg-white/10 rounded-xl"></div>
                          <div className="flex-1 space-y-3">
                            <div className="h-5 bg-white/10 rounded w-3/4"></div>
                            <div className="h-4 bg-white/10 rounded w-1/2"></div>
                            <div className="h-4 bg-white/10 rounded w-1/4"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Actual results */
                  <>
                    <div className="flex items-center justify-between">
                      <h2 className="text-white font-bold text-lg">AI Recommendations</h2>
                      <span className="text-emerald-400 text-sm">{SAMPLE_PROPERTIES.length} matches found</span>
                    </div>
                    <div className="space-y-4">
                      {SAMPLE_PROPERTIES.map((property, idx) => (
                        <Link
                          key={property.id}
                          href={`/properties/${property.id}`}
                          className="group block bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/30 rounded-2xl p-4 transition-all animate-in slide-in-from-bottom-4"
                          style={{ animationDelay: `${idx * 150}ms` }}
                        >
                          <div className="flex gap-4">
                            {/* Image */}
                            <div className="relative w-32 h-24 rounded-xl overflow-hidden flex-shrink-0">
                              <Image
                                src={property.image}
                                alt={property.title}
                                fill
                                className="object-cover"
                              />
                              {property.verified && (
                                <div className="absolute top-2 left-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                                  <Shield className="w-3 h-3 text-white fill-white" />
                                </div>
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <h3 className="text-white font-bold truncate group-hover:text-emerald-400 transition-colors">
                                  {property.title}
                                </h3>
                                <span className="text-emerald-400 font-bold whitespace-nowrap">
                                  {formatPrice(property.price, property.period)}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-1 text-white/60 text-sm mb-2">
                                <MapPin className="w-3 h-3" />
                                {property.location}
                              </div>

                              <div className="flex items-center gap-4 text-white/50 text-xs mb-3">
                                <span className="flex items-center gap-1">
                                  <BedDouble className="w-3 h-3" /> {property.bedrooms} bed
                                </span>
                                <span className="flex items-center gap-1">
                                  <Bath className="w-3 h-3" /> {property.bathrooms} bath
                                </span>
                              </div>

                              {/* AI Insight */}
                              <div className="flex items-start gap-2">
                                <span className="px-2 py-1 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 rounded-full text-emerald-400 text-xs font-medium flex items-center gap-1">
                                  <Sparkles className="w-3 h-3" />
                                  {property.aiInsight}
                                </span>
                                <span className="text-white/40 text-xs">
                                  {property.aiReason}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>

                    {/* Warning notice */}
                    <div className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                      <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="text-yellow-200 font-medium mb-1">AI Recommendations</p>
                        <p className="text-white/60">
                          These suggestions are generated by AI based on your query. Always verify property details and agent credentials before making any payments.
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading fallback for Suspense
function AISearchLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mx-auto mb-4" />
        <p className="text-white/60">Loading AI Search...</p>
      </div>
    </div>
  );
}

// Default export with Suspense wrapper
export default function AISearchPageWrapper() {
  return (
    <Suspense fallback={<AISearchLoading />}>
      <AISearchPageContent />
    </Suspense>
  );
}
