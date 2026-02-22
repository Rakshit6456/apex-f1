"use client";
import React from "react";
import Link from "next/link";

const StatChip = ({ label, value }) => (
    <div className="flex items-center gap-3 px-4 py-2 bg-black/40 border border-white/10 rounded-full">
        <span className="text-xs uppercase tracking-widest text-gray-500">{label}</span>
        <span className="text-sm font-bold text-white tabular-nums">{value}</span>
    </div>
);

const RaceCard = ({ race, isLatest }) => {
    const dateLabel = race.date
        ? new Date(race.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        : '';

    return (
        <article className="relative bg-[#1A1A1A] border border-white/5 rounded-xl p-6 overflow-hidden hover:border-[#FF1801]/30 transition-colors">
            {isLatest && (
                <>
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#FF1801] to-transparent"></div>
                    <div className="absolute top-0 right-0 bg-[#FF1801] text-black text-[10px] font-bold tracking-widest px-3 py-0.5 uppercase rounded-bl-lg">
                        Latest
                    </div>
                </>
            )}

            <div className="flex items-center justify-between mb-4">
                <div className="text-[10px] uppercase tracking-[0.3em] text-gray-500">Round {race.round}</div>
                <div className="text-[10px] uppercase tracking-[0.3em] text-gray-500">{race.country}</div>
            </div>

            <h3 className="text-xl font-extrabold uppercase text-white tracking-tight">{race.raceName}</h3>
            <div className="text-xs text-gray-500 mt-1">
                {race.locality} • {race.circuitName}
            </div>
            <div className="text-xs text-gray-400 mt-2">{dateLabel}</div>

            <div className="mt-4 mb-2 text-[10px] uppercase tracking-widest text-[#A855F7] font-semibold">
                FL: {race.fastestLap?.driver || "—"} • {race.fastestLap?.time || "—"}
            </div>
            <div className="bg-[#0E0E0E] border border-white/5 rounded-lg px-4 py-3">
                <div className="space-y-3">
                    {race.top3.map((driver) => (
                        <div key={`${race.round}-${driver.position}`} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-lg font-bold text-[#FFCC00] tabular-nums">{driver.position}</span>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-white uppercase tracking-wide">{driver.name}</span>
                                    <span className="text-[10px] uppercase tracking-widest text-gray-500">{driver.team}</span>
                                </div>
                            </div>
                            <span className="text-sm font-mono text-gray-300 tabular-nums">{driver.time || "—"}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
                <StatChip label="Laps" value={race.totalLaps || "—"} />
                <StatChip label="Safety Cars" value={race.safetyCars ?? "—"} />
                <StatChip label="Retirements" value={race.retirements ?? "—"} />
            </div>

            <div className="mt-6 flex justify-start">
                <Link
                    href={`/results?season=2025&round=${race.round}`}
                    className="text-[10px] uppercase tracking-widest border border-white/20 rounded-full px-4 py-2 text-white hover:bg-white/10 transition-colors"
                >
                    Full Standings &rarr;
                </Link>
            </div>
        </article>
    );
};

export default function RecentRaces({ races }) {
    if (!races || races.length === 0) return null;

    return (
        <section className="bg-[#0F0F0F] py-12 md:py-20 px-6 md:px-8 border-t border-white/5">
            <div className="container mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
                    <div>
                        <h4 className="text-[#FF1801] text-[10px] md:text-xs font-bold tracking-[0.4em] uppercase mb-2 font-condensed">2025 Season</h4>
                        <h2 className="text-4xl md:text-6xl font-extrabold text-white uppercase italic tracking-tighter font-condensed leading-[0.9]">
                            Recent<br />
                            <span className="text-[#FF1801]">Races</span>
                        </h2>
                    </div>
                    <Link
                        href="/results?season=2025"
                        className="text-xs font-bold uppercase tracking-[0.2em] border border-white/10 rounded-sm px-6 py-3 text-white hover:bg-white/5 transition-colors font-condensed italic skew-x-[-12deg] w-fit"
                    >
                        <span className="block skew-x-[12deg]">All Results &rarr;</span>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {races.map((race, idx) => (
                        <RaceCard key={`${race.round}-${race.raceName}`} race={race} isLatest={idx === 0} />
                    ))}
                </div>
            </div>
        </section>
    );
}
