# Higgsfield Automation Workflow

## Tools & Models

### Image Generation
- **Primary Model**: NanoBanana 2
- **URL**: https://higgsfield.ai/image/nano-banana-2
- **Alternate**: Soul 2.0 — https://higgsfield.ai/image/soul-v2

### Video Generation
- **Model**: Seedance 2.0
- **URL**: https://higgsfield.ai/create/video?model=seedance_2_0

---

## Default Image Settings

| Setting | Value |
|---------|-------|
| Aspect Ratio | 9:16 |
| Image Count | 8 |
| Quality | 2K Unlimited ON |
| Extra Free Gens | OFF |

## Default Video Settings

| Setting | Value |
|---------|-------|
| Model | Seedance 2.0 Fast |
| Aspect Ratio | 9:16 |
| Duration | 8s |
| Resolution | 720p |
| Reference Image | OFF (unless specified per-prompt) |

---

## CRITICAL: Prompt Bar Clearing

**This is the single most important rule. Never skip it. Never assume the bar is empty.**

### Image Page Clear — NanoBanana 2 / Soul 2.0

Run via Playwright `evaluate`:

```javascript
const input = document.querySelector('[id="hf:tour-image-prompt"]');
if (input) {
  input.value = '';
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
} else {
  const editor = document.querySelector('[contenteditable="true"]');
  if (editor) {
    editor.innerHTML = '<p><br></p>';
    editor.dispatchEvent(new Event('input', { bubbles: true }));
  }
}
```

### Video Page Clear — Seedance 2.0 (Lexical Editor)

The video page uses a **Lexical rich text editor** (`[data-lexical-editor]`).
`innerHTML` and `.value` DO NOT WORK on this editor. Use the keyboard method only:

```javascript
// Step 1: Focus the editor
const editor = document.querySelector('[data-lexical-editor]');
if (editor) { editor.focus(); }
```

Then immediately execute via Playwright keyboard:
1. `Ctrl+A` — select all
2. `Backspace` — delete everything

Then screenshot to confirm empty before proceeding.

**Never use innerHTML on the Lexical editor — it corrupts editor state.**

---

## Image Generation Workflow

For each prompt in the batch:

1. Navigate to `https://higgsfield.ai/image/nano-banana-2`
2. Confirm settings: 9:16 ratio, 8 images, 2K Unlimited ON
3. **[CLEAR]** Run image page JS clear snippet
4. **[VERIFY]** Screenshot — confirm bar is visually empty
5. If not empty: clear again, wait 500ms, re-screenshot (max 3 attempts before logging CLEAR_FAILED)
6. Type prompt into field
7. Click Generate button
8. **[CLEAR AGAIN]** Immediately run JS clear after clicking Generate
9. Poll every 5 seconds for loading indicators to disappear
10. Once images appear: screenshot, record completion
11. Save outputs to `images/YYYY-MM-DD/`
12. Rename files: `[keyword]-01.png`, `[keyword]-02.png`, etc.
13. **[LOG]** Append entry to `logs/YYYY-MM-DD-batch.log`
14. **[UPDATE]** Mark prompt as `Generated` in SESSION-RESUME.md
15. Wait 3 seconds, proceed to next prompt

---

## Video Generation Workflow

For each prompt in the batch:

1. Navigate to `https://higgsfield.ai/create/video?model=seedance_2_0`
2. Confirm settings: Seedance 2.0 Fast, 9:16, 8s, 720p
3. **[REFERENCE IMAGE — if needed]**:
   - Click upload button on video page
   - Switch to **"Image Generations"** tab (do not download and re-upload)
   - Select image — verify green checkmark appears
   - Press Escape to load image into form
   - Reference as `@image1` in prompt text
