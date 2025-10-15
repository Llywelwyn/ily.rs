// oneko.js: https://github.com/adryd325/oneko.js

(function oneko() {
    const isReducedMotion =
        window.matchMedia(`(prefers-reduced-motion: reduce)`) === true ||
        window.matchMedia(`(prefers-reduced-motion: reduce)`).matches === true;

    if (isReducedMotion) return;

    const footprints = ['*', '.', ',', '`', ';', '"'];
    const heartColors = ['#ffaaaa', '#aaffaa', '#aaaaff'];

    const nekoEl = document.createElement("div");
    nekoEl.addEventListener('click', explodeHearts)

    let nekoPosX = 32;
    let nekoPosY = 32;

    let mousePosX = 0;
    let mousePosY = 0;

    let frameCount = 0;
    let idleTime = 0;
    let idleAnimation = null;
    let idleAnimationFrame = 0;

    const nekoSpeed = 10;
    const spriteSets = {
        idle: [[-3, -3]],
        alert: [[-7, -3]],
        scratchSelf: [
            [-5, 0],
            [-6, 0],
            [-7, 0],
        ],
        scratchWallN: [
            [0, 0],
            [0, -1],
        ],
        scratchWallS: [
            [-7, -1],
            [-6, -2],
        ],
        scratchWallE: [
            [-2, -2],
            [-2, -3],
        ],
        scratchWallW: [
            [-4, 0],
            [-4, -1],
        ],
        tired: [[-3, -2]],
        sleeping: [
            [-2, 0],
            [-2, -1],
        ],
        N: [
            [-1, -2],
            [-1, -3],
        ],
        NE: [
            [0, -2],
            [0, -3],
        ],
        E: [
            [-3, 0],
            [-3, -1],
        ],
        SE: [
            [-5, -1],
            [-5, -2],
        ],
        S: [
            [-6, -3],
            [-7, -2],
        ],
        SW: [
            [-5, -3],
            [-6, -1],
        ],
        W: [
            [-4, -2],
            [-4, -3],
        ],
        NW: [
            [-1, 0],
            [-1, -1],
        ],
    };

    function init() {
        nekoEl.id = "oneko";
        nekoEl.ariaHidden = true;
        nekoEl.style.width = "32px";
        nekoEl.style.height = "32px";
        nekoEl.style.position = "fixed";
        nekoEl.style.pointerEvents = "auto";
        nekoEl.style.imageRendering = "pixelated";
        nekoEl.style.left = `${nekoPosX - 16}px`;
        nekoEl.style.top = `${nekoPosY - 16}px`;
        nekoEl.style.zIndex = 2147483646;

        let nekoFile = "./oneko.gif"
        const curScript = document.currentScript
        if (curScript && curScript.dataset.cat) {
            nekoFile = curScript.dataset.cat
        }
        nekoEl.style.backgroundImage = `url(${nekoFile})`;

        document.body.appendChild(nekoEl);

        document.addEventListener("mousemove", function(event) {
            mousePosX = event.clientX;
            mousePosY = event.clientY;
        });

        window.requestAnimationFrame(onAnimationFrame);

        const style = document.createElement('style');
        style.innerHTML = `
		  @keyframes heartBurst {
			  0% { transform: scale(0); opacity: 1; }
			  100% { transform: scale(1); opacity: 0; }
		  }
		  .heart {
			  font-size: 2em;
			  animation: heartBurst 1s ease-out;
		  }

          @keyframes fadePrints {
              0% { opacity: 0.75; }
              100% { opacity: 0; }
          }

          .oneko-element {
              position: absolute;
              pointer-events: none;
              z-index: 2147483645;
              animation-fill-mode: forwards;
          }

          .footprint {
              animation: fadePrints 3s ease-out;
          }
	  `;

        document.head.appendChild(style);
    }

    let lastFrameTimestamp;

    function onAnimationFrame(timestamp) {
        // Stops execution if the neko element is removed from DOM
        if (!nekoEl.isConnected) {
            return;
        }
        if (!lastFrameTimestamp) {
            lastFrameTimestamp = timestamp;
        }
        if (timestamp - lastFrameTimestamp > 100) {
            lastFrameTimestamp = timestamp
            frame()
        }
        window.requestAnimationFrame(onAnimationFrame);
    }

    function setSprite(name, frame) {
        const sprite = spriteSets[name][frame % spriteSets[name].length];
        nekoEl.style.backgroundPosition = `${sprite[0] * 32}px ${sprite[1] * 32}px`;
    }

    function resetIdleAnimation() {
        idleAnimation = null;
        idleAnimationFrame = 0;
    }

    function idle() {
        idleTime += 1;

        // every ~ 20 seconds
        if (
            idleTime > 10 &&
            Math.floor(Math.random() * 200) == 0 &&
            idleAnimation == null
        ) {
            let availableIdleAnimations = ["sleeping", "scratchSelf"];
            if (nekoPosX < 32) {
                availableIdleAnimations.push("scratchWallW");
            }
            if (nekoPosY < 32) {
                availableIdleAnimations.push("scratchWallN");
            }
            if (nekoPosX > window.innerWidth - 32) {
                availableIdleAnimations.push("scratchWallE");
            }
            if (nekoPosY > window.innerHeight - 32) {
                availableIdleAnimations.push("scratchWallS");
            }
            idleAnimation =
                availableIdleAnimations[
                Math.floor(Math.random() * availableIdleAnimations.length)
                ];
        }

        switch (idleAnimation) {
            case "sleeping":
                if (idleAnimationFrame < 8) {
                    setSprite("tired", 0);
                    break;
                }
                setSprite("sleeping", Math.floor(idleAnimationFrame / 4));
                if (idleAnimationFrame > 192) {
                    resetIdleAnimation();
                }
                break;
            case "scratchWallN":
            case "scratchWallS":
            case "scratchWallE":
            case "scratchWallW":
            case "scratchSelf":
                setSprite(idleAnimation, idleAnimationFrame);
                if (idleAnimationFrame > 9) {
                    resetIdleAnimation();
                }
                break;
            default:
                setSprite("idle", 0);
                return;
        }
        idleAnimationFrame += 1;
    }


    function explodeHearts() {
        const parent = nekoEl.parentElement;
        const rect = nekoEl.getBoundingClientRect();
        const scrollLeft = window.scrollX || document.documentElement.scrollLeft;
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const centerX = rect.left + rect.width / 2 + scrollLeft;
        const centerY = rect.top + rect.height / 2 + scrollTop;

        for (let i = 0; i < 10; i++) {
            const rotation = document.createElement('div');
            rotation.style.position = 'absolute';
            rotation.style.transform = `rotate(${(Math.random() - 0.5) * 20}deg)`;
            rotation.style.left = `${centerX + ((Math.random() - 0.5) * 40) - 16}px`;
            rotation.style.top = `${centerY + ((Math.random() - 0.5) * 40) - 16}px`;
            const heart = document.createElement('div');
            heart.classList.add('oneko-element', 'heart');
            heart.textContent = '❤';
            heart.style.color = heartColors[Math.floor(Math.random() * heartColors.length)];
            rotation.appendChild(heart);
            parent.appendChild(rotation);
            setTimeout(() => {
                parent.removeChild(rotation);
            }, 1000);
        }
    }


    function temporary_sprite_at(x, y, ms) {
        const tmp = document.createElement("div");
        tmp.style.left = `${x - 6 + (window.scrollX || document.documentElement.scrollLeft)}px`;
        tmp.style.top = `${y - 6 + (window.scrollY || document.documentElement.scrollTop)}px`;
        tmp.classList.add('oneko-element');
        nekoEl.parentElement.appendChild(tmp);
        setTimeout(() => {
            if (tmp.parentElement) {
                tmp.parentElement.removeChild(tmp);
            }
        }, ms);
        return tmp;
    }

    function footprint(x, y) {
        const mark = temporary_sprite_at(x, y, 3000);
        mark.textContent = footprints[Math.floor(Math.random() * footprints.length)];
        mark.classList.add('footprint');
    }

    function frame() {
        frameCount += 1;
        const diffX = nekoPosX - mousePosX;
        const diffY = nekoPosY - mousePosY;
        const distance = Math.sqrt(diffX ** 2 + diffY ** 2);

        if (distance < nekoSpeed || distance < 48) {
            idle();
            return;
        }

        idleAnimation = null;
        idleAnimationFrame = 0;

        if (idleTime > 1) {
            setSprite("alert", 0);
            // count down after being alerted before moving
            idleTime = Math.min(idleTime, 7);
            idleTime -= 1;
            return;
        }

        let direction;
        direction = diffY / distance > 0.5 ? "N" : "";
        direction += diffY / distance < -0.5 ? "S" : "";
        direction += diffX / distance > 0.5 ? "W" : "";
        direction += diffX / distance < -0.5 ? "E" : "";
        setSprite(direction, frameCount);

        if (frameCount % 1 === 0) footprint(nekoPosX, nekoPosY);

        nekoPosX -= (diffX / distance) * nekoSpeed;
        nekoPosY -= (diffY / distance) * nekoSpeed;

        nekoPosX = Math.min(Math.max(16, nekoPosX), window.innerWidth - 16);
        nekoPosY = Math.min(Math.max(16, nekoPosY), window.innerHeight - 16);

        nekoEl.style.left = `${nekoPosX - 16}px`;
        nekoEl.style.top = `${nekoPosY - 16}px`;
    }

    init();
})();
