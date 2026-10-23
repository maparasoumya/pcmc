import { test, expect } from '@playwright/test';
import fs from 'node:fs';
const citizen=process.env.PCMC_PORTAL_URL||'http://127.0.0.1:5183',admin=process.env.PCMC_ADMIN_URL||'http://127.0.0.1:5184';
const credentials=process.env.PCMC_TEST_CREDENTIALS ? JSON.parse(fs.readFileSync(process.env.PCMC_TEST_CREDENTIALS,'utf8')) : null;
async function login(page){await page.goto(admin+'/login');await page.getByLabel('Email',{exact:true}).fill(credentials.username);await page.getByLabel('Password',{exact:true}).fill(credentials.password);await page.getByRole('button',{name:/Sign In|Sign in|Login/}).click();await expect(page).toHaveURL(/dashboard/);}

test('original login, event editor, projects and inbox stay functional',async({page,browser})=>{
 test.skip(!credentials,'Set PCMC_TEST_CREDENTIALS for an isolated test database.');
 const stamp=Date.now();const errors=[];page.on('pageerror',error=>errors.push(error.message));await login(page);
 await expect(page.locator('.manager')).toHaveCount(0);
 await page.goto(admin+'/events');await expect(page.locator('#event-form')).toBeVisible();
 await page.locator('[name=title]').fill(`Original UI meeting ${stamp}`);await page.locator('[name=date]').fill('2099-10-22');await page.locator('[name=description]').fill('Published through the original event form.');await page.locator('[name=status]').selectOption('Published');await page.getByRole('button',{name:/Save Event/}).click();await expect(page.getByText('Event saved successfully.',{exact:true})).toBeVisible();await page.reload();await expect(page.locator('body')).toContainText(`Original UI meeting ${stamp}`);
 await page.goto(admin+'/projects');await page.locator('[name=name]').fill(`Original UI project ${stamp}`);await page.locator('[name=sectorId]').selectOption('rising-heat');await page.getByRole('button',{name:/Save Project|Add Project/}).click();await expect(page.locator('body')).toContainText('Project added successfully on the server.');await page.reload();await expect(page.locator('body')).toContainText(`Original UI project ${stamp}`);
 const context=await browser.newContext();const publicPage=await context.newPage();publicPage.on('pageerror',error=>errors.push(error.message));await publicPage.goto(citizen+'/get-involved');await expect(publicPage.locator('.suggestion-card')).toBeVisible();await expect(publicPage.locator('.query-card')).toBeVisible();await expect(publicPage.locator('.registration-section')).toBeVisible();await publicPage.locator('.query-card a').click();await expect(publicPage.getByRole('dialog')).toBeVisible();
 await publicPage.getByLabel('Name',{exact:true}).fill('Original UI citizen');await publicPage.getByLabel('Email',{exact:true}).fill('citizen@example.com');await publicPage.getByLabel('Subject',{exact:true}).fill(`Original UI query ${stamp}`);await publicPage.getByLabel('Message',{exact:true}).fill('Where can I join the public meeting?');await publicPage.getByLabel('I consent').check();await publicPage.getByRole('button',{name:'Submit',exact:true}).click();await expect(publicPage.getByRole('status')).toContainText('Your submission has been received');
 await page.goto(admin+'/suggestions');await page.getByPlaceholder(/Search/).fill(`Original UI query ${stamp}`);await page.getByRole('button').filter({hasText:`Original UI query ${stamp}`}).click();await expect(page.locator('body')).toContainText('Where can I join the public meeting?');
 await page.getByRole('button',{name:/Under Review|Under review/}).last().click();await expect(page.getByRole('status')).toContainText('under review');await page.reload();await page.getByPlaceholder(/Search/).fill(`Original UI query ${stamp}`);await expect(page.locator('body')).toContainText('Under Review');
 expect(errors).toEqual([]);await context.close();
});

test('original resource and progress forms save to the server',async({page})=>{
 test.skip(!credentials,'Set PCMC_TEST_CREDENTIALS for an isolated test database.');
 await login(page);const stamp=Date.now();await page.goto(admin+'/resources');await page.locator('[name=title]').fill(`Original UI guide ${stamp}`);await page.locator('[name=url]').fill('https://example.com/guide.pdf');await page.locator('[name=status]').first().selectOption('Published');await page.getByRole('button',{name:/Save Resource/}).click();await expect(page.getByText('Resource added successfully.',{exact:true})).toBeVisible();await page.reload();await expect(page.locator('body')).toContainText(`Original UI guide ${stamp}`);
 await page.goto(admin+'/progress');await page.locator('[name=sectorId]').first().selectOption('rising-heat');await page.locator('[name=goal]').fill(`Trees ${stamp}`);await page.locator('[name=target]').fill('100');await page.locator('[name=currentValue]').fill('25');await page.locator('[name=unit]').fill('trees');await page.getByRole('button',{name:/Save Progress|Save Record|Add Record|Save Draft/}).click();await expect(page.locator('body')).toContainText('Progress record saved to the server.');
 await page.goto(citizen+'/progress');await expect(page.locator('.progress-grid')).toContainText('25 / 100 trees');
});

test('original home and login match the supplied ZIP geometry and styles',async({browser})=>{
 test.skip(!process.env.PCMC_BASELINE_UI,'Set PCMC_BASELINE_UI with baseline servers running on 5193/5194.');
 const context=await browser.newContext({viewport:{width:1440,height:1000}});await context.addInitScript(()=>sessionStorage.setItem('eventAnnouncementDismissed','true'));
 const pages=[];for(const url of ['http://127.0.0.1:5193',citizen]){const page=await context.newPage();await page.route('**/api/**',route=>route.fulfill({status:200,contentType:'application/json',body:'[]'}));await page.goto(url);await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(3200);pages.push(page);}
 const selectors=['.navbar','.hero-section','.cee-activities-section','.sector-grid','.footer'];
 for(const selector of selectors){const results=[];for(const page of pages)results.push(await page.locator(selector).evaluate(el=>{const r=el.getBoundingClientRect(),s=getComputedStyle(el);return {width:r.width,height:r.height,background:s.backgroundColor,padding:s.padding,font:s.fontFamily};}));expect(results[1],selector).toEqual(results[0]);}
 await pages[0].screenshot({path:'test-results/original-home.png',fullPage:true});await pages[1].screenshot({path:'test-results/restored-home.png',fullPage:true});
 const logins=[];for(const url of ['http://127.0.0.1:5194/login',admin+'/login']){const page=await context.newPage();await page.goto(url);await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:logins.length?'test-results/restored-login.png':'test-results/original-login.png'});logins.push(await page.locator('form').evaluate(el=>{const r=el.getBoundingClientRect();return {width:r.width,height:r.height,x:r.x,y:r.y};}));}expect(logins[1]).toEqual(logins[0]);await context.close();
});
