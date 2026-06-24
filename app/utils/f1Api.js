import { results2026 } from '../data/results2026';

// ── Local-data helpers (used as fallbacks when Jolpi API is down) ─────────────

const _isFinishedStatus = (status) => {
    if (!status) return false;
    if (status === "Finished") return true;
    if (status.startsWith("+")) return true;
    return false;
};

const computeDriverStandingsFrom2026 = () => {
    const driverMap = {};
    Object.values(results2026).forEach(race => {
        race.Results.forEach(r => {
            const id = r.Driver.driverId;
            if (!driverMap[id]) {
                driverMap[id] = {
                    Driver: r.Driver,
                    Constructors: r.Constructors || (r.Constructor ? [r.Constructor] : []),
                    points: 0, wins: 0, podiums: 0,
                };
            }
            driverMap[id].points += parseInt(r.points || 0);
            if (r.position === "1") driverMap[id].wins++;
            if (parseInt(r.position) <= 3) driverMap[id].podiums++;
            driverMap[id].Constructors = r.Constructors || (r.Constructor ? [r.Constructor] : driverMap[id].Constructors);
        });
    });
    return Object.values(driverMap)
        .sort((a, b) => b.points !== a.points ? b.points - a.points : b.wins - a.wins)
        .map((s, i) => ({
            position: (i + 1).toString(),
            points: s.points.toString(),
            wins: s.wins.toString(),
            podiums: s.podiums.toString(),
            Driver: s.Driver,
            Constructors: s.Constructors,
        }));
};

const computeConstructorStandingsFrom2026 = () => {
    const ctorMap = {};
    Object.values(results2026).forEach(race => {
        race.Results.forEach(r => {
            const ctor = r.Constructor;
            const id = ctor.constructorId;
            if (!ctorMap[id]) {
                ctorMap[id] = { Constructor: ctor, points: 0, wins: 0, podiums: 0 };
            }
            ctorMap[id].points += parseInt(r.points || 0);
            if (r.position === "1") ctorMap[id].wins++;
            if (parseInt(r.position) <= 3) ctorMap[id].podiums++;
        });
    });
    return Object.values(ctorMap)
        .sort((a, b) => b.points !== a.points ? b.points - a.points : b.wins - a.wins)
        .map((s, i) => ({
            position: (i + 1).toString(),
            points: s.points.toString(),
            wins: s.wins.toString(),
            podiums: s.podiums.toString(),
            Constructor: s.Constructor,
        }));
};

// ── API functions ─────────────────────────────────────────────────────────────

export const getNextRace = async () => {
    try {
        const res = await fetch('https://api.jolpi.ca/ergast/f1/current/next.json', { next: { revalidate: 3600 } });
        if (!res.ok) throw new Error('not ok');
        const data = await res.json();
        return data.MRData.RaceTable.Races[0];
    } catch {
        // Fallback: compute next race from local 2026 schedule
        const schedule = getFullSchedule2026();
        const now = new Date();
        const next = schedule.find(r => new Date(r.date) >= now);
        return next ? { ...next, season: '2026' } : null;
    }
};

export const getDriverStandings = async () => {
    try {
        const res = await fetch('https://api.jolpi.ca/ergast/f1/current/driverStandings.json', { next: { revalidate: 86400 } });
        if (!res.ok) throw new Error('not ok');
        const data = await res.json();
        const standings = data.MRData.StandingsTable.StandingsLists[0]?.DriverStandings;
        if (standings?.length) return standings.slice(0, 3);
        throw new Error('empty');
    } catch {
        return computeDriverStandingsFrom2026().slice(0, 3);
    }
};

export const getConstructorStandings = async () => {
    try {
        const res = await fetch('https://api.jolpi.ca/ergast/f1/current/constructorStandings.json', { next: { revalidate: 86400 } });
        if (!res.ok) throw new Error('not ok');
        const data = await res.json();
        const standings = data.MRData.StandingsTable.StandingsLists[0]?.ConstructorStandings;
        if (standings?.length) return standings.slice(0, 3);
        throw new Error('empty');
    } catch {
        return computeConstructorStandingsFrom2026().slice(0, 3);
    }
};

