import React from 'react';
import Link from 'next/link';

// --- TYPESCRIPT INTERFACES ---
interface Team {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
}

interface Score {
  fullTime: {
    home: number | null;
    away: number | null;
  };
}

interface Match {
  id: number;
  utcDate: string;
  status: string;
  homeTeam: Team;
  awayTeam: Team;
  score: Score;
  competition: {
    name: string;
    emblem?: string;
  };
}

// --- DATA FETCHING ---
async function getMatchesData() {
  const apiKey = process.env.NEXT_PUBLIC_API_TOKEN;
  const headers = { 'X-Auth-Token': apiKey || '' };
  
  // 1. Define Dates
  const todayObj = new Date();
  const todayStr = todayObj.toISOString().split('T')[0];

  try {
    // 2. Attempt: Fetch TODAY'S matches
    const urlToday = `https://api.football-data.org/v4/matches?dateFrom=${todayStr}&dateTo=${todayStr}`;
    const resToday = await fetch(urlToday, { headers, next: { revalidate: 60 } });
    const dataToday = await resToday.json();

    // If we have matches today, return them immediately
    if (dataToday.matches && dataToday.matches.length > 0) {
      return { 
        matches: dataToday.matches, 
        isToday: true, 
        label: "Today's Matches" 
      };
    }

    // 3. Fallback: If today is empty, fetch NEXT 3 DAYS
    const tomorrowObj = new Date(todayObj);
    tomorrowObj.setDate(tomorrowObj.getDate() + 1);
    const tomorrowStr = tomorrowObj.toISOString().split('T')[0];

    const futureObj = new Date(todayObj);
    futureObj.setDate(futureObj.getDate() + 3);
    const futureStr = futureObj.toISOString().split('T')[0];

    // Fetch slightly wider range to ensure we show *something*
    const urlFuture = `https://api.football-data.org/v4/matches?dateFrom=${tomorrowStr}&dateTo=${futureStr}`;
    const resFuture = await fetch(urlFuture, { headers, next: { revalidate: 3600 } }); // Cache for 1 hour
    const dataFuture = await resFuture.json();

    return { 
      matches: dataFuture.matches || [], 
      isToday: false, 
      label: "Upcoming Fixtures (Next 3 Days)" 
    };

  } catch (error) {
    return { matches: [], isToday: true, label: "Live Scores" };
  }
}

export default async function Home() {
  const { matches, isToday, label } = await getMatchesData();

  // Sort: Live/Today games by status, Future games by Date
  const sortedMatches = matches.sort((a: Match, b: Match) => {
    if (isToday) {
      // Prioritize LIVE games
      const isALive = a.status === 'IN_PLAY' || a.status === 'PAUSED';
      const isBLive = b.status === 'IN_PLAY' || b.status === 'PAUSED';
      if (isALive && !isBLive) return -1;
      if (!isALive && isBLive) return 1;
    }
    // Otherwise sort by time
    return new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime();
  });

  return (
    <main className="min-h-screen bg-slate-50 font-sans">
      {/* HEADER */}
      <div className="bg-emerald-700 text-white py-8 shadow-lg">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Today's Match</h1>
              <p className="text-emerald-100 text-sm mt-1">Live Football Scores & Fixtures</p>
            </div>
            {/* Show Live Badge ONLY if it is actually today */}
            {isToday && (
              <div className="hidden md:flex items-center bg-emerald-800 px-4 py-2 rounded-full border border-emerald-600 shadow-sm">
                <span className="relative flex h-3 w-3 mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <span className="text-xs font-bold uppercase tracking-wider">Live Updates</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* LIST */}
      <div className="max-w-3xl mx-auto px-4 -mt-6">
        <div className="space-y-4 pb-12">
          
          {/* Section Label (e.g., "Upcoming Fixtures") */}
          {!isToday && matches.length > 0 && (
            <div className="bg-blue-50 border border-blue-100 text-blue-700 px-4 py-3 rounded-xl mb-4 text-center font-medium shadow-sm">
              ℹ️ No matches scheduled for today. Showing upcoming games:
            </div>
          )}

          {sortedMatches.length === 0 ? (
            <div className="p-12 bg-white rounded-xl shadow-sm text-center border border-slate-200">
              <div className="text-4xl mb-4">⚽</div>
              <h3 className="text-lg font-bold text-slate-700">No matches found</h3>
              <p className="text-slate-500 text-sm mt-2">Check back later for updates!</p>
            </div>
          ) : (
            sortedMatches.map((match: Match) => (
              <div key={match.id} className="group bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all duration-200">
                {/* Match Header */}
                <div className="bg-slate-50 px-4 py-2 border-b border-slate-100 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                     <span className="w-1 h-4 bg-emerald-500 rounded-full block"></span>
                     {match.competition.name}
                  </span>
                  
                  {/* Status / Date Badge */}
                  {isToday ? (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      match.status === 'IN_PLAY' || match.status === 'PAUSED'
                        ? 'bg-red-50 text-red-600 border-red-100 animate-pulse' 
                        : match.status === 'FINISHED' 
                        ? 'bg-slate-100 text-slate-500 border-slate-200'
                        : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                    }`}>
                      {match.status === 'IN_PLAY' ? 'LIVE' : match.status.replace('_', ' ')}
                    </span>
                  ) : (
                    // If showing future matches, show the DATE instead of status
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                      {new Date(match.utcDate).toLocaleDateString([], {weekday: 'short', month: 'short', day: 'numeric'})}
                    </span>
                  )}
                </div>

                {/* Match Body */}
                <div className="p-5 flex items-center justify-between">
                  <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center">
                    {match.homeTeam.crest && (
                      <img src={match.homeTeam.crest} alt={match.homeTeam.name} className="h-10 w-10 sm:h-12 sm:w-12 object-contain" loading="lazy" />
                    )}
                    <span className="text-xs sm:text-sm font-bold text-slate-800 leading-tight line-clamp-2">
                      {match.homeTeam.shortName || match.homeTeam.name}
                    </span>
                  </div>

                  <div className="w-28 flex flex-col items-center justify-center shrink-0">
                    {match.status === 'TIMED' || match.status === 'SCHEDULED' ? (
                      <div className="text-2xl font-light text-slate-400">
                        {new Date(match.utcDate).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit', hour12: false })}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-3xl font-black text-slate-800">
                        <span>{match.score.fullTime.home ?? 0}</span>
                        <span className="text-slate-300 text-xl">-</span>
                        <span>{match.score.fullTime.away ?? 0}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center">
                     {match.awayTeam.crest && (
                      <img src={match.awayTeam.crest} alt={match.awayTeam.name} className="h-10 w-10 sm:h-12 sm:w-12 object-contain" loading="lazy" />
                    )}
                    <span className="text-xs sm:text-sm font-bold text-slate-800 leading-tight line-clamp-2">
                      {match.awayTeam.shortName || match.awayTeam.name}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <footer className="text-center text-slate-400 text-sm pb-8">
          <p>© {new Date().getFullYear()} TodaysMatch.org • Data via Football-Data.org</p>
        </footer>
      </div>
    </main>
  );
}