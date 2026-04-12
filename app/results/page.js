
"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '../components/Navbar';
import { getSeasonSchedule, getRaceResults, getPracticeSessionResults } from '../utils/f1Api';
import './results.css';

const seasons = Array.from({ length: 2026 - 2005 + 1 }, (_, i) => 2026 - i);

const getTeamColor = (teamName) => {
    const colors = {
        'Red Bull Racing': '#0090FF',
        'Red Bull': '#0090FF',
        'Ferrari': '#DC0000',
        'Mercedes': '#00D2BE',
        'McLaren': '#FF8000',
        'Aston Martin': '#006F62',
        'Alpine': '#0093CC',
        'RB': '#6692FF',
        'Haas F1 Team': '#FFFFFF',
        'Haas': '#FFFFFF',
        'Williams': '#005AFF',
        'Kick Sauber': '#52E252',
        'Sauber': '#52E252',
        'AlphaTauri': '#2B4562',
        'Racing Point': '#F596C8',
        'Renault': '#FFF500',
        'Toro Rosso': '#469BFF',
        'Force India': '#F596C8',
        'Manor Marussia': '#EF1B24',
        'Lotus F1': '#FFB800',
        'Caterham': '#005030',
        'HRT': '#B2945E',
        'Virgin': '#CC0000',
        'BMW Sauber': '#FFFFFF',
        'Toyota': '#E21B20',
        'Honda': '#E21B20',
        'Super Aguri': '#E21B20',
        'Spyker': '#FF8700',
        'Midland': '#EE1C23',
        'BAR': '#FFFFFF',
        'Jordan': '#FFF200',
        'Minardi': '#F5D300',
    };
    return colors[teamName] || '#AAAAAA';
};

const getFlagEmoji = (country) => {
    const flags = {
        'Australia': '🇦🇺',
        'Bahrain': '🇧🇭',
        'Saudi Arabia': '🇸🇦',
        'Japan': '🇯🇵',
        'China': '🇨🇳',
        'USA': '🇺🇸',
        'United States': '🇺🇸',
        'Miami': '🇺🇸',
        'Italy': '🇮🇹',
        'Monaco': '🇲🇨',
        'Canada': '🇨🇦',
        'Spain': '🇪🇸',
        'Austria': '🇦🇹',
        'UK': '🇬🇧',
        'United Kingdom': '🇬🇧',
        'Hungary': '🇭🇺',
        'Belgium': '🇧🇪',
        'Netherlands': '🇳🇱',
        'Azerbaijan': '🇦🇿',
        'Singapore': '🇸🇬',
        'Mexico': '🇲🇽',
        'Brazil': '🇧🇷',
        'Qatar': '🇶🇦',
        'UAE': '🇦🇪',
        'France': '🇫🇷',
        'Germany': '🇩🇪',
        'Russia': '🇷🇺',
        'Turkey': '🇹🇷',
        'Portugal': '🇵🇹',
        'Korea': '🇰🇷',
        'India': '🇮🇳',
        'Malaysia': '🇲🇾',
    };
    return flags[country] || '🏁';
};