export const getFullDriverStandings = async (year) => {
    if (parseInt(year) === 2026) {
        try {
            const res = await fetch(`https://api.jolpi.ca/ergast/f1/${year}/driverStandings.json`, { next: { revalidate: 86400 } });
            if (!res.ok) throw new Error('not ok');
            const data = await res.json();
            const standings = data.MRData.StandingsTable.StandingsLists[0]?.DriverStandings || [];
            if (!standings.length) throw new Error('empty');
            const podiumsMap = {};
            Object.values(results2026).forEach(race => {
                race.Results.slice(0, 3).forEach(r => {
                    const id = r.Driver.driverId;
                    podiumsMap[id] = (podiumsMap[id] || 0) + 1;
                });
            });
            return standings.map(s => ({ ...s, podiums: (podiumsMap[s.Driver.driverId] || 0).toString() }));
        } catch {
            return computeDriverStandingsFrom2026();
        }
    }

    try {
        const res = await fetch(`https://api.jolpi.ca/ergast/f1/${year}/driverStandings.json`, { next: { revalidate: 86400 } });
        const data = await res.json();
        const standings = data.MRData.StandingsTable.StandingsLists[0]?.DriverStandings || [];
        let podiumsMap = {};
        try {
            const resultsRes = await fetch(`https://api.jolpi.ca/ergast/f1/${year}/results.json?limit=1000`, { next: { revalidate: 86400 } });
            const resultsData = await resultsRes.json();
            (resultsData.MRData.RaceTable.Races || []).forEach(race => {
                race.Results.slice(0, 3).forEach(r => {
                    const id = r.Driver.driverId;
                    podiumsMap[id] = (podiumsMap[id] || 0) + 1;
                });
            });
        } catch (e) {
            console.error("Error fetching results for podium calculation:", e);
        }
        return standings.map(s => ({ ...s, podiums: (podiumsMap[s.Driver.driverId] || 0).toString() }));
    } catch (error) {
        console.error(`Error fetching full driver standings for ${year}:`, error);
        return [];
    }
};

export const getFullConstructorStandings = async (year) => {
    if (parseInt(year) === 2026) {
        try {
            const res = await fetch(`https://api.jolpi.ca/ergast/f1/${year}/constructorStandings.json`, { next: { revalidate: 86400 } });
            if (!res.ok) throw new Error('not ok');
            const data = await res.json();
            const standings = data.MRData.StandingsTable.StandingsLists[0]?.ConstructorStandings || [];
            if (!standings.length) throw new Error('empty');
            const podiumsMap = {};
            Object.values(results2026).forEach(race => {
                race.Results.slice(0, 3).forEach(r => {
                    const id = r.Constructor.constructorId;
                    podiumsMap[id] = (podiumsMap[id] || 0) + 1;
                });
            });
            return standings.map(s => ({ ...s, podiums: (podiumsMap[s.Constructor.constructorId] || 0).toString() }));
        } catch {
            return computeConstructorStandingsFrom2026();
        }
    }

    try {
        const res = await fetch(`https://api.jolpi.ca/ergast/f1/${year}/constructorStandings.json`, { next: { revalidate: 86400 } });
        const data = await res.json();
        const standings = data.MRData.StandingsTable.StandingsLists[0]?.ConstructorStandings || [];
        let podiumsMap = {};
        try {
            const resultsRes = await fetch(`https://api.jolpi.ca/ergast/f1/${year}/results.json?limit=1000`, { next: { revalidate: 86400 } });
            const resultsData = await resultsRes.json();
            (resultsData.MRData.RaceTable.Races || []).forEach(race => {
                race.Results.slice(0, 3).forEach(r => {
                    const id = r.Constructor.constructorId;
                    podiumsMap[id] = (podiumsMap[id] || 0) + 1;
                });
            });
        } catch (e) {
            console.error("Error fetching results for podium calculation:", e);
        }
        return standings.map(s => ({ ...s, podiums: (podiumsMap[s.Constructor.constructorId] || 0).toString() }));
    } catch (error) {
        console.error(`Error fetching full constructor standings for ${year}:`, error);
        return [];
    }
};

const isFinishedStatus = (status) => {
    if (!status) return false;
    if (status === "Finished") return true;
    if (status.startsWith("+")) return true; // +1 Lap, +2 Laps, etc.
    return false;
};

