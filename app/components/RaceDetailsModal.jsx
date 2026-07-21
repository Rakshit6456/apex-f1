"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { X, Trophy, Calendar, Flag } from 'lucide-react';
import { getSeasonSchedule, getCircuitInsights } from '../utils/f1Api';
import { CIRCUIT_IDS } from '../data/circuitIds';

function formatSession(date, time) {
    if (!date) return null;
    try {
        // Never invent a clock time — if the API hasn't confirmed one yet,
        // show the date only rather than implying a fake midnight session.
        if (!time) {
            const dOnly = new Date(`${date}T00:00:00Z`);
            if (isNaN(dOnly.getTime())) return null;
            return `${dOnly.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })} · time TBC`;
        }
        const dt = new Date(`${date}T${time}`);
        if (isNaN(dt.getTime())) return null;
        return dt.toLocaleString('en-GB', {
            weekday: 'short', day: 'numeric', month: 'short',
            hour: '2-digit', minute: '2-digit',
        });
    } catch {
        return null;
    }
}

function buildSessionRows(raceData) {
    if (!raceData) return { rows: [], isSprint: false, detailed: false };

    const isSprint = !!raceData.Sprint;
    const push = (rows, label, session) => {
        if (session?.date) rows.push({ label, when: formatSession(session.date, session.time) });
    };

    const rows = [];
    if (isSprint) {
        push(rows, 'Practice 1', raceData.FirstPractice);
        push(rows, 'Qualifying', raceData.Qualifying);
        push(rows, 'Sprint Qualifying', raceData.SprintQualifying || raceData.SprintShootout);
        push(rows, 'Sprint', raceData.Sprint);
    } else {
        push(rows, 'Practice 1', raceData.FirstPractice);
        push(rows, 'Practice 2', raceData.SecondPractice);
        push(rows, 'Practice 3', raceData.ThirdPractice);
        push(rows, 'Qualifying', raceData.Qualifying);
    }
    // Only trust a detailed breakdown if the API actually gave us at least
    // one practice/qualifying session — otherwise we only know the race date.
    const detailed = rows.length > 0;
    if (raceData.date) {
        rows.push({ label: 'Race', when: formatSession(raceData.date, raceData.time) });
    }

    return { rows, isSprint, detailed };
}

export default function RaceDetailsModal({ race, isOpen, onClose }) {
    if (!isOpen || !race) return null;
    // Keying on the round forces a clean remount (and fresh initial state)
    // whenever the selected race changes while the modal is open.
    return <RaceDetailsPanel key={race.round} race={race} onClose={onClose} />;
}

