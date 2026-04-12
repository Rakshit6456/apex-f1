"use client";
import React from 'react';

export default function PageHeader({ 
    title, 
    subtitle, 
    eyebrow, 
    description, 
    watermark, 
    children,
    className = "" 
}) {
    return (
        <header className={`pt-32 md:pt-48 pb-12 md:pb-20 px-6 md:px-12 relative overflow-hidden bg-[#0A0A0A] border-b border-white/5 ${className}`}>
            {/* Background Watermark */}
            {watermark && (
                <div className="absolute right-0 md:right-20 top-1/2 -translate-y-1/2 text-9xl md:text-[20rem] font-black text-white/[0.03] font-condensed pointer-events-none select-none italic translate-x-1/2 md:translate-x-0 z-0">
                    {watermark}
                </div>
            )}

            <div className="container-custom relative z-10">
                {/* Eyebrow Label */}
                {eyebrow && (
                    <div className="flex items-center space-x-4 mb-6">
                        <div className="w-8 md:w-12 h-[1px] bg-[#FF1801]"></div>
                        <span className="text-[#FF1801] uppercase tracking-[0.2em] md:tracking-[0.4em] text-[10px] md:text-xs font-bold font-condensed">
                            {eyebrow}
                        </span>
                    </div>
                )}

                {/* Main Title */}
                <h1 className="text-5xl md:text-9xl font-black text-white leading-[0.85] mb-8 uppercase italic font-condensed">
                    {title}
                    {subtitle && (
                        <>
                            <br />
                            <span className="text-[#FF1801]">{subtitle}</span>
                        </>
                    )}
                </h1>

                {/* Description Text */}
                {description && (
                    <p className="text-gray-400 text-base md:text-lg max-w-xl font-light leading-relaxed italic">
                        {description}
                    </p>
                )}

                {/* Extra Content (Stats, Selectors, etc.) */}
                {children && (
                    <div className="flex flex-wrap gap-8 md:gap-12 mt-12">
                        {children}
                    </div>
                )}
            </div>
        </header>
    );
}
