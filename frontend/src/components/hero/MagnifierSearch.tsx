import { useEffect, useRef, useCallback } from "react";

interface Card {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  lines: number[];
}

interface Vec2 {
  x: number;
  y: number;
}

const CARDS: Card[] = [
  { id: 0, x: 21, y: 28, w: 130, h: 88, lines: [70, 90, 55] },
  { id: 1, x: 38, y: 20, w: 130, h: 88, lines: [80, 60] },
  { id: 2, x: 57, y: 24, w: 130, h: 88, lines: [65, 85, 50] },
  { id: 3, x: 70, y: 36, w: 130, h: 88, lines: [75, 55, 80] },
  { id: 4, x: 35, y: 46, w: 130, h: 88, lines: [60, 80, 45] },
  { id: 5, x: 52, y: 48, w: 130, h: 88, lines: [85, 65] },
  { id: 6, x: 22, y: 62, w: 130, h: 88, lines: [70, 50, 90] },
  { id: 7, x: 40, y: 70, w: 130, h: 88, lines: [55, 75] },
  { id: 8, x: 63, y: 68, w: 130, h: 88, lines: [80, 60, 70] },
];

const VISIT_ORDER = [1, 2, 3, 5, 8, 7, 6, 0, 4, 1];
const LENS_R = 72;
const HANDLE_LEN = 68;
const HANDLE_W = 9;
const BORDER_W = 10;
const ANIM_DURATION = 14000;
const SAFE_PAD = 120;
const SCENE_OFFSET_X = 36;
const SCENE_OFFSET_Y = 0;

