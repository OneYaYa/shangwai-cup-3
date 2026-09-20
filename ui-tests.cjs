'use strict';
const http=require('http'),fs=require('fs'),path=require('path'),assert=require('assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const server=http.createServer((req,res)=>{const pathname=decodeURIComponent(new URL(req.url,'http://local').pathname);const file=path.join(__dirname,pathname==='/'?'index.html':pathname);if(!file.startsWith(__dirname+path.sep)){res.writeHead(403).end();return;}fs.readFile(file,(err,data)=>{if(err){res.writeHead(404).end();return;}const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.json':'application/json','.docx':'application/vnd.openxmlformats-officedocument.wordprocessingml.document'};res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.end(data);});});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const url='http://127.0.0.1:'+server.address().port;
 let browser;
 try{
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox','--disable-gpu'],headless:true});
 const context=await browser.newContext({viewport:{width:1440,height:1000}});const errors=[];context.on('page',p=>{p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.url().startsWith(url)&&r.status()>=400)errors.push(r.status()+' '+r.url());});});
 const page=await context.newPage();await page.goto(url);await page.waitForSelector('[data-result-team="duck"]');
 assert.equal(await page.locator('.topbar nav a').count(),4);assert.equal(await page.locator('.event-team').count(),2);assert.equal(await page.locator('.event-match').count(),2);
 assert.equal(await page.locator('.stats,.entry-grid').count(),0);assert(await page.locator('.poster').evaluate(i=>i.complete&&i.naturalWidth>0));
 await page.locator('[data-day="2026-09-20"]').click();assert.equal(await page.locator('.event-match .track-tag').innerText(),'竞技');
 await page.locator('[data-rules-track="competitive"]').click();assert.equal(await page.locator('a[download]').count(),2);await page.locator('[data-rules-track="fun"]').click();
 const work=await context.newPage();await work.goto(url+'/workbench.html#fun');await work.waitForSelector('#f-base');await work.locator('#f-base').fill('1000');await work.locator('[name="hunt_fang"]').check();
 await page.locator('[data-day="2026-09-19"]').click();await page.waitForFunction(()=>document.querySelector('[data-result-player="lan"] .match-score strong').textContent==='2,809.2');
 await work.goto(url+'/workbench.html#competitive');assert.equal(await work.locator('[name="sand"]').count(),1);assert.equal(await work.locator('[name="offerings"]').count(),1);assert.deepEqual(await work.locator('#calculator-form .step').allTextContents(),['01','02','03','04','05','06','07','08']);assert.equal(await work.locator('#f-squad').inputValue(),'destruction');await work.locator('#f-base').fill('1000');await work.locator('[name="pain"]').check();
 assert((await work.locator('#calculator-form').innerText()).indexOf('结局关卡与箱中猎影')<(await work.locator('#calculator-form').innerText()).indexOf('团队关卡记录'));assert.equal(await work.locator('.calc-section').filter({has:work.locator('[name="box"]')}).locator('.step').innerText(),'05');
 await page.locator('[data-day="2026-09-20"]').click();assert.equal(await page.locator('[data-result-player="mumu"] .match-score strong').innerText(),'—');
 await work.locator('#f-withdrawn').fill('70');await work.locator('#f-swaddles').fill('1');
 await work.locator('#player-select').selectOption('cheng');await work.locator('#f-base').fill('1000');await work.locator('[name="pain"]').check();
 await work.locator('[name="pain_perfect"]').check();await work.locator('[name="pain_hunt"]').check();
 assert.equal(await work.locator('[data-summary="settlement"]').innerText(),'1,500');
 assert.equal(await work.locator('[data-summary="team-level"]').innerText(),'0');
 assert.equal(await work.locator('[data-summary="team-bonus"]').innerText(),'100');
 assert.equal(await work.locator('#f-callCount').getAttribute('max'),'3');await work.locator('#f-restartCount').fill('1');await work.locator('#f-callCount').fill('2');await work.locator('[name="overdraftUsed"]').check();
 assert.equal(await work.locator('[data-policy]').count(),0);
 const publishedPreview=await work.evaluate(()=>JSON.parse(localStorage.getItem('shangwai-cup-3-v1')));await page.route('**/results.json*',route=>route.fulfill({json:publishedPreview}));await page.reload();await page.waitForSelector('[data-result-team="teddy"]');
 assert.equal(await page.locator('[data-result-player="lan"] .match-score strong').innerText(),'820');await page.locator('[data-day="2026-09-20"]').click();assert.equal(await page.locator('[data-result-player="mumu"] .match-score strong').innerText(),'1,200');
 assert.equal(await page.locator('[data-result-team="teddy"] .team-score-heading strong').innerText(),'2,800');assert.equal(await page.locator('[data-result-team="teddy"] .team-addition strong').innerText(),'100');assert.equal(await page.locator('[data-result-team="teddy"] [data-deposit="remaining"]').innerText(),'135');
 assert((await page.locator('[data-result-team="teddy"] .team-bonus-details').textContent()).includes('缪缪厨一号 · 痛苦将息 · 队内首次通关'));
 assert.equal(await page.locator('[data-result-team="teddy"] .team-score-pair .score-metric').first().locator('strong').innerText(),'2,700');assert.equal(await page.locator('[data-result-player="mumu"] .team-addition strong').innerText(),'100');
 assert.equal(await page.locator('[data-result-team="teddy"] .team-score-pair .score-metric').evaluateAll(nodes=>getComputedStyle(nodes[0].querySelector('strong')).fontSize===getComputedStyle(nodes[1].querySelector('strong')).fontSize),true);
 assert.equal(await page.locator('.team-data-open').count(),2);await page.locator('[data-result-team="teddy"] .team-data-open').click();await page.waitForSelector('#public-team-data');assert.equal(await page.locator('#public-team-data .team-data-title h2').innerText(),'cornhub');assert((await page.locator('#public-team-data').innerText()).includes('+500'));assert((await page.locator('#public-team-data').innerText()).includes('135'));assert((await page.locator('#public-team-data').innerText()).includes('2/9'));await page.locator('#public-team-data [data-public-team]').click();assert.equal(await page.locator('#public-team-data').count(),0);

 console.log('PASS published settlement/team displays, same visual weight and no duplicated first-clear bonuses');
 // Verify independent avatar file and image loading.
 assert.equal(await page.locator('[data-result-team="teddy"] .team-members .avatar').first().getAttribute('src'),'assets/avatars/mumu.jpg');assert(await page.locator('img.avatar').evaluateAll(images=>images.every(i=>i.complete&&i.naturalWidth>0)));
 if(process.env.QA_DIR){await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));await page.screenshot({path:process.env.QA_DIR+'/event-desktop.png',fullPage:true});await work.screenshot({path:process.env.QA_DIR+'/workbench-desktop.png',fullPage:true});}
 await page.setViewportSize({width:390,height:844});await page.goto(url+'/#teams');assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.locator('[data-result-team="teddy"] .team-data-open').click();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));if(process.env.QA_DIR){await page.screenshot({path:process.env.QA_DIR+'/public-team-mobile.png',fullPage:true});await page.locator('#public-team-data [data-public-team]').click();await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));await page.screenshot({path:process.env.QA_DIR+'/event-mobile.png',fullPage:true});}
 await work.setViewportSize({width:390,height:844});assert(await work.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.equal(await work.locator('.workbench-view-tabs').count(),0);
 console.log('PASS desktop/mobile layout and avatar coordinates');
 // Mock GitHub only: no real credentials and no production score writes.
 const fixture=JSON.parse(fs.readFileSync(path.join(__dirname,'results.json')));let writes=0,published;
 await work.route('https://api.github.com/repos/OneYaYa/shangwai-cup-3/contents/results.json*',async route=>{if(route.request().method()==='GET')return route.fulfill({json:{sha:'test-sha',content:Buffer.from(JSON.stringify(fixture)).toString('base64')}});writes++;const body=route.request().postDataJSON();assert.equal(body.sha,'test-sha');assert.equal(body.branch,'main');published=JSON.parse(Buffer.from(body.content,'base64').toString());await route.fulfill({json:{commit:{sha:'mock'}}});});
 await work.locator('#publish-token').fill('mock-test-token');await work.locator('#publish-results').click();await work.waitForFunction(()=>document.querySelector('#publish-status').textContent.includes('已提交成绩'));
 assert.equal(writes,1);assert.equal(published.records.lan.base,1000);assert.equal(published.records.mumu.base,1000);assert.equal(published.records.mumu.withdrawn,70);assert.equal(published.records.mumu.swaddles,1);assert.equal(await work.locator('#publish-token').inputValue(),'');assert(!(await work.evaluate(()=>JSON.stringify(localStorage))).includes('mock-test-token'));
 // Repeated publication against changed remote must refuse to overwrite.
 await work.locator('#publish-token').fill('mock-test-token');await work.locator('#publish-results').click();await work.waitForFunction(()=>document.querySelector('#publish-status').textContent.includes('线上成绩已有更新'));assert.equal(writes,1);
 console.log('PASS publication payload, UTF-8, token clearing and remote conflict protection');
 const publicContext=await browser.newContext();const publicPage=await publicContext.newPage();await publicPage.goto(url);await publicPage.evaluate(()=>{localStorage.setItem('shangwai-cup-3-v1',JSON.stringify({schemaVersion:1,records:{lan:{base:1}},policy:{factions:'each',relics:'each',dPenalty:'after',firstClear:'team'}}));localStorage.setItem('shangwai-cup-3-v1-preview','1');});await publicPage.reload();await publicPage.waitForFunction(()=>document.querySelector('[data-result-player="lan"] .match-score strong').textContent==='2,809.2');assert.equal(await publicPage.locator('.draft-badge').count(),0);assert.equal(await publicPage.locator('.team-data-open').count(),2);await publicPage.locator('.team-data-open').first().click();assert.equal(await publicPage.locator('#public-team-data').count(),1);await publicContext.close();
 assert.deepEqual(errors,[]);console.log('PASS homepage always uses published results despite stale local preview data');
 }finally{if(browser)await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
