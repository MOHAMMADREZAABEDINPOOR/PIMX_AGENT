import {test,expect} from '@playwright/test';

test('incoming preferences are consumed once and later edits survive reload',async({page})=>{
 const params=new URLSearchParams({appearance:JSON.stringify({themeMode:'LIGHT',accent:'TEAL'}),uiLocale:'fa',accentLight:'#0d9488',accentDark:'#2dd4bf',source:'navigation'});
 await page.addInitScript(()=>localStorage.setItem('pimx_cookie_consent','rejected'));
 await page.goto('/privacy?'+params);
 await expect(page.locator('html')).toHaveAttribute('lang','fa');
 await expect(page.locator('.cosmic-site')).toHaveAttribute('data-public-theme','light');
 await expect(page).toHaveURL(/\/fa\/privacy\?source=navigation$/);
 await page.getByRole('button',{name:'تغییر تم'}).click();
 await page.reload();
 await expect(page.locator('.cosmic-site')).toHaveAttribute('data-public-theme','dark');
 await page.goto('/');
 const links=page.locator('a[href*="chat.pimxagent.pages.dev"]');
 await expect(links.first()).toBeVisible();
 for(const href of await links.evaluateAll(items=>items.map(item=>(item as HTMLAnchorElement).href))){
  const params=new URL(href).searchParams;
  expect(params.get('uiLocale')).toBe('fa');
  expect(JSON.parse(params.get('appearance')!).themeMode).toBe('DARK');
 }
 await page.getByRole('button',{name:'تغییر تم'}).click();
 await expect.poll(async()=>JSON.parse(new URL((await page.locator('.hero-cta').first().getAttribute('href'))!).searchParams.get('appearance')!).themeMode).toBe('LIGHT');
});

test('language, mode and accent survive navigation between chat and public pages',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('pimx_cookie_consent','rejected'));
 await page.goto('/chat');await expect(page.locator('#composer-input')).toBeVisible();
 await page.locator('#btn-composer-model').click();
 await page.getByRole('button',{name:'Theme & Styling',exact:true}).click();
 await page.getByRole('button',{name:'Light Mode'}).click();
 await page.getByRole('button',{name:'Teal Pulse',exact:true}).click();
 await page.goto('/privacy');
 await expect(page.locator('.cosmic-site')).toHaveAttribute('data-public-theme','light');
 await expect(page.locator('.site-button')).toHaveCSS('background-color','rgb(13, 148, 136)');
 await page.getByRole('button',{name:'فارسی',exact:true}).click();
 await expect(page.locator('html')).toHaveAttribute('lang','fa');
 await page.goto('/terms');
 await expect(page.locator('html')).toHaveAttribute('lang','fa');
 await expect(page.locator('.cosmic-site')).toHaveAttribute('data-public-theme','light');
 await page.getByRole('button',{name:'تغییر تم'}).click();
 await page.goto('/chat');await expect(page.locator('#composer-input')).toBeVisible();
 await expect(page.locator('html')).toHaveClass(/dark/);
 await expect.poll(()=>page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim().toLowerCase())).toBe('#2dd4bf');
});

test('Pip wanders, can be dragged, and stays still with reduced motion',async({page})=>{
 await page.setViewportSize({width:390,height:850});
 await page.addInitScript(()=>localStorage.setItem('pimx_cookie_consent','rejected'));
 await page.goto('/chat');await expect(page.locator('#composer-input')).toBeVisible();
 const pet=page.locator('.pimx-pet');await expect(pet).toBeVisible();
 await page.mouse.move(350,50);
 const initial=await pet.boundingBox();
 await expect.poll(async()=>Math.abs((await pet.boundingBox())!.x-initial!.x),{timeout:9000}).toBeGreaterThan(25);
 const before=await pet.boundingBox();
 await page.mouse.move(before!.x+30,before!.y+30);await page.mouse.down();
 await page.mouse.move(before!.x+130,before!.y-110,{steps:8});await page.mouse.up();
 const after=await pet.boundingBox();expect(after!.y).toBeLessThan(before!.y-90);
 await expect(page.locator('.pet-dialog')).toHaveCount(0);
 await pet.locator('button.pet-body').click();
 const dialog=await page.locator('.pet-dialog').boundingBox();expect(dialog!.x).toBeGreaterThanOrEqual(0);expect(dialog!.x+dialog!.width).toBeLessThanOrEqual(390);
 await page.screenshot({path:'artifacts/qa/pip-mobile.png'});
 await page.getByRole('button',{name:'Close companion',exact:true}).click();
 await page.emulateMedia({reducedMotion:'reduce'});await page.mouse.move(350,50);
 const resting=await pet.boundingBox();await page.waitForTimeout(5000);
 expect((await pet.boundingBox())!.x).toBeCloseTo(resting!.x,0);
});

for(const width of [390,1440])test(`transfer stays in a modal and sidebar controls stay fixed at ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:1000});
 await page.addInitScript(()=>localStorage.setItem('pimx_cookie_consent','rejected'));
 await page.goto('/chat');await expect(page.locator('#composer-input')).toBeVisible();
 await page.locator('#btn-composer-model').click();
 await page.getByRole('button',{name:'General & UI Display',exact:true}).click();
 const transfer=page.getByRole('button',{name:'Save & transfer chats',exact:true});
 await expect(transfer).toBeVisible();
 const before=await transfer.boundingBox();
 for(const status of ['saving','saved','error','saved']){
  await page.evaluate(value=>window.dispatchEvent(new CustomEvent('pimx-vault-status',{detail:value})),status);
  const after=await transfer.boundingBox();expect(after!.y).toBeCloseTo(before!.y,1);
 }
 await transfer.click();
 await expect(page.getByRole('dialog',{name:'Save & transfer chats'})).toBeVisible();
 await expect(page).toHaveURL(/\/chat$/);
 await expect(page.locator('.database-transfer input[name="passphrase"]')).toBeVisible();
 await page.keyboard.press('Escape');
 await expect(page.getByRole('dialog')).toHaveCount(0);
 await expect(page.locator('#settings-modal')).toBeVisible();
});
