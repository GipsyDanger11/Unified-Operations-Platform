import { useEffect, useRef } from "react";

export default function WaveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    setCanvasSize();
    window.addEventListener("resize", setCanvasSize);

    let animationFrameId: number;
    let time = 0;

    const animate = () => {
      time += 0.003;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Wave parameters
      const waves = [
        { amplitude: 40, frequency: 0.005, speed: 0.5, opacity: 0.08, color: "#8B5CF6" },
        { amplitude: 50, frequency: 0.007, speed: 0.7, opacity: 0.06, color: "#A78BFA" },
        { amplitude: 35, frequency: 0.006, speed: 0.4, opacity: 0.05, color: "#C4B5FD" },
        { amplitude: 45, frequency: 0.008, speed: 0.6, opacity: 0.07, color: "#6D28D9" },
      ];

      waves.forEach((wave, index) => {
        ctx.beginPath();
        const yOffset = canvas.height * 0.3 + index * 80;

        for (let x = 0; x < canvas.width; x++) {
          const y =
            yOffset +
            Math.sin(x * wave.frequency + time * wave.speed) * wave.amplitude +
            Math.sin(x * wave.frequency * 0.5 + time * wave.speed * 1.5) * (wave.amplitude * 0.5);

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.closePath();

        ctx.fillStyle = `${wave.color}${Math.floor(wave.opacity * 255).toString(16).padStart(2, "0")}`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", setCanvasSize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{
        background: "linear-gradient(135deg, #F5F3FF 0%, #E9D5FF 50%, #DDD6FE 100%)",
      }}
    />
  );
}