const getSafetyCarCount = (raceControlMessages = []) => {
    return raceControlMessages.filter(m => {
        if (m.category !== "SafetyCar") return false;
        if (!m.message) return false;
        return /DEPLOYED/i.test(m.message);
    }).length;
};

const getRecentRacesFrom2026Data = () => {
    const schedule = getFullSchedule2026();
    const now = new Date();
    const completed = schedule.filter(r => new Date(r.date) < now);
    if (completed.length === 0) return [];
    return completed.slice(-3).reverse().map(race => {
        const raceResult = results2026[race.round];
        if (!raceResult) return null;
        const top3 = raceResult.Results.slice(0, 3).map(r => ({
            position: r.position,
            name: `${r.Driver?.givenName || ''} ${r.Driver?.familyName || ''}`.trim(),
            team: r.Constructors?.[0]?.name || r.Constructor?.name || '',
            time: r.Time?.time || r.status || '',
        }));
        const fastestLapResult = raceResult.Results.find(r => r.FastestLap?.rank === "1");
        return {
            round: race.round,
            raceName: race.raceName,
            circuitName: race.Circuit?.circuitName,
            locality: race.Circuit?.Location?.locality,
            country: race.Circuit?.Location?.country,
            date: race.date,
            top3,
            fastestLap: fastestLapResult ? {
                driver: `${fastestLapResult.Driver?.givenName || ''} ${fastestLapResult.Driver?.familyName || ''}`.trim(),
                time: fastestLapResult.FastestLap?.Time?.time || '',
            } : null,
            totalLaps: raceResult.Results[0]?.laps || '',
            safetyCars: null,
            retirements: raceResult.Results.filter(r => !_isFinishedStatus(r.status)).length,
        };
    }).filter(Boolean);
};

export const getRecentRacesCurrent = async () => {
    try {
        const scheduleRes = await fetch('https://api.jolpi.ca/ergast/f1/current.json', { next: { revalidate: 86400 } });
        if (!scheduleRes.ok) throw new Error('not ok');
        const scheduleData = await scheduleRes.json();
        const races = scheduleData?.MRData?.RaceTable?.Races || [];
        if (races.length === 0) throw new Error('empty');

        const now = new Date();
        const completedRaces = races.filter(race => new Date(race.date) < now);
        if (completedRaces.length === 0) return [];

        const lastThree = completedRaces.slice(-3).reverse();

        const currentYear = new Date().getFullYear();
        const sessionsRes = await fetch(`https://api.openf1.org/v1/sessions?year=${currentYear}&session_name=Race`, { next: { revalidate: 86400 } });
        const sessions = sessionsRes.ok ? await sessionsRes.json() : [];

        const raceDetails = await Promise.all(lastThree.map(async (race) => {
            const resultsRes = await fetch(`https://api.jolpi.ca/ergast/f1/current/${race.round}/results.json`, { next: { revalidate: 86400 } });
            if (!resultsRes.ok) return null;
            const resultsData = await resultsRes.json();
            const raceResults = resultsData?.MRData?.RaceTable?.Races?.[0]?.Results || [];

            const top3 = raceResults.slice(0, 3).map(r => ({
                position: r.position,
                name: `${r.Driver?.givenName || ''} ${r.Driver?.familyName || ''}`.trim(),
                team: r.Constructors?.[0]?.name || '',
                time: r.Time?.time || r.status || ''
            }));

            const fastestLapResult = raceResults.find(r => r.FastestLap?.rank === "1");
            const fastestLap = fastestLapResult ? {
                driver: `${fastestLapResult.Driver?.givenName || ''} ${fastestLapResult.Driver?.familyName || ''}`.trim(),
                time: fastestLapResult.FastestLap?.Time?.time || ''
            } : null;

            const totalLaps = raceResults?.[0]?.laps || '';
            const retirements = raceResults.filter(r => !isFinishedStatus(r.status)).length;

            const sessionMatch = sessions.find(s => s.date_start && s.date_start.startsWith(race.date));
            let safetyCars = null;
            if (sessionMatch?.session_key) {
                const rcRes = await fetch(`https://api.openf1.org/v1/race_control?session_key=${sessionMatch.session_key}`, { next: { revalidate: 86400 } });
                if (rcRes.ok) {
                    const rcData = await rcRes.json();
                    safetyCars = getSafetyCarCount(rcData);
                }
            }

            return {
                round: race.round,
                raceName: race.raceName,
                circuitName: race.Circuit?.circuitName,
                locality: race.Circuit?.Location?.locality,
                country: race.Circuit?.Location?.country,
                date: race.date,
                top3,
                fastestLap,
                totalLaps,
                safetyCars,
                retirements
            };
        }));

        return raceDetails.filter(Boolean);
    } catch {
        return getRecentRacesFrom2026Data();
    }
};

