// FORÇA O POSICIONAMENTO DA PÁGINA AO RECARREGAR
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

document.addEventListener("DOMContentLoaded", () => {

    // 1. REVEAL ANIMATION (ANIMAÇÃO AO ROLAR)
    const reveals = document.querySelectorAll(".reveal");
    function reveal() {
        reveals.forEach((element) => {
            const top = element.getBoundingClientRect().top;
            const visible = 120;
            if (top < window.innerHeight - visible) {
                element.classList.add("active");
            }
        });
    }
    window.addEventListener("scroll", reveal);
    reveal();

    // 2. EFEITO GLOW SEGUINDO O MOUSE NA TELA
    const glow = document.createElement("div");
    glow.classList.add("glow");
    document.body.appendChild(glow);

    document.addEventListener("mousemove", (e) => {
        glow.style.left = e.clientX + "px";
        glow.style.top = e.clientY + "px";
    });

    // 3. HEADER GLASSMORPHIC (ALTERAÇÃO AO ROLAR)
    const header = document.querySelector("header");
    if (header) {
        window.addEventListener("scroll", () => {
            if (window.scrollY > 50) {
                header.classList.add("ativo");
            } else {
                header.classList.remove("ativo");
            }
        });
    }

    // 4. MENU MOBILE TOGGLE
    const menuToggle = document.getElementById("mobile-menu");
    const navList = document.getElementById("nav-list");

    if (menuToggle && navList) {
        menuToggle.addEventListener("click", () => {
            navList.classList.toggle("ativo");
        });

        navList.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
                navList.classList.remove("ativo");
            });
        });
    }

    // 5. ROTAÇÃO DE ARTES NO MINI-CARD DA HERO (CANTO INFERIOR DIREITO)
    const miniImg = document.getElementById("mini-card-img");
    const miniTitle = document.getElementById("mini-card-title");
    const miniSub = document.getElementById("mini-card-subtitle");

    if (miniImg && miniTitle && miniSub) {
        const artes = [
            { img: "img/projeto1-1.png", title: "Uniforme Esportivo", subtitle: "Identidade Visual" },
            { img: "img/projeto2-2.png", title: "Campanhas Social Media", subtitle: "Social Media Design" },
            { img: "img/projeto3-1.png", title: "Artes Católicas", subtitle: "Divulgação & Eventos" }
        ];

        let indexArt = 0;
        setInterval(() => {
            indexArt = (indexArt + 1) % artes.length;
            miniImg.style.opacity = "0.2";
            miniImg.style.transform = "scale(0.96)";

            setTimeout(() => {
                miniImg.src = artes[indexArt].img;
                miniTitle.textContent = artes[indexArt].title;
                miniSub.textContent = artes[indexArt].subtitle;
                miniImg.style.opacity = "1";
                miniImg.style.transform = "scale(1)";
            }, 300);
        }, 3500);
    }

    // 6. GERENCIADOR DO LEQUE DENTRO DO MODAL LIGHTBOX
    const lightbox = document.getElementById("lightbox");
    const btnFechar = document.querySelector(".fechar-lightbox");
    const cardsGrid = document.querySelectorAll(".grid .card");

    let currentFanController = null;

    function abrirLequeNoModal(pasta, total) {
        const stage = document.getElementById("modalFanDeckStage");
        const dotsContainer = document.getElementById("modalFanDots");
        const wrapper = document.getElementById("modalFanDeckWrapper");
        const prevBtn = document.getElementById("modalFanPrev");
        const nextBtn = document.getElementById("modalFanNext");

        if (!stage || !wrapper) return;

        // Limpa o conteúdo anterior
        stage.innerHTML = "";
        if (dotsContainer) dotsContainer.innerHTML = "";

        // Cria as cartas PNG do álbum
        for (let i = 1; i <= total; i++) {
            const card = document.createElement("div");
            card.className = "fan-card";
            card.innerHTML = `
                <div class="fan-card-inner">
                    <img src="img/${pasta}-${i}.png" alt="Foto ${i}">
                    <div class="fan-card-glow"></div>
                </div>
            `;
            stage.appendChild(card);
        }

        lightbox.style.display = "flex";
        lightbox.classList.add("ativo");
        document.body.style.overflow = "hidden";

        // Inicializa a física do leque 3D para estas fotos
        currentFanController = createFanController({
            wrapper,
            stage,
            dotsContainer,
            prevBtn,
            nextBtn,
            totalCards: total
        });
    }

    function fecharModal() {
        if (lightbox) {
            lightbox.classList.remove("ativo");
            lightbox.style.display = "none";
            document.body.style.overflow = "auto";
            if (currentFanController && currentFanController.destroy) {
                currentFanController.destroy();
                currentFanController = null;
            }
        }
    }

    // Eventos de Abertura nos Cards da Grelha
    cardsGrid.forEach(card => {
        card.addEventListener("click", () => {
            const pasta = card.getAttribute("data-pasta");
            const total = parseInt(card.getAttribute("data-total"));
            if (pasta && total) {
                abrirLequeNoModal(pasta, total);
            }
        });
    });

    if (btnFechar) btnFechar.addEventListener("click", fecharModal);
    if (lightbox) {
        lightbox.addEventListener("click", (e) => {
            if (e.target === lightbox) fecharModal();
        });
    }
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") fecharModal();
    });

    // MOTORE DA FÍSICA DO LEQUE (0% CONSUMO CPU PARADO)
    function createFanController({ wrapper, stage, dotsContainer, prevBtn, nextBtn, totalCards }) {
        const cards = Array.from(stage.querySelectorAll(".fan-card"));
        
        const CONFIG = {
            angleStep: 14,
            activeLift: -40,
            activeScale: 1.1,
            maxVisibleSide: 2,
            inertiaFriction: 0.92,
            autoPlay: true,
            autoPlayDelay: 3500
        };

        let currentIndex = 0;
        let targetIndex = 0;
        let isDragging = false;
        let startX = 0, currentX = 0, lastX = 0, velocityX = 0;
        let animFrameId = null;
        let autoPlayTimer = null;

        // Criar Bolinhas (Dots)
        cards.forEach((_, i) => {
            const dot = document.createElement("div");
            dot.classList.add("fan-dot");
            if (i === 0) dot.classList.add("active");
            dot.addEventListener("click", () => goToCard(i));
            if (dotsContainer) dotsContainer.appendChild(dot);
        });

        const dots = dotsContainer ? Array.from(dotsContainer.querySelectorAll(".fan-dot")) : [];

        function render() {
            cards.forEach((card, i) => {
                let diff = i - currentIndex;
                while (diff < -totalCards / 2) diff += totalCards;
                while (diff > totalCards / 2) diff -= totalCards;

                const absDiff = Math.abs(diff);

                if (absDiff > CONFIG.maxVisibleSide + 0.8) {
                    card.style.opacity = "0";
                    card.style.pointerEvents = "none";
                    return;
                }

                const rotateDeg = diff * CONFIG.angleStep;
                const isCenter = absDiff < 0.5;
                const lift = isCenter ? CONFIG.activeLift : (1 - absDiff / CONFIG.maxVisibleSide) * 10;
                const scale = isCenter ? CONFIG.activeScale : Math.max(0.75, 1 - absDiff * 0.08);
                const opacity = Math.max(0, 1 - (absDiff - 1) * 0.6);
                const zIndex = 100 - Math.round(absDiff * 10);

                card.style.zIndex = zIndex;
                card.style.opacity = opacity.toFixed(2);
                card.style.pointerEvents = opacity > 0.3 ? "auto" : "none";
                card.style.transform = `rotate(${rotateDeg}deg) translateY(${lift}px) scale(${scale})`;

                if (Math.round(currentIndex + totalCards) % totalCards === i) {
                    card.classList.add("active-card");
                } else {
                    card.classList.remove("active-card");
                }
            });

            const activeRoundedIndex = (Math.round(currentIndex) % totalCards + totalCards) % totalCards;
            dots.forEach((dot, idx) => {
                dot.classList.toggle("active", idx === activeRoundedIndex);
            });
        }

        function animate() {
            if (isDragging) {
                let delta = (currentX - startX) / 180;
                currentIndex = targetIndex - delta;
                velocityX = (currentX - lastX) / 180;
                lastX = currentX;
            } else {
                if (Math.abs(velocityX) > 0.001) {
                    currentIndex -= velocityX;
                    velocityX *= CONFIG.inertiaFriction;
                    targetIndex = Math.round(currentIndex);
                } else {
                    currentIndex += (targetIndex - currentIndex) * 0.12;
                    if (Math.abs(targetIndex - currentIndex) < 0.0005) {
                        currentIndex = targetIndex;
                        cancelAnimationFrame(animFrameId);
                        animFrameId = null;
                    }
                }
            }

            render();

            if (animFrameId || isDragging || Math.abs(velocityX) > 0.001) {
                animFrameId = requestAnimationFrame(animate);
            }
        }

        function requestAnimationLoop() {
            if (!animFrameId) {
                animFrameId = requestAnimationFrame(animate);
            }
        }

        function goToCard(index) {
            let diff = index - (currentIndex % totalCards);
            while (diff < -totalCards / 2) diff += totalCards;
            while (diff > totalCards / 2) diff -= totalCards;

            targetIndex = currentIndex + diff;
            requestAnimationLoop();
            resetAutoPlay();
        }

        const handlePrev = () => goToCard(Math.round(currentIndex) - 1);
        const handleNext = () => goToCard(Math.round(currentIndex) + 1);

        if (prevBtn) prevBtn.addEventListener("click", handlePrev);
        if (nextBtn) nextBtn.addEventListener("click", handleNext);

        cards.forEach((card, i) => {
            card.addEventListener("click", (e) => {
                const activeIndex = (Math.round(currentIndex) % totalCards + totalCards) % totalCards;
                if (i !== activeIndex) {
                    e.preventDefault();
                    e.stopPropagation();
                    goToCard(i);
                }
            });

            card.addEventListener("mousemove", (e) => {
                const rect = card.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                card.style.setProperty("--mouse-x", `${x}%`);
                card.style.setProperty("--mouse-y", `${y}%`);
            });
        });

        function onPointerDown(e) {
            isDragging = true;
            startX = e.clientX || (e.touches && e.touches[0].clientX);
            currentX = startX;
            lastX = startX;
            velocityX = 0;
            targetIndex = currentIndex;
            stopAutoPlay();
            requestAnimationLoop();
        }

        function onPointerMove(e) {
            if (!isDragging) return;
            currentX = e.clientX || (e.touches && e.touches[0].clientX);
        }

        function onPointerUp() {
            if (!isDragging) return;
            isDragging = false;
            targetIndex = Math.round(currentIndex - velocityX * 5);
            resetAutoPlay();
        }

        wrapper.addEventListener("mousedown", onPointerDown);
        window.addEventListener("mousemove", onPointerMove);
        window.addEventListener("mouseup", onPointerUp);

        wrapper.addEventListener("touchstart", onPointerDown, { passive: true });
        window.addEventListener("touchmove", onPointerMove, { passive: true });
        window.addEventListener("touchend", onPointerUp);

        const handleKeyDown = (e) => {
            if (e.key === "ArrowLeft") goToCard(Math.round(currentIndex) - 1);
            if (e.key === "ArrowRight") goToCard(Math.round(currentIndex) + 1);
        };
        window.addEventListener("keydown", handleKeyDown);

        function startAutoPlay() {
            if (!CONFIG.autoPlay || autoPlayTimer) return;
            autoPlayTimer = setInterval(() => {
                goToCard(Math.round(currentIndex) + 1);
            }, CONFIG.autoPlayDelay);
        }

        function stopAutoPlay() {
            if (autoPlayTimer) {
                clearInterval(autoPlayTimer);
                autoPlayTimer = null;
            }
        }

        function resetAutoPlay() {
            stopAutoPlay();
            startAutoPlay();
        }

        // Primeira renderização e início do autoplay
        render();
        startAutoPlay();

        return {
            destroy() {
                stopAutoPlay();
                if (animFrameId) cancelAnimationFrame(animFrameId);
                wrapper.removeEventListener("mousedown", onPointerDown);
                window.removeEventListener("mousemove", onPointerMove);
                window.removeEventListener("mouseup", onPointerUp);
                window.removeEventListener("keydown", handleKeyDown);
            }
        };
    }

    // 7. FORMULÁRIO DE FEEDBACK AJAX
    const formFeedback = document.getElementById("feedback-form");
    const btnEnviarFeedback = document.getElementById("btn-enviar-feedback");

    if (formFeedback) {
        formFeedback.addEventListener("submit", function(e) {
            e.preventDefault();
            btnEnviarFeedback.disabled = true;
            btnEnviarFeedback.innerText = "Enviando...";

            const formData = new FormData(this);
            fetch("https://formspree.io/f/mojzggeg", {
                method: "POST",
                body: formData,
                headers: { 'Accept': 'application/json' }
            })
            .then(response => {
                if (response.ok) {
                    btnEnviarFeedback.innerText = "✓ Avaliação Enviada!";
                    btnEnviarFeedback.style.background = "#25D366";
                    formFeedback.reset();
                } else {
                    throw new Error('Erro no envio');
                }
            })
            .catch(() => {
                btnEnviarFeedback.disabled = false;
                btnEnviarFeedback.innerText = "Erro ao enviar. Tente novamente.";
            });
        });
    }
});

