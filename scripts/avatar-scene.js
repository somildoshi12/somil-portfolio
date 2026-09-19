import * as THREE from './vendor/three.module.js';
import { createSomilAvatar } from './avatar-model.js';

const host = document.querySelector('#avatar-stage');
const canvas = document.querySelector('#avatar-canvas');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const motionButton = document.querySelector('#motion-control');
let paused = reduced.matches;
let renderer;
try {
  renderer = new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});
} catch (error) {
  host.classList.add('avatar-unavailable');
  motionButton.hidden = true;
  document.querySelector('.avatar-caption').textContent = 'Somil Doshi';
}
if (renderer) init();

function init() {
  renderer.setClearColor(0x000000,0);
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.3;
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(32,1,.1,50);
  camera.position.set(0,2.45,9);camera.lookAt(0,2.3,0);
  scene.add(new THREE.HemisphereLight('#e4eaff','#555d7b',2.5));
  const key=new THREE.DirectionalLight('#fff0db',4);key.position.set(-3,6,5);scene.add(key);
  const rim=new THREE.DirectionalLight('#a19bff',3);rim.position.set(3,4,-3);scene.add(rim);
  const fill=new THREE.DirectionalLight('#c4e4ff',1);fill.position.set(4,2,4);scene.add(fill);
  const {avatar,head,arms,legs}=createSomilAvatar();scene.add(avatar);
  const platform = new THREE.Mesh(new THREE.CylinderGeometry(.92,1.0,.065,64),new THREE.MeshStandardMaterial({color:'#32354a',roughness:.5,metalness:.3}));
  platform.position.y=.015;scene.add(platform);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(.93,.016,8,80),new THREE.MeshBasicMaterial({color:'#aaa1ff'}));ring.rotation.x=Math.PI/2;ring.position.y=.056;scene.add(ring);
  // A soft procedural shadow on the platform, no external texture requests.
  const shadowCanvas=document.createElement('canvas');shadowCanvas.width=128;shadowCanvas.height=128;
  const ctx=shadowCanvas.getContext('2d'),gradient=ctx.createRadialGradient(64,64,3,64,64,62);
  gradient.addColorStop(0,'rgba(0,0,0,.65)');gradient.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128);
  const shadow=new THREE.Mesh(new THREE.PlaneGeometry(1.8,1.8),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(shadowCanvas),transparent:true,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=.055;scene.add(shadow);
  const sections=[...document.querySelectorAll('section[id]')];
  const rotations=[-.24,.38,-.5,.24,-.35,.48,-.3,.1];
  const clamp=THREE.MathUtils.clamp;
  let frame=0,last=0,time=0,pointer={x:0,y:0},drag=0,isDragging=false,dragStart=0,scrollDirty=true;
  let desired={rotation:-.24,scale:1,top:0,left:0,width:0,height:0,wave:0};
  const layout={...desired};
  function updateLayout(){
    const mobile=innerWidth<760;
    const hero=document.querySelector('#home').getBoundingClientRect();
    const progress=clamp(-hero.top/Math.max(1,hero.height*.68),0,1);
    const eased=progress*progress*(3-2*progress);
    const heroAnchor=document.querySelector('.avatar-anchor').getBoundingClientRect();
    const width=mobile?THREE.MathUtils.lerp(Math.min(innerWidth*.8,350),108,eased):THREE.MathUtils.lerp(innerWidth*.41,innerWidth*.285,eased);
    const height=mobile?THREE.MathUtils.lerp(360,165,eased):Math.min(innerHeight*.73,710);
    desired.width=width;desired.height=height;
    desired.left=mobile?THREE.MathUtils.lerp((innerWidth-width)/2,innerWidth-width-10,eased):THREE.MathUtils.lerp(innerWidth*.555,innerWidth*.7,eased);
    desired.top=mobile?THREE.MathUtils.lerp(heroAnchor.top,innerHeight-height-65,eased):Math.max(95,(innerHeight-height)/2+15);
    host.classList.toggle('avatar-compact',mobile&&progress>.7);
    document.body.classList.toggle('past-hero',progress>.85);
    let index=0;
    sections.forEach((s,i)=>{if(s.getBoundingClientRect().top<innerHeight*.5)index=i;});
    const next=Math.min(index+1,sections.length-1);
    const r=sections[index].getBoundingClientRect();
    const t=clamp((innerHeight*.5-r.top)/Math.max(r.height,1),0,1);
    desired.rotation=THREE.MathUtils.lerp(rotations[index]||0,rotations[next]||0,t);
    desired.wave=sections[index].id==='contact'?1:0;
    if (!mobile && !paused) desired.top += Math.sin(t*Math.PI)*22;
    host.dataset.section=sections[index].id;
    document.querySelector('#avatar-chapter').textContent=String(index+1).padStart(2,'0')+' / '+(sections[index].querySelector('h2')?.textContent||'INTRODUCTION').toUpperCase();
    scrollDirty=false;
  }
  function resize(){scrollDirty=true;wake();}
  function wake(){if(!frame&&!document.hidden)frame=requestAnimationFrame(render);}
  function setMotion(value){paused=value;motionButton.textContent=paused?'Enable motion':'Pause motion';motionButton.setAttribute('aria-pressed',String(paused));document.body.classList.toggle('motion-paused',paused);wake();}
  function render(now){
    frame=0;
    const dt=Math.min((now-(last||now))/1000,.05);last=now;
    if(!paused)time+=dt;
    if(scrollDirty)updateLayout();
    // Layout follows scroll directly; only local character motion is eased.
    Object.assign(layout,desired);
    host.style.left=layout.left+'px';host.style.top=layout.top+'px';host.style.width=layout.width+'px';host.style.height=layout.height+'px';
    const w=Math.round(layout.width),h=Math.round(layout.height);
    if(canvas.clientWidth!==w||canvas.clientHeight!==h||canvas.width!==Math.floor(w*renderer.getPixelRatio())){renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
    const target=paused?-.24:desired.rotation+drag;
    avatar.rotation.y=THREE.MathUtils.lerp(avatar.rotation.y,target,paused?1:1-Math.exp(-dt*7));
    avatar.position.y=paused?0:Math.sin(time*1.5)*.045;
    avatar.rotation.z=paused?0:Math.sin(time*.8)*.016;
    head.rotation.y=paused?0:pointer.x*.15;head.rotation.x=paused?0:pointer.y*.08;
    arms[0].arm.rotation.z=THREE.MathUtils.lerp(arms[0].arm.rotation.z, paused?-.15:-.15-desired.wave*.45+Math.sin(time*1.5)*.025,.06);
    arms[1].arm.rotation.z=.13+(paused?0:Math.sin(time*1.5+1)*.025);
    arms[0].elbow.rotation.x=-.16;arms[0].elbow.rotation.z=paused?0:-desired.wave*(2.0+Math.sin(time*3)*.15);arms[1].elbow.rotation.x=-.2;
    legs[0].rotation.z=-.035;legs[1].rotation.z=.035;
    renderer.render(scene,camera);
    host.classList.add('avatar-ready');
    if(!paused&&!document.hidden)wake();
  }
  canvas.addEventListener('pointerdown',e=>{if(paused)return;isDragging=true;dragStart=e.clientX;canvas.setPointerCapture(e.pointerId);});
  canvas.addEventListener('pointermove',e=>{if(paused)return;if(isDragging){drag+=(e.clientX-dragStart)*.012;dragStart=e.clientX;}const r=canvas.getBoundingClientRect();pointer.x=clamp((e.clientX-r.left)/r.width*2-1,-1,1);pointer.y=clamp((e.clientY-r.top)/r.height*2-1,-1,1);wake();});
  const endDrag=()=>{isDragging=false;};canvas.addEventListener('pointerup',endDrag);canvas.addEventListener('pointercancel',endDrag);
  canvas.addEventListener('pointerleave',()=>{pointer={x:0,y:0};});
  motionButton.addEventListener('click',()=>setMotion(!paused));
  reduced.addEventListener('change',e=>setMotion(e.matches));
  addEventListener('scroll',()=>{scrollDirty=true;wake();},{passive:true});addEventListener('resize',resize);
  // Expanded experience cards change section positions without a window resize.
  new ResizeObserver(()=>{scrollDirty=true;wake();}).observe(document.querySelector('main'));
  document.addEventListener('visibilitychange',()=>{last=0;if(document.hidden){cancelAnimationFrame(frame);frame=0;}else wake();});
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();cancelAnimationFrame(frame);frame=0;host.classList.remove('avatar-ready');host.classList.add('avatar-unavailable');});
  canvas.addEventListener('webglcontextrestored',()=>{host.classList.remove('avatar-unavailable');wake();});
  setMotion(paused);
}
