import { type PointerEvent as ReactPointerEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion';

export const BIRTHDAY_LETTER = `Sriju,

Happy birthday to my favourite crackhead, professional menace, and the one person who can turn the most normal situation into a completely unnecessary story.

Honestly, I don't know how you manage to be this chaotic and still somehow be one of my favourite people to have around. Every conversation with you has approximately 3% normality, 47% nonsense, and 50% me wondering how we even got here.

You are unnecessarily dramatic, randomly hilarious, slightly unhinged, and somehow still the person I know I can call when I need someone. And for some reason, you've decided that being my problem is a personality trait.

Thank you for all the stupid conversations, questionable decisions, random laughs, inside jokes, and moments where neither of us had any idea what was happening but continued anyway.

I hope this year gives you everything you want — ridiculous amounts of happiness, good people, unforgettable moments, fewer problems, and enough cake to make questionable life decisions feel justified.

Stay weird. Stay chaotic. Stay exactly the same crackhead I've somehow gotten attached to.

And yes, unfortunately for you, you're stuck with me.

Happy birthday, you absolute menace. ❤️

— Ranit`;


type ImageModule = Record<string, string>;

const discoveredImages = import.meta.glob(
  './assets/images/*.{jpg,JPG,jpeg,JPEG,png,PNG,webp,WEBP,gif,GIF}',
  { eager: true, query: '?url', import: 'default' },
) as ImageModule;

const galleryImages = Object.entries(discoveredImages)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([path, src], index) => ({
    src,
    name: path.split('/').pop() ?? `memory-${index + 1}`,
    index,
  }));

const sectionNames = ['home', 'letter', 'wish', 'gallery', 'outro'];

const cardPositions = [
  { left: '7%', top: '19%', width: 'clamp(86px, 12vw, 158px)', rotate: -11, depth: 0.55 },
  { left: '72%', top: '13%', width: 'clamp(92px, 13vw, 172px)', rotate: 9, depth: 0.3 },
  { left: '80%', top: '57%', width: 'clamp(90px, 12vw, 158px)', rotate: 13, depth: 0.75 },
  { left: '9%', top: '65%', width: 'clamp(92px, 14vw, 178px)', rotate: 8, depth: 0.4 },
  { left: '29%', top: '12%', width: 'clamp(72px, 10vw, 130px)', rotate: -4, depth: 0.2 },
  { left: '59%', top: '72%', width: 'clamp(76px, 11vw, 140px)', rotate: -8, depth: 0.6 },
];

