import React, { useEffect, useState } from 'react';
import { cn } from '../../lib/utils';

export const PLACEHOLDER_CERAMIC = '/placeholder-ceramic.svg';

// Drop-in <img> replacement with auto-reset on src change and ceramic SVG fallback
export const ImageWithFallback = ({
  src,
  alt = '',
  className,
  fallbackSrc = PLACEHOLDER_CERAMIC,
  imgClassName,
  ...rest
}) => {
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    setErrored(false);
  }, [src]);

  const finalSrc = !src || errored ? fallbackSrc : src;
  const isFallback = finalSrc === fallbackSrc;

  return (
    <img
      src={finalSrc}
      alt={alt}
      onError={() => {
        if (!errored) setErrored(true);
      }}
      loading="lazy"
      decoding="async"
      className={cn(
        isFallback ? 'object-contain bg-gray-100 dark:bg-gray-800' : 'object-cover',
        className,
        imgClassName
      )}
      {...rest}
    />
  );
};

export default ImageWithFallback;
