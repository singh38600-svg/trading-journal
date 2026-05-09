# Step-by-Step Deployment Guide
## NIFTY Option Chain Intelligence System
### For Singh — No technical knowledge required

---

## What you will get at the end

A live website (something like `https://nifty-signals.web.app`) that shows:
- Real-time NIFTY option chain with heatmap
- Smart Money Index, PCR, Bias, Trap detection
- Telegram alerts on your phone
- Works every market day — you just log in to Fyers once each morning

**Total time: ~25 minutes (most of it is automatic)**

---

## PART 1 — Create Google Cloud Account & Project
### (~5 minutes, one-time only)

---

### Step 1 — Open Google Cloud Console

1. Open your browser
2. Go to: **console.cloud.google.com**
3. Sign in with your Gmail: **singh38600@gmail.com**

---

### Step 2 — Create a new project

1. At the top of the page, click the **project dropdown** (it says something like "My Project" or "Select a project")
2. Click **"NEW PROJECT"** button (top right of the popup)
3. Fill in:
   - **Project name:** `nifty-signals`
   - Leave everything else as-is
4. Click **CREATE**
5. Wait ~30 seconds, then click the notification bell → click **"SELECT PROJECT"** next to nifty-signals

✅ You should now see **"nifty-signals"** in the top bar.

---

### Step 3 — Enable Billing

> Google Cloud Run has a **free tier** (2 million requests/month free).
> You need a billing account linked but you won't be charged for normal usage.

1. In the left menu, click **"Billing"**
2. Click **"LINK A BILLING ACCOUNT"**
3. If you don't have one, click **"CREATE BILLING ACCOUNT"**
   - Add your credit/debit card
   - Google gives **$300 free credit** for new accounts
4. Link it to the `nifty-signals` project

✅ Billing is now set up.

---

## PART 2 — Open Cloud Shell (Browser Terminal)
### (~1 minute)

---

### Step 4 — Open Cloud Shell

1. Look at the **top right** of the Google Cloud Console page
2. Click the **terminal icon** (looks like `>_`)
3. A black terminal window opens at the bottom of your screen
4. Wait for it to say **"Welcome to Cloud Shell"**

> **What is Cloud Shell?**
> It's a free computer that Google gives you inside your browser.
> You don't need to install anything on your laptop.
> All commands run on Google's servers.

---

## PART 3 — Download the Code & Deploy
### (~15 minutes, mostly automatic)

---

### Step 5 — Download the code

Copy this command **exactly** and paste it into the Cloud Shell terminal, then press **Enter**:

```
git clone -b claude/nifty-signals https://github.com/singh38600-svg/trading-journal nifty-signals && cd nifty-signals
```

You should see files being downloaded. Wait for it to finish.

---

### Step 6 — Run the setup script

This one command does everything:
- Enables Google Cloud services
- Creates the database
- Builds and deploys the backend
- Builds and deploys the frontend website

```
chmod +x setup.sh && bash setup.sh
```

Press **Enter** and watch it run.

**During the script, it will pause twice and ask you to do something:**

---

#### Pause 1 — Firebase Login

The terminal will show a long URL. Here's what to do:

1. **Copy that URL** (starts with `https://accounts.google.com/...`)
2. Open a **new browser tab**
3. Paste the URL and press Enter
4. Sign in with **singh38600@gmail.com**
5. Click **Allow**
6. You'll see a code on the screen — **copy it**
7. Go back to Cloud Shell
8. **Paste the code** and press **Enter**

---

#### Pause 2 — Firebase Project Selection

The terminal will ask:
```
Which Firebase project do you want to associate?
```

1. Use the arrow keys to find **nifty-signals**
2. Press **Enter**

Then it will ask for an alias — just type `default` and press **Enter**.

---

### Step 7 — Wait for deployment to finish

The script runs automatically. When it's done, you'll see something like:

```
══════════════════════════════════════════════════════
   DEPLOYMENT COMPLETE!
══════════════════════════════════════════════════════

  Dashboard  : https://nifty-signals.web.app
  Backend    : https://nifty-backend-xxxx-el.a.run.app

DAILY LOGIN (every morning before 9:15 AM)
  1. Open https://nifty-signals.web.app
  2. Click the blue 'Connect Fyers' button
  ...
```

