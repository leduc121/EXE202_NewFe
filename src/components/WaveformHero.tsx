import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Upload } from 'lucide-react';

export default function WaveformHero() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl');
    if (!gl) return;
    const canvasEl = canvas;
    const glCtx = gl;

    function mkS(type: number, src: string) {
      const s = glCtx.createShader(type)!;
      glCtx.shaderSource(s, src);
      glCtx.compileShader(s);
      return s;
    }

    const FS = `precision highp float;
    uniform vec2 u_res; uniform float u_t; uniform vec2 u_m;
    float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    float nn(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),u.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x),u.y);}
    float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*nn(p);p*=2.;a*=.5;}return v;}
    void main(){
      vec2 uv=gl_FragCoord.xy/u_res; uv.y=1.-uv.y;
      vec2 mu=u_m/u_res; mu.y=1.-mu.y;
      float t=u_t;
      float md=length(uv-mu);
      float mw=exp(-md*md*8.)*0.12;
      float wave=0.;
      for(int i=1;i<=6;i++){
        float fi=float(i);
        float freq=3.+fi*2.5;
        float spd=t*(0.3+fi*.12);
        float amp=.04/fi;
        wave+=sin(uv.x*freq+spd+nn(vec2(fi))*6.28)*amp;
        wave+=sin(uv.x*freq*.7-spd*.8+fi)*amp*.6;
      }
      wave+=mw*sin(uv.x*12.+t*2.)*0.08;
      float wline=smoothstep(.008,.0,abs(uv.y-.5-wave));
      wline+=smoothstep(.003,.0,abs(uv.y-.5-wave*1.3))*.5;
      vec3 bg=mix(vec3(.05,.08,.18),vec3(.02,.04,.12),uv.y);
      bg+=vec3(.04,.08,.2)*fbm(uv*4.+t*.1);
      float mg=exp(-md*4.)*.35;
      bg+=vec3(.1,.25,.8)*mg;
      float wg=smoothstep(.15,.0,abs(uv.y-.5-wave));
      bg+=mix(vec3(.1,.3,.9),vec3(.3,.7,1.),wg)*wg*.6;
      bg+=wline*mix(vec3(.4,.7,1.),vec3(.8,.95,1.),wline);
      gl_FragColor=vec4(bg,1.);
    }`;

    const VS = 'attribute vec2 a;void main(){gl_Position=vec4(a,0,1);}';
    const prog = glCtx.createProgram()!;
    glCtx.attachShader(prog, mkS(glCtx.VERTEX_SHADER, VS));
    glCtx.attachShader(prog, mkS(glCtx.FRAGMENT_SHADER, FS));
    glCtx.linkProgram(prog);

    const buf = glCtx.createBuffer()!;
    glCtx.bindBuffer(glCtx.ARRAY_BUFFER, buf);
    glCtx.bufferData(glCtx.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), glCtx.STATIC_DRAW);
    const ap = glCtx.getAttribLocation(prog, 'a');
    const ur = glCtx.getUniformLocation(prog, 'u_res')!;
    const ut = glCtx.getUniformLocation(prog, 'u_t')!;
    const um = glCtx.getUniformLocation(prog, 'u_m')!;

    function resize() {
      canvasEl.width = window.innerWidth;
      canvasEl.height = window.innerHeight;
      glCtx.viewport(0, 0, canvasEl.width, canvasEl.height);
    }
    window.addEventListener('resize', resize);
    resize();

    let mx = 0, my = 0;
    const mouseHandler = (e: MouseEvent) => { mx = e.clientX; my = e.clientY; };
    document.addEventListener('mousemove', mouseHandler);

    let rafId = 0;
    function frame(t: number) {
      glCtx.useProgram(prog);
      glCtx.bindBuffer(glCtx.ARRAY_BUFFER, buf as WebGLBuffer);
      glCtx.enableVertexAttribArray(ap);
      glCtx.vertexAttribPointer(ap, 2, glCtx.FLOAT, false, 0, 0);
      glCtx.uniform2f(ur, canvasEl.width, canvasEl.height);
      glCtx.uniform1f(ut, t * 0.001);
      glCtx.uniform2f(um, mx, my);
      glCtx.drawArrays(glCtx.TRIANGLE_STRIP, 0, 4);
      rafId = requestAnimationFrame(frame);
    }
    rafId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener('mousemove', mouseHandler);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <section id="wave-section" className="hype-cta-section" style={{ position: 'relative', height: '80vh', overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
      <div className="hype-cta-shell" style={{ position: 'relative', zIndex: 2, textAlign: 'center', paddingTop: '8vh', color: '#fff' }}>
        <motion.div className="hype-cta-pill" initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true }} style={{ color: '#fff' }}>
          Live Monitoring
        </motion.div>

        <motion.h2 className="hype-cta-heading" initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.75, delay: 0.1 }} viewport={{ once: true, amount: 0.35 }} style={{ color: '#fff' }}>
          Hear every <em style={{ color: '#fff' }}>frequency</em>
        </motion.h2>

        <motion.p className="hype-cta-subline" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} viewport={{ once: true }} style={{ color: 'rgba(255,255,255,0.9)' }}>
          Interactive waveform visualisation built directly into your browser. Move your cursor to sculpt the sound.
        </motion.p>

        <motion.a href="#upload" className="hype-cta-button" initial={{ opacity: 0, y: 20, scale: 0.95 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.55, delay: 0.3 }} viewport={{ once: true }} style={{ color: '#fff' }}>
          <Upload className="w-5 h-5" />
          Explore the Studio
          <ArrowRight className="w-4 h-4" />
        </motion.a>
      </div>
    </section>
  );
}
