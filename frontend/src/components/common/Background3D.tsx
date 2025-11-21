import React, { useEffect, useRef } from 'react';

const Background3D: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number;
      y: number;
      z: number;
      vx: number;
      vy: number;
      vz: number;
    }> = [];

    // Create particles
    for (let i = 0; i < 100; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * 1000,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        vz: Math.random() * 2,
      });
    }

    let animationId: number;
    const animate = () => {
      ctx.fillStyle = 'rgba(10, 10, 10, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle, i) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.z -= particle.vz;

        if (particle.z <= 0) {
          particle.z = 1000;
          particle.x = Math.random() * canvas.width;
          particle.y = Math.random() * canvas.height;
        }

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        const scale = 1000 / (1000 + particle.z);
        const x2d = particle.x * scale + canvas.width / 2 * (1 - scale);
        const y2d = particle.y * scale + canvas.height / 2 * (1 - scale);
        const radius = Math.max(1, 3 * scale);

        const gradient = ctx.createRadialGradient(x2d, y2d, 0, x2d, y2d, radius * 2);
        gradient.addColorStop(0, `rgba(59, 130, 246, ${0.6 * scale})`);
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x2d, y2d, radius * 2, 0, Math.PI * 2);
        ctx.fill();

        // Connect nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const other = particles[j];
          const dx = particle.x - other.x;
          const dy = particle.y - other.y;
          const dz = particle.z - other.z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < 150) {
            ctx.strokeStyle = `rgba(59, 130, 246, ${0.1 * (1 - dist / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(x2d, y2d);
            const otherScale = 1000 / (1000 + other.z);
            const ox2d = other.x * otherScale + canvas.width / 2 * (1 - otherScale);
            const oy2d = other.y * otherScale + canvas.height / 2 * (1 - otherScale);
            ctx.lineTo(ox2d, oy2d);
            ctx.stroke();
          }
        }
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 opacity-0 dark:opacity-40"
      />
      
      {/* Animated mesh gradient background */}
      <div className="absolute inset-0 bg-mesh-gradient opacity-30 dark:opacity-100" />
      
      {/* Morphing orbs with depth */}
      <div className="absolute top-20 -left-20 w-[600px] h-[600px] bg-gradient-to-br from-brand-accent/30 to-purple-500/20 rounded-full blur-3xl animate-float opacity-0 dark:opacity-30 animate-morph" />
      <div className="absolute bottom-20 -right-40 w-[500px] h-[500px] bg-gradient-to-br from-purple-500/25 to-brand-cyan/20 rounded-full blur-3xl animate-float opacity-0 dark:opacity-25 animate-morph" style={{ animationDelay: '2s', animationDirection: 'reverse' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-br from-brand-cyan/20 to-brand-accent/25 rounded-full blur-3xl animate-float opacity-0 dark:opacity-20 animate-morph" style={{ animationDelay: '4s' }} />
      
      {/* Rotating geometric shapes */}
      <div className="absolute top-40 right-1/4 w-32 h-32 border-2 border-brand-accent/20 opacity-0 dark:opacity-10 animate-rotate-y" style={{ transform: 'rotateX(45deg)' }} />
      <div className="absolute bottom-60 left-1/3 w-24 h-24 border-2 border-purple-500/20 opacity-0 dark:opacity-10 animate-rotate-y" style={{ animationDelay: '3s', transform: 'rotateY(45deg)' }} />
      
      {/* Grid pattern with perspective */}
      <div className="absolute inset-0 bg-grid-pattern opacity-0 dark:opacity-[0.04]" style={{ backgroundSize: '60px 60px', transform: 'perspective(1000px) rotateX(60deg)', transformOrigin: 'center bottom' }} />
      
      {/* Multi-layer gradient overlays for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-accent/5 via-transparent to-purple-500/5 opacity-0 dark:opacity-100" />
      <div className="absolute inset-0 bg-gradient-to-t from-brand-darker via-transparent to-transparent opacity-0 dark:opacity-100" />
      <div className="absolute inset-0 bg-gradient-to-b from-brand-darker/50 via-transparent to-brand-darker/80 opacity-0 dark:opacity-100" />
      
      {/* Radial gradient spotlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-radial-gradient from-transparent via-transparent to-brand-darker opacity-0 dark:opacity-60" />
    </div>
  );
};

export default Background3D;
