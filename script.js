// FORÇA O SITE A FICAR NO TOPO ABSOLUTO SEM PULAR
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

if (window.location.hash) {
    window.scrollTo(0, 0);
    history.replaceState("", document.title, window.location.pathname + window.location.search);
}

window.scrollTo(0, 0);

document.addEventListener("DOMContentLoaded", () => {
    window.scrollTo(0, 0);
});

window.onload = function() {
    setTimeout(() => {
        window.scrollTo(0, 0);
    }, 50);
};


// ==========================================
// EFEITOS VISUAIS (GLOW E HEADER)
// ==========================================
const glow = document.createElement("div");
glow.classList.add("glow");
document.body.appendChild(glow);

document.addEventListener("mousemove", (e) => {
    glow.style.left = e.clientX + "px";
    glow.style.top = e.clientY + "px";
});

const header = document.querySelector("header");
window.addEventListener("scroll", () => {
    if(window.scrollY > 50){
        header.classList.add("ativo");
    } else {
        header.classList.remove("ativo");
    }
});


// ==========================================
// ANIMAÇÃO DE SURGIMENTO (REVEAL)
// ==========================================
const reveals = document.querySelectorAll(".reveal");
function reveal(){
    reveals.forEach((element) => {
        const top = element.getBoundingClientRect().top;
        const visible = 150;
        if(top < window.innerHeight - visible){
            element.classList.add("active");
        }
    });
}
window.addEventListener("scroll", reveal);
setTimeout(reveal, 200);


// ==========================================
// LÓGICA DO ÁLBUM EM GRID (3 COLUNAS)
// ==========================================
const lightbox = document.getElementById("lightbox");
const cardsPortfolio = document.querySelectorAll(".card");
const btnFechar = document.querySelector(".fechar-lightbox");
const lightboxContent = document.querySelector(".lightbox-content");

if(lightbox) {
    lightbox.classList.remove("ativo");
    lightbox.style.display = "none";
}

// Pré-carrega as imagens para evitar telas brancas
function preCarregarImagens(listaImagens) {
    listaImagens.forEach((url) => {
        const imgFake = new Image();
        imgFake.src = url;
    });
}

// Gera a lista de links baseado na sua pasta (ex: img/projeto1-1.png)
function gerarListaImagens(pasta, total) {
    let lista = [];
    for (let i = 1; i <= total; i++) {
        lista.push(`img/${pasta}-${i}.png`);
    }
    return lista;
}

// Pré-carregamento automático baseado nos atributos do HTML
cardsPortfolio.forEach(card => {
    const pasta = card.getAttribute("data-pasta");
    const total = parseInt(card.getAttribute("data-total"));
    
    if (pasta && total) {
        const listaDoCard = gerarListaImagens(pasta, total);
        preCarregarImagens(listaDoCard);
    }

    // Clique para abrir o Grid 3x3
    card.addEventListener("click", () => {
        const pastaCard = card.getAttribute("data-pasta");
        const totalCard = parseInt(card.getAttribute("data-total"));
        
        if (pastaCard && totalCard && lightboxContent) {
            const imagensAlbum = gerarListaImagens(pastaCard, totalCard);
            
            // Limpa as imagens antigas do container
            lightboxContent.innerHTML = "";
            
            // Injeta as imagens reais da pasta
            imagensAlbum.forEach((url) => {
                const novaImg = document.createElement("img");
                novaImg.src = url;
                novaImg.classList.add("galeria-img");
                
                novaImg.style.opacity = "0";
                novaImg.style.transition = "opacity 0.4s ease-in-out";
                
                lightboxContent.appendChild(novaImg);
                
                setTimeout(() => {
                    novaImg.style.opacity = "1";
                }, 50);
            });
            
            lightbox.style.display = "flex";
            lightbox.style.overflowY = "auto"; 
            
            setTimeout(() => {
                lightbox.classList.add("ativo");
            }, 10);
            
            document.body.style.overflow = "hidden";
        }
    });
});

function fecharAlbum() {
    if (lightbox) {
        lightbox.classList.remove("ativo");
        setTimeout(() => {
            lightbox.style.display = "none";
            if (lightboxContent) lightboxContent.innerHTML = "";
        }, 300);
        document.body.style.overflow = "auto";
    }
}

if(btnFechar) {
    btnFechar.addEventListener("click", fecharAlbum);
}

if(lightbox) {
    lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox || e.target.classList.contains('lightbox-content')) {
            fecharAlbum();
        }
    });
}

