"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import styles from "./MotovibezApp.module.css";

/* ─── TYPES ─── */
interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;
  life: number;
  maxLife: number;
}

/* ─── CUSTOM CURSOR ─── */
function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0 });
  const ring = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const move = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (dotRef.current) {
        dotRef.current.style.left = `${e.clientX}px`;
        dotRef.current.style.top = `${e.clientY}px`;
      }
    };
    window.addEventListener("mousemove", move);

    let raf: number;
    const animate = () => {
      ring.current.x += (pos.current.x - ring.current.x) * 0.12;
      ring.current.y += (pos.current.y - ring.current.y) * 0.12;
      if (ringRef.current) {
        ringRef.current.style.left = `${ring.current.x}px`;
        ringRef.current.style.top = `${ring.current.y}px`;
      }
      raf = requestAnimationFrame(animate);
    };
    animate();
    return () => {
      window.removeEventListener("mousemove", move);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor" />
      <div ref={ringRef} className="cursor-ring" />
    </>
  );
}

/* ─── HERO 3D CAR SCENE ─── */
function HeroCarCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);
    let t = 0;
    const particles: Particle[] = [];
    let pid = 0;

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);

    const spawnParticle = (x: number, y: number, color: string) => {
      particles.push({
        id: pid++,
        x, y,
        size: Math.random() * 4 + 1,
        speedX: (Math.random() - 0.5) * 3,
        speedY: -(Math.random() * 3 + 1),
        color,
        life: 1,
        maxLife: Math.random() * 60 + 30,
      });
    };

    // ── Draw a stylized sports car ──
    const drawCar = (cx: number, cy: number, scale: number, hue: number, time: number) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(scale, scale);

      const bob = Math.sin(time * 0.8) * 3;
      ctx.translate(0, bob);

      // Shadow
      ctx.save();
      ctx.translate(0, 90);
      const shadowGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 240);
      shadowGrad.addColorStop(0, `hsla(${hue}, 100%, 50%, 0.4)`);
      shadowGrad.addColorStop(1, "transparent");
      ctx.fillStyle = shadowGrad;
      ctx.scale(1, 0.3);
      ctx.beginPath();
      ctx.ellipse(0, 0, 240, 80, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Ground reflection glow
      const reflGrad = ctx.createLinearGradient(0, 60, 0, 120);
      reflGrad.addColorStop(0, `hsla(${hue}, 100%, 50%, 0.3)`);
      reflGrad.addColorStop(1, "transparent");
      ctx.fillStyle = reflGrad;
      ctx.fillRect(-240, 60, 480, 60);

      // Body — main chassis
      ctx.beginPath();
      ctx.moveTo(-240, 40);
      ctx.lineTo(-220, -10);
      ctx.lineTo(-160, -50);
      ctx.lineTo(-80, -80);
      ctx.lineTo(40, -85);
      ctx.lineTo(140, -55);
      ctx.lineTo(200, -20);
      ctx.lineTo(230, 10);
      ctx.lineTo(240, 40);
      ctx.closePath();

      const bodyGrad = ctx.createLinearGradient(0, -85, 0, 40);
      bodyGrad.addColorStop(0, `hsl(${hue}, 90%, 55%)`);
      bodyGrad.addColorStop(0.5, `hsl(${hue}, 80%, 35%)`);
      bodyGrad.addColorStop(1, `hsl(${hue}, 70%, 15%)`);
      ctx.fillStyle = bodyGrad;
      ctx.fill();
      ctx.strokeStyle = `hsla(${hue}, 100%, 70%, 0.8)`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Cabin / glass area
      ctx.beginPath();
      ctx.moveTo(-120, -50);
      ctx.lineTo(-70, -130);
      ctx.lineTo(30, -135);
      ctx.lineTo(110, -100);
      ctx.lineTo(130, -50);
      ctx.closePath();

      const glassGrad = ctx.createLinearGradient(-70, -135, 110, -50);
      glassGrad.addColorStop(0, "rgba(0, 200, 255, 0.3)");
      glassGrad.addColorStop(0.5, "rgba(0, 150, 220, 0.15)");
      glassGrad.addColorStop(1, "rgba(0, 50, 100, 0.6)");
      ctx.fillStyle = glassGrad;
      ctx.fill();
      ctx.strokeStyle = "rgba(0, 220, 255, 0.6)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Glass highlight
      ctx.beginPath();
      ctx.moveTo(-80, -125);
      ctx.lineTo(20, -130);
      ctx.lineTo(10, -110);
      ctx.lineTo(-60, -105);
      ctx.closePath();
      ctx.fillStyle = "rgba(255,255,255,0.07)";
      ctx.fill();

      // Front hood scoop lines
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(50 + i * 20, -85);
        ctx.lineTo(70 + i * 20, -40);
        ctx.strokeStyle = `hsla(${hue}, 100%, 80%, ${0.4 - i * 0.1})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Headlights (front right)
      const hlGrad = ctx.createRadialGradient(200, 0, 0, 200, 0, 50);
      hlGrad.addColorStop(0, "rgba(255, 255, 200, 1)");
      hlGrad.addColorStop(0.3, "rgba(255, 220, 100, 0.8)");
      hlGrad.addColorStop(1, "transparent");
      ctx.fillStyle = hlGrad;
      ctx.beginPath();
      ctx.ellipse(210, -5, 25, 14, -0.2, 0, Math.PI * 2);
      ctx.fill();

      // Headlight beam
      ctx.save();
      ctx.globalAlpha = 0.15 + Math.sin(time * 2) * 0.05;
      const beamGrad = ctx.createLinearGradient(235, -5, 600, 60);
      beamGrad.addColorStop(0, "rgba(255, 255, 200, 0.8)");
      beamGrad.addColorStop(1, "transparent");
      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.moveTo(235, -20);
      ctx.lineTo(600, -60);
      ctx.lineTo(600, 60);
      ctx.lineTo(235, 10);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Tail light (back left)
      ctx.save();
      ctx.globalAlpha = 0.7 + Math.sin(time * 3) * 0.3;
      const tlGrad = ctx.createRadialGradient(-230, 5, 0, -230, 5, 40);
      tlGrad.addColorStop(0, "rgba(255, 50, 0, 1)");
      tlGrad.addColorStop(1, "transparent");
      ctx.fillStyle = tlGrad;
      ctx.beginPath();
      ctx.ellipse(-230, 5, 20, 10, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Front wheel
      const wheelFX = 160, wheelY = 50, wheelR = 45;
      drawWheel(ctx, wheelFX, wheelY, wheelR, time, hue);

      // Rear wheel
      const wheelRX = -140;
      drawWheel(ctx, wheelRX, wheelY, wheelR, time, hue);

      // Spoiler
      ctx.beginPath();
      ctx.moveTo(-200, -30);
      ctx.lineTo(-250, -60);
      ctx.lineTo(-220, -60);
      ctx.lineTo(-175, -35);
      ctx.closePath();
      ctx.fillStyle = `hsl(${hue}, 80%, 25%)`;
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-250, -60);
      ctx.lineTo(-220, -60);
      ctx.strokeStyle = `hsla(${hue}, 100%, 70%, 0.9)`;
      ctx.lineWidth = 3;
      ctx.stroke();

      // Exhaust sparks
      if (Math.random() < 0.3) {
        spawnParticle(
          cx + (-240 + (Math.random() - 0.5) * 20) * scale,
          cy + (bob + 30 + (Math.random() - 0.5) * 15) * scale,
          `hsl(${15 + Math.random() * 30}, 100%, 60%)`
        );
      }

      ctx.restore();
    };

    const drawWheel = (
      c: CanvasRenderingContext2D,
      x: number, y: number, r: number,
      time: number, hue: number
    ) => {
      c.save();
      c.translate(x, y);

      // Tire
      c.beginPath();
      c.arc(0, 0, r, 0, Math.PI * 2);
      c.fillStyle = "#111";
      c.fill();
      c.strokeStyle = "#222";
      c.lineWidth = 4;
      c.stroke();

      // Rim
      c.save();
      c.rotate(time * 3);
      const rimGrad = c.createRadialGradient(0, 0, r * 0.3, 0, 0, r * 0.85);
      rimGrad.addColorStop(0, `hsl(${hue}, 60%, 55%)`);
      rimGrad.addColorStop(0.5, `hsl(${hue}, 70%, 35%)`);
      rimGrad.addColorStop(1, `hsl(${hue}, 50%, 20%)`);
      c.fillStyle = rimGrad;
      c.beginPath();
      c.arc(0, 0, r * 0.85, 0, Math.PI * 2);
      c.fill();

      // Spokes
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        c.beginPath();
        c.moveTo(Math.cos(angle) * r * 0.25, Math.sin(angle) * r * 0.25);
        c.lineTo(Math.cos(angle) * r * 0.8, Math.sin(angle) * r * 0.8);
        c.strokeStyle = `hsla(${hue}, 100%, 70%, 0.8)`;
        c.lineWidth = 4;
        c.stroke();
      }

      // Center cap
      c.beginPath();
      c.arc(0, 0, r * 0.22, 0, Math.PI * 2);
      c.fillStyle = `hsl(${hue}, 100%, 60%)`;
      c.fill();
      c.restore();

      // Brake disc glow
      c.save();
      c.globalAlpha = 0.4;
      const discGrad = c.createRadialGradient(0, 0, r * 0.3, 0, 0, r * 0.7);
      discGrad.addColorStop(0, `hsla(${hue}, 100%, 60%, 0.5)`);
      discGrad.addColorStop(1, "transparent");
      c.fillStyle = discGrad;
      c.beginPath();
      c.arc(0, 0, r * 0.7, 0, Math.PI * 2);
      c.fill();
      c.restore();

      c.restore();
    };

    // Grid road
    const drawRoad = (time: number) => {
      const centerY = H * 0.62;
      const roadGrad = ctx.createLinearGradient(0, centerY - 80, 0, centerY + 120);
      roadGrad.addColorStop(0, "rgba(15,15,20,0)");
      roadGrad.addColorStop(0.3, "rgba(15,15,25,0.9)");
      roadGrad.addColorStop(1, "rgba(5,5,10,1)");
      ctx.fillStyle = roadGrad;
      ctx.fillRect(0, centerY - 80, W, 200);

      // Road lines (perspective)
      ctx.save();
      ctx.globalAlpha = 0.3;
      const vp = { x: W / 2, y: centerY - 40 };
      for (let i = -8; i <= 8; i++) {
        const offset = ((time * 200) % 300) - 150;
        const startX = vp.x + i * 400;
        ctx.beginPath();
        ctx.moveTo(startX, vp.y);
        ctx.lineTo(vp.x + i * 40 + (i > 0 ? offset : -offset) * 0.1, centerY + 150);
        ctx.strokeStyle = "rgba(255, 106, 0, 0.6)";
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Dashed center line
      for (let d = 0; d < 12; d++) {
        const progress = ((d / 12) + (time * 0.5 % 1));
        const frac = progress % 1;
        const px = vp.x + (frac - 0.5) * 600;
        const py = vp.y + frac * (centerY + 150 - vp.y);
        const w = frac * 10;
        ctx.fillStyle = `rgba(255, 200, 0, ${0.8 * (1 - frac)})`;
        ctx.fillRect(px - w / 2, py - 2, w, 4);
      }
      ctx.restore();
    };

    // Background stars/city lights
    const drawBg = (time: number) => {
      ctx.fillStyle = "#050507";
      ctx.fillRect(0, 0, W, H);

      // Gradient sky
      const skyGrad = ctx.createLinearGradient(0, 0, 0, H * 0.6);
      skyGrad.addColorStop(0, "#020208");
      skyGrad.addColorStop(0.6, "#08080f");
      skyGrad.addColorStop(1, "#0a080a");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, W, H * 0.7);

      // Stars
      ctx.save();
      const seed = 42;
      for (let i = 0; i < 120; i++) {
        const sx = ((seed * (i + 1) * 2654435761) >>> 0) % W;
        const sy = ((seed * (i + 3) * 1234567891) >>> 0) % (H * 0.55);
        const brightness = 0.4 + ((seed * (i + 7) * 987654321) >>> 0) % 100 / 160;
        const flicker = 0.8 + Math.sin(time * (1 + (i % 5) * 0.3) + i) * 0.2;
        ctx.beginPath();
        ctx.arc(sx, sy, ((seed * (i + 2) * 1111111111) >>> 0) % 2 + 0.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 210, 255, ${brightness * flicker})`;
        ctx.fill();
      }
      ctx.restore();

      // City skyline silhouette
      ctx.save();
      ctx.fillStyle = "#080810";
      const buildings = [
        [50, 140], [90, 110], [140, 160], [200, 90], [260, 130],
        [320, 80], [380, 120], [440, 70], [500, 140], [560, 95],
        [620, 160], [680, 85], [740, 130], [800, 100], [860, 145],
        [920, 75], [980, 120], [W - 100, 100], [W - 50, 160]
      ];
      const groundY = H * 0.55;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      buildings.forEach(([bx, bh]) => {
        const w = 30 + Math.random() * 20;
        ctx.rect(bx - w / 2, groundY - bh, w, bh);
      });
      ctx.fill();

      // City glow on horizon
      const horizGrad = ctx.createLinearGradient(0, H * 0.5, 0, H * 0.6);
      horizGrad.addColorStop(0, "rgba(255, 60, 0, 0.08)");
      horizGrad.addColorStop(1, "transparent");
      ctx.fillStyle = horizGrad;
      ctx.fillRect(0, H * 0.5, W, H * 0.1);

      ctx.restore();
    };

    // Update & draw particles
    const updateParticles = () => {
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.speedX;
        p.y += p.speedY;
        p.life -= 1 / p.maxLife;
        p.speedY -= 0.05;
        if (p.life <= 0) { particles.splice(i, 1); continue; }
        ctx.save();
        ctx.globalAlpha = p.life * 0.9;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();
      }
    };

    // Speed lines
    const drawSpeedLines = (time: number) => {
      ctx.save();
      ctx.globalAlpha = 0.12;
      for (let i = 0; i < 20; i++) {
        const y = (H * 0.3) + (i / 20) * (H * 0.4);
        const speed = (1 - Math.abs(i / 20 - 0.5) * 2) * 300;
        const offset = (time * speed) % W;
        const len = 80 + speed * 0.5;
        ctx.beginPath();
        ctx.moveTo((-offset % W + W) % W - len, y);
        ctx.lineTo((-offset % W + W) % W, y);
        ctx.strokeStyle = "rgba(255, 100, 0, 0.8)";
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
      ctx.restore();
    };

    const render = (timestamp: number) => {
      t = timestamp / 1000;
      drawBg(t);
      drawSpeedLines(t);
      drawRoad(t);
      const carScale = Math.min(W / 900, 1.4);
      drawCar(W * 0.5, H * 0.6, carScale, 20 + Math.sin(t * 0.1) * 10, t);
      updateParticles();
      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.heroCanvas} />;
}