const easeInOutQuart = (t: number) =>
  t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export default function MagnifierSearch() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number | null>(null);

  const getCardCenter = useCallback(
    (card: Card, W: number, H: number): Vec2 => ({
      x: (card.x / 100) * W + SCENE_OFFSET_X,
      y: (card.y / 100) * H + SCENE_OFFSET_Y,
    }),
    [],
  );

  const draw = useCallback(
    (timestamp: number) => {
      if (document.hidden) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const W = canvas.width;
      const H = canvas.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      if (!startRef.current) startRef.current = timestamp;
      const elapsed = (timestamp - startRef.current) % ANIM_DURATION;
      const globalT = elapsed / ANIM_DURATION;

      const N = VISIT_ORDER.length - 1;
      const segT = globalT * N;
      const segIdx = Math.min(Math.floor(segT), N - 1);
      const localT = segT - segIdx;

      const fromCard = CARDS[VISIT_ORDER[segIdx]];
      const toCard = CARDS[VISIT_ORDER[segIdx + 1]];
      const fromPos = getCardCenter(fromCard, W, H);
      const toPos = getCardCenter(toCard, W, H);

      let eased: number;
      if (localT < 0.25) {
        eased = 0;
      } else if (localT > 0.75) {
        eased = 1;
      } else {
        eased = easeInOutQuart((localT - 0.25) / 0.5);
      }

      let lensX = lerp(fromPos.x, toPos.x, eased);
      let lensY = lerp(fromPos.y, toPos.y, eased);

      lensX = clamp(lensX, SAFE_PAD, W - SAFE_PAD);
      lensY = clamp(lensY, SAFE_PAD, H - SAFE_PAD);

      const dx = toPos.x - fromPos.x;
      const dy = toPos.y - fromPos.y;
      const movingAngle = Math.atan2(dy, dx);
      const baseAngle = Math.PI / 4 + Math.PI / 2;
      const blendedAngle =
        eased < 0.1 || eased > 0.9
          ? baseAngle
          : lerp(baseAngle, movingAngle + Math.PI / 2, Math.sin(Math.PI * eased) * 0.35);

      ctx.clearRect(0, 0, W, H);

      CARDS.forEach((card) => {
        const cx = (card.x / 100) * W + SCENE_OFFSET_X;
        const cy = (card.y / 100) * H + SCENE_OFFSET_Y;
        const x = cx - card.w / 2;
        const y = cy - card.h / 2;
        drawCard(ctx, x, y, card.w, card.h, card.lines, false);
      });

      ctx.save();
      ctx.beginPath();
      ctx.arc(lensX, lensY, LENS_R, 0, Math.PI * 2);
      ctx.clip();

      ctx.fillStyle = "rgba(15, 10, 20, 0.88)";
      ctx.fillRect(0, 0, W, H);

      CARDS.forEach((card) => {
        const cx = (card.x / 100) * W + SCENE_OFFSET_X;
        const cy = (card.y / 100) * H + SCENE_OFFSET_Y;
        const x = cx - card.w / 2;
        const y = cy - card.h / 2;
        drawCard(ctx, x, y, card.w, card.h, card.lines, true);
      });

      ctx.restore();

      ctx.save();
      ctx.beginPath();
      ctx.arc(lensX, lensY, LENS_R, 0, Math.PI * 2);
      ctx.clip();

      const shine = ctx.createRadialGradient(
        lensX - LENS_R * 0.35,
        lensY - LENS_R * 0.35,
        2,
        lensX - LENS_R * 0.2,
        lensY - LENS_R * 0.2,
        LENS_R * 0.65,
      );
      shine.addColorStop(0, "rgba(255,255,255,0.18)");
      shine.addColorStop(0.4, "rgba(255,255,255,0.04)");
      shine.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = shine;
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.translate(lensX - LENS_R * 0.28, lensY - LENS_R * 0.3);
      ctx.rotate(-0.5);
      ctx.scale(1, 0.45);
      ctx.beginPath();
      ctx.arc(0, 0, LENS_R * 0.22, 0, Math.PI * 2);
      const gleam = ctx.createRadialGradient(0, 0, 0, 0, 0, LENS_R * 0.22);
      gleam.addColorStop(0, "rgba(255,255,255,0.55)");
      gleam.addColorStop(0.6, "rgba(255,255,255,0.1)");
      gleam.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = gleam;
      ctx.fill();
      ctx.restore();
      ctx.restore();

      ctx.beginPath();
      ctx.arc(lensX, lensY, LENS_R + BORDER_W / 2 - 1, 0, Math.PI * 2);
      ctx.strokeStyle = "#c0152a";
      ctx.lineWidth = BORDER_W;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(lensX, lensY, LENS_R - 1, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(0,0,0,0.45)";
      ctx.lineWidth = 3;
      ctx.stroke();

      const hStartX = lensX + Math.cos(blendedAngle) * (LENS_R + BORDER_W - 2);
      const hStartY = lensY + Math.sin(blendedAngle) * (LENS_R + BORDER_W - 2);
      const hEndX = hStartX + Math.cos(blendedAngle) * HANDLE_LEN;
      const hEndY = hStartY + Math.sin(blendedAngle) * HANDLE_LEN;

      ctx.beginPath();
      ctx.moveTo(hStartX + 2, hStartY + 2);
      ctx.lineTo(hEndX + 2, hEndY + 2);
      ctx.strokeStyle = "rgba(0,0,0,0.25)";
      ctx.lineWidth = HANDLE_W + 2;
      ctx.lineCap = "round";
      ctx.stroke();

      const hGrad = ctx.createLinearGradient(hStartX, hStartY, hEndX, hEndY);
      hGrad.addColorStop(0, "#c0152a");
      hGrad.addColorStop(0.6, "#8b0f1e");
      hGrad.addColorStop(1, "#4a0a10");
      ctx.beginPath();
      ctx.moveTo(hStartX, hStartY);
      ctx.lineTo(hEndX, hEndY);
      ctx.strokeStyle = hGrad;
      ctx.lineWidth = HANDLE_W;
      ctx.lineCap = "round";
      ctx.stroke();

      for (let i = 0; i < 3; i++) {
        const rt = 0.55 + i * 0.12;
        const rx = lerp(hStartX, hEndX, rt);
        const ry = lerp(hStartY, hEndY, rt);
        const perp = blendedAngle + Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(
          rx + Math.cos(perp) * (HANDLE_W / 2 - 1),
          ry + Math.sin(perp) * (HANDLE_W / 2 - 1),
        );
        ctx.lineTo(
          rx - Math.cos(perp) * (HANDLE_W / 2 - 1),
          ry - Math.sin(perp) * (HANDLE_W / 2 - 1),
        );
        ctx.strokeStyle = "rgba(255,255,255,0.2)";
        ctx.lineWidth = 1.5;
        ctx.lineCap = "butt";
        ctx.stroke();
      }

      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.35)";
      ctx.shadowBlur = 18;
      ctx.shadowOffsetX = 4;
      ctx.shadowOffsetY = 6;
      ctx.beginPath();
      ctx.arc(lensX, lensY, LENS_R + BORDER_W, 0, Math.PI * 2);
      ctx.strokeStyle = "transparent";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      rafRef.current = requestAnimationFrame(draw);
    },
    [getCardCenter],
  );

  useEffect(() => {
    const resize = () => {
      const c = containerRef.current;
      const canvas = canvasRef.current;
      if (!c || !canvas) return;
      canvas.width = c.clientWidth;
      canvas.height = c.clientHeight;
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [draw]);

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden rounded-[28px]">
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}

function drawCard(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  lines: number[],
  dark: boolean,
) {
  const r = 8;

  ctx.save();
  ctx.shadowColor = dark ? "rgba(255,40,60,0.25)" : "rgba(0,0,0,0.25)";
  ctx.shadowBlur = dark ? 12 : 8;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 3;

  roundRect(ctx, x, y, w, h, r);
  ctx.fillStyle = dark ? "#140f1f" : "#2f3a4a";
  ctx.fill();
  ctx.restore();

  roundRect(ctx, x, y, w, h, r);
  ctx.strokeStyle = dark ? "rgba(180,20,40,0.5)" : "rgba(255,255,255,0.07)";
  ctx.lineWidth = dark ? 1.5 : 1;
  ctx.stroke();

  const padX = w * 0.13;
  const padY = h * 0.22;
  const lineH = (h - padY * 2) / (lines.length + 0.5);

  lines.forEach((pct, i) => {
    const lx = x + padX;
    const ly = y + padY + i * lineH;
    const lw = (w - padX * 2) * (pct / 100);
    const lh = lineH * 0.32;
    roundRect(ctx, lx, ly, lw, lh, lh / 2);
    ctx.fillStyle = dark
      ? i === 0
        ? "rgba(255,70,80,0.9)"
        : "rgba(255,70,80,0.5)"
      : i === 0
        ? "rgba(255,255,255,0.6)"
        : "rgba(255,255,255,0.28)";
    ctx.fill();
  });
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}