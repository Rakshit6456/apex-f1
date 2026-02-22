"use client";
import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '../components/Navbar';
import { getDriversForSeason, getDriverComparisonStats } from '../utils/f1Api';
import './head-to-head.css';

const years = Array.from({ length: 2026 - 2005 + 1 }, (_, i) => (2026 - i).toString());

export default function HeadToHead() {
    const [selectedYear, setSelectedYear] = useState('2025');
    const [loading, setLoading] = useState(false);
    const [drivers, setDrivers] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalSlot, setModalSlot] = useState(1); // 1 or 2
    const [searchQuery, setSearchQuery] = useState('');

    const [driver1, setDriver1] = useState(null);
    const [driver2, setDriver2] = useState(null);
    const [stats1, setStats1] = useState(null);
    const [stats2, setStats2] = useState(null);

    // Fetch all drivers when year changes
    useEffect(() => {
        const fetchDrivers = async () => {
            const data = await getDriversForSeason(selectedYear);
            setDrivers(data);
            // Reset drivers when year changes to force re-selection
            setDriver1(null);
            setDriver2(null);
            setStats1(null);
            setStats2(null);
        };
        fetchDrivers();
    }, [selectedYear]);

    // Fetch stats when drivers change
    useEffect(() => {
        const fetchStats = async () => {
            if (driver1) {
                setLoading(true);
                const s1 = await getDriverComparisonStats(selectedYear, driver1.driverId);
                setStats1(s1);
                setLoading(false);
            }
        };
        fetchStats();
    }, [driver1, selectedYear]);

    useEffect(() => {
        const fetchStats = async () => {
            if (driver2) {
                setLoading(true);
                const s2 = await getDriverComparisonStats(selectedYear, driver2.driverId);
                setStats2(s2);
                setLoading(false);
            }
        };
        fetchStats();
    }, [driver2, selectedYear]);

    const filteredDrivers = useMemo(() => {
        if (!Array.isArray(drivers)) return [];
        return drivers.filter(d => {
            if (!d) return false;
            const fullName = `${d.givenName || ''} ${d.familyName || ''}`.toLowerCase();
            const nationality = (d.nationality || '').toLowerCase();
            const query = (searchQuery || '').toLowerCase();
            return fullName.includes(query) || nationality.includes(query);
        });
    }, [drivers, searchQuery]);

    const openModal = (slot) => {
        setModalSlot(slot);
        setModalOpen(true);
        setSearchQuery('');
    };

    const selectDriver = (driver) => {
        if (modalSlot === 1) {
            setDriver1(driver);
        } else {
            setDriver2(driver);
        }
        setModalOpen(false);
    };

    const getWinner = (val1, val2, lowIsBetter = false) => {
        if (!val1 || !val2 || val1 === val2 || val1 === 'N/A' || val2 === 'N/A') return '';

        // Clean strings like "1:21.345" for comparison if needed
        let v1 = val1, v2 = val2;
        if (val1.includes(':')) {
            // Time comparison: shorter is better
            return lowIsBetter ? (val1 < val2 ? 'v1' : 'v2') : (val1 > val2 ? 'v1' : 'v2');
        }

        v1 = parseFloat(val1);
        v2 = parseFloat(val2);

        if (lowIsBetter) {
            return v1 < v2 ? 'v1' : 'v2';
        }
        return v1 > v2 ? 'v1' : 'v2';
    };

    const pointGap = stats1 && stats2 ? Math.abs(parseInt(stats1.points) - parseInt(stats2.points)) : 0;

    return (
        <main className="head-to-head">
            <Navbar />

            {/* PAGE HEADER */}
            <header className="page-header">
                <div className="header-content mx-auto max-w-[1400px]">
                    <div className="header-left">
                        <div className="page-eyebrow">Driver Comparison Tool</div>
                        <h1 className="page-title">HEAD TO<br /><span>HEAD</span></h1>
                        <p className="page-subtitle">Compare any two drivers across all races. See who's faster in qualifying, who finishes ahead more often, and how they stack up in every stat that matters.</p>
                    </div>
                    <div className="year-selector">
                        <div className="year-label">SELECT SEASON</div>
                        <select
                            className="year-select"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                        >
                            {years.map(y => (
                                <option key={y} value={y}>{y} SEASON</option>
                            ))}
                        </select>
                    </div>
                </div>
            </header>

            {/* DRIVER SELECTOR */}
            <section className="driver-selector fade-up max-w-[1400px] mx-auto px-12">
                <div className="selector-box" onClick={() => openModal(1)}>
                    <div className="selector-label">DRIVER 1</div>
                    <div className="selector-driver">
                        <div className="selector-num bg-[#FF1801]/10 text-[#FF1801]">
                            {driver1 ? stats1?.number || '?' : '?'}
                        </div>
                        <div className="selector-driver-info">
                            <div className="selector-driver-name">
                                {driver1 ? (driver1.familyName || '').toUpperCase() : 'SELECT DRIVER'}
                            </div>
                            <div className="selector-team">
                                {driver1 ? `${stats1?.team || 'Loading...'} · ${driver1.nationality}` : 'Click to choose'}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="selector-vs">VS</div>

                <div className="selector-box" onClick={() => openModal(2)}>
                    <div className="selector-label">DRIVER 2</div>
                    <div className="selector-driver">
                        <div className="selector-num bg-[#FF1801]/10 text-[#FF1801]">
                            {driver2 ? stats2?.number || '?' : '?'}
                        </div>
                        <div className="selector-driver-info">
                            <div className="selector-driver-name">
                                {driver2 ? (driver2.familyName || '').toUpperCase() : 'SELECT DRIVER'}
                            </div>
                            <div className="selector-team">
                                {driver2 ? `${stats2?.team || 'Loading...'} · ${driver2.nationality}` : 'Click to choose'}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* MAIN COMPARISON */}
            {driver1 && driver2 && (
                <section className="comparison-section px-12 pb-24">
                    <div className="comparison-header fade-up">
                        <div className="driver-header-side">
                            <div className="ghost-num text-[#FF1801]">{stats1?.number}</div>
                            <div className="driver-firstname">{driver1.givenName}</div>
                            <div className="driver-lastname text-[#FF1801]">{driver1.familyName}</div>
                            <div className="driver-team-tag text-[#FF1801]">{stats1?.team} · #{stats1?.number}</div>
                            <div className={`driver-pts ${getWinner(stats1?.points, stats2?.points) === 'v1' ? 'text-[#FFD700]' : 'text-white'}`}>
                                {stats1?.points}
                            </div>
                            <div className="driver-pts-label">CHAMPIONSHIP POINTS</div>
                        </div>

                        <div className="vs-center">
                            <div className="vs-text">VS</div>
                            <div className="gap-badge">
                                <div className="gap-num text-[#FF1801]">{pointGap}</div>
                                <div className="gap-label">PT GAP</div>
                            </div>
                        </div>

                        <div className="driver-header-side right">
                            <div className="ghost-num text-[#FF1801]">{stats2?.number}</div>
                            <div className="driver-firstname">{driver2.givenName}</div>
                            <div className="driver-lastname text-[#FF1801]">{driver2.familyName}</div>
                            <div className="driver-team-tag text-[#FF1801]">{stats2?.team} · #{stats2?.number}</div>
                            <div className={`driver-pts ${getWinner(stats1?.points, stats2?.points) === 'v2' ? 'text-[#FFD700]' : 'text-white'}`}>
                                {stats2?.points}
                            </div>
                            <div className="driver-pts-label">CHAMPIONSHIP POINTS</div>
                        </div>
                    </div>

                    <div className="stats-comparison fade-up">
                        <StatRow
                            label="RACE WINS"
                            val1={stats1?.wins}
                            val2={stats2?.wins}
                            winner={getWinner(stats1?.wins, stats2?.wins)}
                        />
                        <StatRow
                            label="PODIUMS"
                            val1={stats1?.podiums}
                            val2={stats2?.podiums}
                            winner={getWinner(stats1?.podiums, stats2?.podiums)}
                        />
                        <StatRow
                            label="POLE POSITIONS"
                            val1={stats1?.poles}
                            val2={stats2?.poles}
                            winner={getWinner(stats1?.poles, stats2?.poles)}
                        />
                        <StatRow
                            label="BEST LAP"
                            val1={stats1?.bestLap}
                            val2={stats2?.bestLap}
                            winner={getWinner(stats1?.bestLap, stats2?.bestLap, true)}
                        />
                        <StatRow
                            label="POS"
                            val1={stats1?.position}
                            val2={stats2?.position}
                            winner={getWinner(stats1?.position, stats2?.position, true)}
                        />
                    </div>
                </section>
            )}

            {/* DRIVER SELECTION MODAL */}
            {modalOpen && (
                <div className="modal-overlay" onClick={() => setModalOpen(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">SELECT <span>DRIVER</span></h2>
                            <button className="modal-close" onClick={() => setModalOpen(false)}>×</button>
                        </div>
                        <div className="modal-search">
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search driver name or nationality..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <div className="modal-body">
                            <div className="drivers-grid">
                                {filteredDrivers.map(d => (
                                    <div
                                        key={d.driverId}
                                        className="driver-option"
                                        onClick={() => selectDriver(d)}
                                    >
                                        <div className="driver-option-num bg-[#FF1801]/10 text-[#FF1801]">
                                            {d.permanentNumber || '??'}
                                        </div>
                                        <div className="driver-option-info">
                                            <div className="driver-option-name">
                                                {d.givenName || ''} {(d.familyName || '').toUpperCase()}
                                            </div>
                                            <div className="driver-option-team">
                                                {d.nationality || 'N/A'}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {loading && (
                <div className="fixed bottom-10 right-10 bg-[#FF1801] text-white px-6 py-3 rounded-full font-bold shadow-2xl z-[100] animate-pulse">
                    FETCHING DATA...
                </div>
            )}
        </main>
    );
}

function StatRow({ label, val1, val2, winner }) {
    return (
        <div className="stat-row">
            <div className={`stat-val ${winner === 'v1' ? 'winner' : 'loser'}`}>
                {val1 || '0'}
            </div>
            <div className="stat-label-cell">
                <div className="stat-label">{label}</div>
            </div>
            <div className={`stat-val right ${winner === 'v2' ? 'winner' : 'loser'}`}>
                {val2 || '0'}
            </div>
        </div>
    );
}