/* ─── NAV ─── */
function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scroll = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className={`${styles.nav} ${scrolled ? styles.navScrolled : ""}`}>
      <div className={styles.navLogo} onClick={() => scroll("hero")}>
        <span className={styles.logoMoto}>MOTO</span>
        <span className={styles.logoVibez}>VIBEZ</span>
      </div>
      <div className={styles.navLinks}>
        {["services", "gallery", "about", "contact"].map((s) => (
          <button key={s} className={styles.navLink} onClick={() => scroll(s)}>
            {s.toUpperCase()}
          </button>
        ))}
      </div>
      <button className={styles.navCta} onClick={() => scroll("contact")}>
        BOOK NOW
      </button>
    </nav>
  );
}

/* ─── HERO ─── */
function Hero() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(t);
  }, []);

  const scroll = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="hero" className={styles.heroSection}>
      <HeroCarCanvas />

      <div className={`${styles.heroContent} ${visible ? styles.heroVisible : ""}`}>
        <div className={styles.heroBadge}>
          <span className={styles.badgeDot} />
          KARNAL&apos;S #1 DETAILING STUDIO
        </div>

        <h1 className={styles.heroTitle}>
          <span className={styles.heroLine1}>TRANSFORM</span>
          <span className={styles.heroLine2}>YOUR RIDE</span>
          <span className={styles.heroLine3}>INTO ART</span>
        </h1>

        <p className={styles.heroSub}>
          Premium wraps · Expert detailing · Custom builds
          <br />
          <span className={styles.heroLocation}>📍 Namaste Chowk, Karnal, Haryana</span>
        </p>

        <div className={styles.heroCtas}>
          <button className={styles.ctaPrimary} onClick={() => scroll("contact")}>
            <span className={styles.ctaInner}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.5 12a19.79 19.79 0 01-3.07-8.67A2 2 0 013.4 1.09h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 8.91a16 16 0 006 6l1.19-1.19a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 15.92z" />
              </svg>
              CALL US NOW
            </span>
          </button>
          <button className={styles.ctaSecondary} onClick={() => scroll("services")}>
            <span>EXPLORE SERVICES</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className={styles.heroStats}>
          {[["500+", "Cars Wrapped"], ["5★", "Google Rating"], ["8+", "Years Experience"]].map(([num, label]) => (
            <div key={label} className={styles.heroStat}>
              <span className={styles.statNum}>{num}</span>
              <span className={styles.statLabel}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.heroScroll} onClick={() => scroll("services")}>
        <div className={styles.scrollDot} />
        <span>SCROLL</span>
      </div>
    </section>
  );
}

