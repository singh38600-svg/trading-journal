# Skill: /seedance-auto-generate

Automate a full Seedance 2.0 video generation batch using Playwright MCP.

## When invoked

When the user runs `/seedance-auto-generate`, ask for:
1. A list of video prompts (or use prompts from prior skill output)
2. Whether any prompts use reference images (from history or from /reference/)
3. Settings overrides (default: 9:16, 8s, 720p, Seedance 2.0 Fast)

Then run the full automated batch.

## Pre-Batch Checklist

Before starting, confirm aloud:
- Model: Seedance 2.0 Fast
- URL: https://higgsfield.ai/create/video?model=seedance_2_0
- Aspect ratio: 9:16
- Duration: 8s
- Resolution: 720p
- Reference image: OFF (unless specified per-prompt)
- Output folder: videos/YYYY-MM-DD/
- SESSION-RESUME-VIDEO.md initialized with all prompts as Pending

## Per-Prompt Loop

For each video prompt in the batch, execute exactly:

### 1. Navigate & Confirm Settings
- Navigate to Seedance 2.0 URL
- Verify model name is "Seedance 2.0 Fast" in the UI (not just the URL)
- Confirm all settings match defaults

### 2. Upload Reference Image (if applicable)
For prompts with a reference image:
- Click the upload/reference area on the page
- If source is recent history: switch to **"Image Generations"** tab, select most recent image, verify green checkmark, press Escape
- If source is a file: upload from `/reference/[filename]` using absolute path
- Do NOT download and re-upload images unnecessarily
- In the prompt text, reference as `@image1`

### 3. Clear Prompt Bar (Lexical Editor — Keyboard Method)
```javascript
// Focus the Lexical editor
const editor = document.querySelector('[data-lexical-editor]');
if (editor) { editor.focus(); }
```
Then via Playwright keyboard:
1. Press `Ctrl+A`
2. Press `Backspace`

**Never use innerHTML or .value on the video prompt editor.**

### 4. Verify Empty
- Screenshot the prompt bar
- If text visible: repeat keyboard clear
- Max 3 attempts → if still not empty, log CLEAR_FAILED, skip prompt

### 5. Type Prompt
- Type using `slowly: true` — Lexical editor requires keypress events, not fill
- Include `@image1` in text if reference image was uploaded

### 6. Generate
- Click the Generate button

### 7. Immediate Post-Generate Clear
- Run keyboard clear immediately after clicking Generate (Ctrl+A → Backspace)

### 8. Poll for Download
- Poll every 15 seconds for the download button
- Expected wait: 60–180 seconds
- Timeout: 180 seconds (12 polls)

### 9. Timeout Recovery
If no download button after 180s:
1. Screenshot current state
2. Refresh page (F5)
3. Navigate to History tab
4. Check for recently completed video
5. Download from History if found → log `TIMEOUT — recovered from history`
6. If not in History: log `TIMEOUT — not found` → mark `FAILED — retry`

### 10. Download & Save
- Click download button
- Verify file appears in `videos/YYYY-MM-DD/`
- Rename: `[keyword]-01.mp4`

### 11. Log & Update
- Append to `logs/YYYY-MM-DD-batch.log`:
  ```
  [HH:MM:SS] | TYPE: video | MODEL: Seedance2.0 | STATUS: Generated | RETRIES: 0 | FILE: [keyword]-01.mp4 | PROMPT: [first 80 chars]
  ```
- Update SESSION-RESUME-VIDEO.md: mark as `Generated`

### 12. Next Prompt
- **Do NOT proceed until current video is fully downloaded**
- Wait 3 seconds
- Proceed to next prompt

## Retry Logic

On generation failure:
- Wait 10s
- Retry from step 1
- Max 3 retries per prompt
- After 3 failures: log `FAILED — manual check needed`, move to next prompt

## Seedance 2.0 Input Limits

| Type | Max Files | Max Size |
|------|-----------|----------|
| Images | 9 | 30MB each |
| Videos | 3 | 50MB each |
| Audio | 3 | 15MB each |
| **Total** | **12** | — |

Reference syntax: `@image1`, `@image2`, `@video1`, `@audio1`

## Post-Batch Summary

After all prompts complete, output:
```
Video batch complete.
Generated: [N] / [total]
Failed: [N]
Recovered from history: [N]
Files saved to: videos/YYYY-MM-DD/
Log: logs/YYYY-MM-DD-batch.log
```
