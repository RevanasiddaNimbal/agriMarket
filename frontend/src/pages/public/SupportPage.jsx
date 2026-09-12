import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Mail, Phone, ShieldCheck } from 'lucide-react';
import { Breadcrumb } from '@/components/common/Breadcrumb';

export function SupportPage() {
  const [openFaq, setOpenFaq] = useState(0);

  const faqs = [
    {
      q: 'How does the Buy Now checkout work without a shopping cart?',
      a: 'AgriMarket uses a direct single-item purchase workflow tailored specifically for agricultural bulk & produce orders. You select your quantity and shipping address directly on the product, and our system validates stock in real-time before taking you to secure payment.',
    },
    {
      q: 'How do farmers list and sell their crops?',
      a: 'Any registered user can list produce immediately by visiting "Sell Product". Once you provide the crop name, category, price, quantity, and upload pictures, your listing goes live across the marketplace.',
    },
    {
      q: 'How is delivery verified securely?',
      a: 'When an order is dispatched, a one-time passcode (OTP) is sent to the buyer’s registered email address. The delivery agent or seller inputs this code upon delivery handover to mark the order as DELIVERED.',
    },
    {
      q: 'Can I request a refund if an order is cancelled?',
      a: 'Yes, if an order is cancelled prior to shipping, you can trigger a direct refund request from your Order Details page. The backend processes the refund and logs a transaction receipt.',
    },
    {
      q: 'Where does the Mandi Market Price data originate?',
      a: 'Market prices are ingested from official Indian agricultural Mandi data feeds, providing modal, minimum, and maximum rates across states and APMC market centers.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <Breadcrumb items={[{ label: 'Help & Support' }]} />

      <div className="text-center space-y-3">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          AgriMarket Support & FAQs
        </h1>
        <p className="text-sm text-slate-500 max-w-lg mx-auto">
          Find instant answers to common questions regarding orders, payments, delivery OTPs, and Mandi price data.
        </p>
      </div>

      {/* FAQ Accordion */}
      <div className="space-y-3">
        {faqs.map((faq, index) => {
          const isOpen = openFaq === index;
          return (
            <div
              key={index}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-soft-sm transition-all"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(isOpen ? null : index)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-900 hover:text-brand-700 transition-colors"
              >
                <span>{faq.q}</span>
                {isOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
              </button>
              {isOpen && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Contact Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-soft-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase text-slate-500">Email Support</h4>
            <p className="text-sm font-semibold text-slate-900">support@agrimarket.in</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-soft-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-earth-50 text-earth-600 flex items-center justify-center">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase text-slate-500">Farmer Toll-Free Helpline</h4>
            <p className="text-sm font-semibold text-slate-900">1800-180-1551 (Kisan Call Center)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
