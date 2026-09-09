<template>
  <div class="t3d-root" ref="raizEl">
    <div id="stage"></div>

    <!-- Panel de control original del proyecto. Oculto (display:none, ver
         <style> abajo) porque en esta vista sólo se muestra la tablet, pero
         se deja completo porque main.js hace document.getElementById(...)
         de cada control suyo sin comprobar null: si faltara alguno, el
         motor se rompería al arrancar. Para reactivarlo basta con quitar el
         display:none de #panel. -->
    <aside id="panel">
      <header>
        <h1>Tablet 3D</h1>
        <button id="panel-toggle" title="Ocultar / mostrar panel">–</button>
      </header>

      <div class="panel-body">

        <section>
          <h2>Contenido de la pantalla</h2>
          <div class="row">
            <button id="ir-inicio" class="primary wide">◉ Pantalla de inicio</button>
          </div>
          <div class="row grid-3">
            <button class="chip" data-demo="dashboard.html" data-app="panel">Panel</button>
            <button class="chip" data-demo="notas.html" data-app="notas">Notas</button>
            <button class="chip" data-demo="reloj.html" data-app="reloj">Reloj</button>
          </div>
          <p class="hint">La tablet arranca en su escritorio: toca los iconos de la propia
          pantalla y las aplicaciones se abren con animación. El botón redondo del bisel
          inferior vuelve al inicio.</p>

          <label class="lbl" for="url">Cargar una URL</label>
          <div class="row">
            <input id="url" type="text" placeholder="https://ejemplo.com" spellcheck="false" />
            <button id="load-url" class="primary">Ir</button>
          </div>

          <label class="lbl" for="html">Pegar HTML propio</label>
          <textarea id="html" spellcheck="false" placeholder="&lt;h1&gt;Hola desde la tablet&lt;/h1&gt;"></textarea>
          <div class="row">
            <button id="load-html" class="primary wide">Cargar HTML</button>
          </div>
          <p class="hint">También puedes arrastrar un archivo <code>.html</code> sobre la ventana.</p>
        </section>

        <section>
          <h2>PDF</h2>
          <select id="pdf-list"><option value="">Buscando en pdfs/…</option></select>
          <div class="row" style="margin-top:8px">
            <button id="pdf-open" class="primary wide">Mostrar en la tablet</button>
            <button id="pdf-reload" title="Volver a leer la carpeta">↻</button>
          </div>
          <div class="row">
            <button id="pdf-prev">◀</button>
            <span id="pdf-page" class="pager">— / —</span>
            <button id="pdf-next">▶</button>
          </div>
          <div class="row">
            <button id="pdf-pick" class="wide">Abrir uno del equipo…</button>
          </div>
          <input type="file" id="pdf-file" accept="application/pdf,.pdf" hidden />
          <p class="hint">Se dibuja el documento entero con pdf.js, sin la interfaz del navegador.
          La rueda del ratón sobre la pantalla pasa las páginas.</p>
        </section>

        <section>
          <h2>Cámara</h2>
          <div class="row grid-3">
            <button class="chip" data-view="frente">Frente</button>
            <button class="chip" data-view="tresCuartos">3/4</button>
            <button class="chip" data-view="lado">Perfil</button>
            <button class="chip" data-view="atras">Trasera</button>
            <button class="chip" data-view="camaras">Lentes</button>
            <button class="chip" data-view="top">Cenital</button>
          </div>
          <div class="row">
            <button id="intro" class="wide">Vuelta 360°</button>
          </div>
          <label class="lbl" for="fov">Campo de visión <span id="fov-val">35°</span></label>
          <input id="fov" type="range" min="18" max="70" value="35" />
          <label class="check"><input type="checkbox" id="autorotate" /> Órbita automática</label>
          <label class="check"><input type="checkbox" id="float" /> Flotación suave</label>
        </section>

        <section>
          <h2>Fondo de la pantalla de inicio</h2>
          <select id="fondo-list"><option value="">Buscando en imgs/…</option></select>
          <div class="row" style="margin-top:8px">
            <button id="fondo-pick" class="primary wide">Elegir imagen…</button>
            <button id="fondo-clear">Quitar</button>
          </div>
          <input type="file" id="fondo-file" accept="image/*" hidden />
          <p class="hint">La lista sale de la carpeta <code>imgs/</code>. También puedes elegir
          cualquier imagen del equipo; se recuerda para la próxima vez.</p>
        </section>

        <section>
          <h2>Logo de la trasera</h2>
          <div class="row">
            <button id="logo-pick" class="primary wide">Elegir imagen…</button>
            <button id="logo-clear">Quitar</button>
          </div>
          <input type="file" id="logo-file" accept="image/*" hidden />

          <label class="lbl" for="logo-size">Tamaño <span id="logo-size-val">6,0</span></label>
          <input id="logo-size" type="range" min="1" max="15" step="0.1" value="6" />

          <label class="lbl" for="logo-y">Altura <span id="logo-y-val">-1,5</span></label>
          <input id="logo-y" type="range" min="-11" max="11" step="0.1" value="-1.5" />

          <label class="lbl" for="logo-style">Acabado</label>
          <select id="logo-style">
            <option value="impreso">Impreso (mate)</option>
            <option value="metal">Metálico (pulido)</option>
          </select>
          <p class="hint">Un PNG con transparencia queda mejor. También puedes arrastrar la imagen
          sobre la ventana. El logo se guarda para la próxima vez que abras la página.</p>
        </section>

        <section>
          <h2>Tablet</h2>
          <label class="lbl" for="finish">Acabado</label>
          <select id="finish">
            <option value="grafito">Grafito</option>
            <option value="plata">Plata</option>
            <option value="azul">Azul noche</option>
            <option value="oro">Oro</option>
          </select>
          <label class="check"><input type="checkbox" id="power" checked /> Pantalla encendida</label>
          <label class="check"><input type="checkbox" id="reflection" checked /> Reflejo del cristal</label>
          <label class="check"><input type="checkbox" id="interact" /> Modo interacción en la pantalla</label>
          <p class="hint">Apagado: arrastra donde quieras para girar la tablet; un clic simple sigue
          llegando al HTML. Encendido: la pantalla se comporta como una web normal (scroll, selección
          de texto), pero ahí ya no gira.</p>
        </section>

      </div>
    </aside>

    <div id="status">Cargando escena…</div>
  </div>
</template>

<script setup>
/**
 * Tablet 3D — puerto nativo a Vue del proyecto Three.js original (antes
 * embebido como <iframe src="/tablet3d/index.html">). El motor es el mismo
 * main.js sin cambios de fondo, envuelto en iniciarTablet3D()/destructor()
 * para engancharlo al ciclo de vida de Vue. Los únicos cambios reales frente
 * al original son los que exige dejar de ser una página de pantalla
 * completa:
 *
 *  - Three.js se importa como paquete npm en vez de por <script type="importmap">
 *    apuntando a un CDN (misma versión, 0.169.0, para que 'three/addons/*'
 *    resuelva exactamente igual).
 *  - El renderer, la cámara y el raycasting usaban innerWidth/innerHeight y
 *    coordenadas de ventana: como ya no ocupan toda la página, ahora usan el
 *    tamaño real de #stage (vía ResizeObserver, no el evento 'resize' de
 *    window, que no se dispara si sólo cambia el layout de la tarjeta).
 *  - 'demo/os.html', 'pdfs/' e 'imgs/' se resuelven ahora con una URL base
 *    fija (BASE) en vez de relativas a la página: main.js ya no vive en
 *    /tablet3d/index.html sino dentro del bundle de Vue, así que una ruta
 *    relativa se resolvería contra la URL de la vista (/ciudadania-digital),
 *    no contra /tablet3d/. Esos archivos (demo/, imgs/, pdfs/) se quedan tal
 *    cual en public/tablet3d/ — sólo index.html, main.js y style.css del
 *    proyecto original dejan de usarse, porque ese trío es justamente lo que
 *    ahora vive aquí.
 *  - Se añade un destructor real (AbortController para los listeners de
 *    window/document, cancelar el requestAnimationFrame, soltar el contexto
 *    WebGL) porque, a diferencia de una pestaña que se cierra sola, un
 *    componente de una SPA se puede montar y desmontar muchas veces en la
 *    misma pestaña: sin esto, cada visita a la vista dejaría un bucle de
 *    render y un contexto WebGL abandonados.
 */
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js'

/**
 * Avisa cuándo hay una aplicación abierta en la pantalla, para que la vista
 * pueda ofrecer su propio botón de cerrar (la barrita de la pantalla es
 * diminuta en móvil).
 */
const emit = defineEmits(['app-abierta'])

const raizEl = ref(null)
let destruir = null

/**
 * Puente entre el motor —que vive entero dentro de iniciarTablet3D(), en
 * closures— y quien use el componente. Se rellena al montar y se vacía al
 * desmontar, así que los métodos expuestos se pueden llamar en cualquier
 * momento: si la escena no está montada, simplemente no hacen nada.
 */
let motor = null

onMounted(() => { destruir = iniciarTablet3D(raizEl.value) })
onUnmounted(() => { destruir?.(); motor = null })

defineExpose({
  /**
   * Gira la tablet a horizontal, la encuadra hasta llenar la escena y, una vez
   * colocada, abre `html` como una aplicación dentro de su pantalla.
   * @param {{ html: string, nombre?: string }} opciones
   */
  mostrarApp: (opciones) => motor?.mostrarApp(opciones),

  /** Cierra la aplicación abierta y devuelve la tablet a su vista vertical. */
  irAInicio: () => motor?.irAInicio(),
})

