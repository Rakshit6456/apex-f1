"use client";
import React from 'react';
import Link from 'next/link';

const StandingsCard = ({ title, items, isTeam }) => {
    return (
        <div className="bg-[#1A1A1A] rounded-lg p-6 border border-white/5 relative overflow-hidden group hover:border-[#FF1801]/30 transition-all duration-300">
            {/* Accent Line */}
            <div className="absolute left-0 top-6 bottom-6 w-1 bg-[#FF1801]"></div>

            <div className="pl-6 mb-8">
                <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-6">{title}</h3>

                <div className="space-y-6">
                    {items.map((item, index) => (
                        <div key={index} className="flex justify-between items-end relative">
                            <div className="flex gap-4">
                                <span className="text-4xl font-bold text-white leading-none tabular-nums">{item.rank}</span>
                                <div className="flex flex-col justify-end pb-1">
                                    <span className="text-sm font-bold text-white uppercase tracking-wide leading-none mb-1">{item.name}</span>
                                    <span className="text-[10px] text-[#FF1801] uppercase tracking-wider leading-none">{item.team}</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end pb-1">
                                <span className="text-xl font-bold text-[#FFCC00] leading-none tabular-nums">{item.points}</span>
                                <span className="text-[8px] text-gray-500 uppercase tracking-widest mt-1">PTS</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-end mt-4">
                <Link href="/standings" className="text-[10px] uppercase tracking-widest border border-white/20 rounded-full px-4 py-2 text-white hover:bg-white/10 transition-colors">
                    Full Standings &rarr;
                </Link>
            </div>

        </div>
    );
};

export default function Standings({ driverStandings, constructorStandings }) {
    // Fallback data is minimal/empty to rely on API data, 
    // keeping the structure for checking properties

    const drivers = driverStandings?.length > 0 ? driverStandings.map(d => ({
        rank: d.position,
        name: `${d.Driver.givenName} ${d.Driver.familyName}`,
        team: d.Constructors[0]?.name,
        points: d.points
    })) : [];

    const teams = constructorStandings?.length > 0 ? constructorStandings.map(c => ({
        rank: c.position,
        name: c.Constructor.name,
        team: `${c.Constructor.nationality}`, // Using nationality as subtitle for teams
        points: c.points
    })) : [];

    return (
        <section className="bg-[#121212] py-12 md:py-20 px-6 md:px-8">
            <div className="container mx-auto">
                <div className="mb-10 md:mb-12">
                    <h4 className="text-[#FF1801] text-[10px] md:text-xs font-bold tracking-[0.4em] uppercase mb-2 font-condensed">2026 World Championship</h4>
                    <h2 className="text-4xl md:text-6xl font-extrabold text-white uppercase italic tracking-tighter font-condensed leading-[0.9]">
                        Standings<br />
                        <span className="text-[#FF1801]">Snapshots</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <StandingsCard title="Driver Championship" items={drivers} />
                    <StandingsCard title="Constructor Championship" items={teams} isTeam={true} />
                </div>
            </div>
        </section>
    );
}
