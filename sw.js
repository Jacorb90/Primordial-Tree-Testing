if(!self.define){let e,s={};const i=(i,n)=>(i=new URL(i+".js",n).href,s[i]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=i,e.onload=s,document.head.appendChild(e)}else e=i,importScripts(i),s()})).then((()=>{let e=s[i];if(!e)throw new Error(`Module ${i} didn’t register its module`);return e})));self.define=(n,l)=>{const r=e||("document"in self?document.currentScript.src:"")||location.href;if(s[r])return;let t={};const o=e=>i(e,r),u={module:{uri:r},exports:t,require:o};s[r]=Promise.all(n.map((e=>u[e]||o(e)))).then((e=>(l(...e),t)))}}define(["./workbox-958fa2bd"],(function(e){"use strict";self.addEventListener("message",(e=>{e.data&&"SKIP_WAITING"===e.data.type&&self.skipWaiting()})),e.precacheAndRoute([{url:"assets/@ivanv.89b9fb6e.js",revision:null},{url:"assets/@vue.f16def16.js",revision:null},{url:"assets/index.bf5822a5.js",revision:null},{url:"assets/index.e9aab5d2.css",revision:null},{url:"assets/is-plain-object.906d88e8.js",revision:null},{url:"assets/lz-string.731cedc5.js",revision:null},{url:"assets/nanoevents.1080beb7.js",revision:null},{url:"assets/sortablejs.979fc46a.js",revision:null},{url:"assets/vue-next-select.9e6f4164.css",revision:null},{url:"assets/vue-next-select.b0c1cf10.js",revision:null},{url:"assets/vue-textarea-autosize.35804eaf.js",revision:null},{url:"assets/vue-toastification.4b5f8ac8.css",revision:null},{url:"assets/vue-toastification.ce13befc.js",revision:null},{url:"assets/vue.03290593.js",revision:null},{url:"assets/vuedraggable.5a5850e9.js",revision:null},{url:"assets/workbox-window.8d14e8b7.js",revision:null},{url:"index.html",revision:"8c05ee20b4346db96c808b873eee1a4a"},{url:"favicon.ico",revision:"eead31eb5b19fa3bdc34af83d898c0b7"},{url:"robots.txt",revision:"5e0bd1c281a62a380d7a948085bfe2d1"},{url:"apple-touch-icon.png",revision:"26e53bb981d06c8069ffd9d2a14fce0e"},{url:"pwa-192x192.png",revision:"a16785d9e890858c5b508e0ef6954aaf"},{url:"pwa-512x512.png",revision:"b84004b93fd62ef6599ff179372861a1"},{url:"manifest.webmanifest",revision:"77f48a0c6d474e2e4d67d7c96474173f"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html")))}));