function iniciarTablet3D(root) {
  // Carpeta pública donde viven demo/, imgs/ y pdfs/ del proyecto original
  // (ver comentario de cabecera). El propio index.html/main.js/style.css de
  // esa carpeta ya no se usan: este componente es ahora la única copia viva
  // del motor.
  const BASE = '/tablet3d/'

  // Aborta de golpe, en el destructor, todos los listeners de window/document
  // registrados más abajo — evitar guardar una referencia nombrada por cada
  // uno para poder quitarlos a mano.
  const abortCtrl = new AbortController()
  const { signal } = abortCtrl

  /* ========================================================================
     1. Dimensiones (unidades ~ centimetros)
     ========================================================================== */
  /* Resolucion "nativa" del panel. Bajarla es la forma barata de ampliar todo
     lo que se ve DENTRO de la pantalla: el mismo texto de 26 px ocupa mas
     parte del panel, asi que se lee mas grande sin tocar el CSS de ninguna
     aplicacion. Es exactamente 3/4 de la original (1080 x 1536), asi que la
     proporcion —y con ella la geometria de la tablet— no cambia ni un
     milimetro.

     No conviene bajarla mucho mas: el panel se dibuja a un ancho de unos
     810 px en pantalla (lo topa el alto de la caja, ver .tablet3d-frame en
     CiudadaniaDigitalView.vue), asi que a esta resolucion va 1:1 y el texto
     sale nitido. Bajarla mas obligaria al navegador a ampliar el resultado y
     se veria borroso. */
  const IFRAME_W = 810;
  const IFRAME_H = 1152;
  const SCREEN_W = 16.6;
  const SCREEN_H = SCREEN_W * IFRAME_H / IFRAME_W;      // ~ 23.6
  const BEZEL_X   = 1.0;
  const BEZEL_TOP = 1.2;
  const BEZEL_BOT = 2.9;                                // mas alto: ahi va el boton de inicio
  const BODY_W    = SCREEN_W + BEZEL_X * 2;             // 18.6
  const BODY_H    = SCREEN_H + BEZEL_TOP + BEZEL_BOT;   // ~ 27.7
  const SCREEN_Y  = (BEZEL_BOT - BEZEL_TOP) / 2;        // el panel sube 0.85 al no estar centrado
  const BODY_D   = 0.72;
  const BODY_R   = 1.25;                                // radio de esquina del chasis
  const BEVEL    = 0.14;                                // chaflan del canto
  const SCREEN_R = 0.62;                                // radio de esquina del panel
  const FRONT_Z  = BODY_D / 2;
  const PX       = SCREEN_W / IFRAME_W;                 // unidades de mundo por pixel CSS

  const CAM_MOD = { x: -(BODY_W / 2 - 4.5), y: BODY_H / 2 - 4.5, size: 6.4, depth: 0.58 };

  const FINISHES = {
    grafito: { body: 0x33363c, accent: 0x4a4e56, rough: 0.34 },
    plata:   { body: 0xc9ced6, accent: 0xe2e6ec, rough: 0.28 },
    azul:    { body: 0x2b4a6b, accent: 0x3a5c82, rough: 0.32 },
    oro:     { body: 0xb99a6b, accent: 0xd4bb90, rough: 0.30 }
  };

  // Se pide el indice de la carpeta ya mismo, en paralelo con three.js: cuando
  // el panel este listo la respuesta suele estar esperando.
  const pdfsIndex = fetch(BASE + 'pdfs/').then(r => r.text()).catch(() => null);
  const imgsIndex = fetch(BASE + 'imgs/').then(r => r.text()).catch(() => null);

  /* ========================================================================
     2. Escena, renderers, camara
     ========================================================================== */
  const stage  = root.querySelector('#stage');
  const statusEl = root.querySelector('#status');

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(35, stage.clientWidth / stage.clientHeight, 0.5, 500);
  camera.position.set(27, 12, 42);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(stage.clientWidth, stage.clientHeight);
  renderer.setClearAlpha(0);                            // fondo transparente => se ve el iframe
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const css3d = new CSS3DRenderer();
  css3d.setSize(stage.clientWidth, stage.clientHeight);
  css3d.domElement.style.position = 'absolute';
  css3d.domElement.style.top = '0';
  css3d.domElement.style.left = '0';

  stage.appendChild(css3d.domElement);                  // capa 1: abajo, recibe los eventos
  stage.appendChild(renderer.domElement);               // capa 2: arriba, pointer-events:none

  // Entorno para los reflejos del metal y el cristal
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.85;

  const clock = new THREE.Clock();
  const controls = new OrbitControls(camera, stage);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.minDistance = 14;
  controls.maxDistance = 120;
  controls.autoRotateSpeed = 1.1;
  controls.target.set(0, 0, 0);

  /* ========================================================================
     3. Luces
     ========================================================================== */
  RectAreaLightUniformsLib.init();

  scene.add(new THREE.HemisphereLight(0xa8c0e8, 0x14161c, 0.65));

  const key = new THREE.DirectionalLight(0xffffff, 3.1);
  key.position.set(18, 30, 24);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.left   = -24;
  key.shadow.camera.right  =  24;
  key.shadow.camera.top    =  28;
  key.shadow.camera.bottom = -28;
  key.shadow.camera.near = 1;
  key.shadow.camera.far  = 110;
  key.shadow.bias = -0.0006;
  key.shadow.normalBias = 0.02;
  scene.add(key);

  const fill = new THREE.DirectionalLight(0x9fc4ff, 1.7);   // levanta la trasera
  fill.position.set(-22, 8, -18);
  scene.add(fill);

  const softbox = new THREE.RectAreaLight(0xcfe2ff, 4.5, 26, 36);   // ventana fria a la izquierda
  softbox.position.set(-26, 12, 20);
  softbox.lookAt(0, 0, 0);
  scene.add(softbox);

  const warmbox = new THREE.RectAreaLight(0xffd2a8, 3.0, 20, 28);   // rebote calido a la derecha
  warmbox.position.set(27, -8, 14);
  warmbox.lookAt(0, 0, 0);
  scene.add(warmbox);

  // Luz que emite la propia pantalla
  const screenGlow = new THREE.PointLight(0x9fd2ff, 55, 46, 2);
  screenGlow.position.set(0, 0, 7);
  scene.add(screenGlow);

  // Suelo invisible que solo recoge la sombra
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(160, 160),
    new THREE.ShadowMaterial({ opacity: 0.32 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -BODY_H / 2 - 3.6;
  floor.receiveShadow = true;
  scene.add(floor);

  /* ========================================================================
     4. Utilidades de geometria
     ========================================================================== */
  function roundedRect(w, h, r) {
    const s = new THREE.Shape();
    const x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y);
    s.lineTo(x + w - r, y);
    s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r);
    s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h);
    s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r);
    s.quadraticCurveTo(x, y, x + r, y);
    return s;
  }

  const rectGeo = (w, h, r) => new THREE.ShapeGeometry(roundedRect(w, h, r), 24);

  // Losa con esquinas muy redondeadas en XY y chaflan fino en el canto.
  // (RoundedBoxGeometry no sirve aqui: limita el radio a la mitad del lado menor,
  //  o sea 0.36 con 0.72 de grosor, y la tablet quedaria casi cuadrada.)
  function slabGeo(w, h, d, r, bevel = BEVEL) {
    const geo = new THREE.ExtrudeGeometry(
      roundedRect(w - bevel * 2, h - bevel * 2, Math.max(r - bevel, 0.06)),
      {
        depth: d - bevel * 2,
        bevelEnabled: true,
        bevelThickness: bevel,
        bevelSize: bevel,
        bevelSegments: 6,
        curveSegments: 32,
        steps: 1
      }
    );
    geo.center();
    return geo;
  }

  /* ========================================================================
     5. Materiales
     ========================================================================== */
  const bodyMat = new THREE.MeshPhysicalMaterial({
    color: FINISHES.azul.body, metalness: 1, roughness: 0.34,
    clearcoat: 0.3, clearcoatRoughness: 0.35, envMapIntensity: 1.1
  });
  const accentMat = new THREE.MeshPhysicalMaterial({
    color: FINISHES.azul.accent, metalness: 1, roughness: 0.28, envMapIntensity: 1.2
  });
  const glassMat = new THREE.MeshPhysicalMaterial({          // cristal frontal (marco negro)
    color: 0x07080c, metalness: 0.2, roughness: 0.06,
    clearcoat: 1, clearcoatRoughness: 0.03, envMapIntensity: 1.4
  });
  const lensGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0x04050a, metalness: 0.1, roughness: 0.02,
    clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 1.5,
    iridescence: 0.45, iridescenceIOR: 1.5, iridescenceThicknessRange: [180, 300]
  });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x0b0d12, metalness: 0.6, roughness: 0.5 });
  const ringMat = new THREE.MeshPhysicalMaterial({ color: 0x8d939c, metalness: 1, roughness: 0.16, envMapIntensity: 1.6 });

  // Material "agujero": escribe rgba(0,0,0,0) sin mezclar => recorta el canvas WebGL
  // y deja ver el iframe que hay debajo, en la capa CSS3D.
  const holeMat = new THREE.MeshBasicMaterial({ color: 0x000000, opacity: 0, blending: THREE.NoBlending });
  const offMat  = new THREE.MeshPhysicalMaterial({ color: 0x05070c, metalness: 0.3, roughness: 0.1, clearcoat: 1 });

  // Reflejo tenue sobre el panel encendido
  /* Va encendido por defecto (la casilla "Reflejo del cristal" nace marcada).
     La opacidad es lo que decide si de verdad se aprecia: con 0.06 el brillo
     quedaba por debajo de lo perceptible en cuanto la pantalla mostraba un
     fondo claro. A 0.11 se lee como cristal sin llegar a lavar el contenido. */
  const reflectMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff, transparent: true, opacity: 0.11,
    metalness: 0, roughness: 0.045, envMapIntensity: 1.6,
    depthWrite: false, side: THREE.FrontSide
  });

  /* ========================================================================
     6. La tablet
     ========================================================================== */
  const tablet = new THREE.Group();
  scene.add(tablet);

  // --- chasis -------------------------------------------------------------
  const body = new THREE.Mesh(slabGeo(BODY_W, BODY_H, BODY_D, BODY_R), bodyMat);
  body.castShadow = true;
  body.receiveShadow = true;
  tablet.add(body);

  // --- cristal frontal: cubre la cara plana, marco negro brillante ---------
  const front = new THREE.Mesh(rectGeo(BODY_W - BEVEL * 2 - 0.04, BODY_H - BEVEL * 2 - 0.04, BODY_R - BEVEL), glassMat);
  front.position.z = FRONT_Z + 0.004;
  tablet.add(front);

  // --- panel: agujero + contenido CSS3D + reflejo --------------------------
  const screenGeo = rectGeo(SCREEN_W, SCREEN_H, SCREEN_R);

  const hole = new THREE.Mesh(screenGeo, holeMat);
  hole.position.set(0, SCREEN_Y, FRONT_Z + 0.012);
  hole.renderOrder = 1;
  tablet.add(hole);

  const reflect = new THREE.Mesh(screenGeo, reflectMat);
  reflect.position.set(0, SCREEN_Y, FRONT_Z + 0.016);
  reflect.renderOrder = 3;
  tablet.add(reflect);

  // elemento DOM que vive dentro del mundo 3D
  const screenEl = document.createElement('div');
  screenEl.className = 'tablet-screen';
  screenEl.style.width  = IFRAME_W + 'px';
  screenEl.style.height = IFRAME_H + 'px';
  screenEl.style.borderRadius = (SCREEN_R / PX) + 'px';

  const frame = document.createElement('iframe');
  frame.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups allow-modals');
  frame.setAttribute('referrerpolicy', 'no-referrer');
  screenEl.appendChild(frame);

  // Capa transparente sobre el iframe: deja que el arrastre llegue a OrbitControls
  // (asi se puede girar la tablet tambien sobre la pantalla) y reenvia los clics simples
  // al documento de dentro.
  const guard = document.createElement('div');
  guard.className = 'screen-guard';
  screenEl.appendChild(guard);

  const screenObj = new CSS3DObject(screenEl);
  screenObj.scale.setScalar(PX);
  screenObj.position.set(0, SCREEN_Y, FRONT_Z + 0.012); // exactamente sobre el agujero
  tablet.add(screenObj);

  /* --- fabrica de lentes -------------------------------------------------- */
  function makeLens(radius, depth, { iris = 0x0a1420, ring = true } = {}) {
    const g = new THREE.Group();

    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius * 1.03, depth, 40), darkMat);
    barrel.rotation.x = Math.PI / 2;                     // eje del cilindro -> Z
    barrel.castShadow = true;
    g.add(barrel);

    if (ring) {
      const r = new THREE.Mesh(new THREE.TorusGeometry(radius * 1.06, radius * 0.11, 16, 56), ringMat);
      r.position.z = depth / 2;
      g.add(r);
    }

    const glass = new THREE.Mesh(new THREE.CircleGeometry(radius * 0.94, 48), lensGlassMat);
    glass.position.z = depth / 2 + 0.012;
    g.add(glass);

    const pupil = new THREE.Mesh(
      new THREE.CircleGeometry(radius * 0.42, 32),
      new THREE.MeshPhysicalMaterial({ color: iris, metalness: 0.9, roughness: 0.15, envMapIntensity: 2.4 })
    );
    pupil.position.z = depth / 2 + 0.016;
    g.add(pupil);

    return g;
  }

  // --- camara frontal ------------------------------------------------------
  const frontCam = makeLens(0.17, 0.12);
  frontCam.position.set(0, SCREEN_Y + SCREEN_H / 2 + BEZEL_TOP * 0.5, FRONT_Z + 0.008);
  tablet.add(frontCam);

  const proximity = new THREE.Mesh(new THREE.CircleGeometry(0.075, 20), darkMat);   // sensor de proximidad
  proximity.position.set(0.62, frontCam.position.y, FRONT_Z + 0.012);
  tablet.add(proximity);

  /* --- modulo de camaras traseras ---------------------------------------- */
  const camModule = new THREE.Group();
  camModule.position.set(CAM_MOD.x, CAM_MOD.y, -FRONT_Z);
  tablet.add(camModule);

  const bump = new THREE.Mesh(slabGeo(CAM_MOD.size, CAM_MOD.size, CAM_MOD.depth, 1.15, 0.12), accentMat);
  bump.position.z = -CAM_MOD.depth / 2;
  bump.castShadow = true;
  bump.receiveShadow = true;
  camModule.add(bump);

  const bumpZ = -CAM_MOD.depth;                          // cara exterior del bulto
  const off = 1.42;

  const lensA = makeLens(1.02, 0.34, { iris: 0x0d1b2e });          // gran angular
  lensA.position.set(-off, off, bumpZ);
  lensA.rotation.y = Math.PI;
  camModule.add(lensA);

  const lensB = makeLens(0.86, 0.30, { iris: 0x122033 });          // ultra gran angular
  lensB.position.set(off, -off, bumpZ);
  lensB.rotation.y = Math.PI;
  camModule.add(lensB);

  const lidar = makeLens(0.42, 0.20, { iris: 0x1a0e14, ring: false });  // escaner LiDAR
  lidar.position.set(-off, -off, bumpZ);
  lidar.rotation.y = Math.PI;
  camModule.add(lidar);

  // flash de dos tonos
  const flashBody = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.16, 32), darkMat);
  flashBody.rotation.x = Math.PI / 2;
  flashBody.position.set(off, off, bumpZ - 0.05);
  camModule.add(flashBody);

  const flashLens = new THREE.Mesh(
    new THREE.CircleGeometry(0.36, 32),
    new THREE.MeshPhysicalMaterial({
      color: 0xfff2d8, emissive: 0xffe6bb, emissiveIntensity: 0.4,
      roughness: 0.25, metalness: 0
    })
  );
  flashLens.position.set(off, off, bumpZ - 0.14);
  flashLens.rotation.y = Math.PI;
  camModule.add(flashLens);

  // microfono del modulo
  const micHole = new THREE.Mesh(new THREE.CircleGeometry(0.09, 16), darkMat);
  micHole.position.set(0, CAM_MOD.size / 2 - 0.45, bumpZ - 0.02);
  micHole.rotation.y = Math.PI;
  camModule.add(micHole);

  /* --- detalles traseros -------------------------------------------------- */
  const backZ = -FRONT_Z - 0.004;

  // lineas de antena
  [BODY_H / 2 - 2.6, -(BODY_H / 2 - 2.6)].forEach(y => {
    const line = new THREE.Mesh(
      new THREE.PlaneGeometry(BODY_W - 1.4, 0.11),
      new THREE.MeshStandardMaterial({ color: 0x8b909a, metalness: 0.9, roughness: 0.55 })
    );
    line.position.set(0, y, backZ);
    line.rotation.y = Math.PI;
    tablet.add(line);
  });

  // emblema grabado (oculto por defecto: la trasera muestra la imagen de fondo)
  const emblem = new THREE.Group();
  emblem.position.set(0, -1.5, backZ);
  emblem.rotation.y = Math.PI;
  tablet.add(emblem);
  emblem.add(new THREE.Mesh(new THREE.RingGeometry(0.9, 1.1, 56), accentMat));
  emblem.add(new THREE.Mesh(new THREE.CircleGeometry(0.42, 40), accentMat));
  emblem.visible = false;

  /* --- imagen de fondo de la trasera (back_fondo.png) --------------------
     Skin que cubre la cara trasera y reemplaza al emblema como aspecto por
     defecto de la parte de atras. Si el usuario carga un logo, se oculta para
     no solaparse. Se ajusta preservando el aspecto real de la imagen. */
  /* Acabado "impreso" (mate), el mismo que styleLogo('impreso') da al logo de
     usuario: poco metal y bastante rugosidad, para que se lea como serigrafía
     sobre el aluminio y no como una pieza pulida que devuelve reflejos. */
  const backFondoMat = new THREE.MeshStandardMaterial({
    transparent: true, metalness: 0.2, roughness: 0.5,
    envMapIntensity: 1.2, depthWrite: false
  });
  const backFondo = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), backFondoMat);
  backFondo.position.set(0, 0, backZ - 0.006);
  backFondo.rotation.y = Math.PI;                         // mira hacia -Z, sin espejo
  backFondo.renderOrder = 2;
  backFondo.visible = false;                              // se muestra al cargar la textura
  tablet.add(backFondo);

  new THREE.TextureLoader().load(
    BASE + 'imgs/back_fondo.png',
    tex => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      backFondoMat.map = tex;
      backFondoMat.needsUpdate = true;
      const aspecto = (tex.image.width || 1) / (tex.image.height || 1);
      /* Proporción de la trasera que ocupa el icono. Con 1 la imagen se
         estiraba hasta rozar los cantos y parecía una carcasa impresa entera;
         a esta escala se lee como el logo grabado que es. Subir o bajar este
         número es lo único que hay que tocar para cambiarle el tamaño. */
      const PROPORCION = 0.48;
      const maxW = (BODY_W - 1) * PROPORCION;             // margenes hasta el canto redondeado
      const maxH = (BODY_H - 1) * PROPORCION;
      let w = maxH * aspecto, h = maxH;                   // "contain": sin deformar
      if (w > maxW) { w = maxW; h = maxW / aspecto; }
      backFondo.scale.set(w, h, 1);
      backFondo.visible = !logo.visible;                 // salvo que ya haya un logo puesto
    }
  );

  /* --- logo de marca en la trasera ---------------------------------------
     Plano con textura pegado a la cara trasera. Sustituye al emblema por
     defecto en cuanto el usuario carga una imagen. */
  const logoMat = new THREE.MeshStandardMaterial({
    transparent: true, metalness: 0.2, roughness: 0.5,
    envMapIntensity: 1.2, depthWrite: false
  });
  const logo = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), logoMat);
  logo.position.set(0, -1.5, backZ - 0.006);
  logo.rotation.y = Math.PI;                             // mira hacia -Z, sin espejo
  logo.renderOrder = 2;
  logo.visible = false;
  tablet.add(logo);

  let logoTex = null;
  let logoAspect = 1;
  const logoCfg = { size: 6, y: -1.5, style: 'impreso', src: null };

  function layoutLogo() {
    logo.scale.set(logoCfg.size, logoCfg.size / logoAspect, 1);   // sin deformar
    logo.position.y = logoCfg.y;
  }

  function styleLogo(style) {
    logoCfg.style = style;
    if (style === 'metal') {                             // pulido, coge los reflejos
      logoMat.metalness = 1;
      logoMat.roughness = 0.12;
      logoMat.envMapIntensity = 1.8;
    } else {                                             // impreso mate
      logoMat.metalness = 0.2;
      logoMat.roughness = 0.5;
      logoMat.envMapIntensity = 1.2;
    }
    logoMat.needsUpdate = true;
  }

  function applyLogo(src, quiet = false) {
    new THREE.TextureLoader().load(
      src,
      tex => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
        if (logoTex) logoTex.dispose();
        logoTex = tex;
        logoAspect = (tex.image.width || 1) / (tex.image.height || 1);
        logoMat.map = tex;
        logoMat.needsUpdate = true;
        logoCfg.src = src;
        logo.visible = true;
        emblem.visible = false;                          // se aparta el emblema generico
        layoutLogo();
        saveLogo();
        if (!quiet) say('Logo aplicado en la trasera de la tablet');
      },
      undefined,
      () => say('No se pudo cargar esa imagen')
    );
  }

  function clearLogo() {
    logo.visible = false;
    emblem.visible = true;
    logoCfg.src = null;
    try { localStorage.removeItem('tablet3d.logo'); } catch (err) {}
    say('Logo quitado');
  }

  function saveLogo() {
    try { localStorage.setItem('tablet3d.logo', JSON.stringify(logoCfg)); }
    catch (err) { say('Logo aplicado (demasiado grande para recordarlo al recargar)'); }
  }

  // conector magnetico de teclado (3 pines)
  [-0.9, 0, 0.9].forEach(x => {
    const pin = new THREE.Mesh(new THREE.CircleGeometry(0.12, 20), ringMat);
    pin.position.set(x, -BODY_H / 2 + 2.1, backZ);
    pin.rotation.y = Math.PI;
    tablet.add(pin);
  });

  /* --- botones fisicos (clicables) ---------------------------------------- */
  const powerBtn = new THREE.Mesh(new RoundedBoxGeometry(2.5, 0.2, 0.44, 3, 0.09), accentMat);
  powerBtn.position.set(BODY_W / 2 - 4.4, BODY_H / 2 + 0.03, 0);
  powerBtn.name = 'power';
  powerBtn.castShadow = true;
  tablet.add(powerBtn);

  /* Boton de inicio, en el bisel inferior.
     Va montado como uno de verdad: un collar fijo embebido en el cristal, una
     junta oscura alrededor y el disco, que es lo unico que se mueve. El disco
     sobresale 0.022 y su recorrido es de 0.016, asi que nunca llega a meterse
     por detras del cristal frontal (que es opaco y lo taparia). */
  const homeY = -BODY_H / 2 + BEZEL_BOT / 2;
  const HOME_VIAJE = 0.016;

  const homeJunta = new THREE.Mesh(                      // hueco oscuro donde encaja el disco
    new THREE.CircleGeometry(0.645, 56),
    new THREE.MeshStandardMaterial({ color: 0x05060a, metalness: 0.2, roughness: 0.85 })
  );
  homeJunta.position.set(0, homeY, FRONT_Z + 0.006);
  tablet.add(homeJunta);

  const homeAro = new THREE.Mesh(new THREE.TorusGeometry(0.655, 0.03, 12, 72), ringMat);
  homeAro.position.set(0, homeY, FRONT_Z + 0.010);       // collar fijo: no se hunde
  tablet.add(homeAro);

  const homeSombra = new THREE.Mesh(                     // sombra de la junta al hundirse
    new THREE.RingGeometry(0.598, 0.648, 56),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.25, depthWrite: false })
  );
  homeSombra.position.set(0, homeY, FRONT_Z + 0.014);
  homeSombra.renderOrder = 2;
  tablet.add(homeSombra);

  const homeBtn = new THREE.Mesh(
    new THREE.CircleGeometry(0.598, 56),
    new THREE.MeshPhysicalMaterial({
      color: 0x1c1f27, metalness: 0.85, roughness: 0.2,
      clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 1.35
    })
  );
  homeBtn.position.set(0, homeY, FRONT_Z + 0.022);
  homeBtn.name = 'home';
  tablet.add(homeBtn);

  const marcoHome = roundedRect(0.47, 0.47, 0.12);       // cuadrado grabado del icono
  marcoHome.holes.push(new THREE.Path(roundedRect(0.34, 0.34, 0.085).getPoints(48)));
  const homeIcono = new THREE.Mesh(
    new THREE.ShapeGeometry(marcoHome, 20),
    new THREE.MeshStandardMaterial({ color: 0x767e8e, metalness: 0.7, roughness: 0.35 })
  );
  homeIcono.position.z = 0.003;
  homeBtn.add(homeIcono);

  // Al hundirse pierde luz y reflejo, y la junta se oscurece: es lo que de
  // verdad se ve en un boton de estos, mas que el propio desplazamiento.
  const HOME_CLARO = new THREE.Color(0x1c1f27), HOME_OSCURO = new THREE.Color(0x0a0b0f);
  const GLIFO_CLARO = new THREE.Color(0x767e8e), GLIFO_OSCURO = new THREE.Color(0x3f4552);

  function reaccionHome(x) {
    homeBtn.material.color.lerpColors(HOME_CLARO, HOME_OSCURO, x);
    homeBtn.material.envMapIntensity = 1.35 - 0.95 * x;
    homeBtn.material.clearcoatRoughness = 0.05 + 0.2 * x;
    homeIcono.material.color.lerpColors(GLIFO_CLARO, GLIFO_OSCURO, x);
    homeSombra.material.opacity = 0.25 + 0.45 * x;
  }

  const volGroup = new THREE.Group();
  tablet.add(volGroup);
  [9.6, 7.9].forEach((y, i) => {
    const b = new THREE.Mesh(new RoundedBoxGeometry(0.2, 1.35, 0.44, 3, 0.09), accentMat);
    b.position.set(BODY_W / 2 + 0.03, y, 0);
    b.name = i === 0 ? 'vol+' : 'vol-';
    b.castShadow = true;
    volGroup.add(b);
  });

  /* --- altavoces, microfono y USB-C --------------------------------------- */
  function speakerRow(y) {
    const count = 12;
    const mesh = new THREE.InstancedMesh(
      new THREE.CylinderGeometry(0.07, 0.07, 0.16, 12), darkMat, count * 2
    );
    const m = new THREE.Matrix4();
    const inset = Math.sign(y) * 0.07;                   // enrasados con el canto
    let i = 0;
    for (const dir of [-1, 1]) {
      for (let k = 0; k < count; k++) {
        m.makeTranslation(dir * (2.4 + k * 0.42), y - inset, 0);
        mesh.setMatrixAt(i++, m);
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
    tablet.add(mesh);
  }
  speakerRow(BODY_H / 2);
  speakerRow(-BODY_H / 2);

  const usbc = new THREE.Mesh(new RoundedBoxGeometry(1.5, 0.24, 0.34, 3, 0.11), darkMat);
  usbc.position.set(0, -BODY_H / 2 + 0.02, 0);
  tablet.add(usbc);

  const mic = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.2, 12), darkMat);
  mic.position.set(-1.1, BODY_H / 2 - 0.07, 0);
  tablet.add(mic);

  /* ========================================================================
     7. Contenido de la pantalla
     ========================================================================== */
  function say(msg, sticky = false) {
    statusEl.textContent = msg;
    statusEl.classList.remove('fade');
    clearTimeout(say._t);
    if (!sticky) say._t = setTimeout(() => statusEl.classList.add('fade'), 4000);
  }

  /* La pantalla siempre tiene cargado el "sistema" de la tablet (demo/os.html):
     el escritorio con los iconos. Todo lo demas se abre dentro de el, con su
     animacion, ya venga de tocar un icono o de este panel. */
  let pdfMode = false;                                   // hay un PDF abierto
  let appAbierta = false;                                // hay alguna aplicacion abierta
  let pdfPages = 0;
  let pdfPage = 1;
  let osListo = false;
  const colaOS = [];                                     // ordenes anteriores al arranque

  const alSistema = msg => {
    if (!osListo) return colaOS.push(msg);
    if (frame.contentWindow) frame.contentWindow.postMessage(msg, '*');
  };
  const pdfPost = alSistema;                             // el sistema lo reenvia al visor

  function abrirEnTablet(url, nombre, esPdf = false, id) {
    alSistema({ t: 'abrir', url, nombre, pdf: esPdf, id });
  }

  function loadHTML(html) {
    alSistema({ t: 'abrirHtml', html, nombre: 'HTML propio' });
  }

  function irAInicio() {
    alSistema({ t: 'inicio' });
  }

  function resetPdfUI() {
    pdfMode = false;
    pdfPages = 0;
    pdfPage = 1;
    const p = root.querySelector('#pdf-page');
    if (p) p.textContent = '— / —';
  }

  // mensajes que llegan desde dentro de la pantalla (el sistema y sus aplicaciones)
  const alMensaje = e => {
    const m = e.data;
    if (!m || typeof m !== 'object' || !e.source || e.source !== frame.contentWindow) return;

    if (m.t === 'os-listo') {
      osListo = true;
      while (colaOS.length) frame.contentWindow.postMessage(colaOS.shift(), '*');
      return;
    }
    // Se abre una aplicacion (tocando su icono en la pantalla, o porque la
    // vista ha pedido mostrar algo): se coloca la tablet para poder leerla.
    if (m.t === 'os-abierto') {
      appAbierta = true;
      emit('app-abierta', true);
      if (!m.pdf) resetPdfUI();
      enfocarParaApp();
      if (m.nombre) say('Abriendo ' + m.nombre + '…');
      return;
    }
    // Cerrar la aplicacion (barrita de la pantalla o boton fisico de inicio)
    // devuelve tambien la tablet a su posicion vertical de presentacion.
    if (m.t === 'os-inicio') {
      appAbierta = false;
      emit('app-abierta', false);
      resetPdfUI();
      volverAPresentacion();
      say('Pantalla de inicio');
      return;
    }
    if (m.t === 'os-aviso')  { say(m.texto); return; }

    if (m.type === 'pdf-ready') {
      pdfMode = true;
      pdfPages = m.pages;
      pdfPage = 1;
      $('pdf-page').textContent = '1 / ' + m.pages;
      say('PDF: ' + (m.name || '') + ' · ' + m.pages + (m.pages === 1 ? ' pagina' : ' paginas'));
    }
    if (m.type === 'pdf-page') {
      pdfPage = m.page;
      $('pdf-page').textContent = m.page + ' / ' + m.pages;
    }
    if (m.type === 'pdf-error') say('No se pudo abrir el PDF: ' + m.message);
  };
  addEventListener('message', alMensaje, { signal });

  frame.src = BASE + 'demo/os.html';

  /* ========================================================================
     8. Encendido / apagado de la pantalla
     ========================================================================== */
  let screenOn  = true;
  let reflectOn = true;

  function setScreen(on) {
    screenOn = on;
    hole.material = on ? holeMat : offMat;               // agujero <-> panel negro apagado
    screenEl.style.visibility = on ? 'visible' : 'hidden';
    reflect.visible = on ? reflectOn : true;
    root.querySelector('#power').checked = on;
    say(on ? 'Pantalla encendida' : 'Pantalla apagada');
  }

  /* ========================================================================
     9. Vistas de camara con transicion suave
     ========================================================================== */
  const VIEWS = {
    frente:      { pos: [0, 0, 52],        target: [0, 0, 0] },
    tresCuartos: { pos: [27, 12, 42],      target: [0, 0, 0] },
    lado:        { pos: [48, 5, 14],       target: [0, 0, 0] },
    atras:       { pos: [-19, 8, -47],     target: [0, 0, 0] },
    camaras:     { pos: [-18, 18, -23],    target: [CAM_MOD.x, CAM_MOD.y, -1.5] },
    top:         { pos: [0, 44, 17],       target: [0, 3, 0] }
  };

  let tween = null;
  const easeInOut = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const TAU = Math.PI * 1;

  /* --- vuelta de presentacion --------------------------------------------
     Una vuelta completa orbitando alrededor del mismo punto que mira
     OrbitControls. Empieza y termina en la vista actual, asi que la camara
     acaba exactamente donde estaba. La camara se aleja en la primera mitad y
     se vuelve a acercar en la segunda. */
  let intro = null;

  function startIntro(dur = 3) {
    intro = {
      // el avance va por tiempo real, no por fotogramas: dura lo mismo aunque
      // el equipo vaya lento (dt esta limitado a 50 ms para evitar saltos)
      start: clock.elapsedTime, dur,
      end: new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target)),
      target: controls.target.clone()
    };

    tween = null;
    controls.autoRotate = false;
    $('autorotate').checked = false;
    controls.enabled = false;
    say('Vuelta de presentacion · toca o arrastra para saltarla');
  }

  function endIntro(jump = true) {
    if (!intro) return;
    if (jump) camera.position.setFromSpherical(intro.end).add(intro.target);
    intro = null;
    controls.enabled = true;
  }

  function goToView(name, instant = false) {
    const v = VIEWS[name];
    if (!v) return;
    endIntro(false);                                    // deja la camara donde este y sigue

    root.querySelectorAll('[data-view]').forEach(b =>
      b.classList.toggle('active', b.dataset.view === name));

    if (instant) {                                      // sin barrido al abrir la pagina
      tween = null;
      camera.position.set(...v.pos);
      controls.target.set(...v.target);
      controls.update();
      return;
    }

    tween = {
      start: clock.elapsedTime, dur: 0.95,             // por tiempo real, como la vuelta
      fromPos: camera.position.clone(), toPos: new THREE.Vector3(...v.pos),
      fromTgt: controls.target.clone(), toTgt: new THREE.Vector3(...v.target)
    };
  }

  /* --- orientacion: vertical (por defecto) y horizontal -------------------
     Girar el chasis pondria de lado tambien el HTML de la pantalla, porque
     el CSS3DObject cuelga del mismo grupo. En horizontal se intercambian el
     ancho y el alto del elemento y se le da el giro contrario: el resultado
     ocupa exactamente el mismo hueco del bisel (16.6 x 23.6 en el marco de
     la tablet, pase lo que pase con el chasis) pero el contenido se lee
     derecho — igual que cuando una tablet de verdad rota su interfaz. */
  const PANTALLA = {
    vertical:   { w: IFRAME_W, h: IFRAME_H, giro: 0 },
    horizontal: { w: IFRAME_H, h: IFRAME_W, giro: -Math.PI / 2 }
  };

  function orientarPantalla(modo) {
    const p = PANTALLA[modo];
    screenEl.style.width  = p.w + 'px';
    screenEl.style.height = p.h + 'px';
    screenObj.rotation.z  = p.giro;
  }

  /* Caja que hay que dejar entera en cuadro en cada orientacion. No es solo
     el chasis: los botones de volumen y el de encendido sobresalen ~0.13, y
     sin contarlos se recortan al apurar el zoom. */
  const SALIENTE = 0.13 * 2;
  const ENCAJE = {
    vertical:   [BODY_W + SALIENTE, BODY_H + SALIENTE],
    horizontal: [BODY_H + SALIENTE, BODY_W + SALIENTE]
  };

  /* Distancia a la que hay que poner la camara para que un rectangulo de
     w x h (unidades de mundo) quepa entero en el encuadre actual. Depende del
     aspecto de la caja, asi que se recalcula cuando la tarjeta cambia.

     El margen que queda es minimo a proposito: se busca el maximo zoom que
     deja la tablet entera en cuadro. */
  function distanciaParaEncajar(w, h, margen = 1.01) {
    const mitadFov = THREE.MathUtils.degToRad(camera.fov) / 2;
    const porAlto  = (h / 2) / Math.tan(mitadFov);
    const porAncho = (w / 2) / (Math.tan(mitadFov) * camera.aspect);
    // + FRONT_Z porque lo que se mira es la cara frontal, que esta esa
    // distancia mas cerca de la camara que el plano central sobre el que sale
    // la cuenta. Sumandolo el ajuste es exacto; sin sumarlo hay que compensar
    // a ojo con margen de sobra la ampliacion que le da la perspectiva.
    return Math.max(porAlto, porAncho) * margen + FRONT_Z;
  }

  /* La orientacion no se decide por el tipo de dispositivo sino por la forma
     de la caja: se prueban las dos y gana la que permite acercar mas la
     camara, es decir, la que deja la tablet mas grande. En una tarjeta ancha
     (escritorio) sale tumbada; en una columna estrecha (telefono) sale de
     pie, que es justo donde tumbarla la dejaba diminuta. */
  const mejorOrientacion = () =>
    distanciaParaEncajar(...ENCAJE.horizontal) <= distanciaParaEncajar(...ENCAJE.vertical)
      ? 'horizontal'
      : 'vertical';

  let modoTablet = 'vertical';
  let enfocado = false;                                // encuadrada para leer una app
  let anguloTablet = 0;                                // giro base del chasis
  let giro = null;                                     // animacion de ese giro

  function girarChasis(destino, dur = 0.85, alTerminar) {
    anguloTablet = destino;
    giro = { start: clock.elapsedTime, dur, desde: tablet.rotation.z, hasta: destino, alTerminar };
  }

  function encuadrar(modo, dur = 0.85) {
    tween = {
      start: clock.elapsedTime, dur,
      fromPos: camera.position.clone(),
      toPos: new THREE.Vector3(0, 0, distanciaParaEncajar(...ENCAJE[modo])),
      fromTgt: controls.target.clone(), toTgt: new THREE.Vector3(0, 0, 0)
    };
  }

  /**
   * Deja la tablet lista para leer una aplicacion: la orienta como mejor
   * aproveche la caja y acerca la camara hasta llenarla. Se usa tanto al
   * buscar (desde la vista) como al abrir cualquier aplicacion tocando su
   * icono en la propia pantalla.
   */
  function enfocarParaApp(alTerminar) {
    const destino = mejorOrientacion();

    endIntro(false);
    // Con la tablet llenando el cuadro, el plano del suelo entra en escena en
    // cuanto la caja es alta y estrecha, y su sombra se ve como una mancha
    // gris cruzandola. Asi de cerca no aporta nada: se apaga.
    floor.visible = false;
    enfocado = true;
    bloquearInteraccion3D(true);

    if (modoTablet === destino) {
      // ya esta en la orientacion buena; si hay un movimiento en curso se
      // respeta (viene de esta misma funcion) y si no, se reencuadra
      if (!tween && !giro) encuadrar(destino, 0.6);
      orientarPantalla(destino);
      alTerminar?.();
      return;
    }

    modoTablet = destino;
    encuadrar(destino);
    // La pantalla cambia de orientacion y la aplicacion se abre AL TERMINAR el
    // giro: primero se coloca la tablet, despues aparece el contenido con la
    // animacion propia del sistema.
    girarChasis(destino === 'horizontal' ? Math.PI / 2 : 0, 0.85, () => {
      orientarPantalla(destino);
      alTerminar?.();
    });
  }

  /** Coloca la tablet y abre ahi el HTML que le pasa la vista. */
  function mostrarApp({ html, nombre } = {}) {
    if (!screenOn) setScreen(true);
    enfocarParaApp(() => {
      if (html) alSistema({ t: 'abrirHtml', html, nombre: nombre || 'Resultados' });
    });
  }

  /** Devuelve la tablet a su vista vertical de presentacion. */
  function volverAPresentacion() {
    if (!enfocado && modoTablet === 'vertical') return;
    enfocado = false;
    modoTablet = 'vertical';
    floor.visible = true;
    bloquearInteraccion3D(false);            // vuelve a poder girarse
    orientarPantalla('vertical');
    girarChasis(0, 0.7);
    goToView('tresCuartos');
  }

  /* ========================================================================
     10. Interfaz
     ========================================================================== */
  const $ = id => root.querySelector('#' + id);

  $('panel-toggle').onclick = () => {
    const p = $('panel');
    p.classList.toggle('collapsed');
    $('panel-toggle').textContent = p.classList.contains('collapsed') ? '+' : '–';
  };

  root.querySelectorAll('[data-demo]').forEach(b => {
    b.onclick = () => {
      abrirEnTablet(b.dataset.demo, b.textContent.trim(), false, b.dataset.app);
      root.querySelectorAll('[data-demo]').forEach(o => o.classList.toggle('active', o === b));
      if (!screenOn) setScreen(true);
    };
  });

  $('ir-inicio').onclick = () => {
    irAInicio();
    root.querySelectorAll('[data-demo]').forEach(o => o.classList.remove('active'));
    if (!screenOn) setScreen(true);
  };

  $('load-url').onclick = () => {
    let u = $('url').value.trim();
    if (!u) return;
    if (!/^https?:\/\//i.test(u) && !u.startsWith('demo/')) u = 'https://' + u;
    abrirEnTablet(u, 'Web');
    if (!screenOn) setScreen(true);
    say('Abriendo ' + u + '   (ojo: muchos sitios bloquean iframes con X-Frame-Options)');
  };
  $('url').addEventListener('keydown', e => { if (e.key === 'Enter') $('load-url').click(); });

  $('load-html').onclick = () => {
    const src = $('html').value.trim();
    if (!src) return say('Escribe algo de HTML primero');
    loadHTML(src);
    if (!screenOn) setScreen(true);
    say('HTML personalizado cargado en la pantalla');
  };

  root.querySelectorAll('[data-view]').forEach(b => (b.onclick = () => goToView(b.dataset.view)));

  // se puede abrir directamente en una vista:  ?vista=camaras
  const askedView = new URLSearchParams(location.search).get('vista');
  goToView(VIEWS[askedView] ? askedView : 'tresCuartos', true);
  startIntro();                                         // presentacion al montar el componente

  $('intro').onclick = () => startIntro();

  $('fov').oninput = e => {
    camera.fov = +e.target.value;
    camera.updateProjectionMatrix();
    $('fov-val').textContent = e.target.value + '°';
  };

  $('autorotate').onchange = e => (controls.autoRotate = e.target.checked);

  let floating = false;
  $('float').onchange = e => {
    floating = e.target.checked;
    if (!floating) { tablet.position.y = 0; tablet.rotation.set(0, 0, anguloTablet); }
  };

  $('finish').onchange = e => {
    const f = FINISHES[e.target.value];
    bodyMat.color.setHex(f.body);
    bodyMat.roughness = f.rough;
    accentMat.color.setHex(f.accent);
    accentMat.roughness = Math.max(f.rough - 0.06, 0.05);
    say('Acabado: ' + e.target.options[e.target.selectedIndex].text);
  };

  /* --- PDF ---------------------------------------------------------------- */
  const pdfSelect = $('pdf-list');

  async function listarPdfs(recargando = false) {
    pdfSelect.innerHTML = '<option value="">Leyendo carpeta pdfs/…</option>';
    let nombres = [];

    try {                                              // indice de directorio del servidor
      const html = await (recargando ? fetch(BASE + 'pdfs/').then(r => r.text()) : pdfsIndex);
      nombres = [...new DOMParser().parseFromString(html || '', 'text/html').querySelectorAll('a[href]')]
        .map(a => a.getAttribute('href'))
        .filter(h => /\.pdf$/i.test(h))
        .map(h => decodeURIComponent(h.replace(/^.*\//, '')));
    } catch (err) { /* servidor sin indice */ }

    if (!nombres.length) {
      try {                                            // alternativa: pdfs/lista.json
        const j = await (await fetch(BASE + 'pdfs/lista.json')).json();
        if (Array.isArray(j)) nombres = j;
      } catch (err) {}
    }

    pdfSelect.innerHTML = '';
    if (!nombres.length) {
      pdfSelect.innerHTML = '<option value="">No se encontro ningun PDF</option>';
      say('No hay PDFs en pdfs/ (o el servidor no lista la carpeta): usa "Abrir uno del equipo"');
      return;
    }

    nombres.sort((a, b) => a.localeCompare(b, 'es'));
    for (const n of nombres) {
      const o = document.createElement('option');
      o.value = n;
      o.textContent = n.replace(/\.pdf$/i, '');
      pdfSelect.appendChild(o);
    }
    alSistema({ t: 'pdfs', nombres });                 // y aparecen como iconos en el escritorio
    say(nombres.length + ' PDF' + (nombres.length === 1 ? '' : 's') + ' encontrados en pdfs/');
  }

  function mostrarPdf(nombre) {
    if (!nombre) return;
    const url = 'pdf.html?file=' + encodeURIComponent('../pdfs/' + nombre) +
                '&name=' + encodeURIComponent(nombre);
    abrirEnTablet(url, nombre.replace(/\.pdf$/i, ''), true, 'pdf:' + nombre);
    if (!screenOn) setScreen(true);
    goToView('frente');                                // de frente se lee mucho mejor
  }

  $('pdf-open').onclick = () => mostrarPdf(pdfSelect.value);
  pdfSelect.onchange = () => mostrarPdf(pdfSelect.value);
  $('pdf-reload').onclick = () => listarPdfs(true);

  $('pdf-prev').onclick = () => pdfPost({ type: 'pdf-goto', page: pdfPage - 1 });
  $('pdf-next').onclick = () => pdfPost({ type: 'pdf-goto', page: pdfPage + 1 });

  $('pdf-pick').onclick = () => $('pdf-file').click();
  $('pdf-file').onchange = async e => {
    const f = e.target.files[0];
    e.target.value = '';
    if (!f) return;
    const datos = await f.arrayBuffer();
    alSistema({ t: 'abrirDatos', datos, nombre: f.name });
    if (!screenOn) setScreen(true);
    goToView('frente');
  };

  listarPdfs();

  /* --- fondo de la pantalla de inicio ------------------------------------- */
  const fondoSelect = $('fondo-list');
  const FONDOS_FIJOS = [
    { v: '', txt: 'Predeterminado (degradado)' },
    { v: 'linear-gradient(165deg,#1b2a4a,#0b1220 60%,#05070c)', txt: 'Azul noche' },
    { v: 'linear-gradient(160deg,#3b2340,#1a1024 55%,#0a0710)', txt: 'Violeta' },
    { v: 'linear-gradient(160deg,#0f3a35,#0a2420 55%,#050d0c)', txt: 'Verde profundo' }
  ];

  async function listarFondos() {
    fondoSelect.innerHTML = '';
    for (const f of FONDOS_FIJOS) {
      const o = document.createElement('option');
      o.value = f.v;
      o.textContent = f.txt;
      fondoSelect.appendChild(o);
    }

    try {                                              // imagenes de la carpeta imgs/
      const html = await imgsIndex;
      const imgs = [...new DOMParser().parseFromString(html || '', 'text/html').querySelectorAll('a[href]')]
        .map(a => a.getAttribute('href'))
        .filter(h => /\.(jpe?g|png|webp|avif|gif)$/i.test(h))
        .map(h => decodeURIComponent(h.replace(/^.*\//, '')))
        .sort((a, b) => a.localeCompare(b, 'es'));

      for (const n of imgs) {
        const o = document.createElement('option');
        o.value = BASE + 'imgs/' + n;
        o.textContent = n;
        fondoSelect.appendChild(o);
      }
    } catch (err) { /* sin indice de carpeta */ }
  }

  function ponerFondo(src, aviso) {
    // el sistema vive en demo/os.html: una ruta relativa se resolveria desde ahi,
    // asi que se manda absoluta (los degradados y los data: van tal cual)
    if (src && !/^(data:|linear-gradient|radial-gradient|https?:)/.test(src)) {
      src = new URL(src, location.origin).href;
    }
    alSistema({ t: 'fondo', src: src || null });
    say(aviso || (src ? 'Fondo cambiado' : 'Fondo predeterminado'));
  }

  fondoSelect.onchange = e => ponerFondo(e.target.value);
  $('fondo-clear').onclick = () => { fondoSelect.selectedIndex = 0; ponerFondo(''); };

  $('fondo-pick').onclick = () => $('fondo-file').click();
  $('fondo-file').onchange = e => {
    const f = e.target.files[0];
    e.target.value = '';
    if (!f) return;
    if (!/^image\//.test(f.type)) return say('Eso no es una imagen: ' + f.name);
    const r = new FileReader();
    r.onload = () => ponerFondo(String(r.result), 'Fondo de pantalla: ' + f.name);
    r.readAsDataURL(f);
  };

  listarFondos();

  $('logo-pick').onclick = () => $('logo-file').click();
  $('logo-file').onchange = e => {
    const f = e.target.files[0];
    if (f) readLogoFile(f);
    e.target.value = '';                                 // permite recargar el mismo archivo
  };
  $('logo-clear').onclick = clearLogo;

  $('logo-size').oninput = e => {
    logoCfg.size = +e.target.value;
    $('logo-size-val').textContent = logoCfg.size.toFixed(1).replace('.', ',');
    layoutLogo();
    if (logoCfg.src) saveLogo();
  };

  $('logo-y').oninput = e => {
    logoCfg.y = +e.target.value;
    $('logo-y-val').textContent = logoCfg.y.toFixed(1).replace('.', ',');
    layoutLogo();
    if (logoCfg.src) saveLogo();
  };

  $('logo-style').onchange = e => {
    styleLogo(e.target.value);
    if (logoCfg.src) saveLogo();
  };

  function readLogoFile(file) {
    if (!/^image\//.test(file.type)) return say('Eso no es una imagen: ' + file.name);
    const r = new FileReader();
    r.onload = () => applyLogo(String(r.result));
    r.readAsDataURL(file);
  }

  // recupera el logo de la sesion anterior
  try {
    const saved = JSON.parse(localStorage.getItem('tablet3d.logo') || 'null');
    if (saved && saved.src) {
      Object.assign(logoCfg, saved);
      $('logo-size').value = logoCfg.size;
      $('logo-size-val').textContent = logoCfg.size.toFixed(1).replace('.', ',');
      $('logo-y').value = logoCfg.y;
      $('logo-y-val').textContent = logoCfg.y.toFixed(1).replace('.', ',');
      $('logo-style').value = logoCfg.style;
      styleLogo(logoCfg.style);
      applyLogo(logoCfg.src, true);
    }
  } catch (err) {}

  $('power').onchange = e => setScreen(e.target.checked);

  $('reflection').onchange = e => {
    reflectOn = e.target.checked;
    reflect.visible = screenOn ? reflectOn : true;
  };

  /* Con una aplicacion abierta la tablet se queda quieta. Girarla mientras se
     intenta leer o tocar algo de la pagina de dentro es justo lo que estorba:
     cualquier arrastre movia la camara y el contenido se escapaba.

     Se apagan los controles de orbita y se quita la capa .screen-guard, asi
     que los eventos llegan directos al iframe y la pantalla se comporta como
     una web normal (scroll, seleccion, clics). Tambien se devuelve el
     touch-action del escenario: #stage lo lleva en `none` porque es
     imprescindible para OrbitControls en tactil, pero con los controles
     apagados eso solo conseguiria que en el movil no se pudiera desplazar ni
     la pagina ni el contenido de la tablet. Los botones fisicos siguen
     respondiendo, asi que el de inicio sigue sirviendo para salir. */
  let interaccionBloqueada = false;

  function aplicarGuard() {
    // el guard sobra si la pantalla es "tocable": con app abierta o con el
    // modo interaccion marcado a mano en el panel
    const pantallaTocable = interaccionBloqueada || $('interact').checked;
    guard.style.display = pantallaTocable ? 'none' : 'block';
  }

  function bloquearInteraccion3D(bloquear) {
    interaccionBloqueada = bloquear;
    controls.enabled = !bloquear;
    stage.style.touchAction = bloquear ? 'auto' : '';
    aplicarGuard();
  }

  $('interact').onchange = e => {
    aplicarGuard();
    say(e.target.checked
      ? 'Modo interaccion: la pantalla funciona como una web, pero ahi no gira'
      : 'Modo orbita: arrastra donde quieras para girar; el clic simple sigue llegando al HTML');
  };
  aplicarGuard();

  /* Un clic corto sobre la pantalla se reenvia al documento del iframe usando las
     coordenadas locales del elemento (offsetX/offsetY ya vienen deshechas de la
     transformacion 3D del navegador). Solo funciona si el contenido es del mismo
     origen: las demos y el HTML pegado si; una web externa no. */
  let tap = null;

  guard.addEventListener('wheel', e => {
    if (!appAbierta) return;                           // en el escritorio, la rueda acerca la camara
    e.preventDefault();
    e.stopPropagation();                               // no llega a OrbitControls
    alSistema({ t: 'scroll', dy: e.deltaMode === 1 ? e.deltaY * 42 : e.deltaY });
  }, { passive: false });

  guard.addEventListener('pointerdown', e => {
    tap = { x: e.clientX, y: e.clientY, ox: e.offsetX, oy: e.offsetY };
    guard.style.cursor = 'grabbing';
  });

  const alSoltarTap = e => {
    guard.style.cursor = 'grab';
    if (tap && Math.hypot(e.clientX - tap.x, e.clientY - tap.y) < 5) forwardTap(tap.ox, tap.oy);
    tap = null;
  };
  addEventListener('pointerup', alSoltarTap, { signal });

  function forwardTap(x, y) {
    let doc = null;
    try { doc = frame.contentDocument; } catch (err) { doc = null; }
    if (!doc) return say('Contenido de otro dominio: activa "Modo interaccion en la pantalla" para usarlo');

    // el sistema de la tablet mete las aplicaciones en iframes anidados:
    // hay que bajar por ellos ajustando las coordenadas en cada salto
    let el = null;
    for (let salto = 0; salto < 4; salto++) {
      el = doc.elementFromPoint(x, y);
      if (!el || el.tagName !== 'IFRAME') break;
      const r = el.getBoundingClientRect();
      let dentro = null;
      try { dentro = el.contentDocument; } catch (err) { dentro = null; }
      if (!dentro) return say('Ese contenido es de otro dominio: activa "Modo interaccion en la pantalla"');
      x -= r.left; y -= r.top;
      doc = dentro;
    }
    if (!el) return;

    const view = doc.defaultView;
    el.dispatchEvent(new view.MouseEvent('mousedown', { bubbles: true, cancelable: true, view, clientX: x, clientY: y }));
    el.dispatchEvent(new view.MouseEvent('mouseup',   { bubbles: true, cancelable: true, view, clientX: x, clientY: y }));
    el.dispatchEvent(new view.MouseEvent('click',     { bubbles: true, cancelable: true, view, clientX: x, clientY: y }));
    if (typeof el.focus === 'function') el.focus();     // permite escribir sin salir del modo orbita
  }

  /* ========================================================================
     11. Raycast: pulsar los botones fisicos de la tablet
     ========================================================================== */
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const clickable = [powerBtn, homeBtn, ...volGroup.children];
  let down = null;

  function pick(ev) {
    const rect = stage.getBoundingClientRect();
    ndc.x =  ((ev.clientX - rect.left) / rect.width)  * 2 - 1;
    ndc.y = -((ev.clientY - rect.top)  / rect.height) * 2 + 1;
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(clickable, false)[0];
    return hit ? hit.object : null;
  }

  // cualquier gesto salta la presentacion y devuelve el control
  ['pointerdown', 'wheel', 'keydown'].forEach(ev =>
    addEventListener(ev, () => endIntro(), { passive: true, signal }));

  /* Los botones se hunden mientras mantienes pulsado y vuelven solos con un
     muelle, como los de verdad: no es una animacion fija que se dispara al
     soltar. Cada uno tiene su eje y su recorrido. */
  const RECORRIDO = {
    home:   { eje: 'z', viaje: HOME_VIAJE },
    power:  { eje: 'y', viaje: 0.07 },
    'vol+': { eje: 'x', viaje: 0.07 },
    'vol-': { eje: 'x', viaje: 0.07 }
  };

  const pulsaciones = new Map();

  function pulsar(obj, hundido) {
    const cfg = RECORRIDO[obj.name];
    if (!cfg) return;
    let e = pulsaciones.get(obj);
    if (!e) {
      e = {
        obj, eje: cfg.eje, viaje: cfg.viaje,
        base: obj.position[cfg.eje],
        dir: Math.sign(obj.position[cfg.eje]) || 1,   // se hunde hacia el chasis
        x: 0, v: 0, objetivo: 0
      };
      pulsaciones.set(obj, e);
    }
    e.objetivo = hundido ? 1 : 0;
  }

  function accionBoton(o) {
    if (o.name === 'power') setScreen(!screenOn);
    if (o.name === 'home')  { irAInicio(); if (!screenOn) setScreen(true); }
    if (o.name === 'vol+')  say('Volumen +');
    if (o.name === 'vol-')  say('Volumen –');
  }

  stage.addEventListener('pointerdown', e => {
    const obj = pick(e);
    down = { x: e.clientX, y: e.clientY, obj };
    if (obj) pulsar(obj, true);                        // se hunde ya, al tocarlo
  });

  const alSoltarBoton = e => {                 // en la ventana: aunque sueltes fuera
    if (!down) return;
    const o = down.obj;
    if (o) {
      pulsar(o, false);
      const movido = Math.hypot(e.clientX - down.x, e.clientY - down.y);
      if (movido < 6 && pick(e) === o) accionBoton(o); // el boton actua al soltarlo
    }
    down = null;
  };
  addEventListener('pointerup', alSoltarBoton, { signal });

  addEventListener('pointercancel', () => {
    if (down && down.obj) pulsar(down.obj, false);
    down = null;
  }, { signal });

  stage.addEventListener('pointermove', e => {
    if (down) return;
    stage.style.cursor = pick(e) ? 'pointer' : '';
  });

  // muelle sobreamortiguado al bajar, con un pequeño rebote al volver
  function moverPulsaciones(dt) {
    for (const e of pulsaciones.values()) {
      if (e.objetivo === 1) {
        e.x += (1 - e.x) * Math.min(dt * 34, 1);       // baja de golpe
        e.v = 0;
      } else {
        let resto = dt;                                 // pasos cortos: el muelle es rapido
        while (resto > 0) {
          const h = Math.min(resto, 1 / 240);
          e.v += (-1600 * e.x - 48 * e.v) * h;
          e.x += e.v * h;
          resto -= h;
        }
        if (Math.abs(e.x) < 0.0004 && Math.abs(e.v) < 0.02) { e.x = 0; e.v = 0; }
      }
      e.obj.position[e.eje] = e.base - e.dir * e.viaje * e.x;
      if (e.obj === homeBtn) reaccionHome(Math.max(0, Math.min(1, e.x)));
    }
  }

  /* ========================================================================
     12. Arrastrar y soltar un .html sobre la tablet
     ========================================================================== */
  const veil = document.createElement('div');
  veil.id = 'drop-veil';
  veil.textContent = 'Suelta un .html o un .pdf para la pantalla, o una imagen para el logo trasero';
  root.appendChild(veil);

  root.addEventListener('dragover', e => { e.preventDefault(); veil.classList.add('on'); }, { signal });
  root.addEventListener('dragleave', e => { if (!e.relatedTarget) veil.classList.remove('on'); }, { signal });
  root.addEventListener('drop', e => {
    e.preventDefault();
    veil.classList.remove('on');
    const file = e.dataTransfer.files[0];
    if (!file) return;
    if (/^image\//.test(file.type)) return readLogoFile(file);      // imagen -> logo trasero
    if (/\.pdf$/i.test(file.name)) {                                 // pdf -> pantalla
      file.arrayBuffer().then(datos => {
        alSistema({ t: 'abrirDatos', datos, nombre: file.name });
        if (!screenOn) setScreen(true);
        goToView('frente');
      });
      return;
    }
    if (!/\.(html?|txt|md)$/i.test(file.name)) return say('Formato no soportado: ' + file.name);
    const r = new FileReader();
    r.onload = () => {
      loadHTML(String(r.result));
      if (!screenOn) setScreen(true);
      say('Cargado desde archivo: ' + file.name);
    };
    r.readAsText(file);
  }, { signal });

  /* ========================================================================
     13. Bucle de render
     ========================================================================== */
  let destruido = false;

  function animate() {
    if (destruido) return;
    requestAnimationFrame(animate);

    const dt = Math.min(clock.getDelta(), 0.05);
    const t  = clock.elapsedTime;

    if (intro) {                                        // vuelta de 360 grados
      const k = Math.min((t - intro.start) / intro.dur, 1);
      const arco = Math.sin(Math.PI * k);               // 0 -> 1 -> 0: se aleja y vuelve
      const s = new THREE.Spherical(
        intro.end.radius * (1 + 0.42 * arco),           // zoom out y zoom in
        intro.end.phi - 0.12 * arco,
        intro.end.theta - TAU + TAU * easeInOut(k)      // giro completo, suave al entrar y al salir
      );
      s.makeSafe();
      camera.position.setFromSpherical(s).add(intro.target);
      camera.lookAt(intro.target);
      if (k >= 1) endIntro(false);
    }

    if (tween) {                                        // transicion entre vistas
      const u = Math.min((t - tween.start) / tween.dur, 1);
      const k = easeInOut(u);
      camera.position.lerpVectors(tween.fromPos, tween.toPos, k);
      controls.target.lerpVectors(tween.fromTgt, tween.toTgt, k);
      if (u >= 1) tween = null;
    }

    if (giro) {                                         // vertical <-> horizontal
      const u = Math.min((t - giro.start) / giro.dur, 1);
      tablet.rotation.z = giro.desde + (giro.hasta - giro.desde) * easeInOut(u);
      if (u >= 1) {
        const alTerminar = giro.alTerminar;
        giro = null;
        alTerminar?.();
      }
    }

    if (floating) {                                     // flotacion sutil
      tablet.position.y = Math.sin(t * 0.8) * 0.35;
      // el vaiven va SOBRE el angulo base, para no deshacer el giro del chasis
      if (!giro) tablet.rotation.z = anguloTablet + Math.sin(t * 0.55) * 0.012;
      tablet.rotation.x = Math.sin(t * 0.42 + 1) * 0.010;
    }

    moverPulsaciones(dt);                              // botones fisicos

    const targetGlow = screenOn ? 55 : 0;               // brillo que emite el panel
    screenGlow.intensity += (targetGlow - screenGlow.intensity) * Math.min(dt * 6, 1);

    controls.update();
    renderer.render(scene, camera);
    css3d.render(scene, camera);
  }
  animate();

  /* ========================================================================
     14. Redimensionado
     ========================================================================== */
  // ResizeObserver en vez del 'resize' de window: el tamaño de #stage depende
  // del layout de la tarjeta (columnas de Vuetify, breakpoints), que puede
  // cambiar sin que la ventana del navegador cambie de tamaño.
  const resizeObserver = new ResizeObserver(() => {
    const w = stage.clientWidth, h = stage.clientHeight;
    if (!w || !h) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    css3d.setSize(w, h);

    // Enfocada en una aplicacion, la tablet debe seguir llenando la escena
    // aunque cambie la forma de la caja — y cambia justo al buscar, porque los
    // resultados hacen crecer la columna de al lado, o al girar el telefono.
    if (enfocado && !intro && !giro) {
      if (mejorOrientacion() !== modoTablet) {
        // la caja ha cambiado tanto que ahora conviene la otra orientacion
        enfocarParaApp();
        return;
      }

      const d = distanciaParaEncajar(...ENCAJE[modoTablet]);
      if (tween) {
        // hay un encuadre en curso: se corrige su destino, no la camara, o el
        // propio tween desharia el ajuste en el siguiente fotograma
        tween.toPos.setZ(d);
      } else {
        // se respeta el angulo actual, por si la vista se ha girado a mano
        const dir = camera.position.clone().sub(controls.target).normalize();
        camera.position.copy(controls.target).addScaledVector(dir, d);
        controls.update();
      }
    }
  });
  resizeObserver.observe(stage);

  say('Arrastra con el raton en cualquier punto para girar la tablet · rueda para acercar · clic derecho para desplazar');

  // Puente con el componente (ver defineExpose arriba): es lo unico del motor
  // que sale de este closure.
  motor = { mostrarApp, irAInicio };

  /* ========================================================================
     15. Destructor — se llama desde onUnmounted()
     ========================================================================== */
  return function destructor() {
    destruido = true;
    motor = null;
    abortCtrl.abort();
    resizeObserver.disconnect();
    controls.dispose();
    veil.remove();
    clearTimeout(say._t);
    try { renderer.dispose(); renderer.forceContextLoss(); } catch (err) {}
    try { pmrem.dispose(); } catch (err) {}
    if (logoTex) { try { logoTex.dispose(); } catch (err) {} }
  };
}
</script>

<style>
/*
 * Adaptado de public/tablet3d/style.css. Sin `scoped`: main.js crea a mano
 * varios de los elementos que hay que vestir (.tablet-screen, .screen-guard,
 * #drop-veil) con document.createElement(...), así que nunca reciben el
 * atributo data-v-xxx que usa el scoping de Vue — por eso cada regla lleva
 * el prefijo ".t3d-root" en vez de depender de scoped, para no filtrarse al
 * resto del sitio.
 *
 * Cambios de fondo frente al original (necesarios al dejar de ser una
 * página de pantalla completa):
 *  - #stage, #panel, #status y #drop-veil pasan de position:fixed (relativo
 *    a la ventana) a position:absolute (relativo a .t3d-root, que ahora es
 *    el positioning context).
 *  - .t3d-root sustituye a "html, body" como caja de tamaño fijo; su alto
 *    real lo pone la vista que lo usa (ver .tablet3d-frame en
 *    CiudadaniaDigitalView.vue).
 */
.t3d-root {
  --bg-1: #0b0e14;
  --bg-2: #161b26;
  --bg-3: #232a38;
  --ink: #e8ecf4;
  --muted: #96a0b5;
  --line: rgba(255, 255, 255, .10);
  --accent: #5aa9ff;
  color-scheme: dark;    /* sólo afecta a los controles nativos DENTRO del panel
                            (el desplegable de un <select>, etc.) */

  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #f8fafc;  /* fondo blanco, a petición — el degradado oscuro
                            original era: radial-gradient(90% 70% at 78% 8%,
                            rgba(90,169,255,.18) 0%, transparent 60%),
                            radial-gradient(80% 60% at 12% 92%,
                            rgba(255,138,92,.12) 0%, transparent 60%),
                            linear-gradient(160deg, var(--bg-3) 0%,
                            var(--bg-2) 45%, var(--bg-1) 100%) */
  color: var(--ink);
  font: 14px/1.5 "Segoe UI", system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
}

.t3d-root * { box-sizing: border-box; }

/* ---------- escenario: los dos renderers se apilan aquí ---------- */
.t3d-root #stage {
  position: absolute;
  inset: 0;
  touch-action: none;      /* imprescindible para OrbitControls en táctil */
}

/* la capa CSS3D queda DEBAJO y recibe los eventos (el canvas los deja pasar) */
.t3d-root #stage > div:first-child { z-index: 1; }
.t3d-root #stage > canvas {
  position: absolute !important;
  top: 0; left: 0;
  z-index: 2;
  pointer-events: none;    /* el canvas no bloquea al iframe ni a los controles */
}

/* ---------- pantalla (elemento CSS3D) ---------- */
.t3d-root .tablet-screen {
  overflow: hidden;
  background: #000;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, .9);
}
.t3d-root .tablet-screen iframe {
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
  background: #fff;
}
.t3d-root .screen-guard {
  position: absolute;
  inset: 0;
  background: transparent;
  cursor: grab;
}

/* ---------- panel de control ----------
   Oculto (se usará más adelante). No se borra el HTML del panel en el
   <template> porque main.js hace document.getElementById(...) de cada
   control suyo sin comprobar null: si el elemento no existiera, esas líneas
   romperían el script entero. display:none lo quita de la vista sin
   quitarlo del DOM, así que el motor sigue arrancando igual.
   Para volver a mostrarlo: cambiar "display: none;" por "display: flex;". */
.t3d-root #panel {
  position: absolute;
  top: 18px; left: 18px;
  width: 316px;
  max-height: calc(100% - 36px);
  z-index: 10;
  display: none;
  flex-direction: column;
  background: rgba(16, 20, 30, .72);
  backdrop-filter: blur(18px) saturate(140%);
  -webkit-backdrop-filter: blur(18px) saturate(140%);
  border: 1px solid var(--line);
  border-radius: 16px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, .45);
}
.t3d-root #panel header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid var(--line);
}
.t3d-root #panel h1 {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: .14em;
  text-transform: uppercase;
  color: var(--muted);
}
.t3d-root #panel-toggle {
  width: 26px; height: 26px;
  border-radius: 8px;
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, .05);
  color: var(--ink);
  cursor: pointer;
  line-height: 1;
}
.t3d-root .panel-body {
  padding: 4px 16px 16px;
  overflow-y: auto;
}
.t3d-root #panel.collapsed .panel-body { display: none; }

.t3d-root section { padding: 14px 0; border-bottom: 1px solid var(--line); }
.t3d-root section:last-child { border-bottom: 0; padding-bottom: 4px; }
.t3d-root section h2 {
  margin: 0 0 10px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: .12em;
  text-transform: uppercase;
  color: var(--accent);
}

.t3d-root .row { display: flex; gap: 8px; margin-bottom: 8px; }
.t3d-root .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); }
.t3d-root .lbl {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--muted);
  margin: 10px 0 6px;
}