/* ─── SERVICES ─── */
const SERVICES = [
  {
    icon: "🎨",
    title: "VINYL WRAPS",
    desc: "Full body wraps, partial wraps, colour change — any shade, any finish. Matte, gloss, chrome, carbon fibre.",
    price: "Starting ₹35,000",
    accent: "#ff6a00",
  },
  {
    icon: "✨",
    title: "PAINT PROTECTION",
    desc: "PPF & ceramic coating to keep your paint flawless for years. Military-grade protection meets showroom shine.",
    price: "Starting ₹18,000",
    accent: "#00d4ff",
  },
  {
    icon: "🔆",
    title: "DETAILING & POLISH",
    desc: "Deep cut, machine polish, paint correction & interior detailing. We bring back the mirror finish.",
    price: "Starting ₹5,000",
    accent: "#ffd700",
  },
  {
    icon: "🚘",
    title: "CUSTOM GRAPHICS",
    desc: "Race stripes, brand decals, custom artwork — designed in-house and applied to perfection.",
    price: "Starting ₹8,000",
    accent: "#ff2d55",
  },
  {
    icon: "💎",
    title: "CHROME DELETE",
    desc: "Replace factory chrome with blacked-out, body-coloured or tinted vinyl for a stealthy modern look.",
    price: "Starting ₹4,500",
    accent: "#a855f7",
  },
  {
    icon: "🌟",
    title: "HEADLIGHT TINT",
    desc: "Smoked, tinted or coloured headlight & tail-light overlays. Transform the face of your car.",
    price: "Starting ₹2,500",
    accent: "#10b981",
  },
];