**Copy and save these two URLs — you'll use them every day.**

✅ **Deployment complete!**

---

## PART 4 — Daily Morning Login
### (Every trading day, 2 minutes)

---

### Step 8 — Connect Fyers (do this every morning before 9:15 AM)

Fyers API tokens expire at midnight every day. So each morning:

1. Open your dashboard: **https://nifty-signals.web.app**

2. Click the blue **"Connect Fyers"** button (top right)
   - A Fyers login page opens in a new tab

3. **Log in to Fyers** with your Fyers username and password

4. After login, Fyers redirects you to a URL that starts with `http://127.0.0.1/?auth_code=...`
   - The page will look blank or show an error — **that's normal**
   - Look at the URL bar at the top of the browser

5. **Copy the auth_code value** from the URL
   - The URL looks like: `http://127.0.0.1/?auth_code=eyJ0eXAiOiJKV1Qi...`
   - Copy everything after `auth_code=`

6. Go back to your dashboard tab
   - Paste the auth_code into the box
   - Click **Connect**

7. The dashboard starts loading data — you're live! ✅

---

## What you see on the dashboard

```
┌─────────────────────────────────────────────────────┐
│  NIFTY Smart Money    SPOT: ₹24,550.00    🟢 Live   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  [SMI: 72]  [PCR: 1.31]  [▲ BULLISH]  [✓ No Trap] │
│  [S: 24400] [R: 24600]               [Conf: 72]    │
│                                                     │
│  ── OPTION CHAIN HEATMAP ──────────────────────── │
│  CE OI  OI Chg  Vol  LTP  │STRIKE│  LTP  Vol  PE OI │
│  ████   +12K    ...  ...  │24500 │  ...  ...  ████  │
│  ███    -5K     ...  ...  │24550 │  ...  ...  ██    │
│                            │24600▲│ ATM         │
│                                                     │
│  [FUTURES PANEL]    [LIVE SIGNALS]                 │
│  Premium: +45       OI Spike: ⚡ 24500             │
│  Buildup: Long      Breakout: ❌                   │
│  Vol Ratio: 1.2     Session: Institutional buying  │
└─────────────────────────────────────────────────────┘
```

---

## Telegram Alerts

Your bot **@Nifty50Otionbot** will automatically send alerts to you for:

| Alert | What it means |
|---|---|
| 🚀 SMI crosses 70 | Strong bullish signal |
| 🔻 SMI drops below 30 | Strong bearish signal |
| 🔄 Bias changed | Market direction flipped |
| ⚠ Bull/Bear Trap | Don't trade in this direction |
| ⚡ OI Spike | Scalping opportunity at a strike |
| 🎯 S/R Test | Price touching key level |
| 🚀 Breakout Confirmed | Real breakout, not fake |
| 📊 Session Summary | Auto at 9:30, 12:00, 15:15 |
| 🔥 Futures Divergence | STRONGEST signal — institutions conflicting |

---

## Cost estimate

| Service | Free tier | Your estimated cost |
|---|---|---|
| Cloud Run | 2M requests/month free | **₹0** |
| Firestore | 1GB storage + 50K reads/day free | **₹0** |
| Firebase Hosting | 10GB/month free | **₹0** |
| Cloud Build | 120 min/day free | **₹0** |

**Total expected monthly cost: ₹0** (well within free tiers for personal use)

---

## If something goes wrong

**Dashboard shows "Reconnecting" (red dot)**
→ The backend may be restarting. Wait 30 seconds and refresh.

**"Not authenticated" error**
→ You need to do the daily Fyers login (Step 8 above).

**No data after connecting Fyers**
→ Check market hours — data only loads 9:15 AM to 3:30 PM weekdays.

**Telegram not sending alerts**
→ Open Telegram, find @Nifty50Otionbot, and send it `/start` first.

**Need to redeploy after code changes**
→ Open Cloud Shell again, go to the folder:
```
cd nifty-signals && bash setup.sh
```

---

## Quick reference

| Thing | Value |
|---|---|
| Dashboard URL | https://nifty-signals.web.app |
| Gmail | singh38600@gmail.com |
| GCP Project | nifty-signals |
| Telegram bot | @Nifty50Otionbot |
| Fyers App ID | I3BFKK1F13-100 |
| Refresh interval | Every 60 seconds during market hours |