function ResultsContent() {
    const searchParams = useSearchParams();
    const paramSeason = searchParams.get('season');
    const paramRound = searchParams.get('round');

    const [selectedSeason, setSelectedSeason] = useState(paramSeason ? parseInt(paramSeason) : 2026);
    const [schedule, setSchedule] = useState([]);
    const [selectedRound, setSelectedRound] = useState(paramRound || null);
    const [raceData, setRaceData] = useState(null);
    const [practiceData, setPracticeData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState('FINAL');
    const [paramsLoaded, setParamsLoaded] = useState(false);

    useEffect(() => {
        const fetchSchedule = async () => {
            setLoading(true);
            const data = await getSeasonSchedule(selectedSeason);
            setSchedule(data);

            if (data.length > 0) {
                if (paramRound && !paramsLoaded && selectedSeason === (paramSeason ? parseInt(paramSeason) : null)) {
                    setSelectedRound(paramRound);
                    setParamsLoaded(true);
                } else {
                    const latestCompleted = [...data].reverse().find(r => new Date(r.date) < new Date());
                    setSelectedRound(latestCompleted ? latestCompleted.round : data[0].round);
                }
            } else {
                setSelectedRound(null);
                setRaceData(null);
            }
            setLoading(false);
        };
        fetchSchedule();
    }, [selectedSeason]);

    useEffect(() => {
        if (!selectedRound) return;

        const fetchResults = async () => {
            setLoading(true);
            const raceMatch = schedule.find(r => r.round === selectedRound);
            const circuitName = raceMatch?.Circuit?.circuitName || '';

            const [data, pData] = await Promise.all([
                getRaceResults(selectedSeason, selectedRound),
                circuitName ? getPracticeSessionResults(selectedSeason, circuitName) : Promise.resolve(null)
            ]);

            setRaceData(data);
            setPracticeData(pData);
            setLoading(false);
        };
        fetchResults();
    }, [selectedRound, selectedSeason, schedule]);

    const handleSeasonChange = (e) => {
        setSelectedSeason(parseInt(e.target.value));
        setParamsLoaded(true);
    };

    const podium = raceData?.Results?.slice(0, 3) || [];
    const winner = podium[0];
    const p2 = podium[1];
    const p3 = podium[2];

    const fastestLapResult = raceData?.Results?.find(r => r.FastestLap?.rank === "1");
    const retirements = raceData?.Results?.filter(r => r.status !== "Finished" && !r.status.startsWith("+")) || [];

    return (
        <main className="results-container bg-[#0A0A0A] min-h-screen text-white font-sans selection:bg-[#FF1801] selection:text-white">
            <Navbar />

            {/* PAGE HEADER */}
            <header className="page-header">
                <div className="header-watermark">{selectedSeason}</div>
                <div className="header-content">
                    <div>
                        <div className="page-eyebrow">{selectedSeason} Formula One Season</div>
                        <h1 className="page-title">RACE<br /><span>RESULTS</span></h1>
                    </div>



                    {selectedSeason !== new Date().getFullYear() && (
                        <div className="header-stats">
                            <div className="header-stat">
                                <div className="header-stat-val" style={{ color: 'var(--yellow)' }}>
                                    {schedule.filter(r => new Date(r.date) < new Date()).length}
                                </div>
                                <div className="header-stat-label">RACES COMPLETE</div>
                            </div>
                            <div className="header-stat">
                                <div className="header-stat-val" style={{ color: 'var(--white)' }}>
                                    {schedule.length}
                                </div>
                                <div className="header-stat-label">TOTAL ROUNDS</div>
                            </div>
                        </div>
                    )}
                </div>
            </header>
            

            {/* SEASON SELECTOR */}
            <section className="season-select-container">
                <span className="season-select-label">SELECT SEASON</span>
                <select className="season-select" value={selectedSeason} onChange={handleSeasonChange}>
                    {seasons.map(year => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>
            </section>

            {/* RACE SELECTOR TABS */}
            <section className="race-selector">
                <div className="race-tabs">
                    {schedule.map((race) => (
                        <button
                            key={race.round}
                            className={`race-tab ${selectedRound === race.round ? 'active' : ''}`}
                            onClick={() => setSelectedRound(race.round)}
                        >
                            <span className="tab-round">Round {race.round.padStart(2, '0')}</span>
                            <span className="tab-name">{race.raceName.replace('Grand Prix', 'GP')}</span>
                            <span className="tab-date">{new Date(race.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                        </button>
                    ))}
                </div>
            </section>

            {loading ? (
                <div className="empty-state">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF1801]"></div>
                </div>
            ) : raceData ? (
                <>
                    {/* RACE HEADER */}
                    <section className="race-header-banner fade-up">
                        <div className="race-info-left">
                            <div className="race-flag-big">{getFlagEmoji(raceData.Circuit.Location.country)}</div>
                            <div className="race-title-big">{raceData.raceName}</div>
                            <div className="race-location-big">
                                {raceData.Circuit.Location.locality}, {raceData.Circuit.Location.country} · Round {raceData.round}
                            </div>
                            <div className="race-date-big">
                                {new Date(raceData.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase()}
                            </div>
                            <div style={{ fontFamily: 'var(--mono)', fontSize: '9px', color: 'var(--mid)', letterSpacing: '2px', marginTop: '8px' }}>
                                {raceData.Circuit.circuitName.toUpperCase()}
                            </div>
                        </div>

                        {/* PODIUM VISUAL */}
                        <div className="podium-visual">
                            {p2 && (
                                <div className="podium-block p2">
                                    <div className="podium-driver-abbr" style={{ color: '#C0C0C0' }}>{p2.Driver?.code || p2.Driver?.familyName?.substring(0, 3).toUpperCase() || '—'}</div>
                                    <div className="podium-bar">
                                        <div className="podium-pos">2</div>
                                        <div className="podium-time">{p2.Time?.time || p2.status}</div>
                                    </div>
                                </div>
                            )}
                            {winner && (
                                <div className="podium-block p1">
                                    <div className="podium-driver-abbr" style={{ color: 'var(--yellow)' }}>{winner.Driver?.code || winner.Driver?.familyName?.substring(0, 3).toUpperCase() || '—'}</div>
                                    <div className="podium-bar">
                                        <div className="podium-pos">1</div>
                                        <div className="podium-time">{winner.Time?.time || winner.status}</div>
                                    </div>
                                </div>
                            )}
                            {p3 && (
                                <div className="podium-block p3">
                                    <div className="podium-driver-abbr" style={{ color: '#CD7F32' }}>{p3.Driver?.code || p3.Driver?.familyName?.substring(0, 3).toUpperCase() || '—'}</div>
                                    <div className="podium-bar">
                                        <div className="podium-pos">3</div>
                                        <div className="podium-time">{p3.Time?.time || p3.status}</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* RACE STATS */}
                        <div className="race-stats-grid">
                            <div className="race-stat-box">
                                <div className="race-stat-label">WINNER</div>
                                <div className="race-stat-value" style={{ color: 'var(--yellow)' }}>{winner?.Driver?.familyName?.toUpperCase() || '—'}</div>
                                <div className="race-stat-sub">{winner?.Constructors?.[0]?.name || '—'}</div>
                            </div>
                            <div className="race-stat-box">
                                <div className="race-stat-label">FASTEST LAP</div>
                                <div className="race-stat-value" style={{ color: 'var(--purple)' }}>{fastestLapResult?.Driver?.familyName?.toUpperCase() || '—'}</div>
                                <div className="race-stat-sub">{fastestLapResult?.FastestLap?.Time?.time || '—'} · Lap {fastestLapResult?.FastestLap?.lap || '—'}</div>
                            </div>
                            <div className="race-stat-box">
                                <div className="race-stat-label">LAPS</div>
                                <div className="race-stat-value">{winner?.laps}</div>
                                <div className="race-stat-sub">Completed</div>
                            </div>
                            <div className="race-stat-box">
                                <div className="race-stat-label">RETIREMENTS</div>
                                <div className="race-stat-value" style={{ color: 'var(--red)' }}>{retirements.length}</div>
                                <div className="race-stat-sub">See below</div>
                            </div>
                        </div>
                    </section>

                    {/* RACE CLASSIFICATION */}
                    <section className="results-section">
                        <div className="section-header">
                            <h2 className="section-title">RACE <span>CLASSIFICATION</span></h2>

                        </div>

                        <table className="results-table fade-up">
                            <thead>
                                <tr>
                                    <th>POS</th>
                                    <th>NO</th>
                                    <th>DRIVER</th>
                                    <th>TIME/RETIRED</th>
                                    <th>PTS</th>
                                    <th>LAPS</th>
                                    <th>GRID</th>
                                    <th>FASTEST LAP</th>
                                </tr>
                            </thead>
                            <tbody>
                                {raceData.Results.map((result) => (
                                    <tr key={result.number} className={`${parseInt(result.position) <= 3 ? 'podium-row' : ''} ${result.FastestLap?.rank === "1" ? 'fastest-lap' : ''}`}>
                                        <td>
                                            <div className={`r-pos ${parseInt(result.position) <= 3 ? 'p' + result.position : (parseInt(result.position) <= 10 ? 'top' : '')}`}>
                                                {result.positionText || result.position}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="r-num-badge" style={{ background: `${getTeamColor(result.Constructors?.[0]?.name)}26`, color: getTeamColor(result.Constructors?.[0]?.name) }}>
                                                {result.number}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="r-driver">
                                                <div className="r-driver-info">
                                                    <div className="r-driver-name">{result.Driver?.givenName} {result.Driver?.familyName}</div>
                                                    <div className="r-driver-team" style={{ color: getTeamColor(result.Constructors?.[0]?.name) }}>{result.Constructors?.[0]?.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className={`r-time ${result.position === "1" ? 'winner' : (result.status === 'Finished' ? 'gap' : '')}`}>
                                                {result.Time?.time || result.status}
                                            </div>
                                        </td>
                                        <td><div className="r-pts">{result.points}</div></td>
                                        <td><div style={{ fontFamily: 'var(--mono)', fontSize: '13px' }}>{result.laps}</div></td>
                                        <td>
                                            <div style={{ fontFamily: 'var(--mono)', fontSize: '13px', color: 'var(--grey)' }}>
                                                {result.grid}
                                                {parseInt(result.grid) > parseInt(result.position) && <span className="r-change">↑{parseInt(result.grid) - parseInt(result.position)}</span>}
                                                {parseInt(result.grid) < parseInt(result.position) && <span className="r-change down">↓{parseInt(result.position) - parseInt(result.grid)}</span>}
                                                {parseInt(result.grid) === parseInt(result.position) && <span className="r-change same">—</span>}
                                            </div>
                                        </td>
                                        <td>
                                            {result.FastestLap?.rank === "1" ? (
                                                <div className="fl-badge">
                                                    <div className="fl-dot"></div>
                                                    {result.FastestLap.Time.time}
                                                </div>
                                            ) : (
                                                <div style={{ fontFamily: 'var(--mono)', fontSize: '12px' }}>{result.FastestLap?.Time.time || '—'}</div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* ADDITIONAL STATS */}
                        <div className="stats-grid fade-up">
                            <div className="stat-card">
                                <div className="stat-card-label">Race Statistics</div>
                                <div className="stat-item">
                                    <div className="stat-item-label">Total Race Time</div>
                                    <div className="stat-item-value">{winner?.Time?.time || '—'}</div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-item-label">Fastest Lap</div>
                                    <div className="stat-item-value" style={{ color: 'var(--purple)' }}>{fastestLapResult?.FastestLap?.Time.time || '—'}</div>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-card-label">Circuit Info</div>
                                <div className="stat-item">
                                    <div className="stat-item-label">Circuit</div>
                                    <div className="stat-item-value">{raceData.Circuit.circuitName}</div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-item-label">Location</div>
                                    <div className="stat-item-value">{raceData.Circuit.Location.locality}, {raceData.Circuit.Location.country}</div>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-card-label">Retirements ({retirements.length})</div>
                                <div className="retirement-list">
                                    {retirements.length > 0 ? retirements.map((r, i) => (
                                        <div key={i} className="retirement-item">
                                            <div className="retirement-driver">{r.Driver.familyName}</div>
                                            <div className="retirement-reason">{r.status}</div>
                                        </div>
                                    )) : (
                                        <div className="stat-item-value italic">No retirements</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* PRACTICE SESSIONS */}
                    {practiceData && Object.keys(practiceData).length > 0 && (
                        <section className="results-section">
                            <div className="section-header">
                                <h2 className="section-title">PRACTICE <span>SESSIONS</span></h2>
                            </div>
                            <div className="practice-grid fade-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '30px' }}>
                                {Object.entries(practiceData).map(([sessionName, results]) => (
                                    <div key={sessionName} className="stat-card" style={{ background: 'var(--dark)' }}>
                                        <div className="stat-card-label" style={{ marginBottom: '15px' }}>{sessionName} (Top 3)</div>
                                        <table className="results-table" style={{ fontSize: '12px' }}>
                                            <thead>
                                                <tr>
                                                    <th>POS</th>
                                                    <th>DRIVER</th>
                                                    <th>TIME</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {results.map(r => (
                                                    <tr key={r.driver_number}>
                                                        <td><div className="r-pos">{r.position}</div></td>
                                                        <td>
                                                            <div className="r-driver">
                                                                <div className="r-driver-info">
                                                                    <div className="r-driver-name">{r.name}</div>
                                                                    <div className="r-driver-team" style={{ color: r.color }}>{r.team}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td><div className="r-time" style={{ fontFamily: 'var(--mono)' }}>{r.time}</div></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </>
            ) : (
                <div className="empty-state">
                    <div className="empty-state-icon">🏁</div>
                    <h2 className="empty-state-title">Race Yet To Begin</h2>
                    <p className="empty-state-subtitle">Check back after the race weekend for full results and analytics.</p>
                </div>
            )}
        </main>
    );
}

export default function ResultsPage() {
    return (
        <Suspense fallback={
            <div className="results-container bg-[#0A0A0A] min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF1801]"></div>
            </div>
        }>
            <ResultsContent />
        </Suspense>
    );
}
