import {test,expect} from '@playwright/test';

test('selected accent reaches settings, chat and public pages and survives theme changes and reload',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('pimx_cookie_consent','rejected'));
 await page.goto('/chat');
 await expect(page.locator('#composer-input')).toBeVisible();
 await page.locator('#btn-composer-model').click();
 await page.getByRole('button',{name:'Theme & Styling',exact:true}).click();
 await page.getByRole('button',{name:'Light Mode'}).click();
 await page.getByRole('button',{name:'Teal Pulse',exact:true}).click();
 const accent=()=>page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim().toLowerCase());
 await expect.poll(accent).toBe('#0d9488');
 await expect(page.getByRole('button',{name:'Theme & Styling',exact:true})).toHaveCSS('color','rgb(13, 148, 136)');
 await page.screenshot({path:'artifacts/qa/accent-light-settings.png'});
 await page.getByRole('button',{name:'Obsidian Deep',exact:false}).click();
 await expect.poll(accent).toBe('#0d9488');
 await page.getByRole('button',{name:'Dark Mode'}).click();
 await expect.poll(accent).toBe('#2dd4bf');
 await page.reload();
 await expect(page.locator('#composer-input')).toBeVisible();
 await expect.poll(accent).toBe('#2dd4bf');
 await expect(page.locator('#btn-composer-model')).toHaveCSS('color','rgb(45, 212, 191)');
 const homeLink=page.getByRole('link',{name:'About PIMX Agent'});
 await expect(homeLink).toHaveAttribute('href',/accentLight=%230D9488.*accentDark=%232DD4BF/i);
 await page.screenshot({path:'artifacts/qa/accent-dark-chat.png'});
 await page.goto('/privacy');
 await expect(page.locator('.site-button')).toHaveCSS('background-color','rgb(45, 212, 191)');
 await page.getByRole('button',{name:'Toggle theme'}).click();
 await expect(page.locator('.site-button')).toHaveCSS('background-color','rgb(13, 148, 136)');
});

test('public pages receive only validated appearance colors from the chat home link',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('pimx_cookie_consent','rejected'));
 await page.goto('/?accentLight=%230D9488&accentDark=%232DD4BF');
 await expect(page.locator('.site-nav .site-button')).toHaveCSS('background-color','rgb(45, 212, 191)');
 await page.reload();
 await expect(page.locator('.site-nav .site-button')).toHaveCSS('background-color','rgb(45, 212, 191)');
 await page.goto('/privacy?accentLight=invalid&accentDark=invalid');
 await expect(page.locator('.site-button')).toHaveCSS('background-color','rgb(45, 212, 191)');
});

test('follow theme uses both mode colors and system mode responds to OS changes',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('pimx_cookie_consent','rejected'));
 await page.emulateMedia({colorScheme:'dark'});
 await page.goto('/chat');
 await expect(page.locator('#composer-input')).toBeVisible();
 await page.locator('#btn-composer-model').click();
 await page.getByRole('button',{name:'Theme & Styling',exact:true}).click();
 await page.getByRole('button',{name:'Follow Theme (Violet)',exact:true}).click();
 await page.getByRole('button',{name:'System Default'}).click();
 const accent=()=>page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim().toLowerCase());
 await expect.poll(accent).toBe('#8b7cff');
 await page.emulateMedia({colorScheme:'light'});
 await expect.poll(accent).toBe('#4f46e5');
});
