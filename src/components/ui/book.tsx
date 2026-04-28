import React, { useEffect, useRef, useState } from "react";
import { useResponsive } from "@/components/ui/use-responsive";
import clsx from "clsx";

interface ResponsiveProp<T> {
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
}

interface BookProps {
  title: string;
  variant?: "simple" | "stripe";
  width?: number | ResponsiveProp<number>;
  color?: string;
  textColor?: string;
  illustration?: React.ReactNode;
  textured?: boolean;
  coverUrl?: string;
  animationDelay?: number;
}

export const Book = ({
  title,
  variant = "stripe",
  width = 196,
  color,
  textColor = "var(--ds-gray-1000)",
  illustration,
  textured = false,
  coverUrl,
  animationDelay = 0,
}: BookProps) => {
  const _width = useResponsive(width);
  const _color = color ? color : variant === "simple" ? "var(--ds-background-200)" : "var(--ds-amber-600)";
  const _illustration = illustration ? illustration : null;

  // Track displayed cover URL so it can fade out after coverUrl is removed
  const prevCoverUrlRef = useRef<string | undefined>(coverUrl);
  const [displayCoverUrl, setDisplayCoverUrl] = useState<string | undefined>(coverUrl);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    if (coverUrl) {
      prevCoverUrlRef.current = coverUrl;
      const timer = setTimeout(() => {
        setDisplayCoverUrl(coverUrl);
        setIsFadingOut(false);
      }, 0);
      return () => clearTimeout(timer);
    } else if (prevCoverUrlRef.current) {
      const fadeTimer = setTimeout(() => setIsFadingOut(true), 0);
      const timer = setTimeout(() => {
        prevCoverUrlRef.current = undefined;
        setDisplayCoverUrl(undefined);
        setIsFadingOut(false);
      }, 450);
      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(timer);
      };
    }
  }, [coverUrl]);

  const coverImgStyle: React.CSSProperties = isFadingOut
    ? { opacity: 1, animation: "fade-out 0.4s ease 0s forwards" }
    : { opacity: 0, animation: `fade-in 0.5s ease ${animationDelay}s forwards` };
  const hasDisplayedCover = Boolean(displayCoverUrl);
  const coverRevealStyle: React.CSSProperties = hasDisplayedCover && !isFadingOut
    ? { opacity: 0, animation: `fade-in 0.5s ease ${animationDelay}s forwards` }
    : { opacity: 1 };
  const fallbackLayerStyle: React.CSSProperties = hasDisplayedCover
    ? { opacity: 0 }
    : { opacity: 1 };

  return (
    <div className="inline-block w-fit" style={{ perspective: 900, ...coverRevealStyle }}>
      <div
        className="aspect-[2/3] w-fit relative rotate-0 duration-[250ms] book-rotate"
        style={{ transformStyle: "preserve-3d", minWidth: _width, containerType: "inline-size" }}
      >
        <div
          className="flex flex-col h-full rounded-l-md rounded-r overflow-hidden bg-background-200 shadow-book translate-x-0 relative after:absolute after:border after:border-gray-alpha-400 after:w-full after:h-full after:shadow-book-border after:rounded-l-md after:rounded-r after:pointer-events-none"
          style={{ width: _width }}
        >
          {/* Top color section */}
          <div
            className={clsx("w-full relative overflow-hidden", variant === "stripe" && "flex-1")}
            style={{ background: _color, ...fallbackLayerStyle }}
          >
            {variant === "stripe" && illustration && (
              <div className="absolute h-full w-full">{_illustration}</div>
            )}
            <div className="absolute h-full w-[8.2%] mix-blend-overlay" style={{ background: "var(--ds-book-bind)" }} />
          </div>

          {/* Bottom text section */}
          <div
            className={clsx(
              "relative flex-1",
              (variant === "stripe" || (variant === "simple" && color === undefined)) && "bg-book-gradient"
            )}
            style={{
              background: variant === "simple" && color !== undefined ? _color : undefined,
              ...fallbackLayerStyle,
            }}
          >
            <div className="absolute h-full w-[8.2%] opacity-20" style={{ background: "var(--ds-book-bind)" }} />
            <div
              className={clsx(
                "flex flex-col w-full p-[6.1%] pl-[14.3%]",
                variant === "simple" ? "gap-4" : "justify-between"
              )}
              style={{ containerType: "inline-size", gap: `calc((24px / 196) * ${_width})` }}
            >
              <span
                className={clsx(
                  "leading-[1.25em] tracking-[-.02em] text-balance font-semibold",
                  variant === "simple" ? "text-[12cqw]" : "text-[10.5cqw]"
                )}
                style={{ color: textColor }}
              >
                {title}
              </span>
              {variant !== "stripe" && _illustration}
            </div>
          </div>

          {/* Cover image — fades in sequentially, fades out when removed */}
          {displayCoverUrl && (
            <>
              <img
                src={displayCoverUrl}
                alt={title}
                className="absolute inset-0 w-full h-full object-cover rounded-l-sm rounded-r pointer-events-none"
                style={coverImgStyle}
              />
              <div
                className="absolute top-0 left-0 h-full w-[8.2%] pointer-events-none mix-blend-overlay"
                style={{ background: "var(--ds-book-bind)" }}
              />
            </>
          )}

          {textured && !hasDisplayedCover && (
            <div className="absolute top-0 left-0 inset-0 rotate-180 rounded-l-md rounded-r mix-blend-hard-light pointer-events-none bg-cover bg-no-repeat opacity-50 brightness-110 bg-[url('https://assets.vercel.com/image/upload/v1720554484/front/design/book-texture.avif')]" />
          )}
        </div>

        {/* Spine side panel */}
        <div
          className="h-[calc(100%_-_2_*_3px)] w-[calc(29cqw_-_2px)] absolute top-[3px]"
          style={{
            background: "linear-gradient(90deg, #eaeaea, transparent 70%), linear-gradient(#fff, #fafafa)",
            transform: `translateX(calc(${_width} * 1px - 29cqw / 2 - 3px)) rotateY(90deg) translateX(calc(29cqw / 2))`,
          }}
        />

        {/* Back panel */}
        <div
          className="bg-gray-200 absolute left-0 top-0 rounded-l-md rounded-r h-full"
          style={{ width: _width, transform: "translateZ(calc(-1 * 29cqw))" }}
        />
      </div>
    </div>
  );
};
