import React from 'react';
import { Users, MessageSquare, Sparkles, Send, Heart, Share2, HelpCircle } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Breadcrumb } from '@/components/common/Breadcrumb';

export function CommunityPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      <Breadcrumb items={[{ label: 'Farmer Community Forum' }]} />

      <div className="text-center space-y-3 max-w-xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold uppercase tracking-wider border border-brand-200">
          <Users className="w-4 h-4" />
          <span>Kisan Community & Knowledge Exchange</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Farmer Discussion Hub
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Connect with fellow growers, ask pest management questions, and share seasonal harvest wisdom.
        </p>
      </div>

      {/* Community Announcement Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-soft-sm text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
          <MessageSquare className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-900">Community Forum & Agronomy Q&A</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          The peer-to-peer farmer messaging network and expert agronomy forum are being integrated into the platform backend. In the meantime, consult the live <strong>Weather Advisory</strong> and <strong>Crop Agronomy Guide</strong> for expert cultivation insights.
        </p>
      </div>
    </div>
  );
}
