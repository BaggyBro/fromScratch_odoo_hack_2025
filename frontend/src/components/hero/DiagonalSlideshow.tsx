import React, { useState } from 'react';

interface SlideItem {
  title: string;
  image: string;
  description: string;
}

const slides: SlideItem[] = [
  {
    title: "Plan Your Adventure",
    image: "https://picsum.photos/seed/adventure/800/600",
    description: "Create amazing travel itineraries"
  },
  {
    title: "Discover Cities",
    image: "https://picsum.photos/seed/cities/800/600",
    description: "Explore destinations worldwide"
  },
  {
    title: "Share & Collaborate",
    image: "https://picsum.photos/seed/collaborate/800/600",
    description: "Travel with friends and family"
  }
];

export const DiagonalSlideshow: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const next = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prev = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  return (
    <div className="slider">
      <div className="credits">
        <p>Travel Planning Made Simple</p>
        <a href="#" className="text-blue-400 hover:underline">
          Learn More
        </a>
      </div>
      
      <div className="nav">
        <div className="prev" onClick={prev}></div>
        <div className="next" onClick={next}></div>
        <div className="explore-btn">Get Started</div>
      </div>

      {slides.map((slide, index) => (
        <div 
          key={index}
          className={`item ${index === currentSlide ? 'is-active' : ''}`}
        >
          <div className="content">
            <h1 className="title">{slide.title}</h1>
            <p className="description">{slide.description}</p>
          </div>
          <div className="image-container">
            <img 
              src={slide.image} 
              alt={slide.title}
              className="slide-image"
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default DiagonalSlideshow; 