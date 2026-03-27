const COLORS = ["#f59e0b", "#ef4444", "#8b5cf6", "#10b981", "#3b82f6", "#ec4899", "#f97316"];

export function spawnConfetti(x: number, y: number) {
  const container = document.createElement("div");
  container.style.cssText = `position:fixed;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:9999;overflow:hidden;`;
  document.body.appendChild(container);

  const count = 18;
  for (let i = 0; i < count; i++) {
    const particle = document.createElement("div");
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const size = 4 + Math.random() * 4;
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
    const velocity = 60 + Math.random() * 80;
    const dx = Math.cos(angle) * velocity;
    const dy = Math.sin(angle) * velocity - 40; // bias upward
    const rotation = Math.random() * 360;

    particle.style.cssText = `
      position:absolute;
      left:${x}px;
      top:${y}px;
      width:${size}px;
      height:${size}px;
      background:${color};
      border-radius:${Math.random() > 0.5 ? "50%" : "1px"};
      opacity:1;
      transform:rotate(${rotation}deg);
      pointer-events:none;
    `;

    container.appendChild(particle);

    // Animate
    const start = performance.now();
    const duration = 800 + Math.random() * 400;

    function animate(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      const currentX = x + dx * eased;
      const currentY = y + dy * eased + 120 * progress * progress; // gravity
      const currentOpacity = 1 - progress;
      const currentRotation = rotation + 360 * progress;

      particle.style.left = `${currentX}px`;
      particle.style.top = `${currentY}px`;
      particle.style.opacity = String(currentOpacity);
      particle.style.transform = `rotate(${currentRotation}deg) scale(${1 - progress * 0.5})`;

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
  }

  // Cleanup
  setTimeout(() => {
    container.remove();
  }, 1500);
}
