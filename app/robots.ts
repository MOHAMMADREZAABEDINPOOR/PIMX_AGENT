import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/site';
export default function robots():MetadataRoute.Robots{return {rules:{userAgent:'*',allow:'/',disallow:['/api/','/chat/','/share/','/account','/admin','/login','/signup','/thank-you']},sitemap:new URL('/sitemap.xml',siteUrl).href};}
