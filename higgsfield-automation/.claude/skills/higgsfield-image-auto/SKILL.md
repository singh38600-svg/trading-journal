# Skill: /higgsfield-image-auto

Automate a full NanoBanana 2 image generation batch using Playwright MCP.

## When invoked

When the user runs `/higgsfield-image-auto`, ask for:
1. A list of prompts (or confirm prompts from prior skill output)
2. Any settings overrides (default: 9:16, 8 images, 2K Unlimited ON)

Then run the full automated batch.

## Pre-Batch Checklist

Before starting, confirm aloud:
- Model: NanoBanana 2 (URL: https://higgsfield.ai/image/nano-banana-2)
- Aspect ratio: 9:16
- Image count: 8
- 2K Unlimited: ON
- Extra free gens: OFF
- Output folder: images/YYYY-MM-DD/
- SESSION-RESUME.md is initialized with all prompts marked Pending

## Per-Prompt Loop

For each prompt in the batch, execute exactly:

### 1. Clear Prompt Bar
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

### 2. Verify Empty
- Screenshot the prompt bar area
- If text is still visible: repeat clear, wait 500ms, re-screenshot
- Max 3 clear attempts → if still not empty, log CLEAR_FAILED and skip prompt

### 3. Type Prompt
- Type the full prompt text into the input field

### 4. Generate
- Click the Generate button

### 5. Immediate Post-Generate Clear
- Run JS clear snippet again immediately after clicking Generate

### 6. Wait for Completion
- Poll every 5 seconds for loading indicators to disappear
- Timeout: 60 seconds (images generate fast)
- If timeout: log TIMEOUT, retry once, then mark FAILED if still stuck

### 7. Save & Rename
- Screenshot completed images
- Save to `images/YYYY-MM-DD/`
- Rename: `[keyword]-01.png` through `[keyword]-08.png`

### 8. Log & Update
- Append to `logs/YYYY-MM-DD-batch.log`:
  ```
  [HH:MM:SS] | TYPE: image | MODEL: NanoBanana2 | STATUS: Generated | RETRIES: 0 | FILE: [keyword]-01.png | PROMPT: [first 80 chars]
  ```
- Update SESSION-RESUME.md: mark prompt as `Generated`

### 9. Next Prompt
- Wait 3 seconds
- Proceed to next prompt in batch

## Retry Logic

On generation failure:
- Wait 10s
- Retry from step 1
- Max 3 retries per prompt
- After 3 failures: log `FAILED — manual check needed`, move to next prompt

## Post-Batch Summary

After all prompts complete, output:
```
Batch complete.
Generated: [N] / [total]
Failed: [N]
Files saved to: images/YYYY-MM-DD/
Log: logs/YYYY-MM-DD-batch.log
```
