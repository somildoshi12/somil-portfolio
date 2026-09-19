import * as THREE from './vendor/three.module.js';

/** Hand-built, stylized likeness from Somil's references; no photo textures. */
export function createSomilAvatar() {
  const avatar = new THREE.Group();
  avatar.name = 'Somil_Doshi_Stylized_Avatar';
  const material = (color, roughness = .65, metalness = 0) => new THREE.MeshStandardMaterial({color, roughness, metalness});
  const skin = material('#b67b53', .78), skinShade = material('#9c6548');
  const hair = material('#181819', .83), hairLight = material('#232224', .85);
  const navy = material('#192d50', .62), lapel = material('#233e67', .55);
  const white = material('#e9edf2'), blue = material('#426dad', .45);
  const sole = material('#332a27'), leather = material('#925a36', .42);
  const frames = material('#626366', .3, .8), black = material('#181b20');
  const mesh = (parent, name, geometry, mat, position = [0,0,0], scale = [1,1,1]) => {
    const m = new THREE.Mesh(geometry, mat); m.name = name;
    m.position.set(...position); m.scale.set(...scale); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
  };
  const ellipsoid = (parent, name, mat, p, s) => mesh(parent,name,new THREE.SphereGeometry(1,32,24),mat,p,s);
  const tube = (parent,name,points,radius,mat,closed=false) => mesh(parent,name,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)),closed),40,radius,8,closed),mat);
  const shape = (parent,name,points,depth,mat,z=0) => {
    const s = new THREE.Shape();points.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();
    return mesh(parent,name,new THREE.ExtrudeGeometry(s,{depth,bevelEnabled:true,bevelSize:.018,bevelThickness:.018,bevelSegments:2,steps:1}),mat,[0,0,z]);
  };
  // Tailored jacket: an elliptical lathed silhouette with a narrower waist.
  const profile = [[0,1.7],[.43,1.7],[.49,1.83],[.47,2.1],[.46,2.45],[.59,2.83],[.5,3.02],[.25,3.13],[0,3.13]];
  mesh(avatar,'Navy tailored jacket',new THREE.LatheGeometry(profile.map(p=>new THREE.Vector2(...p)),48),navy,[0,0,0],[1,1,.57]);
  shape(avatar,'White shirt',[[0,2.1],[-.27,3.06],[.27,3.06]],.035,white,.29);
  shape(avatar,'Left lapel',[[-.26,3.09],[-.49,2.85],[-.29,2.74],[-.4,2.63],[0,2.09]],.045,lapel,.31);
  shape(avatar,'Right lapel',[[.26,3.09],[.49,2.85],[.29,2.74],[.4,2.63],[0,2.09]],.045,lapel,.31);
  shape(avatar,'Tie blade',[[0,2.26],[-.09,2.39],[-.045,2.85],[.045,2.85],[.09,2.39]],.026,blue,.355);
  shape(avatar,'Tie knot',[[-.065,2.98],[.065,2.98],[.047,2.87],[-.047,2.87]],.04,blue,.365);
  shape(avatar,'Left collar',[[-.22,3.12],[0,3.01],[-.11,2.86],[-.3,3.06]],.028,white,.37);
  shape(avatar,'Right collar',[[.22,3.12],[0,3.01],[.11,2.86],[.3,3.06]],.028,white,.37);
  for (const y of [2.12,1.93]) ellipsoid(avatar,'Jacket button',black,[.015,y,.298],[.037,.037,.015]);
  tube(avatar,'Breast pocket',[[.29,2.66,.34],[.44,2.68,.31]],.013,lapel);
  shape(avatar,'Pocket square',[[.3,2.68],[.31,2.75],[.35,2.7],[.39,2.76],[.42,2.69]],.012,white,.326);
  mesh(avatar,'Neck',new THREE.CylinderGeometry(.19,.22,.38,32),skin,[0,3.17,0]);

  // Articulated arms, cuffs, hands, and a small wristwatch.
  const arms = [];
  for (const side of [-1,1]) {
    const arm = new THREE.Group(); arm.name=side===-1?'Right shoulder':'Left shoulder';arm.position.set(side*.51,2.87,0);avatar.add(arm);
    ellipsoid(arm,'Jacket shoulder',navy,[0,-.12,0],[.22,.28,.23]);
    mesh(arm,'Upper sleeve',new THREE.CapsuleGeometry(.17,.48,6,20),navy,[side*.025,-.39,0],[1,1,1]);
    const elbow = new THREE.Group(); elbow.name='Elbow';elbow.position.set(side*.025,-.72,0);arm.add(elbow);
    mesh(elbow,'Forearm sleeve',new THREE.CapsuleGeometry(.145,.40,6,20),navy,[0,-.24,0]);
    mesh(elbow,'Shirt cuff',new THREE.CylinderGeometry(.126,.12,.09,24),white,[0,-.52,0]);
    ellipsoid(elbow,'Hand',skin,[0,-.67,.02],[.115,.17,.08]);
    for(let f=0;f<4;f++) ellipsoid(elbow,'Finger',skin,[-.075+f*.05,-.79,.035],[.026,.08,.035]);
    ellipsoid(elbow,'Thumb',skin,[side*-.105,-.64,.055],[.045,.085,.044]);
    if(side===1){mesh(elbow,'Watch strap',new THREE.CylinderGeometry(.13,.13,.062,24),leather,[0,-.54,0]);ellipsoid(elbow,'Watch face',frames,[0,-.54,.135],[.078,.049,.015]);}
    arm.rotation.z=side*.12;elbow.rotation.x=-.12;arms.push({arm,elbow});
  }
  // Straight tailored trousers with seams and warm leather shoes.
  const legs=[];
  for (const side of [-1,1]) {
    const leg = new THREE.Group();leg.name=side===-1?'Right leg':'Left leg';leg.position.set(side*.235,1.8,0);avatar.add(leg);
    mesh(leg,'Trouser leg',new THREE.CylinderGeometry(.225,.16,1.44,32),navy,[0,-.73,0],[1,1,.9]);
    tube(leg,'Pressed seam',[[0,-.1,.19],[0,-.7,.166],[0,-1.38,.135]],.008,lapel);
    ellipsoid(leg,'Leather shoe',leather,[0,-1.56,.12],[.19,.14,.34]);
    ellipsoid(leg,'Shoe sole',sole,[0,-1.645,.12],[.195,.045,.345]);
    for(let i=0;i<3;i++) tube(leg,'Shoe lace',[[-.08,-1.45,.07+i*.05],[.08,-1.45,.07+i*.05]],.007,sole);
    legs.push(leg);
  }

  // Sculpted head profile: cheekbones, tapered jaw, ears, nose, and smile.
  const head = new THREE.Group(); head.name='Head'; head.position.set(0,3.66,0);avatar.add(head);
  const headProfile=[[0,-.49],[.21,-.48],[.32,-.39],[.42,-.18],[.46,.08],[.44,.33],[.32,.5],[0,.56]];
  mesh(head,'Face',new THREE.LatheGeometry(headProfile.map(p=>new THREE.Vector2(...p)),64),skin,[0,0,0],[1,1,.83]);
  for(const side of [-1,1]) {
    ellipsoid(head,'Ear',skin,[side*.447,-.01,0],[.095,.16,.073]);
    ellipsoid(head,'Inner ear',skinShade,[side*.486,-.015,.047],[.04,.092,.023]);
    ellipsoid(head,'Eye white',white,[side*.19,.09,.344],[.096,.046,.029]);
    ellipsoid(head,'Iris',material('#403a2b'),[side*.19,.09,.372],[.032,.036,.012]);
    ellipsoid(head,'Pupil',black,[side*.19,.09,.383],[.016,.023,.007]);
    ellipsoid(head,'Eye glint',white,[side*.19-.009,.105,.39],[.007,.009,.004]);
    tube(head,'Eyebrow',[[side*.09,.21,.352],[side*.19,.236,.354],[side*.3,.207,.305]],.025,hair);
  }
  ellipsoid(head,'Nose bridge',skin,[0,.015,.372],[.069,.145,.075]);
  ellipsoid(head,'Nose tip',skin,[0,-.069,.43],[.08,.061,.073]);
  for(const side of [-1,1])ellipsoid(head,'Nostril',skinShade,[side*.049,-.102,.463],[.019,.011,.009]);
  tube(head,'Smile',[[-.139,-.228,.302],[-.065,-.249,.344],[.065,-.249,.344],[.139,-.228,.302]],.012,material('#654537'));
  tube(head,'Lower lip',[[-.085,-.263,.322],[0,-.273,.339],[.085,-.263,.322]],.014,material('#bb8064'));
  // Subtle moustache and chin stubble retain the clean, illustrative treatment.
  tube(head,'Moustache left',[[-.13,-.184,.313],[-.06,-.17,.353],[-.015,-.177,.36]],.012,hairLight);
  tube(head,'Moustache right',[[.015,-.177,.36],[.06,-.17,.353],[.13,-.184,.313]],.012,hairLight);
  for(let i=0;i<18;i++){
    const x=(i%6-2.5)*.042,y=-.33-Math.floor(i/6)*.026;
    ellipsoid(head,'Chin stubble',hairLight,[x,y,.275-Math.floor(i/6)*.025],[.006,.008,.004]);
  }
  // Close-fitting dark hair cap with a swept, asymmetric front quiff.
  const vertices=[],indices=[],rings=14,segments=64;
  for(let j=0;j<=rings;j++)for(let i=0;i<=segments;i++){
    const phi=i/segments*Math.PI*2,front=Math.max(0,Math.sin(phi));
    const end=1.68-front*.48,theta=.012+j/rings*end;
    vertices.push(.459*Math.sin(theta)*Math.cos(phi),.13+.49*Math.cos(theta),.388*Math.sin(theta)*Math.sin(phi)-.025);
  }
  for(let j=0;j<rings;j++)for(let i=0;i<segments;i++){const a=j*(segments+1)+i,b=a+segments+1;indices.push(a,a+1,b,b,a+1,b+1);}
  const cap=new THREE.BufferGeometry();cap.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));cap.setIndex(indices);cap.computeVertexNormals();mesh(head,'Sculpted hairstyle',cap,hair);
  const quiff=ellipsoid(head,'Side swept quiff',hair,[-.1,.48,.215],[.37,.18,.225]);quiff.rotation.z=.18;
  for(let i=0;i<7;i++) tube(head,'Swept hair strand',[[-.35+i*.07,.43,.3],[-.21+i*.055,.58,.28],[.03+i*.04,.56,.15]],.014,hairLight);
  // Rounded-square graphite glasses with bridge and temples, no opaque lenses.
  const lensLoop=(cx)=>[[-.13,.09],[-.14,.035],[-.13,-.075],[-.08,-.108],[.09,-.105],[.14,-.07],[.14,.067],[.08,.108],[-.075,.108]].map(([x,y])=>[cx+x,.08+y,.403]);
  for(const side of [-1,1]){
    tube(head,'Glasses frame',lensLoop(side*.19),.014,frames,true);
    tube(head,'Glasses temple',[[side*.33,.11,.403],[side*.444,.105,.22],[side*.45,.02,-.015]],.012,frames);
  }
  tube(head,'Glasses bridge',[[-.047,.115,.411],[0,.13,.432],[.047,.115,.411]],.012,frames);
  return {avatar,head,arms,legs};
}
