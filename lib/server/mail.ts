import 'server-only';
import nodemailer from 'nodemailer';
import { escapeHtml } from '@/lib/html';
import { appOrigin, localDeployment } from './config';
import { HttpError } from './errors';

type Locale = 'en' | 'fa';
type MailKind = 'welcome' | 'reset' | 'changed';
export function mailConfigured() { return !!process.env.SMTP_PASS && !!process.env.SMTP_USER; }
export function mailTemplate(kind: MailKind, locale: Locale, name: string, link?: string) {
  const fa = locale === 'fa';
  const copy = {
    welcome: { title: fa ? 'به PIMX Agent خوش آمدید' : 'Welcome to your next great idea.', text: fa ? 'فضای کاری شما آماده است. تحقیق کنید، بسازید و ایده‌هایتان را به نتیجه برسانید.' : 'Your workspace is ready. Research deeply, create freely and turn your ideas into something real.', button: fa ? 'باز کردن فضای کاری' : 'Open my workspace' },
    reset: { title: fa ? 'گذرواژه‌تان را دوباره بسازید' : 'A fresh start for your password.', text: fa ? 'برای تعیین گذرواژهٔ جدید از دکمهٔ زیر استفاده کنید. این لینک فقط یک بار قابل استفاده است و تا ۳۰ دقیقه اعتبار دارد. اگر این درخواست از شما نیست، این پیام را نادیده بگیرید.' : 'Use the button below to choose a new password. This link works once and expires in 30 minutes. If you did not request it, you can safely ignore this email.', button: fa ? 'تعیین گذرواژهٔ جدید' : 'Reset my password' },
    changed: { title: fa ? 'گذرواژهٔ شما تغییر کرد' : 'Your password has been updated.', text: fa ? 'نشست‌های قبلی بسته شدند. اگر این تغییر از شما نبود، فوراً گذرواژهٔ حساب را بازیابی کنید.' : 'Previous sessions have been signed out. If this was not you, reset your account password immediately.', button: fa ? 'بررسی امنیت حساب' : 'Review account security' },
  }[kind];
  const destination = link || `${appOrigin()}${fa ? '/fa' : ''}/`;
  const html = `<!doctype html><html lang="${locale}" dir="${fa ? 'rtl' : 'ltr'}"><body style="margin:0;background:#f0edf9;font-family:Arial,sans-serif;color:#17132b"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:42px 16px"><table role="presentation" width="560" cellspacing="0" cellpadding="0" style="max-width:100%;background:#ffffff;border-radius:24px;overflow:hidden"><tr><td style="padding:32px 36px;background:#151027;color:#e7e0ff"><span style="font-size:20px;font-weight:800;letter-spacing:2px">✦ PIMX AGENT</span><p style="color:#c2b4ff;font-size:12px;letter-spacing:2px">IDEAS. IN MOTION.</p></td></tr><tr><td style="padding:38px 36px"><p style="font-size:14px;color:#74678f">${fa ? 'سلام' : 'Hello'} ${escapeHtml(name)},</p><h1 style="font-size:30px;line-height:1.3;margin:16px 0;color:#201638">${copy.title}</h1><p style="font-size:16px;line-height:1.9;color:#615972">${copy.text}</p><p style="margin:30px 0"><a href="${escapeHtml(destination)}" style="display:inline-block;padding:16px 25px;background:#7451eb;color:#ffffff;text-decoration:none;border-radius:12px;font-size:15px;font-weight:bold">${copy.button} ↗</a></p><p style="font-size:12px;line-height:1.8;color:#827991">${fa ? 'اگر دکمه باز نشد، این لینک را در مرورگر کپی کنید:' : 'If the button does not open, copy this link into your browser:'}<br/><a style="color:#7451eb;word-break:break-all" href="${escapeHtml(destination)}">${escapeHtml(destination)}</a></p></td></tr><tr><td style="padding:22px 36px;border-top:1px solid #eee8fa;color:#827991;font-size:12px">PIMX Agent · <a href="mailto:pimxagent@gmail.com" style="color:#7451eb">pimxagent@gmail.com</a><p>${fa ? 'چت‌های خصوصی شما روی دستگاه خودتان می‌مانند.' : 'Your private chats stay on your own device.'}</p></td></tr></table></td></tr></table></body></html>`;
  return { subject: copy.title, html, text: `${fa ? 'سلام' : 'Hello'} ${name},\n\n${copy.title}\n${copy.text}\n\n${destination}\n\nPIMX Agent\npimxagent@gmail.com` };
}
export async function sendAccountEmail(to: string, kind: MailKind, locale: Locale, name: string, link?: string) {
  if (!mailConfigured()) throw new HttpError(503, 'Email delivery is not configured yet. Please contact support.', 'MAIL_NOT_CONFIGURED');
  const port = Number(process.env.SMTP_PORT || 465), secure = port === 465;
  const transport = nodemailer.createTransport({ host: process.env.SMTP_HOST || 'smtp.gmail.com', port, secure, requireTLS: !secure && !(localDeployment() && process.env.SMTP_ALLOW_LOCAL === 'true'), auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASS! }, connectionTimeout: 12000, greetingTimeout: 10000, socketTimeout: 20000, tls: { rejectUnauthorized: true, minVersion: 'TLSv1.2' } });
  try { await transport.sendMail({ from: { name: 'PIMX Agent', address: process.env.SMTP_USER! }, to, replyTo: 'pimxagent@gmail.com', ...mailTemplate(kind,locale,name,link) }); }
  catch { throw new HttpError(502, 'The email could not be delivered. Please try again shortly.', 'MAIL_DELIVERY_FAILED'); }
  finally { transport.close(); }
}
