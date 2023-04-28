const startBtn = document.getElementById("startBtn");
const imgOverlay = document.getElementById("overlay");
const modeBtn = document.getElementsByClassName("mode")
const difBtn = document.getElementsByClassName("btn");
const welcomeMsg = document.getElementById("welcomeMassage");
const allDifBtn = document.getElementById("allDifBtn")
const highscore = document.getElementById("highscore")
let viewScore = localStorage.getItem("highscore");

let diff = ["Medium"];
let mode = ["EggSavior"];

for (let i = 0; i < difBtn.length; i++) {
    difBtn[i].addEventListener("click", function (e) {
        diff.splice(0, 1)
        diff.push(e.target.innerText);
        let current = document.getElementsByClassName("active");
        current[0].className = current[0].className.replace(" active", "");
        this.className += " active";
        console.log(diff)
    })
}
for (let i = 0; i < modeBtn.length; i++) {
    modeBtn[i].addEventListener("click", function (e) {
        mode.splice(0, 1)
        mode.push(e.target.innerText);
        let current = document.getElementsByClassName("activeM");
        current[0].className = current[0].className.replace(" activeM", "");
        this.className += " activeM";
        console.log(mode)
        if (e.target.innerText == "EggMania") {
            allDifBtn.style.display = "none"
            highscore.style.display = "block";
            if(viewScore > 0){
                highscore.innerText = `Today highscore : ${viewScore}`
            } else {
                highscore.innerText = `Today highscore : ${0}`
            }
        } else if (e.target.innerText != "EggMania") {
            allDifBtn.style.display = "block"
            highscore.style.display = "none"
        }
    })
}

