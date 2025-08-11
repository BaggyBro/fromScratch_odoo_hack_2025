"use client";
import { IconArrowNarrowRight } from "@tabler/icons-react";
import { useState, useRef, useId, useEffect } from "react";
 
interface SlideData {
  title: string;
  button: string;
  src: string;
}
 
interface SlideProps {
  slide: SlideData;
  index: number;
  current: number;
  handleSlideClick: (index: number) => void;
}
 
const Slide = ({ slide, index, current, handleSlideClick }: SlideProps) => {
  const slideRef = useRef<HTMLLIElement>(null);
 
  const xRef = useRef(0);
  const yRef = useRef(0);
  const frameRef = useRef<number>();
 
  useEffect(() => {
    const animate = () => {
      if (!slideRef.current) return;
 
      const x = xRef.current;
      const y = yRef.current;
 
      slideRef.current.style.setProperty("--x", `${x}px`);
      slideRef.current.style.setProperty("--y", `${y}px`);
 
      frameRef.current = requestAnimationFrame(animate);
    };
 
    frameRef.current = requestAnimationFrame(animate);
 
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);
 
  const handleMouseMove = (event: React.MouseEvent) => {
    const el = slideRef.current;
    if (!el) return;
 
    const r = el.getBoundingClientRect();
    xRef.current = event.clientX - (r.left + Math.floor(r.width / 2));
    yRef.current = event.clientY - (r.top + Math.floor(r.height / 2));
  };
 
  const handleMouseLeave = () => {
    xRef.current = 0;
    yRef.current = 0;
  };
 
  const imageLoaded = (event: React.SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.style.opacity = "1";
  };
 
  const { src, button, title } = slide;
 
  return (
    <div className="[perspective:1200px] [transform-style:preserve-3d]">
      <li
        ref={slideRef}
        className="flex flex-1 flex-col items-center justify-center relative text-center text-white opacity-100 transition-all duration-500 ease-out w-full h-[80vh] mx-0 z-10"
        onClick={() => handleSlideClick(index)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform:
            current !== index
              ? "scale(0.95) rotateX(5deg)"
              : "scale(1) rotateX(0deg)",
          transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
          transformOrigin: "center",
        }}
      >
        <div
          className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-black/40 to-black/60 rounded-2xl overflow-hidden transition-all duration-300 ease-out shadow-2xl"
          style={{
            transform:
              current === index
                ? "translate3d(calc(var(--x) / 40), calc(var(--y) / 40), 0)"
                : "none",
          }}
        >
          <img
            className="absolute inset-0 w-[120%] h-[120%] object-cover opacity-100 transition-all duration-700 ease-in-out"
            style={{
              opacity: current === index ? 1 : 0.6,
              transform: current === index ? "scale(1.05)" : "scale(1)",
            }}
            alt={title}
            src={src}
            onLoad={imageLoaded}
            loading="eager"
            decoding="sync"
          />
          {current === index && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent transition-all duration-1000" />
          )}
        </div>
 
        <article
          className={`relative p-8 md:p-12 transition-all duration-700 ease-out ${
            current === index ? "opacity-100 visible translate-y-0" : "opacity-0 invisible translate-y-8"
          }`}
        >
          <h3 className="text-3xl md:text-5xl lg:text-6xl font-bold relative text-white mb-6 drop-shadow-2xl">
            {title}
          </h3>
          <div className="flex justify-center">
            <button className="bg-white/20 backdrop-blur-sm text-white px-8 py-3 rounded-full border border-white/30 hover:bg-white/30 hover:border-white/50 transition-all duration-300 font-medium text-lg shadow-lg hover:shadow-xl">
              {button}
            </button>
          </div>
        </article>
      </li>
    </div>
  );
};
 
interface CarouselControlProps {
  type: string;
  title: string;
  handleClick: () => void;
}
 
const CarouselControl = ({
  type,
  title,
  handleClick,
}: CarouselControlProps) => {
  return (
    <button
      className={`w-14 h-14 flex items-center justify-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-full focus:border-white/40 focus:outline-none hover:bg-white/20 hover:border-white/40 hover:scale-110 active:scale-95 transition-all duration-300 ${
        type === "previous" ? "rotate-180" : ""
      }`}
      title={title}
      onClick={handleClick}
    >
      <IconArrowNarrowRight className="text-white w-6 h-6" />
    </button>
  );
};
 
interface CarouselProps {
  slides: SlideData[];
}
 
export function Carousel({ slides }: CarouselProps) {
  const [current, setCurrent] = useState(0);
 
  const handlePreviousClick = () => {
    const previous = current - 1;
    setCurrent(previous < 0 ? slides.length - 1 : previous);
  };
 
  const handleNextClick = () => {
    const next = current + 1;
    setCurrent(next === slides.length ? 0 : next);
  };
 
  const handleSlideClick = (index: number) => {
    if (current !== index) {
      setCurrent(index);
    }
  };
 
  const id = useId();
 
  return (
    <div
      className="relative w-full h-[80vh] overflow-hidden"
      aria-labelledby={`carousel-heading-${id}`}
    >
      <ul
        className="absolute flex w-full h-full transition-transform duration-700 ease-out"
        style={{
          transform: `translateX(-${current * (100 / slides.length)}%)`,
        }}
      >
        {slides.map((slide, index) => (
          <Slide
            key={index}
            slide={slide}
            index={index}
            current={current}
            handleSlideClick={handleSlideClick}
          />
        ))}
      </ul>
 
      <div className="absolute flex justify-between items-center w-full px-8 top-1/2 -translate-y-1/2">
        <CarouselControl
          type="previous"
          title="Go to previous slide"
          handleClick={handlePreviousClick}
        />
 
        <CarouselControl
          type="next"
          title="Go to next slide"
          handleClick={handleNextClick}
        />
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => handleSlideClick(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              current === index 
                ? "bg-white scale-125" 
                : "bg-white/40 hover:bg-white/60"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}