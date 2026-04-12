'use client';
import React, { useState, useEffect, Suspense } from 'react';
import Navbar from '../components/Navbar';
import { getFullDriverStandings, getFullConstructorStandings } from '../utils/f1Api';
import './standings.css';

const getTeamColor = (teamName) => {
    if (!teamName) return '#FFFFFF';
    const teams = {
        'Red Bull': '#3671C6',
        'Mercedes': '#27F4D2',
        'Ferrari': '#E80020',
        'McLaren': '#FF8000',
        'Aston Martin': '#229971',
        'Alpine': '#FF87BC',
        'Williams': '#64C4FF',
        'RB': '#6692FF',
        'Haas': '#B6BABD',
        'Sauber': '#52E252',
        'Audi': '#F50537' // Future-proofing
    };
    for (const [key, color] of Object.entries(teams)) {
        if (teamName.includes(key)) return color;
    }
    return '#FFFFFF';
};

function StandingsContent() {
    const defaultSeason = new Date().getFullYear(); // Or 2026
    const [selectedSeason, setSelectedSeason] = useState(defaultSeason);
    const [viewMode, setViewMode] = useState('DRIVERS'); // DRIVERS or CONSTRUCTORS
    const [standingsData, setStandingsData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStandings = async () => {
            setLoading(true);
            try {
                if (viewMode === 'DRIVERS') {
                    const data = await getFullDriverStandings(selectedSeason);
                    setStandingsData(data);
                } else {
                    const data = await getFullConstructorStandings(selectedSeason);
                    setStandingsData(data);
                }
            } catch (error) {
                console.error("Failed to fetch standings", error);
                setStandingsData([]);
            }
            setLoading(false);
        };
        fetchStandings();
    }, [selectedSeason, viewMode]);

    return (
        <main className="min-h-screen bg-[#0A0A0A] text-white selection:bg-[#FF1801] selection:text-white pb-20">
            <Navbar />

            <div className="standings-container fade-up">
                {/* PAGE HEADER */}
                <header className="page-header py-12 md:py-20 relative">
                    <div className="header-watermark absolute top-0 md:top-[-40px] left-1/2 -translate-x-1/2 text-[15vw] md:text-[180px] font-extrabold text-white/5 uppercase italic tracking-tighter font-condensed pointer-events-none select-none z-0">{selectedSeason}</div>
                    <div className="header-content relative z-10 text-center">
                        <div className="text-[#FF1801] text-[10px] md:text-xs font-bold tracking-[0.4em] uppercase mb-2 font-condensed">{selectedSeason} Season</div>
                        <h1 className="text-4xl md:text-7xl font-extrabold text-white uppercase italic tracking-tighter font-condensed leading-[0.9] mb-8">
                            WORLD<br />
                            <span className="text-[#FF1801]">CHAMPIONSHIP</span>
                        </h1>
                    </div>
                </header>

                {/* VIEW TABS */}
                <div className="view-tabs flex justify-center gap-4 mb-12 relative z-10 w-full px-4 overflow-x-auto">
                    <button
                        className={`px-6 md:px-12 py-3 rounded-sm text-sm font-bold uppercase font-condensed tracking-[0.2em] transition-all duration-300 border border-white/10 ${viewMode === 'DRIVERS' ? 'bg-[#FF1801] text-white border-[#FF1801]' : 'bg-transparent text-gray-400 hover:text-white hover:border-white/30'}`}
                        onClick={() => setViewMode('DRIVERS')}
                    >
                        Driver Standings
                    </button>
                    <button
                        className={`px-6 md:px-12 py-3 rounded-sm text-sm font-bold uppercase font-condensed tracking-[0.2em] transition-all duration-300 border border-white/10 ${viewMode === 'CONSTRUCTORS' ? 'bg-[#FF1801] text-white border-[#FF1801]' : 'bg-transparent text-gray-400 hover:text-white hover:border-white/30'}`}
                        onClick={() => setViewMode('CONSTRUCTORS')}
                    >
                        Constructor Standings
                    </button>
                </div>

                {/* CONTENT */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF1801]"></div>
                    </div>
                ) : standingsData.length > 0 ? (
                    <div className="standings-table-container fade-up" style={{ animationDelay: '0.2s' }}>
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="border-b border-white/10 bg-black/30">
                                    <th className="py-5 px-6 text-xs text-gray-400 font-bold uppercase tracking-[0.2em] font-condensed">POS</th>
                                    {viewMode === 'DRIVERS' && <th className="py-5 pr-6 text-xs text-gray-400 font-bold uppercase tracking-[0.2em] font-condensed">DRIVER</th>}
                                    <th className="py-5 pr-6 text-xs text-gray-400 font-bold uppercase tracking-[0.2em] font-condensed">{viewMode === 'DRIVERS' ? 'TEAM' : 'CONSTRUCTOR'}</th>
                                    <th className="py-5 px-6 text-xs text-gray-400 font-bold uppercase tracking-[0.2em] font-condensed text-right">PTS</th>
                                    <th className="py-5 px-6 text-xs text-gray-400 font-bold uppercase tracking-[0.2em] font-condensed text-center hide-mobile">WINS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {standingsData.map((item, index) => {
                                    const isActualDriver = !!item.Driver;
                                    const isDriverView = viewMode === 'DRIVERS';

                                    // Prevent stale state bugs during tab switching
                                    if (isDriverView !== isActualDriver) return null;

                                    const teamName = isActualDriver ? item.Constructors?.[0]?.name : item.Constructor?.name;
                                    const teamColor = getTeamColor(teamName);
                                    const uniqueId = isActualDriver ? item.Driver?.driverId : item.Constructor?.constructorId;

                                    // Some unranked teams (like Aston Martin at 0 points) lack the "position" field entirely
                                    const actualRank = (index + 1).toString();
                                    const displayPos = item.position || (item.positionText !== '-' && item.positionText ? item.positionText : actualRank) || actualRank;

                                    return (
                                        <tr key={`${viewMode}-${uniqueId || displayPos}`} className={`hover:bg-white/5 transition-colors ${parseInt(displayPos) <= 3 ? 'podium-row border-l-2 border-l-[#FF1801]' : 'border-b border-white/5'}`}>
                                            <td className="py-4 px-6 relative">
                                                <div className="text-3xl font-extrabold uppercase italic tracking-tighter font-condensed tabular-nums text-white/50">
                                                    {displayPos}
                                                </div>
                                            </td>

                                            {isDriverView && (
                                                <td className="py-4 pr-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-1 h-8 rounded-sm" style={{ background: teamColor }}></div>
                                                        <div className="flex flex-col">
                                                            <div className="text-lg font-bold font-condensed uppercase tracking-wide leading-tight">{item.Driver.givenName} {item.Driver.familyName}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                            )}

                                            <td className="py-4 pr-6">
                                                <div className="flex items-center gap-4">
                                                    {!isDriverView && <div className="w-1 h-8 rounded-sm" style={{ background: teamColor }}></div>}
                                                    <div className="flex flex-col">
                                                        <div className={!isDriverView ? 'text-lg font-bold font-condensed uppercase tracking-wide leading-tight' : 'text-xs uppercase tracking-widest leading-none'} style={{ color: !isDriverView ? '#fff' : teamColor }}>
                                                            {teamName || 'Unknown'}
                                                        </div>
                                                        {!isDriverView && (
                                                            <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">
                                                                {item.Constructor?.nationality}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="py-4 px-6 text-right">
                                                <div className="flex flex-col items-end">
                                                    <span className="text-2xl font-bold text-[#FFCC00] leading-none tabular-nums tracking-tighter font-condensed">{item.points}</span>
                                                    <span className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">PTS</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-center hide-mobile">
                                                <div className="text-xl text-white/30 font-bold font-condensed tabular-nums">{item.wins}</div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-20 text-gray-500">
                        <div className="text-4xl mb-4">🏆</div>
                        <h2 className="text-2xl font-bold mb-2">Standings Not Available</h2>
                        <p>The championship standings for {selectedSeason} are not yet available.</p>
                    </div>
                )}
            </div>
        </main>
    );
}

export default function StandingsPage() {
    return (
        <Suspense fallback={
            <div className="bg-[#0A0A0A] min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF1801]"></div>
            </div>
        }>
            <StandingsContent />
        </Suspense>
    );
}
