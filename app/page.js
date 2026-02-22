"use client";
import React, { useState, useEffect } from 'react';
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Standings from "./components/Standings";
import RecentRaces from "./components/RecentRaces";
import CircularGallery from "./components/CircularGallery";
import { getNextRace, getDriverStandings, getConstructorStandings, getRecentRaces2025 } from './utils/f1Api';

export default function Home() {
  const [data, setData] = useState({
    nextRace: null,
    driverStandings: [],
    constructorStandings: [],
    recentRaces: []
  });

  const highlightItems = [
    { image: "https://cdn-8.motorsport.com/images/mgl/YXypqgj6/s1200/charles-leclerc-ferrari-oscar-.webp", text: "Pre Season Testing" },
    { image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSLh1QjmZUWlBepduQwb1eWghFBZAeLt6uU4A&s", text: "Isack's first F1 podium" },
    { image: "https://news.files.bbci.co.uk/include/extra/shorthand/assets/sport/4aplcod5v0/assets/Ky0cFCp72T/f1-miami_4-900x600.jpg", text: "McLaren Dominance" },
    { image: "https://media.formula1.com/image/upload/t_16by9North/c_lfill,w_3392/q_auto/v1740000000/trackside-images/2025/F1_Grand_Prix_of_Italy/2234141875.webp", text: "Max's comeback" },
    { image: "https://media.formula1.com/image/upload/t_16by9North/c_lfill,w_3392/q_auto/v1740000000/trackside-images/2025/F1_Grand_Prix_Of_China___Sprint__Qualifying/2206317183.webp", text: "China Sprint" },
    { image: "https://media.formula1.com/image/upload/t_16by9North/c_lfill,w_3392/q_auto/v1740000000/trackside-images/2025/F1_Grand_Prix_of_Brazil/2245877437.webp", text: "New Champion" },
    { image: "https://www.thetimes.com/imageserver/image/%2F7180847d-5042-44cf-9dc2-bbe4bd45019c.jpg?crop=3099%2C3099%2C775%2C0", text: "Nico's Podium" },
    { image: "https://media.formula1.com/image/upload/t_16by9Centre/f_auto/q_auto/v1758466180/trackside-images/2025/F1_Grand_Prix_of_Azerbaijan/2236574109.jpg", text: "Smooth Operation" }
  ];

  useEffect(() => {
    const fetchData = async () => {
      const [nextRace, driverStandings, constructorStandings, recentRaces] = await Promise.all([
        getNextRace(),
        getDriverStandings(),
        getConstructorStandings(),
        getRecentRaces2025()
      ]);
      setData({ nextRace, driverStandings, constructorStandings, recentRaces });
    };
    fetchData();
  }, []);

  return (
    <main className="bg-[#0A0A0A] min-h-screen text-white font-sans selection:bg-[#FF1801] selection:text-white pb-20">
      <Navbar />
      <Hero nextRace={data.nextRace} />

      {/* Season Highlights Gallery */}
      <section className="h-[450px] md:h-[600px] w-full relative bg-black/50 py-10 md:py-20 border-y border-white/5 overflow-hidden">
        <div className="absolute top-6 md:top-10 left-1/2 -translate-x-1/2 z-10 text-center w-full px-4">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white uppercase italic tracking-tighter font-condensed">2025 <span className="text-[#FF1801]">Season Highlights</span></h2>
        </div>
        <CircularGallery
          items={highlightItems}
          bend={3}
          textColor="#FF1801"
          font="bold 16px var(--font-barlow-condensed)"
        />
      </section>

      <Standings
        driverStandings={data.driverStandings}
        constructorStandings={data.constructorStandings}
      />
      <RecentRaces races={data.recentRaces} />


    </main>
  );
}
