import Image from "next/image";

import Button from "../ui/Button";
import FadeIn from "../ui/FadeIn";
import type {ReactNode,} from "react";

type HeroPoint = {
  text: string;
};


type HeroButton = {
  label: string;
  href: string;
  variant?: "primary" | "secondary";
};

type HeroProps = {
  eyebrow: string;

  title: string;

  highlightedTitle: string;

  description: string;

  image: string;

  visual?: ReactNode;

  imageAlt: string;

  accent?: "blue" | "green" | "purple" | "orange";

  buttons?: HeroButton[];

  points?: HeroPoint[];

  imagePosition?: "left" | "right";
};

const accentStyles = {
  blue: {
    eyebrow: "text-blue-400",
    title: "text-blue-500",
  },

  green: {
    eyebrow: "text-emerald-400",
    title: "text-emerald-500",
  },

  purple: {
    eyebrow: "text-purple-400",
    title: "text-purple-500",
  },

  orange: {
    eyebrow: "text-amber-400",
    title: "text-amber-400",
  },
};

export default function Hero({
  eyebrow,
  title,
  highlightedTitle,
  description,
  image,
  imageAlt,
  visual,
  accent = "blue",

  buttons = [],

  points = [],

  imagePosition = "right",
}: HeroProps) {
  const colors = accentStyles[accent];

  const textContent = (
    <FadeIn>
      <div>

        {/* EYEBROW */}

        <p
          className={`mb-4 text-sm font-semibold uppercase tracking-[0.3em] ${colors.eyebrow}`}
        >
          {eyebrow}
        </p>


        {/* TITLE */}

        <h1 className="text-5xl font-bold leading-tight text-gray-200 lg:text-7xl">

          {title}

          <br />

          <span className={colors.title}>
            {highlightedTitle}
          </span>

        </h1>


        {/* DESCRIPTION */}

        <p className="mt-8 max-w-xl text-lg leading-8 text-gray-400">
          {description}
        </p>


        {/* BUTTONS */}

        {buttons.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-4">

            {buttons.map((button) => (
              <Button
                key={button.label}
                href={button.href}
                variant={
                  button.variant === "secondary"
                    ? "secondary"
                    : undefined
                }
              >
                {button.label}
              </Button>
            ))}

          </div>
        )}


        {/* POINTS */}

        {points.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-4 text-sm text-gray-400">

            {points.map((point) => (
              <span key={point.text}>
                ✔ {point.text}
              </span>
            ))}

          </div>
        )}

      </div>
    </FadeIn>
  );


  
  const imageContent = (
  <FadeIn delay={0.3}>
    <div className="flex items-center justify-center">

      <div className="relative w-full">

        {visual ? (
          visual
        ) : image ? (
          <Image
            src={image}
            alt={imageAlt || ""}
            width={1536}
            height={1024}
            priority
            className="
              h-auto
              w-full
              object-cover
              [mask-image:radial-gradient(ellipse_82%_82%_at_58%_50%,black_55%,transparent_100%)]
              [-webkit-mask-image:radial-gradient(ellipse_82%_82%_at_58%_50%,black_55%,transparent_100%)]
            "
          />
        ) : null}

      </div>

    </div>
  </FadeIn>
);


  return (
    <section className="mx-auto max-w-7xl px-6 py-20">

      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">

        {imagePosition === "left" ? (
          <>
            {imageContent}
            {textContent}
          </>
        ) : (
          <>
            {textContent}
            {imageContent}
          </>
        )}

      </div>

    </section>
  );
}