.t3d-root input[type="text"], .t3d-root textarea, .t3d-root select {
  width: 100%;
  padding: 8px 10px;
  border-radius: 9px;
  border: 1px solid var(--line);
  background: rgba(0, 0, 0, .28);
  color: var(--ink);
  font: inherit;
  font-size: 12.5px;
  outline: none;
}
.t3d-root input[type="text"]:focus, .t3d-root textarea:focus, .t3d-root select:focus { border-color: var(--accent); }
.t3d-root input[type="text"]:hover, .t3d-root select:hover { border-color: rgba(255, 255, 255, .22); }
.t3d-root textarea { height: 78px; resize: vertical; font-family: ui-monospace, Consolas, monospace; font-size: 11.5px; }

/* Flecha propia en vez de la del sistema operativo, a juego con el resto de
   controles. El desplegable emergente (la lista de opciones) sigue siendo
   dibujado por el sistema operativo y no se puede re-estilar con CSS, pero
   color-scheme:dark de arriba hace que tambien salga en oscuro. */
.t3d-root select {
  appearance: none;
  -webkit-appearance: none;
  padding-right: 34px;
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='7' viewBox='0 0 11 7' fill='none'%3E%3Cpath d='M1 1L5.5 5.5L10 1' stroke='%2396a0b5' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
}
.t3d-root select:hover, .t3d-root select:focus { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='7' viewBox='0 0 11 7' fill='none'%3E%3Cpath d='M1 1L5.5 5.5L10 1' stroke='%235aa9ff' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"); }
.t3d-root select option {
  background: var(--bg-2);
  color: var(--ink);
}

.t3d-root button {
  font: inherit;
  font-size: 12px;
  color: var(--ink);
  border-radius: 9px;
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, .06);
  padding: 8px 10px;
  cursor: pointer;
  transition: background .15s, border-color .15s, transform .08s;
}
.t3d-root button:hover { background: rgba(255, 255, 255, .12); }
.t3d-root button:active { transform: translateY(1px); }
.t3d-root button.primary { background: rgba(90, 169, 255, .18); border-color: rgba(90, 169, 255, .45); }
.t3d-root button.primary:hover { background: rgba(90, 169, 255, .3); }
.t3d-root button.wide { flex: 1; }
.t3d-root .chip.active { background: rgba(90, 169, 255, .22); border-color: rgba(90, 169, 255, .5); }

