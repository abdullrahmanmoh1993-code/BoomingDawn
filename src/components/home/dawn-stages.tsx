"use client";

import { useRef, useEffect } from "react";
import type { DawnStage } from "@/lib/types";

interface StageVisual {
  stage: DawnStage;
  background: string;
  product: string;
  productAlt: string;
}

/** The three real dawn backgrounds + their floating product cutouts. */
const STAGES: StageVisual[] = [
  {
    stage: "nautical",
    background: "/images/dawn/nautical.jpg",
    product: "/images/products/nautical-tee.webp",
    productAlt: "The Nautical Tee stage",
  },
  {
    stage: "astronomical",
    background: "/images/dawn/astronomical.jpg",
    product: "/images/products/astronomical-tee.webp",
    productAlt: "The Astronomical Tee stage",
  },
  {
    stage: "orange-rising",
    background: "/images/dawn/orange-rising.jpg",
    product: "/images/products/civil-workshirt.webp",
    productAlt: "The Orange Rising workshirt stage",
  },
];

/** Scroll labels for each stage (order matches STAGES). */
const STAGE_TEXT = [
  { num: "01", label: "NAUTICAL", tag: "BLUE SHIP" },
  { num: "02", label: "ASTRONOMICAL", tag: "CONSTELLATION" },
  { num: "03", label: "ORANGE RISING", tag: "A NEW DAWN" },
];

/**
 * Scroll-driven 3-stage dawn experience.
 * A sticky 100vh viewport sits inside a 300vh section; as the user scrolls,
 * backgrounds/products/text crossfade smoothly across the three stages.
 */
export function DawnStages() {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRefs = useRef<(HTMLDivElement | null)[]>([]);
  const productRefs = useRef<(HTMLImageElement | null)[]>([]);
  const textRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion) {
      STAGES.forEach((_, i) => {
        const bg = bgRefs.current[i];
        const product = productRefs.current[i];
        const text = textRefs.current[i];
        const o = i === 0 ? 1 : 0;
        if (bg) bg.style.opacity = String(o);
        if (product) product.style.opacity = String(o);
        if (text) text.style.opacity = String(o);
      });
      return;
    }

    let ticking = false;
    let sectionTop = 0;
    let maxScroll = 0;

    const measure = () => {
      const top =
        section.getBoundingClientRect().top +
        (window.scrollY ?? window.pageYOffset ?? document.documentElement.scrollTop ?? 0);
      sectionTop = top;
      maxScroll =
        (section.getBoundingClientRect().height || section.offsetHeight) -
        window.innerHeight;
    };

    const calcOpacity = (index: number, progress: number) => {
      const stagePosition = progress * 2;
      const opacity = 1 - Math.abs(index - stagePosition) * 1.2;
      return Math.max(0, Math.min(1, opacity));
    };

    const update = () => {
      ticking = false;

      if (maxScroll === 0) measure();

      const scrollY =
        window.scrollY ?? window.pageYOffset ?? document.documentElement.scrollTop ?? 0;
      let progress = (scrollY - sectionTop) / maxScroll;
      progress = Math.max(0, Math.min(1, progress));

      STAGES.forEach((_, i) => {
        const bg = bgRefs.current[i];
        const product = productRefs.current[i];
        const text = textRefs.current[i];
        const o = calcOpacity(i, progress);
        if (bg) bg.style.opacity = String(o);
        if (product) product.style.opacity = String(o);
        if (text) text.style.opacity = String(o);
      });
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    measure();
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", () => {
      measure();
      update();
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="dawn-stages relative"
      aria-label="The three stages of dawn"
    >
      {/* Sticky viewport */}
      <div
        className="sticky-container sticky top-0 w-full overflow-hidden bg-[#0a0f1a]"
        style={{ zIndex: 1 }}
      >
        {/* Backgrounds */}
        {STAGES.map((s, i) => (
          <div
            key={s.stage}
            ref={(el) => {
              bgRefs.current[i] = el;
            }}
            className="bg-layer absolute inset-0"
            style={{
              backgroundImage: `url(${s.background})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              opacity: 0,
            }}
          />
        ))}

        {/* Stage text */}
        {STAGE_TEXT.map((t, i) => (
          <div
            key={t.num}
            ref={(el) => {
              textRefs.current[i] = el;
            }}
            className="stage-text absolute left-[6%] sm:left-[8%] top-1/2 -translate-y-1/2 z-20 pointer-events-none"
            style={{ opacity: 0 }}
          >
            <span className="font-display text-booming-orange text-sm sm:text-base tracking-[0.35em]">
              {t.num} / {t.label}
            </span>
            <span className="block text-muted text-[10px] sm:text-xs uppercase tracking-[0.3em] mt-2">
              {t.tag}
            </span>
          </div>
        ))}

        {/* Products */}
        {STAGES.map((s, i) => (
          // eslint-disable-next-line @next/next/no-img-element -- HTML cutout sized via scroll refs; not suitable for next/image fill
          <img
            key={s.stage}
            ref={(el) => {
              productRefs.current[i] = el;
            }}
            src={s.product}
            alt={s.productAlt}
            className="product absolute right-[8%] sm:right-[10%] top-1/2 -translate-y-1/2 max-w-[60vw] sm:max-w-[45vw] w-auto h-auto object-contain"
            style={{ opacity: 0 }}
          />
        ))}
      </div>
    </section>
  );
}