import fs from 'node:fs/promises'
import { chromium } from 'playwright'
import { createServer } from 'vite'
await fs.mkdir('layout-evidence', { recursive: true })
await fs.writeFile('layout-qa.html', '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><div id="root"></div><script type="module" src="/layout-qa.jsx"></script></body></html>')
await fs.writeFile('layout-qa.jsx', `
import React from 'react'
import { createRoot } from 'react-dom/client'
import { AppShell } from './src/features/shell/AppShell'
import { Navigator } from './src/features/navigator/Navigator'
import './src/styles.css'
import './src/accessibility-ui.css'
import './src/features/shell/responsiveShell.css'
import './src/ozzie-brand-polish.css'
import './src/features/shell/headerNavRevamp.css'
createRoot(document.getElementById('root')).render(
<AppShell profile={{id:'layout-fixture', username:'ja_admin', initials:'JA', role:'creator_admin', avatar_id:'avatar_001'}}><Navigator /></AppShell>
)
`)
const server = await createServer({ server: { host: '127.0.0.1', port: 5173 } })
await server.listen()
const browser = await chromium.launch()
const page = await browser.newPage()
await page.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort())
const output=[]
for(const width of [1672,1600,1440,1366,1280,1024,801,800,390,320]){
 await page.setViewportSize({width,height:width>=1280?941:900})
 await page.goto('http://127.0.0.1:5173/zoom-support-navigator/layout-qa.html')
 await page.getByRole('heading',{name:'Find the next step',exact:true}).waitFor()
 await page.evaluate(()=>document.fonts.ready)
 await page.screenshot({path:'layout-evidence/'+width+'.png',fullPage:true})
 const data=await page.evaluate(()=>{
  const selectors=['.app-header','.app-header-brand-row','.ozzie-brand-dock','.ozzie-brand-dock img','.account-menu','.top-navigation','.app-main','.navigator','.smart-search-card','.live-call-flow','.navigator-library','.fastest-route-grid','.feedback-fab'];
  return {width:innerWidth,scrollWidth:document.documentElement.scrollWidth,elements:Object.fromEntries(selectors.map(s=>{
   const e=document.querySelector(s);if(!e)return [s,null];const r=e.getBoundingClientRect(),c=getComputedStyle(e);
   return [s,{x:r.x,y:r.y,w:r.width,h:r.height,display:c.display,grid:c.gridTemplateColumns,justify:c.justifyContent,margin:c.margin,naturalWidth:e.naturalWidth||null}];
  }))}
 })
 output.push(data)
 if(width===1440){
  await page.getByText('Knowledge',{exact:true}).click()
  await page.getByRole('button',{name:'Favorites',exact:true}).waitFor({state:'visible'})
  await page.getByText('Knowledge',{exact:true}).click()
  await page.getByRole('button',{name:'ja_admin account',exact:true}).click()
  await page.getByRole('dialog').waitFor({state:'visible'})
  await page.keyboard.press('Escape')
  await page.getByRole('button',{name:/View approved call flow/}).click()
  await page.screenshot({path:'layout-evidence/expanded-flow.png',fullPage:true})
 }
 if(width===390){
  await page.getByRole('button',{name:'Toggle navigation',exact:true}).click()
  await page.getByRole('navigation',{name:'Primary navigation'}).waitFor({state:'visible'})
  await page.screenshot({path:'layout-evidence/mobile-menu.png',fullPage:true})
  await page.keyboard.press('Escape')
 }
}
await fs.writeFile('layout-evidence/metrics.json',JSON.stringify(output,null,2))
console.log(JSON.stringify(output))
await browser.close()
await server.close()
