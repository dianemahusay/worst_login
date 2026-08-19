let enteredUsername = "";
let enteredPassword = "";
let activeTarget = "username";
const pool = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split("");

const rainContainer = document.getElementById('rain-container');
const usernameDisplay = document.getElementById('username-display');
const passwordDisplay = document.getElementById('password-display');
const submitBtn = document.getElementById('btn-submit');
const termsBox = document.getElementById('terms-box');
const mathProblem = document.getElementById('math-problem');
const gameOverlay = document.getElementById('game-overlay');

// Audio Handler
const customClickAudio = new Audio('malunggay-pandesal.mp3');
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playPopSound() {
    if (customClickAudio.src && !customClickAudio.error) {
        const clone = customClickAudio.cloneNode();
        clone.play().catch(() => playSynthPop());
    } else {
        playSynthPop();
    }
}

function playSynthPop() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(450, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(900, audioCtx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.08);
}

function setActiveTarget(target) {
    activeTarget = target;
    if (target === 'username') {
        usernameDisplay.classList.add('active-field');
        passwordDisplay.classList.remove('active-field');
    } else {
        passwordDisplay.classList.add('active-field');
        usernameDisplay.classList.remove('active-field');
    }
}

// Initialize math verification challenge
const num1 = Math.floor(10 + Math.random() * 89);
const num2 = Math.floor(10 + Math.random() * 89);
const correctSolution = (num1 + num2).toString();
mathProblem.textContent = `${num1} + ${num2} = ?`;

function spawnClover() {
    const cloverWrapper = document.createElement('div');
    cloverWrapper.className = 'clover-wrapper';

    const cloverShape = document.createElement('div');
    cloverShape.className = 'clover-shape';
    cloverWrapper.appendChild(cloverShape);

    const letterInner = document.createElement('span');
    letterInner.className = 'clover-letter';
    const randomChar = pool[Math.floor(Math.random() * pool.length)];
    letterInner.textContent = randomChar;
    cloverWrapper.appendChild(letterInner);

    cloverWrapper.style.left = Math.random() * 90 + "vw";
    let topPosition = -95;
    cloverWrapper.style.top = topPosition + "px";

    const speed = 1.5 + Math.random() * 3;
    const sway = (Math.random() - 0.5) * 1.5;

    cloverWrapper.addEventListener('mousedown', () => {
        playPopSound();

        if (activeTarget === 'username') {
            enteredUsername += randomChar;
            usernameDisplay.textContent = enteredUsername;
        } else {
            enteredPassword += randomChar;
            passwordDisplay.textContent = "•".repeat(enteredPassword.length);
        }

        cloverShape.style.background = '#39ff14';
        cloverWrapper.style.transform = 'scale(1.8)';
        setTimeout(() => cloverWrapper.remove(), 100);
    });

    rainContainer.appendChild(cloverWrapper);

    function fall() {
        if (!cloverWrapper.parentNode) return;
        topPosition += speed;
        let currentLeft = parseFloat(cloverWrapper.style.left);
        cloverWrapper.style.left = (currentLeft + sway) + "vw";
        cloverWrapper.style.top = topPosition + "px";

        if (topPosition < window.innerHeight) {
            requestAnimationFrame(fall);
        } else {
            cloverWrapper.remove();
        }
    }
    requestAnimationFrame(fall);
}

setInterval(spawnClover, 240);

function clearUser() {
    enteredUsername = "";
    usernameDisplay.textContent = "";
}

function clearPass() {
    enteredPassword = "";
    passwordDisplay.textContent = "";
}

// Runaway button mechanic
submitBtn.addEventListener('mouseover', () => {
    if (!termsBox.checked) {
        const randomX = Math.floor((Math.random() - 0.5) * 200);
        const randomY = Math.floor((Math.random() - 0.5) * 40);
        submitBtn.style.transform = `translate(${randomX}px, ${randomY}px)`;
    } else {
        submitBtn.style.transform = `translate(0px, 0px)`;
    }
});

