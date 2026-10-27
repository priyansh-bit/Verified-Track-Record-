window.addEventListener('error',function(){document.documentElement.classList.remove('js');});
window.addEventListener('unhandledrejection',function(){document.documentElement.classList.remove('js');});
const $=s=>document.querySelector(s),RM=matchMedia('(prefers-reduced-motion:reduce)').matches,SRC=$('[data-hero]').src;
const IC={tg:'M12 3v18M3 12h18M6 6l12 12',a:'M3 17l6-6 4 4 8-9',b:'M12 3l9 5-9 5-9-5zM3 13l9 5 9-5',c:'M3 20V10M9 20V4M15 20v-8M21 20H3',d:'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z',e:'M4 4h16v16H4zM8 12h8M12 8v8'};
const ico=d=>`<svg class="i" viewBox="0 0 24 24"><path d="${d}"/></svg>`;
$('#tl').innerHTML=[['Trading Focus','Liquidity-Based Market Analysis'],['Methodology','Structured Trading Methodology'],['Market Analysis','Multi-Timeframe Analysis'],['Core Concepts','Liquidity Sweeps & Market Structure'],['Risk Philosophy','Risk Management & Trade Discipline'],['Continuous Development','Backtesting, Journaling & Performance Review']].map(([a,b])=>`<div class="card rv"><small>${a}</small><h3>${b}</h3></div>`).join('');
$('#ap').innerHTML=[['b','Higher-Timeframe Context','Establishing directional context before evaluating lower-timeframe setups.'],['c','Liquidity Analysis','Studying liquidity pools, session highs and lows, and potential sweep areas.'],['a','Market Structure','Evaluating structural confirmation before considering a trading setup.'],['d','Risk Management','Prioritizing controlled risk, disciplined execution, and consistent trade documentation.']].map(([k,t,p],i)=>`<div class="card rv" style="transition-delay:${i*80}ms"><span class="num">0${i+1}</span><div class="ico">${ico(IC[k])}</div><h3>${t}</h3><p>${p}</p></div>`).join('');
/* ================================================================
   TRADE REPORTS - PRESENTATION LOGIC
   Reads DAILY_REPORTS / MONTHLY_REPORTS / TELEGRAM / TICKER_QUOTE
   from the separate data block above. All counts are calculated
   here from the trade records. No profit/loss amounts are used.
   ================================================================ */
const esc=v=>String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const NF=new Intl.NumberFormat('en-US');
const pct1=v=>{const x=Math.round(v*10)/10;return (Number.isInteger(x)?String(x):x.toFixed(1))+'%'};
const rr1=v=>{const x=Math.round(v*100)/100;return '1 : '+(Number.isInteger(x*10)?x.toFixed(1):x.toFixed(2))};
const FM={int:v=>NF.format(Math.round(v)),pct:pct1,rr:rr1};
/* RR per trade: accepts 2, 2.5, "1:2" or "1:2.5" (reward per 1 unit of risk) */
function parseRR(v){
 if(v==null||v==='')return null;const t=String(v).trim().replace(/\s/g,'');let m;
 if((m=t.match(/^(\d+(?:\.\d+)?):(\d+(?:\.\d+)?)$/))){const a=+m[1],b=+m[2];return a>0?b/a:null;}
 if(/^\d+(\.\d+)?$/.test(t)){const n=+t;return n>0?n:null;}
 return null;
}
const MN=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MFULL=['January','February','March','April','May','June','July','August','September','October','November','December'];
const pad=n=>String(n).padStart(2,'0');
const keyOf=(y,m,d)=>y+'-'+pad(m)+'-'+pad(d);
const todayKey=(()=>{const n=new Date();return keyOf(n.getFullYear(),n.getMonth()+1,n.getDate())})();
const fmtDate=d=>{const p=String(d).split('-');return p.length===3?(+p[2])+' '+MN[+p[1]-1]+' '+p[0]:String(d)};
const fmtMonth=(k,full)=>{const p=String(k).split('-');return (full?MFULL:MN)[+p[1]-1]+' '+p[0]};
const wkday=k=>{const p=k.split('-');return new Date(+p[0],+p[1]-1,+p[2]).toLocaleDateString('en-US',{weekday:'long'})};
const RES={TP:{label:'Take Profit (TP)',short:'TP',bdg:'l',out:'Winning',c:'up'},SL:{label:'Stop Loss (SL)',short:'SL',bdg:'s',out:'Losing',c:'dn'}};
const ICO_FILTER='<svg class="i" viewBox="0 0 24 24"><path d="M4 7h16M7 12h10M10 17h4"/></svg>';
function count(){document.querySelectorAll('[data-to]').forEach(e=>{const to=+e.dataset.to,f=FM[e.dataset.f];if(!f)return;if(RM){e.textContent=f(to);return}const t0=performance.now(),fr=to%1!==0;(function a(t){const k=Math.min(1,(t-t0)/1400);let v=to*(1-Math.pow(1-k,3));if(!fr)v=Math.round(v);e.textContent=f(v);if(k<1)requestAnimationFrame(a)})(t0)})}

