const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const STORAGE = 'gnam-v1';
const DAY_NAMES = ['Lunedì','Martedì','Mercoledì','Giovedì','Venerdì','Sabato','Domenica'];
const PROFILE_INFO = {
  normal:{name:'Normale',note:'Equilibrato e quotidiano: verdure, proteine e carboidrati di qualità senza complicarti la vita.',protein:1.0,kcalFactor:1.0},
  sport:{name:'Sportivo',note:'Più attenzione a proteine, carboidrati e pasti completi. Le quantità restano indicative e vanno adattate all’attività reale.',protein:1.45,kcalFactor:1.18},
  elegant:{name:'Elegante',note:'Piatti più “da tavola”, ingredienti valorizzati e varietà di presentazione, senza trasformare la cena in un esame di cucina.',protein:1.05,kcalFactor:1.03}
};
let state = loadState();
state.pantry ||= [];
state.profile ||= 'normal';
state.plan ||= null;
state.webRecipes ||= [];

function todayISO(){return new Date().toISOString().slice(0,10)}
function parseDate(s){return new Date(`${s}T12:00:00`)}
function daysBetween(a,b){return Math.round((parseDate(b)-parseDate(a))/86400000)}
function fmtDate(s){return new Intl.DateTimeFormat('it-IT',{day:'2-digit',month:'2-digit'}).format(parseDate(s))}
function mondayOf(date){const d=new Date(date); const day=(d.getDay()+6)%7; d.setDate(d.getDate()-day); return d.toISOString().slice(0,10)}
function normalizeName(s){const x=s.toLowerCase().trim(); return INGREDIENT_ALIASES[x] || x}
function key(s){return normalizeName(s)}
function portionRatio(r,people=1){return people/2}
function recipeIngredients(r,people){return r.ingredients.map(([n,q,u])=>({n:key(n),raw:n,q:q*portionRatio(r,people),u}))}
function unitFactor(u){return u==='kg'?1000:u==='l'?1000:1}
function toBase(q,u){return q*unitFactor(u)}
function compatibleUnit(a,b){return (a===b) || (a==='g'&&b==='ml') || (a==='ml'&&b==='g')}
function getMatched(pantry, recipeIng){
  const candidates = pantry.filter(i=>normalizeName(i.name)===recipeIng.n && !i.locked && i.qty>0 && compatibleUnit(i.unit,recipeIng.u));
  candidates.sort((a,b)=>a.expiry.localeCompare(b.expiry));
  return candidates;
}
function availableFor(pantry, n, u){return pantry.filter(i=>normalizeName(i.name)===n && compatibleUnit(i.unit,u)).reduce((s,i)=>s+i.qty,0)}
function consume(pantry, r, people){
  for(const ri of recipeIngredients(r,people)){
    let need=ri.q;
    const cs=getMatched(pantry,ri);
    for(const item of cs){if(need<=0)break; const take=Math.min(need,item.qty);item.qty=Math.max(0,item.qty-take);need-=take;}
  }
}
function expiryClass(days){if(days<=2)return 'urgent';if(days<=4)return 'soon';return 'ok'}
function nutritionTarget(profile){
  const age=Number($('#age').value)||30, weight=Number($('#weight').value)||70, activity=$('#activity').value;
  // Mifflin-St Jeor, male baseline. This is only used as a transparent planning estimate.
  const bmr=10*weight+6.25*178-5*age+5;
  const factor=activity==='high'?1.65:activity==='moderate'?1.5:1.3;
  const kcal=Math.round(bmr*factor*PROFILE_INFO[profile].kcalFactor);
  return {kcal,protein:Math.round(weight*PROFILE_INFO[profile].protein)};
}
function save(){localStorage.setItem(STORAGE,JSON.stringify(state))}
function loadState(){try{return JSON.parse(localStorage.getItem(STORAGE))||{}}catch{return {}}}
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2400)}
function renderHints(){const terms=[...new Set(RECIPES.flatMap(r=>r.ingredients.map(x=>x[0])))] ;$('#ingredientHints').innerHTML=terms.map(x=>`<option value="${x}"></option>`).join('')}
function renderQuickAdds(){
  const suggestions=['zucchine','pomodori','uova','petto di pollo','patate','spinaci','riso','ceci cotti','pane integrale','yogurt greco'];
  $('#quickAdds').innerHTML=suggestions.map(x=>`<button type="button" class="quick-add" data-q="${x}">+ ${x}</button>`).join('');
  $$('.quick-add').forEach(b=>b.onclick=()=>{$('#ingredientName').value=b.dataset.q;$('#ingredientQty').focus()});
}
function renderPantry(){
  const list=$('#pantryList'), count=state.pantry.filter(x=>x.qty>0).length;
  $('#pantryCount').textContent=`${count} ${count===1?'ingrediente':'ingredienti'}`;
  const expired=state.pantry.filter(x=>x.qty>0 && x.expiry<todayISO());
  $('#expiredBanner').classList.toggle('hidden',expired.length===0);
  if(expired.length) $('#expiredBanner').innerHTML=`⚠️ <b>${expired.length} ingrediente/i risultano scaduti.</b> Gnam non li usa nel menu: controlla le date prima di consumarli.`;
  if(!count){list.className='pantry-list empty-state';list.innerHTML='<div class="empty-emoji">🧺</div><p>Il frigo è ancora vuoto.</p><small>Aggiungi almeno qualche ingrediente per dare a Gnam qualcosa su cui lavorare.</small>';return}
  list.className='pantry-list';
  list.innerHTML='<div class="pantry-items">'+state.pantry.filter(x=>x.qty>0).sort((a,b)=>a.expiry.localeCompare(b.expiry)).map(i=>{
    const d=daysBetween(todayISO(),i.expiry); const cls=expiryClass(d); const text=d<0?'scaduto':d===0?'oggi':d===1?'domani':`tra ${d} gg`;
    return `<div class="pantry-item"><div><div class="pantry-name">${escapeHtml(i.name)}</div><div class="pantry-meta">${trimNum(i.qty)} ${i.unit}</div></div><span class="expiry ${cls}">${text} · ${fmtDate(i.expiry)}</span><button class="delete-btn" data-del="${i.id}" aria-label="Rimuovi ingrediente">×</button></div>`;
  }).join('')+'</div>';
  $$('[data-del]').forEach(b=>b.onclick=()=>{state.pantry=state.pantry.filter(x=>x.id!==b.dataset.del);save();renderPantry()});
}
function trimNum(n){return Number(n.toFixed(2)).toString()}
function escapeHtml(s){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c]))}
function setDefaultDates(){
  const now=todayISO();
  if(!$('#ingredientExpiry').value){const d=new Date();d.setDate(d.getDate()+4);$('#ingredientExpiry').value=d.toISOString().slice(0,10)}
  if(!$('#weekStart').value)$('#weekStart').value=mondayOf(new Date());
}
function scoreRecipe(r,pantry,dayIndex,usedIds,profile,people,dayItems=[]){
  if(r.diff>Number($('#difficulty').value))return -1e9;
  if(usedIds.has(r.id))return -900;
  if(r.style.includes(profile)){} else return -30;
  let coverage=0, urgency=0, exact=0;
  for(const ri of recipeIngredients(r,people)){
    const candidates=getMatched(pantry,ri);
    const avail=candidates.reduce((s,i)=>s+i.qty,0);
    if(avail>0){
      const use=Math.min(avail,ri.q); coverage += Math.min(1,avail/Math.max(ri.q,1)); exact += use/Math.max(ri.q,1);
      for(const item of candidates.slice(0,2)){const days=daysBetween(todayISO(),item.expiry)-dayIndex; if(days>=0) urgency += Math.max(0,8-days)*0.7;}
    }
  }
  // Recipe should consume ingredients likely to expire before this meal.
  const coverScore=coverage*28, useScore=exact*20, urgencyScore=urgency*2.2;
  const diffBonus=(4-r.diff)*2;
  const novelty=(r.tags.includes('legumi')?2:0)+(r.veg>=2?2:0);
  const profileBonus=r.style.includes(profile)?5:0;
  const t=nutritionTarget(profile);
  const dayKcal=dayItems.reduce((s,x)=>s+x.kcal,0)+r.kcal;
  const dayProtein=dayItems.reduce((s,x)=>s+x.p,0)+r.p;
  const targetMealKcal=t.kcal*0.62;
  const targetMealProtein=t.protein*0.68;
  const macroBalance=Math.max(-18, 18-Math.abs(dayKcal-targetMealKcal)/28) + Math.max(-12, 12-Math.abs(dayProtein-targetMealProtein)/3);
  const sameDayProtein=dayItems.some(x=>x.protein===r.protein)?-9:3;
  return coverScore+useScore+urgencyScore+diffScore(diffBonus)+novelty+profileBonus+macroBalance+sameDayProtein + Math.random()*3;
}
function diffScore(x){ return x; }
function buildPlan(){
  const active=state.pantry.filter(i=>i.qty>0 && i.expiry>=todayISO());
  if(active.length<2){$('#planStatus').textContent='Servono almeno 2 ingredienti non scaduti per costruire un menu sensato.';$('#planGrid').innerHTML='';return}
  const people=Number($('#people').value)||1,profile=state.profile,start=$('#weekStart').value||mondayOf(new Date());
  const workPantry=JSON.parse(JSON.stringify(active)); const slots=[]; const used=new Set();
  for(let day=0;day<7;day++){
    const dayItems=[];
    for(let meal=0;meal<2;meal++){
      const ranked=RECIPES.map(r=>({r,s:scoreRecipe(r,workPantry,day,used,profile,people,dayItems)})).sort((a,b)=>b.s-a.s);
      let chosen=ranked[0]?.r;
      // Later in the algorithm, permit a repeat only when no unused candidate has meaningful coverage.
      if(!chosen||ranked[0].s<-500){
        const fallback=RECIPES.filter(r=>!used.has(r.id)&&r.diff<=Number($('#difficulty').value)&&r.style.includes(profile)).sort(()=>Math.random()-.5);chosen=fallback[0] || RECIPES.filter(r=>r.diff<=Number($('#difficulty').value)&&r.style.includes(profile)).sort(()=>Math.random()-.5)[0];
      }
      if(chosen){consume(workPantry,chosen,people);used.add(chosen.id);dayItems.push(chosen)}
    }
    slots.push(dayItems);
  }
  state.plan={start,slots,createdAt:new Date().toISOString(),profile}; save(); renderPlan(); renderPantry();
}
function renderPlan(){
  if(!state.plan){$('#planGrid').innerHTML='';return}
  const start=parseDate(state.plan.start), people=Number($('#people').value)||1;
  const target=nutritionTarget(state.profile);
  $('#planStatus').innerHTML=`<b>${PROFILE_INFO[state.profile].name}.</b> ${fmtDate(state.plan.start)} → ${fmtDate(new Date(start.getTime()+6*86400000).toISOString().slice(0,10))}. Priorità alle scadenze, poi varietà e profilo nutrizionale.`;
  $('#planGrid').innerHTML=state.plan.slots.map((day,di)=>{
    const d=new Date(start.getTime()+di*86400000),iso=d.toISOString().slice(0,10);
    return `<div class="day-card"><div class="day-top"><div class="day-name">${DAY_NAMES[d.getDay()===0?6:d.getDay()-1]}</div><div class="day-date">${fmtDate(iso)}</div></div>${day.map((r,mi)=>`<div class="meal"><div class="meal-type">${mi===0?'☀️ Pranzo':'🌙 Cena'}</div><div class="meal-title">${escapeHtml(r.name)}</div><div class="meal-tags">${r.tags.slice(0,2).map(t=>`<span class="tag">${escapeHtml(t)}</span>`).join('')}</div><div class="meal-kcal">${r.kcal} kcal · ${r.p}g P · ${r.c}g C · ${r.f}g G</div></div>`).join('')}</div>`;
  }).join('');
  const all=state.plan.slots.flat(), totals=all.reduce((a,r)=>({k:a.k+r.kcal,p:a.p+r.p,c:a.c+r.c,f:a.f+r.f}),{k:0,p:0,c:0,f:0});
  const avgK=Math.round(totals.k/7), avgP=Math.round(totals.p/7);
  $('#weeklySummary').classList.remove('hidden');
  $('#weeklySummary').innerHTML=`<div class="metric"><strong>${avgK}</strong><span>kcal / giorno da pranzo+cena</span></div><div class="metric"><strong>${avgP} g</strong><span>proteine / giorno da pranzo+cena</span></div><div class="metric"><strong>${new Set(all.map(r=>r.protein)).size}</strong><span>fonti proteiche diverse</span></div><div class="metric"><strong>${all.filter(r=>r.veg>=2).length}/14</strong><span>pasti con 2+ porzioni verdure</span></div>`;
  renderLeftovers();
}
function renderLeftovers(){
  if(!state.plan){$('#leftovers').classList.add('hidden');return}
  const people=Number($('#people').value)||1;const sim=JSON.parse(JSON.stringify(state.pantry.filter(i=>i.qty>0)));state.plan.slots.flat().forEach(r=>consume(sim,r,people));
  const left=sim.filter(i=>i.qty>1 || (i.unit==='pz'&&i.qty>=1));
  $('#leftovers').classList.remove('hidden');
  $('#leftovers').innerHTML=`<strong>🧺 Cosa resta dopo il piano</strong><div style="margin-top:7px">${left.length?left.map(i=>`${escapeHtml(i.name)} <b>${trimNum(i.qty)} ${i.unit}</b>`).join(' · '):'Quasi tutto esaurito: ottimo lavoro.'}</div>`;
}
async function expandFromWeb(){
  const active=state.pantry.filter(i=>i.qty>0&&i.expiry>=todayISO()).sort((a,b)=>a.expiry.localeCompare(b.expiry));
  if(!active.length){toast('Aggiungi un ingrediente prima di cercare ricette web.');return}
  const urgent=normalizeName(active[0].name).replace(/\s+/g,'_');
  $('#webRecipesSection').classList.remove('hidden'); $('#webGrid').innerHTML='<div class="small-note">Cerco ispirazione online…</div>';
  try{
    const res=await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(urgent)}`); const data=await res.json();
    let meals=(data.meals||[]).slice(0,6);
    if(!meals.length){
      const q=encodeURIComponent(active[0].name.split(' ')[0]);
      const sr=await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${q}`); const sd=await sr.json(); meals=(sd.meals||[]).slice(0,6);
    }
    state.webRecipes=meals;save();
    if(!meals.length){$('#webGrid').innerHTML='<div class="small-note">Non ho trovato risultati per questo ingrediente. Il ricettario interno resta disponibile.</div>';return}
    $('#webGrid').innerHTML=meals.map(m=>`<article class="web-card"><img src="${m.strMealThumb}" alt=""><div class="web-body"><h3>${escapeHtml(m.strMeal)}</h3><p>${escapeHtml(m.strCategory||'Ricetta')} · ${escapeHtml(m.strArea||'internazionale')}</p><a href="https://www.themealdb.com/meal.php?c=${m.idMeal}" target="_blank" rel="noreferrer">Apri ricetta ↗</a></div></article>`).join('');
  }catch(e){$('#webGrid').innerHTML='<div class="small-note">La sorgente web non risponde in questo momento. Nessun problema: il motore di Gnam funziona anche offline.</div>'}
}
function loadDemo(){
  const base=new Date();const plus=n=>{const d=new Date(base);d.setDate(d.getDate()+n);return d.toISOString().slice(0,10)};
  state.pantry=[
    ['zucchine',500,'g',plus(1)],['petto di pollo',450,'g',plus(3)],['salmone',300,'g',plus(2)],['uova',6,'pz',plus(6)],['broccoli',350,'g',plus(2)],['spinaci',250,'g',plus(3)],['patate',800,'g',plus(8)],['pomodori',500,'g',plus(4)],['passata di pomodoro',500,'g',plus(60)],['ceci cotti',500,'g',plus(40)],['lenticchie cotte',400,'g',plus(35)],['riso',500,'g',plus(90)],['pasta integrale',500,'g',plus(90)],['ricotta',250,'g',plus(4)],['yogurt greco',300,'g',plus(7)],['pane integrale',300,'g',plus(5)],['carote',300,'g',plus(9)],['peperoni',250,'g',plus(4)],['melanzane',250,'g',plus(5)],['feta',150,'g',plus(10)]
  ].map((x,i)=>({id:`d${i}-${Date.now()}`,name:x[0],qty:x[1],unit:x[2],expiry:x[3]}));
  save();renderPantry();toast('Spesa demo caricata. Ora genera il menu!');window.scrollTo({top:$('#pantryList').getBoundingClientRect().top+window.scrollY-80,behavior:'smooth'});
}
function init(){
  renderHints();renderQuickAdds();setDefaultDates();renderPantry();
  $$('.profile-tab').forEach(b=>b.onclick=()=>{state.profile=b.dataset.profile;save();$$('.profile-tab').forEach(x=>x.classList.toggle('active',x===b));$('#profileNote').textContent=PROFILE_INFO[state.profile].note});
  $('#ingredientForm').addEventListener('submit',e=>{e.preventDefault();const name=$('#ingredientName').value.trim(),qty=Number($('#ingredientQty').value),unit=$('#ingredientUnit').value,expiry=$('#ingredientExpiry').value;if(!name||!qty||!expiry)return;state.pantry.push({id:`i-${Date.now()}-${Math.random()}`,name,qty,unit,expiry});save();renderPantry();$('#ingredientName').value='';toast(`${name} aggiunto alla dispensa`)});
  $('#generateBtn').onclick=buildPlan;$('#generateTopBtn').onclick=()=>{buildPlan();$('#planSection').scrollIntoView({behavior:'smooth'})};$('#webExpandBtn').onclick=expandFromWeb;$('#loadDemoBtn').onclick=loadDemo;
  if(state.plan){renderPlan()}
}
init();