function Services() {
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add(styles.cardVisible);
      }),
      { threshold: 0.15 }
    );
    refs.current.forEach((r) => r && obs.observe(r));
    return () => obs.disconnect();
  }, []);

  return (
    <section id="services" className={styles.section}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionTag}>WHAT WE DO</span>
        <h2 className={styles.sectionTitle}>OUR SERVICES</h2>
        <p className={styles.sectionSub}>Every service crafted for the passionate car owner</p>
      </div>

      <div className={styles.servicesGrid}>
        {SERVICES.map((s, i) => (
          <div
            key={s.title}
            ref={(el) => { refs.current[i] = el; }}
            className={styles.serviceCard}
            style={{ "--card-accent": s.accent, "--delay": `${i * 0.1}s` } as React.CSSProperties}
          >
            <div className={styles.cardGlow} />
            <span className={styles.cardIcon}>{s.icon}</span>
            <h3 className={styles.cardTitle}>{s.title}</h3>
            <p className={styles.cardDesc}>{s.desc}</p>
            <span className={styles.cardPrice}>{s.price}</span>
            <div className={styles.cardLine} />
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── GALLERY — visual car gallery with CSS 3D ─── */
function GalleryCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const raf = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let W = (canvas.width = canvas.offsetWidth);
    let H = (canvas.height = canvas.offsetHeight);
    let t = 0;

    const resize = () => {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", resize);

    const WRAPS = [
      { color: "#ff6a00", name: "CHROME ORANGE WRAP", label: "CUSTOMER BUILD" },
      { color: "#00d4ff", name: "ELECTRIC BLUE SHIFT", label: "SHOW CAR" },
      { color: "#a855f7", name: "MIDNIGHT PURPLE", label: "FULL WRAP" },
      { color: "#10b981", name: "MATRIX GREEN", label: "PPF + WRAP" },
      { color: "#ff2d55", name: "CANDY RED GLOSS", label: "CUSTOM JOB" },
    ];

    const drawShowcase = (time: number) => {
      ctx.clearRect(0, 0, W, H);

      // BG
      ctx.fillStyle = "#060608";
      ctx.fillRect(0, 0, W, H);

      const active = Math.floor(time * 0.4) % WRAPS.length;
      const wrap = WRAPS[active];
      const frac = (time * 0.4) % 1;

      // Ambient glow
      const glow = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.6);
      glow.addColorStop(0, `${wrap.color}18`);
      glow.addColorStop(1, "transparent");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, H);

      // Transition fade
      if (frac < 0.15 || frac > 0.85) {
        ctx.fillStyle = `rgba(6,6,8,${frac < 0.15 ? 1 - frac / 0.15 : (frac - 0.85) / 0.15})`;
        ctx.fillRect(0, 0, W, H);
      }

      // Mini car silhouette (simplified)
      const cx = W / 2, cy = H * 0.5;
      const sc = Math.min(W, H) / 500;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(sc, sc);

      // Spotlight
      const spot = ctx.createRadialGradient(0, -50, 0, 0, -50, 300);
      spot.addColorStop(0, `${wrap.color}30`);
      spot.addColorStop(1, "transparent");
      ctx.fillStyle = spot;
      ctx.beginPath();
      ctx.arc(0, -50, 300, 0, Math.PI * 2);
      ctx.fill();

      // Car body
      ctx.beginPath();
      ctx.moveTo(-200, 30);
      ctx.lineTo(-180, -20);
      ctx.lineTo(-120, -60);
      ctx.lineTo(-50, -90);
      ctx.lineTo(60, -90);
      ctx.lineTo(140, -55);
      ctx.lineTo(195, -10);
      ctx.lineTo(200, 30);
      ctx.closePath();

      const bodyGrad = ctx.createLinearGradient(0, -90, 0, 30);
      bodyGrad.addColorStop(0, wrap.color);
      bodyGrad.addColorStop(0.5, `${wrap.color}99`);
      bodyGrad.addColorStop(1, `${wrap.color}44`);
      ctx.fillStyle = bodyGrad;
      ctx.fill();
      ctx.strokeStyle = `${wrap.color}cc`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Glass
      ctx.beginPath();
      ctx.moveTo(-100, -60);
      ctx.lineTo(-60, -120);
      ctx.lineTo(40, -125);
      ctx.lineTo(100, -90);
      ctx.lineTo(115, -60);
      ctx.closePath();
      ctx.fillStyle = "rgba(0,200,255,0.18)";
      ctx.fill();
      ctx.strokeStyle = "rgba(0,200,255,0.5)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Wheels
      [[-140, 45], [140, 45]].forEach(([wx, wy]) => {
        ctx.beginPath();
        ctx.arc(wx, wy, 40, 0, Math.PI * 2);
        ctx.fillStyle = "#111";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(wx, wy, 30, 0, Math.PI * 2);
        ctx.fillStyle = `${wrap.color}88`;
        ctx.fill();
      });

      // Label
      ctx.restore();

      ctx.font = `bold ${Math.min(W * 0.06, 48)}px 'Bebas Neue', sans-serif`;
      ctx.fillStyle = wrap.color;
      ctx.textAlign = "center";
      ctx.fillText(wrap.name, W / 2, H * 0.82);

      ctx.font = `${Math.min(W * 0.025, 18)}px 'Rajdhani', sans-serif`;
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.letterSpacing = "4px";
      ctx.fillText(wrap.label, W / 2, H * 0.89);

      // Dots
      WRAPS.forEach((_, di) => {
        const dx = W / 2 + (di - 2) * 22;
        const dy = H * 0.95;
        ctx.beginPath();
        ctx.arc(dx, dy, di === active ? 6 : 3.5, 0, Math.PI * 2);
        ctx.fillStyle = di === active ? wrap.color : "rgba(255,255,255,0.25)";
        ctx.fill();
      });
    };

    const loop = (ts: number) => {
      t = ts / 1000;
      drawShowcase(t);
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.galleryCanvas} />;
}

function Gallery() {
  return (
    <section id="gallery" className={styles.section}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionTag}>OUR WORK</span>
        <h2 className={styles.sectionTitle}>GALLERY</h2>
        <p className={styles.sectionSub}>Real builds. Real transformations.</p>
      </div>
      <div className={styles.galleryWrap}>
        <GalleryCanvas />
        <div className={styles.galleryText}>
          <p>Every car that leaves our studio tells a story. From subtle matte blacks to full chrome transforms — we&apos;ve done it all.</p>
          <a href="tel:08901086801" className={styles.galleryLink}>
            See more on WhatsApp →
          </a>
        </div>
      </div>
    </section>
  );
}