document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});


// ==========================================
// ENVIO SEGURO DE FORMULÁRIO (AJAX)
// ==========================================
const formFeedback = document.getElementById("feedback-form");
const btnEnviarFeedback = document.getElementById("btn-enviar-feedback");

if(formFeedback) {
    formFeedback.addEventListener("submit", function(e) {
        e.preventDefault(); 
        
        btnEnviarFeedback.disabled = true;
        btnEnviarFeedback.innerText = "Enviando com segurança...";

        const formData = new FormData(this);
        
        fetch("https://formspree.io/f/mojzggeg", {
            method: "POST",
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(response => {
            if (response.ok) {
                btnEnviarFeedback.innerText = "✓ Avaliação Enviada!";
                btnEnviarFeedback.style.background = "#25D366";
                btnEnviarFeedback.style.boxShadow = "0 0 15px #25D366";
                formFeedback.reset(); 
            } else {
                throw new Error('Erro no envio');
            }
        })
        .catch(error => {
            btnEnviarFeedback.disabled = false;
            btnEnviarFeedback.innerText = "Erro ao enviar. Tente novamente.";
            btnEnviarFeedback.style.background = "#ff007f";
        });
    });
}


// ==========================================
// INTERAÇÃO COM EMOJIS (Neymar 🖐️😜?)
// ==========================================
document.addEventListener('click', (e) => {
    if (e.target.closest('button') || e.target.closest('a') || e.target.closest('.card') || e.target.closest('.fechar-lightbox') || e.target.closest('.galeria-img')) {
        return;
    }

    const x = e.clientX;
    const y = e.clientY;
    const emojis = ['🖐️', '😜', '🤚'];

    emojis.forEach((emoji, index) => {
        const elemento = document.createElement('div');
        elemento.innerText = emoji;
        
        elemento.style.position = 'fixed';
        elemento.style.left = `${x}px`;
        elemento.style.top = `${y}px`;
        elemento.style.fontSize = '32px';
        elemento.style.pointerEvents = 'none';
        elemento.style.zIndex = '999999';
        elemento.style.transition = 'all 0.6s ease-out';
        
        document.body.appendChild(elemento);

        const direcaoX = (index - 1) * 45 + (Math.random() * 20 - 10);
        const direcaoY = -80 - (Math.random() * 30);

        setTimeout(() => {
            elemento.style.transform = `translate(${direcaoX}px, ${direcaoY}px) scale(1.4)`;
            elemento.style.opacity = '0';
        }, 30);

        setTimeout(() => {
            elemento.remove();
        }, 650);
    });
});


// ==========================================
// SISTEMA DE SEGURANÇA ANTI-PRINT AVANÇADO
// ==========================================
document.addEventListener('keydown', function(e) {
    // Se apertar PrintScreen (Key 44)
    if (e.key === "PrintScreen" || e.keyCode === 44) {
        e.preventDefault();
        
        // 🔒 ESTRELA O PRINT: Força a tela a ficar preta instantaneamente para estragar a captura
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
        
        // Remove a tela preta depois que ele fechar o alerta
        setTimeout(() => { capaPreta.remove(); }, 1000);
    }
    
    // Bloqueia Ctrl + P (Impressão / Salvar como PDF)
    if (e.ctrlKey && (e.key === 'p' || e.key === 'P' || e.keyCode === 80)) {
        e.preventDefault();
        alert("⚠️ Download ou cópia oculta bloqueada.");
    }

    // Bloqueia F12 e Inspect
    if (e.keyCode === 123 || (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'C' || e.key === 'J'))) {
        e.preventDefault();
    }
});

// Se ele tentar usar programas externos (tipo Lightshot ou a Ferramenta de Captura do Windows)
// O navegador perde o foco ('blur'). Quando isso ocorre, nós borramos tudo!
window.addEventListener('blur', () => {
    document.body.style.filter = 'blur(30px)'; // Borrão ultra pesado para ninguém ver nada de fundo
});

window.addEventListener('focus', () => {
    document.body.style.filter = 'none';
});


// ==========================================
// ANTI-INSPECIONAR DEFINITIVO
// ==========================================
const urlParams = new URLSearchParams(window.location.search);

if (window.location.hostname !== "127.0.0.1" && window.location.hostname !== "localhost" && !urlParams.has('inkspire-master-2026')) {
    setInterval(function() {
        console.clear();
    }, 1000);

    Object.defineProperty(window, 'console', {
        value: window.console,
        writable: false,
        configurable: false
    });
}