4. **[CLEAR]** Run video page Lexical clear (keyboard method)
5. **[VERIFY]** Screenshot — confirm bar is empty
6. If not empty: repeat keyboard clear (max 3 attempts)
7. Type prompt using `slowly: true` — Lexical editor requires keypress events
8. Click Generate button
9. **[CLEAR AGAIN]** Immediately run keyboard clear
10. **[POLL]** Every 15 seconds check for download button
11. When download button appears: click it, verify file saves to `videos/YYYY-MM-DD/`
12. Rename file: `[keyword]-01.mp4`
13. **[LOG]** Append entry to `logs/YYYY-MM-DD-batch.log`
14. **[UPDATE]** Mark as `Generated` in SESSION-RESUME.md
15. Do NOT start next prompt until current video is fully downloaded
16. Wait 3 seconds, proceed to next prompt

---

## Video Timeout Handling

Expected generation time: 60–180 seconds.

If no download button appears after **180 seconds (12 polls × 15s)**:
1. Screenshot current state
2. Refresh the page
3. Navigate to the History tab
4. Look for the recently generated video
5. Download from History if found → rename → log `TIMEOUT — recovered from history`
6. If not in History: log `TIMEOUT — not found` → mark `FAILED — retry` in SESSION-RESUME.md

---

## Retry Logic

When a generation fails:
1. Log failure: timestamp, prompt, error observed
2. Wait 10 seconds
3. Retry same prompt from step 1
4. Maximum **3 retries per prompt**
5. After 3 failures: log `FAILED — manual check needed`, mark in SESSION-RESUME.md, move to next prompt
6. Never block the batch for a single failed prompt beyond 3 retries

---

## Image-to-Video (No Download Required)

When a generated image becomes the first frame of a video:

1. Complete image generation on NanoBanana 2 (normal workflow)
2. Navigate to Seedance 2.0 URL
3. Click upload area on video page
4. In the dialog: click **"Image Generations"** tab
5. Most recent image appears first — click to select
6. Green checkmark visible → press Escape
7. Image is now loaded into the video form
8. In prompt text, reference it as: `@image1`

Never download and re-upload an image. Use the internal tab.

---

## Output Organization

```
images/
└── YYYY-MM-DD/
    ├── [keyword]-01.png
    ├── [keyword]-02.png
    └── ...
videos/
└── YYYY-MM-DD/
    ├── [keyword]-01.mp4
    └── ...
reference/
    └── [character-name].png     ← reference images for image-to-video
logs/
    └── YYYY-MM-DD-batch.log
```

Keyword = first 2–3 meaningful words from the prompt, hyphenated.
Example: "beautiful woman walking on beach" → `woman-beach-01.mp4`

Rename every file immediately after saving, before moving to the next prompt.

---

## Logging Format

After each generation, append to `logs/YYYY-MM-DD-batch.log`:

```
[HH:MM:SS] | TYPE: image | MODEL: NanoBanana2 | STATUS: Generated | RETRIES: 0 | FILE: woman-beach-01.png | PROMPT: beautiful woman walking on beach...
[HH:MM:SS] | TYPE: video | MODEL: Seedance2.0 | STATUS: Generated | RETRIES: 1 | FILE: rooftop-scene-01.mp4 | PROMPT: cinematic rooftop shot at golden hour...
[HH:MM:SS] | TYPE: video | MODEL: Seedance2.0 | STATUS: FAILED-manual | RETRIES: 3 | FILE: none | PROMPT: ...
```

---

## Session Crash Recovery

If Claude crashes mid-batch:
1. Reopen Claude Code in this project folder
2. Say: **"Read SESSION-RESUME.md and continue from where we left off."**
3. Claude will read the file, identify the last `Pending` prompt, and resume from there

Always update SESSION-RESUME.md after each prompt completes.

---

## Hard Rules — Never Break These

1. Always clear the prompt bar via JS/keyboard before typing. Zero exceptions.
2. Always screenshot after clearing to confirm visually empty.
3. Use the **image selector** on image pages, **keyboard method** on video pages.
4. Always use `slowly: true` when typing into the Seedance 2.0 video prompt field.
5. Never start the next video generation until the current file is fully downloaded.
6. Never skip settings confirmation at the start of a batch.
7. Update SESSION-RESUME.md after every single prompt completes or fails.
8. Log every generation result to BATCH-LOG.
9. Verify the model name in the UI before generating (not just the URL).
10. Never exceed 3 retries on a prompt without logging and moving on.
