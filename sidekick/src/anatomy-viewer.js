import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { prepareSoftwareGeometry } from './anatomy-geometry.js';
import { SVGRenderer } from 'three/addons/renderers/SVGRenderer.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { anatomyCatalog, anatomyModel } from '../web/anatomy.js';
export function createSkeletonViewer(container, { onSelect = () => {}, onStatus = () => {}, catalog: sourceCatalog = anatomyCatalog, model = {...anatomyModel,url:'/skeleton.glb',label:'skeleton',sizeLabel:'5.2 MB',defaultId:'right-femur'} } = {}) {
  let renderer, software = false;
  try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'low-power' }); } catch { renderer = new SVGRenderer(); renderer.setPrecision(2); software = true; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1,1.5));
  renderer.setClearColor('#edf3fa',1); renderer.outputColorSpace = THREE.SRGBColorSpace;
  const canvas = renderer.domElement; canvas.dataset.renderer = software ? 'software' : 'webgl'; canvas.tabIndex = 0; canvas.setAttribute('aria-label',`Interactive ${model.label}. Drag to rotate, pinch or use plus and minus to zoom. Arrow keys rotate. Select a structure from the accessible list.`); canvas.setAttribute('role','img');
  container.append(canvas);
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(36,1,0.001,100);
  camera.position.set(0,0,8);
  const controls = new OrbitControls(camera,canvas); controls.enableDamping = false; controls.minDistance = 0.035; controls.maxDistance = 40;
  scene.add(new THREE.HemisphereLight(0xffffff,0x6b7d91,2));
  const light = new THREE.DirectionalLight(0xffffff,2.5); light.position.set(4,5,8); scene.add(light); if (software) { light.intensity = 0.7; scene.add(new THREE.AmbientLight(0xffffff,0.5)); }
  const fill = new THREE.DirectionalLight(0xffffff,1.3); fill.position.set(-4,0,-6); scene.add(fill); if (software) fill.intensity = 0.45;
  const meshes = new Map(), catalog = new Map(sourceCatalog.map(s=>[s.id,s]));
  let selected = null, region = '', allowed = null, isolated = false, disposed = false;
  const abort = new AbortController();
  let pendingFrame = null;
  const render = () => { if (disposed || pendingFrame !== null) return; pendingFrame = requestAnimationFrame(() => { pendingFrame = null; if (!disposed) renderer.render(scene,camera); }); };
  controls.addEventListener('change',render);
  function resize() {
    const width = container.clientWidth, height = container.clientHeight;
    if (!width || !height || disposed) return;
    renderer.setSize(width,height,false); camera.aspect = width/height; camera.updateProjectionMatrix(); render();
  }
  const observer = new ResizeObserver(resize); observer.observe(container); resize();
  function frame(objects = [...meshes.values()].filter(mesh=>mesh.visible), direction = new THREE.Vector3(0,0,1)) {
    if (!objects.length) return;
    const bounds = new THREE.Box3(); objects.forEach(mesh=>bounds.expandByObject(mesh)); if (bounds.isEmpty()) return;
    const center = bounds.getCenter(new THREE.Vector3()), size = bounds.getSize(new THREE.Vector3());
    const distance = Math.max(Math.max(size.y,size.x/camera.aspect),0.04)/(2*Math.tan(THREE.MathUtils.degToRad(camera.fov/2)))*1.25+size.z/2;
    controls.target.copy(center); camera.position.copy(center).add(direction.normalize().multiplyScalar(distance)); controls.update(); render();
  }
  function visibility() {
    for (const [id,mesh] of meshes) {
      mesh.visible = (!region || catalog.get(id)?.region === region) && (!allowed || allowed.has(id)) && (!software || id === selected) && (!isolated || id === selected);
      const ghost = !!selected && id !== selected;
      mesh.material.opacity = ghost ? 0.13 : 1; mesh.material.transparent = ghost; mesh.material.depthWrite = !ghost;
      mesh.material.color.copy(id === selected ? new THREE.Color('#1767ad') : mesh.userData.originalColor);
      mesh.renderOrder = id === selected ? 2 : ghost ? 0 : 1;
    }
    render();
  }
  function select(id) { selected = meshes.has(id) ? id : null; if (!selected && software) selected = [...meshes.keys()].find(key=>(!region || catalog.get(key)?.region===region) && (!allowed || allowed.has(key))) || null; if (!selected) isolated = false; visibility(); }
  function setRegion(value) { region = value; if (selected && catalog.get(selected)?.region !== region && region) selected = null; if (software && !selected) { selected = [...meshes.keys()].find(key=>(!region || catalog.get(key)?.region===region) && (!allowed || allowed.has(key))) || null; if(selected)onSelect(selected); } isolated = false; visibility(); frame([...meshes.values()].filter(mesh=>mesh.visible)); }
  function zoom(factor) { const vector = camera.position.clone().sub(controls.target); vector.setLength(THREE.MathUtils.clamp(vector.length()*factor,controls.minDistance,controls.maxDistance)); camera.position.copy(controls.target).add(vector); controls.update(); render(); }
  function rotate(theta,phi=0) { const position = camera.position.clone().sub(controls.target), spherical = new THREE.Spherical().setFromVector3(position); spherical.theta += theta; spherical.phi = THREE.MathUtils.clamp(spherical.phi+phi,0.03,Math.PI-0.03); camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(spherical)); controls.update(); render(); }
  const keydown = event => {
    const actions = { ArrowLeft:()=>rotate(-0.15), ArrowRight:()=>rotate(0.15), ArrowUp:()=>rotate(0,-0.12), ArrowDown:()=>rotate(0,0.12), '+':()=>zoom(0.8), '=':()=>zoom(0.8), '-':()=>zoom(1.25) };
    if (actions[event.key]) { event.preventDefault(); actions[event.key](); }
  };
  canvas.addEventListener('keydown',keydown);
  const raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2(); let down = null;
  const pointerDown = event => { down = {x:event.clientX,y:event.clientY}; };
  const pointerUp = event => {
    if (!down || Math.hypot(event.clientX-down.x,event.clientY-down.y)>6) { down=null; return; } down=null;
    const rect = canvas.getBoundingClientRect(); pointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1); raycaster.setFromCamera(pointer,camera);
    const hit = raycaster.intersectObjects([...meshes.values()].filter(m=>m.visible),false)[0];
    if (hit) { const id = hit.object.userData.structureId || hit.object.name; select(id); onSelect(id); }
  };
  canvas.addEventListener('pointerdown',pointerDown); canvas.addEventListener('pointerup',pointerUp);
  const contextLost = event => { event.preventDefault(); onStatus('3D graphics were interrupted. Reload the viewer to try again. The structure list remains available.','error'); };
  canvas.addEventListener('webglcontextlost',contextLost);
  const timer = setTimeout(()=>abort.abort(),25000);
  const ready = (async()=>{
    onStatus(`Loading the ${model.sizeLabel} source ${model.label}…`);
    const response = await fetch(model.url,{signal:abort.signal,credentials:'same-origin'}); if (!response.ok) throw new Error('The 3D model could not be loaded. Please retry.');
    const buffer = await response.arrayBuffer(); if (buffer.byteLength !== model.bytes) throw new Error('The model file is incomplete or does not match its source.');
    const digest = [...new Uint8Array(await crypto.subtle.digest('SHA-256',buffer))].map(n=>n.toString(16).padStart(2,'0')).join('');
    if (digest !== model.sha256) throw new Error('The model did not match its verified checksum.');
    const gltf = await new GLTFLoader().parseAsync(buffer,'');
    if (disposed) { gltf.scene.traverse(node=>{if(node.isMesh){node.geometry.dispose();node.material.dispose();}}); return; }
    gltf.scene.traverse(node=>{
      if (!node.isMesh) return;
      const id = node.userData.structureId || node.name;
      if (!catalog.has(id)) throw new Error('Model structure labels do not match the catalog.');
      // SVG Projector requires packed attributes; GLTF uses interleaved position/normal data.
      if (software) prepareSoftwareGeometry(node.geometry);
      node.material = node.material.clone(); node.userData.originalColor = node.material.color.clone(); node.userData.structureId = id; meshes.set(id,node);
    });
    if (meshes.size !== model.count) throw new Error('Model structure count does not match the catalog.');
    scene.add(gltf.scene); const modelBounds = new THREE.Box3().setFromObject(gltf.scene); const extent = modelBounds.getSize(new THREE.Vector3()).length(); controls.minDistance = extent / 10000; controls.maxDistance = extent * 20; camera.near = extent / 100000; camera.far = extent * 100; camera.updateProjectionMatrix(); if(software){selected=model.defaultId;onSelect(selected);} resize(); visibility(); frame(); onStatus(software ? '3D viewer ready in software mode: one structure at a time. Select a structure from the list; drag to rotate.' : `3D ${model.label} ready. Select a structure or drag to explore.`);
  })().catch(error=>{if(!disposed) { const message = error.name === 'AbortError' ? 'Loading took too long. Please retry the viewer.' : error.message; onStatus(message,'error'); throw new Error(message); }}).finally(()=>clearTimeout(timer));
  return { ready, select, setRegion, zoom,
    setStructures(ids) { allowed=ids ? new Set(ids.filter(id=>catalog.has(id))) : null; if(selected && allowed && !allowed.has(selected))selected=null; if(software && !selected){selected=[...meshes.keys()].find(id=>(!region || catalog.get(id)?.region===region)&&(!allowed||allowed.has(id)))||null;if(selected)onSelect(selected);}isolated=false;visibility();frame(); },
    focusSelected() { if (selected && meshes.has(selected)) frame([meshes.get(selected)]); },
    isolate(value) { isolated = !!value && !!selected; visibility(); if (isolated) this.focusSelected(); },
    view(name) { const directions = {anterior:[0,0,1],posterior:[0,0,-1],right:[-1,0,0]}; const direction = directions[name] || directions.anterior; frame([...meshes.values()].filter(mesh=>mesh.visible),new THREE.Vector3(...direction)); },
    reset() { region='';allowed=null;selected=software?model.defaultId:null;isolated=false;if(software)onSelect(selected);visibility();frame(); },
    dispose() { disposed=true;if(pendingFrame!==null)cancelAnimationFrame(pendingFrame);abort.abort();clearTimeout(timer);observer.disconnect();controls.removeEventListener('change',render);controls.dispose();canvas.removeEventListener('keydown',keydown);canvas.removeEventListener('pointerdown',pointerDown);canvas.removeEventListener('pointerup',pointerUp);canvas.removeEventListener('webglcontextlost',contextLost);meshes.forEach(mesh=>{mesh.geometry.dispose();mesh.material.dispose();});renderer.dispose?.();renderer.forceContextLoss?.();canvas.remove(); }
  };
}
