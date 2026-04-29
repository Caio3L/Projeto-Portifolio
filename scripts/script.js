/* ============================================================
   SCRIPT.JS — Portfólio Caio Lobato
   Funcionalidades:
     1. Tema claro/escuro com persistência (localStorage)
     2. Header com efeito glassmorphism ao rolar
     3. Menu hambúrguer para mobile
     4. Link ativo no menu conforme a seção visível
     5. Scroll suave para seções
     6. Animações ao rolar (Intersection Observer)
     7. Validação simples do formulário de contato
     8. Ano atual no rodapé
   ============================================================ */

'use strict';

/* ============================================================
   1. TEMA CLARO / ESCURO
   ============================================================ */
const botaoTema  = document.getElementById('botao-tema');
const htmlEl     = document.documentElement; // <html data-theme="...">

function normalizarTema(tema) {
  if (tema === 'escuro') return 'dark';
  if (tema === 'claro') return 'light';
  return tema === 'light' ? 'light' : 'dark';
}

function aplicarTema(tema) {
  const temaNormalizado = normalizarTema(tema);
  htmlEl.setAttribute('data-theme', temaNormalizado);
  const icone = botaoTema.querySelector('i');
  if (icone) {
    icone.className = temaNormalizado === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
  }
  botaoTema.setAttribute('title', temaNormalizado === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro');
}

// Carrega tema salvo ou preferência do sistema
const temaSalvo = localStorage.getItem('tema');
const prefEscuro = window.matchMedia('(prefers-color-scheme: dark)').matches;
const temaInicial = normalizarTema(temaSalvo) || (prefEscuro ? 'dark' : 'light');
aplicarTema(temaInicial);

botaoTema.addEventListener('click', () => {
  const temaAtual = htmlEl.getAttribute('data-theme');
  const novoTema  = temaAtual === 'dark' ? 'light' : 'dark';
  aplicarTema(novoTema);
  localStorage.setItem('tema', novoTema);
});

/* ============================================================
   2. HEADER COM GLASSMORPHISM AO ROLAR
   ============================================================ */
const header = document.getElementById('header');

function atualizarHeader() {
  if (window.scrollY > 20) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
}

window.addEventListener('scroll', atualizarHeader, { passive: true });
atualizarHeader(); // Executa no carregamento caso já esteja com scroll

/* ============================================================
   3. MENU HAMBÚRGUER (MOBILE)
   ============================================================ */
const menuEl       = document.getElementById('menu');
const hamburger    = document.getElementById('menu-hamburguer');

function fecharMenu() {
  menuEl.classList.remove('open');
  hamburger.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
}

hamburger.addEventListener('click', () => {
  const estaAberto = menuEl.classList.toggle('open');
  hamburger.classList.toggle('open', estaAberto);
  hamburger.setAttribute('aria-expanded', String(estaAberto));
});

// Fecha o menu ao clicar em qualquer link
menuEl.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', fecharMenu);
});

// Fecha ao clicar fora do menu
document.addEventListener('click', (e) => {
  if (!header.contains(e.target)) {
    fecharMenu();
  }
});

// Garante que o menu mobile não fique "preso" ao voltar para desktop
window.addEventListener('resize', () => {
  if (window.innerWidth > 768) {
    fecharMenu();
  }
});

/* ============================================================
   4. LINK ATIVO + SCROLL SUAVE
   ============================================================ */
const navLinks = document.querySelectorAll('#menu .nav-link');
const sections = document.querySelectorAll('main section[id]');

// Scroll suave com offset do header fixo
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href');
    if (!href.startsWith('#')) return;
    e.preventDefault();

    const target = document.querySelector(href);
    if (!target) return;

    const offset = header.offsetHeight + 16;
    const top    = target.getBoundingClientRect().top + window.scrollY - offset;

    window.scrollTo({ top, behavior: 'smooth' });
  });
});

// Destaca o link ativo conforme a seção visível
const observerNav = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const id = entry.target.getAttribute('id');
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
    });
  });
}, {
  rootMargin: `-${(header?.offsetHeight || 68) + 20}px 0px -60% 0px`,
  threshold: 0,
});

sections.forEach(sec => observerNav.observe(sec));

/* ============================================================
   5. ANIMAÇÕES DE SCROLL (Intersection Observer)
   ============================================================ */
const revealElements = document.querySelectorAll('.reveal');

const observerReveal = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observerReveal.unobserve(entry.target); // anima apenas uma vez
    }
  });
}, {
  threshold: 0.12,
  rootMargin: '0px 0px -40px 0px',
});

revealElements.forEach(el => observerReveal.observe(el));

/* ============================================================
   6. VALIDAÇÃO DO FORMULÁRIO DE CONTATO
   ============================================================ */
const formContato = document.getElementById('form-contato');
const btnEnviar   = document.getElementById('btn-enviar');

if (formContato) {
  formContato.addEventListener('submit', (e) => {
    e.preventDefault();

    const nome     = document.getElementById('input-nome').value.trim();
    const email    = document.getElementById('input-email').value.trim();
    const mensagem = document.getElementById('input-mensagem').value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!nome || !email || !mensagem) {
      mostrarFeedback('Por favor, preencha todos os campos.', 'erro');
      return;
    }

    if (!emailRegex.test(email)) {
      mostrarFeedback('Por favor, insira um e-mail válido.', 'erro');
      return;
    }

    // Simula envio (pode integrar com EmailJS, Formspree, etc.)
    btnEnviar.disabled = true;
    btnEnviar.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Enviando...';

    setTimeout(() => {
      mostrarFeedback('Mensagem enviada com sucesso! Em breve entrarei em contato. 🎉', 'sucesso');
      formContato.reset();
      btnEnviar.disabled = false;
      btnEnviar.innerHTML = 'Enviar mensagem <i class="fa-solid fa-paper-plane"></i>';
    }, 1800);
  });
}

function mostrarFeedback(texto, tipo) {
  // Remove feedback anterior, se houver
  const anterior = document.querySelector('.form-feedback');
  if (anterior) anterior.remove();

  const el = document.createElement('p');
  el.className = 'form-feedback';
  el.textContent = texto;
  el.style.cssText = `
    margin-top: -8px;
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 0.88rem;
    font-weight: 500;
    background: ${tipo === 'sucesso' ? 'rgba(56,189,248,0.12)' : 'rgba(255,100,100,0.1)'};
    color: ${tipo === 'sucesso' ? '#38bdf8' : '#ff6b6b'};
    border: 1px solid ${tipo === 'sucesso' ? 'rgba(56,189,248,0.25)' : 'rgba(255,100,100,0.2)'};
  `;

  btnEnviar.insertAdjacentElement('beforebegin', el);

  setTimeout(() => el.remove(), 5000);
}

/* ============================================================
   7. ANO ATUAL NO RODAPÉ
   ============================================================ */
const spanAno = document.getElementById('ano-atual');
if (spanAno) {
  spanAno.textContent = new Date().getFullYear();
}