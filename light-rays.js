/* Angular light fields: two independently moving ray sets, following the inspected
   Framer University Light Rays mechanism used by the Nabokov reference. */
(() => {
 const surface=document.querySelector('.ai-surface'); if(!surface)return;
 surface.querySelector('.ai-rays')?.remove();
 const canvas=document.createElement('canvas');canvas.setAttribute('aria-hidden','true');
 canvas.style.cssText='position:absolute;inset:0;width:100%;height:680px;max-height:70%;pointer-events:none;z-index:-1;opacity:.85;mask-image:linear-gradient(#000, #000b 55%,transparent)';
 surface.prepend(canvas); const ctx=canvas.getContext('2d'); if(!ctx)return;
 canvas.width=240;canvas.height=146;
 const image=ctx.createImageData(canvas.width,canvas.height);
 const geometry=Array.from({length:canvas.width*canvas.height},(_,i)=>{const y=Math.floor(i/canvas.width),x=i%canvas.width,dx=(x/canvas.width-.5)*1.7,dy=y/canvas.height+.4;return [Math.atan2(dx,dy),Math.atan2(dx-.034,dy+.1),Math.pow(1-y/canvas.height,1.6)];});
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'); let visible=true,last=0;
 new IntersectionObserver(e=>visible=e[0].isIntersecting).observe(canvas);
 const frame=t=>{requestAnimationFrame(frame);if(!visible||document.hidden||t-last<70||(reduced.matches&&last))return;last=t;
 const w=canvas.width,h=canvas.height,data=image,time=t*.0003;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
 const [a,b,fade]=geometry[y*w+x];
 const f=(Math.sin(a*36.2214*.9+time*1.35)+Math.cos(a*21.11349*.9-time*.99))*.5;
 const g=(Math.sin(b*22.3991*.9-time*.99)+Math.cos(b*18.0234*.9+time*1.35))*.5;
 const v=Math.min(1,(Math.pow(Math.max(0,f),2)*.65+Math.pow(Math.max(0,g),2)*.55+.09)*fade);
 const i=(y*w+x)*4; data.data[i]=245;data.data[i+1]=139;data.data[i+2]=65;data.data[i+3]=v*155;
 }ctx.putImageData(data,0,0);
 };requestAnimationFrame(frame);
})();