/* tally(): every count on this page comes from here.
   TP = winning trade, SL = losing trade. */
function tally(trades){
 let tp=0,sl=0;
 trades.forEach(t=>{const r=String(t.result||'').toUpperCase();if(r==='TP')tp++;else if(r==='SL')sl++;else console.warn('[trade-reports] result must be "TP" or "SL"; counted in total only',t);});
 return{total:trades.length,tp,sl};
}
/* clean daily records: one record per date, one entry per trade number */
function cleanDaily(src){
 const seenD=new Set(),out=[];
 (src||[]).forEach(d=>{
  if(!d||!/^\d{4}-\d{2}-\d{2}$/.test(d.date||'')){console.warn('[trade-reports] daily report skipped (date must be YYYY-MM-DD)',d);return;}
  if(seenD.has(d.date)){console.warn('[trade-reports] duplicate daily report for '+d.date+' ignored - merge its trades into the first entry');return;}
  seenD.add(d.date);
  const seenT=new Set(),trades=[];
  (d.trades||[]).forEach((t,i)=>{const k=t.no!=null?String(t.no):'i'+i;if(seenT.has(k)){console.warn('[trade-reports] duplicate trade no. '+k+' on '+d.date+' ignored');return;}seenT.add(k);trades.push(t);});
  out.push({date:d.date,trades});
 });
 return out.sort((a,b)=>a.date<b.date?1:a.date>b.date?-1:0);
}
let DAILY=[],ROWS=[],CALM=[],CI=-1,CSEL=null,MONTHS=[],MSEL=null;
function rebuild(src){
 DAILY=cleanDaily(src);ROWS=[];
 DAILY.forEach(d=>d.trades.forEach((t,i)=>ROWS.push({date:d.date,no:t.no!=null?t.no:i+1,result:String(t.result||'').toUpperCase(),status:t.status||'Not stated',t})));
 CALM=[...new Set(DAILY.map(d=>d.date.slice(0,7)))].sort();CI=CALM.length-1;CSEL=DAILY[0]?DAILY[0].date:null;
 MONTHS=buildMonths();MSEL=null;
}
const dayKind=t=>t.tp>t.sl?'tp':t.sl>t.tp?'sl':'mx';

/* ---------- report filter state (applied) ---------- */
let FLT={mode:'new',from:null,to:null};
const fltActive=f=>f.mode!=='new';
const fltText=f=>f.mode==='old'?'Oldest first':f.mode==='custom'?'Custom range':'Newest first';
const fltRange=f=>f.mode==='custom'?(f.from===f.to?fmtDate(f.from):fmtDate(f.from)+' – '+fmtDate(f.to)):'all dates';

