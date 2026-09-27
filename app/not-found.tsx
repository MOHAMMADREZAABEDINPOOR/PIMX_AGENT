import NotFoundView from '@/components/site/NotFoundView';
import {localizedMetadata} from '@/lib/i18n/server';
export const generateMetadata=()=>localizedMetadata(['404 – Page not found','۴۰۴ — صفحه پیدا نشد'],['The requested page could not be found.','صفحهٔ درخواستی پیدا نشد.'],'/404',true);
export default function NotFound(){return <NotFoundView/>;}