export const getFullScheduleCurrent = async () => {
    try {
        const res = await fetch('https://api.jolpi.ca/ergast/f1/current.json', { next: { revalidate: 86400 } });
        if (!res.ok) return [];
        const data = await res.json();
        return data.MRData.RaceTable.Races || [];
    } catch (error) {
        console.error("Error fetching full schedule:", error);
        return [];
    }
};

export const getFullSchedule2026 = () => {
    return [
        { round: "1", raceName: "Australian Grand Prix", date: "2026-03-08", dateRange: "6-8 MAR", Circuit: { circuitName: "Albert Park Circuit", Location: { locality: "Melbourne", country: "Australia" } } },
        { round: "2", raceName: "Chinese Grand Prix", date: "2026-03-15", dateRange: "13-15 MAR", Circuit: { circuitName: "Shanghai International Circuit", Location: { locality: "Shanghai", country: "China" } } },
        { round: "3", raceName: "Japanese Grand Prix", date: "2026-03-29", dateRange: "27-29 MAR", Circuit: { circuitName: "Suzuka Circuit", Location: { locality: "Suzuka", country: "Japan" } } },
        { round: "4", raceName: "Bahrain Grand Prix", date: "2026-04-12", dateRange: "10-12 APR", Circuit: { circuitName: "Bahrain International Circuit", Location: { locality: "Sakhir", country: "Bahrain" } } },
        { round: "5", raceName: "Saudi Arabian Grand Prix", date: "2026-04-19", dateRange: "17-19 APR", Circuit: { circuitName: "Jeddah Corniche Circuit", Location: { locality: "Jeddah", country: "Saudi Arabia" } } },
        { round: "6", raceName: "Miami Grand Prix", date: "2026-05-03", dateRange: "1-3 MAY", Circuit: { circuitName: "Miami International Autodrome", Location: { locality: "Miami", country: "USA" } } },
        { round: "7", raceName: "Canadian Grand Prix", date: "2026-05-24", dateRange: "22-24 MAY", Circuit: { circuitName: "Circuit Gilles Villeneuve", Location: { locality: "Montreal", country: "Canada" } } },
        { round: "8", raceName: "Monaco Grand Prix", date: "2026-06-07", dateRange: "5-7 JUN", Circuit: { circuitName: "Circuit de Monaco", Location: { locality: "Monte Carlo", country: "Monaco" } } },
        { round: "9", raceName: "Spanish Grand Prix", date: "2026-06-14", dateRange: "12-14 JUN", Circuit: { circuitName: "Circuit de Barcelona-Catalunya", Location: { locality: "Barcelona", country: "Spain" } } },
        { round: "10", raceName: "Austrian Grand Prix", date: "2026-06-28", dateRange: "26-28 JUN", Circuit: { circuitName: "Red Bull Ring", Location: { locality: "Spielberg", country: "Austria" } } },
        { round: "11", raceName: "British Grand Prix", date: "2026-07-05", dateRange: "3-5 JUL", Circuit: { circuitName: "Silverstone Circuit", Location: { locality: "Silverstone", country: "UK" } } },
        { round: "12", raceName: "Belgian Grand Prix", date: "2026-07-19", dateRange: "17-19 JUL", Circuit: { circuitName: "Circuit de Spa-Francorchamps", Location: { locality: "Spa", country: "Belgium" } } },
        { round: "13", raceName: "Hungarian Grand Prix", date: "2026-07-26", dateRange: "24-26 JUL", Circuit: { circuitName: "Hungaroring", Location: { locality: "Budapest", country: "Hungary" } } },
        { round: "14", raceName: "Dutch Grand Prix", date: "2026-08-23", dateRange: "21-23 AUG", Circuit: { circuitName: "Circuit Zandvoort", Location: { locality: "Zandvoort", country: "Netherlands" } } },
        { round: "15", raceName: "Italian Grand Prix", date: "2026-09-06", dateRange: "4-6 SEP", Circuit: { circuitName: "Autodromo Nazionale Monza", Location: { locality: "Monza", country: "Italy" } } },
        { round: "16", raceName: "Madrid Grand Prix", date: "2026-09-13", dateRange: "11-13 SEP", Circuit: { circuitName: "IFEMA Madrid Circuit", Location: { locality: "Madrid", country: "Spain" } } },
        { round: "17", raceName: "Azerbaijan Grand Prix", date: "2026-09-26", dateRange: "24-26 SEP", Circuit: { circuitName: "Baku City Circuit", Location: { locality: "Baku", country: "Azerbaijan" } } },
        { round: "18", raceName: "Singapore Grand Prix", date: "2026-10-11", dateRange: "9-11 OCT", Circuit: { circuitName: "Marina Bay Street Circuit", Location: { locality: "Singapore", country: "Singapore" } } },
        { round: "19", raceName: "United States Grand Prix", date: "2026-10-25", dateRange: "23-25 OCT", Circuit: { circuitName: "Circuit of the Americas", Location: { locality: "Austin", country: "USA" } } },
        { round: "20", raceName: "Mexican Grand Prix", date: "2026-11-01", dateRange: "30 OCT - 1 NOV", Circuit: { circuitName: "Autódromo Hermanos Rodríguez", Location: { locality: "Mexico City", country: "Mexico" } } },
        { round: "21", raceName: "Brazilian Grand Prix", date: "2026-11-08", dateRange: "6-8 NOV", Circuit: { circuitName: "Autódromo José Carlos Pace", Location: { locality: "São Paulo", country: "Brazil" } } },
        { round: "22", raceName: "Las Vegas Grand Prix", date: "2026-11-21", dateRange: "19-21 NOV", Circuit: { circuitName: "Las Vegas Strip Circuit", Location: { locality: "Las Vegas", country: "USA" } } },
        { round: "23", raceName: "Qatar Grand Prix", date: "2026-11-29", dateRange: "27-29 NOV", Circuit: { circuitName: "Lusail International Circuit", Location: { locality: "Lusail", country: "Qatar" } } },
        { round: "24", raceName: "Abu Dhabi Grand Prix", date: "2026-12-06", dateRange: "4-6 DEC", Circuit: { circuitName: "Yas Marina Circuit", Location: { locality: "Abu Dhabi", country: "UAE" } } },
    ];
};


