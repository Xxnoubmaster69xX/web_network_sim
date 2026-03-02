import React, { useEffect, useRef, useState, useCallback } from 'react';

const MAP_SIZE = 16;
const SCREEN_WIDTH = 640;
const SCREEN_HEIGHT = 360;
const FOV = Math.PI / 3;
const BLOCK_SIZE = 64;

// 1 = Wall, 0 = Empty
const MAP = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1], // Pillar 1 & 2
  [1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1], // Pillar 3 & 4
  [1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

interface Sprite {
  x: number;
  y: number;
  active: boolean;
  hitTimer: number; // For flashing red
}

  // Simple DDA line check for wall occlusion
  const checkLineOfSight = (x0: number, y0: number, x1: number, y1: number) => {
      const steps = Math.ceil(Math.sqrt((x1-x0)**2 + (y1-y0)**2)) * 2;
      for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          const x = x0 + (x1 - x0) * t;
          const y = y0 + (y1 - y0) * t;
          if (MAP[Math.floor(y)][Math.floor(x)] === 1) return false;
      }
      return true;
  };

  const DoomGame = ({ onClose }: { onClose: () => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [targetsDestroyed, setTargetsDestroyed] = useState(0);
  const [totalTargets, setTotalTargets] = useState(0);
  
  // Game State Refs (to avoid closure staleness in loop)
  const playerRef = useRef({ x: 8.0, y: 2.0, dir: Math.PI / 2, rot: 0 }); // Start in middle bottom facing up
  const keysRef = useRef({ w: false, s: false, a: false, d: false, left: false, right: false, shoot: false });
  const weaponRef = useRef({ firing: false, recoil: 0, flash: 0 });
  const spritesRef = useRef<Sprite[]>([]);
  const zBufferRef = useRef<number[]>(new Array(SCREEN_WIDTH).fill(0));

  // Initialize Targets
  useEffect(() => {
    const newSprites: Sprite[] = [];
    // Spawn 5-7 targets at the far end (top of map, y > 10)
    const count = 5 + Math.floor(Math.random() * 3);
    setTotalTargets(count);
    
    for (let i = 0; i < count; i++) {
      newSprites.push({
        x: 2 + Math.random() * 12,
        y: 12 + Math.random() * 3,
        active: true,
        hitTimer: 0
      });
    }
    spritesRef.current = newSprites;
  }, []);

  const shoot = useCallback(() => {
    weaponRef.current.firing = true;
    weaponRef.current.recoil = 15; // Push gun down
    weaponRef.current.flash = 5;   // Flash frames

    // Hitscan logic
    const player = playerRef.current;
    
    let hitIndex = -1;
    let closestDist = Infinity;

    spritesRef.current.forEach((sprite, index) => {
      if (!sprite.active) return;

      const dx = sprite.x - player.x;
      const dy = sprite.y - player.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      
      // Calculate angle to sprite
      let spriteAngle = Math.atan2(dy, dx) - player.dir;
      while (spriteAngle < -Math.PI) spriteAngle += 2 * Math.PI;
      while (spriteAngle > Math.PI) spriteAngle -= 2 * Math.PI;

      // Check if within "aim" cone
      const hitThreshold = 0.3 / Math.max(1, dist);

      if (Math.abs(spriteAngle) < hitThreshold && dist < closestDist) {
        if (checkLineOfSight(player.x, player.y, sprite.x, sprite.y)) {
            closestDist = dist;
            hitIndex = index;
        }
      }
    });

    if (hitIndex !== -1) {
      const sprite = spritesRef.current[hitIndex];
      sprite.hitTimer = 10;
      
      setTimeout(() => {
          if (spritesRef.current[hitIndex]) {
             spritesRef.current[hitIndex].active = false;
             setTargetsDestroyed(prev => prev + 1);
          }
      }, 100);
    }

    setTimeout(() => {
        weaponRef.current.firing = false;
    }, 200);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;

    let animationFrameId: number;
    const keys = keysRef.current;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'w' || e.key === 'W') keys.w = true;
      if (e.key === 's' || e.key === 'S') keys.s = true;
      if (e.key === 'a' || e.key === 'A') keys.a = true;
      if (e.key === 'd' || e.key === 'D') keys.d = true;
      if (e.key === 'ArrowLeft') keys.left = true;
      if (e.key === 'ArrowRight') keys.right = true;
      if (e.key === ' ' || e.key === 'Control') keys.shoot = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'w' || e.key === 'W') keys.w = false;
      if (e.key === 's' || e.key === 'S') keys.s = false;
      if (e.key === 'a' || e.key === 'A') keys.a = false;
      if (e.key === 'd' || e.key === 'D') keys.d = false;
      if (e.key === 'ArrowLeft') keys.left = false;
      if (e.key === 'ArrowRight') keys.right = false;
      if (e.key === ' ' || e.key === 'Control') keys.shoot = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const update = () => {
      const player = playerRef.current;
      const weapon = weaponRef.current;

      const moveSpeed = 0.08;
      const rotSpeed = 0.04;

      // Movement
      if (keys.w) {
        if (MAP[Math.floor(player.y + Math.sin(player.dir) * moveSpeed * 2)][Math.floor(player.x + Math.cos(player.dir) * moveSpeed * 2)] === 0) {
            player.x += Math.cos(player.dir) * moveSpeed;
            player.y += Math.sin(player.dir) * moveSpeed;
        }
      }
      if (keys.s) {
        if (MAP[Math.floor(player.y - Math.sin(player.dir) * moveSpeed * 2)][Math.floor(player.x - Math.cos(player.dir) * moveSpeed * 2)] === 0) {
            player.x -= Math.cos(player.dir) * moveSpeed;
            player.y -= Math.sin(player.dir) * moveSpeed;
        }
      }
      if (keys.a) {
        if (MAP[Math.floor(player.y - Math.cos(player.dir) * moveSpeed * 2)][Math.floor(player.x + Math.sin(player.dir) * moveSpeed * 2)] === 0) {
            player.x += Math.sin(player.dir) * moveSpeed;
            player.y -= Math.cos(player.dir) * moveSpeed;
        }
      }
      if (keys.d) {
        if (MAP[Math.floor(player.y + Math.cos(player.dir) * moveSpeed * 2)][Math.floor(player.x - Math.sin(player.dir) * moveSpeed * 2)] === 0) {
            player.x -= Math.sin(player.dir) * moveSpeed;
            player.y += Math.cos(player.dir) * moveSpeed;
        }
      }

      // Rotation
      if (keys.left) player.dir -= rotSpeed;
      if (keys.right) player.dir += rotSpeed;

      // Shooting
      if (keys.shoot && !weapon.firing) {
          shoot();
      }

      // Weapon Animation
      if (weapon.recoil > 0) weapon.recoil -= 2;
      if (weapon.flash > 0) weapon.flash--;

      // --- RENDERING ---

      // 1. Ceiling & Floor
      ctx.fillStyle = '#5a5040'; 
      ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT / 2);
      ctx.fillStyle = '#3a5a80'; 
      ctx.fillRect(0, SCREEN_HEIGHT / 2, SCREEN_WIDTH, SCREEN_HEIGHT / 2);

      // 2. Raycasting Walls
      for (let x = 0; x < SCREEN_WIDTH; x+=2) {
        const rayAngle = (player.dir - FOV / 2.0) + (x / SCREEN_WIDTH) * FOV;
        const eyeX = Math.cos(rayAngle);
        const eyeY = Math.sin(rayAngle);

        let distToWall = 0;
        let hitWall = false;
        let side = 0;

        let testX = Math.floor(player.x);
        let testY = Math.floor(player.y);
        
        let stepX = eyeX < 0 ? -1 : 1;
        let stepY = eyeY < 0 ? -1 : 1;
        
        let sideDistX = (eyeX < 0 ? player.x - testX : testX + 1 - player.x) / Math.abs(eyeX);
        let sideDistY = (eyeY < 0 ? player.y - testY : testY + 1 - player.y) / Math.abs(eyeY);
        
        let deltaDistX = Math.abs(1 / eyeX);
        let deltaDistY = Math.abs(1 / eyeY);

        while (!hitWall && distToWall < 20) {
            if (sideDistX < sideDistY) {
                sideDistX += deltaDistX;
                testX += stepX;
                side = 0;
            } else {
                sideDistY += deltaDistY;
                testY += stepY;
                side = 1;
            }

            if (testX < 0 || testX >= MAP_SIZE || testY < 0 || testY >= MAP_SIZE) {
                hitWall = true;
                distToWall = 20;
            } else if (MAP[testY][testX] > 0) {
                hitWall = true;
                if (side === 0) distToWall = (testX - player.x + (1 - stepX) / 2) / eyeX;
                else           distToWall = (testY - player.y + (1 - stepY) / 2) / eyeY;
            }
        }

        const perpDist = distToWall * Math.cos(rayAngle - player.dir);
        zBufferRef.current[x] = perpDist;
        zBufferRef.current[x+1] = perpDist;

        const ceiling = SCREEN_HEIGHT / 2.0 - SCREEN_HEIGHT / perpDist;
        const floor = SCREEN_HEIGHT - ceiling;
        const wallHeight = floor - ceiling;

        let colorVal = side === 1 ? 180 : 140;
        colorVal = Math.max(20, colorVal - perpDist * 8);
        const colorHex = `rgb(${colorVal}, ${colorVal}, ${colorVal})`;

        ctx.fillStyle = colorHex;
        ctx.fillRect(x, ceiling, 2, wallHeight);
      }

      // 3. Sprites (Targets)
      const spritesToDraw = spritesRef.current
        .map(sprite => {
            const dx = sprite.x - player.x;
            const dy = sprite.y - player.y;
            return { ...sprite, dist: Math.sqrt(dx*dx + dy*dy) };
        })
        .sort((a, b) => b.dist - a.dist);

      spritesToDraw.forEach(sprite => {
          if (!sprite.active) return;

          const dx = sprite.x - player.x;
          const dy = sprite.y - player.y;

          const spriteAngle = Math.atan2(dy, dx) - player.dir;
          let angleDiff = spriteAngle;
          while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
          while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;

          if (Math.abs(angleDiff) < FOV / 1.5) {
             const dist = sprite.dist;
             const screenX = (0.5 * (angleDiff / (FOV / 2)) + 0.5) * SCREEN_WIDTH;
             const spriteHeight = Math.abs(SCREEN_HEIGHT / dist);
             const spriteWidth = spriteHeight * 0.6;
             const spriteTop = (SCREEN_HEIGHT - spriteHeight) / 2;

             const checkX = Math.floor(Math.max(0, Math.min(SCREEN_WIDTH - 1, screenX)));
             if (dist < zBufferRef.current[checkX]) {
                 ctx.fillStyle = sprite.hitTimer > 0 ? '#ff0000' : '#228822';
                 ctx.fillRect(screenX - spriteWidth/2, spriteTop + spriteHeight * 0.2, spriteWidth, spriteHeight * 0.8);
                 ctx.fillStyle = sprite.hitTimer > 0 ? '#ff0000' : '#aa8866';
                 ctx.fillRect(screenX - spriteWidth/3, spriteTop, spriteWidth/1.5, spriteHeight * 0.2);
                 
                 if (dist < 8 && sprite.hitTimer === 0) {
                     ctx.fillStyle = '#ff0000';
                     ctx.fillRect(screenX - spriteWidth/6, spriteTop + spriteHeight * 0.05, spriteWidth/8, spriteHeight * 0.05);
                     ctx.fillRect(screenX + spriteWidth/12, spriteTop + spriteHeight * 0.05, spriteWidth/8, spriteHeight * 0.05);
                 }
                 
                 if (sprite.hitTimer > 0) sprite.hitTimer--;
             }
          }
      });

      // 4. Weapon
      const gunOffset = weapon.recoil;
      const centerX = SCREEN_WIDTH / 2;
      const bottomY = SCREEN_HEIGHT;

      ctx.fillStyle = '#555';
      ctx.fillRect(centerX - 30, bottomY - 140 + gunOffset, 60, 140);
      ctx.fillStyle = '#333';
      ctx.fillRect(centerX - 10, bottomY - 140 + gunOffset, 20, 140);
      ctx.fillStyle = '#111';
      ctx.fillRect(centerX - 5, bottomY - 140 + gunOffset, 10, 140);
      
      if (weapon.flash > 0) {
          ctx.fillStyle = `rgba(255, 255, 0, ${weapon.flash / 5})`;
          ctx.beginPath();
          ctx.arc(centerX, bottomY - 150 + gunOffset, 30 + Math.random() * 20, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.fillStyle = `rgba(255, 255, 255, ${weapon.flash / 5})`;
          ctx.beginPath();
          ctx.arc(centerX, bottomY - 150 + gunOffset, 15, 0, Math.PI * 2);
          ctx.fill();
      }

      // 5. UI
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX - 8, SCREEN_HEIGHT / 2);
      ctx.lineTo(centerX + 8, SCREEN_HEIGHT / 2);
      ctx.moveTo(centerX, SCREEN_HEIGHT / 2 - 8);
      ctx.lineTo(centerX, SCREEN_HEIGHT / 2 + 8);
      ctx.stroke();

      const gradient = ctx.createRadialGradient(centerX, SCREEN_HEIGHT/2, SCREEN_HEIGHT/3, centerX, SCREEN_HEIGHT/2, SCREEN_HEIGHT);
      gradient.addColorStop(0, 'transparent');
      gradient.addColorStop(1, 'rgba(0,0,0,0.5)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

      animationFrameId = requestAnimationFrame(update);
    };

    update();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationFrameId);
    };
  }, [shoot]);

  return (
    <div className="flex flex-col items-center justify-center h-full bg-[#0D0D0D] text-white p-0 relative overflow-hidden">
      <div className="absolute top-4 left-4 z-10 font-mono text-[#D71920] text-xl tracking-widest uppercase bg-black/50 p-2 rounded border border-[#D71920]/50">
        Targets Destroyed: {targetsDestroyed} / {totalTargets}
      </div>
      
      <canvas 
        ref={canvasRef} 
        width={SCREEN_WIDTH} 
        height={SCREEN_HEIGHT} 
        className="w-full h-full object-contain bg-black"
      />
      
      <div className="absolute bottom-4 left-4 z-10 font-mono text-white/50 text-xs bg-black/50 p-2 rounded pointer-events-none">
        Controls: WASD to Move • Arrows to Turn • Space/Ctrl to Shoot
      </div>

      <button 
        onClick={onClose}
        className="absolute top-4 right-4 z-30 px-4 py-1 bg-[#D71920] hover:bg-[#B01218] text-white font-dot uppercase tracking-widest transition-colors text-xs border border-white/20"
      >
        Exit
      </button>
    </div>
  );
};

export default DoomGame;