function RaceDetailsPanel({ race, onClose }) {
    const [visible, setVisible] = useState(false);
    const [sessionInfo, setSessionInfo] = useState({ rows: [], isSprint: false, detailed: false });
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(true);

    const close = useCallback(() => {
        setVisible(false);
        setTimeout(onClose, 250);
    }, [onClose]);

    useEffect(() => {
        const raf = requestAnimationFrame(() => setVisible(true));

        let cancelled = false;
        const circuitId = CIRCUIT_IDS[race.round] || null;

        (async () => {
            const [schedule, circuitInsights] = await Promise.all([
                getSeasonSchedule('2026'),
                getCircuitInsights(circuitId),
            ]);
            if (cancelled) return;
            const liveRace = schedule.find(r => r.round === race.round);
            setSessionInfo(buildSessionRows(liveRace));
            setInsights(circuitInsights);
            setLoading(false);
        })();

        const onKey = (e) => { if (e.key === 'Escape') close(); };
        document.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';

        return () => {
            cancelled = true;
            cancelAnimationFrame(raf);
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [race, close]);

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
        <div
            className={`fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 transition-opacity duration-[250ms] ease-out ${visible ? 'opacity-100' : 'opacity-0'}`}
            onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}
        >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

            <div
                className={`relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-[#0F0F0F]/95 backdrop-blur-xl border border-white/10 border-t-4 border-t-[#FF1801] rounded-sm shadow-2xl transition-all duration-[250ms] ease-out ${visible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-3'}`}
            >
                <button
                    onClick={close}
                    aria-label="Close"
                    className="absolute top-5 right-5 z-10 w-9 h-9 flex items-center justify-center rounded-full border border-white/10 bg-black/40 text-gray-400 hover:text-white hover:border-[#FF1801]/50 hover:bg-[#FF1801]/10 transition-colors"
                >
                    <X size={16} />
                </button>

                {/* Header */}
                <div className="p-8 pb-6 border-b border-white/5">
                    <span className="text-[#FF1801] font-condensed text-xs font-black tracking-[0.3em] uppercase">
                        Round {race.round.padStart(2, '0')} · 2026 Season
                    </span>
                    <h2 className="mt-2 text-3xl md:text-4xl font-black text-white font-condensed uppercase italic leading-tight pr-10">
                        {getFlagEmoji(race.Circuit.Location.country)} {race.raceName}
                    </h2>
                    <p className="mt-1 text-gray-500 font-condensed text-sm uppercase tracking-widest">
                        {race.Circuit.circuitName} · {race.Circuit.Location.locality}, {race.Circuit.Location.country}
                    </p>
                </div>

                {/* Session Schedule */}
                <div className="p-8 pt-6 border-b border-white/5">
                    <div className="flex items-center gap-2 mb-5">
                        <Calendar size={14} className="text-[#FF1801]" />
                        <h3 className="text-xs font-black tracking-[0.3em] uppercase text-gray-400">
                            Weekend Schedule {sessionInfo.isSprint && <span className="text-[#FFD700]">· Sprint</span>}
                        </h3>
                    </div>

                    {loading ? (
                        <div className="space-y-3 animate-pulse">
                            {[0, 1, 2].map(i => <div key={i} className="h-10 bg-white/5 rounded-sm" />)}
                        </div>
                    ) : sessionInfo.detailed ? (
                        <div className="space-y-2">
                            {sessionInfo.rows.map((row) => (
                                <div
                                    key={row.label}
                                    className={`flex justify-between items-center px-4 py-3 rounded-sm border ${row.label === 'Race' ? 'bg-[#FF1801]/10 border-[#FF1801]/30' : 'bg-white/[0.02] border-white/5'}`}
                                >
                                    <span className={`text-sm font-bold uppercase tracking-wide font-condensed ${row.label === 'Race' ? 'text-[#FF1801]' : 'text-gray-300'}`}>
                                        {row.label}
                                    </span>
                                    <span className="text-xs text-gray-400 font-mono tabular-nums">
                                        {row.when || 'TBC'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="px-4 py-4 rounded-sm bg-white/[0.02] border border-white/5 text-sm text-gray-500">
                            {race.dateRange || race.date} — detailed session times will be confirmed closer to the race weekend.
                        </div>
                    )}
                </div>

                {/* Circuit Insights */}
                <div className="p-8 pt-6">
                    <div className="flex items-center gap-2 mb-5">
                        <Trophy size={14} className="text-[#FF1801]" />
                        <h3 className="text-xs font-black tracking-[0.3em] uppercase text-gray-400">Circuit Insights</h3>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 animate-pulse">
                            {[0, 1, 2].map(i => <div key={i} className="h-20 bg-white/5 rounded-sm" />)}
                        </div>
                    ) : !insights || insights.noHistory ? (
                        <div className="px-4 py-4 rounded-sm bg-white/[0.02] border border-white/5 text-sm text-gray-500 flex items-center gap-2">
                            <Flag size={14} className="text-[#FF1801] shrink-0" />
                            New addition to the calendar — no prior Formula 1 history at this circuit yet.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <InsightTile label="First Held" value={insights.firstHeld} sub={`${insights.totalRacesRecorded} races on record`} />
                            <InsightTile
                                label="Last Year's Winner"
                                value={insights.lastYearWinner ? insights.lastYearWinner.name : "—"}
                                sub={insights.lastYearWinner ? insights.lastYearWinner.team : "No 2025 race here"}
                            />
                            <InsightTile
                                label="Most Successful"
                                value={insights.mostSuccessfulConstructor ? insights.mostSuccessfulConstructor.name : "—"}
                                sub={insights.mostSuccessfulConstructor ? `${insights.mostSuccessfulConstructor.wins} wins` : ""}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function InsightTile({ label, value, sub }) {
    return (
        <div className="bg-white/[0.02] border border-white/5 rounded-sm p-4">
            <div className="text-[9px] font-bold tracking-widest uppercase text-gray-500 mb-2">{label}</div>
            <div className="text-lg font-black text-white font-condensed uppercase italic leading-tight truncate">{value}</div>
            {sub && <div className="text-[10px] text-[#FF1801] uppercase tracking-wide mt-1 truncate">{sub}</div>}
        </div>
    );
}
