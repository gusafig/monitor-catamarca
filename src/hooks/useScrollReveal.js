/**
 * useScrollReveal.js
 * Hook de React para animaciones de scroll reveal.
 * Versión robusta: incluye fallback de seguridad para evitar
 * que los elementos queden invisibles si el observer falla
 * (por ejemplo cuando los datos llegan tarde de Supabase/API).
 */

import { useEffect } from 'react';

// ─────────────────────────────────────────────────────
// Utilidad interna: activa clase --visible en un elemento
// ─────────────────────────────────────────────────────
function activar(el, className) {
  if (!el || el.classList.contains(className)) return;
  el.classList.add(className);
}

// ─────────────────────────────────────────────────────
// Utilidad interna: observer + fallback de seguridad.
// Si en fallbackMs ms el elemento no fue activado por el
// observer, se activa igual — evita quedarse en opacity:0.
// ─────────────────────────────────────────────────────
function observarConFallback(elements, getClassName, observerOptions, fallbackMs) {
  if (!elements.length) return () => {};

  const timers = [];

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const className = getClassName(entry.target);
        if (className) activar(entry.target, className);
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  elements.forEach((el) => {
    observer.observe(el);
    // Fallback: activar de todas formas tras fallbackMs ms
    const t = setTimeout(() => {
      const className = getClassName(el);
      if (className) activar(el, className);
      observer.unobserve(el);
    }, fallbackMs);
    timers.push(t);
  });

  return () => {
    observer.disconnect();
    timers.forEach(clearTimeout);
  };
}

// ─────────────────────────────────────────────────────
// Hook principal — observa TODOS los .reveal-*
// Llamar UNA VEZ en App.js
// ─────────────────────────────────────────────────────
export function useScrollReveal() {
  useEffect(() => {
    const directions = ['up', 'down', 'left', 'right', 'scale'];
    const selector = directions.map(d => `.reveal-${d}`).join(', ');
    const elements = [...document.querySelectorAll(selector)];

    const cleanup = observarConFallback(
      elements,
      (el) => {
        const dir = directions.find(d => el.classList.contains(`reveal-${d}`));
        return dir ? `reveal-${dir}--visible` : null;
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' },
      1000
    );

    return cleanup;
  }, []);
}

// ─────────────────────────────────────────────────────
// Hook para secciones con stagger (cards, listas, etc.)
// ─────────────────────────────────────────────────────
export function useRevealSection(selector, options = {}) {
  useEffect(() => {
    const { staggerMs = 80 } = options;
    const elements = [...document.querySelectorAll(selector)];
    if (!elements.length) return;

    const visibleClass = selector.replace('.', '') + '--visible';
    const staggerTimers = [];

    const cleanup = observarConFallback(
      elements,
      (el) => {
        const siblings = [...(el.parentElement?.children || [])];
        const index = siblings.indexOf(el);
        const t = setTimeout(() => activar(el, visibleClass), index * staggerMs);
        staggerTimers.push(t);
        return null; // manejado por setTimeout
      },
      { threshold: 0.06, rootMargin: '0px 0px -20px 0px' },
      1500
    );

    return () => {
      cleanup();
      staggerTimers.forEach(clearTimeout);
    };
  }, [selector]); // eslint-disable-line
}

// ─────────────────────────────────────────────────────
// Hook para el footer
// ─────────────────────────────────────────────────────
export function useFooterReveal() {
  useEffect(() => {
    const footer = document.querySelector('.footer');
    if (!footer) return;
    return observarConFallback(
      [footer],
      () => 'footer--visible',
      { threshold: 0.02 },
      2000
    );
  }, []);
}

// ─────────────────────────────────────────────────────
// Hook para eyebrows con línea decorativa
// ─────────────────────────────────────────────────────
export function useEyebrowReveal() {
  useEffect(() => {
    const eyebrows = [...document.querySelectorAll(
      '.inicio-informes-eyebrow, .contacto-eyebrow'
    )];
    if (!eyebrows.length) return;

    return observarConFallback(
      eyebrows,
      (el) => {
        const cls = [...el.classList].find(c => c.includes('eyebrow'));
        return cls ? `${cls}--visible` : null;
      },
      { threshold: 0.1, rootMargin: '0px 0px -20px 0px' },
      1200
    );
  }, []);
}

// ─────────────────────────────────────────────────────
// Hook para sección de contacto — dos columnas
// ─────────────────────────────────────────────────────
export function useContactoReveal() {
  useEffect(() => {
    const left  = document.querySelector('.contacto-left');
    const right = document.querySelector('.contacto-right');
    const elements = [left, right].filter(Boolean);
    if (!elements.length) return;

    return observarConFallback(
      elements,
      (el) => {
        if (el.classList.contains('contacto-left'))  return 'contacto-left--visible';
        if (el.classList.contains('contacto-right')) return 'contacto-right--visible';
        return null;
      },
      { threshold: 0.05, rootMargin: '0px 0px -30px 0px' },
      1200
    );
  }, []);
}
