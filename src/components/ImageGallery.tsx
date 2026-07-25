import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getProductImages } from '../utils/productImages';
import type { Product } from '../types';
import './ImageGallery.css';

type Props = {
  product: Pick<Product, 'images' | 'imageEmoji' | 'title'>;
};

export function ImageGallery({ product }: Props) {
  const images = getProductImages(product);
  const [active, setActive] = useState(0);
  const [hoverZoom, setHoverZoom] = useState(false);

  useEffect(() => {
    setActive(0);
  }, [product.title, images.join('|')]);

  const go = useCallback(
    (dir: -1 | 1) => {
      setActive((i) => (i + dir + images.length) % images.length);
    },
    [images.length],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') go(-1);
      if (e.key === 'ArrowRight') go(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go]);

  return (
    <div className="amz-gallery">
      <div className="amz-gallery-thumbs" role="tablist" aria-label="Product images">
        {images.map((src, i) => (
          <button
            key={`${src}-${i}`}
            type="button"
            role="tab"
            aria-selected={i === active}
            className={`amz-gallery-thumb ${i === active ? 'active' : ''}`}
            onMouseEnter={() => setActive(i)}
            onClick={() => setActive(i)}
          >
            <img src={src} alt="" />
          </button>
        ))}
      </div>

      <div
        className={`amz-gallery-main ${hoverZoom ? 'zoomed' : ''}`}
        onMouseEnter={() => setHoverZoom(true)}
        onMouseLeave={() => setHoverZoom(false)}
      >
        <img
          src={images[active]}
          alt={`${product.title} — image ${active + 1} of ${images.length}`}
          draggable={false}
        />

        {images.length > 1 && (
          <>
            <button
              type="button"
              className="amz-gallery-nav prev"
              aria-label="Previous image"
              onClick={() => go(-1)}
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              className="amz-gallery-nav next"
              aria-label="Next image"
              onClick={() => go(1)}
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}

        <div className="amz-gallery-counter">
          {active + 1} / {images.length}
        </div>
      </div>
    </div>
  );
}
