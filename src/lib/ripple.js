// Water-droplet refraction over the hero video.
// Performance rule: nothing is drawn and no loop runs unless a ripple is alive (about one second after a pointer gesture).
// The plain <video> is what people see the rest of the time, so idle cost is zero.
const MAX = 8;
const VS = 'attribute vec2 p;varying vec2 uv;void main(){uv=p*.5+.5;gl_Position=vec4(p,0.,1.);}';
const FS = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec2 uv; uniform sampler2D tex; uniform vec2 res; uniform vec2 fit; uniform float focus;
uniform vec4 rip[${MAX}];
void main(){
  vec2 px = vec2(uv.x, 1.-uv.y) * res;
  vec2 disp = vec2(0.); float shine = 0.;
  for (int i = 0; i < ${MAX}; i++){
    vec4 r = rip[i];
    if (r.z < 0. || r.z >= 1.) continue;
    vec2 d = px - r.xy; float dist = length(d) + .0001;
    float t = r.z, R = r.w * (1. - pow(1. - t, 2.2));
    float w = r.w * .2 + 3.;
    float fade = pow(1. - t, 1.6) * smoothstep(0., .08, t);
    float a = (dist - R) / w, b = (dist - R * .6) / (w * .9);
    float s = (sin(a * 5.03) * exp(-a * a) + .45 * sin(b * 5.03) * exp(-b * b)) * fade;
    disp += d / dist * s * 5.1; shine += s;
  }
  vec2 q = (px + disp) / res;
  vec2 v = vec2((1. - fit.x) * focus + q.x * fit.x, (1. - fit.y) * .5 + q.y * fit.y);
  vec3 c = texture2D(tex, vec2(v.x, 1. - v.y)).rgb + shine * vec3(.019, .015, .012);
  gl_FragColor = vec4(c, 1.);
}`;

export function attachRipple({ hero, video, canvas }) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  if (reduce.matches) return () => {};

  const ac = new AbortController(), sig = { signal: ac.signal };
  const ripples = [], buf = new Float32Array(MAX * 4);
  let gl = null, ro = null, ready = false, failed = false, raf = 0;
  let uRes, uFit, uFocus, uRip;

  // The WebGL context and shader are created lazily, on the first ripple, so visitors who never touch the hero pay nothing.
  function init() {
    try { gl = canvas.getContext('webgl', { alpha: false, antialias: false, powerPreference: 'low-power' }); } catch { /* no webgl */ }
    if (!gl) { failed = true; return; }
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { failed = true; return; }
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = n => gl.getUniformLocation(prog, n);
    uRes = U('res'); uFit = U('fit'); uFocus = U('focus'); uRip = U('rip');
    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    [['TEXTURE_WRAP_S', 'CLAMP_TO_EDGE'], ['TEXTURE_WRAP_T', 'CLAMP_TO_EDGE'], ['TEXTURE_MIN_FILTER', 'LINEAR'], ['TEXTURE_MAG_FILTER', 'LINEAR']]
      .forEach(([k, v]) => gl.texParameteri(gl.TEXTURE_2D, gl[k], gl[v]));
    canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); failed = true; canvas.classList.remove('on'); }, sig);
    ro = new ResizeObserver(resize); ro.observe(hero);
    resize();
    ready = true;
  }

  // object-fit: cover, mirrored in the shader
  function resize() {
    const W = hero.clientWidth, H = hero.clientHeight;
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
    const va = (video.videoWidth || 1280) / (video.videoHeight || 720), ca = W / H;
    const focus = 0.5 + 0.16 * Math.min(1, Math.max(0, (va - ca) / (va - 0.6)));
    gl.uniform2f(uRes, W, H);
    gl.uniform2f(uFit, ca > va ? 1 : ca / va, ca > va ? va / ca : 1);
    gl.uniform1f(uFocus, focus);
    hero.style.setProperty('--focus', `${focus * 100}%`);
  }

  function tick(now) {
    raf = 0;
    for (let i = ripples.length - 1; i >= 0; i--) if (now - ripples[i].t0 >= ripples[i].life) ripples.splice(i, 1);
    if (!ripples.length) { canvas.classList.remove('on'); return; }       // idle: stop completely
    if (video.readyState >= 2) {
      try { gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, video); } catch { failed = true; canvas.classList.remove('on'); return; }
      buf.fill(0);
      for (let i = 0; i < MAX; i++) buf[i * 4 + 2] = -1;
      ripples.forEach((r, i) => buf.set([r.x, r.y, (now - r.t0) / r.life, r.R], i * 4));
      gl.uniform4fv(uRip, buf);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      canvas.classList.add('on');
    }
    raf = requestAnimationFrame(tick);
  }
  const spawn = (x, y, now) => {
    if (failed || document.hidden || video.readyState < 2) return;
    if (!ready) init();
    if (failed || !ready) return;
    if (ripples.length >= MAX) ripples.shift();
    ripples.push({ x, y, t0: now, life: 1050 + Math.random() * 350, R: 43 + Math.random() * 21 });
    if (!raf) raf = requestAnimationFrame(tick);
  };

  // restrained: distance- and time-gated
  let last = null, lastAt = 0;
  const local = e => { const b = hero.getBoundingClientRect(); return [e.clientX - b.left, e.clientY - b.top]; };
  hero.addEventListener('pointermove', e => {
    if (failed || e.pointerType === 'touch') return;
    const [x, y] = local(e), now = performance.now();
    if (!last) { last = [x, y]; lastAt = now; return; }
    if (Math.hypot(x - last[0], y - last[1]) > 60 && now - lastAt > 150) { spawn(x, y, now); last = [x, y]; lastAt = now; }
  }, sig);
  hero.addEventListener('pointerdown', e => {
    if (failed || e.pointerType === 'mouse') return;
    const [x, y] = local(e); spawn(x, y, performance.now());
  }, sig);
  hero.addEventListener('pointerleave', () => { last = null; }, sig);

  return () => {
    cancelAnimationFrame(raf); ac.abort(); ro?.disconnect();
    canvas.classList.remove('on');
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
  };
}
