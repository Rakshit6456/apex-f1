"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronRight } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when path changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Calendar', href: '/calendar' },
    { name: 'Results', href: '/results' },
    { name: 'Standings', href: '/standings' },
    { name: 'Head-to-Head', href: '/head-to-head' },
  ];

  return (
    <>
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 px-6 md:px-12 py-6 ${scrolled ? 'bg-black/80 backdrop-blur-md py-4 border-b border-white/10' : 'bg-transparent'
        }`}>
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <Link href="/" className="text-3xl font-extrabold tracking-tighter font-condensed italic flex items-center group">
            <span className="text-[#FF1801] group-hover:scale-110 transition-transform">AP</span>
            <span className="text-white">EX</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-10">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative group ${isActive ? 'text-white' : 'text-gray-400 hover:text-white transition-colors'
                    } uppercase font-bold font-condensed tracking-widest text-sm`}
                >
                  {link.name}
                  <span className={`absolute -bottom-2 left-0 w-0 h-0.5 bg-[#FF1801] transition-all duration-300 ${isActive ? 'w-full' : 'group-hover:w-full'
                    }`}></span>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center space-x-6">
            <div className="hidden sm:block">
              <span className="border border-[#FF1801]/30 text-white px-4 py-1.5 rounded-sm text-[10px] font-bold uppercase font-condensed tracking-[0.2em] bg-[#FF1801]/10">
                2026 SEASON
              </span>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-white p-1 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Toggle Menu"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 md:hidden ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Mobile Sidebar Content */}
      <div className={`fixed top-0 right-0 h-full w-[80%] max-w-[320px] bg-[#0A0A0A] z-[60] shadow-2xl transform transition-transform duration-500 ease-out md:hidden flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
        <div className="p-8 flex items-center justify-between border-b border-white/5">
          <div className="text-2xl font-extrabold tracking-tighter font-condensed italic">
            <span className="text-[#FF1801]">AP</span>
            <span className="text-white">EX</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 py-10 px-8 flex flex-col space-y-6">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center justify-between group ${isActive ? 'text-[#FF1801]' : 'text-gray-300 hover:text-white'
                  } text-2xl font-bold font-condensed uppercase tracking-wider transition-colors`}
              >
                {link.name}
                <ChevronRight size={20} className={`text-[#FF1801] transition-transform duration-300 ${isActive ? 'translate-x-0' : '-translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'
                  }`} />
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}