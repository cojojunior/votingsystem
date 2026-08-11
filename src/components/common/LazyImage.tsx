// src/components/common/LazyImage.tsx
import { useEffect, useRef, useState } from "react";

export const LazyImage: React.FC<{ src: string; alt: string }> = ({
  src,
  alt,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "50px" },
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef}>
      {isVisible ? (
        <img src={src} alt={alt} loading="lazy" />
      ) : (
        <div className="w-full h-48 bg-gray-200 animate-pulse" />
      )}
    </div>
  );
};