startBtn.addEventListener("click", function () {

    const canvas = document.getElementById("canvas1");

    welcomeMsg.style.display = "none"
    canvas.style.position = "absolute"
    imgOverlay.style.position = "absolute"
    canvas.classList.toggle("display")
    imgOverlay.classList.toggle("display");

    const ctx = canvas.getContext("2d");
    canvas.width = 1280;
    canvas.height = 720;

    ctx.fillStyle = "white";
    ctx.lineWidth = 3;
    ctx.strokeStyle = "black"
    ctx.font = "40px Rubik Wet Paint"
    ctx.textAlign = "center";

    class Player {
        constructor(game) {
            this.game = game;
            this.collisionX = this.game.width * 0.5;
            this.collisionY = this.game.height * 0.5;
            this.collisionRadius = 30;
            this.speedX = 0;
            this.speedY = 0;
            this.dx = 0
            this.dy = 0
            this.speedModifier = 3;
            this.spriteWidth = 255;
            this.spriteHeight = 256;
            this.width = this.spriteWidth;
            this.height = this.spriteHeight;
            this.spriteX;
            this.spriteY;
            this.frameX = 0;
            this.frameY = 0;
            this.image = document.getElementById("bull")
        }
        restart() {
            this.collisionX = this.game.width * 0.5;
            this.collisionY = this.game.height * 0.5;
            this.spriteX = this.collisionX - this.width * 0.5;
            this.spriteY = this.collisionY - this.height * 0.5 - 100;
        }
        draw(context) {
            context.drawImage(this.image, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, this.spriteX, this.spriteY, this.width, this.height)
            if (this.game.debug) {
                context.beginPath();
                context.arc(this.collisionX, this.collisionY, this.collisionRadius, 0, Math.PI * 2)
                context.save();
                context.globalAlpha = 0.5;
                context.fill();
                context.restore();
                context.stroke();
                context.beginPath();
                context.moveTo(this.collisionX, this.collisionY);
                context.lineTo(this.game.mouse.x, this.game.mouse.y);
                context.stroke()
            }
        }
        update() {
            this.dx = this.game.mouse.x - this.collisionX;
            this.dy = this.game.mouse.y - this.collisionY;
            // sprite animation
            const angle = Math.atan2(this.dy, this.dx);
            if (angle < -2.74 || angle > 2.74) this.frameY = 6;
            else if (angle < -1.96) this.frameY = 7;
            else if (angle < -1.17) this.frameY = 0;
            else if (angle < -0.39) this.frameY = 1;
            else if (angle < 0.39) this.frameY = 2;
            else if (angle < 1.17) this.frameY = 3;
            else if (angle < 1.96) this.frameY = 4;
            else if (angle < 2.74) this.frameY = 5;

            const distance = Math.hypot(this.dy, this.dx);
            if (distance > this.speedModifier) {
                this.speedX = this.dx / distance || 0;
                this.speedY = this.dy / distance || 0;
            } else {
                this.speedX = 0
                this.speedY = 0
            }
            this.collisionX += this.speedX * this.speedModifier;
            this.collisionY += this.speedY * this.speedModifier;
            this.spriteX = this.collisionX - this.width * 0.5;
            this.spriteY = this.collisionY - this.height * 0.5 - 100;

            // horizontal boundaries
            if (this.collisionX < this.collisionRadius) this.collisionX = this.collisionRadius;
            else if (this.collisionX > this.game.width - this.collisionRadius) this.collisionX = this.game.width - this.collisionRadius

            // vertical boundaries
            if (this.collisionY < this.game.topMargin + this.collisionRadius) this.collisionY = this.game.topMargin + this.collisionRadius;
            else if (this.collisionY > this.game.height - this.collisionRadius) this.collisionY = this.game.height - this.collisionRadius;

            // Collisions with obstacles
            this.game.obstacles.forEach(obstacle => {
                // [(distance < sumOfRadii), distance, sumOfRadii, dx, dy];
                let [collision, distance, sumOfRadii, dx, dy] = this.game.checkCollision(this, obstacle)
                if (collision) {
                    const unit_x = dx / distance;
                    const unit_y = dy / distance;
                    this.collisionX = obstacle.collisionX + (sumOfRadii + 1) * unit_x;
                    this.collisionY = obstacle.collisionY + (sumOfRadii + 1) * unit_y;
                }
            })
        }
    }

    class Obstacle {
        constructor(game) {
            this.game = game;
            this.collisionX = Math.random() * this.game.width;
            this.collisionY = Math.random() * this.game.height;
            this.collisionRadius = 30;
            this.image = document.getElementById("obstacles");
            this.spriteWidth = 250;
            this.spriteHeight = 250;
            this.width = this.spriteWidth;
            this.height = this.spriteHeight;
            this.spriteX = this.collisionX - this.width * 0.5;
            this.spriteY = this.collisionY - this.height * 0.5 - 70;
            this.frameX = Math.floor(Math.random() * 4);
            this.frameY = Math.floor(Math.random() * 3);
        }
        draw(context) {
            context.drawImage(this.image, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, this.spriteX, this.spriteY, this.width, this.height)
            if (this.game.debug) {
                context.beginPath();
                context.arc(this.collisionX, this.collisionY, this.collisionRadius, 0, Math.PI * 2)
                context.save();
                context.globalAlpha = 0.5;
                context.fill();
                context.restore();
                context.stroke();
            }
        }
        update() {

        }
    }

    class Egg {
        constructor(game) {
            this.game = game;
            this.collisionRadius = 40;
            this.margin = this.collisionRadius * 2;
            this.collisionX = this.margin + (Math.random() * (this.game.width - this.margin * 2));
            this.collisionY = this.game.topMargin + (Math.random() * (this.game.height - this.game.topMargin - this.margin));
            this.image = document.getElementById("egg");
            this.spriteWidth = 110;
            this.spriteHeight = 135;
            this.width = this.spriteWidth
            this.height = this.spriteHeight
            this.spriteX;
            this.spriteY;
            this.hatchTimer = 0;
            this.hatchInterval = 10000;
            this.markedForDeletion = false;
        }
        draw(context) {
            context.drawImage(this.image, this.spriteX, this.spriteY);
            if (this.game.debug) {
                context.beginPath();
                context.arc(this.collisionX, this.collisionY, this.collisionRadius, 0, Math.PI * 2)
                context.save();
                context.globalAlpha = 0.5;
                context.fill();
                context.restore();
                context.stroke();
                const displayTimer = (this.hatchTimer * 0.001).toFixed(0);
                context.save();
                context.font = "40px monospace";
                context.fillText(displayTimer, this.collisionX, this.collisionY - this.collisionRadius * 2.5);
                context.restore();
            }
        }
        update(deltaTime) {
            this.spriteX = this.collisionX - this.width * 0.5;
            this.spriteY = this.collisionY - this.height * 0.5 - 30;
            // collision
            let collisonObjects = [this.game.player, ...this.game.obstacles, ...this.game.enemies]
            collisonObjects.forEach(object => {
                let [collision, distance, sumOfRadii, dx, dy] = this.game.checkCollision(this, object);
                if (collision) {
                    const unit_x = dx / distance;
                    const unit_y = dy / distance;
                    this.collisionX = object.collisionX + (sumOfRadii + 1) * unit_x;
                    this.collisionY = object.collisionY + (sumOfRadii + 1) * unit_y;
                }
            });
            // hatching
            if (this.hatchTimer > this.hatchInterval || this.collisionY < this.game.topMargin) {
                this.game.hatchlings.push(new Larva(this.game, this.collisionX, this.collisionY))
                this.markedForDeletion = true;
                this.game.removeGameObjects();
            } else {
                this.hatchTimer += deltaTime * 3;
            }
        }
    }

    class Larva {
        constructor(game, x, y) {
            this.game = game;
            this.collisionX = x;
            this.collisionY = y;
            this.collisionRadius = 30;
            this.image = document.getElementById("larva");
            this.spriteWidth = 150;
            this.spriteHeight = 150;
            this.width = this.spriteWidth;
            this.height = this.spriteHeight;
            this.spriteX;
            this.spriteY;
            this.speedY = 1 + Math.random();
            this.frameX = 0;
            this.frameY = Math.floor(Math.random() * 2);
        }
        draw(context) {
            context.drawImage(this.image, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, this.spriteX, this.spriteY, this.width, this.height);
            if (this.game.debug) {
                context.beginPath();
                context.arc(this.collisionX, this.collisionY, this.collisionRadius, 0, Math.PI * 2)
                context.save();
                context.globalAlpha = 0.5;
                context.fill();
                context.restore();
                context.stroke();
            }
        }
        update() {
            this.collisionY -= this.speedY;
            this.spriteX = this.collisionX - this.width * 0.5;
            this.spriteY = this.collisionY - this.height * 0.5 - 40;
            // move to safety position
            if (this.collisionY < this.game.topMargin) {
                this.markedForDeletion = true;
                this.game.removeGameObjects();
                if (!this.game.gameOver) this.game.score++;
                if (this.game.score >= this.game.winningScore) {
                    window.addEventListener("keydown", e => {
                        if (e.key == "r") this.game.restart();
                        else if (e.key == "x") window.location.reload()
                    })
                }
                if ((this.game.time * 0.001).toFixed(0) >= this.game.timeInterval) {
                    window.addEventListener("keydown", e => {
                        if (e.key == "x") window.location.reload()
                    })
                }
                for (let i = 0; i < 3; i++) {
                    this.game.particles.push(new Firefly(this.game, this.collisionX, this.collisionY, "yellow"));
                }
            }
            // collision with object
            let collisonObjects = [this.game.player, ...this.game.obstacles]
            collisonObjects.forEach(object => {
                let [collision, distance, sumOfRadii, dx, dy] = this.game.checkCollision(this, object);
                if (collision) {
                    const unit_x = dx / distance;
                    const unit_y = dy / distance;
                    this.collisionX = object.collisionX + (sumOfRadii + 1) * unit_x;
                    this.collisionY = object.collisionY + (sumOfRadii + 1) * unit_y;
                }
            });
            // collision with enemies
            this.game.enemies.forEach(enemy => {
                if (this.game.checkCollision(this, enemy)[0] && !this.game.gameOver) {
                    this.markedForDeletion = true;
                    this.game.removeGameObjects();
                    this.game.lostHatchlings++;
                    for (let i = 0; i < 10; i++) {
                        this.game.particles.push(new Spark(this.game, this.collisionX, this.collisionY, "purple"));
                    }
                }
            });
        }
    }

    class Enemy {
        constructor(game) {
            this.game = game;
            this.collisionRadius = 30;
            this.speedX = Math.random() * 3 + 0.5;
            this.image = document.getElementById("toads");
            this.spriteWidth = 140;
            this.spriteHeight = 260;
            this.width = this.spriteWidth;
            this.height = this.spriteHeight;
            this.collisionX = this.game.width + this.width + Math.random() * this.game.width * 0.5;
            this.collisionY = this.game.topMargin + (Math.random() * (this.game.height - this.game.topMargin));
            this.spriteX;
            this.spriteY;
            this.frameX = 0;
            this.frameY = Math.floor(Math.random() * 4);
        }
        draw(context) {
            context.drawImage(this.image, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, this.spriteX, this.spriteY, this.width, this.height);
            if (this.game.debug) {
                context.beginPath();
                context.arc(this.collisionX, this.collisionY, this.collisionRadius, 0, Math.PI * 2)
                context.save();
                context.globalAlpha = 0.5;
                context.fill();
                context.restore();
                context.stroke();
            }
        }
        update() {
            this.spriteX = this.collisionX - this.width * 0.5;
            this.spriteY = this.collisionY - this.height + 40;
            this.collisionX -= this.speedX;
            if (this.spriteX + this.width < 0 && !this.game.gameOver) {
                this.collisionX = this.game.width + this.width + Math.random() * this.game.width * 0.5;
                this.collisionY = this.game.topMargin + (Math.random() * (this.game.height - this.game.topMargin));
                this.frameY = Math.floor(Math.random() * 4);
            }
            let collisonObjects = [this.game.player, ...this.game.obstacles]
            collisonObjects.forEach(object => {
                let [collision, distance, sumOfRadii, dx, dy] = this.game.checkCollision(this, object);
                if (collision) {
                    const unit_x = dx / distance;
                    const unit_y = dy / distance;
                    this.collisionX = object.collisionX + (sumOfRadii + 1) * unit_x;
                    this.collisionY = object.collisionY + (sumOfRadii + 1) * unit_y;
                }
            });
        }
    }

    class Particle {
        constructor(game, x, y, color) {
            this.game = game;
            this.collisionX = x;
            this.collisionY = y;
            this.color = color;
            this.radius = Math.floor(Math.random() * 10 + 5);
            this.speedX = Math.random() * 6 - 3;
            this.speedY = Math.random() * 2 + 0.5;
            this.angle = 0;
            this.va = Math.random() * 0.1 + 0.01;
            this.markedForDeletion = false;
        }
        draw(context) {
            context.save();
            context.fillStyle = this.color;
            context.beginPath();
            context.arc(this.collisionX, this.collisionY, this.radius, 0, Math.PI * 2)
            context.fill();
            context.stroke();
            context.restore();
        }
    }

    class Firefly extends Particle {
        update() {
            this.angle += this.va;
            this.collisionX += Math.cos(this.angle) * this.speedX;
            this.collisionY -= this.speedY;
            if (this.collisonY < 0 - this.radius) {
                this.markedForDeletion = true;
                this.game.removeGameObjects();
            }
        }
    }

    class Spark extends Particle {
        update() {
            this.angle += this.va * 0.5;
            this.collisionX -= Math.sin(this.angle) * this.speedX;
            this.collisionY -= Math.cos(this.angle) * this.speedY;
            if (this.radius > 0.1) this.radius -= 0.05;
            if (this.radius < 0.2) {
                this.markedForDeletion = true;
                this.game.removeGameObjects();
            }
        }
    }

    class Game {
        constructor(canvas) {
            this.canvas = canvas;
            this.width = this.canvas.width;
            this.height = this.canvas.height;
            this.topMargin = 260;
            this.debug = false;
            this.player = new Player(this);
            this.gm = [];
            this.time = 0;
            this.timeInterval = 100;
            this.difficult = []
            this.fps = 70;
            this.timer = 0;
            this.interval = 1000 / this.fps;
            this.eggTimer = 0;
            this.eggInterval = 1000;
            this.numberOfObstacles = 10;
            this.maxEggs = 5;
            this.obstacles = [];
            this.eggs = [];
            this.enemies = [];
            this.hatchlings = [];
            this.particles = [];
            this.gameObjects = [];
            this.score = 0;
            this.gameOver = false;
            this.winningScore = 20;
            this.lostHatchlings = 0;
            this.lhDifficult = [];
            this.mouse = {
                x: this.width * 0.5,
                y: this.height * 0.5,
                pressed: false
            }

            // Event Listener
            canvas.addEventListener("mousedown", e => {
                this.mouse.x = e.offsetX
                this.mouse.y = e.offsetY
                this.mouse.pressed = true
            })
            canvas.addEventListener("mouseup", e => {
                this.mouse.x = e.offsetX
                this.mouse.y = e.offsetY
                this.mouse.pressed = false
            })
            canvas.addEventListener("mousemove", e => {
                if (this.mouse.pressed) {
                    this.mouse.x = e.offsetX
                    this.mouse.y = e.offsetY
                }
            })
            window.addEventListener("keydown", e => {
                if (e.key == "D") this.debug = !this.debug;
            })
        }
        gameMode() {
            this.gm.push(mode);
            if (this.gm == "EggMania") this.maxEggs += 5;
        }
        difficulty() {
            this.difficult.push(diff);
            // eggsavior
            if (diff == "Easy") this.lhDifficult.push(8);
            else if (diff == "Medium") this.lhDifficult.push(8);
            else if (diff == "Hard") this.lhDifficult.push(6);
            else if (diff == "Hell") this.lhDifficult.push(6);
            else if (diff == "Heaven") this.lhDifficult.push(3);
        }

        EggManiaRender(context, deltaTime) {
            if (this.timer > this.interval) {
                context.clearRect(0, 0, this.width, this.height);
                this.gameObjects = [this.player, ...this.eggs, ...this.hatchlings];
                // sort by vertically
                this.gameObjects.sort((a, b) => {
                    return a.collisionY - b.collisionY;
                });
                this.gameObjects.forEach(object => {
                    object.draw(context);
                    object.update(deltaTime);
                });

                this.timer = 0;
            }
            this.timer += deltaTime;

            // adds eggs periodically
            if (this.eggTimer > this.eggInterval && this.eggs.length < this.maxEggs && !this.gameOver) {
                this.addEgg();
                this.eggTimer = 0;
            } else {
                this.eggTimer += deltaTime;
            }

            // show time
            if (this.mouse.pressed) {
                this.time += deltaTime
            }
            const displayTime = (this.time * 0.001).toFixed(0);
            context.save();
            context.textAlign = "center"
            context.font = "40px monospace";
            context.fillText(displayTime, 640, 50);
            context.restore();

            // draw status text
            context.save();
            context.textAlign = "left";
            context.fillText("Score: " + this.score, 25, 75);
            context.restore();

            // win / lose massage
            if (displayTime >= this.timeInterval) {
                this.gameOver = true;
                context.save();
                context.fillStyle = "rgba(0, 0, 0, 0.5)";
                context.fillRect(0, 0, this.width, this.height);
                context.fillStyle = "white";
                context.textAlign = "center";
                context.shadowOffsetX = 4;
                context.shadowOffsetY = 4;
                context.shadowBlur = 8;
                context.shadowColor = "blue";
                let massage1 = "Great Job! You cracked It!";
                let massage2 = `You collected ${this.score}eggs.`;
                context.font = "85px Rubik Burned"
                context.fillText(massage1, this.width * 0.5, this.height * 0.5 - 20);
                context.font = "30px Rubik Wet Paint"
                context.fillText(massage2, this.width * 0.5, this.height * 0.5 + 30);
                context.fillText(`Final score: ${this.score}. press 'X' to EXIT.`, this.width * 0.5, this.height * 0.5 + 80);
                context.restore();
                localStorage.setItem("highscore", `${this.score}`)
            }
        }

        EggSaviorRender(context, deltaTime) {
            if (this.timer > this.interval) {
                context.clearRect(0, 0, this.width, this.height);
                this.gameObjects = [this.player, ...this.eggs, ...this.obstacles, ...this.enemies, ...this.hatchlings, ...this.particles];
                // sort by vertically
                this.gameObjects.sort((a, b) => {
                    return a.collisionY - b.collisionY;
                });
                this.gameObjects.forEach(object => {
                    object.draw(context);
                    object.update(deltaTime);
                });

                this.timer = 0;
            }
            this.timer += deltaTime;
            // adds eggs periodically
            if (this.eggTimer > this.eggInterval && this.eggs.length < this.maxEggs && !this.gameOver) {
                this.addEgg();
                this.eggTimer = 0;
            } else {
                this.eggTimer += deltaTime;
            }
            // draw status text
            context.save();
            context.textAlign = "left";
            context.fillText("Score: " + this.score, 25, 50);
            context.fillText("Lost: " + this.lostHatchlings, 25, 100);
            context.restore();

            // win / lose massage
            if (this.score >= this.winningScore) {
                this.gameOver = true;
                context.save();
                context.fillStyle = "rgba(0, 0, 0, 0.5)";
                context.fillRect(0, 0, this.width, this.height);
                context.fillStyle = "white";
                context.textAlign = "center";
                context.shadowOffsetX = 4;
                context.shadowOffsetY = 4;
                context.shadowBlur = 8;
                context.shadowColor = "blue";
                let massage1;
                let massage2;
                if (this.lostHatchlings <= this.lhDifficult) {
                    // win
                    massage1 = "Congratulations! You won!";
                    massage2 = `You bullied the bullies!`;
                } else {
                    // lose
                    context.shadowOffsetX = 4;
                    context.shadowOffsetY = 4;
                    context.shadowBlur = 8;
                    context.shadowColor = "red";
                    massage1 = "Oh no! You lost!";
                    massage2 = `You have ${this.lostHatchlings} hatchlings left! Don't be a pushover!`;
                }
                context.font = "85px Rubik Burned"
                context.fillText(massage1, this.width * 0.5, this.height * 0.5 - 20);
                context.font = "30px Rubik Wet Paint"
                context.fillText(massage2, this.width * 0.5, this.height * 0.5 + 30);
                context.fillText(`Final score: ${this.score}. press 'R' to butt heads again or press 'X' to EXIT.`, this.width * 0.5, this.height * 0.5 + 80);
                context.restore();
            }
        }
        checkCollision(a, b) {
            const dx = a.collisionX - b.collisionX;
            const dy = a.collisionY - b.collisionY;
            const distance = Math.hypot(dy, dx);
            const sumOfRadii = a.collisionRadius + b.collisionRadius;
            return [(distance < sumOfRadii), distance, sumOfRadii, dx, dy];
        }
        addEgg() {
            this.eggs.push(new Egg(this));
        }
        addEnemy() {
            this.enemies.push(new Enemy(this));
        }
        removeGameObjects() {
            this.eggs = this.eggs.filter(object => !object.markedForDeletion);
            this.hatchlings = this.hatchlings.filter(object => !object.markedForDeletion);
            this.particles = this.particles.filter(object => !object.markedForDeletion);
        }
        restart() {
            this.player.restart();
            this.obstacles = [];
            this.eggs = [];
            this.enemies = [];
            this.hatchlings = [];
            this.particles = [];
            this.mouse = {
                x: this.width * 0.5,
                y: this.height * 0.5,
                pressed: false
            }
            this.score = 0;
            this.lostHatchlings = 0;
            this.gameOver = false;
            this.init();
        }
        init() {
            if (this.gm == "EggSavior" || this.gm == "Eggless") {
                if (this.difficult == "Easy") {
                    for (let i = 0; i < 4; i++) {
                        this.addEnemy();
                    }
                } else if (this.difficult == "Medium") {
                    for (let i = 0; i < 8; i++) {
                        this.addEnemy();
                    }
                } else if (this.difficult == "Hard") {
                    for (let i = 0; i < 12; i++) {
                        this.addEnemy();
                    }
                } else if (this.difficult == "Hell") {
                    for (let i = 0; i < 40; i++) {
                        this.addEnemy();
                    }
                }
            }
            let attempts = 0;
            if (this.gm == "EggSavior" || this.gm == "Eggless") {
                while (this.obstacles.length < this.numberOfObstacles && attempts < 500) {
                    let testObstacles = new Obstacle(this);
                    let overlap = false;
                    this.obstacles.forEach(obstacles => {
                        const dx = testObstacles.collisionX - obstacles.collisionX;
                        const dy = testObstacles.collisionY - obstacles.collisionY;
                        const distance = Math.hypot(dy, dx);
                        const distanceBuffer = 150
                        const sumOfRadii = testObstacles.collisionRadius + obstacles.collisionRadius + distanceBuffer;
                        if (distance < sumOfRadii) {
                            overlap = true;
                        }
                    });
                    const margin = testObstacles.collisionRadius * 3;
                    if (!overlap && testObstacles.spriteX > 0 && testObstacles.spriteX < this.width - testObstacles.width && testObstacles.collisionY > this.topMargin + margin && testObstacles.collisionY < this.height - margin) {
                        this.obstacles.push(testObstacles);
                    }
                    attempts++;
                }
            }
        }
    }

    const game = new Game(canvas);
    game.gameMode();
    game.difficulty();
    game.init();
    console.log(game);

    let lastTime = 0;
    function animate(timeStamp) {
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;

        if (game.gm == "EggSavior") game.EggSaviorRender(ctx, deltaTime);
        if (game.gm == "EggMania") game.EggManiaRender(ctx, deltaTime);

        requestAnimationFrame(animate);
    }
    animate(0);
});