import React, { useEffect, useRef } from 'react';
import { useChatStore } from '../store';
import { Tv, MonitorOff, Play, ShieldAlert } from 'lucide-react';

export const ScreenshareFeed: React.FC = () => {
  const { isScreensharing, toggleScreenshare } = useChatStore();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!isScreensharing || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let angleX = 0.8;
    let angleY = 1.2;
    let angleZ = 0.5;

    // Cube vertices
    const size = 60;
    const vertices = [
      [-size, -size, -size],
      [size, -size, -size],
      [size, size, -size],
      [-size, size, -size],
      [-size, -size, size],
      [size, -size, size],
      [size, size, size],
      [-size, size, size]
    ];

    // Connect vertices by edges
    const edges = [
      [0, 1], [1, 2], [2, 3], [3, 0], // back
      [4, 5], [5, 6], [6, 7], [7, 4], // front
      [0, 4], [1, 5], [2, 6], [3, 7]  // connect
    ];

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = 180; // fixed premium banner height
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Create glowing space background
      const grad = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 10,
        canvas.width / 2, canvas.height / 2, Math.max(canvas.width, 300) / 1.5
      );
      grad.addColorStop(0, '#1a1c23');
      grad.addColorStop(1, '#0b0c0f');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw cyber grid background lines
      ctx.strokeStyle = 'rgba(88, 101, 242, 0.05)';
      ctx.lineWidth = 1;
      const step = 20;
      for (let x = 0; x < canvas.width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Rotate coordinates
      const projected: [number, number][] = [];
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      const radX = (angleX * Math.PI) / 180;
      const radY = (angleY * Math.PI) / 180;
      const radZ = (angleZ * Math.PI) / 180;

      const cosX = Math.cos(radX), sinX = Math.sin(radX);
      const cosY = Math.cos(radY), sinY = Math.sin(radY);
      const cosZ = Math.cos(radZ), sinZ = Math.sin(radZ);

      vertices.forEach(([x, y, z]) => {
        // Rotate X
        let y1 = y * cosX - z * sinX;
        let z1 = y * sinX + z * cosX;

        // Rotate Y
        let x2 = x * cosY + z1 * sinY;
        let z2 = -x * sinY + z1 * cosY;

        // Rotate Z
        let x3 = x2 * cosZ - y1 * sinZ;
        let y3 = x2 * sinZ + y1 * cosZ;

        // Perspective projection
        const distance = 200;
        const scale = distance / (distance + z2);
        projected.push([cx + x3 * scale, cy + y3 * scale]);
      });

      // Draw edges with glowing neon blue/purple lines
      ctx.lineWidth = 2.5;
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#5865f2';

      edges.forEach(([u, v]) => {
        const [x1, y1] = projected[u];
        const [x2, y2] = projected[v];
        
        ctx.strokeStyle = '#5865f2';
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      });

      // Draw vertices with neon green dots
      ctx.shadowColor = '#23a55a';
      ctx.fillStyle = '#23a55a';
      projected.forEach(([x, y]) => {
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      });

      // Reset shadows for other draws
      ctx.shadowBlur = 0;

      // Draw HUD text on canvas
      ctx.fillStyle = 'rgba(235, 237, 239, 0.4)';
      ctx.font = 'bold 9px monospace';
      ctx.fillText('STREAM_FEED_1080P: OK', 20, 25);
      ctx.fillText(`ROT_X: ${angleX.toFixed(1)}°`, 20, 38);
      ctx.fillText(`ROT_Y: ${angleY.toFixed(1)}°`, 20, 51);

      // Increment rotation angles
      angleX = (angleX + 0.6) % 360;
      angleY = (angleY + 0.9) % 360;
      angleZ = (angleZ + 0.4) % 360;

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [isScreensharing]);

  if (!isScreensharing) return null;

  return (
    <div className="w-full bg-[#111214] border-b border-[#1f2023] flex flex-col relative group select-none">
      {/* Canvas */}
      <div className="relative w-full h-[180px] overflow-hidden">
        <canvas ref={canvasRef} className="block w-full h-full" />

        {/* HUD top bar overlay */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          {/* Live indicator */}
          <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-[#f23f43] uppercase tracking-wider border border-[#f23f43]/25">
            <span className="w-2 h-2 rounded-full bg-[#f23f43] animate-pulse" /> Live Screenshare
          </div>
        </div>

        {/* HUD center title */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="bg-black/65 px-4 py-2 rounded-lg border border-[#5865f2]/20 text-center backdrop-blur-xs">
            <div className="text-white text-xs font-bold tracking-wide flex items-center gap-1.5 justify-center">
              <Tv className="w-4 h-4 text-[#5865f2]" /> You are sharing your screen
            </div>
            <div className="text-[10px] text-[#949ba4] mt-0.5">
              Others in the voice channel can now see your screen feed
            </div>
          </div>
        </div>

        {/* HUD bottom controls overlay */}
        <div className="absolute bottom-3 right-3">
          <button
            onClick={toggleScreenshare}
            className="flex items-center gap-1.5 bg-[#f23f43] hover:bg-red-600 text-white font-bold text-[10px] uppercase py-1.5 px-3 rounded shadow transition-all focus:outline-none"
          >
            <MonitorOff className="w-3.5 h-3.5" /> Stop Sharing
          </button>
        </div>
      </div>
    </div>
  );
};
