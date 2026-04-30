# Complete Setup Guide — Higgsfield + Claude Code Automation

Zero to first generation in under 30 minutes.

---

## What You're Building

Claude Code (in your terminal) + Playwright MCP (gives Claude a real browser) → opens Higgsfield, configures settings, types prompts, generates images/videos, downloads and organizes files — all without you touching the keyboard.

---

## Requirements Checklist

- [ ] Mac or Windows PC
- [ ] VS Code or Cursor installed
- [ ] Google Chrome installed
- [ ] A Higgsfield account (https://higgsfield.ai)
- [ ] Node.js (we install this below)

---

## Step 1: Install Node.js

### Mac

```bash
# Install Homebrew (Mac package manager) if you don't have it
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node

# Verify
node --version
npm --version
```

### Windows

Download the LTS installer from https://nodejs.org and run it. Restart your terminal after.

```cmd
node --version
npm --version
```

Both should print version numbers. If either fails, restart your terminal.

---

## Step 2: Install Claude Code

```bash
npm install -g @anthropic-ai/claude-code
```

Start it once to authenticate:

```bash
claude
```

Follow the prompts. You'll need an Anthropic account and API key.

---

## Step 3: Install Playwright MCP

This is the critical piece. Without it, Claude cannot control the browser.

```bash
claude mcp add playwright npx '@playwright/mcp@latest'
```

You should see:
```
Added stdio MCP server playwright with command: npx @playwright/mcp@latest to local config
```

**Restart Claude** after installing:

```bash
exit
claude
```

Verify it's active:

```bash
/mcp
```

You should see `playwright` listed. If it's missing, re-run the install command and restart.

**Why a separate browser window?**
Playwright opens its own controlled browser, not your personal Chrome. This is normal and expected.

---

## Step 4: Set Up Your Project Folder

Copy this entire `higgsfield-automation/` folder to wherever you want to work from.

Your folder structure should look like:

```
higgsfield-automation/
├── CLAUDE.md                  ← Claude reads this automatically
├── SESSION-RESUME.md          ← Track image batch progress
├── SESSION-RESUME-VIDEO.md    ← Track video batch progress
├── SETUP-GUIDE.md             ← This file
├── VIRAL-CONTENT-IDEAS.md     ← 10 ready-to-use content ideas
├── BATCH-LOG.md               ← Generation log template
├── images/                    ← Generated images saved here
├── videos/                    ← Generated videos saved here
├── reference/                 ← Reference images for image-to-video
├── logs/                      ← Automated batch logs
└── .claude/
    └── skills/
        ├── ugc-hot-girl/      ← /ugc-hot-girl skill
        ├── higgsfield-image-auto/  ← /higgsfield-image-auto skill
        ├── seedance-auto-generate/ ← /seedance-auto-generate skill
        └── ugc-video-auto/    ← /ugc-video-auto skill
```

---

## Step 5: Open Claude Code in Your Project

```bash
# Navigate to your project folder
cd path/to/higgsfield-automation

# Start Claude Code
claude
```

Claude will automatically read `CLAUDE.md` at the start of every session.

---

## Step 6: Run Your First Batch

### Image batch:
```
Generate a batch of 5 UGC characters using NanoBanana 2.
9:16 aspect ratio, 8 images per prompt, 2K unlimited ON.
Follow the workflow in CLAUDE.md exactly.
```

### Video batch:
```
Generate a batch of 3 videos using Seedance 2.0.
9:16 aspect ratio, 8 seconds, 720p resolution.
Follow the video workflow in CLAUDE.md exactly.
Save all outputs to /videos/YYYY-MM-DD/.
```

### Use a skill:
```
/ugc-hot-girl
```
Claude will generate detailed UGC character image prompts for you.

```
/seedance-auto-generate
```
Claude will run a full Seedance 2.0 video generation batch.

---

## Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| `/mcp` doesn't show playwright | Re-run `claude mcp add playwright npx '@playwright/mcp@latest'` and restart |
| Claude opens a new browser window | Normal — Playwright uses its own controlled browser |
| Prompt bar not clearing | JS clear must be in CLAUDE.md. Check you're using the right selector for the page |
| Session crashed mid-batch | Say: "Read SESSION-RESUME.md and continue from where we left off." |
| Video generation stuck | Poll every 15s. After 3 min, refresh and check History tab |
| Download doesn't save file | Click download button via Playwright, then check browser's Downloads folder |
| Wrong model selected | Add model verification step to CLAUDE.md. Check UI, not just URL |
| Lexical editor not accepting text | Use `slowly: true` flag. Do not use innerHTML on the video prompt editor |
| Reference image not uploading | Use "Image Generations" tab in upload dialog. For external files, use absolute path |
| Credit warning / confirm required | CLAUDE.md includes: "Request user confirmation before clicking Generate" |

---

## Updating CLAUDE.md

CLAUDE.md is your settings file. Edit it anytime to:
- Change default models or settings
- Add new prompt rules
- Switch between image and video workflows
- Add or remove batch rules

Claude re-reads it at the start of every session automatically.

---

## Optional: Add More Skills

Clone the community skill packs for 15+ additional prompt styles:

```bash
# AKCodez full pipeline skills (19 skills)
git clone https://github.com/AKCodez/higgsfield-claude-skills .claude/skills

# beshuaxian bilingual skills (15 skills, EN + CN)
git clone https://github.com/beshuaxian/higgsfield-seedance2-jineng skills-reference
```

Then invoke any skill by name:
```
/01-cinematic
/07-ecommerce-ad
/10-music-video
```

---

## Model URLs Reference

| Model | Use Case | URL Path |
|-------|----------|----------|
| NanoBanana 2 | Fast image gen, characters | /image/nano-banana-2 |
| NanoBanana Pro | Premium quality, text in image | /image/nano-banana-pro |
| Soul 2.0 | Photorealistic portraits | /image/soul-v2 |
| Seedance 2.0 | Video generation | /create/video?model=seedance_2_0 |

---

## Seedance 2.0 Input Limits

| Type | Max Files | Max Size | Duration |
|------|-----------|----------|---------|
| Images | 9 | 30MB each | — |
| Videos | 3 | 50MB each | 2–15s |
| Audio | 3 | 15MB each | ≤15s |
| **Total inputs** | **12** | — | — |
| **Output** | — | — | 4–15s @ 720p |

Reference files in prompts with `@image1`, `@video1`, `@audio1`.
