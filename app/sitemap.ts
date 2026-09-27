import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/site';
export default function sitemap():MetadataRoute.Sitemap{return ['','/privacy','/terms','/contact'].flatMap(path=>['en','fa'].map(locale=>({url:new URL((locale==='fa'?'/fa':'')+(path||'/'),siteUrl).href,alternates:{languages:{en:new URL(path||'/',siteUrl).href,fa:new URL('/fa'+(path||'/'),siteUrl).href}},lastModified:new Date('2026-09-27'),changeFrequency:'monthly' as const,priority:path?0.5:1})));}
