import React, { useState } from 'react';

export function ImageGallery({ images = [], fallbackTitle = 'Product Image' }) {
  const defaultFallback =
    'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&q=80&w=600';

  const validImages = images.length > 0 ? images : [{ id: 'fallback', imageUrl: defaultFallback }];
  const primaryIndex = validImages.findIndex((img) => img.primary);
  const [selectedIndex, setSelectedIndex] = useState(primaryIndex !== -1 ? primaryIndex : 0);

  const currentImage = validImages[selectedIndex]?.imageUrl || defaultFallback;

  return (
    <div className="flex flex-col gap-3 max-w-md mx-auto w-full">
      {/* Main Image Display - Sized cleanly, no vertical blowout */}
      <div className="relative aspect-square max-h-[380px] w-full overflow-hidden rounded-2xl bg-slate-50 border border-slate-200/90 shadow-soft-xs flex items-center justify-center p-2 group">
        <img
          src={currentImage}
          alt={fallbackTitle}
          className="h-full w-full object-contain rounded-xl transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.target.src = defaultFallback;
          }}
        />
      </div>

      {/* Thumbnails */}
      {validImages.length > 1 && (
        <div className="flex items-center justify-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
          {validImages.map((img, idx) => (
            <button
              key={img.id || idx}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              className={`relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all p-1 bg-white ${
                selectedIndex === idx
                  ? 'border-brand-600 ring-2 ring-brand-100 shadow-soft-xs'
                  : 'border-slate-200 opacity-70 hover:opacity-100'
              }`}
            >
              <img
                src={img.imageUrl}
                alt={`Thumbnail ${idx + 1}`}
                className="h-full w-full object-contain"
                onError={(e) => {
                  e.target.src = defaultFallback;
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
