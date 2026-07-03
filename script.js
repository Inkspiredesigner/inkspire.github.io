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
// LÓGICA DO ÁLBUM DINÂMICA (AUTOMATIZADA)
// ==========================================
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const btnFechar = document.querySelector(".fechar-lightbox");
const dotsContainer = document.getElementById("dots-container");
const cardsPortfolio = document.querySelectorAll(".card");

let imagensAlbum = [];
let indexAtual = 0;
let temporizadorSlide = null;

if(lightbox) {
    lightbox.classList.remove("ativo");
    lightbox.style.display = "none";
}

// Pré-carrega as imagens geradas para evitar lentidão ou telas brancas ao clicar
function preCarregarImagens(listaImagens) {
    listaImagens.forEach((url) => {
        const imgFake = new Image();
        imgFake.src = url;
    });
}

// Função auxiliar interna para gerar o array de links baseado na pasta e no total
function gerarListaImagens(pasta, total) {
    let lista = [];
    for (let i = 1; i <= total; i++) {
        lista.push(`img/${pasta}-${i}.png`);
    }
    return lista;
}

// Executa o pré-carregamento automático de todos os cards assim que a página lê o script
cardsPortfolio.forEach(card => {
    const pasta = card.getAttribute("data-pasta");
    const total = parseInt(card.getAttribute("data-total"));
    
    if (pasta && total) {
        const listaDoCard = gerarListaImagens(pasta, total);
        preCarregarImagens(listaDoCard);
    }

    // Evento de clique para abrir o Lightbox reconstruído
    card.addEventListener("click", () => {
        const pastaCard = card.getAttribute("data-pasta");
        const totalCard = parseInt(card.getAttribute("data-total"));
        
        if (pastaCard && totalCard) {
            // Cria a lista de fotos dinamicamente
            imagensAlbum = gerarListaImagens(pastaCard, totalCard);
            indexAtual = 0;
            
            gerarPontinhos();
            mostrarImagem(indexAtual);
            
            lightbox.style.display = "flex";
            setTimeout(() => {
                lightbox.classList.add("ativo");
            }, 10);
            
            document.body.style.overflow = "hidden";
            
            if (imagensAlbum.length > 1) {
                iniciarSlideAutomatico();
            }
        }
    });
});

function iniciarSlideAutomatico() {
    pararSlideAutomatico();
    temporizadorSlide = setInterval(() => {
        proximaImagem();
    }, 3500);
}

function pararSlideAutomatico() {
    if (temporizadorSlide) {
        clearInterval(temporizadorSlide);
    }
}

function gerarPontinhos() {
    dotsContainer.innerHTML = ""; 
    if (imagensAlbum.length <= 1) return;

    imagensAlbum.forEach((_, index) => {
        const dot = document.createElement("div");
        dot.classList.add("dot");
        if (index === indexAtual) dot.classList.add("dot-ativo");
        dotsContainer.appendChild(dot);
    });
}

function atualizarPontinhos() {
    const dots = dotsContainer.querySelectorAll(".dot");
    dots.forEach((dot, index) => {
        if (index === indexAtual) {
            dot.classList.add("dot-ativo");
        } else {
            dot.classList.remove("dot-ativo");
        }
    });
}

function mostrarImagem(index) {
    if(imagensAlbum[index]) {
        lightboxImg.classList.remove("foto-visivel");
        
        setTimeout(() => {
            lightboxImg.src = imagensAlbum[index];
            lightboxImg.classList.add("foto-visivel");
            atualizarPontinhos();
        }, 200);
    }
}

function proximaImagem() {
    indexAtual = (indexAtual + 1) % imagensAlbum.length;
    mostrarImagem(indexAtual);
}

function fecharAlbum() {
    pararSlideAutomatico();
    lightbox.classList.remove("ativo");
    lightboxImg.classList.remove("foto-visivel");
    setTimeout(() => {
        lightbox.style.display = "none";
    }, 300);
    document.body.style.overflow = "auto";
}

btnFechar.addEventListener("click", fecharAlbum);
lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox || e.target.classList.contains('lightbox-content')) fecharAlbum();
});

document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});


// ==========================================
// ENVIO SEGURO E OCULTO DE FORMULÁRIO (AJAX)
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
// SISTEMA DE SEGURANÇA ANTI-PRINT E PROTEÇÃO
// ==========================================

// 1. Bloquear teclas e atalhos perigosos de captura e inspeção
document.addEventListener('keydown', function(e) {
    if (e.key === "PrintScreen" || e.keyCode === 44) {
        e.preventDefault();
        alert("⚠️ Proteção Inkspire: Capturas de tela não são permitidas para proteger os direitos autorais dos projetos.");
    }
    
    if (e.ctrlKey && (e.key === 'p' || e.key === 'P' || e.keyCode === 80)) {
        e.preventDefault();
        alert("⚠️ Impressão bloqueada para proteção das artes.");
    }

    if (e.keyCode === 123 || (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'C' || e.key === 'J'))) {
        e.preventDefault();
    }
});

// 2. Desfocar o site se o usuário mudar de janela ou tentar usar uma ferramenta externa
window.addEventListener('blur', () => {
    document.body.style.filter = 'blur(15px)';
});

window.addEventListener('focus', () => {
    document.body.style.filter = 'none';
});


// =======================================================
// ANTI-INSPECIONAR CORRIGIDO E SEGURO 🕵️‍♂️
// =======================================================
const urlParams = new URLSearchParams(window.location.search);

if (window.location.hostname !== "127.0.0.1" && window.location.hostname !== "localhost" && !urlParams.has('inkspire-master-2026')) {

    // Cria um objeto que monitora se o console tentou renderizar o ID dele
    const devtools = { aberto: false };
    const elementoItem = /./;
    elementoItem.toString = function() {
        devtools.aberto = true;
    };

    setInterval(function() {
        devtools.aberto = false;
        // Tenta mandar o elemento pro console. Se o console estiver aberto, o toString() roda!
        console.log(elementoItem);
        console.clear(); // Limpa para o usuário não ver nada

        if (devtools.aberto) {
            document.body.innerHTML = `
                <div style="
                    height: 100vh; 
                    display: flex; 
                    flex-direction: column;
                    align-items: center; 
                    justify-content: center; 
                    background: #0b1020; 
                    color: #ffdf00; 
                    font-family: 'Poppins', sans-serif;
                    text-align: center;
                    padding: 20px;
                ">
                    <h2>⚠️ Acesso Bloqueado</h2>
                    <p style="color: #fff;">O uso das ferramentas de desenvolvedor é proibido neste portfólio.</p>
                    <button onclick="window.location.reload()" style="
                        background: #009c3b; 
                        color: white; 
                        border: none; 
                        padding: 10px 20px; 
                        border-radius: 5px; 
                        cursor: pointer;
                        margin-top: 15px;
                    ">Recarregar Site</button>
                </div>
            `;
        }
    }, 1000);
}