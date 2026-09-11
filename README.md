# Gnam v6 · Food Operating System

Static app designed for GitHub Pages. No backend, no build step..

## What changed
- Offline ingredient vocabulary: >2,000 searchable input forms and >1,000 canonical grocery forms.
- Semantic aliases and spelling variations (e.g. `burro di arachidi`, `burro di noccioline`, `peanut butter`).
- Token-ranked autocomplete starts from the first character and keeps suggestions useful.
- Default expiry windows remain editable and are explicitly planning estimates; always trust the package label.
- Planner uses only ingredients actually present in inventory. Missing ingredients are never silently added to the real calendar.
- More resilient 14-slot planner with multiple culinary structures and fully covered fallback meals, while avoiding repeated recipe names.
- Food OS state: inventory quantities, planned consumption, cooking log, leftovers/freezer, preference feedback and cost estimation.
- Shopping score uses structural nutrition heuristics rather than pretending to provide a clinical nutrient analysis.

## GitHub Pages
1. Create a repository (e.g. `gnam`).
2. Upload the files in the repository root.
3. Settings → Pages → Deploy from a branch → `main` → `/(root)`.

## Files
- `index.html`
- `styles.css`
- `app.js`
- `recipes.js`
- `ingredients.js`

## Data / science notes
The ingredient vocabulary is an offline application dataset and is intentionally independent from brand names. For a future release, the numeric nutrition layer can be generated from USDA FoodData Central exports rather than shipping an API key in client-side code. FoodData Central publishes downloadable datasets and its API requires a key; USDA also states the data are in the public domain/CC0 terms.

Gnam's nutrition philosophy follows broad evidence-based principles from WHO, EFSA and CREA: adequacy, balance, moderation, variety; frequent fruit and vegetables; fibre-rich foods; varied protein sources; preference for unsaturated fats; and realistic meal planning. The app does not diagnose, prescribe medical diets, or replace professional nutrition advice.

## Privacy
The app stores data in `localStorage` in the browser. Nothing is sent to a Gnam server. The optional recipe inspiration section uses TheMealDB directly from the browser.
