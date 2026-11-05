const CATS={Groceries:["Fresh Basket","Daily Mart","Green Grocer"],Dining:["Cafe Aroma","Spice Route","Biryani House"],Utilities:["Power Board","Broadband","Water Works"],Shopping:["Online Store","Fashion Hub","Electronics Plaza"],Travel:["Rail Booking","Cab Ride","Airline Ticket"],Health:["City Pharmacy","Clinic Visit"],Fuel:["Fuel Station"],Transfers:["UPI Transfer","Bank Transfer"]};
const names=Object.keys(CATS),$=s=>document.getElementById(s),pad=n=>String(n).padStart(2,"0");
const inr=n=>"₹"+Math.round(n).toLocaleString("en-IN"),mk=d=>d.getFullYear()+"-"+pad(d.getMonth()+1),dk=d=>mk(d)+"-"+pad(d.getDate());
const ML=k=>new Date(k.slice(0,4),k.slice(5)-1,1).toLocaleString("en-IN",{month:"long",year:"numeric"});
const DL=k=>new Date(k+"T00:00").toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"});
let seed=20240611;const rnd=()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
let id=0,txns=[],live=true,month=mk(new Date()),day=null,newId=0,S={q:"",type:"all",cat:"all",page:0},user=null;
function make(date,fc){
 let cat=fc||names[Math.floor(rnd()*names.length)],type="debit",amt,desc;
 if(cat==="Salary"){type="credit";amt=82000;desc="Salary – Employer"}
 else if(cat==="Rent"){amt=22000;desc="Rent – Landlord"}
 else{if(cat==="Transfers"&&rnd()<.45){type="credit";desc="UPI received"}else desc=CATS[cat][Math.floor(rnd()*CATS[cat].length)];
  const big=rnd()<.04;amt=Math.round((big?25000+rnd()*40000:60+Math.pow(rnd(),2.2)*5500)/10)*10}
 return{id:++id,date,type,cat,desc,amt,flagged:type==="debit"&&cat!=="Rent"&&(amt>=25000||(date.getHours()<5&&amt>=10000))};
}
(function(){const now=new Date(),st=new Date(now);st.setMonth(st.getMonth()-5);st.setDate(1);st.setHours(0,0,0,0);
 const today=new Date(now.getFullYear(),now.getMonth(),now.getDate());
 for(let d=new Date(st);d<today;d.setDate(d.getDate()+1)){const n=3+Math.floor(rnd()*5);
  for(let i=0;i<n;i++){const t=new Date(d);t.setHours(Math.floor(rnd()*24),Math.floor(rnd()*60));txns.push(make(t))}
  if(d.getDate()===1){const t=new Date(d);t.setHours(9,5);txns.push(make(t,"Salary"))}
  if(d.getDate()===5){const t=new Date(d);t.setHours(10,20);txns.push(make(t,"Rent"))}}
 for(let i=0;i<4;i++){const t=new Date(today);t.setHours(Math.floor(rnd()*Math.max(1,now.getHours())),Math.floor(rnd()*60));txns.push(make(t))}
 txns.sort((a,b)=>a.date-b.date)})();
const inM=()=>txns.filter(t=>mk(t.date)===month);
const sum=a=>a.reduce((s,t)=>s+t.amt,0),cr=a=>a.filter(t=>t.type==="credit"),db=a=>a.filter(t=>t.type==="debit");
const kp=a=>`<div class="kpis">${a.map(x=>`<div class="kpi"><small>${x[0]}</small><span class="big ${x[2]||""}">${x[1]}</span></div>`).join("")}</div>`;
function chart(mode){
 const[y,m]=month.split("-").map(Number),n=new Date(y,m,0).getDate(),per=Array.from({length:n},()=>({cr:0,db:0}));
 inM().forEach(t=>per[t.date.getDate()-1][t.type==="credit"?"cr":"db"]+=t.amt);
 const keys=mode==="both"?["cr","db"]:[mode],max=Math.max(1,...per.map(p=>Math.max(...keys.map(k=>p[k])))),W=720,H=250,L=44,B=22,T=8,bw=(W-L)/n,ch=H-B-T;let g="";
 for(let i=0;i<=4;i++){const yy=T+ch-ch*i/4,v=max*i/4;g+=`<line x1="${L}" x2="${W}" y1="${yy}" y2="${yy}" stroke="var(--line)"/><text x="${L-6}" y="${yy+3}" text-anchor="end">${v>=1000?Math.round(v/1000)+"k":Math.round(v)}</text>`}
 per.forEach((p,i)=>{const x=L+i*bw,w=Math.max(2,bw/keys.length-2);
  g+=`<g class="bar" data-day="${month}-${pad(i+1)}"><title>${i+1} ${ML(month)}: in ${inr(p.cr)}, out ${inr(p.db)}</title><rect x="${x}" y="${T}" width="${bw}" height="${ch}" fill="transparent"/>`+
  keys.map((k,j)=>{const h=ch*p[k]/max;return`<rect x="${x+1+j*(w+1)}" y="${T+ch-h}" width="${w}" height="${h}" fill="var(--${k})"/>`}).join("")+
  ((i+1)%5===0||i===0?`<text x="${x+bw/2}" y="${H-6}" text-anchor="middle">${i+1}</text>`:"")+"</g>"});
 return`<div class="cb"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Daily chart for ${ML(month)}">${g}</svg></div>`;
}
function cats(a){const t={};db(a).forEach(x=>t[x.cat]=(t[x.cat]||0)+x.amt);const e=Object.entries(t).sort((x,y)=>y[1]-x[1]),mx=e.length?e[0][1]:1;
 return e.length?e.map(([c,v])=>`<div class="cat"><span>${c}</span><div class="track"><div class="fill" style="width:${v/mx*100}%"></div></div><span class="num">${inr(v)}</span></div>`).join(""):'<div class="empty">No spending in this period.</div>'}