/* ---------- performance overview: win rate, avg RR, total trades (follows the filter) ---------- */
let SKIP=0;
function renderStats(animate){
 const rows=visibleRows(),T=tally(rows.map(r=>r.t)),decided=T.tp+T.sl;
 const wr=decided?T.tp/decided*100:null;
 const rrs=rows.map(r=>parseRR(r.t.rr)).filter(x=>x!=null),arr=rrs.length?rrs.reduce((a,b)=>a+b,0)/rrs.length:null;
 $('#trDayTitle').textContent='Performance Overview';
 $('#trDayDate').textContent=fltActive(FLT)&&FLT.mode==='custom'?'Selected range: '+fltRange(FLT):(ROWS.length?'Based on '+ROWS.length+' recorded trade'+(ROWS.length===1?'':'s'):'');
 const defs=[
  {l:'Win Rate',v:wr,f:'pct',s:decided?T.tp+' winning · '+T.sl+' losing':'No trades yet'},
  {l:'Avg RR',v:arr,f:'rr',s:rrs.length?'Average of '+rrs.length+' trade'+(rrs.length===1?'':'s')+' with RR':'RR not added yet'},
  {l:'Total Trades',v:T.total,f:'int',s:fltActive(FLT)&&FLT.mode==='custom'?'In selected range':'All recorded trades'}
 ];
 $('#trKpis').innerHTML=defs.map(x=>{const has=x.v!=null;
  const attrs=has&&animate?` data-to="${x.v}" data-f="${x.f}"`:'';
  const txt=has?(animate?FM[x.f](0):FM[x.f](x.v)):'&mdash;';
  return `<div class="kpi rv in"><small>${x.l}</small><div class="v"${attrs}>${txt}</div><div class="s">${x.s}</div></div>`;}).join('');
}

/* ---------- trade breakdown table (filterable) ---------- */
function visibleRows(){
 const dir=FLT.mode==='old'?1:-1;
 return ROWS.filter(x=>FLT.mode!=='custom'||(x.date>=FLT.from&&x.date<=FLT.to))
  .sort((a,b)=>a.date<b.date?-dir:a.date>b.date?dir:(+a.no||0)-(+b.no||0));
}
const OPTC=[['symbol','Instrument'],['direction','Direction'],['entry','Entry'],['exit','Exit'],['lot','Lot'],['rr','RR']];
const has=v=>v!=null&&v!=='';
function renderTable(){
 const rows=visibleRows(),T=tally(rows.map(r=>r.t));
 const cols=OPTC.filter(c=>ROWS.some(r=>has(r.t[c[0]])));      /* optional columns appear only when you fill them in */
 $('#trHead').innerHTML='<tr><th>Date</th><th>Trade</th>'+cols.map(c=>'<th>'+c[1]+'</th>').join('')+'<th>Result</th><th>Outcome</th><th>Status</th></tr>';
 const cell=(r,c)=>{const v=r.t[c[0]];if(!has(v))return '<td>&mdash;</td>';if(c[0]==='rr'){const n=parseRR(v);return '<td>'+(n!=null?rr1(n):'&mdash;')+'</td>';}return '<td>'+esc(v)+'</td>';};
 $('#trBody').innerHTML=rows.length?rows.map(r=>{
  const m=RES[r.result];
  return `<tr><td class="n">${esc(fmtDate(r.date))}</td><td>${esc(String(r.no).padStart(2,'0'))}</td>${cols.map(c=>cell(r,c)).join('')}<td><span class="bdg ${m?m.bdg:'p'}" title="${esc(m?m.label:r.result)}">${esc(m?m.short:r.result||'—')}</span></td><td class="${m?m.c:''}">${m?m.out:'—'}</td><td><span class="bdg p">${esc(r.status)}</span></td></tr>`;
 }).join(''):`<tr><td colspan="${5+cols.length}"><div class="empty">No trades in the selected range.</div></td></tr>`;
 $('#trFoot').innerHTML=`<span>Showing <b>${rows.length}</b> of <b>${ROWS.length}</b> trade${ROWS.length===1?'':'s'}</span><span>Winning (TP) <b class="up">${T.tp}</b></span><span>Losing (SL) <b class="dn">${T.sl}</b></span>`;
 $('#trFsum').innerHTML=`Showing <b>${fltText(FLT)}</b> &middot; ${esc(fltRange(FLT))}`+(fltActive(FLT)?' <button type="button" class="chip fclr" id="trFltClr">Clear &#10005;</button>':'');
 const btn=$('#trFltBtn');btn.classList.toggle('on',fltActive(FLT));
 $('#trFltTag').textContent=fltActive(FLT)?fltText(FLT):'';
 const c=$('#trFltClr');if(c)c.onclick=()=>{FLT={mode:'new',from:null,to:null};renderAll();};
 $('#trBrkNote').textContent=[cols.length?'':'Summary records · trade details not yet provided',SKIP?SKIP+' sheet row'+(SKIP===1?'':'s')+' skipped (invalid date or result)':''].filter(Boolean).join(' · ');
}

