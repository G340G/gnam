const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const STORAGE='gnam-v3';
const DAY_NAMES=['Lunedì','Martedì','Mercoledì','Giovedì','Venerdì','Sabato','Domenica'];
const PROFILE_INFO={
  normal:{name:'Normale',note:'Equilibrato e quotidiano: varietà, fibre, fonti proteiche diverse e preparazioni realistiche.',protein:1.0,energy:1.0},
  sport:{name:'Sportivo',note:'Più spazio a proteine e carboidrati utili all’attività, con pasti più sostanziosi. Il timing reale resta personale.',protein:1.5,energy:1.15},
  elegant:{name:'Elegante',note:'Piatti più curati e vari, con la stessa disciplina nutrizionale ma una presentazione da tavola.',protein:1.05,energy:1.03}
};
const EXPIRY={
  'uova':{days:10,unit:'pz'},'latte':{days:7,unit:'ml'},'ricotta':{days:7,unit:'g'},'mozzarella':{days:5,unit:'g'},'yogurt greco':{days:10,unit:'g'},'yogurt':{days:10,unit:'g'},'parmigiano':{days:30,unit:'g'},'feta':{days:10,unit:'g'},
  'petto di pollo':{days:2,unit:'g'},'pollo':{days:2,unit:'g'},'fesa di tacchino':{days:2,unit:'g'},'tacchino':{days:2,unit:'g'},'salmone':{days:2,unit:'g'},'merluzzo':{days:2,unit:'g'},'orata':{days:2,unit:'g'},'tonno al naturale':{days:365,unit:'g'},
  'zucchine':{days:5,unit:'g'},'broccoli':{days:5,unit:'g'},'spinaci':{days:4,unit:'g'},'lattuga':{days:4,unit:'g'},'pomodori':{days:7,unit:'g'},'carote':{days:14,unit:'g'},'peperoni':{days:7,unit:'g'},'melanzane':{days:7,unit:'g'},'cetrioli':{days:7,unit:'g'},'fagiolini':{days:5,unit:'g'},'patate':{days:21,unit:'g'},
  'pane integrale':{days:5,unit:'g'},'pane pita':{days:5,unit:'g'},'piadina integrale':{days:7,unit:'g'},'pasta':{days:180,unit:'g'},'pasta integrale':{days:180,unit:'g'},'riso':{days:365,unit:'g'},'orzo':{days:365,unit:'g'},'cous cous':{days:365,unit:'g'},'gnocchi':{days:10,unit:'g'},
  'ceci cotti':{days:4,unit:'g'},'lenticchie cotte':{days:4,unit:'g'},'fagioli cannellini':{days:4,unit:'g'},'passata di pomodoro':{days:180,unit:'g'},'olive':{days:30,unit:'g'},'olio evo':{days:365,unit:'ml'},'noci':{days:90,unit:'g'},'mandorle':{days:90,unit:'g'},'avocado':{days:5,unit:'g'},'limone':{days:21,unit:'pz'}
};
const ALIASES=INGREDIENT_ALIASES||{};
const GROUPS={
  vegetables:new Set(['zucchine','broccoli','spinaci','lattuga','pomodori','carote','peperoni','melanzane','cetrioli','fagiolini']),
  fruit:new Set(['limone','avocado']),
  legumes:new Set(['ceci cotti','lenticchie cotte','fagioli cannellini']),
  grains:new Set(['riso','pasta','pasta integrale','orzo','cous cous','pane integrale','pane pita','piadina integrale','gnocchi','patate']),
  fish:new Set(['salmone','merluzzo','orata','tonno al naturale']),
  meat:new Set(['petto di pollo','fesa di tacchino']),
  eggs:new Set(['uova']),
  dairy:new Set(['ricotta','mozzarella','yogurt greco','feta','parmigiano','latte']),
  healthyFat:new Set(['olio evo','noci','mandorle','avocado']),
};
const PROTEIN_MAP={fish:['salmone','merluzzo','orata','tonno al naturale'],meat:['petto di pollo','fesa di tacchino'],egg:['uova'],legume:['ceci cotti','lenticchie cotte','fagioli cannellini'],dairy:['ricotta','mozzarella','yogurt greco','feta','parmigiano'],tofu:['tofu'],nuts:['noci','mandorle']};
const BUDGETS=[
 {id:'smart',icon:'🧺',title:'Smart · ~35€',desc:'essenziale, molta dispensa',items:[['uova',6,'pz'],['petto di pollo',450,'g'],['ceci cotti',400,'g'],['lenticchie cotte',400,'g'],['pasta integrale',500,'g'],['riso',500,'g'],['passata di pomodoro',500,'g'],['patate',800,'g'],['zucchine',500,'g'],['carote',400,'g'],['broccoli',350,'g'],['spinaci',250,'g'],['pomodori',500,'g'],['yogurt greco',300,'g'],['pane integrale',300,'g'],['olio evo',250,'ml']]},
 {id:'balanced',icon:'🥕',title:'Balanced · ~55€',desc:'varietà + pesce',items:[['uova',6,'pz'],['petto di pollo',450,'g'],['salmone',300,'g'],['merluzzo',350,'g'],['ceci cotti',400,'g'],['lenticchie cotte',400,'g'],['fagioli cannellini',300,'g'],['pasta integrale',500,'g'],['riso',500,'g'],['orzo',300,'g'],['passata di pomodoro',500,'g'],['patate',800,'g'],['zucchine',500,'g'],['broccoli',350,'g'],['spinaci',250,'g'],['pomodori',500,'g'],['carote',400,'g'],['peperoni',300,'g'],['yogurt greco',300,'g'],['feta',150,'g'],['pane integrale',300,'g'],['olio evo',250,'ml']]},
 {id:'plus',icon:'🍷',title:'Plus · ~75€',desc:'più freschi, più scelta',items:[['uova',6,'pz'],['petto di pollo',450,'g'],['fesa di tacchino',350,'g'],['salmone',300,'g'],['merluzzo',350,'g'],['orata',350,'g'],['ceci cotti',400,'g'],['lenticchie cotte',400,'g'],['fagioli cannellini',300,'g'],['pasta integrale',500,'g'],['pasta',250,'g'],['riso',500,'g'],['orzo',300,'g'],['cous cous',300,'g'],['passata di pomodoro',500,'g'],['patate',800,'g'],['zucchine',500,'g'],['broccoli',350,'g'],['spinaci',250,'g'],['pomodori',500,'g'],['carote',400,'g'],['peperoni',300,'g'],['melanzane',300,'g'],['lattuga',250,'g'],['yogurt greco',300,'g'],['ricotta',250,'g'],['feta',150,'g'],['pane integrale',300,'g'],['noci',100,'g'],['olio evo',250,'ml']]}
];
let state=loadState(); state.pantry??=[]; state.profile??='normal'; state.plan??=null; state.score??=null; state.suggestions??=[];