function tbl(a){return`<div class="tw"><table><thead><tr><th>Date and time</th><th>Description</th><th>Category</th><th>Status</th><th class="a">Amount</th></tr></thead><tbody>`+
 (a.length?a.map(t=>`<tr class="${t.id===newId?"new":""}"><td>${t.date.toLocaleString("en-IN",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"})}</td><td>${t.desc}</td><td>${t.cat}</td><td>${t.flagged?'<span class="flag">Flagged</span>':"Cleared"}</td><td class="a ${t.type==="credit"?"cr":"db"}">${t.type==="credit"?"+":"−"}${inr(t.amt)}</td></tr>`).join(""):'<tr><td colspan="5" class="empty">No transactions to show.</td></tr>')+"</tbody></table></div>"}
const desc=a=>a.slice().sort((x,y)=>y.date-x.date);
const sec=(h,s,b)=>`<section><h2>${h}</h2><p class="sub">${s}</p>${b}</section>`;
function dash(){const a=inM(),i=sum(cr(a)),o=sum(db(a)),n=i-o;
 return kp([["Money in",inr(i),"cr"],["Money out",inr(o),"db"],["Net change",(n<0?"−":"")+inr(Math.abs(n)),n<0?"db":"cr"],["Transactions",a.length],["Flagged",a.filter(t=>t.flagged).length]])+
 `<div class="grid">${sec("Daily cash flow – "+ML(month),"Select a day to open it in Date-wise.",chart("both"))}${sec("Spending by category","Whole month",cats(a))}</div>`+
 sec("Recent transactions","Updates live as new transactions arrive.",tbl(desc(a).slice(0,8)))}
function inc(){const a=cr(inM()),t=sum(a);
 return kp([["Total income",inr(t),"cr"],["Credits received",a.length],["Average credit",inr(a.length?t/a.length:0)],["Largest credit",inr(Math.max(0,...a.map(x=>x.amt)))]])+
 sec("Income by day – "+ML(month),"Money received each day.",chart("cr"))+sec("Income transactions","Latest 20 credits",tbl(desc(a).slice(0,20)))}
function exp(){const a=db(inM()),t=sum(a);
 return kp([["Total expenses",inr(t),"db"],["Debits made",a.length],["Average debit",inr(a.length?t/a.length:0)],["Largest debit",inr(Math.max(0,...a.map(x=>x.amt)))]])+
 `<div class="grid">${sec("Expenses by day – "+ML(month),"Money spent each day.",chart("db"))}${sec("Where the money went","By category",cats(a))}</div>`+sec("Expense transactions","Latest 20 debits",tbl(desc(a).slice(0,20)))}
function allT(){let a=desc(inM());const q=S.q.toLowerCase();
 a=a.filter(t=>(S.type==="all"||t.type===S.type)&&(S.cat==="all"||t.cat===S.cat)&&(!q||(t.desc+t.cat).toLowerCase().includes(q)));
 const P=20,pc=Math.max(1,Math.ceil(a.length/P));S.page=Math.min(S.page,pc-1);
 const o=(v,l,c)=>`<option value="${v}" ${c===v?"selected":""}>${l}</option>`;
 return sec("All transactions – "+ML(month),a.length+" transactions match your filters.",
 `<div class="fl"><input data-f="q" placeholder="Search description" value="${S.q}" aria-label="Search"><select data-f="type" aria-label="Type">${o("all","All types",S.type)}${o("credit","Income only",S.type)}${o("debit","Expenses only",S.type)}</select><select data-f="cat" aria-label="Category">${o("all","All categories",S.cat)}${[...names].map(c=>o(c,c,S.cat)).join("")}</select></div>`+
 tbl(a.slice(S.page*P,S.page*P+P))+`<div class="pg"><button data-pg="-1" ${S.page?"":"disabled"}>Previous</button><span class="sm">Page ${S.page+1} of ${pc}</span><button data-pg="1" ${S.page<pc-1?"":"disabled"}>Next</button></div>`)}
