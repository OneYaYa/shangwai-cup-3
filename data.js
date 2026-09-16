'use strict';
window.CUP = {
  title:'上外杯 #3', timezone:'Asia/Shanghai',
  teams:[{id:'duck',name:'多边卖鸭分队',members:['duck','bridge','narrative']},{id:'teddy',name:'我泰迪熊豪了',members:['mumu','cheng','teddy']}],
  players:[
    {id:'lan',name:'暴力铃兰',track:'fun',squad:'元素',difficulty:'N15',date:'2026-09-19',time:'14:00',row:0},
    {id:'wolf',name:'蕉太狼',track:'fun',squad:'术特',difficulty:'N15',date:'2026-09-19',time:'19:30',row:1},
    {id:'mumu',name:'缪缪厨一号',track:'competitive',squad:'术特',difficulty:'N15',date:'2026-09-20',time:'19:30',team:'teddy',row:2},
    {id:'duck',name:'一只大鸭鸭',track:'competitive',squad:'术特',difficulty:'N15',date:'2026-09-21',time:'21:30',team:'duck',row:3},
    {id:'pig',name:'深海小绪',track:'fun',squad:'多边贸易',difficulty:'N12',date:'2026-09-22',time:'19:30',row:4},
    {id:'moon',name:'东子亚月',track:'fun',squad:'后勤',difficulty:'N15',date:'2026-09-23',time:'19:30',row:5},
    {id:'cheng',name:'涩一',track:'competitive',squad:'狙医',difficulty:'N15',date:'2026-09-25',time:'14:00',team:'teddy',row:6},
    {id:'bridge',name:'路南桥',track:'competitive',squad:'狙医',difficulty:'N15',date:'2026-09-25',time:'19:30',team:'duck',row:7},
    {id:'narrative',name:'narrative',track:'competitive',squad:'近锋',difficulty:'N15',date:'2026-09-26',time:'21:30',team:'duck',pressure:true,row:8},
    {id:'teddy',name:'Teddy',track:'competitive',squad:'多边贸易',difficulty:'N15',date:'2026-09-28',time:'19:30',team:'teddy',pressure:true,row:9}
  ],
  hunts:[['fang','外显尖牙',20,20],['arm','哀悼铁腕',40,60],['gold','赤金厄运',60,70],['music','闹乐',30,50],['body','灭身',80,90],['anger','纵怒',80,90]],
  specials:[
    {key:'meeting',name:'紧急合伙人会议',levels:{4:140,5:100,6:40}},
    {key:'lake',name:'紧急湖中魇',levels:{3:80,4:40,5:40}},
    {key:'autopsy',name:'无效验尸',levels:{3:140,4:100,5:20}},
    {key:'future',name:'紧急未来见闻',levels:{3:60},wonder:true},
    {key:'salary',name:'紧急恶意讨薪',levels:{4:100},wonder:true},
    {key:'jungle',name:'丛林法则',levels:{4:100},wonder:true},
    {key:'desire',name:'物欲遮天',levels:{4:100},wonder:true}
  ],
  factions:['岁','深海猎人','罗德岛-精英干员','黑钢国际','莱茵生命','企鹅物流','龙门近卫局','喀兰贸易','红松骑士团','格拉斯哥帮','巴别塔','S.W.E.E.P.','塔拉','鲤氏侦探事务所','乌萨斯学生自治团','彩虹小队','莱欧斯小队','Ave Mujica','S.E.E.S.'],
  squads:[['other','其余分队 · ×1.00',1],['trade','多边贸易分队 · ×0.85',.85],['civil','文明开化分队 · ×1.10',1.1],['ground','地面突破分队 · ×1.10',1.1],['high','高台突破分队 · ×1.10',1.1],['assault','突击战术分队（近锋）· ×1.00',1],['destruction','破坏战术分队（术特）· ×1.00',1],['fortress','堡垒战术分队 · ×1.00',1],['ranged','远程战术分队（狙医）· ×1.00',1]],
  defaultPolicy:{factions:'each',relics:'each',dPenalty:'after',firstClear:'team'},
  policyNote:'娱乐阵营奖励分别累加；复得之轮、果腹分别 +200；违规在倍率计算后扣除；首次结局奖励只计入团队总加分。'
};