export const getSeasonSchedule = async (year) => {
    try {
        const res = await fetch(`https://api.jolpi.ca/ergast/f1/${year}.json`, { next: { revalidate: 86400 } });
        if (!res.ok) throw new Error('not ok');
        const data = await res.json();
        const races = data.MRData.RaceTable.Races || [];
        if (races.length) return races;
        throw new Error('empty');
    } catch {
        if (parseInt(year) === 2026) return getFullSchedule2026();
        return [];
    }
};

export const getRaceResults = async (year, round) => {
    try {
        const res = await fetch(`https://api.jolpi.ca/ergast/f1/${year}/${round}/results.json`, { next: { revalidate: 3600 } });
        if (res.ok) {
            const data = await res.json();
            const race = data.MRData.RaceTable.Races[0];
            
            if (race && race.Results) {
                // IMPORTANT: Transform data to ensure Constructors is an array (which the UI expects)
                race.Results = race.Results.map(r => ({
                    ...r,
                    Constructors: r.Constructor ? [r.Constructor] : (r.Constructors || [])
                }));
                return race;
            }
        }
    } catch (error) {
        console.error(`Error fetching results for ${year} round ${round}:`, error);
    }

    // Fallback to local data for 2026 if API fails or has no data
    if (parseInt(year) === 2026 && results2026[String(round)]) {
        return results2026[String(round)];
    }

    return null;
};
export const getDriversForSeason = async (year) => {
    try {
        const res = await fetch(`https://api.jolpi.ca/ergast/f1/${year}/drivers.json`, { next: { revalidate: 86400 } });
        if (!res.ok) return [];
        const data = await res.json();
        return data.MRData.DriverTable.Drivers;
    } catch (error) {
        console.error(`Error fetching drivers for ${year}:`, error);
        return [];
    }
};

