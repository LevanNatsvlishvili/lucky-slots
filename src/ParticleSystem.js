import { Container, Graphics } from 'pixi.js';

export class ParticleSystem {
    constructor(app) {
        this.app = app;
        this.particles = [];
        this.container = new Container();
        this.app.stage.addChild(this.container);
    }

    emit(x, y, count = 10) {
        const colors = [0xffd700, 0xff6b6b, 0x4ecdc4, 0xffe66d, 0xff9ff3, 0x54a0ff];
        
        for (let i = 0; i < count; i++) {
            const particle = new Graphics();
            const color = colors[Math.floor(Math.random() * colors.length)];
            const size = Math.random() * 6 + 3;
            
            // Random shape
            if (Math.random() > 0.5) {
                particle.circle(0, 0, size);
            } else {
                particle.star(0, 0, 5, size, size / 2);
            }
            particle.fill(color);
            
            particle.x = x;
            particle.y = y;
            
            // Velocity
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 8 + 4;
            particle.vx = Math.cos(angle) * speed;
            particle.vy = Math.sin(angle) * speed - 5; // Initial upward boost
            
            // Properties
            particle.life = 1;
            particle.decay = Math.random() * 0.02 + 0.01;
            particle.gravity = 0.2;
            particle.rotation = Math.random() * Math.PI * 2;
            particle.rotationSpeed = (Math.random() - 0.5) * 0.2;
            
            this.container.addChild(particle);
            this.particles.push(particle);
        }
    }

    update(delta) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            // Update position
            particle.x += particle.vx * delta;
            particle.y += particle.vy * delta;
            
            // Apply gravity
            particle.vy += particle.gravity * delta;
            
            // Apply rotation
            particle.rotation += particle.rotationSpeed * delta;
            
            // Decay
            particle.life -= particle.decay * delta;
            particle.alpha = particle.life;
            particle.scale.set(particle.life);
            
            // Remove dead particles
            if (particle.life <= 0) {
                this.container.removeChild(particle);
                this.particles.splice(i, 1);
            }
        }
    }

    clear() {
        for (const particle of this.particles) {
            this.container.removeChild(particle);
        }
        this.particles = [];
    }
}
