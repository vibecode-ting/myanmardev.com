# Skill: i18n Sync

## What it does
Synchronize translation files when new UI strings are added.

## When to use
- After adding new components with user-visible strings
- Before deploying to ensure Burmese translations are complete

## Instructions
1. Run `grep -r "t(" src/ --include="*.tsx" --include="*.astro"` to find all translation key usage
2. Compare used keys against `en.json` and `my.json`
3. Identify missing keys in either file
4. For missing Burmese translations, show the English text and prompt for translation
5. Verify no hardcoded user-visible strings exist outside the i18n system
