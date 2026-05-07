import React, { useEffect, useRef } from 'react';
import './Aurora.css';

export const Aurora = ({ colorStops = ["#0F265C", "#D4AF37", "#F7F1E8", "#9A6A4F"] }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    const drawAurora = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Create gradient
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      
      colorStops.forEach((color, index) => {
        const offset = index / (colorStops.length - 1);
        gradient.addColorStop(offset, color);
      });

      // Draw animated waves
      ctx.fillStyle = gradient;
      ctx.globalAlpha = 0.15;

      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        
        for (let x = 0; x < canvas.width; x += 10) {
          const y = Math.sin((x + time * (0.5 + i * 0.2)) * 0.01) * 50 * (i + 1) + 
                    Math.sin((x + time * (0.3 + i * 0.15)) * 0.005) * 30 * (i + 1) +
                    canvas.height / 2;
          
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        
        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.closePath();
        ctx.fill();
      }

      time += 0.5;
      animationFrameId = requestAnimationFrame(drawAurora);
    };

    drawAurora();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [colorStops]);

  return <canvas ref={canvasRef} className="aurora-canvas" />;
};

