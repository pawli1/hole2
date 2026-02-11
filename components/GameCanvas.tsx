import React, { useEffect, useRef, useState, useCallback } from 'react';
import { CONFIG, THEMES, PROP_TYPES, BOT_NAMES, PLAYER_START_RADIUS, MAX_VELOCITY, BOT_VELOCITY, SKINS } from '../constants';
import { Hole, MapProp, PropType, Point, ThemeType } from '../types';

interface GameCanvasProps {
  onGameOver: (score: number, rank: number, winner: string) => void;
  playerName: string;
  selectedSkinId: string;
  theme: ThemeType;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ onGameOver, playerName, selectedSkinId, theme }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  
  // Game State Refs
  const playerRef = useRef<Hole>({
    id: 'player',
    name: playerName || 'Player',
    x: CONFIG.mapWidth / 2,
    y: CONFIG.mapHeight / 2,
    radius: PLAYER_START_RADIUS,
    color: '#000000',
    skin: SKINS.find(s => s.id === selectedSkinId) || SKINS[0],
    score: 0,
    isBot: false,
    velocity: { x: 0, y: 0 }
  });

  const botsRef = useRef<Hole[]>([]);
  const propsRef = useRef<MapProp[]>([]);
  const timeRef = useRef<number>(CONFIG.roundTime);
  const lastTimeRef = useRef<number>(0);
  
  // Input State
  const mouseRef = useRef<Point>({ x: 0, y: 0 });
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const inputModeRef = useRef<'mouse' | 'keyboard'>('mouse');
  
  const cameraRef = useRef<Point>({ x: 0, y: 0 });

  // UI State sync
  const [hudState, setHudState] = useState<{ score: number; time: number; rank: number }>({
    score: 0,
    time: CONFIG.roundTime,
    rank: 1
  });

  const themeConfig = THEMES[theme];

  // --- Initialization ---

  const initGame = useCallback(() => {
    const newProps: MapProp[] = [];

    // Helper to spawn a prop
    const spawn = (type: PropType, shape: 'circle' | 'rect', x: number, y: number, moving: boolean = false) => {
       const config = PROP_TYPES[type as keyof typeof PROP_TYPES];
       // Safety check
       if (!config) return;

       const scaleVar = 0.9 + Math.random() * 0.3;
       const r = config.minRadius * scaleVar;
       
       // Calculate dimensions based on type for variety
       let w = r * 2;
       let h = r * 2;
       
       if (type === PropType.Car || type === PropType.Truck) { w = r * 3.5; h = r * 1.8; }
       if (type === PropType.DinoMedium) { w = r * 3; h = r * 1.5; }
       if (type === PropType.DinoLarge) { w = r * 4; h = r * 2; }
       
       const depth = config.depth * scaleVar;

       let velocity = { x: 0, y: 0 };
       let rotation = Math.random() * Math.PI * 2;

       if (moving) {
           const speed = (Math.random() * 2 + 1);
           if (theme === 'CITY') {
              // Grid movement for cars
              const axis = Math.random() > 0.5 ? 'x' : 'y';
              velocity = axis === 'x' ? { x: speed * (Math.random()>0.5?1:-1), y: 0 } : { x: 0, y: speed * (Math.random()>0.5?1:-1) };
              rotation = axis === 'x' ? 0 : Math.PI / 2;
           } else {
              // Organic movement for animals/dinos
              const angle = Math.random() * Math.PI * 2;
              velocity = { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed };
              rotation = angle;
           }
       } else {
           if (shape === 'rect') rotation = Math.floor(Math.random() * 4) * (Math.PI / 2); // Building alignment
       }
       
       // Colors based on Type
       let color = '#fff';
       if (type === PropType.Tree) color = ['#166534', '#15803d', '#14532d'][Math.floor(Math.random()*3)];
       else if (type === PropType.Rock) color = ['#78716c', '#57534e', '#44403c'][Math.floor(Math.random()*3)];
       else if (type === PropType.Bush) color = '#4d7c0f';
       else if (type === PropType.Cabin) color = '#7c2d12';
       else if (type === PropType.Tent) color = ['#ef4444', '#f97316', '#3b82f6'][Math.floor(Math.random()*3)];
       else if (type === PropType.Fern) color = '#3f6212';
       else if (type === PropType.DinoSmall) color = '#84cc16';
       else if (type === PropType.DinoMedium) color = '#a16207';
       else if (type === PropType.DinoLarge) color = '#78350f';
       else if (type === PropType.DinoEgg) color = '#fef3c7';
       else if (type === PropType.Volcano) color = '#1c1917';
       else if (type === PropType.Bone) color = '#e7e5e4';
       else if (type === PropType.Building || type === PropType.Skyscraper) color = ['#475569', '#334155', '#1e293b'][Math.floor(Math.random()*3)];
       else if (type === PropType.Car) color = ['#ef4444', '#3b82f6', '#fbbf24', '#ffffff'][Math.floor(Math.random()*4)];
       else color = '#94a3b8'; // Default

       newProps.push({
          id: `prop-${type}-${Math.random().toString(36).substr(2, 9)}`,
          x,
          y,
          radius: r,
          width: shape === 'rect' ? w : r,
          height: shape === 'rect' ? h : r,
          depth,
          type,
          points: config.points,
          rotation,
          color,
          shape,
          isFalling: false,
          velocity
       });
    };

    // --- MAP GENERATION ---

    if (theme === 'CITY') {
        // Grid City Layout
        const blockSize = 300;
        const roadWidth = 90;
        
        for (let x = 0; x < CONFIG.mapWidth; x += blockSize) {
            for (let y = 0; y < CONFIG.mapHeight; y += blockSize) {
                const cx = x + blockSize/2;
                const cy = y + blockSize/2;
                // Keep center clear
                if (Math.sqrt((cx - CONFIG.mapWidth/2)**2 + (cy - CONFIG.mapHeight/2)**2) < 300) continue;

                const rand = Math.random();
                if (rand < 0.2) {
                    spawn(PropType.Skyscraper, 'rect', cx, cy);
                } else if (rand < 0.5) {
                    spawn(PropType.Building, 'rect', cx - 50, cy - 50);
                    spawn(PropType.Building, 'rect', cx + 50, cy + 50);
                } else if (rand < 0.8) {
                    spawn(PropType.Store, 'rect', cx, cy);
                    spawn(PropType.Pedestrian, 'circle', cx+40, cy, true);
                    spawn(PropType.Pedestrian, 'circle', cx-40, cy, true);
                } else {
                    spawn(PropType.Pedestrian, 'circle', cx, cy, true);
                    spawn(PropType.Car, 'rect', cx, cy, true); // Parking lot
                }
            }
        }
        // Traffic
        for(let i=0; i<300; i++) {
             const isH = Math.random() > 0.5;
             const px = isH ? Math.random() * CONFIG.mapWidth : (Math.floor(Math.random()*(CONFIG.mapWidth/blockSize))*blockSize);
             const py = !isH ? Math.random() * CONFIG.mapHeight : (Math.floor(Math.random()*(CONFIG.mapHeight/blockSize))*blockSize);
             spawn(Math.random()>0.8?PropType.Truck:PropType.Car, 'rect', px, py, true);
        }

    } else if (theme === 'FOREST') {
        // Organic Clusters
        for (let i = 0; i < 800; i++) {
            const x = Math.random() * CONFIG.mapWidth;
            const y = Math.random() * CONFIG.mapHeight;
            if (Math.sqrt((x - CONFIG.mapWidth/2)**2 + (y - CONFIG.mapHeight/2)**2) < 200) continue;

            const noise = Math.random();
            
            if (noise < 0.02) {
                // Campsite
                spawn(PropType.Cabin, 'rect', x, y);
                spawn(PropType.Tent, 'circle', x + 40, y + 20);
                spawn(PropType.Pedestrian, 'circle', x + 20, y + 50, true); // Hiker
            } else if (noise < 0.3) {
                // Forest Patch
                spawn(PropType.Tree, 'circle', x, y);
                if (Math.random() > 0.5) spawn(PropType.Bush, 'circle', x+20, y+20);
            } else if (noise < 0.35) {
                spawn(PropType.Rock, 'circle', x, y);
            } else if (noise < 0.45) {
                spawn(PropType.Pedestrian, 'circle', x, y, true); // Animals/Hikers
            }
        }

    } else if (theme === 'DINO') {
        // Prehistoric Layout
        for (let i = 0; i < 600; i++) {
            const x = Math.random() * CONFIG.mapWidth;
            const y = Math.random() * CONFIG.mapHeight;
            if (Math.sqrt((x - CONFIG.mapWidth/2)**2 + (y - CONFIG.mapHeight/2)**2) < 200) continue;

            const noise = Math.random();
            
            if (noise < 0.015) {
                spawn(PropType.Volcano, 'circle', x, y);
                spawn(PropType.Rock, 'circle', x+60, y+60);
                spawn(PropType.Rock, 'circle', x-60, y-60);
            } else if (noise < 0.05) {
                // Dino Nest
                spawn(PropType.DinoLarge, 'rect', x, y, true);
                spawn(PropType.DinoEgg, 'circle', x+40, y);
                spawn(PropType.DinoEgg, 'circle', x+50, y+10);
            } else if (noise < 0.25) {
                spawn(PropType.Fern, 'circle', x, y);
            } else if (noise < 0.3) {
                spawn(PropType.Bone, 'rect', x, y);
            } else if (noise < 0.4) {
                spawn(PropType.DinoSmall, 'circle', x, y, true);
            } else if (noise < 0.45) {
                 spawn(PropType.DinoMedium, 'rect', x, y, true);
            }
        }
    }

    propsRef.current = newProps;

    // Reset Bots & Player
    const newBots: Hole[] = [];
    for (let i = 0; i < 7; i++) {
      newBots.push({
        id: `bot-${i}`,
        name: BOT_NAMES[i % BOT_NAMES.length],
        x: Math.random() * CONFIG.mapWidth,
        y: Math.random() * CONFIG.mapHeight,
        radius: PLAYER_START_RADIUS,
        color: '#000000',
        skin: SKINS[Math.floor(Math.random() * SKINS.length)],
        score: 0,
        isBot: true,
        velocity: { x: 0, y: 0 },
        target: { x: Math.random() * CONFIG.mapWidth, y: Math.random() * CONFIG.mapHeight }
      });
    }
    botsRef.current = newBots;
    
    playerRef.current = {
      id: 'player',
      name: playerName || 'You',
      x: CONFIG.mapWidth / 2,
      y: CONFIG.mapHeight / 2,
      radius: PLAYER_START_RADIUS,
      color: '#000000',
      skin: SKINS.find(s => s.id === selectedSkinId) || SKINS[0],
      score: 0,
      isBot: false,
      velocity: { x: 0, y: 0 }
    };

    timeRef.current = CONFIG.roundTime;
    
    // Immediate UI update for reset
    setHudState({ score: 0, time: CONFIG.roundTime, rank: 1 });

  }, [playerName, selectedSkinId, theme]);

  // --- Logic Helpers ---

  const getRank = (holes: Hole[], playerId: string) => {
    const sorted = [...holes].sort((a, b) => b.score - a.score);
    return sorted.findIndex(h => h.id === playerId) + 1;
  };

  const handleRestart = () => {
      initGame();
  };

  // --- Game Loop ---

  const update = (dt: number) => {
    if (timeRef.current <= 0) return;

    // 1. Update Player
    const player = playerRef.current;
    if (player) {
      let vx = 0;
      let vy = 0;

      if (keysRef.current['w'] || keysRef.current['arrowup']) vy -= 1;
      if (keysRef.current['s'] || keysRef.current['arrowdown']) vy += 1;
      if (keysRef.current['a'] || keysRef.current['arrowleft']) vx -= 1;
      if (keysRef.current['d'] || keysRef.current['arrowright']) vx += 1;

      if (vx !== 0 || vy !== 0) {
          inputModeRef.current = 'keyboard';
          const len = Math.sqrt(vx*vx + vy*vy);
          player.x += (vx / len) * MAX_VELOCITY;
          player.y += (vy / len) * MAX_VELOCITY;
      } else if (inputModeRef.current === 'mouse' && canvasRef.current) {
          const cx = canvasRef.current.width / 2;
          const cy = canvasRef.current.height / 2;
          const dx = mouseRef.current.x - cx;
          const dy = mouseRef.current.y - cy;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist > 20) {
              const angle = Math.atan2(dy, dx);
              player.x += Math.cos(angle) * MAX_VELOCITY;
              player.y += Math.sin(angle) * MAX_VELOCITY;
          }
      }

      player.x = Math.max(player.radius, Math.min(CONFIG.mapWidth - player.radius, player.x));
      player.y = Math.max(player.radius, Math.min(CONFIG.mapHeight - player.radius, player.y));
    }

    // 2. Update Bots
    botsRef.current.forEach(bot => {
      if (!bot.target || (Math.abs(bot.x - bot.target.x) < 20 && Math.abs(bot.y - bot.target.y) < 20)) {
        bot.target = { x: Math.random() * CONFIG.mapWidth, y: Math.random() * CONFIG.mapHeight };
      }
      const dx = bot.target.x - bot.x;
      const dy = bot.target.y - bot.y;
      const angle = Math.atan2(dy, dx);
      bot.x += Math.cos(angle) * BOT_VELOCITY;
      bot.y += Math.sin(angle) * BOT_VELOCITY;
      bot.x = Math.max(bot.radius, Math.min(CONFIG.mapWidth - bot.radius, bot.x));
      bot.y = Math.max(bot.radius, Math.min(CONFIG.mapHeight - bot.radius, bot.y));
    });

    const allHoles = [player, ...botsRef.current];

    // 3. Update Props
    propsRef.current.forEach(prop => {
      if (prop.velocity && !prop.isFalling) {
          prop.x += prop.velocity.x;
          prop.y += prop.velocity.y;
          // Wrap around
          if (prop.x < 0) prop.x = CONFIG.mapWidth;
          if (prop.x > CONFIG.mapWidth) prop.x = 0;
          if (prop.y < 0) prop.y = CONFIG.mapHeight;
          if (prop.y > CONFIG.mapHeight) prop.y = 0;
          
          // Random walk jitter for pedestrians/animals
          if ((prop.type === PropType.Pedestrian || prop.type === PropType.DinoSmall) && Math.random() < 0.05) {
               prop.velocity.x = (Math.random() - 0.5) * 0.5;
               prop.velocity.y = (Math.random() - 0.5) * 0.5;
          }
      }

      if (prop.isFalling) {
        if (prop.fallScale !== undefined) {
          prop.fallScale -= 0.08;
          const eater = allHoles.find(h => h.id === prop.fallingTo);
          if (eater) {
             prop.x += (eater.x - prop.x) * 0.15;
             prop.y += (eater.y - prop.y) * 0.15;
          }

          if (prop.fallScale <= 0) {
            const eaterIndex = allHoles.findIndex(h => h.id === prop.fallingTo);
            if (eaterIndex !== -1) {
              const eater = allHoles[eaterIndex];
              const config = PROP_TYPES[prop.type as keyof typeof PROP_TYPES];
              eater.score += config.points;
              // GROWTH RATE INCREASE
              const growth = (config.growth * 5) / (1 + (eater.radius - PLAYER_START_RADIUS) * 0.01);
              eater.radius += Math.max(0.1, growth);
            }
            prop.fallScale = -1; 
          }
        }
        return;
      }

      for (const hole of allHoles) {
        const dist = Math.sqrt((prop.x - hole.x) ** 2 + (prop.y - hole.y) ** 2);
        let propSize = prop.radius;
        if (prop.shape === 'rect') propSize = Math.max(prop.width, prop.height) / 1.5;

        if (hole.radius > propSize + 2) {
           if (dist < hole.radius - propSize * 0.3) {
             prop.isFalling = true;
             prop.fallingTo = hole.id;
             prop.fallScale = 1;
             break;
           }
        }
      }
    });

    propsRef.current = propsRef.current.filter(p => p.fallScale === undefined || p.fallScale > 0);

    // Hole Consumption
    for (let i = 0; i < allHoles.length; i++) {
        for (let j = 0; j < allHoles.length; j++) {
            if (i === j) continue;
            const h1 = allHoles[i];
            const h2 = allHoles[j];
            const dist = Math.sqrt((h1.x - h2.x)**2 + (h1.y - h2.y)**2);
            if (dist < h1.radius) {
                if (h1.radius > h2.radius + 10) {
                   h1.score += Math.floor(h2.score / 2) + 200;
                   h1.radius += 5; // Increased hole eating reward
                   h2.radius = PLAYER_START_RADIUS;
                   h2.score = 0;
                   do {
                       h2.x = Math.random() * CONFIG.mapWidth;
                       h2.y = Math.random() * CONFIG.mapHeight;
                   } while (Math.sqrt((h2.x - h1.x)**2 + (h2.y - h1.y)**2) < 500);
                }
            }
        }
    }

    timeRef.current -= dt / 1000;
    if (timeRef.current <= 0) {
        timeRef.current = 0;
        const sorted = [...allHoles].sort((a, b) => b.score - a.score);
        onGameOver(playerRef.current.score, getRank(allHoles, 'player'), sorted[0].name);
    }
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const player = playerRef.current;
    const cameraX = player.x - canvas.width / 2;
    const cameraY = player.y - canvas.height / 2;
    cameraRef.current.x += (cameraX - cameraRef.current.x) * 0.1;
    cameraRef.current.y += (cameraY - cameraRef.current.y) * 0.1;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(-cameraRef.current.x, -cameraRef.current.y);

    // 1. Ground Layer
    ctx.fillStyle = themeConfig.ground;
    ctx.fillRect(0, 0, CONFIG.mapWidth, CONFIG.mapHeight);

    // Decoration (Roads or Paths)
    if (theme === 'CITY') {
        ctx.fillStyle = themeConfig.road;
        const bs = 300; // BlockSize
        const rw = 90; // RoadWidth
        for (let x = 0; x <= CONFIG.mapWidth; x += bs) ctx.fillRect(x - rw/2, 0, rw, CONFIG.mapHeight);
        for (let y = 0; y <= CONFIG.mapHeight; y += bs) ctx.fillRect(0, y - rw/2, CONFIG.mapWidth, rw);
        
        ctx.fillStyle = themeConfig.roadMarking;
        for (let x = 0; x <= CONFIG.mapWidth; x += bs) {
            for(let i=0; i<CONFIG.mapHeight; i+= 40) if (i % bs > rw) ctx.fillRect(x - 1, i, 2, 20);
        }
        for (let y = 0; y <= CONFIG.mapHeight; y += bs) {
            for(let i=0; i<CONFIG.mapWidth; i+= 40) if (i % bs > rw) ctx.fillRect(i, y - 1, 20, 2);
        }
    } else {
        // Forest / Dino decoration (random dirt patches)
        ctx.fillStyle = themeConfig.road;
        // Simple seeded random spots for texture
        for(let i=0; i<CONFIG.mapWidth; i+=400) {
             for(let j=0; j<CONFIG.mapHeight; j+=400) {
                  const s = (Math.sin(i) + Math.cos(j));
                  if (s > 0.5) {
                      ctx.beginPath();
                      ctx.arc(i + 200, j + 200, 100, 0, Math.PI*2);
                      ctx.fill();
                  }
             }
        }
    }

    // 2. Holes
    const allHoles = [player, ...botsRef.current];
    allHoles.forEach(hole => {
        ctx.beginPath();
        ctx.arc(hole.x, hole.y, hole.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#000000';
        ctx.fill();
        
        const grad = ctx.createLinearGradient(hole.x - hole.radius, hole.y - hole.radius, hole.x + hole.radius, hole.y + hole.radius);
        grad.addColorStop(0, hole.skin.color);
        grad.addColorStop(1, hole.skin.innerColor);
        
        ctx.strokeStyle = grad;
        ctx.lineWidth = 4 + (hole.radius * 0.05);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 3;
        ctx.strokeText(hole.name, hole.x, hole.y - hole.radius - 12);
        ctx.fillText(hole.name, hole.x, hole.y - hole.radius - 12);
    });

    // 3. Falling Props
    propsRef.current.forEach(prop => {
        if (prop.isFalling && prop.fallScale !== undefined) {
             const hole = allHoles.find(h => h.id === prop.fallingTo);
             if (!hole) return;

             ctx.save();
             ctx.beginPath();
             ctx.arc(hole.x, hole.y, hole.radius, 0, Math.PI * 2);
             ctx.clip();
             
             const scale = prop.fallScale;
             ctx.translate(prop.x, prop.y);
             ctx.rotate(prop.rotation);
             ctx.scale(scale, scale);
             drawProp(ctx, prop);
             ctx.restore();
        }
    });

    // 4. Standing Props
    const standingProps = propsRef.current.filter(p => !p.isFalling).sort((a, b) => a.y - b.y);
    standingProps.forEach(prop => {
         drawPseudo3DProp(ctx, prop);
    });

    ctx.restore();
  };

  const drawProp = (ctx: CanvasRenderingContext2D, prop: MapProp) => {
      ctx.fillStyle = prop.color;
      if (prop.shape === 'rect') {
          ctx.fillRect(-prop.width/2, -prop.height/2, prop.width, prop.height);
      } else {
          ctx.beginPath(); ctx.arc(0,0, prop.radius, 0, Math.PI*2); ctx.fill();
      }
  };

  const drawPseudo3DProp = (ctx: CanvasRenderingContext2D, prop: MapProp) => {
      ctx.save();
      const depth = prop.depth;
      const x = prop.x;
      const y = prop.y;
      
      // Rectangular 3D props
      if (prop.shape === 'rect') {
          const w = prop.width;
          const h = prop.height;
          
          // Rotation for vehicles/dinos
          ctx.translate(x, y);
          
          // Shadow
          ctx.fillStyle = 'rgba(0,0,0,0.3)';
          ctx.fillRect(-w/2 + 4, -h/2 + 4, w, h);
          
          ctx.translate(0, -depth); // Lift
          ctx.rotate(prop.rotation);
          
          // Side Walls (Simple approximation)
          ctx.fillStyle = darkenColor(prop.color, 40);
          ctx.fillRect(-w/2, -h/2 + h, w, depth); // Front faceish
          
          // Top Face
          ctx.fillStyle = prop.color;
          ctx.fillRect(-w/2, -h/2, w, h);
          
          // Details
          if (prop.type === PropType.Cabin) {
              // Roof
              ctx.fillStyle = '#3f1d0b';
              ctx.beginPath();
              ctx.moveTo(-w/2, -h/2);
              ctx.lineTo(0, -h/2 - 10);
              ctx.lineTo(w/2, -h/2);
              ctx.fill();
              ctx.fillRect(-w/2, -h/2 + 10, w, h-10); // Body override
          } else if (prop.type === PropType.DinoMedium || prop.type === PropType.DinoLarge) {
              // Head
              ctx.beginPath();
              ctx.arc(w/2, 0, w/4, 0, Math.PI*2);
              ctx.fill();
              // Tail
              ctx.beginPath();
              ctx.moveTo(-w/2, 0); ctx.lineTo(-w, -5); ctx.lineTo(-w, 5); ctx.fill();
          } else if (prop.type === PropType.Car) {
               ctx.fillStyle = '#bae6fd'; // Windshield
               ctx.fillRect(w/4, -h/3, w/5, h/1.5);
          }

      } else {
          // Circular/Organic 3D props
          ctx.fillStyle = 'rgba(0,0,0,0.3)';
          ctx.beginPath(); ctx.arc(x, y, prop.radius, 0, Math.PI*2); ctx.fill();

          ctx.fillStyle = darkenColor(prop.color, 40);
          ctx.fillRect(x - prop.radius, y - depth, prop.radius*2, depth); // Cylinder side
          
          ctx.fillStyle = prop.color;
          
          if (prop.type === PropType.Tree || prop.type === PropType.Fern) {
              // Tree top
              ctx.beginPath();
              ctx.arc(x, y - depth, prop.radius * 1.5, 0, Math.PI*2);
              ctx.fill();
              ctx.fillStyle = darkenColor(ctx.fillStyle as string, -20); // Lighter center
              ctx.beginPath(); ctx.arc(x, y - depth - 5, prop.radius, 0, Math.PI*2); ctx.fill();
          } else if (prop.type === PropType.Volcano) {
              // Cone shape approximation
              ctx.beginPath();
              ctx.moveTo(x - prop.radius, y);
              ctx.lineTo(x + prop.radius, y);
              ctx.lineTo(x, y - depth);
              ctx.fill();
              // Lava top
              ctx.fillStyle = '#ef4444';
              ctx.beginPath(); ctx.arc(x, y - depth, prop.radius/3, 0, Math.PI*2); ctx.fill();
          } else if (prop.type === PropType.Tent) {
              // Triangle tent
              ctx.beginPath();
              ctx.moveTo(x - prop.radius, y);
              ctx.lineTo(x + prop.radius, y);
              ctx.lineTo(x, y - depth);
              ctx.fill();
          } else if (prop.type === PropType.DinoSmall) {
              // Raptor
              ctx.beginPath(); ctx.arc(x, y-depth, prop.radius, 0, Math.PI*2); ctx.fill();
              // Tail
              ctx.beginPath();
              ctx.ellipse(x-10, y-depth, 15, 5, -0.5, 0, Math.PI*2);
              ctx.fill();
          } else {
              // Generic Cylinder top
              ctx.beginPath();
              ctx.arc(x, y - depth, prop.radius, 0, Math.PI*2);
              ctx.fill();
          }
      }
      
      ctx.restore();
  };

  const darkenColor = (color: string, percent: number) => {
    // Simple hex darken
    if (!color || !color.startsWith('#')) return '#000000';
    let num = parseInt(color.replace("#",""), 16),
    amt = Math.round(2.55 * percent),
    R = (num >> 16) - amt,
    G = (num >> 8 & 0x00FF) - amt,
    B = (num & 0x0000FF) - amt;
    return "#" + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (G<255?G<1?0:G:255)*0x100 + (B<255?B<1?0:B:255)).toString(16).slice(1);
  };

  const loop = (timestamp: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = timestamp;
    const dt = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;

    update(dt);
    draw();

    if (Math.random() < 0.1) {
        setHudState({
            score: playerRef.current.score,
            time: Math.ceil(timeRef.current),
            rank: getRank([playerRef.current, ...botsRef.current], 'player')
        });
    }

    if (timeRef.current > 0) {
      requestRef.current = requestAnimationFrame(loop);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
      inputModeRef.current = 'mouse';
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
          mouseRef.current = {
              x: e.clientX - rect.left,
              y: e.clientY - rect.top
          };
      }
  };
  
  const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = true;
  };
  
  const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = false;
  };

  useEffect(() => {
    if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
    }

    const handleResize = () => {
        if (canvasRef.current) {
            canvasRef.current.width = window.innerWidth;
            canvasRef.current.height = window.innerHeight;
        }
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    initGame();
    requestRef.current = requestAnimationFrame(loop);

    return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [initGame, theme]);

  return (
    <div className="relative w-full h-full overflow-hidden" style={{background: themeConfig.ground}}>
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        className="block cursor-crosshair touch-none"
      />
      
      {/* HUD Layer */}
      <div className="absolute top-0 left-0 w-full p-4 pointer-events-none flex justify-between items-start">
        {/* Score & Rank */}
        <div className="flex flex-col gap-2">
            <div className="bg-white/90 backdrop-blur rounded-lg p-3 shadow-lg border-l-4" style={{borderColor: playerRef.current.skin.color}}>
                <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Score</div>
                <div className="text-2xl font-black text-slate-800">{hudState.score}</div>
            </div>
            <div className="bg-white/90 backdrop-blur rounded-lg p-3 shadow-lg border-l-4" style={{borderColor: themeConfig.accent}}>
                <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Rank</div>
                <div className="text-2xl font-black text-slate-800 flex items-baseline">
                    #{hudState.rank} <span className="text-sm font-normal text-slate-400 ml-1">/ 8</span>
                </div>
            </div>
        </div>

        {/* Timer */}
        <div className={`text-4xl font-black px-6 py-2 rounded-full shadow-xl bg-white/90 backdrop-blur
            ${hudState.time < 10 ? 'text-red-500 animate-pulse' : 'text-slate-800'}`}>
            {Math.floor(hudState.time / 60)}:{(hudState.time % 60).toString().padStart(2, '0')}
        </div>
        
        {/* Leaderboard & Controls */}
        <div className="flex flex-col items-end gap-3 pointer-events-auto">
            <button 
                onClick={handleRestart}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                RESET
            </button>
            
            <div className="bg-black/50 backdrop-blur text-white p-3 rounded-lg text-sm max-w-[200px] pointer-events-none">
               <div className="font-bold border-b border-white/20 mb-2 pb-1">Leaderboard</div>
               {[playerRef.current, ...botsRef.current]
                 .sort((a,b) => b.score - a.score)
                 .slice(0, 5)
                 .map((p, i) => (
                     <div key={p.id} className={`flex justify-between gap-4 mb-1 ${p.id === 'player' ? 'text-yellow-400 font-bold' : 'text-slate-200'}`}>
                         <span>{i+1}. {p.name}</span>
                         <span>{p.score}</span>
                     </div>
                 ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default GameCanvas;
