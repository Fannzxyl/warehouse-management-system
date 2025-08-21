/**
 * 2D NINJA PLATFORMER GAME
 * * Kontrol Desktop:
 * - Gerak:         WASD / Tombol Panah
 * - Lompat:        Spasi
 * - Panjat Tangga: W / Panah Atas (saat di tangga)
 * - Serangan Biasa:J
 * - Shuriken:      K
 * - Shadow Dash:   L
 * - Cyclone Slash: I
 * - Pause:         Escape / P
 * * Kontrol Mobile:
 * - Gerak:         Joystick Virtual di kiri bawah
 * - Lompat:        Geser joystick ke atas dengan cepat
 * - Tombol Aksi:   Gunakan tombol di kanan bawah
 */

// --- UTILITIES & HELPERS ---
class MathHelper {
    static lerp(a, b, t) {
        return a + (b - a) * t;
    }

    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }
}

// --- KELAS INTI ---

class InputManager {
    constructor() {
        this.keys = new Set();
        this.actions = {};
        this.joystick = {
            active: false,
            pointerId: null,
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0,
            vector: { x: 0, y: 0 },
            magnitude: 0,
        };
        this.actionButtons = {
            attack: false,
            skill1: false,
            skill2: false,
            skill3: false,
        };

        this.keyMap = {
            'KeyW': 'up', 'ArrowUp': 'up',
            'KeyS': 'down', 'ArrowDown': 'down',
            'KeyA': 'left', 'ArrowLeft': 'left',
            'KeyD': 'right', 'ArrowRight': 'right',
            'Space': 'jump',
            'KeyJ': 'attack',
            'KeyK': 'skill1',
            'KeyL': 'skill2',
            'KeyI': 'skill3',
            'Escape': 'pause', 'KeyP': 'pause',
        };
        
        this.initListeners();
    }

    initListeners() {
        window.addEventListener('keydown', e => this.keys.add(e.code));
        window.addEventListener('keyup', e => this.keys.delete(e.code));
        
        const canvas = document.getElementById('gameCanvas');
        canvas.addEventListener('pointerdown', this.handlePointerDown.bind(this));
        window.addEventListener('pointermove', this.handlePointerMove.bind(this));
        window.addEventListener('pointerup', this.handlePointerUp.bind(this));
        window.addEventListener('pointercancel', this.handlePointerUp.bind(this));

        // Listeners untuk tombol aksi di UI
        document.getElementById('attack-btn').addEventListener('pointerdown', () => this.actionButtons.attack = true);
        document.getElementById('attack-btn').addEventListener('pointerup', () => this.actionButtons.attack = false);
        document.getElementById('skill1-btn').addEventListener('pointerdown', () => this.actionButtons.skill1 = true);
        document.getElementById('skill1-btn').addEventListener('pointerup', () => this.actionButtons.skill1 = false);
        document.getElementById('skill2-btn').addEventListener('pointerdown', () => this.actionButtons.skill2 = true);
        document.getElementById('skill2-btn').addEventListener('pointerup', () => this.actionButtons.skill2 = false);
        document.getElementById('skill3-btn').addEventListener('pointerdown', () => this.actionButtons.skill3 = true);
        document.getElementById('skill3-btn').addEventListener('pointerup', () => this.actionButtons.skill3 = false);
    }

    handlePointerDown(e) {
        if (this.joystick.active) return;
        
        // Joystick hanya aktif di sisi kiri layar
        if (e.clientX < window.innerWidth / 2) {
            this.joystick.active = true;
            this.joystick.pointerId = e.pointerId;
            this.joystick.startX = e.clientX;
            this.joystick.startY = e.clientY;
            this.joystick.currentX = e.clientX;
            this.joystick.currentY = e.clientY;

            // Pindahkan UI joystick ke posisi sentuhan
            const joyContainer = document.getElementById('joystick-container');
            joyContainer.style.left = `${e.clientX - joyContainer.offsetWidth / 2}px`;
            joyContainer.style.top = `${e.clientY - joyContainer.offsetHeight / 2}px`;
        }
    }

