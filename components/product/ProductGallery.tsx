"use client";

import { useState } from "react";

interface ProductImage {
  id: string;
  image_url: string;
  title: string | null;
  description: string | null;
}

interface ProductGalleryProps {
  images: ProductImage[];
}

export default function ProductGallery({
  images,
}: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);

  if (images.length === 0) {
    return null;
  }

  const activeImage = images[selectedImage];

  return (
    <section className="mt-20">

      <div className="mb-8">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-sky-600">
          Product Showcase
        </p>

        <h2 className="text-3xl font-bold text-slate-900">
          See It In Action
        </h2>
      </div>

      {/* Main Image */}

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-lg">
        <img
          src={activeImage.image_url}
          alt={activeImage.title || "Product screenshot"}
          className="max-h-[700px] w-full object-contain"
        />
      </div>

      {/* Thumbnails */}

      <div className="mt-6 flex gap-4 overflow-x-auto pb-4">

        {images.map((image, index) => (
          <button
            key={image.id}
            onClick={() => setSelectedImage(index)}
            className={`group min-w-[180px] overflow-hidden rounded-2xl border-2 transition ${
              selectedImage === index
                ? "border-sky-500 shadow-lg"
                : "border-slate-200 hover:border-slate-400"
            }`}
          >
            <img
              src={image.image_url}
              alt={image.title || "Product screenshot"}
              className="aspect-video w-full object-cover transition group-hover:scale-105"
            />

            {image.title && (
              <div className="bg-white px-3 py-3 text-left">
                <p className="text-sm font-semibold text-slate-800">
                  {image.title}
                </p>
              </div>
            )}
          </button>
        ))}

      </div>

      {activeImage.description && (
        <p className="mt-4 text-slate-500">
          {activeImage.description}
        </p>
      )}

    </section>
  );
}