/* ---------- iOS-style calendar ---------- */
function renderCal(){
 const host=$('#trCal'),key=CALM.length?CALM[CI]:todayKey.slice(0,7),y=+key.slice(0,4),mo=+key.slice(5,7);
 const first=new Date(y,mo-1,1).getDay(),days=new Date(y,mo,0).getDate(),by={};
 DAILY.forEach(d=>{if(d.date.slice(0,7)===key)by[+d.date.slice(8,10)]=tally(d.trades);});
 let g='<span class="ic-x"></span>'.repeat(first);
 for(let d=1;d<=days;d++){
  const k=keyOf(y,mo,d),e=by[d];
  const c='ic-d'+(e?' '+dayKind(e):'')+(k===todayKey?' today':'')+(k===CSEL?' sel':'');
  g+=e?`<button type="button" class="${c}" data-d="${k}" aria-pressed="${k===CSEL}" aria-label="${esc(fmtDate(k))}: ${e.tp} TP, ${e.sl} SL">${d}</button>`:`<span class="${c}">${d}</span>`;
 }
 host.innerHTML=`<div class="ic-head"><div class="ic-title">${MFULL[mo-1]}<span>${y}</span></div><div class="ic-nav"><button type="button" id="calPrev" aria-label="Previous month"${CI<=0?' disabled':''}>&#8249;</button><button type="button" id="calNext" aria-label="Next month"${CI>=CALM.length-1?' disabled':''}>&#8250;</button></div></div>
 <div class="ic-dow">${'SMTWTFS'.split('').map(x=>`<span>${x}</span>`).join('')}</div><div class="ic-grid">${g}</div>
 <div class="ic-leg"><span><i style="background:var(--up)"></i>Winning day</span><span><i style="background:var(--dn)"></i>Losing day</span><span><i style="background:var(--gold)"></i>Mixed (equal TP &amp; SL)</span></div>`;
 host.querySelectorAll('button.ic-d').forEach(b=>b.onclick=()=>{CSEL=b.dataset.d;renderCal();renderDay();});
 const go=n=>{CI=Math.max(0,Math.min(CALM.length-1,CI+n));const ds=DAILY.filter(d=>d.date.slice(0,7)===CALM[CI]);CSEL=ds.length?ds[0].date:null;renderCal();renderDay();};
 const pv=$('#calPrev'),nx=$('#calNext');pv.onclick=()=>go(-1);nx.onclick=()=>go(1);
}
function renderDay(){
 const host=$('#trDay'),d=DAILY.find(x=>x.date===CSEL);
 if(!d){host.innerHTML='<h4>Day details</h4><div class="empty">No report for this month yet.</div>';return;}
 const T=tally(d.trades),kind=dayKind(T),kl={tp:['Winning day','up'],sl:['Losing day','dn'],mx:['Mixed day','']}[kind];
 host.innerHTML=`<h4>${esc(wkday(d.date))}, ${esc(fmtDate(d.date))}<span>${T.total} trade${T.total===1?'':'s'}</span></h4>
 <div class="sr"><span>Day result</span><span class="${kl[1]}">${kl[0]}</span></div>
 <div class="sr"><span>Winning trades (TP)</span><span class="${T.tp?'up':''}">${T.tp}</span></div>
 <div class="sr"><span>Losing trades (SL)</span><span class="${T.sl?'dn':''}">${T.sl}</span></div>
 <div class="mhd">Trades</div>`+d.trades.map((t,i)=>{const r=String(t.result||'').toUpperCase(),m=RES[r],no=t.no!=null?t.no:i+1;
  return `<div class="sr"><span>Trade ${esc(String(no).padStart(2,'0'))}</span><span><span class="bdg ${m?m.bdg:'p'}">${esc(m?m.label:(t.result||'Not stated'))}</span></span></div>`;}).join('');
}

