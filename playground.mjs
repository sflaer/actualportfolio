import * as THREE from './vendor/three/build/three.module.js';
import {OrbitControls} from './vendor/three/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from './vendor/three/examples/jsm/loaders/GLTFLoader.js';
import {characters,buildCharacter} from './symbios-models.mjs';

const host=document.getElementById('playgroundContent');
host.innerHTML=`<div class="pg-layout"><nav class="pg-projects" aria-label="Проекты Playground"><button data-project="zabey">Бренд одежды Забей</button><button data-project="symbios" aria-pressed="true">Умные дома Symbios</button></nav><div class="pg-stage"><div class="pg-canvas"></div><div class="pg-unavailable" hidden>Бренд одежды Забей<br><small>Персонажи появятся здесь позже</small></div><div class="pg-caption"><span>Перетащи, чтобы повернуть · прокрути, чтобы приблизить</span><button class="pg-reset" type="button">Сбросить ракурс</button></div></div><nav class="pg-characters" aria-label="Персонажи Symbios">${characters.map((c,i)=>`<button data-character="${i}" aria-pressed="${i===0}"><span style="--swatch:#${c.shirt.toString(16).padStart(6,'0')}"></span>${c.name}</button>`).join('')}<a class="pg-model-download" download href="models/symbios/dima.glb">Скачать 3D-модель ↓</a></nav></div>`;
const stage=host.querySelector('.pg-canvas');
try{
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.setClearColor(0x000000,0);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
stage.append(renderer.domElement);renderer.domElement.setAttribute('aria-label','Интерактивная 3D-модель персонажа Symbios');
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(35,1,.1,40);
const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,1.7,0);controls.enableDamping=false;controls.minDistance=2.6;controls.maxDistance=10;controls.maxPolarAngle=Math.PI*.9;controls.enablePan=false;
scene.add(new THREE.HemisphereLight(0xffead3,0x6c7182,3));
const key=new THREE.DirectionalLight(0xffe3cd,4);key.position.set(3,6,5);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-3;key.shadow.camera.right=3;key.shadow.camera.top=5;key.shadow.camera.bottom=-1;key.shadow.normalBias=.035;scene.add(key);
const rim=new THREE.DirectionalLight(0xbad3ff,2);rim.position.set(-4,3,-3);scene.add(rim);
const floor=new THREE.Mesh(new THREE.CircleGeometry(2.2,64),new THREE.ShadowMaterial({opacity:.22}));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;floor.position.y=.005;scene.add(floor);
let model,active=0,selection=0;
const loader=new GLTFLoader();
function render(){renderer.render(scene,camera);}
function reset(){camera.position.set(3,2.5,6.5);controls.target.set(0,1.65,0);controls.update();render();}
function dispose(object){object.traverse(o=>{o.geometry?.dispose();const materials=Array.isArray(o.material)?o.material:[o.material];materials.filter(Boolean).forEach(m=>{for(const value of Object.values(m))if(value?.isTexture)value.dispose();m.dispose();});});}
async function select(index){
  const request=++selection;
  active=index;
  host.querySelectorAll('[data-character]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.character)===active)));
  host.querySelector('.pg-model-download').href=`models/symbios/${characters[index].id}.glb`;
  stage.setAttribute('aria-busy','true');
  try{
    const next=index===0?(await loader.loadAsync('models/symbios/dima.glb?v=uploaded1')).scene:buildCharacter(characters[index]);
    if(request!==selection){dispose(next);return;}
    if(index===0){
      const box=new THREE.Box3().setFromObject(next),size=box.getSize(new THREE.Vector3());
      next.scale.multiplyScalar(3.3/size.y);
      const normalized=new THREE.Box3().setFromObject(next),center=normalized.getCenter(new THREE.Vector3());
      next.position.x-=center.x;next.position.z-=center.z;next.position.y-=normalized.min.y;
      next.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
    }
    if(model){scene.remove(model);dispose(model);}
    model=next;scene.add(model);render();
  }catch(error){console.error('Character load:',error);stage.setAttribute('aria-label','Не удалось загрузить персонажа. Выбери его повторно.');}
  finally{if(request===selection)stage.setAttribute('aria-busy','false');}
}
controls.addEventListener('change',render);
host.querySelectorAll('[data-character]').forEach(b=>b.addEventListener('click',()=>select(Number(b.dataset.character))));
host.querySelector('.pg-reset').addEventListener('click',reset);
host.querySelectorAll('[data-project]').forEach(b=>b.addEventListener('click',()=>{
  const enabled=b.dataset.project==='symbios';host.querySelectorAll('[data-project]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
  stage.hidden=!enabled;host.querySelector('.pg-unavailable').hidden=enabled;host.querySelector('.pg-characters').hidden=!enabled;host.querySelector('.pg-caption').hidden=!enabled;if(enabled)render();
}));
new ResizeObserver(()=>{const {width,height}=stage.getBoundingClientRect();if(!width||!height)return;renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();render();}).observe(stage);
select(0);reset();
}catch(error){stage.textContent='Не удалось запустить 3D. Проверь, включено ли аппаратное ускорение в браузере.';console.error('Playground:',error);}
