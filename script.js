gsap.registerPlugin(SplitText, ScrollTrigger);

function split(el) {
    return new SplitText(el, { type: "lines, chars" });
}

const texts = gsap.utils.toArray("h1");

// Flat registry of every line + its chars, used by both mouse and touch handling
const allLines = [];

function triggerEffect(charsInLine) {
    // 1. Trova l'indice centrale della riga
    const totalChars = charsInLine.length;
    const middleIndex = (totalChars - 1) / 2;

    charsInLine.forEach((char, index) => {
        if (!char.dataset.orig) {
            char.dataset.orig = char.textContent;
        }

        // 2. Calcola la distanza dal centro (il centro avrà distanza 0)
        const distanceFromCenter = Math.abs(index - middleIndex);

        gsap.fromTo(char, {color: "#000"},{
            color: gsap.utils.random([
                "#85AF00", 
                "#FFCC00", 
                "#FB9CFD", 
                "#A19BFF", 
                "#FF4C00"
            ]),
            ease: "power3.out",
            duration: 0.3,
            delay: distanceFromCenter * 0.03, 
            repeat: 1,
            yoyo: true,
            overwrite: "auto",

            onStart: () => {
                // Rimuove eventuali dettagli residui da un trigger precedente
                const oldDetail = char.querySelector(".detail-size");
                if (oldDetail) oldDetail.remove();

                const randomNum = gsap.utils.random(["0", "1"])
                const randomNumThree = gsap.utils.random(["0", "1", "2"])
                // Generazione di caratteri alternativi
                if(randomNum == 1) {
                    char.textContent = gsap.utils.random([
                        // Lettere minuscole
                        "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", 
                        "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",

                        // Lettere maiuscole
                        "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", 
                        "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",

                        // Numeri
                        "0", "1", "2", "3", "4", "5", "6", "7", "8", "9",

                        // Caratteri speciali
                        "<", ">", "%", "&", "@", "!", "#", "$", "^", "*", "(", ")", "-", 
                        "_", "+", "=", "{", "}", "[", "]", "|", "\\", ":", ";", "\"", 
                        "?", "/", "~", "`"
                        ]
                    );
                }

                // Generazione di dettagli ai caratteri
                if(randomNumThree == 1) {
                    const detail = document.createElement("span")
                    detail.classList.add("detail-size")
                    detail.textContent = `△x = ${char.clientWidth}px`
                    char.appendChild(detail)
                }

                // Generazione di bordi
                if(randomNumThree == 1) {
                    char.style.border = `1px solid ${gsap.utils.random(["#85AF00", "#FFCC00", "#FB9CFD", "#A19BFF", "#FF4C00"])}`
                }
            },

            onComplete: () => {
                char.textContent = char.dataset.orig;
                char.style.border = "none"
                const detail = char.querySelector(".detail-size");
                if (detail) detail.remove();
            }
        });
    });
}

texts.forEach((txt) => {
    const lineArray = split(txt);

    lineArray.lines.forEach((line) => {
        const charsInLine = lineArray.chars.filter((char) => line.contains(char));

        // Keep a flat lookup for touch handling
        allLines.push({ element: line, chars: charsInLine });

        // Desktop hover
        line.addEventListener("mouseenter", () => {
            triggerEffect(charsInLine);
        });
    });
});

// --- Mobile / touch support ---
// While a finger is down on the screen (dragging to scroll), the lines
// currently on screen glitch continuously. The moment the finger lifts,
// everything snaps back to normal — no lingering effect.

const CONTINUOUS_INTERVAL_MS = 180;
let continuousInterval = null;
let touchActive = false;

function getLinesInViewport() {
    return allLines.filter(({ element }) => {
        const rect = element.getBoundingClientRect();
        return rect.bottom > 0 && rect.top < window.innerHeight;
    });
}

function runContinuousEffect() {
    getLinesInViewport().forEach(({ chars }) => triggerEffect(chars));
}

function resetAllChars() {
    allLines.forEach(({ chars }) => {
        chars.forEach((char) => {
            gsap.killTweensOf(char);
            if (char.dataset.orig) char.textContent = char.dataset.orig;
            char.style.border = "none";
            char.style.color = "#000";
            const detail = char.querySelector(".detail-size");
            if (detail) detail.remove();
        });
    });
}

function startContinuousEffect() {
    if (touchActive) return;
    touchActive = true;
    runContinuousEffect();
    continuousInterval = setInterval(runContinuousEffect, CONTINUOUS_INTERVAL_MS);
}

function stopContinuousEffect() {
    touchActive = false;
    if (continuousInterval) {
        clearInterval(continuousInterval);
        continuousInterval = null;
    }
    resetAllChars();
}

document.addEventListener("touchstart", startContinuousEffect, { passive: true });
document.addEventListener("touchmove", startContinuousEffect, { passive: true });
document.addEventListener("touchend", stopContinuousEffect, { passive: true });
document.addEventListener("touchcancel", stopContinuousEffect, { passive: true });
