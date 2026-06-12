"use client";

import { useEffect } from "react";

export function ClientFX() {
  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const rafs: number[] = [];
    const cleanups: Array<() => void> = [];
    const raf = (fn: FrameRequestCallback) => {
      const id = requestAnimationFrame(fn);
      rafs.push(id);
      return id;
    };
    const on = (t: string, fn: EventListener, target: Window | Document = window) => {
      target.addEventListener(t, fn);
      cleanups.push(() => target.removeEventListener(t, fn));
    };

    // ---- WebGL smoke field
    const cv = document.getElementById("gl") as HTMLCanvasElement | null;
    const gl = cv && ((cv.getContext("webgl") || cv.getContext("experimental-webgl")) as WebGLRenderingContext | null);
    if (cv && gl) {
      const g: WebGLRenderingContext = gl;
      const vs = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;
      const fs = `precision highp float;uniform vec2 u_res;uniform float u_time;uniform vec2 u_mouse;uniform vec3 u_click;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}
      float noise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
        return mix(mix(hash(i),hash(i+vec2(1.,0.)),u.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),u.x),u.y);}
      float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*noise(p);p=p*2.02+vec2(3.1,1.7);a*=.5;}return v;}
      void main(){vec2 fc=gl_FragCoord.xy;vec2 uv=fc/u_res;vec2 p=(fc-.5*u_res)/u_res.y;vec2 m=(u_mouse-.5*u_res)/u_res.y;
        float t=u_time*.04;
        vec2 q=vec2(fbm(p*1.6+t),fbm(p*1.6+vec2(5.2,1.3)-t));
        vec2 r=vec2(fbm(p*1.6+1.6*q+t*1.1),fbm(p*1.6+1.6*q+vec2(8.3,2.8)));
        float f=fbm(p*1.6+1.9*r);
        float d=length(p-m);float bl=smoothstep(.6,0.,d)*.32;f+=bl;
        float ca=u_click.z;float cr=ca*1.1;float ring=smoothstep(.08,0.,abs(length(p-u_click.xy)-cr))*smoothstep(1.3,0.,ca);f+=ring*.5;
        float v=smoothstep(.28,.96,f);
        float ink=v*(.24+.62*v);vec3 col=mix(vec3(.02),vec3(.58),ink);
        col+=vec3(.1,.02,0.)*bl;col*=smoothstep(1.5,.4,length(uv-.5));
        gl_FragColor=vec4(col,1.);}`;
      let killed = false, started = false;
      const startGL = () => {
        if (killed || started) return;
        started = true;
        const sh = (type: number, src: string) => {
          const o = g.createShader(type)!;
          g.shaderSource(o, src);
          g.compileShader(o);
          if (!g.getShaderParameter(o, g.COMPILE_STATUS)) console.error(g.getShaderInfoLog(o));
          return o;
        };
        const prog = g.createProgram()!;
        g.attachShader(prog, sh(g.VERTEX_SHADER, vs));
        g.attachShader(prog, sh(g.FRAGMENT_SHADER, fs));
        g.linkProgram(prog);
        g.useProgram(prog);
        const buf = g.createBuffer();
        g.bindBuffer(g.ARRAY_BUFFER, buf);
        g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), g.STATIC_DRAW);
        const loc = g.getAttribLocation(prog, "p");
        g.enableVertexAttribArray(loc);
        g.vertexAttribPointer(loc, 2, g.FLOAT, false, 0, 0);
        const uR = g.getUniformLocation(prog, "u_res");
        const uT = g.getUniformLocation(prog, "u_time");
        const uM = g.getUniformLocation(prog, "u_mouse");
        const uC = g.getUniformLocation(prog, "u_click");
        const RES = 0.45; // render below half resolution — soft field, no visible loss, big perf win
        let W = 0, H = 0;
        const resize = () => {
          W = cv.width = Math.max(1, Math.round(innerWidth * RES));
          H = cv.height = Math.max(1, Math.round(innerHeight * RES));
          g.viewport(0, 0, W, H);
        };
        on("resize", resize);
        resize();
        let mx = W * 0.7, my = H * 0.5, tx = mx, ty = my, clx = 0, cly = 0, clt = -10;
        on("pointermove", ((e: PointerEvent) => {
          tx = e.clientX * RES;
          ty = (innerHeight - e.clientY) * RES;
        }) as EventListener);
        on("pointerdown", ((e: PointerEvent) => {
          if (e.clientY > innerHeight) return;
          clx = (e.clientX * RES - 0.5 * W) / H;
          cly = ((innerHeight - e.clientY) * RES - 0.5 * H) / H;
          clt = performance.now();
        }) as EventListener);
        const t0 = performance.now();
        let vis = true, heroVis = true, last = 0;
        on("visibilitychange", () => (vis = !document.hidden), document);
        on("scroll", () => { heroVis = scrollY < innerHeight; });
        const draw = (now: number) => {
          raf(draw);
          if (!vis || !heroVis || now - last < 33) return; // pause off-hero/hidden, cap ~30fps
          last = now;
          mx += (tx - mx) * 0.06;
          my += (ty - my) * 0.06;
          g.uniform2f(uR, W, H);
          g.uniform1f(uT, (performance.now() - t0) / 1000);
          g.uniform2f(uM, mx, my);
          g.uniform3f(uC, clx, cly, (performance.now() - clt) / 1000);
          g.drawArrays(g.TRIANGLES, 0, 3);
        };
        raf(draw);
      };
      const hasRIC = typeof window.requestIdleCallback === "function";
      const idleId = hasRIC
        ? window.requestIdleCallback(startGL, { timeout: 1400 })
        : (setTimeout(startGL, 600) as unknown as number);
      cleanups.push(() => {
        killed = true;
        if (hasRIC) window.cancelIdleCallback(idleId);
        else clearTimeout(idleId);
      });
    }

    // ---- custom cursor
    const cur = document.getElementById("cursor");
    if (cur && !matchMedia("(max-width:920px)").matches) {
      let cx = innerWidth / 2, cy = innerHeight / 2, px = cx, py = cy;
      on("pointermove", ((e: PointerEvent) => {
        cx = e.clientX;
        cy = e.clientY;
      }) as EventListener);
      const cloop = () => {
        px += (cx - px) * 0.2;
        py += (cy - py) * 0.2;
        cur.style.transform = `translate(${px}px,${py}px) translate(-50%,-50%)`;
        raf(cloop);
      };
      cloop();
      document.querySelectorAll<HTMLElement>("[data-cursor]").forEach((el) => {
        el.addEventListener("pointerenter", () => cur.classList.add("big"));
        el.addEventListener("pointerleave", () => cur.classList.remove("big"));
      });
    }

    // ---- magnetic
    document.querySelectorAll<HTMLElement>("[data-magnet]").forEach((el) => {
      const s = 18;
      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
        const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
        el.style.transform = `translate(${dx * s}px,${dy * s}px)`;
      };
      const leave = () => (el.style.transform = "translate(0,0)");
      el.addEventListener("pointermove", move as EventListener);
      el.addEventListener("pointerleave", leave);
    });

    // ---- header + progress
    const hdr = document.getElementById("hdr");
    const prog = document.getElementById("prog");
    on("scroll", () => {
      hdr?.classList.toggle("solid", scrollY > 40);
      if (prog) {
        const h = document.documentElement.scrollHeight - innerHeight;
        prog.style.width = (scrollY / h) * 100 + "%";
      }
    });

    // ---- scramble + reveal
    const GLY = "АБВГДЕЖЗИКЛМНОПРСТ#%&_/<>*01";
    const scramble = (el: HTMLElement) => {
      const final = el.dataset.final || el.textContent || "";
      el.dataset.final = final;
      if (reduce) {
        el.textContent = final;
        return;
      }
      let fr = 0;
      const tot = final.length * 2 + 6;
      const tick = () => {
        let out = "";
        for (let i = 0; i < final.length; i++) {
          if (i < (fr - 6) / 2) out += final[i];
          else if (final[i] === " ") out += " ";
          else out += GLY[(Math.random() * GLY.length) | 0];
        }
        el.textContent = out;
        fr++;
        if (fr < tot) raf(tick);
        else el.textContent = final;
      };
      tick();
    };
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            e.target.querySelectorAll<HTMLElement>(".scramble").forEach(scramble);
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.14 }
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    cleanups.push(() => io.disconnect());

    // ---- back to top
    document.querySelectorAll<HTMLElement>("a[data-top], a[href='#top']").forEach((a) =>
      a.addEventListener("click", (e) => {
        e.preventDefault();
        scrollTo({ top: 0, behavior: "smooth" });
      })
    );

    // ---- preloader
    const pre = document.getElementById("pre");
    const pcount = document.getElementById("pcount");
    const pbar = document.getElementById("pbar");
    const h1 = document.querySelector("h1");
    if (pre && pcount && pbar) {
      const dur = reduce ? 150 : 750;
      const st = performance.now();
      const pl = () => {
        const k = Math.min((performance.now() - st) / dur, 1);
        pcount.textContent = String(Math.floor(k * 100)).padStart(3, "0");
        pbar.style.width = k * 100 + "%";
        if (k < 1) raf(pl);
        else {
          pre.classList.add("done");
          setTimeout(() => (pre.style.display = "none"), 1000);
        }
      };
      pl();
    }

    // ---- headline glitch
    if (!reduce && h1) {
      let glTimer: ReturnType<typeof setTimeout>;
      const gloop = () => {
        h1.classList.add("glitchon");
        setTimeout(() => h1.classList.remove("glitchon"), 240);
        glTimer = setTimeout(gloop, 2800 + ((Math.random() * 2800) | 0));
      };
      gloop();
      cleanups.push(() => clearTimeout(glTimer));
    }

    return () => {
      rafs.forEach(cancelAnimationFrame);
      cleanups.forEach((c) => c());
    };
  }, []);

  return (
    <>
      <canvas id="gl" />
      <div className="grain" />
      <div className="progress" id="prog" />
      <div className="pre" id="pre">
        <div className="ptag mono">ЗАГРУЗКА ПОРТФОЛИО</div>
        <div className="pcount mono" id="pcount">
          000
        </div>
        <div className="pname">
          lstmind<span className="acc">.</span>
        </div>
        <div className="psub mono">Алексей — веб-разработчик · сайты, которые работают</div>
        <div className="pbar" id="pbar" />
      </div>
      <div className="cursor" id="cursor" />
    </>
  );
}
