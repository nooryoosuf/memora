// Refined luxury confetti celebration in warm champagne, soft gold, and muted sage
export function triggerCelebration(container?: HTMLElement | null) {
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.inset = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9999';
  (container || document.body).appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  const width = window.innerWidth;
  const height = window.innerHeight;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);

  const colors = [
    '#C5A880', // champagne gold
    '#D4AF37', // soft gold
    '#8A9A7E', // muted sage
    '#DFD3C3', // warm cream
    '#FAF8F5', // ivory
    '#B39164', // rich bronze
  ];

  interface Particle {
    x: number;
    y: number;
    size: number;
    color: string;
    vx: number;
    vy: number;
    rotation: number;
    vRot: number;
    opacity: number;
    shape: 'rect' | 'circle';
  }

  const particles: Particle[] = [];
  const particleCount = 85;

  for (let i = 0; i < particleCount; i++) {
    const angle = Math.random() * Math.PI - Math.PI / 2; // Fan out upwards
    const speed = 7 + Math.random() * 9;
    particles.push({
      x: width / 2 + (Math.random() - 0.5) * 120,
      y: height * 0.65,
      size: 6 + Math.random() * 8,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 3,
      vy: Math.sin(angle) * speed - 6,
      rotation: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 10,
      opacity: 1,
      shape: Math.random() > 0.4 ? 'rect' : 'circle',
    });
  }

  let animationId: number;
  const gravity = 0.22;
  const drag = 0.985;

  const render = () => {
    ctx.clearRect(0, 0, width, height);

    let activeCount = 0;
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += gravity;
      p.vx *= drag;
      p.vy *= drag;
      p.rotation += p.vRot;

      if (p.y > height * 0.4) {
        p.opacity -= 0.008;
      }

      if (p.opacity > 0 && p.y < height + 50) {
        activeCount++;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle = p.color;

        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size * 0.6);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 3, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    }

    if (activeCount > 0) {
      animationId = requestAnimationFrame(render);
    } else {
      cancelAnimationFrame(animationId);
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    }
  };

  render();
}
