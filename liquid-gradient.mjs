import * as THREE from './vendor/three/build/three.module.js';

(function () {
    var mount = document.getElementById('liquidGradientBg');
    if (!mount) return;

    var reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    let renderer;
    try {
        renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, stencil: false, depth: false });
    } catch {
        return;
    }
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000);
    var clock = new THREE.Clock();
    var dpr = Math.min(window.devicePixelRatio || 1, .75);

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(dpr);
    camera.position.z = 50;
    mount.appendChild(renderer.domElement);

    var uniforms = {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        uSpeed: { value: 1.0 },
        uColorBlack: { value: new THREE.Vector3(0, 0, 0) },
        uColorGray: { value: new THREE.Vector3(0.5, 0.5, 0.5) },
        uColorWhite: { value: new THREE.Vector3(1, 1, 1) }
    };
    var material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
        fragmentShader: [
            'precision highp float;',
            'varying vec2 vUv;',
            'uniform float uTime;',
            'uniform float uSpeed;',
            'uniform vec2 uResolution;',
            'uniform vec3 uColorBlack;',
            'uniform vec3 uColorGray;',
            'uniform vec3 uColorWhite;',
            'float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123); }',
            'float noise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f); return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y); }',
            'vec3 gradient(vec2 uv,float t){',
            '  vec2 p=uv-0.5; p.x*=uResolution.x/uResolution.y;',
            '  float n=noise(uv*3.0+t*0.05)*0.15+noise(uv*7.0-t*0.03)*0.06;',
            '  float wave=sin(uv.x*4.0+t*0.35)+cos(uv.y*3.0-t*0.25);',
            '  float gray=smoothstep(-1.2,1.4,wave+n);',
            '  float white=smoothstep(0.78,1.18,gray);',
            '  float vignette=1.0-smoothstep(0.35,0.95,length(p));',
            '  vec3 color=mix(uColorBlack,uColorGray,gray*0.82*vignette);',
            '  return mix(color,uColorWhite,white*0.55);',
            '}',
            'void main(){',
            '  vec2 uv=vUv;',
            '  float dist=length(uv-0.5);',
            '  float ripple=sin(dist*20.0-uTime*3.0)*0.018;',
            '  float wave=sin(dist*15.0-uTime*2.0)*0.014;',
            '  uv+=vec2(ripple+wave);',
            '  vec3 color=gradient(uv,uTime*uSpeed);',
            '  color+=((noise(gl_FragCoord.xy*0.7+uTime)-0.5)*0.025);',
            '  gl_FragColor=vec4(clamp(color,0.0,1.0),1.0);',
            '}'
        ].join('\n')
    });

    var mesh = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), material);
    scene.add(mesh);

    function resize() {
        var width = window.innerWidth;
        var height = window.innerHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        uniforms.uResolution.value.set(width, height);
    }
    let frame = 0;
    function tick() {
        frame = 0;
        const delta = Math.min(clock.getDelta(), 0.05);
        if (!reducedMotion.matches) uniforms.uTime.value += delta;
        renderer.render(scene, camera);
        if (!reducedMotion.matches && !document.hidden) frame = requestAnimationFrame(tick);
    }

    function restart() {
        cancelAnimationFrame(frame);
        clock.getDelta();
        tick();
    }

    window.addEventListener('resize', () => { resize(); restart(); });
    document.addEventListener('visibilitychange', restart);
    reducedMotion.addEventListener('change', restart);
    resize();
    tick();
})();
