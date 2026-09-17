const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
global.window=global;vm.runInThisContext(fs.readFileSync(__dirname+'/data.js','utf8'));require('./scoring.js');
const S=Scoring,C=CUP,p=id=>C.players.find(p=>p.id===id),r=(id,x)=>({...S.fresh(p(id)),...x});let count=0;
function test(label,fn){fn();count++;console.log('PASS',label);}
test('competitive baseline and parts subtraction',()=>assert.equal(S.calculate(p('duck'),r('duck',{base:1000,parts:10})).total,925));
test('additive pressure, trade, full hunt, mechanic multipliers',()=>{const s=S.calculate(p('teddy'),r('teddy',{base:1000,parts:10,completed:true,fullHunt:true,mechanic:'ban'}));assert.equal(s.multiplier,1.2);assert.equal(s.total,1590);});
test('mechanic modes are exclusive',()=>{for(const [mechanic,total]of [['none',1000],['outside',1100],['inside',1200],['ban',1470]])assert.equal(S.calculate(p('duck'),r('duck',{base:1000,mechanic})).total,total);});
test('disease 150 replaces 75',()=>assert.equal(S.calculate(p('duck'),r('duck',{base:0,disease:true,disease_perfect:true,disease_kill:true,disease_hunt:true,disease_trigger:true})).total,550));
test('disease trigger alone',()=>assert.equal(S.calculate(p('duck'),r('duck',{base:0,disease:true,disease_trigger:true})).total,175));
test('coexist all bonuses stack to 360',()=>assert.equal(S.calculate(p('duck'),r('duck',{base:0,coexist:true,coexist_black:true,coexist_hunt:true,coexist_non6:true})).total,360));
test('disabled subconditions do not score',()=>assert.equal(S.calculate(p('duck'),r('duck',{base:0,coexist_black:true,disease_hunt:true,pain_perfect:true})).total,0));
test('kill bonus does not require entire stage clear',()=>assert.equal(S.calculate(p('duck'),r('duck',{base:0,disease_kill:true})).total,200));
test('completion-gated bonuses',()=>{const s=S.calculate(p('duck'),r('duck',{base:1000,sand:true,offerings:true,fullHunt:true}));assert.equal(s.total,1000);assert.equal(s.multiplier,1);assert(s.warnings.length>0);});
test('civil compensation gated by squad and clear',()=>{assert.equal(S.calculate(p('duck'),r('duck',{base:1000,squad:'civil',completed:true,civilBonus:true})).total,1430);assert.equal(S.calculate(p('duck'),r('duck',{base:1000,civilBonus:true,completed:true})).total,1000);});
test('team unique hunts, specials shared across floors',()=>{const w=S.workbook({duck:r('duck',{base:100,hunt_arm:true,special_meeting:4}),bridge:r('bridge',{base:100,hunt_arm:true,special_meeting:5}),mumu:r('mumu',{base:100,hunt_arm:true})},C.defaultPolicy);assert.equal(w.scores.duck.total,300);assert.equal(w.scores.bridge.total,100);assert.equal(w.scores.mumu.total,160);assert.equal(w.scores.bridge.warnings.length,2);});
test('unentered records do not consume unique awards',()=>{const w=S.workbook({duck:r('duck',{hunt_arm:true}),bridge:r('bridge',{base:100,hunt_arm:true})},C.defaultPolicy);assert.equal(w.scores.bridge.total,160);assert.equal(w.teams.find(t=>t.id==='duck').entered,1);});
test('first clear is awarded to team only once',()=>{const w=S.workbook({duck:r('duck',{base:0,pain:true,chaos:true}),bridge:r('bridge',{base:0,pain:true})},C.defaultPolicy);assert.equal(w.teams.find(t=>t.id==='duck').firstBonus,200);assert.equal(w.teams.find(t=>t.id==='duck').total,650);});
test('first clear never enters settlement even with legacy policy',()=>{const records={teddy:r('teddy',{base:1000,pain:true})};for(const firstClear of ['team','before','after']){const w=S.workbook(records,{...C.defaultPolicy,firstClear});assert.equal(w.scores.teddy.settlement,950);assert.equal(w.scores.teddy.teamLevel,200);assert.equal(w.teams.find(t=>t.id==='teddy').teamBonus,300);assert.equal(w.teams.find(t=>t.id==='teddy').total,1250);}});
test('D violations always deducted after multiplication',()=>{const rec=r('narrative',{base:2000,violations:1,pain:true});for(const dPenalty of ['before','after']){const s=S.calculate(p('narrative'),rec,{policy:{dPenalty}});assert.equal(s.settlement,1200);assert.equal(s.teamLevel,200);assert.equal(s.total,1400);}});
test('fun base only gets 0.8 multiplier',()=>assert.equal(S.calculate(p('lan'),r('lan',{base:1000,temp6:2,animals:3,hunt_arm:true})).total,980));
test('all factions stack; complete set replaces same faction reward',()=>{const rec=r('lan',{base:0,faction_0:3,faction_17:5,aveAll:true});assert.equal(S.calculate(p('lan'),rec).total,1000);assert.equal(S.calculate(p('lan'),rec,{policy:{factions:'each'}}).total,1000);});
test('small team completion and range conditions',()=>{assert.equal(S.calculate(p('lan'),r('lan',{base:0,completed:true,smallTeam:true,operatorCount:1})).total,600);assert.equal(S.calculate(p('lan'),r('lan',{base:0,smallTeam:true,operatorCount:1})).total,0);assert.equal(S.calculate(p('lan'),r('lan',{base:0,completed:true,smallTeam:true,operatorCount:6})).total,0);});
test('wheel and belly always independently award 200',()=>{const rec=r('duck',{base:0,wheel:true,belly:true});assert.equal(S.calculate(p('duck'),rec).total,400);assert.equal(S.calculate(p('duck'),rec,{policy:{relics:'each'}}).total,400);});
test('manual adjustment requires reason',()=>{assert.equal(S.calculate(p('duck'),r('duck',{base:0,adjust:100})).total,0);assert.equal(S.calculate(p('duck'),r('duck',{base:0,adjust:-100,adjustReason:'复核'})).total,-100);});
test('import rejects malformed, unknown, nonfinite, negative and fractional counts',()=>{for(const d of [{}, {schemaVersion:1,records:{bad:{}}},{schemaVersion:1,records:{duck:{base:-1}}},{schemaVersion:1,records:{duck:{base:'NaN'}}},{schemaVersion:1,records:{duck:{parts:1.5}}},{schemaVersion:1,records:{duck:{pain:'yes'}}},{schemaVersion:1,records:{duck:{special_lake:6}}}])assert.throws(()=>S.validate(d));});
test('round trip preserves results',()=>{const original={schemaVersion:1,records:{duck:r('duck',{base:1234.5,parts:11,mechanic:'ban',hunt_arm:true}),lan:r('lan',{base:500,faction_0:4})},policy:C.defaultPolicy};const next=S.validate(JSON.parse(JSON.stringify(original)));assert.deepEqual(S.workbook(next.records,next.policy),S.workbook(original.records,original.policy));});
test('initial public data is genuinely empty',()=>{const d=S.validate(JSON.parse(fs.readFileSync(__dirname+'/results.json','utf8')));assert.equal(Object.keys(d.records).length,0);assert(S.workbook(d.records,d.policy).teams.every(t=>t.entered===0));});
test('split ledger reconciles team total with unique rewards and penalties',()=>{const records={duck:r('duck',{base:1000,parts:4,wheel:true,belly:true,hunt_arm:true,pain:true}),bridge:r('bridge',{base:500,hunt_arm:true,pain:true}),narrative:r('narrative',{base:2000,violations:1,chaos:true})};const w=S.workbook(records),t=w.teams.find(t=>t.id==='duck');assert.equal(w.scores.duck.settlement,1370);assert.equal(w.scores.duck.teamLevel,260);assert.equal(w.scores.bridge.teamLevel,0);assert.equal(w.scores.narrative.settlement,1200);assert.equal(w.scores.narrative.teamLevel,250);assert.equal(t.settlementTotal,3070);assert.equal(t.levelTotal,510);assert.equal(t.teamBonus,710);assert.equal(t.total,3780);});
test('old saved policies migrate to confirmed settings without record loss',()=>{const rec=r('duck',{base:1000,wheel:true,belly:true,pain:true});const d=S.validate({schemaVersion:1,records:{duck:rec},policy:{factions:'best',relics:'combined',dPenalty:'before',firstClear:'before'}});assert.deepEqual(d.policy,C.defaultPolicy);assert.equal(d.records.duck.base,1000);assert.equal(S.workbook(d.records,d.policy).scores.duck.settlement,1400);});
test('zero and unentered records remain distinct and no bonus is duplicated',()=>{const w=S.workbook({duck:r('duck',{base:0,pain:true}),bridge:r('bridge',{pain:true,hunt_arm:true})});const t=w.teams.find(t=>t.id==='duck');assert.equal(t.entered,1);assert.equal(t.settlementTotal,0);assert.equal(t.teamBonus,300);assert.equal(t.total,300);});
test('cent-level ledger sums reconcile exactly',()=>{const w=S.workbook({teddy:r('teddy',{base:1234.567,parts:3,pain:true,adjust:-0.01,adjustReason:'复核'})}),t=w.teams.find(t=>t.id==='teddy');assert.equal(Math.round((t.settlementTotal+t.teamBonus)*100),Math.round(t.total*100));});
test('boss maximum and first clear have independent player attribution',()=>{
 const w=S.workbook({duck:r('duck',{base:1000,pain:true,pain_perfect:true}),bridge:r('bridge',{base:1000,pain:true,pain_perfect:true,pain_hunt:true})});
 assert.equal(w.scores.duck.teamLevel,0);assert.equal(w.scores.duck.firstBonus,100);assert.equal(w.scores.duck.teamContribution,100);
 assert.equal(w.scores.bridge.teamLevel,500);assert.equal(w.scores.bridge.firstBonus,0);assert.equal(w.teams.find(t=>t.id==='duck').teamBonus,600);
 assert.equal(w.scores.duck.settlement,1000);assert(w.scores.duck.lines.some(l=>l.kind==='first'));assert(w.scores.duck.warnings.some(x=>x.includes('最高完整奖励')));
});
test('disease maximum uses whole package, never combines players',()=>{
 const w=S.workbook({duck:r('duck',{base:0,disease:true,disease_kill:true,disease_trigger:true}),bridge:r('bridge',{base:0,disease:true,disease_perfect:true,disease_hunt:true,disease_trigger:true})});
 assert.equal(w.scores.duck.teamLevel,375);assert.equal(w.scores.bridge.teamLevel,0);assert.equal(w.teams.find(t=>t.id==='duck').teamBonus,375);
});
test('boss maxima are isolated by boss and team; equal scores use schedule order',()=>{
 const w=S.workbook({duck:r('duck',{base:0,pain:true,chaos:true}),bridge:r('bridge',{base:0,pain:true,chaos:true,chaos_perfect:true}),mumu:r('mumu',{base:0,pain:true})});
 assert.equal(w.scores.duck.teamLevel,200);assert.equal(w.scores.bridge.teamLevel,350);assert.equal(w.scores.mumu.teamLevel,200);assert.equal(w.scores.duck.firstBonus,200);
});
test('unentered boss results cannot claim maximum or first and corrections reassign',()=>{
 const records={duck:r('duck',{pain:true,pain_hunt:true}),bridge:r('bridge',{base:0,pain:true})};
 let w=S.workbook(records);assert.equal(w.scores.bridge.teamLevel,200);assert.equal(w.scores.bridge.firstBonus,100);
 records.duck.base=0;w=S.workbook(records);assert.equal(w.scores.duck.teamLevel,400);assert.equal(w.scores.bridge.teamLevel,0);assert.equal(w.scores.duck.firstBonus,100);
 records.duck.base=null;w=S.workbook(records);assert.equal(w.scores.bridge.teamLevel,200);assert.equal(w.scores.bridge.firstBonus,100);
});
test('special bonuses multiply personally; section six remains raw and penalties follow multiplier',()=>{
 const s=S.calculate(p('teddy'),r('teddy',{base:1000,parts:4,completed:true,fullHunt:true,sand:true,offerings:true,box:true,coexist:true,penalty:100}));
 assert.equal(s.extra,450);assert.equal(s.multiplier,1.15);assert.equal(s.settlement,1533);assert.equal(s.teamLevel,140);assert.equal(s.total,1673);
});
test('deposits update before scoring, remain team isolated and include earned deposits',()=>{
 const w=S.workbook({duck:r('duck',{withdrawn:70,swaddles:1}),bridge:r('bridge',{withdrawn:50}),mumu:r('mumu',{withdrawn:20})});
 const t=w.teams.find(t=>t.id==='duck');assert.equal(t.depositRemaining,85);assert.equal(t.depositUsed,120);assert.equal(t.depositBonus,5);assert.equal(t.entered,0);assert.equal(t.total,0);assert.equal(w.teams.find(t=>t.id==='teddy').depositRemaining,180);
});
test('deposit defaults, correction, overdraw and validated persistence',()=>{
 assert.equal(S.workbook().teams[0].depositRemaining,200);
 const data=S.validate({schemaVersion:1,records:{duck:{withdrawn:210,swaddles:0}}});assert.equal(S.workbook(data.records).teams[0].depositRemaining,-10);
 data.records.duck.withdrawn=30;assert.equal(S.workbook(data.records).teams[0].depositRemaining,170);
 for(const value of [-1,1.5,null,'bad'])assert.throws(()=>S.validate({schemaVersion:1,records:{duck:{withdrawn:value}}}));
});
test('team resource fields persist with per-player limits',()=>{
 const data=S.validate({schemaVersion:1,records:{duck:{restartCount:1,callCount:2,overdraftUsed:true}}});
 assert.equal(data.records.duck.restartCount,1);assert.equal(data.records.duck.callCount,2);assert.equal(data.records.duck.overdraftUsed,true);
 assert.throws(()=>S.validate({schemaVersion:1,records:{duck:{restartCount:2}}}));assert.throws(()=>S.validate({schemaVersion:1,records:{duck:{callCount:4}}}));
});
console.log(`${count} scoring tests passed.`);
