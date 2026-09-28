import 'server-only';
import { query,scopedQuery } from './database';
import { unseal } from './encryption';
export async function readShare(id:string) {
  if(!/^[A-Za-z0-9_-]{43}$/.test(id))return null;
  const [index]=await query('SELECT user_id FROM app_browser_share_index WHERE id=?',[id]);if(!index)return null;
  const owner=String(index.user_id),[record]=await scopedQuery(owner,'SELECT payload FROM app_browser_shares WHERE id=? AND user_id=? AND expires_at>?',[id,owner,Date.now()]);
  return record?JSON.parse(unseal(String(record.payload),`share:${owner}:${id}`)):null;
}
