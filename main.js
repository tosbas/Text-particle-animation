class TextParticleAnimation {
    constructor(canvasId, inputId, easeInput, frictionInput, particleSpacingInput, particleWidthInput, distanceRadiusInput) {
        this.canvas = document.getElementById(canvasId);
        this.input = document.getElementById(inputId);
        this.easeInput = document.getElementById(easeInput);
        this.frictionInput = document.getElementById(frictionInput);
        this.particleSpacingInput = document.getElementById(particleSpacingInput);
        this.particleWidthInput = document.getElementById(particleWidthInput);
        this.distanceRadiusInput = document.getElementById(distanceRadiusInput);
        this.ctx = this.canvas.getContext("2d", { willReadFrequently: true });

        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        this.particles = [];
        this.maxTextWidth = this.canvas.width * 0.8;
        this.lineHeight = 80;
        this.particleSpacing = 1;
        this.particleWidth = 1;
        this.distanceRadius = 5000;

        this.friction = 0.50;
        this.ease = 0.1;

        this.gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);

        this.gradient.addColorStop(0.3, 'red');
        this.gradient.addColorStop(0.5, 'fuchsia');
        this.gradient.addColorStop(0.7, 'purple');

        this.ctx.fillStyle = this.gradient;
        this.ctx.strokeStyle = "white";
        this.ctx.font = "100px Comic Sans MS";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";

        this.addEventListeners();
        this.animate();
    }

    wrapText(text) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const linesArray = [];
        let lineCounter = 0;
        let line = '';
        const words = text.split(' ');

        for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + ' ';
            if (this.ctx.measureText(testLine).width > this.maxTextWidth) {
                line = words[i] + ' ';
                lineCounter++;
            } else {
                line = testLine;
            }
            linesArray[lineCounter] = line;
        }

        const textHeight = this.lineHeight * lineCounter;
        const textY = this.canvas.height / 2 - textHeight / 2;

        linesArray.forEach((el, index) => {
            this.ctx.fillText(el, this.canvas.width / 2, textY + index * this.lineHeight);
        });

        this.convertToParticle();
    }

    convertToParticle() {
        this.particles.length = 0;
        const textImageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height).data;

        for (let y = 0; y < this.canvas.height; y += this.particleSpacing) {
            for (let x = 0; x < this.canvas.width; x += this.particleSpacing) {
                const pixelIndex = (y * this.canvas.width + x) * 4;
                const alpha = textImageData[pixelIndex + 3];

                if (alpha > 0) {
                    this.particles.push({
                        x,
                        y,
                        initialX: x,
                        initialY: y,
                        color: `rgb(${textImageData[pixelIndex]}, ${textImageData[pixelIndex + 1]}, ${textImageData[pixelIndex + 2]})`,
                        velocity: { x: 0, y: 0 },
                    });
                }
            }
        }

        for (const particle of this.particles) {
            particle.velocity.x += Math.random() * -this.canvas.width * 2 + this.canvas.width;
            particle.velocity.y += Math.random() * -this.canvas.height * 2 + this.canvas.height;
        }
    }

    updateParticles() {
        for (const particle of this.particles) {
            const dx = (particle.velocity.x *= this.friction) + (particle.initialX - particle.x) * this.ease;
            const dy = (particle.velocity.y *= this.friction) + (particle.initialY - particle.y) * this.ease;
            particle.x += dx;
            particle.y += dy;
        }
    }

    moveParticle(mouseX, mouseY) {
        for (const particle of this.particles) {
            const dx = mouseX - particle.x;
            const dy = mouseY - particle.y;

            const distance = dx * dx + dy * dy;

            const push = -this.distanceRadius / distance;

            if (distance < this.distanceRadius) {
                const angle = Math.atan2(dy, dx);
                particle.velocity.x += push * Math.cos(angle);
                particle.velocity.y += push * Math.sin(angle);
                particle.x += (particle.velocity.x *= this.friction) + (particle.initialX - particle.x) * this.ease;
                particle.y += (particle.velocity.y *= this.friction) + (particle.initialY - particle.y) * this.ease;
            }

        }
    }

    addEventListeners() {
        this.canvas.addEventListener("touchmove", (e) => {
            const mouseX = e.touches[0].clientX - this.canvas.getBoundingClientRect().left;
            const mouseY = e.touches[0].clientY - this.canvas.getBoundingClientRect().top;
            this.moveParticle(mouseX, mouseY);
        });

        this.canvas.addEventListener("mousemove", (e) => {
            const mouseX = e.clientX - this.canvas.getBoundingClientRect().left;
            const mouseY = e.clientY - this.canvas.getBoundingClientRect().top;
            this.moveParticle(mouseX, mouseY);
        });

        this.input.addEventListener("keyup", (e) => {
            this.wrapText(e.target.value);
        });

        this.particleWidthInput.addEventListener("keyup", (e) => {
            this.wrapText("Hello world");
            if (!isNaN(e.target.value)) {
                this.particleWidth = parseInt(e.target.value);
            }
        });

        this.particleSpacingInput.addEventListener("keyup", (e) => {
            this.wrapText("Hello world");
            if (!isNaN(e.target.value)) {
                this.particleSpacing = parseInt(e.target.value);
            }
        });

        this.distanceRadiusInput.addEventListener("keyup", (e) => {
            this.wrapText("Hello world");
            if (!isNaN(parseInt(e.target.value))) {
                this.distanceRadius = parseInt(e.target.value);
            }
        });

        this.frictionInput.addEventListener("keyup", (e) => {
            this.wrapText("Hello world");
            if (!isNaN(e.target.value)) {
                this.friction = parseFloat(e.target.value);
            }
        });

        this.easeInput.addEventListener("keyup", (e) => {
            this.wrapText("Hello world");
            if (!isNaN(e.target.value)) {
                this.ease = parseFloat(e.target.value);
            }
        });

        this.wrapText("Hello world");
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.updateParticles();

        for (const particle of this.particles) {
            this.ctx.fillStyle = particle.color;
            this.ctx.fillRect(particle.x, particle.y, this.particleWidth, this.particleWidth);
        }
    }
}
const textParticleAnimation = new TextParticleAnimation("canvas", "text-input", "ease", "friction", "particleSpacing", "particleWidth", "distanceRadius");