    handlePointerMove(e) {
        if (!this.joystick.active || e.pointerId !== this.joystick.pointerId) return;

        const maxDist = 60; // Radius joystick base
        const dx = e.clientX - this.joystick.startX;
        const dy = e.clientY - this.joystick.startY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > maxDist) {
            this.joystick.currentX = this.joystick.startX + (dx / dist) * maxDist;
            this.joystick.currentY = this.joystick.startY + (dy / dist) * maxDist;
            this.joystick.magnitude = 1;
        } else {
            this.joystick.currentX = e.clientX;
            this.joystick.currentY = e.clientY;
            this.joystick.magnitude = dist / maxDist;
        }

        this.joystick.vector.x = (this.joystick.currentX - this.joystick.startX) / maxDist;
        this.joystick.vector.y = (this.joystick.currentY - this.joystick.startY) / maxDist;

        // Update UI knob
        const knob = document.getElementById('joystick-knob');
        knob.style.transform = `translate(${this.joystick.vector.x * 24}px, ${this.joystick.vector.y * 24}px)`;
    }

    handlePointerUp(e) {
        if (e.pointerId === this.joystick.pointerId) {
            this.joystick.active = false;
            this.joystick.pointerId = null;
            this.joystick.vector = { x: 0, y: 0 };
            this.joystick.magnitude = 0;
            
            // Reset UI joystick
            const joyContainer = document.getElementById('joystick-container');
            joyContainer.style.left = '20px';
            joyContainer.style.top = '';
            joyContainer.style.bottom = '20px';
            document.getElementById('joystick-knob').style.transform = 'translate(0,0)';
        }
    }

    isActionPressed(action) {
        if (this.actionButtons[action]) return true;
        for (const key in this.keyMap) {
            if (this.keyMap[key] === action && this.keys.has(key)) {
                return true;
            }
        }
        return false;
    }

    getMoveVector() {
        let x = 0;
        let y = 0;
        
        if (this.joystick.active && this.joystick.magnitude > 0.1) { // Deadzone
            x = this.joystick.vector.x;
            y = this.joystick.vector.y;
        } else {
            if (this.isActionPressed('left')) x = -1;
            if (this.isActionPressed('right')) x = 1;
            if (this.isActionPressed('up')) y = -1;
            if (this.isActionPressed('down')) y = 1;
        }
        
        return { x, y };
    }
}

class Camera {
    constructor(width, height, worldWidth, worldHeight) {
        this.x = 0;
        this.y = 0;
        this.width = width;
        this.height = height;
        this.worldWidth = worldWidth;
        this.worldHeight = worldHeight;
        this.target = null;
        this.shakeDuration = 0;
        this.shakeMagnitude = 0;
        this.deadzoneX = width * 0.3;
        this.deadzoneY = height * 0.3;
    }

    follow(target) {
        this.target = target;
    }

    update(dt) {
        if (!this.target) return;

        const targetX = this.target.x + this.target.width / 2;
        const targetY = this.target.y + this.target.height / 2;
        
        const deadzoneLeft = this.x + this.deadzoneX;
        const deadzoneRight = this.x + this.width - this.deadzoneX;
        const deadzoneTop = this.y + this.deadzoneY;
        const deadzoneBottom = this.y + this.height - this.deadzoneY;

        let desiredX = this.x;
        if (targetX < deadzoneLeft) {
            desiredX = targetX - this.deadzoneX;
        } else if (targetX > deadzoneRight) {
            desiredX = targetX - (this.width - this.deadzoneX);
        }

        let desiredY = this.y;
        if (targetY < deadzoneTop) {
            desiredY = targetY - this.deadzoneY;
        } else if (targetY > deadzoneBottom) {
            desiredY = targetY - (this.height - this.deadzoneY);
        }

        this.x = MathHelper.lerp(this.x, desiredX, 0.12);
        this.y = MathHelper.lerp(this.y, desiredY, 0.12);

        // Clamp camera to world bounds
        this.x = MathHelper.clamp(this.x, 0, this.worldWidth - this.width);
        this.y = MathHelper.clamp(this.y, 0, this.worldHeight - this.height);

        if (this.shakeDuration > 0) {
            this.shakeDuration -= dt;
        }
    }

    apply(ctx) {
        let shakeX = 0;
        let shakeY = 0;
        if (this.shakeDuration > 0) {
            shakeX = (Math.random() - 0.5) * this.shakeMagnitude;
            shakeY = (Math.random() - 0.5) * this.shakeMagnitude;
        }
        ctx.translate(Math.round(-this.x + shakeX), Math.round(-this.y + shakeY));
    }

    startShake(duration, magnitude) {
        this.shakeDuration = duration;
        this.shakeMagnitude = magnitude;
    }
    