.t3d-root input[type="range"] { width: 100%; accent-color: var(--accent); }
.t3d-root .check {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  color: var(--ink);
  margin: 9px 0;
  cursor: pointer;
}
.t3d-root .check input { accent-color: var(--accent); width: 15px; height: 15px; }
.t3d-root .hint { margin: 6px 0 0; font-size: 11px; color: var(--muted); }
.t3d-root code { font-family: ui-monospace, Consolas, monospace; color: #cfe3ff; }

.t3d-root #status {
  position: absolute;
  left: 50%;
  bottom: 18px;
  transform: translateX(-50%);
  z-index: 10;
  max-width: min(90%, 620px);
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: rgba(16, 20, 30, .72);
  backdrop-filter: blur(14px);
  font-size: 12px;
  color: var(--muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  pointer-events: none;
  transition: opacity .35s;
}
.t3d-root #status.fade { opacity: 0; }

.t3d-root #drop-veil {
  position: absolute;
  inset: 0;
  z-index: 20;
  display: none;
  place-items: center;
  background: rgba(11, 14, 20, .8);
  border: 3px dashed rgba(90, 169, 255, .6);
  font-size: 18px;
  letter-spacing: .04em;
  color: var(--ink);
  text-align: center;
  padding: 24px;
}
.t3d-root #drop-veil.on { display: grid; }

@media (max-width: 720px) {
  .t3d-root #panel { width: calc(100% - 24px); left: 12px; top: 12px; }
}

/* --- controles del PDF --- */
.t3d-root .pager {
  flex: 1;
  display: grid;
  place-items: center;
  font-size: 12px;
  color: var(--muted);
  border: 1px solid var(--line);
  border-radius: 9px;
  background: rgba(0, 0, 0, .22);
  font-variant-numeric: tabular-nums;
}
.t3d-root #pdf-prev, .t3d-root #pdf-next { width: 46px; }
.t3d-root #pdf-reload { width: 40px; }
</style>
