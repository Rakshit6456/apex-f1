const fs = require('fs');
const path = require('path');

const API_BASE = 'https://api.jolpi.ca/ergast/f1';
const YEAR_TO_FETCH = '2026'; // FETCH ACTUAL 2026 DATA
const TARGET_PATH = path.join(__dirname, '../app/data/results2026.js');

async function fetchRaceResults(round) {
    console.log(`Fetching results for Round ${round}...`);
    try {
        const response = await fetch(`${API_BASE}/${YEAR_TO_FETCH}/${round}/results.json`);
        if (!response.ok) return null;
        const data = await response.json();
        const race = data.MRData.RaceTable.Races[0];
        if (!race) return null;

        // Ensure Constructors is an array with name property
        race.Results = race.Results.map(r => ({
            ...r,
            Constructors: r.Constructor ? [r.Constructor] : (r.Constructors || [])
        }));

        return race;
    } catch (error) {
        console.error(`Error fetching round ${round}:`, error);
        return null;
    }
}

async function sync() {
    console.log('--- F1 2026 ACTUAL Results Sync ---');
    
    let results = {};
    // We'll sync rounds 1 to 24 (the full schedule)
    for (let round = 1; round <= 24; round++) {
        const raceData = await fetchRaceResults(round);
        if (raceData) {
            results[round] = raceData;
            console.log(`✅ Synced 2026 Round ${round}: ${raceData.raceName} (Winner: ${raceData.Results[0].Driver.familyName})`);
        } else {
            // If No data, we stop syncing for future rounds but keep the loop going if there's any gap
            if (round > 5) break; // Arbitrary break if we hit many empty rounds
        }
    }

    const fileContent = `export const results2026 = ${JSON.stringify(results, null, 4)};\n`;
    fs.writeFileSync(TARGET_PATH, fileContent);
    console.log(`\nResults written to ${TARGET_PATH}`);
}

sync();
