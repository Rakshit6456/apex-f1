export const getNextRace = async () => {
    try {
        const res = await fetch('https://api.jolpi.ca/ergast/f1/current/next.json', { next: { revalidate: 3600 } });
        if (!res.ok) return null;
        const data = await res.json();
        return data.MRData.RaceTable.Races[0];
    } catch (error) {
        console.error("Error fetching next race:", error);
        return null;
    }
};

export const getDriverStandings = async () => {
    try {
        // Try to get current season standings first
        let res = await fetch('https://api.jolpi.ca/ergast/f1/current/driverStandings.json', { next: { revalidate: 3600 } });
        let data = await res.json();
        let standings = data.MRData.StandingsTable.StandingsLists[0]?.DriverStandings;

        // If no standings for current season (pre-season), fetch previous season
        if (!standings || standings.length === 0) {
            res = await fetch('https://api.jolpi.ca/ergast/f1/2025/driverStandings.json', { next: { revalidate: 86400 } });
            data = await res.json();
            standings = data.MRData.StandingsTable.StandingsLists[0]?.DriverStandings;
        }

        return standings ? standings.slice(0, 3) : [];
    } catch (error) {
        console.error("Error fetching driver standings:", error);
        return [];
    }
};

export const getConstructorStandings = async () => {
    try {
        // Try to get current season standings first
        let res = await fetch('https://api.jolpi.ca/ergast/f1/current/constructorStandings.json', { next: { revalidate: 3600 } });
        let data = await res.json();
        let standings = data.MRData.StandingsTable.StandingsLists[0]?.ConstructorStandings;

        // If no standings for current season (pre-season), fetch previous season
        if (!standings || standings.length === 0) {
            res = await fetch('https://api.jolpi.ca/ergast/f1/2025/constructorStandings.json', { next: { revalidate: 86400 } });
            data = await res.json();
            standings = data.MRData.StandingsTable.StandingsLists[0]?.ConstructorStandings;
        }

        return standings ? standings.slice(0, 3) : [];
    } catch (error) {
        console.error("Error fetching constructor standings:", error);
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

export const getRecentRaces2025 = async () => {
    try {
        const scheduleRes = await fetch('https://api.jolpi.ca/ergast/f1/2025.json', { next: { revalidate: 86400 } });
        if (!scheduleRes.ok) return [];
        const scheduleData = await scheduleRes.json();
        const races = scheduleData?.MRData?.RaceTable?.Races || [];
        if (races.length === 0) return [];

        const lastThree = races.slice(-3).reverse();

        const sessionsRes = await fetch('https://api.openf1.org/v1/sessions?year=2025&session_name=Race', { next: { revalidate: 86400 } });
        const sessions = sessionsRes.ok ? await sessionsRes.json() : [];

        const raceDetails = await Promise.all(lastThree.map(async (race) => {
            const resultsRes = await fetch(`https://api.jolpi.ca/ergast/f1/2025/${race.round}/results.json`, { next: { revalidate: 86400 } });
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
    } catch (error) {
        console.error("Error fetching recent races:", error);
        return [];
    }
};

export const getFullSchedule2025 = async () => {
    try {
        const res = await fetch('https://api.jolpi.ca/ergast/f1/2025.json', { next: { revalidate: 86400 } });
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
        if (!res.ok) return [];
        const data = await res.json();
        return data.MRData.RaceTable.Races || [];
    } catch (error) {
        console.error(`Error fetching schedule for ${year}:`, error);
        return [];
    }
};

export const getRaceResults = async (year, round) => {
    try {
        const res = await fetch(`https://api.jolpi.ca/ergast/f1/${year}/${round}/results.json`, { next: { revalidate: 86400 } });
        if (!res.ok) return null;
        const data = await res.json();
        return data.MRData.RaceTable.Races[0] || null;
    } catch (error) {
        console.error(`Error fetching results for ${year} round ${round}:`, error);
        return null;
    }
};
