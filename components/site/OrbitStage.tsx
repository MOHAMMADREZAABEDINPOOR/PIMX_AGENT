'use client';
import { useEffect, useRef } from 'react';

export function OrbitStage({mode=0}:{mode?:number}) {
  const host=useRef<HTMLDivElement>(null),activeMode=useRef(mode);
  useEffect(()=>{activeMode.current=mode;},[mode]);
  useEffect(()=>{
    const element=host.current;if(!element)return;
    let disposed=false,cleanup=()=>{};
    void import('three').then(THREE=>{
      if(disposed)return;
      let renderer:InstanceType<typeof THREE.WebGLRenderer>;
      try { renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'}); } catch { element.dataset.fallback='true';return; }
      renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.3;
      element.append(renderer.domElement);
      const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(38,1,.1,100);camera.position.set(0,0,8);
      scene.add(new THREE.AmbientLight(0xc9c1ff,2));const key=new THREE.PointLight(0xded6ff,50);key.position.set(3,3,4);scene.add(key);const fill=new THREE.PointLight(0x7e39ff,30);fill.position.set(-3,-2,3);scene.add(fill);
      const group=new THREE.Group();scene.add(group);
      const glass=new THREE.MeshPhysicalMaterial({color:0xcfc0ff,metalness:.3,roughness:.11,transparent:true,opacity:.55,clearcoat:1,clearcoatRoughness:.1});
      const core=new THREE.Mesh(new THREE.IcosahedronGeometry(1.05,3),glass);group.add(core);
      const pearl=new THREE.MeshStandardMaterial({color:0xcac2ff,metalness:.8,roughness:.14,emissive:0x220d41,emissiveIntensity:.45});
      const rings:InstanceType<typeof THREE.Mesh>[]=[];
      for(let i=0;i<3;i++){const ring=new THREE.Mesh(new THREE.TorusGeometry(1.5+i*.18,.027+i*.009,10,110),pearl);ring.rotation.set(.45+i*.9,.65+i*.4,i*.5);group.add(ring);rings.push(ring);}
      const cubes:InstanceType<typeof THREE.Mesh>[]=[];
      for(let i=0;i<9;i++){const cube=new THREE.Mesh(new THREE.BoxGeometry(.16,.16,.16),i%2?pearl:glass);group.add(cube);cubes.push(cube);}
      const particles=new THREE.BufferGeometry(),points=new Float32Array(210);for(let i=0;i<points.length;i++)points[i]=Math.sin(i*73.12)*6;particles.setAttribute('position',new THREE.BufferAttribute(points,3));const stars=new THREE.Points(particles,new THREE.PointsMaterial({color:0xc2aaff,size:.025,transparent:true,opacity:.5}));scene.add(stars);
      let visible=true,frame=0,start=performance.now(),pointerX=0,pointerY=0;
      const motion=matchMedia('(prefers-reduced-motion: reduce)');
      const resize=()=>{const {width,height}=element.getBoundingClientRect();if(!width||!height)return;renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();};
      const observer=new ResizeObserver(resize);observer.observe(element);resize();
      const intersection=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;});intersection.observe(element);
      const pointer=(event:PointerEvent)=>{const box=element.getBoundingClientRect();pointerX=(event.clientX-box.left)/box.width-.5;pointerY=(event.clientY-box.top)/box.height-.5;};element.addEventListener('pointermove',pointer);
      const render=()=>{if(disposed)return;frame=requestAnimationFrame(render);if(!visible||document.hidden)return;const time=motion.matches?0:(performance.now()-start)/1000;
        group.rotation.y+=(pointerX*.35+time*.12-group.rotation.y)*.025;group.rotation.x+=(-pointerY*.2+.2-group.rotation.x)*.025;
        core.rotation.z=time*.05;core.scale.setScalar(1+Math.sin(time*.8)*.03+activeMode.current*.025);
        rings.forEach((ring,i)=>{ring.rotation.z=time*(.11+i*.035)+i*.7;});
        cubes.forEach((cube,i)=>{const angle=time*(.11+i*.013)+i*Math.PI*2/9;cube.position.set(Math.cos(angle)*(2.1+i%3*.15),Math.sin(angle)*1.8,Math.sin(angle*1.6+i)*.9);cube.rotation.set(time*.2+i,time*.3+i,0);});stars.rotation.z=time*.007;renderer.render(scene,camera);
      };render();element.dataset.ready='true';
      cleanup=()=>{cancelAnimationFrame(frame);observer.disconnect();intersection.disconnect();element.removeEventListener('pointermove',pointer);scene.traverse(object=>{if(object instanceof THREE.Mesh||object instanceof THREE.Points){object.geometry.dispose();const materials=Array.isArray(object.material)?object.material:[object.material];materials.forEach(material=>material.dispose());}});renderer.dispose();renderer.domElement.remove();};
    }).catch(()=>{element.dataset.fallback='true';});
    return()=>{disposed=true;cleanup();};
  },[]);
  return <div ref={host} className="orbit-webgl" aria-hidden="true"/>;
}
