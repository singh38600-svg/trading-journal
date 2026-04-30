# Skill: /ugc-hot-girl

Generate photorealistic UGC character image prompts for NanoBanana 2 or Soul 2.0.

## When invoked

When the user runs `/ugc-hot-girl`, generate a batch of 5–10 detailed image prompts for photorealistic female UGC characters.

## Output Format

For each character, output a numbered prompt block:

```
## Character [N]: [Name/Type]

**Prompt:**
[Full prompt text, 3–5 lines, production-ready]

**Keyword:** [hyphenated-keyword for file naming]
**Model:** NanoBanana 2
**Settings:** 9:16, 8 images, 2K Unlimited ON
```

## Prompt Structure (follow for every character)

Each prompt must include:
1. **Subject**: age range, ethnicity, body type, hair description
2. **Expression**: natural, authentic, relatable (not model-stiff)
3. **Outfit**: specific garment, color, fit — match the product niche
4. **Setting**: interior/exterior location with lighting details
5. **Camera style**: iPhone selfie aesthetic, vlog-style, or lifestyle candid
6. **Mood/vibe**: energetic, cozy, confident, curious

## Character Types to Generate

Cover a variety of niches:
- Fitness/wellness girl (activewear, gym or outdoor)
- Beauty/skincare girl (bathroom or vanity setting)
- Fashion girl (urban street, coffee shop, boutique)
- Lifestyle/mom (home kitchen, living room, park)
- Tech/productivity girl (desk setup, co-working space)
- Travel girl (airport, hotel room, city street)
- Food/health girl (farmers market, kitchen, cafe)

## Example Output

```
## Character 1: Fitness Creator

**Prompt:**
25-year-old woman with long dark hair in a high ponytail, athletic build,
wearing a fitted coral-colored sports bra and matching high-waist leggings.
Standing in a bright modern gym with large windows and soft morning light.
Natural glowing skin, confident smile, holding a water bottle casually.
Vlog-style iPhone camera angle, slightly tilted, authentic UGC aesthetic.

**Keyword:** fitness-creator
**Model:** NanoBanana 2
**Settings:** 9:16, 8 images, 2K Unlimited ON
```

## After Generating Prompts

Ask the user:
> "Ready to run these through NanoBanana 2? Say 'go' and I'll open Higgsfield and generate all [N] characters following the workflow in CLAUDE.md."

If user says go, proceed with `/higgsfield-image-auto` workflow using the prompts just generated.