    resize(width, height) {
        this.width = width;
        this.height = height;
        this.deadzoneX = width * 0.3;
        this.deadzoneY = height * 0.3;
    }
}

class Tilemap {
    constructor() {
        this.tileSize = 64;
        this.width = 40;
        this.height = 14;
        this.mapData = [
            // 0: Air, 1: Solid Ground, 2: Ladder Platform
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,0,0,0,0,0,0,0,0,0,0],

            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],

            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ];
        this.worldWidth = this.width * this.tileSize;
        this.worldHeight = this.height * this.tileSize;
    }

    getTileAt(worldX, worldY) {
        const tileX = Math.floor(worldX / this.tileSize);
        const tileY = Math.floor(worldY / this.tileSize);
        if (tileX < 0 || tileX >= this.width || tileY < 0 || tileY >= this.height) {
            return 1; // Treat out of bounds as solid
        }
        return this.mapData[tileY][tileX];
    }

    draw(ctx, camera) {
        const startCol = Math.floor(camera.x / this.tileSize);
        const endCol = Math.ceil((camera.x + camera.width) / this.tileSize);
        const startRow = Math.floor(camera.y / this.tileSize);
        const endRow = Math.ceil((camera.y + camera.height) / this.tileSize);

        for (let y = startRow; y < endRow; y++) {
            for (let x = startCol; x < endCol; x++) {
                if (x < 0 || x >= this.width || y < 0 || y >= this.height) continue;
                
                const tile = this.mapData[y][x];
                if (tile === 0) continue;

                if (tile === 1) {
                    ctx.fillStyle = '#4a5568'; // Gray for solid ground
                } else if (tile === 2) {
                    ctx.fillStyle = '#8B4513'; // Brown for ladder platforms
                }
                ctx.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
            }
        }
    }
}

class Physics {
    constructor(gravity = 980) {
        this.gravity = gravity;
    }

    update(entity, dt, tilemap) {
        // Apply gravity
        if (!entity.onLadder) {
            entity.vy += this.gravity * dt;
        }

        // Move X
        entity.x += entity.vx * dt;
        this.handleXCollisions(entity, tilemap);

        // Move Y
        entity.y += entity.vy * dt;
        this.handleYCollisions(entity, tilemap);
    }

    handleXCollisions(entity, tilemap) {
        const startX = Math.floor(entity.x / tilemap.tileSize);
        const endX = Math.floor((entity.x + entity.width) / tilemap.tileSize);
        const startY = Math.floor(entity.y / tilemap.tileSize);
        const endY = Math.floor((entity.y + entity.height) / tilemap.tileSize);

        for (let y = startY; y <= endY; y++) {
            for (let x = startX; x <= endX; x++) {
                const tile = tilemap.getTileAt(x * tilemap.tileSize, y * tilemap.tileSize);
                if (tile === 1) { // Solid tile
                    if (this.checkAABB(entity, {x: x * tilemap.tileSize, y: y * tilemap.tileSize, width: tilemap.tileSize, height: tilemap.tileSize})) {
                        if (entity.vx > 0) {
                            entity.x = x * tilemap.tileSize - entity.width;
                        } else if (entity.vx < 0) {
                            entity.x = (x + 1) * tilemap.tileSize;
                        }
                        entity.vx = 0;
                    }
                }
            }
        }
    }

    handleYCollisions(entity, tilemap) {
        entity.onGround = false;
        entity.onLadder = false;

        const startX = Math.floor(entity.x / tilemap.tileSize);
        const endX = Math.floor((entity.x + entity.width) / tilemap.tileSize);
        const startY = Math.floor(entity.y / tilemap.tileSize);
        const endY = Math.floor((entity.y + entity.height) / tilemap.tileSize);

        for (let y = startY; y <= endY; y++) {
            for (let x = startX; x <= endX; x++) {
                const tile = tilemap.getTileAt(x * tilemap.tileSize, y * tilemap.tileSize);
                
                if (tile === 1) { // Solid tile
                    if (this.checkAABB(entity, {x: x * tilemap.tileSize, y: y * tilemap.tileSize, width: tilemap.tileSize, height: tilemap.tileSize})) {
                        if (entity.vy > 0) {
                            entity.y = y * tilemap.tileSize - entity.height;
                            entity.onGround = true;
                        } else if (entity.vy < 0) {
                            entity.y = (y + 1) * tilemap.tileSize;
                        }
                        entity.vy = 0;
                    }
                } else if (tile === 2) { // Ladder
                    if (this.checkAABB(entity, {x: x * tilemap.tileSize, y: y * tilemap.tileSize, width: tilemap.tileSize, height: tilemap.tileSize})) {
                        entity.onLadder = true;
                    }
                }
            }
        }
    }

