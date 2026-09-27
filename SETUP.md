# Resume OTP Download – Setup Guide (Free Stack)

This portfolio gates **resume download** behind email OTP. The rest of the site stays public.

**Required free accounts:** [Vercel](https://vercel.com), [Resend](https://resend.com), [Upstash](https://upstash.com)

> GitHub Pages cannot run this feature. Deploy on **Vercel** so `/api/*` works.

---

## 1. Create Upstash Redis (free)

1. Sign up at [upstash.com](https://upstash.com)
2. Create a Redis database (region closest to you)
3. Open the database → **REST API**
4. Copy:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

## 2. Create Resend (free)

1. Sign up at [resend.com](https://resend.com)
2. Create an API key → copy as `RESEND_API_KEY`
3. **Important:** With the default sender `onboarding@resend.dev`, Resend only delivers to **your signup email**.
4. To send OTPs to visitors, **verify a domain** (free) in Resend → Domains, then set:
   - `FROM_EMAIL=Portfolio <noreply@yourdomain.com>`

Until a domain is verified, you can still test the flow by requesting OTP with **your own Resend account email**.

## 3. Deploy on Vercel (free)

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import GitHub repo: `Jitheswaran/MyPortfolio`
3. Framework preset: **Other** (static + serverless)
4. Add these **Environment Variables**:

| Name | Example / notes |
|------|-----------------|
| `RESEND_API_KEY` | from Resend |
| `UPSTASH_REDIS_REST_URL` | from Upstash |
| `UPSTASH_REDIS_REST_TOKEN` | from Upstash |
| `DOWNLOAD_TOKEN_SECRET` | any long random string (e.g. password generator, 32+ chars) |
| `OWNER_EMAIL` | `jitheswaran2091999@gmail.com` (where download alerts go) |
| `FROM_EMAIL` | optional until domain verified; e.g. `Portfolio <noreply@yourdomain.com>` |

5. Deploy

After deploy, use your Vercel URL (e.g. `https://myportfolio-xxx.vercel.app`) as the live site for OTP download.

## 4. How the flow works

1. Visitor clicks **Resume** / **Download Resume**
2. Enters first name, last name, email, company, role
3. Receives 6-digit OTP by email (valid 10 minutes)
4. Enters OTP → you get an email with their details → PDF downloads via a short-lived signed link

The PDF lives in `private/` and is **not** publicly listed; it is only served from `/api/download-resume` after OTP verification.

## 5. Local testing (optional)

```bash
npm install
npx vercel dev
```

Add a local `.env` with the same variables (never commit `.env`).

## 6. GitHub Pages note

Your old GitHub Pages site can stay online, but **OTP resume download only works on the Vercel deployment**. Prefer linking people to the Vercel URL, or later point a custom domain to Vercel.
