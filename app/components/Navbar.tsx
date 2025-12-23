import Link from 'next/link';

export default function Navbar() {
  const leagues = [
    { name: 'Premier League', href: '/competitions/PL' },
    { name: 'La Liga', href: '/competitions/PD' },
    { name: 'Bundesliga', href: '/competitions/BL1' },
    { name: 'Serie A', href: '/competitions/SA' },
    { name: 'Ligue 1', href: '/competitions/FL1' },
    { name: 'Champions League', href: '/competitions/CL' },
  ];

  return (
    <nav className="bg-emerald-900 border-b border-emerald-800 text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between h-auto md:h-14 py-2 md:py-0 gap-2">
          {/* Logo */}
          <Link href="/" className="font-bold text-xl tracking-tight flex items-center gap-2 hover:text-emerald-200 transition shrink-0">
            ⚽ TodaysMatch
          </Link>

          {/* Scrolling Navigation Links */}
          <div className="w-full overflow-x-auto no-scrollbar">
            <div className="flex space-x-1 sm:space-x-2 md:justify-end px-1 pb-1 md:pb-0">
              <Link href="/" className="px-3 py-1.5 rounded-md text-sm font-medium bg-emerald-800/50 hover:bg-emerald-800 transition whitespace-nowrap">
                Live Scores
              </Link>
              {leagues.map((league) => (
                <Link 
                  key={league.href} 
                  href={league.href} 
                  className="px-3 py-1.5 rounded-md text-sm font-medium hover:bg-emerald-800 transition whitespace-nowrap"
                >
                  {league.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}