    checkAABB(rect1, rect2) {
        return (
            rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y
        );
    }
}

// --- ENTITAS ---
class Entity {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.vx = 0;
        this.vy = 0;
        this.hp = 100;
        this.maxHp = 100;
        this.isDead = false;
    }

    update(dt, game) {}
    draw(ctx) {}
    
    takeDamage(amount) {
        this.hp = Math.max(0, this.hp - amount);
        if (this.hp === 0) {
            this.isDead = true;
        }
    }
}

class Player extends Entity {
    constructor(x, y) {
        super(x, y, 40, 60);
        this.color = '#3182ce'; // Blue
        this.stats = {
            level: 1,
            exp: 0,
            expToNextLevel: 50,
            atk: 10,
            def: 2,
            moveSpeed: 220,
            jumpForce: 480,
        };
        this.energy = 50;
        this.maxEnergy = 50;
        this.energyRegenRate = 12;
        this.kills = 0;

        // State & Timers
        this.onGround = false;
        this.onLadder = false;
        this.isClimbing = false;
        this.facing = 1; // 1 for right, -1 for left
        this.jumpBuffer = 0;
        this.coyoteTime = 0;
        this.isDashing = false;
        this.dashTimer = 0;
        this.invulnerableTimer = 0;

        // Combo
        this.comboState = 0;
        this.comboTimer = 0;

        // Cooldowns
        this.cooldowns = {
            shuriken: 0,
            dash: 0,
            cyclone: 0,
        };
        this.skillCosts = {
            shuriken: 5,
            dash: 10,
            cyclone: 20,
        };
        this.skillDurations = {
            cyclone: 0
        };
    }

    update(dt, game) {
        // Update timers
        this.jumpBuffer -= dt;
        if (this.onGround) this.coyoteTime = 0.08;
        else this.coyoteTime -= dt;

        for (const skill in this.cooldowns) {
            this.cooldowns[skill] = Math.max(0, this.cooldowns[skill] - dt);
        }
        for (const skill in this.skillDurations) {
            this.skillDurations[skill] = Math.max(0, this.skillDurations[skill] - dt);
        }
        this.invulnerableTimer = Math.max(0, this.invulnerableTimer - dt);
        this.comboTimer = Math.max(0, this.comboTimer - dt);
        if (this.comboTimer <= 0) this.comboState = 0;
        
        // Energy Regen
        this.energy = Math.min(this.maxEnergy, this.energy + this.energyRegenRate * dt);

        this.handleInput(dt, game);

        // Physics
        if (!this.isDashing) {
            game.physics.update(this, dt, game.tilemap);
        } else {
             this.dashTimer -= dt;
             if (this.dashTimer <= 0) {
                 this.isDashing = false;
                 this.vx = 0;
                 this.vy = 0;
             }
        }
    }

    handleInput(dt, game) {
        const move = game.input.getMoveVector();

        // Movement
        if (!this.isDashing) {
            this.vx = move.x * this.stats.moveSpeed;
            if (move.x !== 0) this.facing = Math.sign(move.x);
        }
        
        // Climbing
        if (this.onLadder && move.y < -0.6) {
            this.isClimbing = true;
            this.vy = -150;
        } else if (this.onLadder && move.y > 0.6) {
            this.isClimbing = true;
            this.vy = 150;
        } else if (this.isClimbing) {
            this.vy = 0;
            if (!this.onLadder) this.isClimbing = false;
        }

        // Jumping
        if (game.input.isActionPressed('jump')) {
            this.jumpBuffer = 0.1;
        }
        if (this.jumpBuffer > 0 && this.coyoteTime > 0) {
            this.vy = -this.stats.jumpForce;
            this.jumpBuffer = 0;
            this.coyoteTime = 0;
            this.isClimbing = false;
        }

        // Actions
        if (game.input.isActionPressed('attack')) this.basicAttack(game);
        if (game.input.isActionPressed('skill1')) this.castShuriken(game);
        if (game.input.isActionPressed('skill2')) this.castDash(game);
        if (game.input.isActionPressed('skill3')) this.castCyclone(game);
    }
    
