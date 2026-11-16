let G,pos,path=[],heading=null;
const $=id=>document.getElementById(id);
const say=t=>{try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.lang='uk-UA';speechSynthesis.speak(u)}catch(e){}};

function adj(){const a={};for(const n in G.nodes)a[n]=[];
 for(const [p,q,d] of G.edges){const w=dist(p,q);a[p].push([q,w]);a[q].push([p,d?w*3:w])}return a}
function dist(p,q){const A=G.nodes[p],B=G.nodes[q];return Math.hypot(A.x-B.x,A.y-B.y)}

// Дейкстра до найближчого виходу; стрілки плану = дешевший напрямок
function route(from){const A=adj(),d={},prev={},todo=new Set(Object.keys(G.nodes));
 for(const n of todo)d[n]=Infinity;d[from]=0;
 while(todo.size){let u=null;for(const n of todo)if(u===null||d[n]<d[u])u=n;
  todo.delete(u);if(d[u]===Infinity)break;if(G.nodes[u].exit){const r=[];for(let c=u;c;c=prev[c])r.unshift(c);return r}
  for(const [v,w] of A[u])if(d[u]+w<d[v]){d[v]=d[u]+w;prev[v]=u}}
 return [from]}

function render(){
 path=route(pos);const ov=$('ov');ov.innerHTML='';
 ov.innerHTML='<polyline fill="none" stroke="#e53935" stroke-width="8" points="'+path.map(n=>G.nodes[n].x+','+G.nodes[n].y).join(' ')+'"/>'
  +`<circle cx="${G.nodes[pos].x}" cy="${G.nodes[pos].y}" r="14" fill="#1565c0"/>`;
 if(path.length<2){$('info').textContent='Ви біля виходу';say('Ви біля виходу');return}
 let m=0;for(let i=0;i<path.length-1;i++)m+=dist(path[i],path[i+1]);
 m=Math.round(m*G.meta.metersPerPx);
 const nx=path[1];$('info').textContent=`Далі: ${G.nodes[nx].name} · до виходу ~${m} м`;
 say(`Йдіть до: ${G.nodes[nx].name}. До виходу ${m} метрів`);updArrow()}

function updArrow(){ // кут на плані: 0 = вгору, за годинниковою
 if(path.length<2)return;const a=G.nodes[path[0]],b=G.nodes[path[1]];
 const th=Math.atan2(b.x-a.x,-(b.y-a.y))*180/Math.PI;
 const rot=heading===null?th:th+G.meta.planUpHeading-heading;
 $('arrow').style.transform=`rotate(${rot}deg)`}

async function startCompass(){
 try{if(DeviceOrientationEvent.requestPermission)await DeviceOrientationEvent.requestPermission()}catch(e){}
 const h=e=>{heading=e.webkitCompassHeading??(e.alpha!=null?(360-e.alpha)%360:null);updArrow()};
 addEventListener('deviceorientationabsolute',h,true);addEventListener('deviceorientation',h,true)}

fetch('graph.json').then(r=>r.json()).then(g=>{G=g;
 const s=$('start');for(const n in G.nodes)if(!G.nodes[n].exit)s.add(new Option(G.nodes[n].name,n));
 const q=new URLSearchParams(location.search).get('node');
 pos=G.nodes[q]?q:s.value;s.value=pos;
 s.onchange=()=>{pos=s.value;render()};
 $('sos').onclick=()=>{startCompass();render()};
 $('next').onclick=()=>{if(path.length>1){pos=path[1];if(!G.nodes[pos].exit)s.value=pos;render()}};
 render()});
