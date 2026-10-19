// Pantry layout audit — console checks (one per finding).
// Paste a check into Chrome DevTools at the viewport named in the guide; it prints PASS or FAIL.
// These are the same checks the guide shows; keep them in sync with src/data.ts in the guide build.

// ---- Finding 01: Screenshots and re-check
(()=>{const h=document.querySelector('header');const v=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0};const lg=[...h.querySelectorAll('.df-navbar-logo, img')].find(v);const bs=[...h.querySelectorAll('button')].filter(v).filter(b=>!/menu/i.test(b.getAttribute('aria-label')||''));const L=lg.getBoundingClientRect();const hit=bs.filter(b=>{const r=b.getBoundingClientRect();return r.left<L.right&&r.right>L.left});console.log(hit.length?'FAIL '+innerWidth+'px: logo overlaps '+hit.map(b=>b.getAttribute('aria-label')).join(', '):'PASS '+innerWidth+'px: no overlap')})()

// ---- Finding 02: Initial audit
(()=>{const b=[...document.querySelectorAll('.df-pc-lowstock')].filter(e=>e.getBoundingClientRect().width>0);const bad=b.filter(e=>e.scrollWidth>e.clientWidth+1);console.log(bad.length?'FAIL: '+bad.length+' of '+b.length+' badges clipped ('+bad[0].scrollWidth+'px text in '+bad[0].clientWidth+'px)':'PASS: '+b.length+' badges, none clipped')})()

// ---- Finding 03: Logo collides with the search icon on phones
(()=>{const c=document.querySelector('.df-pd-crumbs');const img=document.querySelector('main img');const h1=document.querySelector('h1');const ct=c.getBoundingClientRect().top,it=img.getBoundingClientRect().top,ih=img.getBoundingClientRect().height;const ok1=ct<it;const ok2=innerWidth<768||h1.getBoundingClientRect().top<innerHeight;console.log((ok1?'PASS':'FAIL')+' breadcrumb '+(ok1?'above':'below')+' gallery · gallery '+Math.round(ih)+'px tall · '+(ok2?'PASS':'FAIL')+' title visible in first screen at '+innerWidth+'px')})()

// ---- Finding 04: "ONLY 2 LEFT" badge is cut off on product cards
(()=>{const ab=document.querySelector('.df-announcement-bar');const h=document.querySelector('header');const a=ab?ab.getBoundingClientRect().height:0;const hh=h.getBoundingClientRect().height;console.log((a<=56&&a+hh<=180?'PASS':'FAIL')+' '+innerWidth+'px: announcement '+Math.round(a)+'px + header '+Math.round(hh)+'px = '+Math.round(a+hh)+'px (target: bar ≤ 56, total ≤ 180)')})()

// ---- Finding 05: Breadcrumb sits under the gallery; tablets get a full screen of image
(()=>{const v=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0};const arrows=[...document.querySelectorAll('.df-fc-arrow, .df-pcarousel-arrow')].filter(v);const items=[...document.querySelectorAll('.df-fc-tile, .df-pc')].filter(v);let bad=0;for(const a of arrows){const A=a.getBoundingClientRect();if(items.some(t=>{const r=t.getBoundingClientRect();return r.left<A.right&&r.right>A.left&&r.top<A.bottom&&r.bottom>A.top}))bad++}console.log((bad?'FAIL: ':'PASS: ')+bad+' of '+arrows.length+' visible arrows overlap a tile/card at '+innerWidth+'px')})()

// ---- Finding 06: Announcement bar and header eat up to a third of the phone screen
(()=>{const b=[...document.querySelectorAll('button')].find(b=>/^filters?$/i.test(b.innerText.trim()));if(!b){console.log('no Filters button at '+innerWidth+'px (desktop sidebar?)');return}b.click();setTimeout(()=>{const s=document.querySelector('.df-products-sidebar.open');if(!s){console.log('FAIL: sidebar did not open');return}const pos=getComputedStyle(s).position;const apply=[...s.querySelectorAll('button')].some(x=>/result|apply|done|show/i.test(x.innerText));console.log((pos==='fixed'&&apply?'PASS':'FAIL')+': sidebar position '+pos+', apply/results button '+(apply?'present':'missing'))},600)})()

// ---- Finding 07: Carousel arrows cover the last tile or card
(()=>{const v=e=>{const s=getComputedStyle(e);if(s.display==='none'||s.visibility==='hidden')return false;const r=e.getBoundingClientRect();return r.width>1&&r.height>1};const els=[...document.querySelectorAll('a,button,[role=button],select')].filter(v);const bad=els.filter(e=>{const r=e.getBoundingClientRect();return r.height<28||r.width<28});console.log((bad.length?'FAIL: ':'PASS: ')+bad.length+' of '+els.length+' interactive elements under 28px at '+innerWidth+'px'+(bad[0]?' e.g. '+bad[0].className.toString().split(' ')[0]+' '+Math.round(bad[0].getBoundingClientRect().width)+'×'+Math.round(bad[0].getBoundingClientRect().height):''))})()

// ---- Finding 08: Mobile filters open inline and push the products away
(()=>{const v=e=>{const s=getComputedStyle(e);if(s.display==='none'||s.visibility==='hidden')return false;const r=e.getBoundingClientRect();return r.width>0&&r.height>0};const bad=[...document.querySelectorAll('body *')].filter(e=>!['SCRIPT','STYLE','svg','path'].includes(e.tagName)&&v(e)&&[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim().length>3)&&parseFloat(getComputedStyle(e).fontSize)<12);console.log((bad.length?'FAIL: ':'PASS: ')+bad.length+' text elements under 12px at '+innerWidth+'px'+(bad[0]?' e.g. '+bad[0].className.toString().split(' ')[0]+' '+getComputedStyle(bad[0]).fontSize:''))})()

// ---- Finding 09: Links and buttons too small to tap
(()=>{const v=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0};const imgs=[...document.images].filter(v);const bad=imgs.filter(im=>!im.getAttribute('width')&&!im.getAttribute('height')&&!/\d/.test(getComputedStyle(im).aspectRatio||''));console.log((bad.length?'FAIL: ':'PASS: ')+bad.length+' of '+imgs.length+' visible images without width/height or aspect-ratio')})()

// ---- Finding 10: Chip and label text is 10–11px
(()=>{const sk=document.querySelectorAll('.df-pc-skeleton').length;const clipped=[...document.querySelectorAll('.df-pc-name')].filter(e=>e.scrollWidth>e.clientWidth+2&&getComputedStyle(e).textOverflow!=='ellipsis'&&getComputedStyle(e).webkitLineClamp==='none').length;const bogus=[...document.querySelectorAll('.df-pc-tag')].filter(e=>/(\d{3,})\s*%/.test(e.innerText)).length;console.log((sk||clipped||bogus?'FAIL':'PASS')+': skeletons '+sk+' · clipped names '+clipped+' · potency >100% '+bogus+' (run after the page has settled)')})()
