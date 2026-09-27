import 'server-only';
import { cookies, headers } from 'next/headers';
import { translate, type Locale } from './text';
import { pageMetadata } from '@/lib/site';
export async function getLocale(): Promise<Locale> { return (await headers()).get('x-pimx-locale') === 'fa' || (await cookies()).get('pimx_locale')?.value === 'fa' ? 'fa' : 'en'; }
export async function getServerT() { const locale = await getLocale(); return (source: string, ...values: (string | number)[]) => translate(source,locale,...values); }
export async function localizedMetadata(title: [string,string], description: [string,string], path: string, privatePage = false) { const locale = await getLocale(), index = locale === 'fa' ? 1 : 0; return pageMetadata(title[index],description[index],(locale === 'fa'?'/fa':'') + path,privatePage,locale); }