    basicAttack(game) {
        if (this.comboTimer > 0) return; // Prevent spamming
        
        this.comboState = (this.comboState % 3) + 1;
        this.comboTimer = 0.35;
        
        let damageMultiplier = 1.0;
        if (this.comboState === 2) damageMultiplier = 1.1;
        if (this.comboState === 3) damageMultiplier = 1.25;

        const hitbox = {
            x: this.x + (this.facing > 0 ? this.width : -60),
            y: this.y,
            width: 60,
            height: this.height
        };
        
        game.checkEnemyHit(hitbox, this.stats.atk * damageMultiplier, { knockback: 150 * this.facing });
    }
    
    castShuriken(game) {
        if (this.cooldowns.shuriken > 0 || this.energy < this.skillCosts.shuriken) return;
        this.cooldowns.shuriken = 0.8;
        this.energy -= this.skillCosts.shuriken;
        
        const shuriken = new Projectile(
            this.x + this.width / 2, 
            this.y + this.height / 2, 
            this.facing, 
            this.stats.atk * 1.2
        );
        game.projectiles.push(shuriken);
    }
    
    castDash() {
        if (this.cooldowns.dash > 0 || this.energy < this.skillCosts.dash) return;
        this.cooldowns.dash = 2.0;
        this.energy -= this.skillCosts.dash;
        
        this.isDashing = true;
        this.dashTimer = 0.25;
        this.invulnerableTimer = 0.25;
        
        const dashSpeed = 220 / 0.25;
        this.vx = this.facing * dashSpeed;
        this.vy = 0;
    }
    
    castCyclone(game) {
        if (this.cooldowns.cyclone > 0 || this.energy < this.skillCosts.cyclone) return;
        this.cooldowns.cyclone = 4.0;
        this.energy -= this.skillCosts.cyclone;
        this.skillDurations.cyclone = 0.5;
    }

    takeDamage(amount, game) {
        if (this.invulnerableTimer > 0) return;
        
        const finalDamage = Math.max(1, amount - this.stats.def);
        super.takeDamage(finalDamage);
        game.camera.startShake(0.1, 5);
        game.spawnDamageNumber(finalDamage, this.x + this.width/2, this.y);
    }
    
    addExp(amount) {
        this.stats.exp += amount;
        while (this.stats.exp >= this.stats.expToNextLevel) {
            this.levelUp();
        }
    }
    
    levelUp() {
        this.stats.exp -= this.stats.expToNextLevel;
        this.stats.level++;
        this.stats.expToNextLevel = Math.floor(50 * (this.stats.level ** 1.5));
        
        this.maxHp += 10;
        this.hp = this.maxHp;
        this.stats.atk += 3;
        this.stats.def += 1;
        this.maxEnergy += 10;
        this.energy = this.maxEnergy;
    }

