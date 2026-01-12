// src/components/HeroCarousel.jsx
'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

/**
 * Props:
 * - images: array of image URLs
 * - interval: milliseconds between autoslides (default 4500)
 * - height: CSS height for hero (default '460px' desktop)
 */
export default function HeroCarousel({ images = [], interval = 4500, height = '460px' }) {
  const slides = Array.isArray(images) && images.length ? images : ['/placeholder.png'];
  // we will clone first slide at end for smooth infinite loop
  const extended = [...slides, slides[0]];
  const [index, setIndex] = useState(0); // logical index (0..slides.length-1)
  const [animating, setAnimating] = useState(true);
  const containerRef = useRef(null);
  const timerRef = useRef(null);

  // touch swipe state
  const startX = useRef(0);
  const currentTranslate = useRef(0);
  const dragging = useRef(false);

  const slideCount = slides.length;

  // helper to go to a particular index (0..slideCount-1)
  const goTo = (i, withAnim = true) => {
    setAnimating(withAnim);
    setIndex(i);
  };

  const next = () => goTo((index + 1) % slideCount, true);
  const prev = () => goTo((index - 1 + slideCount) % slideCount, true);

  // autoplay timer
  useEffect(() => {
    startAutoplay();
    return stopAutoplay;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, slideCount]);

  function startAutoplay() {
    stopAutoplay();
    timerRef.current = setInterval(() => {
      // advance one
      setIndex(i => {
        const nextIndex = (i + 1) % slideCount;
        setAnimating(true);
        return nextIndex;
      });
    }, interval);
  }

  function stopAutoplay() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  // handle the "clone slide" jump: when animating to the cloned slide (index === 0 but we rendered clone at end),
  // we don't actually set index to slideCount; instead we use transform based on index and if we jumped to "after last", we
  // will detect transitionend and reset transform without animation.
  // We'll render translateX based on an internal renderIndex = index (0..slideCount-1); but when index === 0 after last,
  // we need to specially manage. Simpler approach: use an offset = index and if index === 0 and animating triggered by next
  // from last to 0, we transition to position slideCount (the cloned slide), then on transitionend set animating=false and index=0 with no animation.
  const wrapperRef = useRef(null);
  const isJumpingRef = useRef(false);

  // effect to update transform when index or animating changes
  useEffect(() => {
    const w = wrapperRef.current;
    if (!w) return;
    const transition = animating ? 'transform 520ms cubic-bezier(.2,.9,.25,1)' : 'none';
    w.style.transition = transition;

    // If we moved forward from last index to index 0, we want to animate to the cloned slide at position slideCount
    // Detect: previous index was slideCount-1 and new index is 0 and animating true -> move to position slideCount (cloned)
    // We'll track prevIndex via ref:
    const prevIdx = (w.dataset.prevIndex ? Number(w.dataset.prevIndex) : 0);
    w.dataset.prevIndex = String(index);

    if (prevIdx === slideCount - 1 && index === 0 && animating) {
      // animate to cloned slide
      isJumpingRef.current = true;
      const offset = -(slideCount) * 100;
      w.style.transform = `translateX(${offset}%)`;
      return;
    }

    // normal position: translate to -index * 100%
    const offset = -(index) * 100;
    w.style.transform = `translateX(${offset}%)`;
    isJumpingRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, animating, slideCount]);

  // on transition end: if we animated to cloned slide, jump back to real first slide without animation
  useEffect(() => {
    const w = wrapperRef.current;
    if (!w) return;
    const handler = () => {
      if (isJumpingRef.current) {
        // disable animation and snap to real first slide
        w.style.transition = 'none';
        w.style.transform = `translateX(0%)`; // first slide
        // force reflow then re-enable animation
        // set state without animation
        setTimeout(() => {
          isJumpingRef.current = false;
          setAnimating(true); // future transitions animated
        }, 20);
      }
    };
    w.addEventListener('transitionend', handler);
    return () => w.removeEventListener('transitionend', handler);
  }, []);

  // pause autoplay on hover/focus/drag
  function onMouseEnter() { stopAutoplay(); }
  function onMouseLeave() { startAutoplay(); }
  function onFocus() { stopAutoplay(); }
  function onBlur() { startAutoplay(); }

  // touch handlers for swipe
  function onTouchStart(e) {
    stopAutoplay();
    dragging.current = true;
    startX.current = e.touches ? e.touches[0].clientX : e.clientX;
    currentTranslate.current = 0;
    setAnimating(false); // disable CSS transition while dragging
  }

  function onTouchMove(e) {
    if (!dragging.current) return;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const dx = x - startX.current;
    // compute percent translate relative to container width
    const container = containerRef.current;
    if (!container) return;
    const pct = (dx / container.offsetWidth) * 100;
    // move wrapper by offset = -index*100 + pct
    const w = wrapperRef.current;
    if (!w) return;
    const base = -(index) * 100;
    w.style.transition = 'none';
    w.style.transform = `translateX(${base + pct}%)`;
    currentTranslate.current = pct;
  }

  function onTouchEnd() {
    if (!dragging.current) return;
    dragging.current = false;
    // threshold to change slide
    const threshold = 18; // percent of width
    const moved = currentTranslate.current;
    setAnimating(true);
    if (moved > threshold) {
      // swiped right -> previous
      prev();
    } else if (moved < -threshold) {
      // swiped left -> next
      next();
    } else {
      // small move -> snap back
      // trigger transform to current index (will use animating true)
      const w = wrapperRef.current;
      if (w) w.style.transform = `translateX(${-index * 100}%)`;
    }
    currentTranslate.current = 0;
    startAutoplay();
  }

  // keyboard left/right for accessibility
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowLeft') { stopAutoplay(); prev(); setTimeout(startAutoplay, interval); }
      if (e.key === 'ArrowRight') { stopAutoplay(); next(); setTimeout(startAutoplay, interval); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, slideCount]);

  // dots click
  const gotoDot = (i) => {
    stopAutoplay();
    goTo(i, true);
    setTimeout(startAutoplay, interval);
  };

  return (
    <div
      className="hero-root"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocus={onFocus}
      onBlur={onBlur}
      ref={containerRef}
      style={{ height }}
    >
      <div
        className="hero-viewport"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={(e) => { /* support desktop drag as swipe */ onTouchStart({ touches: [e] }); }}
        onMouseMove={(e) => { if (dragging.current) onTouchMove({ touches: [e] }); }}
        onMouseUp={() => onTouchEnd()}
        onMouseLeave={() => { if (dragging.current) onTouchEnd(); }}
      >
        <div className="hero-wrapper" ref={wrapperRef} data-prev-index="0" style={{ width: `${(extended.length) * 100}%` }}>
          {extended.map((src, idx) => (
            <div className="hero-slide" key={idx} style={{ width: `${100 / extended.length}%` }}>
              <Image 
  src={src} 
  alt={`slide-${idx}`} 
  className="hero-img" 
  draggable="false" 
  fill 
  priority={idx === 0} // Highest priority for the first visible slide
  sizes="(max-width: 880px) 100vw, 1200px" // Tell Next.js the size
/>
            </div>
          ))}
        </div>
      </div>

      {/* left/right arrows */}
      <button className="hero-arrow left" aria-label="Previous" onClick={() => { stopAutoplay(); prev(); startAutoplay(); }}>‹</button>
      <button className="hero-arrow right" aria-label="Next" onClick={() => { stopAutoplay(); next(); startAutoplay(); }}>›</button>

      {/* dots */}
      <div className="hero-dots" role="tablist" aria-label="Carousel dots">
        {slides.map((_, i) => (
          <button
            key={i}
            className={`dot ${i === index ? 'active' : ''}`}
            onClick={() => gotoDot(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
