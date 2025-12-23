import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://todaysmatch.org',
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 1,
    },
  ];
}