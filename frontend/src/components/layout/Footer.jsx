import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sprout,
  ShieldCheck,
  ArrowUpRight,
  Twitter,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
} from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800/80 relative selection:bg-brand-500 selection:text-white">
      {/* Top subtle ambient glow line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-9 pb-4 sm:pt-10 sm:pb-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white shadow-soft-sm group-hover:scale-105 transition-transform">
                <Sprout className="w-6 h-6" />
              </div>
              <span className="text-xl font-black tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                AgriMarket
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              Empowering farmers to trade high-quality agricultural produce directly with buyers across India with zero middlemen, supported by real-time Mandi market rates, weather advisories, and agronomy guides.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Direct farmer trading & authenticated OTP delivery</span>
            </div>

            {/* Social Icons below AgriMarket */}
            <div className="pt-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2.5">
                Connect With Us
              </span>
              <div className="flex items-center gap-2.5">
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800/90 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 hover:border-slate-700 transition-all hover:scale-105"
                  aria-label="Twitter / X"
                  title="Twitter / X"
                >
                  <Twitter className="w-4 h-4" />
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800/90 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 hover:border-slate-700 transition-all hover:scale-105"
                  aria-label="Facebook"
                  title="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800/90 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 hover:border-slate-700 transition-all hover:scale-105"
                  aria-label="Instagram"
                  title="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800/90 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 hover:border-slate-700 transition-all hover:scale-105"
                  aria-label="LinkedIn"
                  title="LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800/90 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 hover:border-slate-700 transition-all hover:scale-105"
                  aria-label="YouTube"
                  title="YouTube"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Marketplace Col - Mapped with exact categories & List Produce preserved */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-white mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Marketplace</span>
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link
                  to="/marketplace"
                  className="text-slate-400 hover:text-emerald-400 transition-colors inline-block hover:translate-x-0.5 transform duration-150"
                >
                  All Farm Produce
                </Link>
              </li>
              <li>
                <Link
                  to="/marketplace?category=seeds"
                  className="text-slate-400 hover:text-emerald-400 transition-colors inline-block hover:translate-x-0.5 transform duration-150"
                >
                  Seeds
                </Link>
              </li>
              <li>
                <Link
                  to="/marketplace?category=fertilizers"
                  className="text-slate-400 hover:text-emerald-400 transition-colors inline-block hover:translate-x-0.5 transform duration-150"
                >
                  Fertilizers
                </Link>
              </li>
              <li>
                <Link
                  to="/marketplace?category=pesticides"
                  className="text-slate-400 hover:text-emerald-400 transition-colors inline-block hover:translate-x-0.5 transform duration-150"
                >
                  Pesticides
                </Link>
              </li>
              <li>
                <Link
                  to="/marketplace?category=harvested"
                  className="text-slate-400 hover:text-emerald-400 transition-colors inline-block hover:translate-x-0.5 transform duration-150"
                >
                  Harvested Products
                </Link>
              </li>
              <li>
                <Link
                  to="/marketplace?category=pre-harvested"
                  className="text-slate-400 hover:text-emerald-400 transition-colors inline-block hover:translate-x-0.5 transform duration-150"
                >
                  Pre-Harvested Products
                </Link>
              </li>
              <li>
                <Link
                  to="/marketplace?category=equipment"
                  className="text-slate-400 hover:text-emerald-400 transition-colors inline-block hover:translate-x-0.5 transform duration-150"
                >
                  Farm Equipment
                </Link>
              </li>
              <li className="pt-1.5 border-t border-slate-800/60">
                <Link
                  to="/sell"
                  className="text-emerald-400 hover:text-emerald-300 transition-colors inline-flex items-center gap-1 font-bold"
                >
                  <span>List Produce</span> <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Farmer Advisory */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-white mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Farmer Advisory</span>
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link
                  to="/market-prices"
                  className="text-slate-400 hover:text-emerald-400 transition-colors inline-block hover:translate-x-0.5 transform duration-150"
                >
                  Mandi Live Prices
                </Link>
              </li>
              <li>
                <Link
                  to="/weather"
                  className="text-slate-400 hover:text-emerald-400 transition-colors inline-block hover:translate-x-0.5 transform duration-150"
                >
                  Weather Forecast & Risk
                </Link>
              </li>
              <li>
                <Link
                  to="/crops"
                  className="text-slate-400 hover:text-emerald-400 transition-colors inline-block hover:translate-x-0.5 transform duration-150"
                >
                  Crop Cultivation Guides
                </Link>
              </li>
            </ul>
          </div>

          {/* Company & Support */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-white mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Company & Help</span>
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link
                  to="/about"
                  className="text-slate-400 hover:text-emerald-400 transition-colors inline-block hover:translate-x-0.5 transform duration-150"
                >
                  About AgriMarket
                </Link>
              </li>
              <li>
                <Link
                  to="/support"
                  className="text-slate-400 hover:text-emerald-400 transition-colors inline-block hover:translate-x-0.5 transform duration-150"
                >
                  Help & FAQs
                </Link>
              </li>
              <li>
                <Link
                  to="/support"
                  className="text-slate-400 hover:text-emerald-400 transition-colors inline-block hover:translate-x-0.5 transform duration-150"
                >
                  Delivery & Payments
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-6 pt-3.5 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} AgriMarket. All rights reserved.</p>
          <p className="flex items-center gap-1 text-slate-400">
            Dedicated to Indian Agriculture & Farmer Prosperity
          </p>
        </div>
      </div>
    </footer>
  );
}
