import re

file_path = 'src/stages/stage6_devil/index.js'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# We want to replace everything from `} else if (char === 'O') {` to the end of the file
# with the correct content.
target_str = "} else if (char === 'O') {"
index = content.find(target_str)
if index == -1:
    print('Target not found')
    exit(1)

head = content[:index]

new_code = '''} else if (char === 'O') {
                tiles.push({ type: 'invisible_solid', x, y, w: TILE_SIZE, h: TILE_SIZE, solid: true, revealed: false });
            } else if (char === 'H') {
                entities.push({ type: 'shrink', x, y, w: TILE_SIZE, h: TILE_SIZE });
            } else if (char === 'G') {
                entities.push({ type: 'gravity', x, y, w: TILE_SIZE, h: TILE_SIZE });
            } else if (char === 'L') {
                triggers.wallChaseActive = true;
            } else if (char === 'A') {
                let block = { type: 'magic_platform', x, y, w: TILE_SIZE, h: TILE_SIZE, solid: true, dropped: false };
                tiles.push(block);
                triggers.magicPlatforms = triggers.magicPlatforms || [];
                triggers.magicPlatforms.push(block);
                triggers.magicPlatformActive = false;
                triggers.magicPlatformTimer = 0;
            }
        }
    }
}

function die() {
    deaths++;
    document.getElementById('hud-deaths').innerText = `DEATHS: ${deaths}`;
    loadLevel(); // Instant Respawn
}

function winLevel() {
    currentPlaylistIndex++;
    loadLevel();
}

function checkCollision(r1, r2) {
    return (
        r1.x < r2.x + r2.w &&
        r1.x + r1.w > r2.x &&
        r1.y < r2.y + r2.h &&
        r1.y + r1.h > r2.y
    );
}

function getSolidTiles() {
    return tiles.filter(t => t.solid);
}

function update() {
    if (gamePaused) return;

    // Update Particles
    for (let p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -10) {
            p.y = CANVAS_H + 10;
            p.x = Math.random() * CANVAS_W;
        }
    }

    // Trail
    player.trail.push({ x: player.x, y: player.y, w: player.w, h: player.h });
    if (player.trail.length > 8) player.trail.shift();

    // Movement
    if (keys.a) {
        player.vx = -player.speed;
        player.facingLeft = true;
    } else if (keys.d) {
        player.vx = player.speed;
        player.facingLeft = false;
    } else {
        player.vx = 0;
    }

    if (keys.w && player.grounded) {
        player.vy = player.inverted ? -player.jumpPower : player.jumpPower;
        player.grounded = false;
        
        // Troll: Bouncing Door
        entities.filter(e => e.type === 'bouncing_exit').forEach(e => {
            e.vy = -6;
        });
    }

    // Gravity
    if (player.inverted) {
        player.vy -= player.gravity;
        if (player.vy < -player.terminalVel) player.vy = -player.terminalVel;
    } else {
        player.vy += player.gravity;
        if (player.vy > player.terminalVel) player.vy = player.terminalVel;
    }

    // X Collision
    player.x += player.vx;
    for (let t of getSolidTiles()) {
        if (checkCollision(player, t)) {
            if (t.type === 'invisible_solid') t.revealed = true;
            if (player.vx > 0) player.x = t.x - player.w;
            else if (player.vx < 0) player.x = t.x + t.w;
        }
    }

    // Bounds Check for Walls (X-axis) - Don't kill player, just block them
    if (player.x < 0) player.x = 0;
    if (player.x > CANVAS_W - player.w) player.x = CANVAS_W - player.w;

    // Y Collision
    player.y += player.vy;
    player.grounded = false;
    for (let t of getSolidTiles()) {
        if (checkCollision(player, t)) {
            if (t.type === 'invisible_solid') t.revealed = true;
            if (player.vy > 0) {
                player.y = t.y - player.h;
                player.grounded = !player.inverted;
                player.vy = 0;
                if ((t.type === 'phantom' || t.type === 'instant_phantom') && !t.triggered) t.triggered = true;
            } else if (player.vy < 0) {
                player.y = t.y + t.h;
                player.grounded = player.inverted;
                player.vy = 0;
                if ((t.type === 'phantom' || t.type === 'instant_phantom') && player.inverted && !t.triggered) t.triggered = true;
            }
        }
    }

    // Bounds Check for Pits (Y-axis) - Falling out of bounds still kills
    if (player.y > CANVAS_H + 50) {
        die();
        return;
    }

    // Troll Mechanisms Updates
    
    // Instant Phantom Floors
    tiles.forEach(t => {
        if (t.type === 'instant_phantom' && t.triggered) {
            t.y += 15;
            t.solid = false;
        }
    });

    // Phantom Floors
    tiles.forEach(t => {
        if (t.type === 'phantom' && t.triggered) {
            t.timer += 16;
            if (t.timer > 100) {
                t.y += 5; // fall
                t.solid = false;
            }
        }
    });

    // Bouncing Doors
    entities.forEach(e => {
        if (e.type === 'bouncing_exit') {
            if (e.vy !== undefined) {
                e.y += e.vy;
                e.vy += 0.5;
                if (e.y > e.origY) {
                    e.y = e.origY;
                    e.vy = undefined;
                }
            }
        }
    });

    // Shooting Spikes
    entities.forEach(e => {
        if (e.type === 'shooting_spike') {
            e.timer++;
            const cycle = e.timer % 240;
            if (cycle < 60) {
                e.y = e.origY;
            } else if (cycle < 75) {
                e.y -= (TILE_SIZE * 2.2) / 15;
            } else if (cycle < 150) {
                // hold
            } else {
                e.y += (TILE_SIZE * 2.2) / 90;
                if (e.y > e.origY) e.y = e.origY;
            }
        }
    });

    // Shifting Spikes Logic
    if (triggers.shiftingSpikes && triggers.shiftingSpikes.length > 0) {
        let grp = triggers.shiftingSpikes;
        let firstSpike = grp[0];
        if (!firstSpike.shifted && player.x > firstSpike.x + 10 && !player.grounded) {
            grp.forEach(s => s.shifted = true);
        }
        
        grp.forEach(s => {
            if (s.shifted && s.x < s.origX + TILE_SIZE * 2) {
                s.x += 20; // slide super fast!
                if (s.x > s.origX + TILE_SIZE * 2) s.x = s.origX + TILE_SIZE * 2;
            }
        });
    }

    // Magic Platforms
    if (triggers.magicPlatforms) {
        if (!triggers.magicPlatformActive) {
            let standingOn = false;
            for (let b of triggers.magicPlatforms) {
                if (player.y + player.h === b.y && player.x + player.w > b.x && player.x < b.x + b.w) {
                    standingOn = true;
                }
            }
            if (standingOn) {
                triggers.magicPlatformActive = true;
            }
        }

        if (triggers.magicPlatformActive) {
            triggers.magicPlatformTimer += 16;
            
            let speed = triggers.magicPlatforms[1].x >= 18 * TILE_SIZE ? 0 : 2.5;
            
            for (let b of triggers.magicPlatforms) {
                if (!b.dropped) {
                    b.x += speed;
                }
            }
            
            let playerOnAny = false;
            for (let b of triggers.magicPlatforms) {
                if (!b.dropped && player.y + player.h === b.y && player.x + player.w > b.x && player.x < b.x + b.w) {
                    playerOnAny = true;
                }
            }
            if (playerOnAny) {
                player.x += speed;
                if (player.x > CANVAS_W - player.w) player.x = CANVAS_W - player.w;
            }

            if (triggers.magicPlatformTimer > 1500 && !triggers.magicPlatforms[0].dropped) {
                triggers.magicPlatforms[0].dropped = true;
                triggers.magicPlatforms[0].solid = false;
            }
            if (triggers.magicPlatforms[0].dropped) {
                triggers.magicPlatforms[0].y += 8;
            }

            if (triggers.magicPlatformTimer > 2500 && !triggers.magicPlatforms[2].dropped) {
                triggers.magicPlatforms[2].dropped = true;
                triggers.magicPlatforms[2].solid = false;
            }
            if (triggers.magicPlatforms[2].dropped) {
                triggers.magicPlatforms[2].y += 8;
            }
        }
    }

    // Wall Chase
    if (triggers.wallChaseActive) {
        wallChaseX += 0.7;
        if (player.x < wallChaseX) {
            die();
            return;
        }
    }

    // Entity Collisions
    for (let e of entities) {
        if (checkCollision(player, e)) {
            if (e.type === 'exit' || e.type === 'moving_exit' || e.type === 'bouncing_exit' || e.type === 'fake_exit') {
                if (e.type === 'fake_exit' && e.revealed) {
                    die(); // The fake door spikes you
                    return;
                } else if (e.type === 'fake_exit') {
                    // reveal it just before death if you want, but AABB handles this instantly
                } else {
                    winLevel();
                    return;
                }
            } else if (e.type === 'spike' || e.type === 'shooting_spike' || e.type === 'shift_spike' || e.type === 'ceiling_spike' || e.type === 'harmless_spike') {
                die();
                return;
            } else if (e.type === 'trigger') {
                triggers.doorsMoved = true;
                triggers.spikesDropped = true;
                triggers.bridgeVisible = true;
            } else if (e.type === 'shrink') {
                player.w = 14;
                player.h = 18;
            } else if (e.type === 'gravity' && !triggers.gravityFlipped) {
                triggers.gravityFlipped = true;
                player.inverted = true;
                player.vy = 0;
            } else if (e.type === 'fake_exit' && !e.revealed) {
                e.revealed = true;
                die();
                return;
            }
        }
    }

    // Reactive Traps
    if (triggers.doorsMoved) {
        entities.forEach(e => {
            if (e.type === 'moving_exit' && e.x < e.targetX) {
                e.x += 4;
            }
        });
    }

    entities.forEach(e => {
        if (e.type === 'ceiling_spike') {
            if (triggers.spikesDropped || Math.abs((player.x + player.w/2) - (e.x + e.w/2)) < 80) {
                e.active = true;
            }
            if (e.active) {
                e.y += 12;
                if (checkCollision(player, e)) {
                    die();
                    return;
                }
            }
        }
    });

    if (triggers.bridgeVisible) {
        tiles.forEach(t => {
            if (t.type === 'invisible') {
                t.solid = true;
            }
        });
    }
}

function drawCharacter() {
    ctx.save();
    
    // Draw trail
    for (let i = 0; i < player.trail.length; i++) {
        let pt = player.trail[i];
        let alpha = i / player.trail.length;
        ctx.fillStyle = `rgba(0, 229, 255, ${alpha * 0.3})`;
        ctx.shadowColor = '#00E5FF';
        ctx.shadowBlur = 10;
        ctx.fillRect(pt.x, pt.y, pt.w, pt.h);
    }
    ctx.shadowBlur = 0;

    const cx = player.x + player.w / 2;
    const cy = player.y + player.h / 2;
    ctx.translate(cx, cy);

    if (player.facingLeft) ctx.scale(-1, 1);
    if (player.inverted) ctx.scale(1, -1);
    if (player.h < 30) ctx.scale(0.6, 0.6); // Antman

    let sx = 1, sy = 1;
    if (!player.grounded) {
        if (Math.abs(player.vy) > 2) { sx = 0.85; sy = 1.15; }
    } else {
        if (Math.abs(player.vx) > 0.1) {
            let squeeze = Math.sin(Date.now() / 50) * 0.1;
            sx = 1 + squeeze;
            sy = 1 - squeeze;
        }
    }
    ctx.scale(sx, sy);

    const bw = 24, bh = 32;
    
    // Neon Slime Body
    ctx.fillStyle = '#051122';
    ctx.shadowColor = '#00E5FF';
    ctx.shadowBlur = 15;
    
    const r = 6;
    ctx.beginPath();
    ctx.moveTo(-bw/2 + r, -bh/2);
    ctx.lineTo(bw/2 - r, -bh/2);
    ctx.arcTo(bw/2, -bh/2, bw/2, -bh/2 + r, r);
    ctx.lineTo(bw/2, bh/2 - r);
    ctx.arcTo(bw/2, bh/2, bw/2 - r, bh/2, r);
    ctx.lineTo(-bw/2 + r, bh/2);
    ctx.arcTo(-bw/2, bh/2, -bw/2, bh/2 - r, r);
    ctx.lineTo(-bw/2, -bh/2 + r);
    ctx.arcTo(-bw/2, -bh/2, -bw/2 + r, -bh/2, r);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    ctx.strokeStyle = '#00E5FF';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Cute Neon Eyes
    ctx.fillStyle = '#fff';
    ctx.shadowColor = '#fff';
    ctx.shadowBlur = 5;
    ctx.beginPath(); ctx.arc(2, -4, 3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(10, -4, 3, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;

    ctx.restore();
}

function draw() {
    // Cyberpunk grid background
    const bgGradient = ctx.createRadialGradient(CANVAS_W/2, CANVAS_H/2, 0, CANVAS_W/2, CANVAS_H/2, CANVAS_W);
    bgGradient.addColorStop(0, '#02050A');
    bgGradient.addColorStop(1, '#000000');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Subtle Perspective Grid
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < CANVAS_W; i += 40) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, CANVAS_H); ctx.stroke();
    }
    for (let i = 0; i < CANVAS_H; i += 40) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(CANVAS_W, i); ctx.stroke();
    }

    if (isDevModeActive()) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.font = '12px monospace';
        ctx.textAlign = 'left';
        for (let r = 0; r < 10; r++) {
            for (let c = 0; c < 20; c++) {
                ctx.fillText(String.fromCharCode(65 + r) + c, c * 40 + 3, r * 40 + 13);
            }
        }
    }

    // Particles (Cyan/Teal)
    ctx.fillStyle = '#00E5FF';
    for (let p of particles) {
        ctx.globalAlpha = p.alpha;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1.0;

    ctx.save();
    if (screenFlipped) { ctx.translate(CANVAS_W, 0); ctx.scale(-1, 1); }

    // Tiles
    for (let t of tiles) {
        if (t.type === 'wall' || t.type === 'phantom' || t.type === 'instant_phantom' || t.type === 'magic_platform') {
            ctx.fillStyle = (t.type === 'phantom' || t.type === 'instant_phantom') && t.triggered ? '#0A0A0A' : '#05111A';
            ctx.fillRect(t.x, t.y, t.w, t.h);
            
            // Neon Top Edge
            ctx.fillStyle = (t.type === 'phantom' || t.type === 'instant_phantom') && t.triggered ? '#333' : '#00E5FF';
            ctx.shadowColor = (t.type === 'phantom' || t.type === 'instant_phantom') && t.triggered ? 'transparent' : '#00E5FF';
            ctx.shadowBlur = 10;
            ctx.fillRect(t.x, t.y, t.w, 4);
            ctx.shadowBlur = 0;
            
            // Faint border
            ctx.strokeStyle = '#021A2A';
            ctx.lineWidth = 1;
            ctx.strokeRect(t.x, t.y, t.w, t.h);
        } else if (t.type === 'invisible' && t.solid) {
            ctx.fillStyle = 'rgba(0, 229, 255, 0.1)';
            ctx.strokeStyle = 'rgba(0, 229, 255, 0.4)';
            ctx.strokeRect(t.x, t.y, t.w, t.h);
            ctx.fillRect(t.x, t.y, t.w, t.h);
        } else if (t.type === 'invisible_solid' && t.revealed) {
            ctx.fillStyle = 'rgba(255, 0, 85, 0.1)';
            ctx.strokeStyle = 'rgba(255, 0, 85, 0.4)';
            ctx.shadowColor = '#FF0055';
            ctx.shadowBlur = 10;
            ctx.strokeRect(t.x, t.y, t.w, t.h);
            ctx.fillRect(t.x, t.y, t.w, t.h);
            ctx.shadowBlur = 0;
        }
    }

    // Entities
    const time = Date.now();
    for (let e of entities) {
        if (e.type === 'exit' || e.type === 'moving_exit' || e.type === 'bouncing_exit' || e.type === 'fake_exit') {
            const isFake = e.type === 'fake_exit' && e.revealed;
            const color = isFake ? '#FF0055' : '#00FF66';
            
            // Swirling Portal
            ctx.save();
            ctx.translate(e.x + e.w/2, e.y + e.h/2);
            ctx.rotate(time / 500);
            
            ctx.strokeStyle = color;
            ctx.lineWidth = 3;
            ctx.shadowColor = color;
            ctx.shadowBlur = 15;
            
            ctx.beginPath();
            ctx.arc(0, 0, 15 + Math.sin(time/200)*2, 0, Math.PI * 2);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.arc(0, 0, 8 - Math.sin(time/200)*2, 0, Math.PI * 2);
            ctx.stroke();
            
            ctx.restore();
        } else if (e.type === 'spike' || e.type === 'ceiling_spike' || e.type === 'harmless_spike' || e.type === 'shooting_spike' || e.type === 'shift_spike') {
            // High-tech laser spike
            const cx = e.x + e.w/2;
            const cy = (e.type === 'spike' || e.type === 'harmless_spike' || e.type === 'shooting_spike' || e.type === 'shift_spike') ? e.y + e.h : e.y;
            const tipY = (e.type === 'spike' || e.type === 'harmless_spike' || e.type === 'shooting_spike' || e.type === 'shift_spike') ? e.y : e.y + e.h;
            
            ctx.fillStyle = '#111';
            ctx.fillRect(e.x + 5, cy === e.y ? cy : cy - 5, e.w - 10, 5); // base
            
            ctx.beginPath();
            ctx.moveTo(cx - 3, cy);
            ctx.lineTo(cx, tipY);
            ctx.lineTo(cx + 3, cy);
            
            ctx.fillStyle = '#FF0055';
            ctx.shadowColor = '#FF0055';
            ctx.shadowBlur = 15;
            ctx.fill();
            
            ctx.fillStyle = '#fff';
            ctx.shadowBlur = 0;
            ctx.beginPath();
            ctx.moveTo(cx - 1, cy);
            ctx.lineTo(cx, tipY);
            ctx.lineTo(cx + 1, cy);
            ctx.fill();
        } else if (e.type === 'shrink' || e.type === 'gravity') {
            ctx.fillStyle = 'rgba(255, 0, 255, 0.2)';
            ctx.strokeStyle = '#f0f';
            ctx.lineWidth = 2;
            ctx.shadowColor = '#f0f';
            ctx.shadowBlur = 15;
            
            ctx.beginPath();
            ctx.arc(e.x + e.w/2, e.y + e.h/2, 12 + Math.sin(time/150)*3, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
    }

    if (triggers.wallChaseActive) {
        // Sci-Fi Laser Wall
        const grad = ctx.createLinearGradient(wallChaseX - 50, 0, wallChaseX, 0);
        grad.addColorStop(0, 'transparent');
        grad.addColorStop(1, 'rgba(255, 0, 85, 0.8)');
        ctx.fillStyle = grad;
        ctx.fillRect(wallChaseX - 50, 0, 50, CANVAS_H);
        
        ctx.fillStyle = '#fff';
        ctx.shadowColor = '#FF0055';
        ctx.shadowBlur = 20;
        ctx.fillRect(wallChaseX - 2, 0, 4, CANVAS_H);
        ctx.shadowBlur = 0;
    }

    drawCharacter();

    ctx.restore();
}

function loop() {
    if (currentPlaylistIndex >= 5) return;
    update();
    draw();
    animationId = requestAnimationFrame(loop);
}

export function destroy() {
    window.removeEventListener('resize', boundResize);
    document.removeEventListener('keydown', boundKeydown);
    document.removeEventListener('keyup', boundKeyup);
    cancelAnimationFrame(animationId);
}
'''

with open(file_path, 'w', encoding='utf-8') as fout:
    fout.write(head + new_code)
print('Done!')