function useSectionObserver() {
  const [active, setActive] = useState('home');

  useEffect(() => {
    const nodes = sectionNames
      .map((name) => document.getElementById(name))
      .filter((node): node is HTMLElement => Boolean(node));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActive(visible.target.id);
      },
      { threshold: [0.18, 0.42, 0.66], rootMargin: '-12% 0px -12% 0px' },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return active;
}

function ProgressDots({ active }: { active: string }) {
  return (
    <nav
      aria-label="page sections"
      className="fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-3 md:flex"
    >
      {sectionNames.map((name) => (
        <a
          key={name}
          href={`#${name}`}
          data-testid={`link-progress-${name}`}
          aria-label={`go to ${name}`}
          className="group flex items-center justify-end gap-2 py-1"
        >
          <span className="pointer-events-none text-[9px] font-semibold tracking-[0.18em] text-[#b3a9c9] opacity-0 transition-opacity group-hover:opacity-100">
            {name}
          </span>
          <span
            className={`block rounded-full transition-all duration-300 ${
              active === name
                ? 'h-3 w-3 bg-[#ffc857] shadow-[0_0_0_4px_rgba(255,200,87,0.16)]'
                : 'h-2 w-2 bg-[#b3a9c9]/40 group-hover:bg-[#3fe0c5]'
            }`}
          />
        </a>
      ))}
    </nav>
  );
}

function HeroPhotoCard({
  image,
  index,
  smoothX,
  smoothY,
  reducedMotion,
}: {
  image: { src: string };
  index: number;
  smoothX: ReturnType<typeof useSpring>;
  smoothY: ReturnType<typeof useSpring>;
  reducedMotion: boolean;
}) {
  const position = cardPositions[index];
  const cardX = useTransform(smoothX, [-1, 1], [-position.depth * 7, position.depth * 7]);
  const cardY = useTransform(smoothY, [-1, 1], [-position.depth * 5, position.depth * 5]);

  return (
    <motion.figure
      className="photo-card absolute z-0 hidden overflow-hidden rounded-[1.1rem] border border-[#f8f3ec]/15 bg-[#f8f3ec]/10 p-1.5 sm:block"
      style={{
        left: position.left,
        top: position.top,
        width: position.width,
        rotate: position.rotate,
        x: reducedMotion ? 0 : cardX,
        y: reducedMotion ? 0 : cardY,
      }}
      initial={{ opacity: 0, scale: 0.7, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: reducedMotion ? 0 : [0, -8, 0] }}
      transition={{
        opacity: { delay: 0.35 + index * 0.08, duration: 0.6 },
        scale: { delay: 0.35 + index * 0.08, type: 'spring', stiffness: 120, damping: 13 },
        y: reducedMotion
          ? { duration: 0 }
          : { delay: 1 + index * 0.16, duration: 5 + index * 0.8, repeat: Infinity, ease: 'easeInOut' },
      }}
    >
      <img src={image.src} alt={`Sriju memory ${index + 1}`} className="aspect-[4/5] w-full object-cover" />
    </motion.figure>
  );
}

function Hero({ reducedMotion }: { reducedMotion: boolean }) {
  const heroRef = useRef<HTMLElement>(null);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const smoothX = useSpring(pointerX, { stiffness: 80, damping: 18 });
  const smoothY = useSpring(pointerY, { stiffness: 80, damping: 18 });
  const rotateY = useTransform(smoothX, [-1, 1], [-5, 5]);
  const rotateX = useTransform(smoothY, [-1, 1], [5, -5]);
  const titleX = useTransform(smoothX, [-1, 1], [-7, 7]);
  const titleY = useTransform(smoothY, [-1, 1], [-4, 4]);

  const onPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (reducedMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - rect.left) / rect.width * 2 - 1);
    pointerY.set((event.clientY - rect.top) / rect.height * 2 - 1);
  };

  const resetPointer = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  const scrollToLetter = () => {
    document.getElementById('letter')?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
  };

  return (
    <section
      id="home"
      ref={heroRef}
      data-section
      onPointerMove={onPointerMove}
      onPointerLeave={resetPointer}
      className="warm-wash relative flex min-h-[100dvh] items-center overflow-hidden px-5 pb-16 pt-24 sm:px-8 lg:px-14"
    >
      <div className="hero-grid absolute inset-0 opacity-50" aria-hidden="true" />
      <div className="absolute left-1/2 top-1/2 h-[44rem] w-[44rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ff5d8f]/10 blur-[100px]" aria-hidden="true" />
      <motion.div
        className="relative z-10 mx-auto w-full max-w-7xl"
        style={reducedMotion ? undefined : { rotateX, rotateY, perspective: 1200 }}
      >
        <div className="relative flex min-h-[calc(100dvh-8rem)] flex-col items-center justify-center text-center">
          {galleryImages.slice(0, 6).map((image, index) => {
            return (
              <HeroPhotoCard
                key={image.src}
                image={image}
                index={index}
                smoothX={smoothX}
                smoothY={smoothY}
                reducedMotion={reducedMotion}
              />
            );
          })}
          <motion.div
            style={reducedMotion ? undefined : { x: titleX, y: titleY }}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 max-w-5xl"
          >
            <div className="mb-6 flex items-center justify-center gap-3 text-[10px] font-bold tracking-[0.28em] text-[#3fe0c5]">
              <span className="h-px w-8 bg-[#3fe0c5]/60" />
              from ranit, with all the good memories
              <span className="h-px w-8 bg-[#3fe0c5]/60" />
            </div>
            <h1 className="font-display headline-extrusion text-[clamp(3.3rem,13vw,11.5rem)] font-black leading-[0.83] tracking-[-0.09em] text-[#ffc857]">
              SRIJU
            </h1>
            <p className="mx-auto mt-10 max-w-xl text-balance text-base leading-7 text-[#f8f3ec]/72 sm:text-lg">
              A tiny midnight museum for the loud laughs, the soft days, and the very specific magic that is you.
            </p>
            <motion.button
              type="button"
              onClick={scrollToLetter}
              data-testid="button-open-birthday-page"
              whileHover={reducedMotion ? undefined : { scale: 1.04, y: -3 }}
              whileTap={reducedMotion ? undefined : { scale: 0.97 }}
              className="mt-9 rounded-full bg-[#ffc857] px-6 py-3.5 text-sm font-extrabold text-[#120f1e] shadow-[0_16px_40px_rgba(255,200,87,0.2)] transition-shadow hover:shadow-[0_18px_48px_rgba(255,200,87,0.36)]"
            >
              Open your birthday page
            </motion.button>
          </motion.div>
          <div className="absolute bottom-1 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-[10px] tracking-[0.2em] text-[#b3a9c9]/70">
            <span>scroll slowly</span>
            <motion.span
              aria-hidden="true"
              animate={reducedMotion ? undefined : { y: [0, 7, 0], opacity: [0.35, 1, 0.35] }}
              transition={reducedMotion ? undefined : { duration: 1.8, repeat: Infinity }}
              className="h-8 w-px bg-gradient-to-b from-[#b3a9c9] to-transparent"
            />
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function LetterSection() {
  const [letter, setLetter] = useState(BIRTHDAY_LETTER);
  const letterImage = galleryImages[1] ?? galleryImages[0];
  return (
    <section id="letter" data-section className="relative overflow-hidden px-5 py-28 sm:px-8 sm:py-36 lg:px-14">
      <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-24">
        <motion.div
          initial={{ opacity: 0, x: -28 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.8 }}
          className="relative mx-auto w-full max-w-md"
        >
          <div className="absolute -inset-7 rounded-[2rem] border border-[#ff5d8f]/15 rotate-6" />
          <div className="absolute -inset-3 rounded-[2rem] border border-[#ffc857]/20 -rotate-3" />
          <figure className="relative rotate-[-4deg] rounded-[1.5rem] bg-[#f8f3ec] p-3 shadow-[18px_24px_60px_rgba(18,15,30,0.45)]">
            {letterImage ? (
              <img src={letterImage.src} alt="A memory of Sriju" className="aspect-[4/5] w-full rounded-[1rem] object-cover" />
            ) : null}
            <figcaption className="px-2 pb-1 pt-4 font-display text-[9px] font-semibold tracking-[0.12em] text-[#120f1e]/70">
              kept in the good pile
            </figcaption>
          </figure>
          <div className="absolute -bottom-7 -right-4 rotate-[-9deg] rounded-full bg-[#3fe0c5] px-4 py-2 text-[10px] font-bold text-[#120f1e] shadow-lg">
            read this twice
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <p className="mb-5 text-xs font-bold tracking-[0.2em] text-[#ff5d8f]">a note from home</p>
          <h2 className="font-display max-w-xl text-3xl font-semibold leading-tight tracking-[-0.06em] text-[#f8f3ec] sm:text-5xl">
            Things I should say more often.
          </h2>
          <div className="glass mt-8 rounded-[1.8rem] p-5 sm:p-8">
            <label htmlFor="birthday-letter" className="mb-4 block text-xs font-bold tracking-[0.12em] text-[#b3a9c9]">
              editable letter
            </label>
            <textarea
              id="birthday-letter"
              data-testid="textarea-birthday-letter"
              value={letter}
              onChange={(event) => setLetter(event.target.value)}
              spellCheck="true"
              aria-label="Birthday letter from Ranit"
              className="min-h-[390px] w-full resize-y border-0 bg-transparent text-[15px] leading-7 text-[#f8f3ec]/90 outline-none placeholder:text-[#b3a9c9] sm:min-h-[350px]"
            />
            <div className="mt-4 flex items-center justify-between border-t border-[#f8f3ec]/10 pt-4 text-xs text-[#b3a9c9]">
              {/* <span>from ranit</span>
              <span>{letter.length} characters</span> */}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

type ConfettiPiece = { id: number; color: string; x: number; y: number; rotate: number };

function CakeSection({ reducedMotion }: { reducedMotion: boolean }) {
  const [wished, setWished] = useState(false);
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const timeoutRef = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timeoutRef.current), []);

  const sendWish = () => {
    if (wished) return;
    const colors = ['#ffc857', '#ff5d8f', '#3fe0c5', '#f8f3ec'];
    setWished(true);
    setConfetti(
      Array.from({ length: 30 }, (_, index) => ({
        id: Date.now() + index,
        color: colors[index % colors.length],
        x: (Math.random() - 0.5) * 440,
        y: -(Math.random() * 260 + 90),
        rotate: Math.random() * 720 - 360,
      })),
    );
    timeoutRef.current = window.setTimeout(() => setConfetti([]), 1700);
  };

  return (
    <section id="wish" data-section className="relative overflow-hidden bg-[#1b1530]/55 px-5 py-28 sm:px-8 sm:py-36 lg:px-14">
      <div className="mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="mb-5 text-xs font-bold tracking-[0.2em] text-[#3fe0c5]"
          >
            make a little room for magic
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="font-display max-w-2xl text-4xl font-semibold leading-[1.1] tracking-[-0.07em] text-[#f8f3ec] sm:text-6xl"
          >
            Close your eyes. Make it a good one.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.18 }}
            className="mt-6 max-w-md text-base leading-7 text-[#b3a9c9]"
          >
            The cake is deliberately imaginary. The wish is not. Click when you know what you want this year to hold.
          </motion.p>
        </div>
        <div className="relative flex min-h-[390px] items-center justify-center">
          <div className="cake-ground absolute bottom-14 h-24 w-80 rounded-full" aria-hidden="true" />
          <AnimatePresence>
            {confetti.map((piece) => (
              <motion.span
                key={piece.id}
                className="absolute left-1/2 top-1/2 z-30 h-2.5 w-1.5 rounded-sm"
                style={{ backgroundColor: piece.color }}
                initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
                animate={{ x: piece.x, y: piece.y + 160, opacity: 0, rotate: piece.rotate }}
                transition={{ duration: 1.25 + Math.random() * 0.35, ease: [0.22, 0.8, 0.36, 1] }}
              />
            ))}
          </AnimatePresence>
          <motion.button
            type="button"
            data-testid="button-send-wish"
            onClick={sendWish}
            disabled={wished}
            aria-label={wished ? 'Wish sent' : 'Click the cake to make a wish'}
            whileHover={reducedMotion || wished ? undefined : { scale: 1.04, y: -5 }}
            whileTap={reducedMotion || wished ? undefined : { scale: 0.97 }}
            className="group relative z-10 cursor-pointer rounded-3xl p-5 disabled:cursor-default"
          >
            <svg viewBox="0 0 420 330" className="w-[min(82vw,390px)] overflow-visible" role="img" aria-label="Three tier birthday cake with candle">
              <ellipse cx="210" cy="300" rx="140" ry="17" fill="#120f1e" opacity=".6" />
              <path d="M105 227h210v58c0 15-18 26-105 26S105 300 105 285v-58Z" fill="#ff5d8f" stroke="#120f1e" strokeWidth="5" />
              <path d="M105 227c0 15 47 27 105 27s105-12 105-27-47-26-105-26-105 11-105 26Z" fill="#ff86aa" stroke="#120f1e" strokeWidth="5" />
              <path d="M140 164h140v64c0 12-31 23-70 23s-70-11-70-23v-64Z" fill="#3fe0c5" stroke="#120f1e" strokeWidth="5" />
              <path d="M140 164c0 12 31 22 70 22s70-10 70-22-31-21-70-21-70 9-70 21Z" fill="#76f0dd" stroke="#120f1e" strokeWidth="5" />
              <path d="M168 113h84v52c0 9-19 17-42 17s-42-8-42-17v-52Z" fill="#ffc857" stroke="#120f1e" strokeWidth="5" />
              <path d="M168 113c0 9 19 16 42 16s42-7 42-16-19-16-42-16-42 7-42 16Z" fill="#ffe18f" stroke="#120f1e" strokeWidth="5" />
              <path d="M192 96V56h36v40" fill="#f8f3ec" stroke="#120f1e" strokeWidth="5" />
              <motion.path
                d="M210 53c-17-18 8-27 0-43 27 16 18 31 8 41"
                animate={reducedMotion ? undefined : { d: ['M210 53c-17-18 8-27 0-43 27 16 18 31 8 41', 'M210 53c-8-19 16-25 4-43 22 18 11 30 4 41', 'M210 53c-17-18 8-27 0-43 27 16 18 31 8 41'] }}
                transition={reducedMotion ? undefined : { duration: 0.8, repeat: Infinity }}
                fill="#ff5d8f"
                stroke="#120f1e"
                strokeWidth="4"
              />
              <circle cx="137" cy="252" r="6" fill="#ffc857" />
              <circle cx="284" cy="253" r="6" fill="#ffc857" />
              <circle cx="164" cy="195" r="5" fill="#ff5d8f" />
              <circle cx="259" cy="195" r="5" fill="#ff5d8f" />
              <path d="M130 274c8 8 15 8 23 0M267 274c8 8 15 8 23 0" fill="none" stroke="#120f1e" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </motion.button>
          <AnimatePresence>
            {wished ? (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="absolute bottom-2 rounded-full bg-[#ffc857] px-5 py-2.5 font-display text-xs font-bold text-[#120f1e]"
              >
                wish sent ✦
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function GallerySection({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <section id="gallery" data-section className="relative px-5 py-28 sm:px-8 sm:py-36 lg:px-14">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="mb-5 text-xs font-bold tracking-[0.2em] text-[#ffc857]">proof of good days</p>
            <h2 className="font-display text-4xl font-semibold tracking-[-0.07em] text-[#f8f3ec] sm:text-6xl">The Sriju archive.</h2>
          </div>
          <p className="max-w-xs text-sm leading-6 text-[#b3a9c9]">
            Every frame is a little time capsule. Hover gently. Some memories are shy.
          </p>
        </div>
        <div className="masonry">
          {galleryImages.map((image, index) => {
            const rotation = [-2, 3, -4, 2, -1, 4, -3, 1][index % 8];
            return (
              <motion.figure
                key={image.src}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.08 }}
                transition={{ duration: 0.55, delay: reducedMotion ? 0 : Math.min(index * 0.035, 0.4) }}
                whileHover={reducedMotion ? undefined : { y: -12, rotate: 0, scale: 1.025, zIndex: 5 }}
                style={{ rotate: rotation }}
                className="group relative overflow-hidden rounded-[1.1rem] border border-[#f8f3ec]/15 bg-[#f8f3ec] p-2 shadow-[0_18px_32px_rgba(18,15,30,0.32)] transition-shadow hover:shadow-[0_26px_44px_rgba(18,15,30,0.55)]"
              >
                <img
                  src={image.src}
                  alt={`Sriju memory ${index + 1}`}
                  loading="lazy"
                  data-testid={`img-gallery-${index}`}
                  className="block h-auto max-h-[560px] w-full rounded-[0.75rem] object-cover grayscale-[0.08] transition-[filter,transform] duration-500 group-hover:scale-[1.02] group-hover:grayscale-0"
                />
                <figcaption className="flex justify-between px-1 pb-0.5 pt-2 text-[9px] font-bold tracking-[0.12em] text-[#120f1e]/55">
                  <span>memory {String(index + 1).padStart(2, '0')}</span>
                  <span>{image.name.split('.')[0].slice(0, 12)}</span>
                </figcaption>
              </motion.figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function OutroSection({ reducedMotion }: { reducedMotion: boolean }) {
  const balloons = useMemo(
    () => [
      { left: '4%', color: '#ff5d8f', width: 56, duration: 15, delay: -3 },
      { left: '18%', color: '#ffc857', width: 42, duration: 19, delay: -10 },
      { left: '31%', color: '#3fe0c5', width: 64, duration: 17, delay: -6 },
      { left: '53%', color: '#ff5d8f', width: 48, duration: 21, delay: -14 },
      { left: '70%', color: '#ffc857', width: 58, duration: 16, delay: -8 },
      { left: '88%', color: '#3fe0c5', width: 44, duration: 20, delay: -1 },
    ],
    [],
  );

  return (
    <section id="outro" data-section className="warm-wash relative flex min-h-[100dvh] items-center justify-center overflow-hidden px-5 py-28 text-center sm:px-8">
      <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-[#120f1e] to-transparent" aria-hidden="true" />
      {balloons.map((balloon, index) => (
        <motion.div
          key={balloon.left}
          aria-hidden="true"
          className="balloon absolute bottom-[-14vh] z-0 rounded-[50%_50%_47%_47%] border border-[#f8f3ec]/20"
          style={{ left: balloon.left, width: balloon.width, height: balloon.width * 1.28, backgroundColor: balloon.color }}
          animate={reducedMotion ? { y: 0, opacity: 0.18 } : { y: ['0vh', '-125vh'], opacity: [0, 0.82, 0.82, 0] }}
          transition={reducedMotion ? { duration: 0 } : { duration: balloon.duration, delay: balloon.delay, repeat: Infinity, ease: 'linear' }}
        />
      ))}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="relative z-10 max-w-4xl"
      >
        <p className="mb-8 text-xs font-bold tracking-[0.24em] text-[#3fe0c5]">the museum stays open</p>
        <h2 className="font-display text-[clamp(2.9rem,9vw,8.5rem)] font-semibold leading-[0.94] tracking-[-0.09em] text-[#ffc857]">
          Happy Birthday,
          <br />
          <span className="text-[#f8f3ec]">Sriju</span>
        </h2>
        <p className="mx-auto mt-9 max-w-md text-base leading-7 text-[#b3a9c9] sm:text-lg">
          Keep the light on for the next strange, lovely chapter. I will be here for all of it.
        </p>
        <div className="mx-auto mt-12 flex w-fit items-center gap-4 border-t border-[#f8f3ec]/20 pt-5 text-left">
          {/* <span className="h-10 w-10 rounded-full bg-[#ff5d8f] p-2 text-center font-display text-sm font-bold leading-6 text-[#120f1e]">R</span> */}
          <div>
            {/* <p className="font-display text-xs font-semibold text-[#f8f3ec]">your brother, ranit</p> */}
            <p className="mt-1 text-[11px] text-[#b3a9c9]">with love, mischief, and backup cake</p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function Home() {
  const prefersReducedMotion = useReducedMotion();
  const active = useSectionObserver();
  const reducedMotion = Boolean(prefersReducedMotion);

  return (
    <div className="noise min-h-[100dvh] overflow-x-hidden bg-[#120f1e] text-[#f8f3ec]">
      <ProgressDots active={active} />
      <main>
        <Hero reducedMotion={reducedMotion} />
        <LetterSection />
        <CakeSection reducedMotion={reducedMotion} />
        <GallerySection reducedMotion={reducedMotion} />
        <OutroSection reducedMotion={reducedMotion} />
      </main>
    </div>
  );
}

function App() {
  return <Home />;
}

export default App;