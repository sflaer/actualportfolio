import * as THREE from './vendor/three/build/three.module.js';

export const characters = [
  {id:'dima',name:'Дима',skin:0xe9a174,hair:0x35231c,shirt:0x18646b,pants:0x292c34,shoes:0x70472c},
  {id:'katya',name:'Катя',skin:0xf0ad7d,hair:0x914322,shirt:0xc15e4d,pants:0xd5c19e,shoes:0xbb6752,female:true},
  {id:'grisha',name:'Гриша',skin:0xf1b18a,hair:0xb95a25,shirt:0xb98a35,pants:0x283749,shoes:0x69442d,glasses:true},
  {id:'yulia',name:'Юля',skin:0xb67b59,hair:0x30201e,shirt:0x9382b8,pants:0x463345,shoes:0xddd6c9,female:true,curls:true},
  {id:'burglar-tall',name:'Высокий воришка',skin:0xd8a17c,hair:0x34261f,shirt:0x30343b,pants:0x272c32,shoes:0x25262b,hat:true,tall:true},
  {id:'burglar-short',name:'Усатый воришка',skin:0xdca37e,hair:0x4c3022,shirt:0x373940,pants:0x2c3037,shoes:0x28262a,hat:true,short:true}
];

export function buildCharacter(c){
  const root=new THREE.Group(); root.name=c.name;
  let seed=characters.indexOf(c)*191+42;
  const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const materials={};
  function mat(color){return materials[color] ||= new THREE.MeshStandardMaterial({color,roughness:.88});}
  const skin=mat(c.skin),hair=mat(c.hair),cloth=mat(c.shirt),pants=mat(c.pants),shoe=mat(c.shoes);
  function ell(parent,name,m,x,y,z,sx,sy,sz){
    const geo=new THREE.SphereGeometry(1,28,20);
    const pos=geo.attributes.position;
    for(let i=0;i<pos.count;i++){
      const px=pos.getX(i),py=pos.getY(i),pz=pos.getZ(i);
      const n=1+.006*Math.sin(px*41+py*27+pz*19)*Math.sin(py*33-pz*24);
      pos.setXYZ(i,px*n,py*n,pz*n);
    }
    geo.computeVertexNormals();
    const mesh=new THREE.Mesh(geo,m);mesh.name=name;mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
  }
  function line(parent,name,m,points,r){
    const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
    const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,24,r,7,false),m);mesh.name=name;mesh.castShadow=true;parent.add(mesh);return mesh;
  }
  const wide=c.short?1.25: c.tall?.85:1;
  const leg=c.short?.76:c.tall?1.18:1;
  const bodyY=.22+leg+.47;
  for(const side of [-1,1]){
    ell(root,'Обувь',shoe,side*.18*wide,.13,.09,.16,.13,.31);
    ell(root,'Подошва',mat(c.hat?0x202126:0x967654),side*.18*wide,.055,.09,.165,.045,.31);
    ell(root,'Брюки',pants,side*.18*wide,.23+leg*.47,0,.145*wide,leg*.55,.17);
    if(!c.female&&!c.hat)for(let j=0;j<3;j++)line(root,'Шнурки',mat(0xb39466),[[side*.18*wide-.08,.22-j*.018,.15+j*.04],[side*.18*wide+.08,.22-j*.018,.15+j*.04]],.009);
  }
  ell(root,'Свитер',cloth,0,bodyY,0,.37*wide,.53,.225);
  ell(root,'Низ свитера',cloth,0,bodyY-.43,0,.365*wide,.085,.23);
  ell(root,'Шея',skin,0,bodyY+.55,0,.115,.19,.12);
  for(const side of [-1,1]){
    const arm=ell(root,'Рукав',cloth,side*.39*wide,bodyY-.02,0,.135,.49,.14);arm.rotation.z=side*.16;
    ell(root,'Манжета',cloth,side*.46*wide,bodyY-.43,.015,.118,.085,.13);
    ell(root,'Ладонь',skin,side*.47*wide,bodyY-.61,.025,.105,.16,.075);
    for(let f=0;f<4;f++)ell(root,'Пальцы',skin,side*.47*wide+(f-1.5)*.038,bodyY-.735,.04,.023,.09,.033);
    const thumb=ell(root,'Большой палец',skin,side*.39*wide,bodyY-.62,.08,.042,.09,.04);thumb.rotation.z=side*-.4;
  }
  // Raised ribs make the knitted clothing readable from every angle.
  if(!c.hat)for(let i=0;i<30;i++){
    const a=i/30*Math.PI*2,x=Math.sin(a)*.35*wide,z=Math.cos(a)*.224;
    line(root,'Вязка',cloth,[[x*.9,bodyY-.38,z],[x,bodyY,z],[x*.87,bodyY+.35,z*.9]],.008);
  }
  const head=new THREE.Group();head.position.y=bodyY+.99;root.add(head);
  ell(head,'Голова',skin,0,0,0,.32*wide,.43,.29);
  ell(head,'Подбородок',skin,0,-.22,.07,.24*wide,.22,.23);
  for(const s of [-1,1]){
    ell(head,'Ухо',skin,s*.325*wide,-.025,0,.085,.13,.063);
    ell(head,'Ушная раковина',mat(0xc98261),s*.35*wide,-.02,.046,.037,.07,.018);
    ell(head,'Щека',skin,s*.19,-.1,.235,.115,.105,.07);
    ell(head,'Белок глаза',mat(0xfff3dc),s*.133,.085,.257,.105,.12,.064);
    ell(head,'Радужка',mat(0x613e29),s*.133,.075,.313,.052,.065,.021);
    ell(head,'Зрачок',mat(0x17110f),s*.133,.075,.331,.03,.043,.012);
    ell(head,'Блик',mat(0xffffff),s*.133-.012,.098,.341,.012,.014,.006);
    line(head,'Бровь',hair,[[s*.065,.258,.255],[s*.14,.28,.266],[s*.23,.245,.22]],c.female?.016:.029);
    if(c.glasses){
      const ring=new THREE.Mesh(new THREE.TorusGeometry(.127,.013,8,48),mat(0x553e2f));ring.position.set(s*.143,.08,.339);head.add(ring);
      line(head,'Дужка очков',mat(0x553e2f),[[s*.27,.1,.33],[s*.34,.1,0]],.012);
    }
  }
  if(c.glasses)line(head,'Мост очков',mat(0x553e2f),[[-.02,.1,.34],[0,.12,.36],[.02,.1,.34]],.012);
  ell(head,'Нос',skin,0,-.035,c.tall?.36:.3,c.short?.105:.075,.082,c.tall?.16:.09);
  line(head,'Улыбка',mat(0x925237),[[-.155,-.19,.265],[-.08,-.224,.292],[0,-.232,.304],[.08,-.224,.292],[.155,-.19,.265]],.009);
  if(c.short)for(const s of [-1,1]){const moustache=ell(head,'Усы',hair,s*.085,-.135,.31,.11,.045,.045);moustache.rotation.z=s*-.15;}
  if(c.glasses||c.id==='katya')for(let i=0;i<22;i++){const s=i%2?1:-1;ell(head,'Веснушки',mat(0xb8754b),s*(.12+rand()*.13),-.035-rand()*.1,.291,.004,.004,.003);}
  if(c.hat){
    ell(head,'Вязаная шапка',mat(0x263b58),0,.32,-.02,.35*wide,.24,.305);
    ell(head,'Отворот шапки',mat(0x304765),0,.21,0,.36*wide,.075,.31);
    for(let i=0;i<36;i++){const a=i/36*Math.PI*2;line(head,'Резинка шапки',mat(0x304765),[[Math.sin(a)*.354*wide,.16,Math.cos(a)*.307],[Math.sin(a)*.354*wide,.26,Math.cos(a)*.307]],.008);}
  }else{
    // Individual clay locks, rather than a single smooth hair cap.
    const long=c.female;
    if(long)ell(head,'Объём волос сзади',hair,0,.02,-.12,.39,.43,.27);
    for(let i=0;i<(c.curls?100:65);i++){
      const a=rand()*Math.PI*2, t=rand();
      const y=long?-.23+t*.68:.15+t*.32;
      const radius=long?.34:Math.sqrt(Math.max(0,1-((y-.04)/.49)**2))*.34;
      const x=Math.sin(a)*radius,z=Math.cos(a)*radius-.03;
      if(z>.12&&y<.26)continue;
      const lock=ell(head,'Прядь волос',hair,x,y,z,c.curls?.058:.038,c.curls?.065:(long?.19:.12),.047);
      lock.rotation.set(.3*Math.sin(a),a,long?-.35:.85);
    }
    for(let i=0;i<9;i++)line(head,'Чёлка',hair,[[-.28+i*.054,.28,.20],[-.18+i*.05,.43,.22],[.04+i*.025,.46,.06]],long?.035:.026);
  }
  root.userData={project:'Symbios',character:c.id,source:'Procedural clay study based on supplied character sheets'};
  return root;
}
