/**
 * useScrollReveal.js
 * Hook de React para activar animaciones de scroll reveal
 * usando Intersection Observer (sin dependencias externas).
 *
 * USO BÁSICO en cualquier componente:
 * ─────────────────────────────────────────────────────
 * import { useScrollReveal, useStaggerReveal } from './useScrollReveal';
 *
 * function MiSeccion() {
 *   useScrollReveal();   // activa .reveal-* en toda la página
 *   return <section>...</section>;
 * }
 *
 * CLASES DISPONIBLES (agregar al elemento JSX):
 * ─────────────────────────────────────────────────────
 *   .reveal-up      → aparece desde abajo
 *   .reveal-down    → aparece desde arriba
 *   .reveal-left    → aparece desde la derecha
 *   .reveal-right   → aparece desde la izquierda
 *   .reveal-scale   → aparece con zoom leve
 *
 * Con delays escalonados:
 *   .reveal-up.reveal-delay-1   (80ms)
 *   .reveal-up.reveal-delay-2   (160ms)
 *   .reveal-up.reveal-delay-3   (240ms)
 *   .reveal-up.reveal-delay-4   (320ms)
 *   .reveal-up.reveal-delay-5   (400ms)
 *   .reveal-up.reveal-delay-6   (480ms)
 *
 * EJEMPLO JSX:
 * ─────────────────────────────────────────────────────
 *   <h2 className="reveal-up">Título</h2>
 *   <p  className="reveal-up reveal-delay-1">Descripción</p>
 *   <div className="reveal-scale reveal-delay-2">Card</div>
 */

import { useEffect, useRef } from 'react';

// ─────────────────────────────────────────────────────
// Hook principal — observa TODOS los elementos .reveal-*
// Llamar UNA VEZ en App.jsx o en el layout raíz.
// ─────────────────────────────────────────────────────
export function useScrollReveal(options = {}) {
  useEffect(() => {
    const {
      threshold = 0.12,   // % del elemento visible para disparar
      rootMargin = '0px', // margen extra alrededor del viewport
      once = true,        // solo animar una vez (recomendado)
    } = options;

    const directions = ['up', 'down', 'left', 'right', 'scale'];
    const selector = directions.map(d => `.reveal-${d}`).join(', ');
    const elements = document.querySelectorAll(selector);

    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Detectar qué tipo de reveal tiene
            const el = entry.target;
            const dir = directions.find(d => el.classList.contains(`reveal-${d}`));
            if (dir) {
              el.classList.add(`reveal-${dir}--visible`);
            }
            if (once) observer.unobserve(el);
          } else if (!once) {
            // Revertir si once=false (útil para loops)
            const el = entry.target;
            directions.forEach(d => el.classList.remove(`reveal-${d}--visible`));
          }
        });
      },
      { threshold, rootMargin }
    );

    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);
}

// ─────────────────────────────────────────────────────
// Hook para secciones específicas con clases custom
// Activa clases --visible en elementos hijos con un selector dado.
//
// EJEMPLO:
//   useRevealSection('.inicio-card', { staggerMs: 80 });
//   useRevealSection('.inicio-informe-card', { staggerMs: 80 });
//   useRevealSection('.dash-card', { staggerMs: 60 });
//   useRevealSection('.post-card', { staggerMs: 70 });
//   useRevealSection('.glosario-item', { staggerMs: 40 });
//   useRevealSection('.bcra-kpi-card', { staggerMs: 80 });
// ─────────────────────────────────────────────────────
export function useRevealSection(selector, options = {}) {
  useEffect(() => {
    const {
      threshold = 0.08,
      staggerMs = 80,
      once = true,
    } = options;

    const elements = document.querySelectorAll(selector);
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            // Calcular delay según posición entre hermanos
            const siblings = [...(el.parentElement?.children || [])];
            const index = siblings.indexOf(el);
            const delay = index * staggerMs;

            setTimeout(() => {
              el.classList.add(`${selector.replace('.', '')}--visible`);
            }, delay);

            if (once) observer.unobserve(el);
          }
        });
      },
      { threshold }
    );

    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [selector]);
}

