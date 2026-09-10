# gnam

Gnam è una web app statica pensata per GitHub Pages: inserisci la spesa, assegna/controlla le scadenze e ottieni un calendario pranzo+cena per 7 giorni.

## Novità della versione 3
- Autofill della scadenza per ingredienti comuni. La data proposta è una **stima di pianificazione**, non sostituisce la data reale riportata sulla confezione.
- Preset di spesa per budget indicativi (~35/55/75 €) che caricano automaticamente l'inventario e generano il menu.
- Check spesa 1–100 con indicatori di qualità della dieta, varietà proteica, fibre, fonti di micronutrienti e mix fresco/lunga conservazione.
- Il calendario usa solo ricette coperte dagli ingredienti disponibili. Le ricette non coperte vengono escluse dal calendario.
- Se manca **un solo ingrediente**, viene mostrata una sezione separata “E se aggiungessi solo una cosa?”.
- Cliccando un pasto si apre la ricetta con quantità, tempi, macro indicativi e preparazione.
- Ricette curate + generazione combinatoria locale per aumentare enormemente il numero di combinazioni senza chiamare un server.
- TheMealDB è disponibile come fonte di esplorazione web opzionale; le ricette web non entrano nel planner in automatico.
- Dati memorizzati nel browser tramite localStorage.

## Pubblicazione
1. Crea un repository GitHub, per esempio `gnam`.
2. Carica `index.html`, `styles.css`, `app.js`, `recipes.js` e `README.md` nella root.
3. GitHub → Settings → Pages → Deploy from a branch → `main` → `/ (root)`.

## Fonti nutrizionali
La logica di controllo non tenta di fare diagnosi o una dieta clinica. Valuta euristicamente la presenza e la varietà di gruppi alimentari e proxy di nutrienti, ispirandosi a:
- WHO, Healthy diet: https://www.who.int/news-room/fact-sheets/detail/healthy-diet
- EFSA, Dietary Reference Values: https://www.efsa.europa.eu/it/topics/topic/dietary-reference-values
- CREA, Linee guida per una sana alimentazione: https://www.crea.gov.it/documents/59764/0/LINEE-GUIDA%2BDEFINITIVO.pdf

## Ricette web
TheMealDB documenta una API pubblica con una chiave di test `1` per sviluppo/uso educativo e consiglia una chiave supporter per un rilascio pubblico più ampio: https://www.themealdb.com/api.php
