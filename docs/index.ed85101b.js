const e=[{class:class{constructor(){const e=document.querySelectorAll("[data-target-cover]"),t=document.querySelectorAll("[data-target-dot]"),o=document.querySelectorAll("iframe"),l=document.querySelector(".cursor");var n=!1,r=!1,c=.5*document.documentElement.clientWidth,s=.5*document.documentElement.clientHeight,d=0,a=0,i=0,u=0,m=40,y=40;l.style.opacity="0",document.addEventListener("mousemove",(e=>{l.style.width=m+"px",l.style.height=y+"px",n&&!r?(c=d+i-.5*m,s=a+u-.5*y,l.style.background="#fff",l.style.filter="blur(0)",l.style.opacity="1",l.style.borderRadius="10px"):r&&!n?(c=d+i,s=a+u,l.style.background="#fff",l.style.opacity="1",l.style.filter="blur(0)"):(c=e.clientX-.5*m,s=e.clientY-.5*y,l.style.filter="blur(32px)",l.style.opacity="0.3",l.style.borderRadius="50%"),l.style.transform="translate("+c+"px,"+s+"px)"})),document.addEventListener("mouseleave",(()=>{l.style.opacity="0"})),e.forEach((e=>{e.addEventListener("mousemove",(t=>{n=!0;let o=e.getBoundingClientRect();m=o.width+0,y=o.height+0,d=.5*(o.left+o.right),a=.5*(o.top+o.bottom),i=(t.clientX-d)/m*5,u=(t.clientY-a)/y*5})),e.addEventListener("mouseleave",(e=>{n=!1,m=40,y=40,d=0,a=0,i=0,u=0}))})),t.forEach((e=>{e.addEventListener("mousemove",(t=>{r=!0;let o=e.getBoundingClientRect();d=o.right-20,a=o.bottom-20,m=5,y=5,i=5*(t.clientX-.5*(o.left+o.right))*.005,u=5*(t.clientY-.5*(o.top+o.bottom))*.005})),e.addEventListener("mouseleave",(e=>{r=!1,m=40,y=40,d=0,a=0,i=0,u=0}))})),o.forEach((e=>{e.addEventListener("mousemove",(e=>{l.style.opacity="0"})),e.addEventListener("mouseleave",(e=>{l.style.opacity="1"}))}))}},selector:".cursor"}];document.addEventListener("DOMContentLoaded",(()=>{e.forEach((e=>{null!==document.querySelector(e.selector)&&document.querySelectorAll(e.selector).forEach((t=>new e.class(t,e.options)))}))}));
//# sourceMappingURL=index.ed85101b.js.map