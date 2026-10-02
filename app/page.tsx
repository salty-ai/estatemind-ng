'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, ShieldCheck, MessageSquare, Menu, X, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const NAV_LINKS = [
  { label: 'Rent', href: '/search?type=rent' },
  { label: 'Buy', href: '/search?type=sale' },
  { label: 'Short-let', href: '/search?type=short_let' },
  { label: 'AI Search', href: '/ai-search' },
];

const EXAMPLE_PROMPTS = [
  "Find me a 2-bed in Lekki under 5m with 24/7 power...",
  "I need a serviced office in VI for a team of 10...",
  "Show me secure estates in Abuja near the airport...",
  "3-bedroom apartment in Ikeja GRA with a pool...",
];

export default function Home() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [placeholderText, setPlaceholderText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(100);
  const [searchInput, setSearchInput] = useState("");

  const handleAISearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(`/ai-search?q=${encodeURIComponent(searchInput.trim())}`);
    } else {
      router.push('/ai-search');
    }
  };

  const handleQuickSearch = (query: string) => {
    router.push(`/ai-search?q=${encodeURIComponent(query)}`);
  };

  // Typewriter effect logic
  useEffect(() => {
    const handleTyping = () => {
      const currentFullText = EXAMPLE_PROMPTS[placeholderIndex];
      
      if (isDeleting) {
        setPlaceholderText(currentFullText.substring(0, placeholderText.length - 1));
        setTypingSpeed(50);
      } else {
        setPlaceholderText(currentFullText.substring(0, placeholderText.length + 1));
        setTypingSpeed(100);
      }

      if (!isDeleting && placeholderText === currentFullText) {
        setTimeout(() => setIsDeleting(true), 2000); // Pause at end
      } else if (isDeleting && placeholderText === '') {
        setIsDeleting(false);
        setPlaceholderIndex((prev) => (prev + 1) % EXAMPLE_PROMPTS.length);
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [placeholderText, isDeleting, placeholderIndex, typingSpeed]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Navigation */}
      <nav className="fixed w-full bg-white/80 backdrop-blur-xl z-50 border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <Link href="/" className="shrink-0 flex items-center gap-2 group">
              <div className="relative">
                 <Image
                  src="/images/logo.png"
                  alt="EstateMind Logo"
                  width={140}
                  height={36}
                  className="h-10 w-auto transition-transform group-hover:scale-105"
                  priority
                />
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse border-2 border-white"></div>
              </div>
            </Link>
            
            <div className="hidden md:flex items-center space-x-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="px-4 py-2 text-slate-600 hover:text-emerald-700 font-medium transition-all hover:bg-emerald-50/50 rounded-full"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="hidden md:block text-slate-600 font-semibold hover:text-emerald-700 px-4"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="hidden sm:flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-full font-medium hover:bg-emerald-600 transition-all shadow-lg hover:shadow-emerald-600/25 group"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-slate-600 hover:text-emerald-600 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-slate-100 absolute w-full z-40">
            <div className="px-4 py-6 space-y-2">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-4 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 rounded-2xl font-medium transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <hr className="my-4 border-slate-100" />
              <Link
                href="/login"
                className="block px-4 py-3 text-emerald-700 font-semibold text-center bg-emerald-50 rounded-xl"
              >
                Login
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 lg:pt-52 lg:pb-32 overflow-hidden">
        {/* Abstract Tech Background */}
        <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-50 via-white to-white"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-emerald-200/20 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-indigo-200/20 rounded-full blur-3xl opacity-40"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* AI Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-emerald-100 shadow-sm text-emerald-800 text-sm font-semibold mb-8 animate-fade-in-up">
              <Sparkles className="w-4 h-4 fill-emerald-500 text-emerald-500" />
              <span>Powered by EstateMind Intelligence</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-8 leading-[1.1]">
              Real Estate, <br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Reimagined by AI.</span>
            </h1>
            
            <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              Skip the search filters. Just tell our AI agent what you&apos;re looking for, and let it negotiate, verify, and schedule for you.
            </p>

            {/* AI Command Center Input */}
            <div className="relative max-w-3xl mx-auto group">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 rounded-2xl opacity-30 blur group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <form onSubmit={handleAISearch} className="relative bg-white rounded-2xl shadow-2xl shadow-slate-200/50 flex items-center p-2 transition-transform active:scale-[0.99]">
                  <div className="pl-4 pr-3 text-slate-400">
                    <Sparkles className="w-6 h-6 text-indigo-500 animate-pulse" />
                  </div>
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="flex-1 bg-transparent border-none text-lg py-4 px-2 text-slate-900 placeholder-slate-300 focus:ring-0 outline-none"
                    placeholder={placeholderText}
                    aria-label="AI Search Prompt"
                  />
                  <div className="hidden md:flex gap-2 mr-2">
                     <button type="button" className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors" title="Voice Input">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="23"/><line x1="8" x2="16" y1="23" y2="23"/></svg>
                     </button>
                  </div>
                  <button type="submit" className="bg-slate-900 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-emerald-600 transition-all shadow-md flex items-center gap-2">
                    <span>Ask AI</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
            </div>

            {/* Quick Chips */}
            <div className="mt-8 flex flex-wrap justify-center gap-3 opacity-80">
              <span className="text-sm text-slate-500 font-medium py-1">Try asking:</span>
              {[
                { label: '"2-bed in Lekki < 5M"', query: '2-bedroom apartment in Lekki under 5 million naira' },
                { label: '"Office with 24h power"', query: 'Office space with 24/7 power supply in Lagos' },
                { label: '"Short-let with pool"', query: 'Short-let apartment with swimming pool' },
              ].map((tag) => (
                 <button
                   key={tag.label}
                   onClick={() => handleQuickSearch(tag.query)}
                   className="text-sm px-3 py-1 bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-slate-600 rounded-full transition-colors cursor-pointer"
                 >
                    {tag.label}
                 </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Modern Features Grid */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="text-center mb-20">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">The new standard for Nigerian Real Estate</h2>
              <p className="text-slate-600 max-w-2xl mx-auto">Built on advanced AI to eliminate fraud, reduce wait times, and guarantee quality.</p>
           </div>

           <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="group p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-emerald-900/5 transition-all duration-300 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                    <ShieldCheck className="w-32 h-32 text-emerald-600 transform translate-x-8 -translate-y-8" />
                 </div>
                 <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-emerald-600">
                    <ShieldCheck className="w-7 h-7" />
                 </div>
                 <h3 className="text-xl font-bold text-slate-900 mb-3">TrueVerify™ Protocol</h3>
                 <p className="text-slate-600 leading-relaxed relative z-10">
                    Our AI cross-references land registry data and conducts video verification. No more &quot;inspection fees&quot; for fake listings.
                 </p>
              </div>

              {/* Feature 2 */}
              <div className="group p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-indigo-900/5 transition-all duration-300 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                    <MessageSquare className="w-32 h-32 text-indigo-600 transform translate-x-8 -translate-y-8" />
                 </div>
                 <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-indigo-600">
                    <MessageSquare className="w-7 h-7" />
                 </div>
                 <h3 className="text-xl font-bold text-slate-900 mb-3">24/7 AI Broker</h3>
                 <p className="text-slate-600 leading-relaxed relative z-10">
                    Negotiate prices, check tenancy laws, and schedule inspections instantly with &quot;Chinedu&quot;, your personal AI agent.
                 </p>
              </div>

               {/* Feature 3 */}
               <div className="group p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-orange-900/5 transition-all duration-300 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                    <MapPin className="w-32 h-32 text-orange-600 transform translate-x-8 -translate-y-8" />
                 </div>
                 <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-orange-600">
                    <MapPin className="w-7 h-7" />
                 </div>
                 <h3 className="text-xl font-bold text-slate-900 mb-3">Hyper-Local Intel</h3>
                 <p className="text-slate-600 leading-relaxed relative z-10">
                    Predictive insights on flood risks, power stability, and traffic patterns for every street in Lagos.
                 </p>
              </div>
           </div>
        </div>
      </section>

      {/* Minimal CTA */}
      <section className="py-24 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('/images/hero-banner.png')] bg-cover bg-center mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent"></div>
        
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 tracking-tight">
            Stop Searching. Start Instructing.
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
             <Link
              href="/ai-search"
              className="bg-emerald-500 text-white px-10 py-4 rounded-xl font-bold hover:bg-emerald-400 transition-all shadow-lg hover:shadow-emerald-500/30"
            >
              Talk to Agent
            </Link>
             <Link
              href="/signup"
              className="px-10 py-4 rounded-xl font-bold text-white border border-slate-700 hover:bg-white/10 transition-colors"
            >
              List Property
            </Link>
          </div>
        </div>
      </section>

      {/* Footer (Simplified) */}
      <footer className="bg-white border-t border-slate-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="flex items-center gap-2">
             <Image src="/images/logo.png" alt="EstateMind" width={120} height={30} className="h-6 w-auto opacity-80" />
             <span className="text-slate-400 text-sm">© {new Date().getFullYear()}</span>
           </div>
           <div className="flex gap-8 text-sm text-slate-500">
              <Link href="#" className="hover:text-emerald-600 transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-emerald-600 transition-colors">Terms</Link>
              <Link href="#" className="hover:text-emerald-600 transition-colors">Support</Link>
           </div>
        </div>
      </footer>
    </div>
  );
}
