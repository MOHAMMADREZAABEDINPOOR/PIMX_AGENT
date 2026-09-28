import Link from 'next/link';
import {SiteFrame} from '@/components/site/SiteFrame';
import {localizedMetadata,getLocale} from '@/lib/i18n/server';
import {localizedHref} from '@/lib/i18n/text';
export const generateMetadata=()=>localizedMetadata(['Thanks for your message',"از پیام شما ممنونیم"],['Your message has been received.',"پیام شما دریافت شد."],'/thank-you',true);
export default async function Thanks(){const locale=await getLocale(),fa=locale==='fa';return <SiteFrame><section className="prose-page"><div className="thanks-symbol">?</div><h1>{fa?"از پیام شما ممنونیم.":'Thank you for your message.'}</h1><p>{fa?"پیام شما در صندوق داخلی ثبت شد.":'Your message has been saved in our internal inbox.'}</p><Link className="site-button" href={localizedHref('/',locale)}>{fa?"بازگشت به خانه":'Back to home'}</Link></section></SiteFrame>;}