/* ─── WHY US ─── */
const WHY = [
  { icon: "🏆", title: "8+ Years of Excellence", desc: "Serving Karnal and North Haryana since 2016" },
  { icon: "🔬", title: "Premium Materials Only", desc: "3M, Avery, KPMF — we never compromise on quality" },
  { icon: "👨‍🔧", title: "Certified Technicians", desc: "Factory-trained installers with flawless precision" },
  { icon: "📸", title: "Documenting Every Step", desc: "Full progress photos so you're always in the loop" },
];

function WhyUs() {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setVis(true);
    }, { threshold: 0.2 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="about" className={styles.whySection} ref={ref}>
      <div className={styles.whyBg} />
      <div className={styles.sectionHeader}>
        <span className={styles.sectionTag}>WHY MOTOVIBEZ</span>
        <h2 className={styles.sectionTitle}>THE DIFFERENCE</h2>
      </div>
      <div className={styles.whyGrid}>
        {WHY.map((w, i) => (
          <div
            key={w.title}
            className={`${styles.whyCard} ${vis ? styles.whyVisible : ""}`}
            style={{ "--delay": `${i * 0.15}s` } as React.CSSProperties}
          >
            <span className={styles.whyIcon}>{w.icon}</span>
            <h3 className={styles.whyTitle}>{w.title}</h3>
            <p className={styles.whyDesc}>{w.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── PROCESS ─── */
const STEPS = [
  { n: "01", title: "CONSULTATION", desc: "Share your vision — in person or via WhatsApp. We design together." },
  { n: "02", title: "DESIGN PREVIEW", desc: "We mock up your car digitally so you see the result before we start." },
  { n: "03", title: "PREPARATION", desc: "Deep clean, decontamination, and surface prep for perfect adhesion." },
  { n: "04", title: "INSTALLATION", desc: "Our experts apply every panel with precision in a dust-free studio." },
  { n: "05", title: "REVEAL", desc: "Collect your transformed ride. We think you&apos;re going to love it." },
];

function Process() {
  return (
    <section className={styles.processSection}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionTag}>HOW IT WORKS</span>
        <h2 className={styles.sectionTitle}>THE PROCESS</h2>
      </div>
      <div className={styles.processLine}>
        {STEPS.map((s, i) => (
          <div key={s.n} className={styles.processStep} style={{ "--i": i } as React.CSSProperties}>
            <div className={styles.stepNum}>{s.n}</div>
            <div className={styles.stepContent}>
              <h4 className={styles.stepTitle}>{s.title}</h4>
              <p className={styles.stepDesc}>{s.desc}</p>
            </div>
            {i < STEPS.length - 1 && <div className={styles.stepArrow}>→</div>}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── CONTACT ─── */
function Contact() {
  const [formState, setFormState] = useState({ name: "", phone: "", service: "", msg: "" });
  const [sent, setSent] = useState(false);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormState((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = encodeURIComponent(
      `Hi MOTOVIBEZ! 👋\n\nName: ${formState.name}\nPhone: ${formState.phone}\nService: ${formState.service}\nMessage: ${formState.msg}`
    );
    window.open(`https://wa.me/918901086801?text=${text}`, "_blank");
    setSent(true);
  };

  return (
    <section id="contact" className={styles.contactSection}>
      <div className={styles.contactGlow} />
      <div className={styles.sectionHeader}>
        <span className={styles.sectionTag}>GET IN TOUCH</span>
        <h2 className={styles.sectionTitle}>BOOK YOUR SLOT</h2>
        <p className={styles.sectionSub}>Ready to transform your ride? Let&apos;s make it happen.</p>
      </div>

      <div className={styles.contactGrid}>
        <div className={styles.contactInfo}>
          <div className={styles.contactItem}>
            <span className={styles.contactItemIcon}>📍</span>
            <div>
              <strong>Studio Address</strong>
              <p>Shop No. 455, Namaste Chowk<br />Old Grand Trunk Road, Sham Nagar<br />Karnal, Haryana 132001</p>
            </div>
          </div>
          <div className={styles.contactItem}>
            <span className={styles.contactItemIcon}>📞</span>
            <div>
              <strong>Call / WhatsApp</strong>
              <a href="tel:08901086801" className={styles.contactPhone}>089010 86801</a>
            </div>
          </div>
          <div className={styles.contactItem}>
            <span className={styles.contactItemIcon}>🌐</span>
            <div>
              <strong>Website</strong>
              <a href="https://motovibez.in" target="_blank" rel="noreferrer" className={styles.contactWeb}>motovibez.in</a>
            </div>
          </div>
          <div className={styles.contactItem}>
            <span className={styles.contactItemIcon}>⏰</span>
            <div>
              <strong>Studio Hours</strong>
              <p>Mon–Sat: 9:00 AM – 6:30 PM<br />Sunday: By Appointment</p>
            </div>
          </div>

          <div className={styles.contactCtas}>
            <a href="tel:08901086801" className={styles.ctaPrimary}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.5 12a19.79 19.79 0 01-3.07-8.67A2 2 0 013.4 1.09h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 8.91a16 16 0 006 6l1.19-1.19a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 15.92z" />
              </svg>
              CALL NOW
            </a>
            <a href="https://wa.me/918901086801" target="_blank" rel="noreferrer" className={styles.ctaWhatsapp}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M11.995 0C5.372 0 0 5.373 0 12c0 2.117.553 4.102 1.518 5.826L.057 23.625a.75.75 0 00.918.918l5.8-1.461A11.944 11.944 0 0011.995 24c6.623 0 12-5.373 12-12S18.618 0 11.995 0zm0 21.818a9.723 9.723 0 01-4.956-1.354l-.355-.212-3.683.927.946-3.588-.231-.368A9.727 9.727 0 012.182 12c0-5.413 4.4-9.818 9.813-9.818S21.818 6.587 21.818 12 17.408 21.818 11.995 21.818z" />
              </svg>
              WHATSAPP
            </a>
          </div>
        </div>

        <form className={styles.contactForm} onSubmit={handleSubmit}>
          {sent && (
            <div className={styles.successMsg}>
              ✅ Opening WhatsApp — see you soon!
            </div>
          )}
          <div className={styles.formGroup}>
            <input
              name="name"
              placeholder="Your Name"
              value={formState.name}
              onChange={handleChange}
              required
              className={styles.formInput}
            />
          </div>
          <div className={styles.formGroup}>
            <input
              name="phone"
              type="tel"
              placeholder="Phone Number"
              value={formState.phone}
              onChange={handleChange}
              required
              className={styles.formInput}
            />
          </div>
          <div className={styles.formGroup}>
            <select
              name="service"
              value={formState.service}
              onChange={handleChange}
              required
              className={styles.formSelect}
            >
              <option value="">Select Service</option>
              <option>Vinyl Wrap</option>
              <option>Paint Protection Film</option>
              <option>Ceramic Coating</option>
              <option>Car Detailing</option>
              <option>Custom Graphics</option>
              <option>Chrome Delete</option>
              <option>Headlight Tint</option>
              <option>Other</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <textarea
              name="msg"
              placeholder="Tell us about your car and what you have in mind..."
              value={formState.msg}
              onChange={handleChange}
              rows={4}
              className={styles.formTextarea}
            />
          </div>
          <button type="submit" className={styles.formSubmit}>
            SEND VIA WHATSAPP
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </form>
      </div>
    </section>
  );
}

/* ─── FOOTER ─── */
function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerTop}>
        <div className={styles.footerBrand}>
          <span className={styles.logoMoto}>MOTO</span>
          <span className={styles.logoVibez}>VIBEZ</span>
          <p>The Detailing Studio</p>
        </div>
        <div className={styles.footerLinks}>
          <strong>Quick Links</strong>
          {["Services", "Gallery", "About", "Contact"].map((l) => (
            <a key={l} href={`#${l.toLowerCase()}`}>{l}</a>
          ))}
        </div>
        <div className={styles.footerContact}>
          <strong>Contact</strong>
          <a href="tel:08901086801">089010 86801</a>
          <a href="https://motovibez.in">motovibez.in</a>
          <span>Karnal, Haryana 132001</span>
        </div>
      </div>
      <div className={styles.footerBottom}>
        <span>© {new Date().getFullYear()} MOTOVIBEZ. All rights reserved.</span>
        <span>Crafted with 🔥 in Karnal</span>
      </div>
    </footer>
  );
}

/* ─── APP ─── */
export default function MotovibezApp() {
  return (
    <>
      <Cursor />
      <Nav />
      <main>
        <Hero />
        <Services />
        <Gallery />
        <WhyUs />
        <Process />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
