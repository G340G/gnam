# gnam 🍋

**Gnam** è una web app statica per GitHub Pages: inserisci quello che hai comprato, quantità e scadenza, e ottieni un menu di **pranzo + cena per 7 giorni**.

## Funzioni

- inventario in `localStorage` (nessun account, nessun backend);
- priorità agli ingredienti con scadenza più vicina;
- consumo simulato dell'inventario durante la settimana;
- 40+ ricette curate, tutte con difficoltà bassa/medio-bassa;
- profili **Normale / Sportivo / Elegante**;
- controllo configurabile della difficoltà;
- stima indicativa di kcal e macronutrienti;
- controllo della varietà delle fonti proteiche e della presenza di verdure/legumi;
- ricerca opzionale di ricette online tramite **TheMealDB API**;
- riepilogo di cosa dovrebbe restare dopo il menu;
- interfaccia responsive, vivace e adatta al mobile.

## Pubblicazione su GitHub Pages

1. Crea un repository, ad esempio `gnam`.
2. Carica nella root:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `recipes.js`
   - `README.md`
3. Vai su **Settings → Pages → Build and deployment → Deploy from a branch**.
4. Seleziona `main` e cartella `/ (root)`.
5. Salva. GitHub Pages pubblicherà `index.html`.

Non serve npm, non serve un server e non serve un build step.

## Perché il menu ragiona in questo modo

L'algoritmo non massimizza solo il numero di ingredienti usati. Ogni candidato riceve un punteggio composto da:

- **urgenza della scadenza**;
- **quota dell'ingrediente realmente consumabile**;
- **varietà rispetto ai pasti già scelti**;
- **profilo scelto**;
- **semplicità della ricetta**;
- **presenza di verdure/legumi e varietà delle fonti proteiche**.

Le date già scadute non vengono pianificate.

## Nutrizione e fonti

Le ricette interne contengono valori nutrizionali **indicativi**. Non sostituiscono un piano dietetico professionale e non sono pensate per patologie, allergie o esigenze cliniche specifiche.

La logica generale segue principi coerenti con:

- WHO, *Healthy diet*: varietà, frutta/verdura, legumi, cereali integrali, limitazione di sale/zuccheri/liberi grassi saturi;
- EFSA, *Dietary Reference Values*: intervalli di riferimento per macronutrienti e PRI per le proteine;
- CREA, *Linee Guida per una sana alimentazione*: approccio alimentare italiano e modello mediterraneo.

## Ricette dal web

La funzione "Espandi con ricette web" usa gli endpoint pubblici **V1** di TheMealDB. Il piano principale non dipende dall'API: se il servizio non è raggiungibile, Gnam continua a funzionare con il proprio ricettario.

Per un'app pubblica più sofisticata, conviene aggiungere in seguito una vera sorgente nutrizionale per ingrediente (es. USDA FoodData Central o dataset equivalenti) e un sistema di normalizzazione delle quantità.

## Privacy

I dati della spesa e le impostazioni restano nel `localStorage` del browser. L'unica richiesta esterna è opzionale e avviene quando premi "Espandi con ricette web".
