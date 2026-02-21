"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Calendar', href: '/calendar' },
    { name: 'Results', href: '/results' },
    { name: 'Standings', href: '/standings' },
  ];

  return (
    <nav className="flex items-center justify-between px-12 py-8 bg-transparent absolute top-0 w-full z-50">
      <div className="text-3xl font-extrabold tracking-tighter font-condensed italic">
        <span className="text-[#FF1801]">AP</span>
        <span className="text-white">EX</span>
      </div>

      <div className="hidden md:flex items-center space-x-12">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`${isActive ? 'text-white border-b-2 border-[#FF1801] pb-1' : 'text-gray-400 hover:text-white transition-colors'} uppercase font-bold font-condensed tracking-widest text-sm`}
            >
              {link.name}
            </Link>
          );
        })}
      </div>

      <div>
        <span className="border border-[#FF1801]/30 text-gray-300 px-6 py-2 rounded-sm text-[10px] font-bold  uppercase font-condensed tracking-[0.2em]">
          2026 Season
        </span>
      </div>
    </nav>
  );
}
