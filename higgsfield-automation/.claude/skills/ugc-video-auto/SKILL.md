# Skill: /ugc-video-auto

Full end-to-end UGC pipeline: generate character image on NanoBanana 2, then animate it into a video with Seedance 2.0 — no manual steps, no downloads between phases.

## When invoked

When the user runs `/ugc-video-auto`, ask for:
1. Character description(s) — or use output from `/ugc-hot-girl`
2. Video concept per character (what the character does in the video)
3. Product or niche (optional — used to tailor prompt style)
4. Number of characters to process

## Pipeline Overview

```
/ugc-hot-girl prompts → NanoBanana 2 image generation
         ↓
Image Generations tab (no download needed)
         ↓
Seedance 2.0 video generation with @image1 reference
         ↓
Download → rename → log → next character
```

## Phase 1: Image Generation

For each character:
1. Run full `/higgsfield-image-auto` workflow with the character prompt
2. Confirm images appear in Higgsfield image history
3. Note the keyword for this character (used in video filenames)
4. Do NOT navigate away until images are confirmed in history

## Phase 2: Image-to-Video (No Download Required)

For each character immediately after image generation:
1. Navigate to `https://higgsfield.ai/create/video?model=seedance_2_0`
2. Confirm settings: Seedance 2.0 Fast, 9:16, 8s, 720p
3. Click upload area on the video page
4. Switch to **"Image Generations"** tab
5. Select the most recent image (first item) — verify green checkmark
6. Press Escape to load into form
7. Clear video prompt bar (keyboard method: Ctrl+A → Backspace)
8. Screenshot to confirm empty
9. Type video prompt using `slowly: true` — include `@image1` in the text

## Video Prompt Structure

For each character's video prompt, include:
- **Character reference**: `@image1` (loads the generated image as first frame)
- **Action/movement**: what the character physically does
- **Setting**: matches the image setting for continuity
- **Camera movement**: slow push-in, rack focus, pan, etc.
- **Mood/lighting**: golden hour, soft studio, urban neon, etc.
- **Hook behavior**: what happens in the first 2 seconds

Example:
```
@image1 — Woman in coral activewear turns to camera with a bright smile,
lifts her water bottle in a cheers gesture, gym background with soft morning
light streaming through windows. Slow push-in on face. Authentic UGC energy.
8 seconds, 9:16, 720p.
```

## Phase 2 Continued

10. Click Generate
11. Immediately clear prompt bar (Ctrl+A → Backspace)
12. Poll every 15 seconds for download button
13. Timeout: 180s → check History tab
14. Download video → save to `videos/YYYY-MM-DD/`
15. Rename: `[character-keyword]-video-01.mp4`
16. Log and update SESSION-RESUME-VIDEO.md
17. Proceed to next character

## Output Naming Convention

| Type | Filename |
|------|----------|
| Character image | `fitness-creator-01.png` |
| Character video | `fitness-creator-video-01.mp4` |

## Post-Pipeline Summary

After all characters:
```
UGC pipeline complete.
Characters processed: [N]
Images generated: [N]
Videos generated: [N]
Failed: [N]

Image files: images/YYYY-MM-DD/
Video files: videos/YYYY-MM-DD/
Log: logs/YYYY-MM-DD-batch.log
```
