import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import type * as Three from 'three';

export interface PenSceneHandle { seek: (progress: number) => void }
interface Props { reducedMotion: boolean; onUnavailable: () => void }
const clamp = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (v: number) => { const t = clamp(v); return t * t * (3 - 2 * t); };
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

export const Pen3DScene = forwardRef<PenSceneHandle, Props>(function Pen3DScene({ reducedMotion, onUnavailable }, ref) {
  const host = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const still = useRef(reducedMotion);
  const renderRef = useRef<(() => void) | null>(null);
  const onFail = useRef(onUnavailable);
  const [ready, setReady] = useState(false);
  onFail.current = onUnavailable;
  still.current = reducedMotion;

  useImperativeHandle(ref, () => ({
    seek: (p) => { progress.current = clamp(p); renderRef.current?.(); },
  }), []);

  useEffect(() => { renderRef.current?.(); }, [reducedMotion]);

  useEffect(() => {
    const container = host.current;
    if (!container || reducedMotion) return;
    let disposed = false, visible = true, lost = false;
    let cleanup: (() => void) | undefined;
    let resizeObserver: ResizeObserver | undefined;
    let intersectionObserver: IntersectionObserver | undefined;
    let frame = 0;

    void Promise.all([import('three'), import('three/addons/environments/RoomEnvironment.js')]).then(([T, { RoomEnvironment }]) => {
      if (disposed) return;
      const geometries = new Set<Three.BufferGeometry>();
      const materials = new Set<Three.Material>();
      const textures = new Set<Three.Texture>();
      let environmentTarget: Three.WebGLRenderTarget | undefined;
      const renderer = new T.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
      renderer.outputColorSpace = T.SRGBColorSpace;
      renderer.toneMapping = T.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = T.PCFShadowMap;
      renderer.domElement.setAttribute('aria-hidden', 'true');
      container.appendChild(renderer.domElement);
      // Register disposal before creating the scene, so initialization failures also clean up.
      cleanup = () => {
        geometries.forEach(g=>g.dispose()); materials.forEach(m=>m.dispose()); textures.forEach(t=>t.dispose());
        environmentTarget?.dispose(); renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove();
      };
      const world = new T.Scene();
      const camera = new T.OrthographicCamera(-1, 1, 1, -1, 1, 5000);
      camera.position.z = 2000;
      const room = new RoomEnvironment();
      const generator = new T.PMREMGenerator(renderer);
      environmentTarget = generator.fromScene(room, .04);
      world.environment = environmentTarget.texture;
      room.dispose();
      generator.dispose();
      world.environmentIntensity = .7;

      const geom = <G extends Three.BufferGeometry>(g: G) => { geometries.add(g); return g; };
      const mat = <M extends Three.Material>(m: M) => { materials.add(m); return m; };
      const green = mat(new T.MeshPhysicalMaterial({ color: 0x183f35, metalness: .32, roughness: .29, clearcoat: .65, clearcoatRoughness: .2 }));
      const gripMaterial = mat(new T.MeshStandardMaterial({ color: 0x15382f, metalness: .35, roughness: .4 }));
      const silver = mat(new T.MeshStandardMaterial({ color: 0xcfd3ce, metalness: 1, roughness: .24 }));
      const dark = mat(new T.MeshStandardMaterial({ color: 0x0b211b, roughness: .45, metalness: .65 }));
      const pen = new T.Group();
      const add = (geometry: Three.BufferGeometry, material: Three.Material, y = 0, z = 0) => {
        const mesh = new T.Mesh(geom(geometry), material);
        mesh.position.set(0, y, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        pen.add(mesh);
        return mesh;
      };
      // The bottom of this small ball is the shared writing anchor at local (0, 0, 0).
      add(new T.SphereGeometry(.018, 20, 12), silver, .018);
      add(new T.CylinderGeometry(.045, .016, .17, 40), silver, .115);
      add(new T.CylinderGeometry(.12, .045, .42, 64), silver, .41);
      add(new T.CylinderGeometry(.133, .12, .67, 64), gripMaterial, .955);
      for (let n = 0; n < 8; n++) {
        const detail = add(new T.TorusGeometry(.131, .0025, 5, 64), dark, .72 + n * .064);
        detail.rotation.x = Math.PI / 2;
      }
      add(new T.CylinderGeometry(.145, .134, .075, 64), silver, 1.327);
      const profile = [[.143,1.365],[.15,1.42],[.153,1.55],[.157,2.7],[.155,3.15],[.15,3.3],[.14,3.36]];
      add(new T.LatheGeometry(profile.map(([x,y]) => new T.Vector2(x,y)), 96), green);
      add(new T.CylinderGeometry(.144,.146,.07,64), silver, 3.365);
      add(new T.CylinderGeometry(.133,.143,.16,64), green, 3.48);
      add(new T.SphereGeometry(.132,40,24), green, 3.54).scale.set(1,.4,1);
      add(new T.CylinderGeometry(.10,.10,.085,48), silver, 3.635);
      const clipCurve = new T.CatmullRomCurve3([new T.Vector3(0,3.35,.145),new T.Vector3(0,3.37,.23),new T.Vector3(0,3.25,.24),new T.Vector3(0,2.65,.21),new T.Vector3(0,2.48,.17)]);
      add(new T.TubeGeometry(clipCurve,36,.024,8,false),silver);
      // A small real monogram label rendered on the barrel.
      const labelCanvas = document.createElement('canvas');
      labelCanvas.width = 256; labelCanvas.height = 96;
      const context = labelCanvas.getContext('2d');
      if (context) {
        context.font = '32px Georgia'; context.fillStyle = '#ede9dc'; context.textAlign = 'center';
        context.fillText('A A',128,56);
        const texture = new T.CanvasTexture(labelCanvas);
        texture.colorSpace = T.SRGBColorSpace; textures.add(texture);
        const label = mat(new T.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false }));
        add(new T.PlaneGeometry(.24,.09),label,2.65,.158);
      }
      world.add(pen);
      const ambient = new T.HemisphereLight(0xf5f2e9,0x415b4c,1.3);
      world.add(ambient);
      const key = new T.DirectionalLight(0xfffbf1,2.3);
      key.position.set(-500,700,900); key.castShadow = true;
      key.shadow.mapSize.set(1024,1024);
      Object.assign(key.shadow.camera,{left:-1200,right:1200,top:1200,bottom:-1200,near:1,far:5000});
      key.shadow.camera.updateProjectionMatrix();
      key.shadow.normalBias = .8;
      key.shadow.bias = -.00008;
      world.add(key);
      const edge = new T.DirectionalLight(0xdce5d9,1.1); edge.position.set(600,200,500); world.add(edge);
      const surface = new T.Mesh(geom(new T.PlaneGeometry(5000,5000)),mat(new T.ShadowMaterial({opacity:.065})));
      surface.position.z = -5; surface.receiveShadow = true; world.add(surface);
      const ring = new T.Mesh(geom(new T.TorusGeometry(1.08,.006,6,100)),mat(new T.MeshBasicMaterial({color:0x879c88,transparent:true,opacity:.25})));
      ring.rotation.x = 1.13; world.add(ring);

      let width = 1, height = 1, hasRendered = false, cleared = false;
      const toWorld = (x: number,y: number,z=0) => new T.Vector3(x-width/2,height/2-y,z);
      const draw = () => {
        if (disposed || lost || document.hidden || !visible) return;
        const p = progress.current;
        container.style.opacity = String(1-smooth((p-.24)/.1));
        if (p >= .34 || still.current) {
          if (!cleared) { renderer.clear(); cleared = true; }
          return;
        }
        cleared = false;
        const mobile = width < 760;
        const intro = {x:width*(mobile ? .62 : .72),y:height*(mobile ? .88 : .72),size:mobile ? Math.min(width*.105,height*.05) : Math.min(height*.145,width*.083),rx:.32,ry:.65,rz:-.49};
        const macro = {x:width*(mobile ? .36 : .55),y:height*.72,size:Math.min(height*.15,width*(mobile ? .17 : .105)),rx:.65,ry:1.15,rz:-.78};
        const t = smooth((p-.12)/.16);
        const pose = {x:mix(intro.x,macro.x,t),y:mix(intro.y,macro.y,t),size:mix(intro.size,macro.size,t),rx:mix(intro.rx,macro.rx,t),ry:mix(intro.ry,macro.ry,t),rz:mix(intro.rz,macro.rz,t)};
        pen.position.copy(toWorld(pose.x,pose.y));
        pen.rotation.set(pose.rx,pose.ry,pose.rz);
        pen.scale.setScalar(pose.size);
        pen.visible = true;
        surface.visible = true;
        ring.visible = p < .28;
        ring.scale.setScalar(intro.size);
        ring.position.copy(toWorld(intro.x+intro.size*.72,intro.y-intro.size*.7,-3));
        (ring.material as Three.MeshBasicMaterial).opacity = .18*(1-smooth((p-.10)/.16));
        const projected = pen.position.clone().project(camera);
        container.dataset.tipX = ((projected.x+1)*width/2).toFixed(3);
        container.dataset.tipY = ((1-projected.y)*height/2).toFixed(3);
        container.dataset.progress = p.toFixed(5);
        try { renderer.render(world,camera); } catch { lost = true; setReady(false); onFail.current(); return; }
        if (!hasRendered) { hasRendered = true; setReady(true); }
      };
      const resize = () => {
        const rect = container.getBoundingClientRect();
        width = Math.max(1,rect.width); height = Math.max(1,rect.height);
        camera.left = -width/2; camera.right = width/2; camera.top = height/2; camera.bottom = -height/2; camera.updateProjectionMatrix();
        renderer.setSize(width,height,false);
        draw();
      };
      const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(resize); };
      const onLost = (event: Event) => { event.preventDefault(); lost = true; setReady(false); onFail.current(); };
      const onRestored = () => { lost = false; resize(); };
      resizeObserver = new ResizeObserver(schedule);
      resizeObserver.observe(container);
      intersectionObserver = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) draw(); });
      intersectionObserver.observe(container);
      document.addEventListener('visibilitychange',draw);
      renderer.domElement.addEventListener('webglcontextlost',onLost);
      renderer.domElement.addEventListener('webglcontextrestored',onRestored);
      renderRef.current = draw;
      cleanup = () => {
        renderRef.current = null;
        cancelAnimationFrame(frame);
        resizeObserver?.disconnect(); intersectionObserver?.disconnect();
        document.removeEventListener('visibilitychange',draw);
        renderer.domElement.removeEventListener('webglcontextlost',onLost);
        renderer.domElement.removeEventListener('webglcontextrestored',onRestored);
        geometries.forEach(g=>g.dispose()); materials.forEach(m=>m.dispose()); textures.forEach(t=>t.dispose());
        environmentTarget?.dispose(); key.shadow.dispose(); renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove();
      };
      resize();
    }).catch(() => { cleanup?.(); if (!disposed) onFail.current(); });
    return () => { disposed = true; cleanup?.(); };
  }, [reducedMotion]);

  return <div className={`pen-scene${ready ? ' pen-scene--ready' : ''}`}>
    <div className="scene-aura" aria-hidden="true" />
    <div ref={host} className="pen-scene__renderer" aria-hidden="true" data-ready={ready} />
  </div>;
});

