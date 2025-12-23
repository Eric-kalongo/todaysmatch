import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://todaysmatch.org';
  
  // These are the 12 leagues supported by the free API
  const leagues = ['PL', 'PD', 'BL1', 'SA', 'FL1', 'ELC', 'PPL', 'DED', 'BSA', 'CL', 'EC', 'WC'];

  // Generate a URL for each league
  const leagueUrls = leagues.map(code => ({
    url: `${baseUrl}/competitions/${code}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));
  
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'always', // Homepage changes every minute (Live Scores)
      priority: 1.0,
    },
    ...leagueUrls
  ];
}