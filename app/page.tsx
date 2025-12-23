import React from 'react';

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

interface ApiResponse {
  matches: Match[];
}

// --- DATA FETCHING ---
async function getTodaysMatches(): Promise<ApiResponse> {
  const apiKey = process.env.NEXT_PUBLIC_API_TOKEN;
  
  // 1. Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  // 2. Filter API to strictly show today's games
  const url = `https://api.football-data.org/v4/matches?dateFrom=${today}&dateTo=${today}`;
  

  try {
    const res = await fetch(url, {
      headers: { 'X-Auth-Token': apiKey || '' },
      // 3. ISR Caching: Revalidate every 60 seconds
      // This protects your API limits while keeping data fresh
      next: { revalidate: 60 }, 
    });
    
    if (!res.ok) {
      console.error('API Error:', res.status, res.statusText);
      return { matches: [] };
    }
    return res.json();
  } catch (error) {
    console.error('Fetch error:', error);
    return { matches: [] };
  }
}

export default async function Home() {
  const data = await getTodaysMatches();
  const matches = data.matches || [];

  // --- SORTING LOGIC ---
  // Live games top, then by time
  const sortedMatches = matches.sort((a, b) => {
    const isALive = a.status === 'IN_PLAY' || a.status === 'PAUSED';
    const isBLive = b.status === 'IN_PLAY' || b.status === 'PAUSED';
    
    if (isALive && !isBLive) return -1;
    if (!isALive && isBLive) return 1;

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
            {/* Live Badge */}
            <div className="hidden md:flex items-center bg-emerald-800 px-4 py-2 rounded-full border border-emerald-600 shadow-sm">
              <span className="relative flex h-3 w-3 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <span className="text-xs font-bold uppercase tracking-wider">Live Updates</span>
            </div>
          </div>
        </div>
      </div>

      {/* LIST */}
      <div className="max-w-3xl mx-auto px-4 -mt-6">
        <div className="space-y-4 pb-12">
          
          {sortedMatches.length === 0 ? (
            <div className="p-12 bg-white rounded-xl shadow-sm text-center border border-slate-200">
              <div className="text-4xl mb-4">⚽</div>
              <h3 className="text-lg font-bold text-slate-700">No matches found today</h3>
              <p className="text-slate-500 text-sm mt-2">Check back tomorrow!</p>
            </div>
          ) : (
            sortedMatches.map((match) => (
              <div 
                key={match.id} 
                className="group bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all duration-200"
              >
                {/* Match Header */}
                <div className="bg-slate-50 px-4 py-2 border-b border-slate-100 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                     <span className="w-1 h-4 bg-emerald-500 rounded-full block"></span>
                     {match.competition.name}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    match.status === 'IN_PLAY' || match.status === 'PAUSED'
                      ? 'bg-red-50 text-red-600 border-red-100 animate-pulse' 
                      : match.status === 'FINISHED' 
                      ? 'bg-slate-100 text-slate-500 border-slate-200'
                      : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                  }`}>
                    {match.status === 'IN_PLAY' ? 'LIVE' : match.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Match Body */}
                <div className="p-5 flex items-center justify-between">
                  {/* Home */}
                  <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center">
                    {match.homeTeam.crest && (
                      <img src={match.homeTeam.crest} alt={match.homeTeam.name} className="h-10 w-10 sm:h-12 sm:w-12 object-contain" loading="lazy" />
                    )}
                    <span className="text-xs sm:text-sm font-bold text-slate-800 leading-tight line-clamp-2">
                      {match.homeTeam.shortName || match.homeTeam.name}
                    </span>
                  </div>

                  {/* Score */}
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

                  {/* Away */}
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