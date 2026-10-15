import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import type * as Three from 'three';

export interface PenSceneHandle {
  seek: (progress: number) => void;
}
interface Props {
  reducedMotion: boolean;
  onUnavailable: () => void;
}

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (v: number) => {
  const t = clamp(v);
  return t * t * (3 - 2 * t);
};
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

export const Pen3DScene = forwardRef<PenSceneHandle, Props>(function Pen3DScene(
  { reducedMotion, onUnavailable },
  ref
) {
  const host = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const still = useRef(reducedMotion);
  const renderRef = useRef<(() => void) | null>(null);
  const onFail = useRef(onUnavailable);
  const [ready, setReady] = useState(false);
  onFail.current = onUnavailable;
  still.current = reducedMotion;

  useImperativeHandle(
    ref,
    () => ({
      seek: (p) => {
        progress.current = clamp(p);
        renderRef.current?.();
      },
    }),
    []
  );

  useEffect(() => {
    renderRef.current?.();
  }, [reducedMotion]);

  useEffect(() => {
    const container = host.current;
    if (!container || reducedMotion) return;
    let disposed = false,
      visible = true,
      lost = false;
    let cleanup: (() => void) | undefined;
    let resizeObserver: ResizeObserver | undefined;
    let intersectionObserver: IntersectionObserver | undefined;
    let frame = 0;

    void Promise.all([
      import('three'),
      import('three/addons/environments/RoomEnvironment.js'),
    ])
      .then(([T, { RoomEnvironment }]) => {
        if (disposed) return;
        const geometries = new Set<Three.BufferGeometry>();
        const materials = new Set<Three.Material>();
        const textures = new Set<Three.Texture>();
        let environmentTarget: Three.WebGLRenderTarget | undefined;
        const renderer = new T.WebGLRenderer({
          alpha: true,
          antialias: true,
          powerPreference: 'low-power',
        });
        renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
        renderer.outputColorSpace = T.SRGBColorSpace;
        renderer.toneMapping = T.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.08;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = T.PCFShadowMap;
        renderer.domElement.setAttribute('aria-hidden', 'true');
        container.appendChild(renderer.domElement);

        cleanup = () => {
          geometries.forEach((g) => g.dispose());
          materials.forEach((m) => m.dispose());
          textures.forEach((t) => t.dispose());
          environmentTarget?.dispose();
          renderer.dispose();
          renderer.forceContextLoss();
          renderer.domElement.remove();
        };

        const world = new T.Scene();
        const camera = new T.OrthographicCamera(-1, 1, 1, -1, 1, 5000);
        camera.position.z = 2000;
        const room = new RoomEnvironment();
        const generator = new T.PMREMGenerator(renderer);
        environmentTarget = generator.fromScene(room, 0.04);
        world.environment = environmentTarget.texture;
        room.dispose();
        generator.dispose();
        world.environmentIntensity = 0.78;

        const geom = <G extends Three.BufferGeometry>(g: G) => {
          geometries.add(g);
          return g;
        };
        const mat = <M extends Three.Material>(m: M) => {
          materials.add(m);
          return m;
        };

        const lacquerGreen = mat(
          new T.MeshPhysicalMaterial({
            color: 0x183f35,
            metalness: 0.28,
            roughness: 0.24,
            clearcoat: 0.82,
            clearcoatRoughness: 0.14,
          })
        );
        const gripMaterial = mat(
          new T.MeshStandardMaterial({
            color: 0x13332b,
            metalness: 0.38,
            roughness: 0.36,
          })
        );
        const warmSilver = mat(
          new T.MeshStandardMaterial({
            color: 0xd6d8d2,
            metalness: 0.96,
            roughness: 0.2,
          })
        );
        const champagneAccent = mat(
          new T.MeshStandardMaterial({
            color: 0xc2ab92,
            metalness: 0.88,
            roughness: 0.26,
          })
        );
        const darkGroove = mat(
          new T.MeshStandardMaterial({
            color: 0x0b211b,
            roughness: 0.45,
            metalness: 0.65,
          })
        );

        const pen = new T.Group();
        const add = (
          geometry: Three.BufferGeometry,
          material: Three.Material,
          y = 0,
          z = 0
        ) => {
          const mesh = new T.Mesh(geom(geometry), material);
          mesh.position.set(0, y, z);
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          pen.add(mesh);
          return mesh;
        };

        add(new T.SphereGeometry(0.018, 20, 12), warmSilver, 0.018);
        add(new T.CylinderGeometry(0.045, 0.016, 0.17, 44), warmSilver, 0.115);
        add(new T.CylinderGeometry(0.12, 0.045, 0.42, 64), warmSilver, 0.41);
        add(new T.CylinderGeometry(0.124, 0.121, 0.028, 64), champagneAccent, 0.625);
        add(new T.CylinderGeometry(0.133, 0.12, 0.67, 64), gripMaterial, 0.955);
        for (let n = 0; n < 8; n++) {
          const detail = add(
            new T.TorusGeometry(0.131, 0.0025, 6, 64),
            darkGroove,
            0.72 + n * 0.064
          );
          detail.rotation.x = Math.PI / 2;
        }
        add(new T.CylinderGeometry(0.145, 0.134, 0.075, 64), warmSilver, 1.327);
        add(new T.CylinderGeometry(0.147, 0.146, 0.022, 64), champagneAccent, 1.365);

        const profile = [
          [0.143, 1.365],
          [0.15, 1.42],
          [0.154, 1.55],
          [0.158, 2.7],
          [0.155, 3.15],
          [0.15, 3.3],
          [0.14, 3.36],
        ];
        add(
          new T.LatheGeometry(
            profile.map(([x, y]) => new T.Vector2(x, y)),
            96
          ),
          lacquerGreen
        );

        add(new T.CylinderGeometry(0.144, 0.146, 0.07, 64), warmSilver, 3.365);
        add(new T.CylinderGeometry(0.133, 0.143, 0.16, 64), lacquerGreen, 3.48);
        add(new T.SphereGeometry(0.132, 40, 24), lacquerGreen, 3.54).scale.set(1, 0.4, 1);
        add(new T.CylinderGeometry(0.1, 0.1, 0.085, 48), warmSilver, 3.635);

        const clipCurve = new T.CatmullRomCurve3([
          new T.Vector3(0, 3.35, 0.145),
          new T.Vector3(0, 3.37, 0.23),
          new T.Vector3(0, 3.25, 0.24),
          new T.Vector3(0, 2.65, 0.21),
          new T.Vector3(0, 2.48, 0.17),
        ]);
        add(new T.TubeGeometry(clipCurve, 36, 0.024, 10, false), warmSilver);

        const labelCanvas = document.createElement('canvas');
        labelCanvas.width = 256;
        labelCanvas.height = 96;
        const context = labelCanvas.getContext('2d');
        if (context) {
          context.font = '500 30px Georgia, serif';
          context.fillStyle = '#f5f2e9';
          context.textAlign = 'center';
          context.fillText('A · A', 128, 56);
          const texture = new T.CanvasTexture(labelCanvas);
          texture.colorSpace = T.SRGBColorSpace;
          textures.add(texture);
          const label = mat(
            new T.MeshBasicMaterial({
              map: texture,
              transparent: true,
              depthWrite: false,
            })
          );
          add(new T.PlaneGeometry(0.24, 0.09), label, 2.65, 0.159);
        }

        world.add(pen);
        const ambient = new T.HemisphereLight(0xf5f2e9, 0x415b4c, 1.35);
        world.add(ambient);

        const key = new T.DirectionalLight(0xfffbf1, 2.4);
        key.position.set(-520, 720, 920);
        key.castShadow = true;
        key.shadow.mapSize.set(1024, 1024);
        Object.assign(key.shadow.camera, {
          left: -1200,
          right: 1200,
          top: 1200,
          bottom: -1200,
          near: 1,
          far: 5000,
        });
        key.shadow.camera.updateProjectionMatrix();
        key.shadow.normalBias = 0.8;
        key.shadow.bias = -0.00008;
        world.add(key);

        const edge = new T.DirectionalLight(0xdce5d9, 1.15);
        edge.position.set(600, 220, 520);
        world.add(edge);

        const surface = new T.Mesh(
          geom(new T.PlaneGeometry(5000, 5000)),
          mat(new T.ShadowMaterial({ opacity: 0.06 }))
        );
        surface.position.z = -5;
        surface.receiveShadow = true;
        world.add(surface);

        const ring = new T.Mesh(
          geom(new T.TorusGeometry(1.08, 0.006, 6, 100)),
          mat(
            new T.MeshBasicMaterial({
              color: 0x879c88,
              transparent: true,
              opacity: 0.24,
            })
          )
        );
        ring.rotation.x = 1.13;
        world.add(ring);

        let width = 1,
          height = 1,
          hasRendered = false,
          cleared = false;
        const toWorld = (x: number, y: number, z = 0) =>
          new T.Vector3(x - width / 2, height / 2 - y, z);

        const draw = () => {
          if (disposed || lost || document.hidden || !visible) return;
          const p = progress.current;
          // On short phones, introduce the pen as the copy fades, keeping it off the credentials.
          const introVisibility = width < 760 && height < 650 ? smooth((p - 0.2) / 0.045) : 1;
          container.style.opacity = String(introVisibility * (1 - smooth((p - 0.25) / 0.1)));
          if (p >= 0.35 || still.current) {
            if (!cleared) {
              renderer.clear();
              cleared = true;
            }
            return;
          }
          cleared = false;
          const mobile = width < 760;
          const intro = {
            x: width * (mobile ? 0.64 : 0.72),
            y: height * (mobile ? 0.86 : 0.72),
            size: mobile
              ? Math.min(width * 0.105, height * 0.052)
              : Math.min(height * 0.148, width * 0.085),
            rx: 0.32,
            ry: 0.65,
            rz: -0.49,
          };
          const macro = {
            x: width * (mobile ? 0.38 : 0.54),
            y: height * 0.7,
            size: Math.min(height * 0.152, width * (mobile ? 0.17 : 0.108)),
            rx: 0.64,
            ry: 1.12,
            rz: -0.76,
          };
          const t = smooth((p - 0.1) / 0.18);
          const pose = {
            x: mix(intro.x, macro.x, t),
            y: mix(intro.y, macro.y, t),
            size: mix(intro.size, macro.size, t),
            rx: mix(intro.rx, macro.rx, t),
            ry: mix(intro.ry, macro.ry, t),
            rz: mix(intro.rz, macro.rz, t),
          };
          pen.position.copy(toWorld(pose.x, pose.y));
          pen.rotation.set(pose.rx, pose.ry, pose.rz);
          pen.scale.setScalar(pose.size);
          pen.visible = true;
          surface.visible = true;
          ring.visible = p < 0.28;
          ring.scale.setScalar(intro.size);
          ring.position.copy(
            toWorld(intro.x + intro.size * 0.72, intro.y - intro.size * 0.7, -3)
          );
          (ring.material as Three.MeshBasicMaterial).opacity =
            0.18 * (1 - smooth((p - 0.1) / 0.16));

          const projected = pen.position.clone().project(camera);
          container.dataset.tipX = (((projected.x + 1) * width) / 2).toFixed(3);
          container.dataset.tipY = (((1 - projected.y) * height) / 2).toFixed(3);
          container.dataset.progress = p.toFixed(5);

          try {
            renderer.render(world, camera);
          } catch {
            lost = true;
            setReady(false);
            onFail.current();
            return;
          }
          if (!hasRendered) {
            hasRendered = true;
            setReady(true);
          }
        };

        const resize = () => {
          const rect = container.getBoundingClientRect();
          width = Math.max(1, rect.width);
          height = Math.max(1, rect.height);
          camera.left = -width / 2;
          camera.right = width / 2;
          camera.top = height / 2;
          camera.bottom = -height / 2;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height, false);
          draw();
        };

        const schedule = () => {
          cancelAnimationFrame(frame);
          frame = requestAnimationFrame(resize);
        };
        const onLost = (event: Event) => {
          event.preventDefault();
          lost = true;
          setReady(false);
          onFail.current();
        };
        const onRestored = () => {
          lost = false;
          resize();
        };

        resizeObserver = new ResizeObserver(schedule);
        resizeObserver.observe(container);
        intersectionObserver = new IntersectionObserver(([entry]) => {
          visible = entry.isIntersecting;
          if (visible) draw();
        });
        intersectionObserver.observe(container);
        document.addEventListener('visibilitychange', draw);
        renderer.domElement.addEventListener('webglcontextlost', onLost);
        renderer.domElement.addEventListener('webglcontextrestored', onRestored);
        renderRef.current = draw;

        cleanup = () => {
          renderRef.current = null;
          cancelAnimationFrame(frame);
          resizeObserver?.disconnect();
          intersectionObserver?.disconnect();
          document.removeEventListener('visibilitychange', draw);
          renderer.domElement.removeEventListener('webglcontextlost', onLost);
          renderer.domElement.removeEventListener('webglcontextrestored', onRestored);
          geometries.forEach((g) => g.dispose());
          materials.forEach((m) => m.dispose());
          textures.forEach((t) => t.dispose());
          environmentTarget?.dispose();
          key.shadow.dispose();
          renderer.dispose();
          renderer.forceContextLoss();
          renderer.domElement.remove();
        };
        resize();
      })
      .catch(() => {
        cleanup?.();
        if (!disposed) onFail.current();
      });

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [reducedMotion]);

  return (
    <div className={`pen-scene${ready ? ' pen-scene--ready' : ''}`}>
      <div className="scene-aura" aria-hidden="true" />
      <div ref={host} className="pen-scene__renderer" aria-hidden="true" data-ready={ready} />
    </div>
  );
});