export const getDriverComparisonStats = async (year, driverId) => {
    try {
        const standingsRes = await fetch(`https://api.jolpi.ca/ergast/f1/${year}/drivers/${driverId}/driverStandings.json`, { next: { revalidate: 86400 } });
        const standingsData = await standingsRes.json();
        const standing = standingsData.MRData.StandingsTable.StandingsLists[0]?.DriverStandings[0];

        const resultsRes = await fetch(`https://api.jolpi.ca/ergast/f1/${year}/drivers/${driverId}/results.json?limit=100`, { next: { revalidate: 86400 } });
        const resultsData = await resultsRes.json();
        const races = resultsData.MRData.RaceTable.Races || [];
        const podiums = races.filter(r => parseInt(r.Results[0].position) <= 3).length;

        const qualifyRes = await fetch(`https://api.jolpi.ca/ergast/f1/${year}/drivers/${driverId}/qualifying.json`, { next: { revalidate: 86400 } });
        const qualifyData = await qualifyRes.json();
        const qualifying = qualifyData.MRData.RaceTable.Races || [];
        const poles = qualifying.filter(q => parseInt(q.QualifyingResults[0].position) === 1).length;

        const bestLap = races.find(r => r.Results[0].FastestLap)?.Results[0].FastestLap.Time.time || "N/A";

        return {
            points: standing?.points || "0",
            wins: standing?.wins || "0",
            position: standing?.position || "N/A",
            podiums: podiums.toString(),
            poles: poles.toString(),
            bestLap,
            team: standing?.Constructors[0]?.name || "N/A",
            number: standing?.Driver.permanentNumber || "N/A",
            code: standing?.Driver.code || (standing?.Driver.familyName || '???').substring(0, 3).toUpperCase(),
            nationality: standing?.Driver.nationality || ""
        };
    } catch (error) {
        console.error(`Error fetching comparison stats for ${driverId} in ${year}:`, error);
        return null;
    }
};

export const getPracticeSessionResults = async (year, circuitName) => {
    try {
        // Find meeting key for the circuit
        const meetingsRes = await fetch(`https://api.openf1.org/v1/meetings?year=${year}`, { next: { revalidate: 86400 } });
        if (!meetingsRes.ok) return null;
        const meetings = await meetingsRes.json();

        // Find the matching meeting (simple substring match on circuit or location)
        const meeting = meetings.find(m =>
            m.circuit_short_name.toLowerCase().includes(circuitName.toLowerCase()) ||
            m.location.toLowerCase().includes(circuitName.toLowerCase()) ||
            circuitName.toLowerCase().includes(m.circuit_short_name.toLowerCase())
        );

        if (!meeting) return null;

        // Fetch sessions for this meeting
        const sessionsRes = await fetch(`https://api.openf1.org/v1/sessions?meeting_key=${meeting.meeting_key}`, { next: { revalidate: 86400 } });
        if (!sessionsRes.ok) return null;
        const sessions = await sessionsRes.json();

        const practiceSessions = sessions.filter(s => s.session_name.includes('Practice'));
        if (practiceSessions.length === 0) return null;

        const results = {};

        // Drivers info mapping (fetch once per meeting)
        let driversMap = {};

        for (const session of practiceSessions) {
            const lapsRes = await fetch(`https://api.openf1.org/v1/laps?session_key=${session.session_key}`, { next: { revalidate: 3600 } });
            if (!lapsRes.ok) continue;
            const laps = await lapsRes.json();

            if (laps.length === 0) continue;

            if (Object.keys(driversMap).length === 0) {
                // Fetch drivers for this session to get names/teams
                const driversRes = await fetch(`https://api.openf1.org/v1/drivers?session_key=${session.session_key}`, { next: { revalidate: 86400 } });
                if (driversRes.ok) {
                    const driversData = await driversRes.json();
                    driversData.forEach(d => {
                        driversMap[d.driver_number] = {
                            name: d.full_name || `${d.first_name} ${d.last_name}`,
                            team: d.team_name,
                            color: d.team_colour,
                            code: d.name_acronym
                        };
                    });
                }
            }

            // Find best lap per driver
            const bestLaps = {};
            laps.forEach(lap => {
                if (lap.lap_duration && (!bestLaps[lap.driver_number] || lap.lap_duration < bestLaps[lap.driver_number].lap_duration)) {
                    bestLaps[lap.driver_number] = lap;
                }
            });

            // Sort and take top 3
            const sortedDrivers = Object.values(bestLaps).sort((a, b) => a.lap_duration - b.lap_duration).slice(0, 3);

            // Format output
            results[session.session_name] = sortedDrivers.map((lap, index) => {
                const driverInfo = driversMap[lap.driver_number] || {};

                // Convert lap duration (seconds) to formatted time mm:ss.SSS
                const minutes = Math.floor(lap.lap_duration / 60);
                const seconds = (lap.lap_duration % 60).toFixed(3).padStart(6, '0');
                const timeString = `${minutes}:${seconds}`;

                return {
                    position: index + 1,
                    driver_number: lap.driver_number,
                    name: driverInfo.name || `Driver ${lap.driver_number}`,
                    team: driverInfo.team || 'Unknown',
                    code: driverInfo.code || '',
                    color: driverInfo.color ? `#${driverInfo.color}` : '#FFFFFF',
                    time: timeString
                };
            });
        }

        return Object.keys(results).length > 0 ? results : null;
    } catch (error) {
        console.error(`Error fetching practice sessions for ${circuitName} in ${year}:`, error);
        return null;
    }
};