function dateP(){const a=inM(),ds={};a.forEach(t=>{const k=dk(t.date);(ds[k]=ds[k]||[]).push(t)});
 const keys=Object.keys(ds).sort().reverse();if(!day||!ds[day])day=keys[0]||null;
 const sel=day?ds[day]||[]:[],i=sum(cr(sel)),o=sum(db(sel));
 const rows=keys.map(k=>{const c=sum(cr(ds[k])),d=sum(db(ds[k]));return`<tr data-day="${k}" class="${k===day?"pick":""}"><td>${new Date(k+"T00:00").toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short"})}</td><td class="num">${ds[k].length}</td><td class="num cr">${inr(c)}</td><td class="num db">${inr(d)}</td></tr>`}).join("");
 return`<div class="fl"><label class="sm">Jump to date <input type="date" id="dp" value="${day||""}" min="${month}-01" max="${month}-${pad(new Date(month.slice(0,4),month.slice(5),0).getDate())}"></label></div>`+
 `<div class="grid"><section><h2>Days in ${ML(month)}</h2><p class="sub">Select a day to see its transactions.</p><div class="tw"><table style="min-width:360px"><thead><tr><th>Date</th><th class="a">Count</th><th class="a">In</th><th class="a">Out</th></tr></thead><tbody>${rows||'<tr><td colspan="4" class="empty">No data.</td></tr>'}</tbody></table></div></section>`+
 `<section><h2>${day?DL(day):"No day selected"}</h2><p class="sub">${sel.length} transactions</p>${kp([["In",inr(i),"cr"],["Out",inr(o),"db"]])}${cats(sel)}</section></div>`+
 sec("Transactions on "+(day?DL(day):"–"),"Newest first",tbl(desc(sel)))}
const R={dashboard:["Dashboard",dash],income:["Income",inc],expenses:["Expenses",exp],transactions:["All transactions",allT],date:["Date-wise",dateP]};
const page=()=>{const h=location.hash.slice(1);return R[h]?h:"dashboard"};
function render(){
 const loggedIn=!!user;$("login").hidden=loggedIn;$("app").hidden=!loggedIn;if(!loggedIn)return;
 const p=page();$("title").textContent=R[p][0];$("view").innerHTML=R[p][1]();
 document.querySelectorAll("nav a").forEach(a=>a.classList.toggle("on",a.dataset.p===p));$("who").textContent="Signed in as "+user;
}
function months(){const k=[...new Set(txns.map(t=>mk(t.date)))].sort().reverse();$("month").innerHTML=k.map(x=>`<option value="${x}" ${x===month?"selected":""}>${ML(x)}</option>`).join("")}
$("lf").onsubmit=e=>{e.preventDefault();
 if($("u").value.trim().toLowerCase()==="admin"&&$("p").value==="bank123"){user="Admin";try{sessionStorage.setItem("ll_user",user)}catch(x){}$("err").textContent="";$("p").value="";if(!location.hash||location.hash==="#login")location.hash="dashboard";months();render()}
 else $("err").textContent="User name or password is incorrect. Try admin and bank123."};
$("out").onclick=()=>{user=null;try{sessionStorage.removeItem("ll_user")}catch(x){}location.hash="login";render()};
$("month").onchange=e=>{month=e.target.value;day=null;S.page=0;render()};
$("pause").onclick=()=>{live=!live;$("pause").textContent=live?"Pause updates":"Resume updates";$("lt").textContent=live?"Live":"Paused";$("live").classList.toggle("paused",!live)};
addEventListener("hashchange",render);
$("view").addEventListener("click",e=>{
 const g=e.target.closest("[data-day]");if(g){day=g.dataset.day;if(page()==="date")render();else location.hash="date";return}
 const b=e.target.closest("[data-pg]");if(b){S.page+=+b.dataset.pg;render()}});
$("view").addEventListener("input",e=>{const f=e.target.dataset.f;if(f){S[f]=e.target.value;S.page=0;const pos=e.target.selectionStart;render();const n=document.querySelector(`[data-f="${f}"]`);if(n&&f==="q"){n.focus();n.setSelectionRange(pos,pos)}}
 else if(e.target.id==="dp"&&e.target.value){day=e.target.value;render()}});
function tick(){if(!live||!user)return;const t=make(new Date());txns.push(t);newId=t.id;
 if(![...$("month").options].some(o=>o.value===mk(t.date)))months();
 const a=document.activeElement;if(!(a&&$("view").contains(a)&&/INPUT|SELECT/.test(a.tagName)))render()}
const clock=()=>{$("clock").textContent=new Date().toLocaleString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric",hour:"2-digit",minute:"2-digit",second:"2-digit"})};
try{user=sessionStorage.getItem("ll_user")}catch(x){}
if(!user)location.hash="login";months();render();clock();setInterval(clock,1000);setInterval(tick,3000);