// ─────────────────────────────────────────────────────
// Hook para el header del monitor (animación de entrada)
// Llamar dentro del componente MonitorHeader o similar.
// ─────────────────────────────────────────────────────
export function useMonitorHeaderReveal() {
  useEffect(() => {
    const header = document.querySelector('.monitor-header');
    if (!header) return;
    // Pequeño delay para que la animación CSS tenga tiempo
    const t = requestAnimationFrame(() => {
      header.classList.add('monitor-header--mounted');
    });
    return () => cancelAnimationFrame(t);
  }, []);
}

// ─────────────────────────────────────────────────────
// Hook para animación del footer al llegar al final
// ─────────────────────────────────────────────────────
export function useFooterReveal() {
  useEffect(() => {
    const footer = document.querySelector('.footer');
    if (!footer) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          footer.classList.add('footer--visible');
          observer.unobserve(footer);
        }
      },
      { threshold: 0.05 }
    );

    observer.observe(footer);
    return () => observer.disconnect();
  }, []);
}

// ─────────────────────────────────────────────────────
// Hook para eyebrows con línea decorativa
// Activa la animación de la línea ::before al entrar en viewport.
// ─────────────────────────────────────────────────────
export function useEyebrowReveal() {
  useEffect(() => {
    const eyebrows = document.querySelectorAll(
      '.inicio-informes-eyebrow, .contacto-eyebrow'
    );
    if (!eyebrows.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add(`${[...entry.target.classList]
              .find(c => c.includes('eyebrow'))}--visible`);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    eyebrows.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

// ─────────────────────────────────────────────────────
// Hook para sección de contacto (reveal en dos columnas)
// ─────────────────────────────────────────────────────
export function useContactoReveal() {
  useEffect(() => {
    const left  = document.querySelector('.contacto-left');
    const right = document.querySelector('.contacto-right');
    if (!left && !right) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const side = entry.target.classList.contains('contacto-left') ? 'left' : 'right';
            entry.target.classList.add(`contacto-${side}--visible`);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (left)  observer.observe(left);
    if (right) observer.observe(right);
    return () => observer.disconnect();
  }, []);
}

// ─────────────────────────────────────────────────────
// GUÍA DE IMPLEMENTACIÓN EN App.jsx (o componente raíz)
// ─────────────────────────────────────────────────────
//
// import {
//   useScrollReveal,
//   useRevealSection,
//   useMonitorHeaderReveal,
//   useFooterReveal,
//   useEyebrowReveal,
//   useContactoReveal,
// } from './useScrollReveal';
//
// function App() {
//   // Activa .reveal-* genéricos en toda la página
//   useScrollReveal();
//
//   // Activa secciones con clases propias + stagger
//   useRevealSection('.inicio-card',        { staggerMs: 80 });
//   useRevealSection('.inicio-informe-card',{ staggerMs: 80 });
//   useRevealSection('.dash-card',          { staggerMs: 60 });
//   useRevealSection('.post-card',          { staggerMs: 70 });
//   useRevealSection('.glosario-item',      { staggerMs: 40 });
//   useRevealSection('.bcra-kpi-card',      { staggerMs: 80 });
//
//   // Animaciones puntuales
//   useMonitorHeaderReveal();
//   useFooterReveal();
//   useEyebrowReveal();
//   useContactoReveal();
//
//   return <div className="app">...</div>;
// }
//
// EJEMPLO JSX EN LA LANDING:
// ─────────────────────────────────────────────────────
// <!-- Sección informes — header -->
// <div className="inicio-informes-header reveal-up">
//   <div>
//     <p className="inicio-informes-eyebrow">Últimos informes</p>
//     <h2 className="inicio-informes-titulo">Análisis reciente</h2>
//   </div>
// </div>
//
// <!-- Contacto -->
// <div className="contacto-inner">
//   <div className="contacto-left">...</div>
//   <div className="contacto-right">...</div>
// </div>
//
// <!-- Elementos genéricos -->
// <h2 className="reveal-up">Título de sección</h2>
// <p  className="reveal-up reveal-delay-1">Párrafo</p>
// <div className="reveal-scale reveal-delay-2">Card genérica</div>