    draw(ctx) {
        ctx.fillStyle = this.invulnerableTimer > 0 ? 'rgba(49, 130, 206, 0.5)' : this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Cyclone effect
        if (this.skillDurations.cyclone > 0) {
            ctx.strokeStyle = '#63b3ed';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.x + this.width/2, this.y + this.height/2, 120, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
}

class Enemy extends Entity {
    constructor(x, y, width, height, level, baseStats) {
        super(x, y, width, height);
        this.level = level;
        this.baseStats = baseStats;
        this.stats = {
            hp: baseStats.hp * (1 + 0.18 * (level - 1)),
            atk: baseStats.atk * (1 + 0.16 * (level - 1)),
            dropsExp: 20 * level
        };
        this.hp = this.stats.hp;
        this.maxHp = this.stats.hp;
        
        this.aiState = 'patrol';
        this.aggroRadius = 380;
        this.loseSightRadius = 520;
        this.patrolDir = 1;
        this.attackCooldown = 0;
        this.color = '#e53e3e'; // Red
    }
    
    update(dt, game) {
        this.attackCooldown = Math.max(0, this.attackCooldown - dt);
        this.ai(dt, game);
        game.physics.update(this, dt, game.tilemap);
        
        // Dash contact damage
        if (game.player.isDashing && game.physics.checkAABB(this, game.player)) {
            this.takeDamage(game.player.stats.atk * 0.6, game);
        }
        
        // Cyclone pull & damage
        if (game.player.skillDurations.cyclone > 0) {
            const dx = (game.player.x + game.player.width/2) - (this.x + this.width/2);
            const dy = (game.player.y + game.player.height/2) - (this.y + this.height/2);
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < 120) {
                this.vx += (dx / dist) * 100; // Pull force
                // Simple tick damage
                if (Math.random() < 0.1) { // Apply damage periodically
                    this.takeDamage(game.player.stats.atk * 0.9, game);
                }
            }
        }
    }
    
    ai(dt, game) {
        const player = game.player;
        const dx = player.x - this.x;
        const dist = Math.abs(dx);
        
        switch(this.aiState) {
            case 'patrol':
                this.vx = 50 * this.patrolDir;
                // Check for edges or walls
                const frontTileX = this.patrolDir > 0 ? this.x + this.width : this.x;
                const frontTile = game.tilemap.getTileAt(frontTileX, this.y + this.height + 10);
                if (frontTile === 0) { // Edge
                    this.patrolDir *= -1;
                }
                if (dist < this.aggroRadius) this.aiState = 'chase';
                break;
            case 'chase':
                this.vx = Math.sign(dx) * 100;
                if (dist > this.loseSightRadius) this.aiState = 'patrol';
                if (dist < 50) this.aiState = 'attack';
                break;
            case 'attack':
                this.vx = 0;
                if (this.attackCooldown <= 0) {
                    this.performAttack(game);
                    this.attackCooldown = 2.0;
                }
                if (dist > 60) this.aiState = 'chase';
                break;
        }
    }

    performAttack(game) {
        // Default: contact damage
        if (game.physics.checkAABB(this, game.player)) {
            game.player.takeDamage(this.stats.atk, game);
        }
    }
    
    takeDamage(amount, game) {
        super.takeDamage(amount);
        game.spawnDamageNumber(amount, this.x + this.width/2, this.y);
        if (this.isDead) {
            game.player.addExp(this.stats.dropsExp);
            game.player.kills++;
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // HP bar
        if (this.hp < this.maxHp) {
            ctx.fillStyle = '#718096';
            ctx.fillRect(this.x, this.y - 15, this.width, 8);
            ctx.fillStyle = '#f56565';
            ctx.fillRect(this.x, this.y - 15, this.width * (this.hp / this.maxHp), 8);
        }
    }
}

class Slime extends Enemy {
    constructor(x, y, level) {
        super(x, y, 40, 30, level, { hp: 40, atk: 6 });
        this.color = '#68d391'; // Green
        this.jumpTimer = 0;
    }
    
    ai(dt, game) {
        this.jumpTimer -= dt;
        if (this.onGround && this.jumpTimer <= 0) {
            this.vy = -200;
            this.jumpTimer = 2.0 + Math.random();
        }
        
        if (game.physics.checkAABB(this, game.player)) {
            this.performAttack(game);
        }
    }
}

class Bandit extends Enemy {
     constructor(x, y, level) {
        super(x, y, 40, 60, level, { hp: 90, atk: 12 });
        this.color = '#a0aec0'; // Gray
    }
    
    performAttack(game) {
        const hitbox = {
            x: this.x + (this.vx > 0 ? this.width : -50),
            y: this.y,
            width: 50,
            height: this.height
        };
        if (game.physics.checkAABB(hitbox, game.player)) {
            game.player.takeDamage(this.stats.atk, game);
        }
    }
}

class Oni extends Enemy {
    constructor(x, y, level) {
        super(x, y, 60, 80, level, { hp: 180, atk: 18 });
        this.color = '#c53030'; // Dark Red
    }
    
    performAttack(game) {
        // AoE slam
        const hitbox = {
            x: this.x - 20,
            y: this.y + this.height - 20,
            width: this.width + 40,
            height: 20
        };
        if (game.physics.checkAABB(hitbox, game.player)) {
            game.player.takeDamage(this.stats.atk, game);
        }
    }
}

class Projectile extends Entity {
    constructor(x, y, direction, damage) {
        super(x, y, 20, 10);
        this.speed = 700;
        this.vx = direction * this.speed;
        this.damage = damage;
        this.lifetime = 3; // seconds
        this.pierced = 0;
    }
    
    update(dt, game) {
        this.x += this.vx * dt;
        this.lifetime -= dt;
        if (this.lifetime <= 0) this.isDead = true;
        
        for (const enemy of game.enemies) {
            if (game.physics.checkAABB(this, enemy)) {
                enemy.takeDamage(this.damage, game);
                this.pierced++;
                if (this.pierced > 1) {
                    this.isDead = true;
                    break;
                }
            }
        }
    }
    
    draw(ctx) {
        ctx.fillStyle = '#f7fafc'; // White
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

class DamageNumber {
    constructor(value, x, y) {
        this.value = Math.round(value);
        this.x = x;
        this.y = y;
        this.vy = -100;
        this.lifetime = 0.8;
        this.opacity = 1;
    }
    
    update(dt) {
        this.y += this.vy * dt;
        this.vy += 150 * dt; // Gravity effect
        this.lifetime -= dt;
        this.opacity = this.lifetime / 0.8;
    }
    
    draw(ctx) {
        ctx.fillStyle = `rgba(255, 255, 100, ${this.opacity})`;
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(this.value, this.x, this.y);
    }
}


// --- KELAS GAME UTAMA ---

class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.lastTime = 0;
        this.accumulator = 0;
        this.deltaTime = 1 / 60;
        this.isPaused = false;
        
        this.init();
    }

    init() {
        this.input = new InputManager();
        this.tilemap = new Tilemap();
        this.camera = new Camera(this.canvas.width, this.canvas.height, this.tilemap.worldWidth, this.tilemap.worldHeight);
        this.physics = new Physics();
        
        this.player = new Player(100, 100);
        this.camera.follow(this.player);
        
        this.enemies = [];
        this.projectiles = [];
        this.damageNumbers = [];
        
        this.loadGame();
        this.spawnEnemies();
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        // Pause menu listeners
        document.getElementById('resume-btn').addEventListener('click', () => this.togglePause());
        document.getElementById('reset-save-btn').addEventListener('click', () => {
            if (confirm('Are you sure you want to reset all progress?')) {
                this.resetSave();
            }
        });
        
        this.gameLoop = this.gameLoop.bind(this);
        requestAnimationFrame(this.gameLoop);
    }

    spawnEnemies() {
        this.enemies.push(new Slime(500, 500, 1));
        this.enemies.push(new Slime(550, 500, 2));
        this.enemies.push(new Bandit(900, 300, 4));
        this.enemies.push(new Bandit(1200, 500, 5));
        this.enemies.push(new Oni(2000, 500, 8));
        this.enemies.push(new Oni(2300, 300, 10));
    }
    
    saveGame() {
        const saveData = {
            level: this.player.stats.level,
            exp: this.player.stats.exp,
            hp: this.player.hp,
            energy: this.player.energy,
            kills: this.player.kills,
            x: this.player.x,
            y: this.player.y
        };
        localStorage.setItem('ninjaGameSave', JSON.stringify(saveData));
        console.log("Game saved!");
    }
    
    loadGame() {
        const savedData = localStorage.getItem('ninjaGameSave');
        if (savedData) {
            const data = JSON.parse(savedData);
            this.player.stats.level = data.level || 1;
            this.player.stats.exp = data.exp || 0;
            this.player.hp = data.hp || this.player.maxHp;
            this.player.energy = data.energy || this.player.maxEnergy;
            this.player.kills = data.kills || 0;
            this.player.x = data.x || 100;
            this.player.y = data.y || 100;
            // Re-calculate stats based on level
            for (let i = 1; i < this.player.stats.level; i++) {
                this.player.maxHp += 10;
                this.player.stats.atk += 3;
                this.player.stats.def += 1;
                this.player.maxEnergy += 10;
                this.player.stats.expToNextLevel = Math.floor(50 * (i ** 1.5));
            }
            console.log("Game loaded!");
        }
    }
    
    resetSave() {
        localStorage.removeItem('ninjaGameSave');
        window.location.reload();
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        document.getElementById('pause-menu').style.display = this.isPaused ? 'flex' : 'none';
        document.getElementById('pause-text').style.display = this.isPaused ? 'block' : 'none';
        if (!this.isPaused) {
            this.lastTime = performance.now(); // Reset time to prevent large dt
            requestAnimationFrame(this.gameLoop);
        } else {
            this.saveGame();
        }
    }

    gameLoop(currentTime) {
        if (this.input.isActionPressed('pause')) {
            this.togglePause();
            this.input.keys.delete('Escape');
            this.input.keys.delete('KeyP');
        }
        
        if (this.isPaused) return;

        const frameTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        this.accumulator += Math.min(frameTime, 1/30); // Cap dt

        while (this.accumulator >= this.deltaTime) {
            this.update(this.deltaTime);
            this.accumulator -= this.deltaTime;
        }

        this.draw();
        requestAnimationFrame(this.gameLoop);
    }

    update(dt) {
        this.player.update(dt, this);
        
        this.enemies.forEach(enemy => enemy.update(dt, this));
        this.projectiles.forEach(p => p.update(dt, this));
        this.damageNumbers.forEach(dn => dn.update(dt));
        
        this.camera.update(dt);
        
        // Cleanup dead entities
        this.enemies = this.enemies.filter(e => !e.isDead);
        this.projectiles = this.projectiles.filter(p => !p.isDead);
        this.damageNumbers = this.damageNumbers.filter(dn => dn.lifetime > 0);
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Parallax Background
        this.drawParallax();

        this.ctx.save();
        this.camera.apply(this.ctx);

        this.tilemap.draw(this.ctx, this.camera);
        this.player.draw(this.ctx);
        this.enemies.forEach(enemy => enemy.draw(this.ctx));
        this.projectiles.forEach(p => p.draw(this.ctx));
        this.damageNumbers.forEach(dn => dn.draw(this.ctx));

        this.ctx.restore();
        
        this.updateUI();
    }
    
    drawParallax() {
        const parallaxFactor1 = 0.1;
        const parallaxFactor2 = 0.3;
        
        // Layer 1 (Mountains)
        this.ctx.fillStyle = '#2d3748';
        this.ctx.fillRect(0, this.canvas.height - 300 - (this.camera.y * parallaxFactor1), this.canvas.width, 300);
        
        // Layer 2 (Forest)
        this.ctx.fillStyle = '#2f855a';
        this.ctx.fillRect(0, this.canvas.height - 200 - (this.camera.y * parallaxFactor2), this.canvas.width, 200);
    }
    
    updateUI() {
        document.getElementById('hp-bar').style.width = `${(this.player.hp / this.player.maxHp) * 100}%`;
        document.getElementById('energy-bar').style.width = `${(this.player.energy / this.player.maxEnergy) * 100}%`;
        document.getElementById('exp-bar').style.width = `${(this.player.stats.exp / this.player.stats.expToNextLevel) * 100}%`;
        document.getElementById('level-text').textContent = `LVL ${this.player.stats.level}`;
        document.getElementById('kill-counter').textContent = `Kills: ${this.player.kills}`;
        
        // Cooldowns
        const skills = ['shuriken', 'dash', 'cyclone'];
        const maxCooldowns = { shuriken: 0.8, dash: 2.0, cyclone: 4.0 };
        const buttons = { shuriken: 'skill1', dash: 'skill2', cyclone: 'skill3' };

        skills.forEach(skill => {
            const btnId = buttons[skill];
            const btn = document.getElementById(`${btnId}-btn`);
            const progressCircle = btn.querySelector('.radial-progress');
            const cooldown = this.player.cooldowns[skill];
            const max = maxCooldowns[skill];
            const progress = 1 - (cooldown / max);
            
            progressCircle.style.strokeDashoffset = 251.2 * (1 - progress);
            
            if (cooldown > 0 || this.player.energy < this.player.skillCosts[skill]) {
                btn.classList.add('opacity-50', 'cursor-not-allowed');
            } else {
                btn.classList.remove('opacity-50', 'cursor-not-allowed');
            }
        });
    }

    resize() {
        const container = document.getElementById('game-container');
        const { width, height } = container.getBoundingClientRect();
        
        const aspectRatio = 16 / 9;
        let newWidth = width;
        let newHeight = width / aspectRatio;

        if (newHeight > height) {
            newHeight = height;
            newWidth = height * aspectRatio;
        }

        this.canvas.width = newWidth;
        this.canvas.height = newHeight;
        this.camera.resize(newWidth, newHeight);
    }
    
    checkEnemyHit(hitbox, damage, options = {}) {
        this.enemies.forEach(enemy => {
            if (this.physics.checkAABB(hitbox, enemy)) {
                enemy.takeDamage(damage, this);
                if (options.knockback) {
                    enemy.vx = options.knockback;
                }
            }
        });
    }
    
    spawnDamageNumber(value, x, y) {
        this.damageNumbers.push(new DamageNumber(value, x, y));
    }
}

// Inisialisasi Game saat DOM siap
window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    new Game(canvas);
});
