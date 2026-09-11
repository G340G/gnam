/*
  Gnam 6.6 — strict online recipe importer.
  Online recipes are NEVER approximated by dropping ingredients or inventing grams.
  A source recipe is accepted only when every substantive ingredient is mapped and
  its measure is interpretable, and the preparation has usable steps.
*/
const GNAM_REMOTE_CONFIG={
  base:'https://www.themealdb.com/api/json/v1/1',
  cacheKey:'gnam_live_recipe_cache_v2',
  ttlMs:7*24*60*60*1000,
  maxMeals:700
};

function remoteCacheRead(){try{const x=JSON.parse(localStorage.getItem(GNAM_REMOTE_CONFIG.cacheKey)||'{}');if(x.ts&&Date.now()-x.ts<GNAM_REMOTE_CONFIG.ttlMs)return x.meals||[];}catch{}return[]}
function remoteCacheWrite(meals){try{localStorage.setItem(GNAM_REMOTE_CONFIG.cacheKey,JSON.stringify({ts:Date.now(),meals}))}catch{}}
function remoteFieldList(m){const out=[];for(let i=1;i<=20;i++){const n=(m[`strIngredient${i}`]||'').trim();const q=(m[`strMeasure${i}`]||'').trim();if(n)out.push([n,q]);}return out}
function remoteCleanName(s){return String(s||'').toLowerCase().replace(/[^a-zà-ÿ0-9\s]/gi,' ').replace(/\s+/g,' ').trim()}
const REMOTE_SOURCE_STAPLES=new Set(['salt','pepper','black pepper','water','ice']);
function cleanRemoteSteps(text){
  return String(text||'').split(/\n+/).map(x=>x.trim())
    .map(x=>x.replace(/^(?:step\s*\d+|\d+)\s*[\.)]?\s*/i,'').trim())
    .filter(x=>x && !/^gather the ingredients\.?$/i.test(x) && x.length>=28);
}
async function remoteFetch(url){const r=await fetch(url,{cache:'no-store'});if(!r.ok)throw new Error(`HTTP ${r.status}`);return r.json()}
function remoteToGnam(m){
  const rawIngredients=remoteFieldList(m);
  const ingredients=[];
  let mapped=0;
  for(const [raw,measure] of rawIngredients){
    const cn=remoteCanonical(raw);
    if(!cn && REMOTE_SOURCE_STAPLES.has(remoteCleanName(raw))) {mapped++;continue;}
    const qq=remoteQty(raw,measure);
    if(!cn||!qq) return null;
    ingredients.push([cn,qq[0],qq[1]]); mapped++;
  }
  const steps=cleanRemoteSteps(m.strInstructions||'');
  return {
    id:`web-${m.idMeal}`, externalId:m.idMeal, name:m.strMeal,
    time:estimateRemoteTime(steps,m), diff:2,
    tags:['online','verificata',String(m.strCategory||'').toLowerCase(),String(m.strArea||'').toLowerCase()].filter(Boolean),
    style:['normal','sport','elegant'], ingredients,
    rawIngredientCount:rawIngredients.length, mappedIngredientCount:mapped,
    protein:remoteProteinFamily(m),
    sourceUrl:m.strSource||`https://www.themealdb.com/meal/${m.idMeal}`,
    sourceName:'TheMealDB', sourceInstructions:String(m.strInstructions||''), sourceSteps:steps,
    servings:4, thumb:m.strMealThumb||'', verifiedOnline:true, remote:true, steps,
    remoteIntegrity:rawIngredients.length>=3 && mapped===rawIngredients.length && steps.length>=3 && steps.every(x=>x.length>=28)
  };
}
function remoteValid(m){
  const ings=remoteFieldList(m); const ins=String(m.strInstructions||'').trim();
  if(!(m&&m.idMeal&&m.strMeal&&ings.length>=3&&ins.length>=180&&(m.strSource||m.strMealThumb)))return false;
  const steps=cleanRemoteSteps(ins); if(steps.length<3||steps.some(x=>x.length<28))return false;
  // Do the strict mapping here before the recipe is even cached.
  const converted=remoteToGnam(m);
  return !!(converted&&converted.remoteIntegrity);
}
function remoteProteinFamily(m){
  const s=remoteFieldList(m).map(x=>remoteCleanName(x[0])).join(' | ');
  if(/salmon|tuna|cod|haddock|mackerel|sardine|anchov|prawn|shrimp|fish|seafood|trout/.test(s))return'fish';
  if(/chicken|turkey|duck/.test(s))return'chicken';
  if(/beef|steak|mince|lamb|pork|bacon|sausage/.test(s))return'meat';
  if(/egg/.test(s))return'egg';
  if(/lentil|chickpea|bean|pea|black bean|kidney bean/.test(s))return'legume';
  if(/tofu|tempeh/.test(s))return'plant-protein';
  if(/yogurt|yoghurt|cheese|ricotta|feta|mozzarella|milk/.test(s))return'dairy';
  return null;
}
function estimateRemoteTime(steps,r){
  const t=String(r.strInstructions||'').toLowerCase();
  if(/overnight|refrigerat.*overnight|chill.*hours/.test(t))return 120;
  if(/bake|roast|oven/.test(t))return 45;
  if(/simmer.*45|cook.*60|boil.*60/.test(t))return 60;
  return 30;
}
async function getLiveRecipePool(pantry){
  const cached=remoteCacheRead();
  const pantryNames=pantry.map(x=>normalizeName(x.name)).filter(Boolean);
  const aliases={
    'petto di pollo':'chicken breast','salmone':'salmon','merluzzo':'cod','orata':'bream','tonno al naturale':'tuna',
    'ceci cotti':'chickpeas','lenticchie cotte':'lentils','fagioli cannellini':'cannellini beans','pasta integrale':'whole wheat pasta',
    'pasta':'pasta','riso':'rice','patate':'potatoes','zucchine':'courgettes','broccoli':'broccoli','spinaci':'spinach',
    'carote':'carrots','pomodori':'tomatoes','peperoni':'peppers','melanzane':'aubergine','uova':'eggs','ricotta':'ricotta',
    'yogurt greco':'greek yogurt','feta':'feta','olive':'olives','pane integrale':'whole wheat bread','cipolla':'onion',
    'limone':'lemon','piselli':'peas','noci':'walnuts','olio evo':'olive oil','aglio':'garlic','zenzero':'ginger'
  };
  const queries=[...new Set(pantryNames.map(n=>aliases[n]||n).filter(Boolean))].slice(0,16);
  let ids=new Set(cached.map(x=>x.externalId).filter(Boolean));
  try{
    const letters='abcdefghijklmnopqrstuvwxyz'.split('');
    const byLetter=await Promise.all(letters.map(async letter=>{try{const d=await remoteFetch(`${GNAM_REMOTE_CONFIG.base}/search.php?f=${letter}`);return d.meals||[]}catch{return[]}}));
    for(const list of byLetter)for(const x of list)ids.add(x.idMeal);
    const ingredientBatches=await Promise.all(queries.map(async q=>{try{const d=await remoteFetch(`${GNAM_REMOTE_CONFIG.base}/filter.php?i=${encodeURIComponent(q)}`);return d.meals||[]}catch{return[]}}));
    for(const list of ingredientBatches)for(const x of list)ids.add(x.idMeal);
    const newIds=[...ids].slice(0,GNAM_REMOTE_CONFIG.maxMeals);
    const fullById=new Map();
    const cachedById=new Map(cached.map(x=>[x.externalId,x]));
    // Summaries returned by search.php are never treated as full recipes.
    // Refresh every selected id through lookup.php so ingredients/instructions are complete.
    const chunk=16;
    for(let i=0;i<newIds.length;i+=chunk){
      const part=await Promise.all(newIds.slice(i,i+chunk).map(async id=>{
        const cachedFull=cachedById.get(id);
        if(cachedFull&&cachedFull.remoteIntegrity)return cachedFull;
        try{const d=await remoteFetch(`${GNAM_REMOTE_CONFIG.base}/lookup.php?i=${id}`);return d.meals?.[0]||null}catch{return null}
      }));
      for(const m of part.filter(Boolean))fullById.set(m.externalId||m.idMeal,m);
    }
    const valid=[];
    for(const m of fullById.values()){
      if(!remoteValid(m))continue;
      const converted=remoteToGnam(m); if(converted&&converted.remoteIntegrity)valid.push(converted);
      if(valid.length>=GNAM_REMOTE_CONFIG.maxMeals)break;
    }
    const uniq=[...new Map(valid.map(x=>[x.externalId,x])).values()].slice(0,GNAM_REMOTE_CONFIG.maxMeals);
    remoteCacheWrite(uniq);
    return uniq;
  }catch{return cached.filter(x=>x&&x.remoteIntegrity)}
}
window.GNAM_REMOTE={getLiveRecipePool};
