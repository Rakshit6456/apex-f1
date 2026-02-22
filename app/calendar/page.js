"use client";
import React, { useState, useEffect } from 'react';
import Navbar from "../components/Navbar";
import { getFullSchedule2026, getNextRace } from '../utils/f1Api';

export default function CalendarPage() {
    const [races, setRaces] = useState([]);
    const [nextRace, setNextRace] = useState(null);
    const [filter, setFilter] = useState('ALL'); // ALL, UPCOMING, PAST
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        setMounted(true);
        setNow(new Date());
        const fetchData = async () => {
            try {
                const schedule = getFullSchedule2026();
                const next = schedule.find(r => new Date(r.date) >= now) || schedule[0];
                setRaces(schedule);
                setNextRace(next);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (!mounted || loading) {
        return (
            <div className="bg-[#0A0A0A] min-h-screen flex items-center justify-center">
                <div className="text-[#FF1801] font-black font-condensed animate-pulse text-2xl tracking-[0.5em]">LOADING CALENDAR...</div>
            </div>
        );
    }

    const filteredRaces = races.filter(race => {
        const raceDate = new Date(race.date);
        if (filter === 'UPCOMING') return raceDate >= now || race.round === nextRace?.round;
        if (filter === 'PAST') return raceDate < now && race.round !== nextRace?.round;
        return true;
    });

    const completedRaces = races.filter(r => new Date(r.date) < now).length;
    const remainingRaces = races.length - completedRaces;
    const progress = (completedRaces / races.length) * 100;

    const getFlagEmoji = (country) => {
        const flags = {
            "Australia": "🇦🇺", "China": "🇨🇳", "Japan": "🇯🇵", "Bahrain": "🇧🇭", "Saudi Arabia": "🇸🇦",
            "USA": "🇺🇸", "United States": "🇺🇸", "Italy": "🇮🇹", "Monaco": "🇲🇨", "Spain": "🇪🇸",
            "Canada": "🇨🇦", "Austria": "🇦🇹", "UK": "🇬🇧", "Great Britain": "🇬🇧", "Belgium": "🇧🇪",
            "Hungary": "🇭🇺", "Netherlands": "🇳🇱", "Azerbaijan": "🇦🇿", "Singapore": "🇸🇬",
            "Mexico": "🇲🇽", "Brazil": "🇧🇷", "Qatar": "🇶🇦", "Abu Dhabi": "🇦🇪", "United Arab Emirates": "🇦🇪"
        };
        return flags[country] || "🏁";
    };

    return (
        <main className="bg-[#0A0A0A] min-h-screen text-white font-sans selection:bg-[#FF1801] selection:text-white pb-20">
            <Navbar />

            {/* Header */}
            <header className="pt-32 md:pt-44 pb-12 md:pb-20 px-6 md:px-12 relative overflow-hidden bg-[#0A0A0A] border-b border-white/5">
                <div className="absolute right-0 md:right-20 top-1/2 -translate-y-1/2 text-9xl md:text-[20rem] font-black text-white/[0.05] font-condensed pointer-events-none select-none italic translate-x-1/2 md:translate-x-0">2026</div>
                <div className="container mx-auto relative z-10">
                    <div className="flex items-center space-x-4 mb-6">
                        <div className="w-8 md:w-12 h-[1px] bg-[#FF1801]"></div>
                        <span className="text-[#FF1801] uppercase tracking-[0.2em] md:tracking-[0.4em] text-[10px] md:text-xs font-bold font-condensed">World Championship Schedule</span>
                    </div>
                    <h1 className="text-5xl md:text-9xl font-black text-white leading-[0.85] mb-8 uppercase italic font-condensed">
                        Race<br />
                        <span className="text-[#FF1801]">Calendar</span>
                    </h1>
                    <p className="text-gray-400 text-base md:text-lg max-w-xl font-light leading-relaxed italic">
                        24 rounds across 21 countries. Follow the complete 2026 F1 season schedule with all circuits and dates.
                    </p>

                    <div className="flex flex-wrap gap-8 md:gap-12 mt-12">
                        <Stat label="TOTAL RACES" val={races.length} color="text-white" />
                        <Stat label="COMPLETED" val={completedRaces} color="text-yellow-400" />
                        <Stat label="REMAINING" val={remainingRaces} color="text-[#FF1801]" />
                    </div>
                </div>
            </header>

            {/* Next Race Banner */}
            {nextRace && (
                <section className="bg-gradient-to-r from-[#8B0000] to-[#FF1801] py-10 md:py-12 px-6 md:px-12 border-b border-white/10 relative overflow-hidden">
                    <div className="container mx-auto flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
                        <div className="text-center lg:text-left">
                            <span className="text-white/60 font-condensed text-[10px] tracking-[0.4em] uppercase font-bold">Next Race</span>
                            <h2 className="text-3xl md:text-4xl font-black text-white font-condensed uppercase italic tracking-tight">{nextRace.raceName}</h2>
                            <p className="text-white/80 font-condensed tracking-widest text-[10px] md:text-xs uppercase mt-1">
                                {getFlagEmoji(nextRace.Circuit.Location.country)} {nextRace.Circuit.Location.locality}, {nextRace.Circuit.Location.country} · Round {nextRace.round}
                            </p>
                        </div>

                        <div className="flex space-x-4 md:space-x-6 items-center bg-black/20 backdrop-blur-md p-4 md:p-6 rounded-sm border border-white/10">
                            <div className="text-center">
                                <span className="block text-2xl md:text-4xl font-black text-white font-condensed leading-none">
                                    {Math.floor((new Date(nextRace.date) - now) / (1000 * 60 * 60 * 24)).toString().padStart(2, '0')}
                                </span>
                                <span className="text-[9px] md:text-[10px] text-white/50 font-bold tracking-widest uppercase">Days</span>
                            </div>
                            <div className="h-8 md:h-10 w-[1px] bg-white/10"></div>
                            <div className="text-center">
                                <span className="block text-2xl md:text-4xl font-black text-white font-condensed leading-none">
                                    {Math.floor(((new Date(nextRace.date) - now) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, '0')}
                                </span>
                                <span className="text-[9px] md:text-[10px] text-white/50 font-bold tracking-widest uppercase">Hrs</span>
                            </div>
                            <div className="h-8 md:h-10 w-[1px] bg-white/10"></div>
                            <div className="text-center">
                                <span className="block text-2xl md:text-4xl font-black text-white font-condensed leading-none">
                                    {Math.floor(((new Date(nextRace.date) - now) % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0')}
                                </span>
                                <span className="text-[9px] md:text-[10px] text-white/50 font-bold tracking-widest uppercase">Min</span>
                            </div>
                        </div>

                        <div className="text-center lg:text-right">
                            <div className="text-lg md:text-xl font-black text-white font-condensed tracking-widest uppercase italic">
                                {new Date(nextRace.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </div>
                            <div className="text-[9px] md:text-[10px] text-white/60 font-condensed tracking-[0.1em] md:tracking-[0.2em] uppercase font-bold mt-1 max-w-[200px] md:max-w-none mx-auto">// {nextRace.Circuit.circuitName}</div>
                        </div>
                    </div>
                </section>
            )}

            {/* Season Progress */}
            <section className="py-12 px-6 md:px-12 bg-[#0D0D0D] border-b border-white/5">
                <div className="container mx-auto">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
                        <h3 className="text-2xl font-black text-white font-condensed italic uppercase tracking-tight">Season Progress</h3>
                        <div className="flex gap-8 md:gap-12">
                            <div className="text-right">
                                <div className="text-2xl md:text-3xl font-black text-white font-condensed items-baseline">{completedRaces}</div>
                                <div className="text-[9px] text-gray-500 font-bold tracking-widest uppercase">Races Done</div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl md:text-3xl font-black text-[#FF1801] font-condensed items-baseline">{remainingRaces}</div>
                                <div className="text-[9px] text-gray-500 font-bold tracking-widest uppercase">Races Left</div>
                            </div>
                        </div>
                    </div>
                    <div className="h-4 bg-white/5 border border-white/10 relative overflow-hidden">
                        <div
                            className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-[#8B0000] to-[#FF1801] transition-all duration-1000 ease-out flex items-center justify-end px-4"
                            style={{ width: `${progress}%` }}
                        >
                            <span className="text-[10px] md:text-xs font-black text-white font-condensed italic">{Math.round(progress)}%</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Filters */}
            <div className="relative z-40 bg-[#0A0A0A] py-6 px-6 md:px-12 border-b border-white/5">
                <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex border border-white/10 rounded-sm overflow-hidden w-full md:w-auto">
                        <button
                            onClick={() => setFilter('ALL')}
                            className={`flex-1 md:flex-none px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${filter === 'ALL' ? 'bg-[#FF1801] text-white' : 'text-gray-500 hover:bg-white/5'}`}
                        >
                            Grid View
                        </button>
                    </div>

                    <div className="flex items-center space-x-4 md:space-x-6 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 whitespace-nowrap">
                        <span className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">Filter:</span>
                        <div className="flex space-x-3">
                            {['ALL', 'UPCOMING', 'PAST'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-6 py-2 border rounded-sm text-[10px] font-black uppercase tracking-[0.2em] transition-all ${filter === f ? 'border-[#FF1801] text-white bg-[#FF1801]/10' : 'border-white/10 text-gray-500 hover:border-white/30'}`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid */}
            <section className="py-12 md:py-20 px-6 md:px-12">
                <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRaces.map((race, index) => {
                        const isPast = new Date(race.date) < now && race.round !== nextRace?.round;
                        const isNext = race.round === nextRace?.round;

                        return (
                            <div
                                key={race.round}
                                className={`group relative bg-[#0F0F0F] border-t-4 transition-all hover:-translate-y-1 ${isPast ? 'opacity-50 border-gray-700' : isNext ? 'border-[#FF1801] bg-[#151515]' : 'border-white/10'}`}
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                {isNext && (
                                    <div className="absolute top-0 right-0 bg-[#FF1801] text-white text-[9px] font-black tracking-widest px-4 py-1.5 uppercase italic skew-x-[-15deg] origin-top-right transform translate-x-[2px]">
                                        Next Race
                                    </div>
                                )}

                                <div className="p-8">
                                    <div className="flex justify-between items-start mb-6">
                                        <span className="text-gray-500 font-condensed text-[10px] font-black tracking-[0.2em] uppercase">Round {race.round.padStart(2, '0')}</span>
                                        <span className={`text-[9px] font-black tracking-widest uppercase px-3 py-1 rounded-sm ${isPast ? 'bg-white/5 text-gray-500' : 'border border-[#FFD700] text-[#FFD700]'}`}>
                                            {isPast ? 'FINISHED' : 'UPCOMING'}
                                        </span>
                                    </div>

                                    <div className="text-4xl mb-4">{getFlagEmoji(race.Circuit.Location.country)}</div>
                                    <h3 className="text-2xl font-black text-white font-condensed uppercase italic leading-tight mb-1 group-hover:text-[#FF1801] transition-colors">{race.raceName}</h3>
                                    <p className="text-gray-500 font-condensed text-xs uppercase tracking-widest mb-8">{race.Circuit.Location.locality}, {race.Circuit.Location.country}</p>

                                    <div className="flex justify-between items-end">
                                        <div>
                                            <div className={`text-lg font-black font-condensed uppercase italic ${isNext ? 'text-[#FF1801]' : 'text-gray-300'}`}>
                                                {race.dateRange || new Date(race.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                            </div>
                                            <div className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">2026</div>
                                        </div>
                                        {!isPast && (
                                            <div className={`text-[10px] font-black uppercase tracking-widest ${isNext ? 'text-[#FF1801]' : 'text-gray-600'}`}>
                                                IN {Math.ceil((new Date(race.date) - now) / (1000 * 60 * 60 * 24))} DAYS
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="px-8 py-5 bg-black/40 border-t border-white/5 flex justify-between items-center group-hover:bg-[#FF1801]/5 transition-colors">
                                    <span className="text-[9px] text-gray-600 font-bold uppercase tracking-widest truncate max-w-[180px]">{race.Circuit.circuitName}</span>
                                    <span className="text-[10px] text-[#FF1801] font-black uppercase tracking-widest italic opacity-0 group-hover:opacity-100 transition-all">Details →</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>
        </main>
    );
}

function Stat({ label, val, color }) {
    return (
        <div className="flex flex-col">
            <div className={`text-4xl md:text-5xl font-black ${color} font-condensed italic leading-none`}>{val}</div>
            <div className="text-[9px] text-gray-600 font-bold tracking-[0.3em] uppercase mt-2">{label}</div>
        </div>
    );
}