/* ---------- monthly reports ---------- */
function buildMonths(){
 const map={};
 DAILY.forEach(d=>{const k=d.date.slice(0,7);(map[k]=map[k]||{month:k,days:[]}).days.push(d);});
 (typeof MONTHLY_REPORTS!=='undefined'?MONTHLY_REPORTS:[]).forEach(m=>{
  if(!m||!/^\d{4}-\d{2}$/.test(m.month||'')){console.warn('[trade-reports] monthly report skipped (month must be YYYY-MM)',m);return;}
  const e=map[m.month]=map[m.month]||{month:m.month,days:[]};
  e.notes=m.notes||'';e.screenshots=Array.isArray(m.screenshots)?m.screenshots:[];if(m.summary)e.summary=m.summary;
 });
 return Object.keys(map).sort().map(k=>{
  const e=map[k];let T,mode;
  if(e.summary){
   const s=e.summary;T={total:+s.totalTrades||0,tp:+s.tpCount||0,sl:+s.slCount||0};
   if(T.tp+T.sl>T.total)console.warn('[trade-reports] '+k+': TP + SL exceed total trades');
   mode='summary';
  }else{T=tally(e.days.reduce((a,d)=>a.concat(d.trades),[]));mode='daily';}
  return{month:k,days:e.days,notes:e.notes||'',screenshots:e.screenshots||[],T,mode};
 });
}
function visibleMonths(){
 const dir=FLT.mode==='old'?1:-1;
 return MONTHS.filter(m=>FLT.mode!=='custom'||(m.month+'-01'<=FLT.to&&m.month+'-31'>=FLT.from))
  .sort((a,b)=>a.month<b.month?-dir:a.month>b.month?dir:0);
}
function renderMonth(){
 const chips=$('#trChips'),box=$('#trMonth'),list=visibleMonths();
 if(!MONTHS.length){chips.innerHTML='';box.innerHTML='<div class="card"><div class="empty">No monthly report has been added yet.</div></div>';$('#trMonthNote').textContent='';return;}
 if(!list.length){chips.innerHTML='';box.innerHTML='<div class="card"><div class="empty">No monthly report falls in the selected range.</div></div>';$('#trMonthNote').textContent='0 of '+MONTHS.length+' reports';return;}
 if(!list.some(m=>m.month===MSEL))MSEL=list[0].month;
 $('#trMonthNote').textContent=(list.length===MONTHS.length?list.length+' report'+(list.length===1?'':'s')+' available':list.length+' of '+MONTHS.length+' reports');
 chips.innerHTML=list.map(m=>`<button type="button" class="chip${m.month===MSEL?' on':''}" data-m="${m.month}" aria-pressed="${m.month===MSEL}">${fmtMonth(m.month)}<em>${m.T.total} trade${m.T.total===1?'':'s'}</em></button>`).join('');
 chips.querySelectorAll('.chip').forEach(b=>b.onclick=()=>{MSEL=b.dataset.m;renderMonth();});
 const m=MONTHS.find(x=>x.month===MSEL),T=m.T;
 const row=(a,b,c)=>`<div class="sr"><span>${a}</span><span class="${c||''}">${b}</span></div>`;
 const badge=m.mode==='daily'?'<span class="bdg o">Compiled from daily records</span>':'<span class="bdg p">Monthly summary &middot; manual entry</span>';
 const cap=m.mode==='daily'
  ?`Counts are calculated from ${T.total} individual trade record${T.total===1?'':'s'} across ${m.days.length} daily report${m.days.length===1?'':'s'}. Days without a report are not included.`
  :`This is a manually entered monthly summary. Individual trades are not itemised and the counts were not recalculated from trade records.`+(m.days.length?` Daily records that exist for this month are not added on top of the summary.`:'');
 const left=`<div>${row('Total trades',T.total)}${row('Winning trades (TP)',T.tp,T.tp?'up':'')}${row('Losing trades (SL)',T.sl,T.sl?'dn':'')}</div>`;
 const right=m.mode==='daily'?`<div><div class="mhd" style="margin-top:0">Daily reports included</div>`+m.days.map(d=>{const t=tally(d.trades);return row(esc(fmtDate(d.date)),t.tp+' TP &middot; '+t.sl+' SL');}).join('')+`</div>`:'';
 const shots=m.screenshots.filter(x=>x&&typeof x.src==='string'&&x.src&&!/^\s*javascript:/i.test(x.src));
 box.innerHTML=`<div class="card rv in"><h4>${esc(fmtMonth(m.month,true))} ${badge}</h4>
 <div class="${right?'mr':''}">${left}${right}</div>
 <div class="mcap">${esc(cap)}</div>
 ${m.notes?`<div class="banner mnote"><b>Notes</b> &nbsp;${esc(m.notes)}</div>`:''}
 ${shots.length?`<div class="mhd">Trading screenshots</div><div class="shots">${shots.map(x=>`<a href="${esc(x.src)}" target="_blank" rel="noopener"><img src="${esc(x.src)}" alt="${esc(x.caption||'Trading screenshot')}" loading="lazy" decoding="async"></a>`).join('')}</div>`:''}</div>`;
}

