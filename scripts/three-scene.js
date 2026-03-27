// ── Hero canvas: smooth particle network (neural-graph style) ─────────────────
// Uses plain Canvas 2D — no Three.js squares, crisp circles with connecting lines

(function () {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // ── Config ────────────────────────────────────────────────────────────────
    const CONFIG = {
        particleCount: 90,
        connectionDistance: 160,
        mouseRadius: 180,
        baseSpeed: 0.28,
        colors: ['#6366f1', '#8b5cf6', '#ec4899', '#a78bfa', '#c084fc'],
        minRadius: 1.5,
        maxRadius: 3.5,
    };

    let W = 0, H = 0;
    let mouse = { x: -9999, y: -9999 };
    let particles = [];
    let animId;

    // ── Resize ─────────────────────────────────────────────────────────────────
    function resize() {
        const dpr = Math.min(window.devicePixelRatio, 2);
        W = window.innerWidth;
        H = window.innerHeight;
        canvas.width  = W * dpr;
        canvas.height = H * dpr;
        canvas.style.width  = W + 'px';
        canvas.style.height = H + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    // ── Particle ───────────────────────────────────────────────────────────────
    function createParticle() {
        const angle = Math.random() * Math.PI * 2;
        const speed = CONFIG.baseSpeed * (0.5 + Math.random() * 0.8);
        return {
            x: Math.random() * W,
            y: Math.random() * H,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            r: CONFIG.minRadius + Math.random() * (CONFIG.maxRadius - CONFIG.minRadius),
            color: CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)],
            alpha: 0.5 + Math.random() * 0.5,
        };
    }

    function initParticles() {
        particles = [];
        for (let i = 0; i < CONFIG.particleCount; i++) {
            particles.push(createParticle());
        }
    }

    // ── Update ─────────────────────────────────────────────────────────────────
    function update() {
        for (const p of particles) {
            // Mouse repulsion
            const dx = p.x - mouse.x;
            const dy = p.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < CONFIG.mouseRadius) {
                const force = (CONFIG.mouseRadius - dist) / CONFIG.mouseRadius;
                p.vx += (dx / dist) * force * 0.6;
                p.vy += (dy / dist) * force * 0.6;
            }

            // Speed cap
            const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
            if (speed > 2) {
                p.vx = (p.vx / speed) * 2;
                p.vy = (p.vy / speed) * 2;
            }

            // Drift back to base speed
            const targetSpeed = CONFIG.baseSpeed * (0.6 + Math.random() * 0.4);
            p.vx += (p.vx / (speed || 1)) * (targetSpeed - speed) * 0.01;
            p.vy += (p.vy / (speed || 1)) * (targetSpeed - speed) * 0.01;

            p.x += p.vx;
            p.y += p.vy;

            // Wrap edges
            if (p.x < -20)  p.x = W + 20;
            if (p.x > W + 20) p.x = -20;
            if (p.y < -20)  p.y = H + 20;
            if (p.y > H + 20) p.y = -20;
        }
    }

    // ── Draw ───────────────────────────────────────────────────────────────────
    function draw() {
        ctx.clearRect(0, 0, W, H);

        // Draw connections
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const a = particles[i];
                const b = particles[j];
                const dx = a.x - b.x;
                const dy = a.y - b.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < CONFIG.connectionDistance) {
                    const opacity = (1 - dist / CONFIG.connectionDistance) * 0.35;
                    // Gradient line between the two particle colors
                    const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
                    grad.addColorStop(0, hexToRgba(a.color, opacity));
                    grad.addColorStop(1, hexToRgba(b.color, opacity));
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.strokeStyle = grad;
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }
        }

        // Draw particles
        for (const p of particles) {
            // Outer glow
            const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
            glow.addColorStop(0, hexToRgba(p.color, p.alpha * 0.6));
            glow.addColorStop(1, hexToRgba(p.color, 0));
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
            ctx.fillStyle = glow;
            ctx.fill();

            // Core dot
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = hexToRgba(p.color, p.alpha);
            ctx.fill();
        }
    }

    // ── Helpers ────────────────────────────────────────────────────────────────
    function hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r},${g},${b},${alpha})`;
    }

    // ── Loop ───────────────────────────────────────────────────────────────────
    function loop() {
        update();
        draw();
        animId = requestAnimationFrame(loop);
    }

    // ── Mouse ──────────────────────────────────────────────────────────────────
    document.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    document.addEventListener('mouseleave', () => {
        mouse.x = -9999;
        mouse.y = -9999;
    });

    // ── Touch support ──────────────────────────────────────────────────────────
    document.addEventListener('touchmove', (e) => {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
    }, { passive: true });

    window.addEventListener('resize', () => {
        resize();
        initParticles();
    });

    // ── Init ───────────────────────────────────────────────────────────────────
    resize();
    initParticles();
    loop();

    // Stop animation when hero is not visible (performance)
    const heroSection = document.getElementById('home');
    if (heroSection && 'IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                if (!animId) loop();
            } else {
                cancelAnimationFrame(animId);
                animId = null;
            }
        }, { threshold: 0 });
        io.observe(heroSection);
    }
})();