// Verification & Triggering the Minigame
submitBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (!termsBox.checked) {
        alert("Error: Please agree to the check box first.");
        return;
    }
    if (enteredUsername.trim() === "") {
        alert("Error: Username is required.");
        return;
    }
    if (enteredPassword.trim() === "") {
        alert("Error: Password is required.");
        return;
    }

    const userMathGuess = prompt("Please enter the calculation answer to confirm humanity:");
    if (userMathGuess === correctSolution) {
        gameOverlay.style.display = 'flex';
        startFlappyBird();
    } else {
        alert("DENIED: You are not from Earth.");
    }
});

// Flappy Bird Engine
const canvas = document.getElementById('flappy-canvas');
const ctx = canvas.getContext('2d');
let bird, pipes, score, gameLoopId, isGameOver;

function startFlappyBird() {
    bird = { x: 40, y: 150, radius: 10, velocity: 0, gravity: 0.35, jump: -6 };
    pipes = [];
    score = 0;
    isGameOver = false;

    pipes.push({ x: canvas.width, top: 90, bottom: canvas.height - 90 - 100, passed: false });

    window.removeEventListener('keydown', handleFlapKey);
    window.addEventListener('keydown', handleFlapKey);
    canvas.onmousedown = flap;

    if (gameLoopId) cancelAnimationFrame(gameLoopId);
    runGame();
}

function flap() {
    if (!isGameOver) {
        bird.velocity = bird.jump;
    }
}

function handleFlapKey(e) {
    if (e.code === 'Space') {
        e.preventDefault();
        flap();
    }
}

function runGame() {
    ctx.fillStyle = '#70c5ce';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ded895';
    ctx.fillRect(0, canvas.height - 20, canvas.width, 20);

    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    ctx.fillStyle = '#ffcc00';
    ctx.beginPath();
    ctx.arc(bird.x, bird.y, bird.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.stroke();

    for (let i = 0; i < pipes.length; i++) {
        let p = pipes[i];
        p.x -= 2;

        ctx.fillStyle = '#2e8b57';
        ctx.strokeStyle = '#000';
        ctx.fillRect(p.x, 0, 40, p.top);
        ctx.strokeRect(p.x, 0, 40, p.top);

        ctx.fillRect(p.x, canvas.height - p.bottom, 40, p.bottom);
        ctx.strokeRect(p.x, canvas.height - p.bottom, 40, p.bottom);

        if (
            bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + 40 &&
            (bird.y - bird.radius < p.top || bird.y + bird.radius > canvas.height - p.bottom)
        ) {
            failChallenge();
            return;
        }

        if (!p.passed && p.x + 40 < bird.x) {
            p.passed = true;
            score++;
            if (score >= 3) {
                passChallenge();
                return;
            }
        }
    }

    if (pipes.length > 0 && pipes[pipes.length - 1].x < canvas.width - 140) {
        let pipeGap = 100;
        let topH = Math.floor(Math.random() * (canvas.height - pipeGap - 80)) + 30;
        let botH = canvas.height - topH - pipeGap;
        pipes.push({ x: canvas.width, top: topH, bottom: botH, passed: false });
    }

    if (pipes.length > 0 && pipes[0].x < -50) {
        pipes.shift();
    }

    if (bird.y + bird.radius >= canvas.height - 20 || bird.y - bird.radius <= 0) {
        failChallenge();
        return;
    }

    ctx.fillStyle = '#000';
    ctx.font = 'bold 16px Courier New';
    ctx.fillText(`Target: 3 | Score: ${score}`, 10, 25);

    gameLoopId = requestAnimationFrame(runGame);
}

function failChallenge() {
    isGameOver = true;
    cancelAnimationFrame(gameLoopId);
    alert("Malunggay Bird Failed!\nReseting progress :D...");
    gameOverlay.style.display = 'none';
    clearUser();
    clearPass();
}

function passChallenge() {
    cancelAnimationFrame(gameLoopId);
    gameOverlay.style.display = 'none';
    alert(`🎉 SUCCESS!\nWelcome back, ${enteredUsername}. login verified.`);
    window.location.reload();
}