function renderAll(){renderStats(false);renderTable();renderMonth();}
function renderEverything(){renderAll();renderStats(true);renderCal();renderDay();count();}

/* ---------- optional: read the daily trades from a published Google Sheet (CSV) ---------- */
function parseCSV(t){
 const rows=[];let r=[],f='',q=false;
 for(let i=0;i<t.length;i++){const c=t[i];
  if(q){if(c==='"'){if(t[i+1]==='"'){f+='"';i++;}else q=false;}else f+=c;}
  else if(c==='"')q=true;
  else if(c===','){r.push(f);f='';}
  else if(c==='\n'||c==='\r'){if(c==='\r'&&t[i+1]==='\n')i++;r.push(f);f='';if(r.some(x=>x.trim()!==''))rows.push(r);r=[];}
  else f+=c;}
 r.push(f);if(r.some(x=>x.trim()!==''))rows.push(r);return rows;
}
function normDate(v){
 v=String(v||'').trim();let m;
 if((m=v.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)))return m[1]+'-'+pad(+m[2])+'-'+pad(+m[3]);
 if((m=v.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/)))return m[3]+'-'+pad(+m[2])+'-'+pad(+m[1]); /* day first: DD/MM/YYYY */
 return null;
}
function sheetToDaily(csv){
 const rows=parseCSV(csv);if(rows.length<2)return{daily:[],skipped:0};
 const h=rows[0].map(x=>x.trim().toLowerCase()),ix=n=>h.findIndex(x=>n.includes(x));
 const iD=ix(['date']),iN=ix(['trade','no','trade_no']),iR=ix(['result']),iS=ix(['status']);
 if(iD<0||iR<0)throw new Error('Sheet needs "date" and "result" columns');
 const extra=['symbol','direction','entry','exit','lot','rr'].map(k=>[k,h.indexOf(k)]).filter(a=>a[1]>=0);
 const by={};let skipped=0;
 rows.slice(1).forEach(r=>{
  const d=normDate(r[iD]),res=String(r[iR]||'').trim().toUpperCase();
  if(!d||(res!=='TP'&&res!=='SL')){skipped++;return;}
  const t={result:res,status:(iS>=0&&String(r[iS]||'').trim())||'Closed'};
  if(iN>=0&&String(r[iN]||'').trim()!=='')t.no=String(r[iN]).trim();
  extra.forEach(a=>{const v=String(r[a[1]]||'').trim();if(v)t[a[0]]=v;});
  (by[d]=by[d]||[]).push(t);
 });
 Object.keys(by).forEach(d=>by[d].forEach((t,i)=>{if(t.no==null)t.no=i+1;}));
 return{daily:Object.keys(by).map(d=>({date:d,trades:by[d]})),skipped};
}
async function loadSheet(){
 const u0=typeof SHEET_CSV_URL==='string'?SHEET_CSV_URL.trim():'';if(!u0)return;
 const list=[u0].concat(typeof SHEET_CSV_FALLBACKS!=='undefined'?SHEET_CSV_FALLBACKS:[]).filter(Boolean);
 let lastErr='';
 for(const u of list){
  try{
   const res=await fetch(u+(u.indexOf('?')>-1?'&':'?')+'_='+Date.now(),{cache:'no-store'});
   if(!res.ok)throw new Error('HTTP '+res.status);
   const out=sheetToDaily(await res.text());
   if(!out.daily.length)throw new Error('no valid rows found');
   SKIP=out.skipped;rebuild(out.daily);renderEverything();return;
  }catch(err){lastErr=err.message;}
 }
 console.warn('[trade-reports] spreadsheet not loaded, showing the built-in data instead:',lastErr);
}