function loadState(){try{return JSON.parse(localStorage.getItem(STORAGE))||{}}catch{return{}}}
function save(){localStorage.setItem(STORAGE,JSON.stringify(state))}
function todayISO(){return new Date().toISOString().slice(0,10)}
function parseDate(s){return new Date(`${s}T12:00:00`)}
function addDays(date,days){const d=parseDate(date instanceof Date?date.toISOString().slice(0,10):date);d.setDate(d.getDate()+days);return d.toISOString().slice(0,10)}
function daysFromToday(s){return Math.round((parseDate(s)-parseDate(todayISO()))/86400000)}
function fmtDate(s){return new Intl.DateTimeFormat('it-IT',{day:'2-digit',month:'2-digit'}).format(parseDate(s))}
function mondayOf(date=new Date()){const d=new Date(date), day=(d.getDay()+6)%7;d.setDate(d.getDate()-day);return d.toISOString().slice(0,10)}
function normalizeName(s){const x=String(s||'').toLowerCase().trim();return ALIASES[x]||x}
function qtyRatio(people){return people/2}
function round(n){return Number((n||0).toFixed(1))}
function escapeHtml(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function inputDateFromName(name){const k=normalizeName(name),info=EXPIRY[k];if(!info)return'';const days=Math.max(0,info.days);return addDays(todayISO(),days)}
function expiryText(i){const d=daysFromToday(i.expiry);if(d<0)return'⚠️ scaduto';if(d===0)return'⚠️ oggi';if(d===1)return'⏳ domani';if(d<=3)return`⏳ ${d} giorni`;return`📅 ${d} giorni`}
function expiryClass(i){const d=daysFromToday(i.expiry);return d<0?'urgent':d<=3?'urgent':d<=7?'soon':'ok'}
function baseAmount(q,u){return u==='kg'||u==='l'?q*1000:q}
function canUseUnit(src,req){return src===req || (['g','ml'].includes(src)&&['g','ml'].includes(req))}
function availableFor(ing, pantry){return pantry.filter(i=>normalizeName(i.name)===normalizeName(ing.n)&&i.qty>0&&canUseUnit(i.unit,ing.u)).sort((a,b)=>a.expiry.localeCompare(b.expiry)).reduce((n,i)=>n+baseAmount(i.qty,i.unit),0)}
function recipeScaledIngredients(r,people){return (r.ingredients||[]).map(([n,q,u])=>({n:normalizeName(n),label:n,q:q*qtyRatio(people),u:u}))}
function recipeCovered(r,pantry,people){return recipeScaledIngredients(r,people).every(x=>availableFor(x,pantry)>=baseAmount(x.q,x.u)-0.01)}
function consumeRecipe(pantry,r,people){for(const x of recipeScaledIngredients(r,people)){let need=baseAmount(x.q,x.u);for(const item of pantry.filter(i=>normalizeName(i.name)===x.n&&canUseUnit(i.unit,x.u)&&i.qty>0).sort((a,b)=>a.expiry.localeCompare(b.expiry))){const avail=baseAmount(item.qty,item.unit),used=Math.min(avail,need);item.qty=Math.max(0,(avail-used)/(['kg','l'].includes(item.unit)?1000:1));need-=used;if(need<=0)break;}}}
function pantryCounts(){return state.pantry.reduce((m,i)=>{m[normalizeName(i.name)]=m[normalizeName(i.name)]||[];m[normalizeName(i.name)].push(i);return m},{})}
function hasAny(set,pantry){return [...set].some(n=>pantry.some(i=>normalizeName(i.name)===n&&i.qty>0))}
function categoryOf(n){for(const [cat,set] of Object.entries(GROUPS))if(set.has(n))return cat;return 'other'}
function proteinFamily(n){for(const [p,list] of Object.entries(PROTEIN_MAP))if(list.includes(n))return p;return null}
function estimatedMacroForIngredient(n,q,u){
  const per100={
    uova:[143,13,1,10],petto_di_pollo:[120,23,0,3],fesa_di_tacchino:[114,24,0,2],salmone:[208,20,0,13],merluzzo:[82,18,0,1],orata:[121,20,0,4],tonno_al_naturale:[116,26,0,1],ceci_cotti:[164,8.9,27,2.6],lenticchie_cotte:[116,9,20,0.4],fagioli_cannellini:[140,9,25,0.6],pasta:[350,12,72,1.5],pasta_integrale:[350,14,67,2.5],riso:[360,7,80,1],orzo:[350,10,77,1],cous_cous:[376,13,77,0.6],patate:[77,2,17,0.1],pane_integrale:[247,13,41,4],pane_pita:[275,9,56,1.2],piadina_integrale:[300,8,50,8],zucchine:[17,1.2,3.1,.3],broccoli:[35,2.4,7,0.4],spinaci:[23,2.9,3.6,.4],lattuga:[15,1.4,2.9,.2],pomodori:[18,.9,3.9,.2],carote:[41,.9,10,.2],peperoni:[31,1,6,.3],melanzane:[25,1,6,.2],cetrioli:[15,.7,3.6,.1],fagiolini:[31,1.8,7,.1],passata_di_pomodoro:[30,1.3,5,.3],ricotta:[174,11,3,13],mozzarella:[280,18,3,22],yogurt_greco:[97,9,4,5],feta:[265,14,4,21],parmigiano:[402,33,0,29],olio_evo:[884,0,0,100],noci:[654,15,14,65],mandorle:[579,21,22,50],avocado:[160,2,9,15],olive:[115,.8,6,10],limone:[29,1,9,.3],latte:[46,3.3,4.8,1.6]
  };
  const key=normalizeName(n).replaceAll(' ','_'), p=per100[key]; if(!p)return [0,0,0,0]; const factor=['g','ml'].includes(u)?q/100:q;return p.map(x=>x*factor);
}
function aggregateMacros(pantry){return state.pantry.reduce((a,i)=>{const [k,p,c,f]=estimatedMacroForIngredient(i.name,i.qty,i.unit);return{...a,k:a.k+k,p:a.p+p,c:a.c+c,f:a.f+f}}, {k:0,p:0,c:0,f:0})}
function renderPresets(){
  $('#presetGrid').innerHTML=BUDGETS.map(b=>`<button class="preset" data-preset="${b.id}"><span class="preset-icon">${b.icon}</span><span><b>${b.title}</b><small>${escapeHtml(b.desc)}</small></span><span class="preset-arrow">→</span></button>`).join('');
  $$('.preset').forEach(btn=>btn.onclick=()=>applyPreset(btn.dataset.preset));
}
function renderHints(){
 const names=[...new Set([...Object.keys(EXPIRY),...state.pantry.map(i=>i.name)])].sort(); $('#ingredientHints').innerHTML=names.map(n=>`<option value="${escapeHtml(n)}">`).join('');
}
function renderQuickAdds(){
 const quick=['uova','ricotta','petto di pollo','zucchine','broccoli','spinaci','pomodori','ceci cotti','lenticchie cotte','riso','pasta integrale','yogurt greco'];
 $('#quickAdds').innerHTML=quick.map(n=>`<button class="quick-add" data-quick="${n}">+ ${n}</button>`).join('');
 $$('.quick-add').forEach(b=>b.onclick=()=>{const n=b.dataset.quick;$('#ingredientName').value=n;const info=EXPIRY[n];if(info)$('#ingredientUnit').value=info.unit;const d=inputDateFromName(n);if(d)$('#ingredientExpiry').value=d;$('#ingredientQty').value=info?.unit==='pz'?2:300;$('#ingredientName').focus()});
}
function renderPantry(){
 $('#pantryCount').textContent=`${state.pantry.length} ${state.pantry.length===1?'ingrediente':'ingredienti'}`;
 const list=state.pantry.slice().sort((a,b)=>a.expiry.localeCompare(b.expiry));
 if(!list.length){$('#pantryList').innerHTML=`<div class="empty-state"><div class="empty-emoji">🧺</div><p>Il frigo è ancora vuoto.</p><small>Puoi partire da un preset oppure aggiungere i tuoi prodotti.</small></div>`} else $('#pantryList').innerHTML=`<div class="pantry-items">${list.map(i=>`<div class="pantry-item"><div><div class="pantry-name">${escapeHtml(i.name)}</div><div class="pantry-meta">${round(i.qty)} ${i.unit}</div></div><span class="expiry ${expiryClass(i)}">${expiryText(i)} · ${fmtDate(i.expiry)}</span><button class="delete-btn" data-del="${i.id}">×</button></div>`).join('')}</div>`;
 $('#expiredBanner').classList.toggle('hidden',!list.some(i=>daysFromToday(i.expiry)<0)); if(list.some(i=>daysFromToday(i.expiry)<0))$('#expiredBanner').textContent='⚠️ Hai prodotti già scaduti. Non verranno usati automaticamente nel menu: controlla se vanno eliminati secondo le indicazioni del prodotto.';
 $$('[data-del]').forEach(b=>b.onclick=()=>{state.pantry=state.pantry.filter(x=>x.id!==b.dataset.del);state.plan=null;save();renderPantry();renderCheck();renderPlan()});
 renderHints();
}
function addPantryItems(items){
 const start=todayISO(); state.pantry=items.map((x,i)=>({id:`p-${Date.now()}-${i}-${Math.random()}`,name:x[0],qty:x[1],unit:x[2],expiry:x[3]||inputDateFromName(x[0])||addDays(start,7)}));
 state.plan=null;state.score=null;state.suggestions=[];save();renderPantry();renderCheck();renderPlan();
}
function applyPreset(id){const b=BUDGETS.find(x=>x.id===id);if(!b)return;addPantryItems(b.items);$('#people').value=1;state.profile='normal';$$('.profile-tab').forEach(x=>x.classList.toggle('active',x.dataset.profile==='normal'));$('#profileNote').textContent=PROFILE_INFO.normal.note;buildPlan();checkShopping(true);buildSuggestions();toast(`${b.title} caricata: menu creato.`)}
function nutritionTarget(){const p=PROFILE_INFO[state.profile],w=Number($('#weight').value)||70,a=Number($('#age').value)||30,activity=$('#activity').value,sexFactor=5;let bmr=(10*w+6.25*178-5*a)+sexFactor;let af=activity==='high'?1.55:activity==='moderate'?1.4:1.25;return{protein:w*p.protein,kcal:bmr*af*p.energy}}
function scoreRecipe(r,pantry,day,used,dayItems){
 if(r.diff>Number($('#difficulty').value))return -1e9;if(used.has(r.id))return -500;if(!recipeCovered(r,pantry,Number($('#people').value)||1))return -1e8;
 let s=0, urgency=0, groups=new Set(dayItems.flatMap(x=>x.tags||[])); const people=Number($('#people').value)||1;
 for(const x of recipeScaledIngredients(r,people)){for(const item of pantry.filter(i=>normalizeName(i.name)===x.n&&i.qty>0).sort((a,b)=>a.expiry.localeCompare(b.expiry)).slice(0,2)){const d=daysFromToday(item.expiry)-day;urgency+=d<=3?10:d<=7?5:d<=14?2:0;}}
 s+=urgency*2.4 + (r.veg||0)*4 + (r.grain||0)*3 + (r.tags||[]).filter(t=>!groups.has(t)).length*1.5;
 if(dayItems.some(x=>x.protein===r.protein))s-=16;else s+=7;
 if(state.profile==='sport'&&r.p>=32)s+=10;if(state.profile==='elegant'&&(r.tags||[]).some(t=>['elegante','omega-3','forno','curato'].includes(t)))s+=7;
 if(dayItems.reduce((z,x)=>z+x.kcal,0)+r.kcal>nutritionTarget().kcal/2*1.2)s-=6;
 return s+Math.random()*2;
}
function generateDynamicRecipes(pantry,people){
 const avail=[...new Set(pantry.filter(i=>i.qty>0).map(i=>normalizeName(i.name)))]; const veg=avail.filter(n=>GROUPS.vegetables.has(n)); const carb=avail.filter(n=>GROUPS.grains.has(n)&&n!=='patate'); const starchy=avail.filter(n=>n==='patate'); const protein=avail.filter(n=>proteinFamily(n)); const fats=avail.filter(n=>GROUPS.healthyFat.has(n)); const out=[];
 let seq=0;
 for(const p of protein){for(const v of veg){for(const c of (carb.length?carb:starchy)){if(out.length>220)break;const mealStyle=state.profile==='elegant'?'elegant':state.profile;const kcal=480+(proteinFamily(p)==='fish'?80:proteinFamily(p)==='legume'?40:0)+30;const gramsP=proteinFamily(p)==='fish'||proteinFamily(p)==='meat'?38:proteinFamily(p)==='egg'?25:proteinFamily(p)==='legume'?22:24;out.push({id:`gen-${seq++}-${p}-${v}-${c}`,name:`${capitalize(p)} con ${v} e ${c}`,time:25,diff:1,tags:['generata','zero sprechi',mealStyle],style:['normal','sport','elegant'],ingredients:[[displayIngredient(p),proteinQty(p),unitFor(p)],[v,250,'g'],[c,150,'g'],...(fats.length?[[fats[0],10,'g']]:[])],kcal,p:gramsP,c:65,f:15,veg:1,grain:c!=='patate'?1:0,protein:proteinFamily(p)});}}}
 return out;
}
function displayIngredient(n){return n==='uova'?'uova':n}
function proteinQty(n){return n==='uova'?4:320}
function unitFor(n){return n==='uova'?'pz':'g'}
function capitalize(s){return s.charAt(0).toUpperCase()+s.slice(1)}
function buildPlan(){
 const active=state.pantry.filter(i=>i.qty>0&&daysFromToday(i.expiry)>=0); if(!active.length){toast('Inserisci almeno un ingrediente.');return}
 const people=Number($('#people').value)||1;const work=JSON.parse(JSON.stringify(active));const allRecipes=[...RECIPES,...generateDynamicRecipes(active,people)];const used=new Set();const slots=[];const maxDiff=Number($('#difficulty').value);
 for(let d=0;d<7;d++){const dayItems=[];for(let m=0;m<2;m++){const ranked=allRecipes.filter(r=>r.diff<=maxDiff&&!used.has(r.id)&&recipeCovered(r,work,people)).map(r=>({r,s:scoreRecipe(r,work,d,used,dayItems)})).sort((a,b)=>b.s-a.s);let pick=ranked[0]?.r;if(!pick){break}used.add(pick.id);consumeRecipe(work,pick,people);dayItems.push(pick)}slots.push(dayItems)}
 state.plan={start:$('#weekStart').value||mondayOf(),slots,profile:state.profile,createdAt:new Date().toISOString()};save();renderPlan();buildSuggestions();toast(`Menu creato: ${slots.reduce((n,d)=>n+d.length,0)}/14 pasti coperti dalla spesa.`);
}
function renderPlan(){
 const plan=state.plan;if(!plan){$('#planGrid').innerHTML='';$('#weeklySummary').classList.add('hidden');$('#leftovers').classList.add('hidden');return}
 const start=parseDate(plan.start);$('#planStatus').innerHTML=`<b>${PROFILE_INFO[state.profile].name}</b> · ${fmtDate(plan.start)} → ${fmtDate(addDays(plan.start,6))}. <span class="status-good">Ogni ricetta mostrata è coperta dalla spesa inserita.</span>`;
 $('#planGrid').innerHTML=plan.slots.map((day,di)=>{const date=addDays(plan.start,di);return `<div class="day-card"><div class="day-top"><div class="day-name">${DAY_NAMES[di]}</div><div class="day-date">${fmtDate(date)}</div></div>${day.map((r,mi)=>`<button class="meal" data-recipe="${escapeHtml(r.id)}"><div class="meal-type">${mi===0?'☀️ Pranzo':'🌙 Cena'}</div><div class="meal-title">${escapeHtml(r.name)}</div><div class="meal-tags">${(r.tags||[]).slice(0,3).map(t=>`<span class="tag">${escapeHtml(t)}</span>`).join('')}</div><div class="meal-kcal">${r.kcal} kcal · ${r.p}g P · ${r.c}g C · ${r.f}g G</div><div class="meal-open">Apri ricetta ↗</div></button>`).join(day.length<2?`<div class="meal-gap">Nessuna ricetta completamente coperta: meglio aggiungere un ingrediente piuttosto che inventarne uno.</div>`:'')}</div>`}).join('');
 $$('.meal[data-recipe]').forEach(b=>b.onclick=()=>openRecipe(findRecipe(b.dataset.recipe)));
 const all=plan.slots.flat();const totals=all.reduce((a,r)=>({k:a.k+r.kcal,p:a.p+r.p,c:a.c+r.c,f:a.f+r.f}),{k:0,p:0,c:0,f:0});$('#weeklySummary').classList.remove('hidden');$('#weeklySummary').innerHTML=`<div class="metric"><strong>${all.length}/14</strong><span>pasti coperti dalla spesa</span></div><div class="metric"><strong>${Math.round(totals.k/7)}</strong><span>kcal/giorno · solo pranzo+cena</span></div><div class="metric"><strong>${Math.round(totals.p/7)} g</strong><span>proteine/giorno · solo pranzo+cena</span></div><div class="metric"><strong>${new Set(all.map(r=>r.protein)).size}</strong><span>famiglie proteiche</span></div>`;
 renderLeftovers();
}
function findRecipe(id){return [...RECIPES,...(state.plan?.slots?.flat()||[]),...generateDynamicRecipes(state.pantry,Number($('#people').value)||1)].find(r=>r.id===id)}
function renderLeftovers(){if(!state.plan)return;const people=Number($('#people').value)||1;const sim=JSON.parse(JSON.stringify(state.pantry.filter(i=>i.qty>0)));state.plan.slots.flat().forEach(r=>consumeRecipe(sim,r,people));const left=sim.filter(i=>i.qty>0.5);$('#leftovers').classList.remove('hidden');$('#leftovers').innerHTML=`<div><b>🧺 Cosa resta</b><span>${left.length?'Ti restano ancora: '+left.map(i=>`${escapeHtml(i.name)} ${round(i.qty)}${i.unit}`).join(' · '):'Quasi tutto esaurito.'}</span></div>`}
function recipeInstructions(r){
 const names=r.ingredients.map(x=>x[0].toLowerCase());const oven=(r.tags||[]).includes('forno'); const main=r.ingredients[0]?.[0]||'ingrediente principale';
 const steps=[`Prepara tutti gli ingredienti e taglia le verdure in pezzi simili.`,`Cuoci ${main.toLowerCase()} con il metodo indicato nella ricetta base, regolando il calore per evitare di asciugarlo.`,`Aggiungi le verdure e cuocile fino a renderle tenere ma ancora consistenti.`,`Prepara il cereale o la fonte amidacea prevista e unisci il condimento senza eccedere con i grassi.`,oven?'Se usi il forno, cuoci finché la superficie è ben dorata e il centro è completamente cotto.':'Assaggia, aggiusta con gli aromi che hai già disponibili e servi subito.',`Impiatta cercando una quota evidente di verdure e una porzione adeguata di proteine e carboidrati.`];return steps}
function openRecipe(r){if(!r)return;const people=Number($('#people').value)||1;const ins=recipeScaledIngredients(r,people);$('#modalContent').innerHTML=`<div class="modal-eyebrow">${r.tags?.slice(0,3).map(escapeHtml).join(' · ')||'ricetta Gnam'}</div><h2 id="modalTitle">${escapeHtml(r.name)}</h2><div class="modal-stats"><span>⏱ ${r.time} min</span><span>⚡ difficoltà ${r.diff}/3</span><span>🔥 ${r.kcal} kcal / porzione</span><span>🥩 ${r.p}g P</span></div><div class="modal-columns"><div><h3>Ingredienti · ${people} ${people===1?'persona':'persone'}</h3><ul class="ingredient-detail">${ins.map(x=>`<li><b>${round(x.q)} ${x.u}</b> ${escapeHtml(x.label)}</li>`).join('')}</ul></div><div><h3>Preparazione</h3><ol class="steps">${recipeInstructions(r).map(s=>`<li>${escapeHtml(s)}</li>`).join('')}</ol></div></div><div class="tip-box"><b>💡 Gnam tip</b> Questa ricetta è stata selezionata perché gli ingredienti erano già presenti nella spesa; le quantità sono indicative e vanno adattate alla confezione e alla tua fame.</div>`;$('#recipeModal').classList.remove('hidden')}
function closeModal(){$('#recipeModal').classList.add('hidden')}

function checkShopping(silent=false){
 const pantry=state.pantry.filter(i=>i.qty>0);if(!pantry.length){state.score=null;renderCheck();return}
 const present=new Set(pantry.map(i=>normalizeName(i.name))), v=hasAny(GROUPS.vegetables,pantry), fr=hasAny(GROUPS.fruit,pantry), leg=hasAny(GROUPS.legumes,pantry), grain=hasAny(GROUPS.grains,pantry), protein=hasAny(new Set([...Object.values(PROTEIN_MAP).flat()]),pantry), dairy=hasAny(GROUPS.dairy,pantry), fat=hasAny(GROUPS.healthyFat,pantry);
 const fresh=pantry.filter(i=>daysFromToday(i.expiry)<=7).length, long=pantry.filter(i=>daysFromToday(i.expiry)>14).length, spoil=pantry.filter(i=>daysFromToday(i.expiry)<=3).length;
 const proteinFamilies=new Set(pantry.map(i=>proteinFamily(normalizeName(i.name))).filter(Boolean));
 const plantVariety=new Set([...GROUPS.vegetables,...GROUPS.fruit,...GROUPS.legumes].filter(n=>present.has(n))).size;
 const macro=aggregateMacros(pantry);const macroProteinPct=macro.k?macro.p*4/macro.k*100:0;const fiberPotential=(v?8:0)+(leg?8:0)+(grain?7:0)+(fr?5:0)+(present.has('noci')||present.has('mandorle')?3:0);
 let score=0;score+=v?14:0;score+=fr?8:0;score+=leg?12:0;score+=grain?12:0;score+=protein?12:0;score+=dairy?6:0;score+=fat?8:0;score+=Math.min(12,proteinFamilies.size*4);score+=Math.min(8,plantVariety*1.6);score+=Math.min(8,fiberPotential);score+=fresh>0&&long>0?7:3;score-=spoil>5?4:0;score=Math.max(1,Math.min(100,Math.round(score)));
 const micron=[]; if(v)micron.push(['Vitamina C + folati','buona base']); else micron.push(['Vitamina C + folati','aggiungi più verdure/frutta']); if(leg||protein)micron.push(['Ferro + B-vitamine','presenza di fonti utili']);else micron.push(['Ferro','manca una fonte evidente']); if(dairy)micron.push(['Calcio','buona copertura potenziale']);else micron.push(['Calcio','aggiungi latticini o alternativa fortificata']); if(pantry.some(i=>['salmone','orata','noci'].includes(normalizeName(i.name))))micron.push(['Omega-3','presenza di una fonte utile']);else micron.push(['Omega-3','aggiungi pesce grasso o frutta secca']);
 const suggestions=[]; if(!v)suggestions.push('Aggiungi 2 verdure diverse: è la lacuna più importante.'); if(!leg)suggestions.push('Aggiungi ceci, lenticchie o fagioli per fibra e proteine vegetali.'); if(!grain)suggestions.push('Aggiungi un cereale o pane, idealmente integrale.'); if(proteinFamilies.size<2)suggestions.push('Varia la fonte proteica: uova, pesce, legumi o carni bianche.'); if(!fat)suggestions.push('Aggiungi una fonte di grassi prevalentemente insaturi, come olio EVO o frutta secca.'); if(fresh===0)suggestions.push('La spesa è molto conservativa: inserisci almeno qualche alimento fresco.'); if(long===0)suggestions.push('Hai poco “zaino di dispensa”: una base a lunga conservazione rende la settimana più resiliente.');
 state.score={score,proteinFamilies:[...proteinFamilies],macro,macroProteinPct,fresh,long,micro:micron,suggestions:suggestions.slice(0,4)};save();renderCheck();if(!silent)$('#checkSection').scrollIntoView({behavior:'smooth',block:'start'})
}
function renderCheck(){const x=state.score;if(!x){$('#shoppingScoreBadge').textContent='— / 100';$('#shoppingScoreBadge').className='score-badge neutral';$('#shoppingCheck').innerHTML=`<div class="check-face">🔎</div><div><h3>Fai il check quando hai finito.</h3><p>Premi “Controlla la spesa” per una lettura pratica della qualità del mix.</p></div>`;return}const cls=x.score>=80?'great':x.score>=65?'good':x.score>=50?'mid':'low';$('#shoppingScoreBadge').textContent=`${x.score} / 100`;$('#shoppingScoreBadge').className=`score-badge ${cls}`;$('#shoppingCheck').innerHTML=`<div class="score-big ${cls}">${x.score}</div><div class="check-main"><div class="check-grid"><div><span>🥬</span><b>Quota vegetale</b><small>${x.suggestions.some(s=>s.includes('verdure'))?'da rinforzare':'presente'}</small></div><div><span>💪</span><b>Varietà proteine</b><small>${x.proteinFamilies.length} famiglie</small></div><div><span>🌾</span><b>Fibra potenziale</b><small>${Math.min(100,Math.round(x.macroProteinPct))}% kcal da proteine · indicatore non clinico</small></div><div><span>⏳</span><b>Fresco + dispensa</b><small>${x.fresh} freschi · ${x.long} lunga conservazione</small></div></div><div class="micro-list"><b>Micronutrienti: cosa vedo nella spesa</b>${x.micro.map(m=>`<span><strong>${escapeHtml(m[0])}</strong> · ${escapeHtml(m[1])}</span>`).join('')}</div><div class="improve"><b>🎯 Come alzerei lo score</b>${x.suggestions.length?x.suggestions.map(s=>`<span>→ ${escapeHtml(s)}</span>`).join(''):'<span>La spesa è molto ben costruita: ora conta soprattutto usarla senza sprechi.</span>'}</div></div>`}
function buildSuggestions(){if(!state.plan)return;const pantry=JSON.parse(JSON.stringify(state.pantry));const available=new Set(pantry.filter(i=>i.qty>0).map(i=>normalizeName(i.name)));const candidateMissing=[...Object.keys(EXPIRY)].filter(n=>!available.has(n));const pairs=[];for(const r of [...RECIPES,...generateDynamicRecipes(pantry,1)]){if(recipeCovered(r,pantry,1))continue;const missing=recipeScaledIngredients(r,1).filter(x=>availableFor(x,pantry)<baseAmount(x.q,x.u)).map(x=>x.label);const uniq=[...new Set(missing)];if(uniq.length===1)pairs.push({r,missing:uniq[0]})}const unique=[];const seen=new Set();for(const p of pairs.sort(()=>Math.random()-.5)){if(!seen.has(p.r.name)){seen.add(p.r.name);unique.push(p);if(unique.length>=6)break}}state.suggestions=unique;save();renderSuggestions()}
function renderSuggestions(){const a=state.suggestions||[];$('#suggestionSection').classList.toggle('hidden',!a.length);$('#suggestionGrid').innerHTML=a.map(x=>`<button class="suggestion-card" data-suggest="${escapeHtml(x.r.id)}"><div class="suggestion-art">+1</div><div><span class="suggestion-add">Ti manca solo</span><h3>${escapeHtml(x.missing)}</h3><p>${escapeHtml(x.r.name)}</p><small>${x.r.kcal} kcal · ${x.r.time} min</small></div></button>`).join('');$$('[data-suggest]').forEach(b=>b.onclick=()=>openRecipe(findRecipe(b.dataset.suggest)))}
async function webSearch(){const active=state.pantry.filter(i=>i.qty>0&&daysFromToday(i.expiry)>=0).sort((a,b)=>a.expiry.localeCompare(b.expiry));if(!active.length){toast('Prima inserisci qualche ingrediente.');return}$('#webRecipesSection').classList.remove('hidden');$('#webGrid').innerHTML='<div class="small-note">Cerco ricette online…</div>';const query=normalizeName(active[0].name).replace(/\s+/g,'_');try{const res=await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(query)}`);const data=await res.json();let meals=(data.meals||[]).slice(0,6);if(!meals.length){const r=await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(active[0].name)}`);meals=((await r.json()).meals||[]).slice(0,6)}$('#webGrid').innerHTML=meals.length?meals.map(m=>`<article class="web-card"><img src="${m.strMealThumb}" alt=""><div class="web-body"><h3>${escapeHtml(m.strMeal)}</h3><p>${escapeHtml(m.strCategory||'Ricetta')} · ${escapeHtml(m.strArea||'internazionale')}</p><a href="https://www.themealdb.com/meal.php?c=${m.idMeal}" target="_blank" rel="noreferrer">Apri ricetta ↗</a></div></article>`).join(''):'<div class="small-note">Nessun risultato utile dalla ricerca gratuita. Il motore locale continua a funzionare.</div>'}catch(e){$('#webGrid').innerHTML='<div class="small-note">La sorgente web non risponde adesso. Nessun problema: Gnam funziona comunque offline.</div>'}}
function loadDemo(){const b=BUDGETS[1];const today=todayISO();addPantryItems(b.items.map((x,i)=>[x[0],x[1],x[2],addDays(today,i<7?i+1:(i+1)*3)]));buildPlan();checkShopping(true);toast('Spesa demo caricata e menu generato.')}
function bind(){
 $('#ingredientName').addEventListener('input',e=>{const d=inputDateFromName(e.target.value);if(d)$('#ingredientExpiry').value=d;const info=EXPIRY[normalizeName(e.target.value)];if(info&&!$('#ingredientQty').dataset.userUnit)$('#ingredientUnit').value=info.unit});
 $('#ingredientQty').addEventListener('input',()=>$('#ingredientQty').dataset.userQty='1');$('#ingredientUnit').addEventListener('change',()=>$('#ingredientQty').dataset.userUnit='1');
 $('#ingredientForm').addEventListener('submit',e=>{e.preventDefault();const raw=$('#ingredientName').value.trim(),name=normalizeName(raw),qty=Number($('#ingredientQty').value),unit=$('#ingredientUnit').value,expiry=$('#ingredientExpiry').value;if(!name||!qty||!expiry)return;state.pantry.push({id:`i-${Date.now()}-${Math.random()}`,name,qty,unit,expiry});state.plan=null;state.score=null;state.suggestions=[];save();renderPantry();renderCheck();renderPlan();toast(`${raw} aggiunto.`);$('#ingredientName').value='';$('#ingredientQty').value='300';$('#ingredientExpiry').value=addDays(todayISO(),7)});
 $$('.profile-tab').forEach(b=>b.onclick=()=>{state.profile=b.dataset.profile;$$(".profile-tab").forEach(x=>x.classList.toggle('active',x===b));$('#profileNote').textContent=PROFILE_INFO[state.profile].note;save();if(state.plan)buildPlan()});
 $('#generateBtn').onclick=buildPlan;$('#generateTopBtn').onclick=()=>{buildPlan();$('#planSection').scrollIntoView({behavior:'smooth'})};$('#checkBtn').onclick=()=>checkShopping();$('#webBtn').onclick=webSearch;$('#demoBtn').onclick=loadDemo;
 $$('[data-close-modal]').forEach(e=>e.onclick=closeModal);document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});
}
function init(){renderPresets();renderQuickAdds();$('#weekStart').value=state.plan?.start||mondayOf();$('#profileNote').textContent=PROFILE_INFO[state.profile].note;$$('.profile-tab').forEach(x=>x.classList.toggle('active',x.dataset.profile===state.profile));renderPantry();renderCheck();renderSuggestions();renderPlan();bind()}
init();
