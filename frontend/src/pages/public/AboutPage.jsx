import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sprout,
  ShoppingBag,
  TrendingUp,
  ShieldCheck,
  Truck,
  BookOpen,
  CloudSun,
  CheckCircle2,
  ArrowRight,
  HeartHandshake,
  BadgePercent,
  Layers,
  Users,
} from 'lucide-react';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import { Button } from '@/components/common/Button';

export function AboutPage() {
  const highlights = [
    {
      icon: BadgePercent,
      color: 'bg-emerald-50 text-emerald-700',
      title: 'Zero Intermediary Fees',
      desc: '100% of the sale price goes directly to the farmer without middleman deductions.',
    },
    {
      icon: TrendingUp,
      color: 'bg-brand-50 text-brand-700',
      title: 'Live Mandi Intelligence',
      desc: 'Real-time market price benchmarks across APMC mandis to ensure fair pricing.',
    },
    {
      icon: ShieldCheck,
      color: 'bg-blue-50 text-blue-700',
      title: 'OTP-Secured Deliveries',
      desc: 'Deliveries are confirmed through secure OTP verification between buyer and courier.',
    },
    {
      icon: CloudSun,
      color: 'bg-amber-50 text-amber-700',
      title: 'Weather & Crop Advisory',
      desc: 'Localized meteorological alerts and crop management guides to protect harvests.',
    },
  ];

  const steps = [
    {
      number: '1',
      title: 'Farmer Lists Harvest',
      desc: 'Farmers post their available produce with quantity, harvest date, fair pricing, and farm location.',
      icon: Sprout,
    },
    {
      number: '2',
      title: 'Buyer Discovers & Buys',
      desc: 'Consumers and businesses browse fresh produce, compare transparent prices, and order online.',
      icon: ShoppingBag,
    },
    {
      number: '3',
      title: 'Safe OTP Handover',
      desc: 'Produce is dispatched and safely received upon verifying the one-time delivery code.',
      icon: Truck,
    },
  ];

  const farmerBenefits = [
    'Direct access to thousands of retail and commercial buyers',
    'Set your own fair rates without middleman pressure',
    'Live mandi commodity price tracking for smart selling',
    'Secure, fast bank payouts for completed deliveries',
  ];

  const buyerBenefits = [
    'Fresh crops harvested and shipped directly from the grower',
    'Transparent prices without retail middleman markups',
    'Authentic farm locations and harvest date details',
    'OTP-verified delivery ensuring complete order peace of mind',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16 space-y-10 animate-fade-in">
      <Breadcrumb items={[{ label: 'About Us' }]} />

      {/* Simple, Friendly Hero Header */}
      <div className="bg-gradient-to-br from-brand-50 via-emerald-50/60 to-white rounded-3xl border border-brand-100 p-6 sm:p-10 shadow-soft-xs text-center sm:text-left relative overflow-hidden">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100/80 text-brand-800 text-xs font-bold uppercase tracking-wider">
            <Sprout className="w-4 h-4 text-brand-700" />
            <span>Empowering Indian Agriculture</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Bridging the Gap Between Farmers and Consumers
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            AgriMarket is a transparent digital agricultural marketplace built to eliminate middleman exploitation, ensure fair compensation for growers, and provide buyers with fresh produce directly from verified farms.
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2">
            <Link to="/marketplace">
              <Button variant="earth" size="md" icon={ShoppingBag}>
                Explore Marketplace
              </Button>
            </Link>
            <Link to="/market-prices">
              <Button variant="outline" size="md" icon={TrendingUp}>
                Check Mandi Prices
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Key Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {highlights.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-soft-xs hover:shadow-soft-md hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center mb-3.5`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 mb-1">{item.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mission & Vision - 2 Clean Material Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-soft-xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Our Mission</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            To empower farmers by removing unnecessary middlemen, providing real-time commodity pricing intelligence, and creating a reliable, direct trading bridge where hard work is rewarded with fair market value.
          </p>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-soft-xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Our Vision</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            To become India’s most trusted and accessible farm-to-door network, driving agricultural prosperity through technology, verified transparency, and sustainable rural economic growth.
          </p>
        </div>
      </div>

      {/* How AgriMarket Works (Simple 3-Step Process) */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-soft-xs space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            How AgriMarket Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            A simple, transparent, and secure 3-step trade process for everyone.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((st, idx) => {
            const Icon = st.icon;
            return (
              <div
                key={idx}
                className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-5 space-y-3 relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-white text-brand-700 border border-slate-200/70 shadow-soft-xs flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="w-7 h-7 rounded-full bg-brand-600 text-white text-xs font-black flex items-center justify-center">
                      {st.number}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 mb-1">{st.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{st.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Who is it for? Farmers vs Buyers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* For Farmers */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-soft-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-earth-50 text-earth-700 flex items-center justify-center">
                <Sprout className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">For Farmers & Growers</h3>
                <p className="text-xs text-slate-500">Sell your crops directly and boost income</p>
              </div>
            </div>

            <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
              {farmerBenefits.map((b, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-2">
            <Link to="/sell">
              <Button variant="earth" size="sm" icon={ArrowRight} className="w-full sm:w-auto">
                Start Selling Produce
              </Button>
            </Link>
          </div>
        </div>

        {/* For Buyers */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-soft-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">For Buyers & Households</h3>
                <p className="text-xs text-slate-500">Get fresh, quality produce at fair prices</p>
              </div>
            </div>

            <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
              {buyerBenefits.map((b, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-2">
            <Link to="/marketplace">
              <Button variant="outline" size="sm" icon={ArrowRight} className="w-full sm:w-auto">
                Browse Marketplace
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Help & Advisory Banner */}
      <div className="bg-slate-50 rounded-2xl sm:rounded-3xl border border-slate-200/80 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="space-y-1">
          <h3 className="font-bold text-base text-slate-900">Need Agronomy Guidance or Weather Info?</h3>
          <p className="text-xs text-slate-500">
            Check local weather conditions and access comprehensive agronomy cultivation guides anytime.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 w-full sm:w-auto">
          <Link to="/crops" className="w-full sm:w-auto">
            <Button variant="outline" size="sm" icon={BookOpen} className="w-full sm:w-auto">
              Crop Encyclopedia
            </Button>
          </Link>
          <Link to="/weather" className="w-full sm:w-auto">
            <Button variant="outline" size="sm" icon={CloudSun} className="w-full sm:w-auto">
              Weather Advisory
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