/* ---------- website's own filter popup (no browser date picker) ---------- */
let DR={mode:'new',from:null,to:null},PK={y:0,m:0},LASTFOCUS=null;
const MODES=[['new','Newest first'],['old','Oldest first'],['custom','Custom range']];
function renderFilter(){
 $('#fltModes').innerHTML=MODES.map(m=>`<button type="button" class="chip${DR.mode===m[0]?' on':''}" role="radio" aria-checked="${DR.mode===m[0]}" data-mode="${m[0]}">${m[1]}</button>`).join('');
 $('#fltModes').querySelectorAll('.chip').forEach(b=>b.onclick=()=>{DR.mode=b.dataset.mode;renderFilter();});
 const pk=$('#fltPick'),custom=DR.mode==='custom';pk.hidden=!custom;
 if(custom){
  const first=new Date(PK.y,PK.m-1,1).getDay(),days=new Date(PK.y,PK.m,0).getDate(),has=new Set(DAILY.map(d=>d.date));
  const lo=DR.from,hi=DR.to||DR.from;let g='<span class="ic-x"></span>'.repeat(first);
  for(let d=1;d<=days;d++){
   const k=keyOf(PK.y,PK.m,d);let c='ic-d'+(has.has(k)?' dot':'');
   if(lo){if(k===lo)c+=' rs';if(k===hi)c+=' re';if(k>lo&&k<hi)c+=' rm';}
   g+=`<button type="button" class="${c}" data-d="${k}" aria-pressed="${k===lo||k===hi}" aria-label="${esc(fmtDate(k))}">${d}</button>`;
  }
  pk.innerHTML=`<div class="ic-head"><div class="ic-title">${MFULL[PK.m-1]}<span>${PK.y}</span></div><div class="ic-nav"><button type="button" data-n="-1" aria-label="Previous month">&#8249;</button><button type="button" data-n="1" aria-label="Next month">&#8250;</button></div></div><div class="ic-dow">${'SMTWTFS'.split('').map(x=>`<span>${x}</span>`).join('')}</div><div class="ic-grid">${g}</div>`;
  pk.querySelectorAll('[data-n]').forEach(b=>b.onclick=()=>{PK.m+=+b.dataset.n;if(PK.m<1){PK.m=12;PK.y--;}if(PK.m>12){PK.m=1;PK.y++;}renderFilter();});
  pk.querySelectorAll('.ic-d').forEach(b=>b.onclick=()=>{const k=b.dataset.d;if(!DR.from||DR.to){DR.from=k;DR.to=null;}else if(k<DR.from){DR.to=DR.from;DR.from=k;}else DR.to=k;renderFilter();});
 }
 const ok=!custom||!!DR.from;
 $('#fltSum').innerHTML=custom?(DR.from?`<b>From</b> ${esc(fmtDate(DR.from))} &nbsp;&rarr;&nbsp; <b>To</b> ${esc(fmtDate(DR.to||DR.from))}`:'Tap a start date, then an end date. Dots mark days that have a report.'):(DR.mode==='old'?'Oldest reports are listed first.':'Newest reports are listed first.');
 $('#fltApply').disabled=!ok;
}
function openFilter(){
 DR={mode:FLT.mode,from:FLT.from,to:FLT.to};
 const ref=DR.from||(DAILY[0]?DAILY[0].date:todayKey);PK={y:+ref.slice(0,4),m:+ref.slice(5,7)};
 renderFilter();LASTFOCUS=document.activeElement;$('#flt').hidden=false;document.body.style.overflow='hidden';
 setTimeout(()=>{const c=$('#flt .mdlx');if(c)c.focus();},0);
}
function closeFilter(){$('#flt').hidden=true;document.body.style.overflow='';if(LASTFOCUS&&LASTFOCUS.focus)LASTFOCUS.focus();LASTFOCUS=null;}

