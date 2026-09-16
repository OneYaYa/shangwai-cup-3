'use strict';
(function(root){
const C=root.CUP;
const number=(x)=>Number.isFinite(Number(x))?Number(x):0;
function fresh(p){return {base:'',parts:0,squad:({多边贸易:'trade',术特:'destruction',狙医:'ranged',近锋:'assault'})[p.squad]||'other',mechanic:'none',adjust:0,adjustReason:'',notes:'',penalty:0,violations:0,completed:false};}
function calculate(p,r={},context={}){
 const policy={...C.defaultPolicy,...context.policy},lines=[],warnings=[];
 let raw=number(r.base),extra=0,level=0,penalty=number(r.penalty),multiplier=1;
 const add=(label,value,kind='rule')=>{if(value){lines.push({label,value,kind}); if(kind==='base')extra+=value;else level+=value;}};
 const claim=(key,label,value)=>{
   const owner=context.owners?.[p.team+':'+key];
   if(owner&&owner!==p.id){warnings.push(`${label}：队内已由 ${C.players.find(x=>x.id===owner)?.name||owner} 领取，本人不再加分。`);return;}
   add(label,value);
 };
 if(p.track==='fun'){
   multiplier=.8;
   for(const [key,name,score] of C.hunts)if(r['hunt_'+key])add(name,score);
   for(const [key,name,score,perfect] of [['peace','永无安宁',150,100],['pain','苦痛将息',200,100],['chaos','混沌源阶理论',250,100],['disease','畸症',300,200]]){
    if(r[key]){add(name,score);if(r[key+'_perfect'])add(name+' · 无漏',perfect);}
   }
   if(r.disease_kill)add('击杀症结之核',200);
   add('六星临时招募',number(r.temp6)*40);add('五星临时招募',number(r.temp5)*15);add('四星临时招募',number(r.temp4)*5);
   add('鸭 / 狗 / 熊 / 鼠',number(r.animals)*20);
   const factionBonuses=C.factions.map((name,i)=>{let n=number(r['faction_'+i]),v=n>=3?400:0;if(name==='Ave Mujica'&&r.aveAll&&n>=5)v=600;if(name==='S.E.E.S.'&&r.seesAll&&n>=4)v=600;return {name,v};}).filter(x=>x.v);
   if(policy.factions==='each')factionBonuses.forEach(x=>add('阵营 · '+x.name,x.v));
   else if(factionBonuses.length){const best=factionBonuses.sort((a,b)=>b.v-a.v)[0];add('阵营 · '+best.name+'（取最高）',best.v);}
   if(r.smallTeam&&r.completed){const n=number(r.operatorCount);if(n>=1&&n<=5)add('少人通关 · '+n+' 名干员',(6-n)*120);else warnings.push('少人奖励需结算干员数为 1–5，当前未计分。');}
   if(r.smallTeam&&!r.completed)warnings.push('少人奖励需完成任意结局，当前未计分。');
 }else{
   multiplier=(C.squads.find(x=>x[0]===r.squad)?.[2]??1)+(p.pressure?.1:0);
   if(r.fullHunt&&r.completed)multiplier+=.2;
   else if(r.fullHunt)warnings.push('全追猎通关倍率要求完成游戏，当前未加 0.20。');
   if(r.civilBonus&&r.squad==='civil'&&r.completed)add('文明开化 · 未遇实托邦',300,'base');
   if(r.recruitBonus)add('满足抓位奖励条件',300,'base');
   if(r.mechanic==='ban'){add('禁用机械师',400,'base');multiplier+=.05;}
   if(r.mechanic==='outside')add('机械师 · 仅局外收益',100,'base');
   if(r.mechanic==='inside')add('机械师 · 仅局内收益',200,'base');
   if(r.sand&&r.completed)add('沙盘 α + β',150);
   if(r.offerings&&r.completed)add('三供无削',300);
   if((r.sand||r.offerings)&&!r.completed)warnings.push('藏品规则分要求通关，当前未计入沙盘 / 三供无削。');
   for(const [key,name,,score] of C.hunts)if(r['hunt_'+key])claim('hunt_'+key,name+' · 无漏',score);
   if(r.pain){add('痛苦将息',200);if(r.pain_perfect)add('痛苦将息 · 无漏',100);if(r.pain_hunt)add('痛苦将息 · 全追猎状态',200);}
   if(r.chaos){add('混沌源阶理论',250);if(r.chaos_perfect)add('混沌源阶理论 · 无漏',100);}
   if(r.disease){add('畸症',100);if(r.disease_perfect)add('畸症 · 无漏',100);if(r.disease_hunt)add('畸症 · 全追猎状态（替代追猎3）',150);else if(r.disease_trigger)add('畸症 · 追猎3',75);}
   if(r.disease_kill)add('击杀症结之核',200);
   for(const s of C.specials){const n=number(r['special_'+s.key]);if(s.levels[n])claim('special_'+s.key,s.name+' · '+n+'层',s.levels[n]);}
   if(r.coexist){add('紧急同域共存',70);if(r.coexist_black)add('同域共存 · 黑流地脉',70);if(r.coexist_hunt)add('同域共存 · 全追猎状态',50);if(r.coexist_non6)add('同域共存 · 非6层',20);if(r.coexist_black&&r.coexist_hunt)add('黑流地脉 × 全追猎额外奖励',150);}
   if(r.box)add('箱中猎影',70,'base');
   const relicCount=Number(!!r.wheel)+Number(!!r.belly);
   if(relicCount)add('复得之轮 / 果腹限制奖励',200*(policy.relics==='each'?relicCount:1),'base');
   if(r.vine)add('板藤限制奖励',200,'base');
   for(const [key,name] of [['pain','痛苦将息'],['chaos','混沌源阶理论']]){
    const owner=context.firstOwners?.[p.team+':'+key];
    if(r[key]&&owner===p.id&&policy.firstClear!=='team')add('队内首次 · '+name,100,policy.firstClear==='before'?'base':'after');
   }
   const violation=p.pressure?number(r.violations)*1000:0;
   if(violation&&policy.dPenalty==='before'){extra-=violation;lines.push({label:'D 类违规 · 倍率前扣分',value:-violation,kind:'base'});}
   else penalty+=violation;
 }
 const adjustment=number(r.adjust);
 if(adjustment&&!String(r.adjustReason||'').trim())warnings.push('裁判调整未填写理由，尚未计入。');
 const manual=String(r.adjustReason||'').trim()?adjustment:0;
 let afterBonus=0;
 // A first-clear award may be placed after the multiplier by the referee policy.
 for(const l of lines)if(l.kind==='after'){level-=l.value;afterBonus+=l.value;}
 const parts=p.track==='competitive'?number(r.parts)*7.5:0;
 const baseSubtotal=raw+extra-parts;
 const total=p.track==='fun'?raw*.8+level-penalty+manual:(baseSubtotal+level)*multiplier-penalty+manual+afterBonus;
 const isEntered=r.base!==''&&r.base!==null&&r.base!==undefined;
 return {total:Math.round((total+Number.EPSILON)*100)/100,raw,extra,parts,level,multiplier:Math.round(multiplier*100)/100,penalty,manual,afterBonus,lines,warnings,entered:isEntered};
}
function workbook(records={},policy=C.defaultPolicy){
 const owners={},firstOwners={};
 for(const p of C.players){const r=records[p.id];if(p.track!=='competitive'||!r||r.base===''||r.base===undefined)continue;
  for(const [key] of C.hunts)if(r['hunt_'+key])owners[p.team+':hunt_'+key]??=p.id;
  for(const s of C.specials)if(s.levels[number(r['special_'+s.key])])owners[p.team+':special_'+s.key]??=p.id;
  for(const key of ['pain','chaos'])if(r[key])firstOwners[p.team+':'+key]??=p.id;
 }
 const scores={};for(const p of C.players)scores[p.id]=calculate(p,records[p.id]||{}, {owners,firstOwners,policy});
 const teams=C.teams.map(t=>{
  let firstBonus=policy.firstClear==='team'?['pain','chaos'].filter(k=>firstOwners[t.id+':'+k]).length*100:0;
  let entered=t.members.filter(id=>scores[id].entered).length;
  return {...t,total:Math.round((t.members.reduce((sum,id)=>sum+(scores[id].entered?scores[id].total:0),0)+firstBonus)*100)/100,firstBonus,entered};
 });return {scores,teams,owners,firstOwners};
}
function validate(data){
 if(!data||data.schemaVersion!==1||!data.records||typeof data.records!=='object'||Array.isArray(data.records))throw Error('不是上外杯 #3 的有效计分文件（需要 schemaVersion: 1 与 records）。');
 const policy={...C.defaultPolicy,...data.policy};
 for(const [key,values] of Object.entries({factions:['best','each'],relics:['combined','each'],dPenalty:['after','before'],firstClear:['team','before','after']}))if(!values.includes(policy[key]))throw Error('裁判口径设置无效：'+key);
 const booleanKeys=['completed','fullHunt','civilBonus','recruitBonus','sand','offerings','peace','peace_perfect','pain','pain_perfect','pain_hunt','chaos','chaos_perfect','disease','disease_perfect','disease_kill','disease_hunt','disease_trigger','coexist','coexist_black','coexist_hunt','coexist_non6','box','wheel','belly','vine','smallTeam','aveAll','seesAll',...C.hunts.map(x=>'hunt_'+x[0])];
 const numericKeys=['base','parts','penalty','violations','temp6','temp5','temp4','animals','operatorCount',...C.factions.map((x,i)=>'faction_'+i)];
 const records={};
 for(const [id,r]of Object.entries(data.records)){
  const p=C.players.find(x=>x.id===id);if(!p)throw Error('未知选手编号：'+id);
  if(!r||typeof r!=='object'||Array.isArray(r))throw Error('选手记录无效：'+id);
  const clean=fresh(p);
  for(const key of booleanKeys)if(key in r){if(typeof r[key]!=='boolean')throw Error('复选项格式错误：'+key);clean[key]=r[key];}
  for(const key of numericKeys)if(key in r){if(key==='base'&&r[key]===''){clean[key]='';continue;}if(r[key]===null||typeof r[key]==='boolean')throw Error('数值格式错误：'+key);const n=Number(r[key]);if(!Number.isFinite(n)||n<0||n>10000000)throw Error('数值超出有效范围：'+key);if(key!=='base'&&key!=='penalty'&&!Number.isInteger(n))throw Error('数量必须为整数：'+key);clean[key]=n;}
  if('adjust'in r){const n=Number(r.adjust);if(!Number.isFinite(n)||Math.abs(n)>1e7)throw Error('裁判调整数值无效');clean.adjust=n;}
  if('squad'in r){if(!C.squads.some(x=>x[0]===r.squad))throw Error('分队无效');clean.squad=r.squad;}
  if('mechanic'in r){if(!['none','ban','outside','inside'].includes(r.mechanic))throw Error('机械师选项无效');clean.mechanic=r.mechanic;}
  for(const s of C.specials)if('special_'+s.key in r){const n=Number(r['special_'+s.key]);if(n!==0&&!s.levels[n])throw Error('特殊关卡层数无效');clean['special_'+s.key]=n;}
  for(const key of ['adjustReason','notes'])if(key in r){if(typeof r[key]!=='string'||r[key].length>3000)throw Error('备注过长或格式错误');clean[key]=r[key];}
  if(clean.violations>5)throw Error('D 类违规条数应为 0–5');
  if(!p.pressure&&clean.violations>0)throw Error('D 类抗压位违规仅适用于抗压位选手');
  records[id]=clean;
 }
 return {schemaVersion:1,updatedAt:typeof data.updatedAt==='string'?data.updatedAt:null,records,policy};
}
root.Scoring={fresh,calculate,workbook,validate};
if(typeof module!=='undefined')module.exports=root.Scoring;
})(typeof window!=='undefined'?window:globalThis);
