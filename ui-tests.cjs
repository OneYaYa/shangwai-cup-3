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
 await page.locator('[data-day="2026-09-19"]').click();await page.waitForFunction(()=>document.querySelector('[data-result-player="lan"] .match-score strong').textContent==='820');
 await work.goto(url+'/workbench.html#competitive');await work.locator('#f-base').fill('1000');await work.locator('[name="pain"]').check();
 await page.locator('[data-day="2026-09-20"]').click();await page.waitForFunction(()=>document.querySelector('[data-result-player="mumu"] .match-score strong').textContent==='1,000');
 await page.waitForFunction(()=>document.querySelector('[data-result-team="teddy"] .team-score-heading strong').textContent==='1,300');
 await work.locator('#player-select').selectOption('cheng');await work.locator('#f-base').fill('1000');await work.locator('[name="pain"]').check();
 await page.waitForFunction(()=>document.querySelector('[data-result-team="teddy"] .team-score-heading strong').textContent==='2,500');
 await page.waitForFunction(()=>document.querySelector('[data-result-team="teddy"] .team-addition strong').textContent==='500');
 assert.equal(await page.locator('[data-result-team="teddy"] .team-score-pair .score-metric').first().locator('strong').innerText(),'2,000');
 assert.equal(await page.locator('[data-result-player="mumu"] .team-addition strong').innerText(),'500');
 assert.equal(await work.locator('[data-summary="settlement"]').innerText(),'1,000');
 assert.equal(await work.locator('[data-summary="team-level"]').innerText(),'200');
 assert.equal(await work.locator('[data-summary="team-bonus"]').innerText(),'500');
 assert.equal(await work.locator('[data-policy]').count(),0);
 assert.equal(await page.locator('[data-result-team="teddy"] .team-score-pair .score-metric').evaluateAll(nodes=>getComputedStyle(nodes[0].querySelector('strong')).fontSize===getComputedStyle(nodes[1].querySelector('strong')).fontSize),true);
 console.log('PASS split settlement/team displays, same visual weight, cross-tab updates and no duplicated first-clear bonuses');
 // Verify independent avatar file and image loading.
 assert.equal(await page.locator('[data-result-team="teddy"] .team-members .avatar').first().getAttribute('src'),'assets/avatars/mumu.jpg');assert(await page.locator('img.avatar').evaluateAll(images=>images.every(i=>i.complete&&i.naturalWidth>0)));
 if(process.env.QA_DIR){await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));await page.screenshot({path:process.env.QA_DIR+'/event-desktop.png',fullPage:true});await work.screenshot({path:process.env.QA_DIR+'/workbench-desktop.png',fullPage:true});}
 await page.setViewportSize({width:390,height:844});await page.goto(url+'/#teams');assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));if(process.env.QA_DIR){await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));await page.screenshot({path:process.env.QA_DIR+'/event-mobile.png',fullPage:true});}
 await work.setViewportSize({width:390,height:844});assert(await work.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 console.log('PASS desktop/mobile layout and avatar coordinates');
 // Mock GitHub only: no real credentials and no production score writes.
 const fixture=JSON.parse(fs.readFileSync(path.join(__dirname,'results.json')));let writes=0,published;
 await work.route('https://api.github.com/repos/OneYaYa/shangwai-cup-3/contents/results.json*',async route=>{if(route.request().method()==='GET')return route.fulfill({json:{sha:'test-sha',content:Buffer.from(JSON.stringify(fixture)).toString('base64')}});writes++;const body=route.request().postDataJSON();assert.equal(body.sha,'test-sha');assert.equal(body.branch,'main');published=JSON.parse(Buffer.from(body.content,'base64').toString());await route.fulfill({json:{commit:{sha:'mock'}}});});
 await work.locator('#publish-token').fill('mock-test-token');await work.locator('#publish-results').click();await work.waitForFunction(()=>document.querySelector('#publish-status').textContent.includes('已提交成绩'));
 assert.equal(writes,1);assert.equal(published.records.lan.base,1000);assert.equal(published.records.mumu.base,1000);assert.equal(await work.locator('#publish-token').inputValue(),'');assert(!(await work.evaluate(()=>JSON.stringify(localStorage))).includes('mock-test-token'));
 // Repeated publication against changed remote must refuse to overwrite.
 await work.locator('#publish-token').fill('mock-test-token');await work.locator('#publish-results').click();await work.waitForFunction(()=>document.querySelector('#publish-status').textContent.includes('线上成绩已有更新'));assert.equal(writes,1);
 console.log('PASS publication payload, UTF-8, token clearing and remote conflict protection');
 const publicContext=await browser.newContext();const publicPage=await publicContext.newPage();await publicPage.goto(url);assert.equal(await publicPage.locator('.draft-badge').count(),0);assert.equal(await publicPage.locator('[data-result-player="lan"] .match-score strong').innerText(),'—');await publicContext.close();
 assert.deepEqual(errors,[]);console.log('PASS no browser errors, missing assets or draft leakage to visitors');
 }finally{if(browser)await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
