# Gmail account emails

Welcome, password recovery and password-change emails use the styled English/Persian templates in `lib/server/mail.ts`. The public contact address is `pimxagent@gmail.com`.

1. Sign in to that Google account and enable [2-Step Verification](https://myaccount.google.com/security).
2. Open [App passwords](https://myaccount.google.com/apppasswords), create one named **PIMX Agent**, and keep the generated value private. Google requires two-step verification for App passwords; some account policies can make the option unavailable. [Google's guide](https://support.google.com/accounts/answer/185833).
3. In **Cloudflare → Workers & Pages → pimxagent → Settings → Variables and Secrets**, set the following for Production. Set `SMTP_PASS` as **encrypted**, not plain text.

| Variable | Value |
| --- | --- |
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `465` |
| `SMTP_USER` | `pimxagent@gmail.com` |
| `SMTP_PASS` | The generated App Password, without spaces |

Port 465 uses implicit TLS. Port 587 is also supported by this application's STARTTLS configuration. Ordinary Google account passwords are not suitable for this integration. [Google SMTP settings](https://support.google.com/a/answer/176600).

4. Retry the latest Cloudflare deployment so the new secret reaches the runtime. Test **Forgot password** using an existing account and check both inbox and spam. Never add the password to GitHub or client-side `NEXT_PUBLIC_` variables.

Local browser tests use a local SMTP fixture and verify the actual reset link, single-use expiry behavior and Persian email markup. They do not establish Gmail delivery. Until `SMTP_PASS` is configured, registration still creates an account and honestly reports that its welcome email is pending; password recovery reports that email delivery is unavailable.
