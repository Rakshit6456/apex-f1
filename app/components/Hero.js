"use client";
import Image from 'next/image';
import { useState, useEffect } from 'react';
import Hyperspeed from './Hyperspeed/Hyperspeed';
import { hyperspeedPresets } from './Hyperspeed/HyperSpeedPresets';

export default function Hero({ nextRace }) {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });

    const f1HyperspeedOptions = {
        ...hyperspeedPresets.three,
        speedUp: 4,
        totalSideLightSticks: 100,
        lightPairsPerRoadWay: 80,
        colors: {
            ...hyperspeedPresets.three.colors,
            roadColor: 0x080808,
            islandColor: 0x0a0a0a,
            background: 0x000000,
            shoulderLines: 0xFF1801,
            brokenLines: 0xFFFFFF,
            leftCars: [0xFF1801, 0xFF4433, 0xFF1801],
            rightCars: [0xFFFFFF, 0xEEEEEE, 0xFFFFFF],
            sticks: 0xFF1801
        }
    };

    useEffect(() => {
        if (!nextRace) return;

        const calculateTimeLeft = () => {
            const raceDate = new Date(`${nextRace.date}T${nextRace.time}`);
            const now = new Date();
            const difference = raceDate - now;

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                });
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 60000); // Update every minute

        return () => clearInterval(timer);
    }, [nextRace]);

    return (
        <section className="relative h-screen w-full bg-[#0A0A0A] overflow-hidden px-12">
            {/* Hyperspeed Background - Shifted up */}
            <div className="absolute inset-x-0 -top-20 bottom-20 z-0">
                <Hyperspeed effectOptions={f1HyperspeedOptions} />
            </div>

            {/* Background Gradient / Glow - Adjusted for better contrast */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-transparent to-transparent z-10 pointer-events-none"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent z-10 pointer-events-none"></div>


            <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-20 h-full">

                {/* Left Content */}
                <div className="flex flex-col h-full pt-44">
                    <div className="flex items-center space-x-4 mb-6">
                        <div className="w-12 h-[1px] bg-[#FF1801]"></div>
                        <span className="text-[#FF1801] uppercase tracking-[0.4em] text-xs font-bold font-condensed">2026 Formula 1 Season</span>
                    </div>

                    <h1 className="text-7xl md:text-9xl font-black text-white leading-[0.85] mb-8 uppercase italic font-condensed ">
                        Your Pit Wall.<br />
                        <span className="text-[#FF1801]">Anywhere</span>
                    </h1>

                    <p className="text-gray-400 text-lg max-w-xl mb-12 font-light leading-relaxed italic">
                        Real-time standings, race results, head-to-head drivers comparison.
                        <br />
                        Everything F1 in one cockpit.
                    </p>

                    <div>
                        <button className="bg-[#B90E0A] hover:bg-[#FF1801] text-white px-10 py-4 rounded-sm text-sm font-bold uppercase tracking-[0.2em] italic font-condensed skew-x-[-15deg] transition-all transform hover:scale-105 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.5)]">
                            <span className="block skew-x-[15deg]">Explore Season</span>
                        </button>
                    </div>
                </div>

                {/* Right Content - Car & Timer */}
                <div className="relative flex flex-col justify-center items-center h-full">

                    {/* Countdown Timer */}
                    {nextRace && (
                        <div className="absolute top-32 right-0 bg-black/60 backdrop-blur-xl rounded-xl px-10 py-5 flex items-center space-x-10 border border-white/5 self-end shadow-2xl z-30">
                            <div className="text-center">
                                <span className="block text-4xl font-extrabold text-white font-condensed tracking-tighter">{timeLeft.days}</span>
                                <span className="text-[10px] uppercase text-[#FF1801] font-bold tracking-[0.2em] font-condensed">Days</span>
                            </div>
                            <div className="h-10 w-[1px] bg-white/10"></div>
                            <div className="text-center">
                                <span className="block text-4xl font-extrabold text-white font-condensed tracking-tighter">{String(timeLeft.hours).padStart(2, '0')}</span>
                                <span className="text-[10px] uppercase text-[#FF1801] font-bold tracking-[0.2em] font-condensed">Hrs</span>
                            </div>
                            <div className="h-10 w-[1px] bg-white/10"></div>
                            <div className="text-center">
                                <span className="block text-4xl font-extrabold text-white font-condensed tracking-tighter">{String(timeLeft.minutes).padStart(2, '0')}</span>
                                <span className="text-[10px] uppercase text-[#FF1801] font-bold tracking-[0.2em] font-condensed">Min</span>
                            </div>
                            <div className="pl-6 border-l border-white/10 ml-6">
                                <div className="text-sm text-white font-bold uppercase font-condensed tracking-tight">{nextRace.raceName}</div>
                                <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">{nextRace.Circuit.circuitName}</div>
                                <div className="text-xs text-[#FF1801] font-bold italic uppercase font-condensed">{new Date(nextRace.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}</div>
                            </div>
                        </div>
                    )}

                    {/* Radial Background behind car */}
                    <div className="absolute inset-x-0 h-[500px] bg-[radial-gradient(circle_at_center,_rgba(60,60,60,0.3)_0%,_rgba(0,0,0,0)_70%)] z-0 rounded-full blur-3xl translate-y-10"></div>

                    {/* Car Container - Grounded with speed effects */}
                    <div className="relative w-full h-80 mt-24 scale-125 translate-x-10 translate-y-4 z-10">

                        {/* Shadow Layers for Grounding */}
                        {/* 1. Ambient Occlusion (Soft, large) */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[85%] h-16 bg-black/60 blur-3xl rounded-[100%] z-0"></div>

                        {/* 2. Mid Shadow (Defined) */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[75%] h-8 bg-black/80 blur-xl rounded-[100%] z-0"></div>

                        {/* 3. Sharp Contact Shadow (Right under the body/tires) */}
                        <div className="absolute bottom-11 left-1/2 -translate-x-1/2 w-[65%] h-3 bg-black/100 blur-[3px] rounded-[100%] z-0 opacity-90"></div>

                        {/* 4. Under-glow (Reflected light from hyperspeed sticks) */}
                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[60%] h-4 bg-[#FF1801]/10 blur-xl rounded-full z-0 animate-pulse"></div>

                        {/* Subtle Reflection on Tarmac */}
                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-full h-32 scale-y-[-0.6] opacity-[0.08] blur-[4px] pointer-events-none z-0">
                            <Image
                                src="/images/car2.png"
                                alt=""
                                fill
                                className="object-contain"
                            />
                        </div>

                        {/* The F1 Car */}
                        <div className="relative w-full h-full z-10 pointer-events-none">
                            <Image
                                src="/images/car2.png"
                                alt="F1 Car"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>

                        {/* Environmental Effects (Heat haze / tire friction) */}
                        <div className="absolute bottom-10 left-[18%] w-24 h-16 bg-red-600/5 blur-2xl rounded-full mix-blend-screen animate-pulse pointer-events-none z-0"></div>
                        <div className="absolute bottom-10 right-[28%] w-32 h-16 bg-red-600/5 blur-3xl rounded-full mix-blend-screen animate-pulse pointer-events-none z-0"></div>

                        {/* Tire contact smoke/vapor (Subtle) */}
                        <div className="absolute bottom-12 left-[15%] w-16 h-8 bg-white/5 blur-xl rounded-full z-0 opacity-40"></div>
                        <div className="absolute bottom-12 right-[25%] w-16 h-8 bg-white/5 blur-xl rounded-full z-0 opacity-40"></div>
                    </div>
                </div>

            </div>

            {/* Decorative side line */}
            <div className="absolute left-0 top-20 bottom-20 w-[1px] bg-gradient-to-b from-transparent via-[#FF1801] to-transparent opacity-50"></div>
        </section>
    );
}