/* ---------- telegram links + ticker quote (configurable in the data block) ---------- */
function applyTelegram(){
 try{document.querySelectorAll('[data-tg]').forEach(a=>{const u=typeof TELEGRAM!=='undefined'&&TELEGRAM[a.dataset.tg];if(u&&/^https:\/\/t\.me\//.test(u))a.href=u;});}catch(e){}
}
function fitTicker(){
 try{
  const q=typeof TICKER_QUOTE==='string'?TICKER_QUOTE.trim():'',sp=document.querySelectorAll('.ticker-track span');if(!q||!sp.length)return;
  sp.forEach(s=>s.textContent=q);
  const w=sp[0].getBoundingClientRect().width||1,k=Math.max(1,Math.ceil(innerWidth/w));
  if(k>1){const t=Array(k).fill(q).join('   \u25C6   ');sp.forEach(s=>s.textContent=t);}
 }catch(e){}
}

try{
 rebuild(typeof DAILY_REPORTS!=='undefined'?DAILY_REPORTS:[]);renderEverything();applyTelegram();
 $('#trFltBtn').onclick=openFilter;
 $('#fltApply').onclick=()=>{if(DR.mode==='custom'&&!DR.from)return;FLT={mode:DR.mode,from:DR.mode==='custom'?DR.from:null,to:DR.mode==='custom'?(DR.to||DR.from):null};closeFilter();renderAll();};
 $('#fltReset').onclick=()=>{DR={mode:'new',from:null,to:null};renderFilter();};
 $('#flt').addEventListener('click',e=>{if(e.target.hasAttribute('data-close'))closeFilter();});
 $('#flt').addEventListener('keydown',e=>{if(e.key!=='Tab')return;const f=[...$('#flt').querySelectorAll('button:not(:disabled),[tabindex]:not([tabindex="-1"])')].filter(x=>x.offsetParent!==null);if(!f.length)return;const a=f[0],z=f[f.length-1];if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus();}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus();}});
 addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#flt').hidden)closeFilter();});
}catch(err){console.error('[trade-reports]',err);const k=$('#trKpis');if(k)k.innerHTML='<div class="empty" style="grid-column:1/-1">Trade reports are unavailable in this browser.</div>';}
loadSheet();
fitTicker();if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fitTicker);
addEventListener('resize',()=>{clearTimeout(window.__tk);window.__tk=setTimeout(fitTicker,200);});

/* ---------- scroll reveal (shared by every section) + KPI count-up ---------- */
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.15});
document.querySelectorAll('.rv').forEach(e=>io.observe(e));
new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting&&count()),{threshold:.4}).observe($('#trKpis'));
const secs=['home','about','experience','trade-reports','connect'].map(i=>document.getElementById(i)),ls=document.querySelectorAll('.links a,.mobile-links a');
secs.forEach(s=>new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)ls.forEach(a=>a.classList.toggle('on',a.hash==='#'+s.id))}),{rootMargin:'-45% 0px -50% 0px'}).observe(s));
const nav=$('#nav'),mb=$('#mb');mb.onclick=()=>{const o=nav.classList.toggle('open');mb.setAttribute('aria-expanded',String(o))};ls.forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');mb.setAttribute('aria-expanded','false')}));
if(!RM){let t=false;addEventListener('scroll',()=>{if(!t){t=true;requestAnimationFrame(()=>{$('#stage').style.setProperty('--sy',Math.min(scrollY,700)*.07+'px');t=false})}},{passive:true})}

{const pl=document.getElementById('plate');if(pl&&!RM){const st=pl.parentElement;st.addEventListener('pointermove',e=>{const r=st.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;pl.style.transform='rotateY('+x*10+'deg) rotateX('+-y*10+'deg)'});st.addEventListener('pointerleave',()=>pl.style.transform='')}}
