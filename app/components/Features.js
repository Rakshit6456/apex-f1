"use client";
import React from 'react';
import SpotlightCard from './SpotlightCard';
import ShinyText from './ShinyText';
import { Trophy, Calendar, BarChart3, Clock, Zap, Shield } from 'lucide-react';

const features = [
    {
        title: "Real-time Standings",
        description: "Get the latest driver and constructor standings directly from the official F1 data feeds. Updated after every session.",
        icon: <Trophy className="w-8 h-8 text-[#FF1801]" />,
    },
    {
        title: "Race Calendar",
        description: "Never miss a race with our comprehensive season schedule including practice, qualifying, and sprint details.",
        icon: <Calendar className="w-8 h-8 text-[#FF1801]" />,
    },
    {
        title: "Interactive Analytics",
        description: "Deep dive into race performance, lap times, and historical data with our advanced analytics engine.",
        icon: <BarChart3 className="w-8 h-8 text-[#FF1801]" />,
    },
    {
        title: "Countdown Timer",
        description: "Stay ahead of the grid with precise countdowns to every session, adjusted to your local timezone.",
        icon: <Clock className="w-8 h-8 text-[#FF1801]" />,
    },
    {
        title: "Instant Updates",
        description: "Experience lightning-fast data updates powered by the Jolpi and OpenF1 APIs for the ultimate fan experience.",
        icon: <Zap className="w-8 h-8 text-[#FF1801]" />,
    },
    {
        title: "Premium Experience",
        description: "A sleek, high-end interface designed specifically for Formula 1 enthusiasts who demand quality.",
        icon: <Shield className="w-8 h-8 text-[#FF1801]" />,
    }
];

const Features = () => {
    return (
        <section className="py-24 px-4 bg-[#0A0A0A] relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#FF1801]/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#FF1801]/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-6xl font-extrabold text-white uppercase italic tracking-tighter mb-4">
                        Project <ShinyText text="Features" className="text-[#FF1801] inline-block" />
                    </h2>
                    <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto font-light">
                        Everything you need for the ultimate 2025 Formula 1 season coverage.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                        <SpotlightCard key={index} className="h-full border-white/5 bg-white/[0.02]">
                            <div className="mb-6 bg-white/5 w-16 h-16 rounded-2xl flex items-center justify-center border border-white/10">
                                {feature.icon}
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-3 tracking-tight italic uppercase">
                                {feature.title}
                            </h3>
                            <p className="text-white/40 leading-relaxed font-light">
                                {feature.description}
                            </p>
                        </SpotlightCard>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;