// ==========================================
// 8. TRAVAS DE SEGURANÇA E PROTEÇÃO ANTI-PRINT
// ==========================================

// Desativa o clique com o botão direito
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

// Bloqueios de Atalhos (PrintScreen, Ctrl+P, F12 e Inspect)
document.addEventListener('keydown', function(e) {
    if (e.key === "PrintScreen" || e.keyCode === 44) {
        e.preventDefault();
        const capaPreta = document.createElement("div");
        capaPreta.style.position = "fixed";
        capaPreta.style.top = "0";
        capaPreta.style.left = "0";
        capaPreta.style.width = "100vw";
        capaPreta.style.height = "100vh";
        capaPreta.style.background = "#04070f";
        capaPreta.style.zIndex = "99999999";
        document.body.appendChild(capaPreta);
        
        alert("⚠️ Proteção Inkspire: Capturas de tela não são permitidas para proteger os direitos autorais dos uniformes.");
        setTimeout(() => { capaPreta.remove(); }, 1000);
    }

    if (e.ctrlKey && (e.key === 'p' || e.key === 'P' || e.keyCode === 80)) {
        e.preventDefault();
        alert("⚠️ Download ou cópia oculta bloqueada.");
    }

    if (e.keyCode === 123 || (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'C' || e.key === 'J'))) {
        e.preventDefault();
    }
});

// Anti-Inspect por Console Loop
const urlParams = new URLSearchParams(window.location.search);
if (window.location.hostname !== "127.0.0.1" && window.location.hostname !== "localhost" && !urlParams.has('inkspire-master-2026')) {
    setInterval(function() {
        console.clear();
    }, 1000);
}