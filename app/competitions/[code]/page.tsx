import React from 'react';
import { notFound } from 'next/navigation';

// --- CONFIGURATION ---
// Map of League Codes to Names (Free Tier Supported)
const LEAGUES: Record<string, string> = {
  'PL': 'Premier League',
  'PD': 'La Liga',
  'BL1': 'Bundesliga',
  'SA': 'Serie A',
  'FL1': 'Ligue 1',
  'ELC': 'Championship',
  'PPL': 'Primeira Liga',
  'DED': 'Eredivisie',
  'BSA': 'Brasileirão',
  'CL': 'Champions League',
  'EC': 'European Championship',
  'WC': 'World Cup',
};

// --- TYPES ---
interface Match {
  id: number;
  utcDate: string;
  status: string;
  homeTeam: { name: string; shortName: string; crest: string };
  awayTeam: { name: string; shortName: string; crest: string };
  score: { fullTime: { home: number | null; away: number | null } };
  competition: { code: string; name: string };
}

// --- DATA FETCHING ---
async function getLeagueMatches(code: string) {
  const apiKey = process.env.NEXT_PUBLIC_API_TOKEN;
  
  // Fetch next 14 days of games to ensure the page isn't empty
  const today = new Date();
  const future = new Date(today);
  future.setDate(today.getDate() + 14);

  const dateFrom = today.toISOString().split('T')[0];
  const dateTo = future.toISOString().split('T')[0];
  
  const url = `https://api.football-data.org/v4/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`;

  try {
    const res = await fetch(url, {
      headers: { 'X-Auth-Token': apiKey || '' },
      next: { revalidate: 3600 }, // Cache for 1 hour (slower updates for future fixtures is fine)
    });
    
    if (!res.ok) return [];
    const data = await res.json();
    
    // Filter by the requested league code
    return (data.matches || []).filter((m: Match) => m.competition.code === code);
  } catch (error) {
    return [];
  }
}

interface PageProps {
  params: Promise<{ code: string }>;
}

export default async function LeaguePage({ params }: PageProps) {
  const resolvedParams = await params;
  const code = resolvedParams.code.toUpperCase();
  const leagueName = LEAGUES[code];

  if (!leagueName) {
    return notFound();
  }

  const matches = await getLeagueMatches(code);

  return (
    <main className="min-h-screen bg-slate-50 font-sans pb-12">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 py-8">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{leagueName}</h1>
          <p className="text-slate-500 mt-2">Upcoming Fixtures & Results</p>
        </div>
      </div>

      {/* Match List */}
      <div className="max-w-3xl mx-auto px-4 mt-8 space-y-4">
        {matches.length === 0 ? (
          <div className="p-12 bg-white rounded-xl shadow-sm text-center border border-slate-200">
            <div className="text-4xl mb-4">📅</div>
            <h3 className="text-lg font-bold text-slate-700">No upcoming matches</h3>
            <p className="text-slate-500 text-sm mt-2">Check back later!</p>
          </div>
        ) : (
          matches.map((match: Match) => (
            <div key={match.id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="bg-slate-50 text-slate-500 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                {new Date(match.utcDate).toLocaleDateString([], {weekday: 'short', month: 'short', day: 'numeric'})}
              </div>
              <div className="flex-1 flex items-center justify-between w-full">
                 <div className="flex-1 text-right font-bold text-slate-800 text-sm sm:text-base">
                   {match.homeTeam.shortName || match.homeTeam.name}
                 </div>
                 <div className="px-4 text-center">
                   {match.status === 'IN_PLAY' || match.status === 'PAUSED' || match.status === 'FINISHED' ? (
                     <div className="bg-slate-100 px-3 py-1 rounded text-lg font-black font-mono">
                       {match.score.fullTime.home ?? 0} - {match.score.fullTime.away ?? 0}
                     </div>
                   ) : (
                     <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded text-sm font-bold">
                       {new Date(match.utcDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false})}
                     </div>
                   )}
                 </div>
                 <div className="flex-1 text-left font-bold text-slate-800 text-sm sm:text-base">
                   {match.awayTeam.shortName || match.awayTeam.name}
                 </div>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}