export const getCircuitHistoricalResults = async (circuitId) => {
    try {
        const years = [2024, 2023, 2022, 2021, 2019];
        const results = await Promise.all(years.map(async (year) => {
            try {
                const res = await fetch(`https://api.jolpi.ca/ergast/f1/${year}/circuits/${circuitId}/results.json`, { next: { revalidate: 604800 } });
                if (!res.ok) return null;
                const data = await res.json();
                return data.MRData.RaceTable.Races[0] || null;
            } catch (e) { return null; }
        }));
        return results.filter(Boolean);
    } catch (error) {
        console.error(`Error fetching historical results for ${circuitId}:`, error);
        return [];
    }
};

export const getDriverForm = async (driverId) => {
    try {
        const res = await fetch(`https://api.jolpi.ca/ergast/f1/current/drivers/${driverId}/results.json?limit=5`, { next: { revalidate: 86400 } });
        if (!res.ok) return [];
        const data = await res.json();
        return data.MRData.RaceTable.Races || [];
    } catch (error) {
        console.error(`Error fetching form for ${driverId}:`, error);
        return [];
    }
};

export const calculateRaceProbabilities = (drivers, historicalResults, currentStandings) => {
    if (!drivers || !currentStandings) return [];

    const results = drivers.map(driver => {
        let score = 0;
        const standing = currentStandings.find(s => s.Driver.driverId === driver.driverId);
        const points = standing ? parseInt(standing.points) : 0;

        // Form score based on current points
        score += (points / 500) * 50;

        // History score
        const trackHistory = historicalResults.map(race => {
            const result = race.Results.find(r => r.Driver.driverId === driver.driverId);
            if (!result) return 0;
            const pos = parseInt(result.position);
            if (pos === 1) return 25;
            if (pos <= 3) return 15;
            if (pos <= 10) return 5;
            return 0;
        });

        const historyScore = trackHistory.length > 0
            ? (trackHistory.reduce((a, b) => a + b, 0) / (trackHistory.length * 25)) * 40
            : 10;

        score += historyScore;

        // Random variance (The "F1 factor")
        score += Math.random() * 10;

        return {
            driverId: driver.driverId,
            name: driver.familyName.toUpperCase(),
            team: standing?.Constructors[0]?.name || "N/A",
            score: Math.min(98, Math.max(2, Math.round(score)))
        };
    });

    return results.sort((a, b) => b.score - a.score);
};
