import { useEffect, useState } from "react";

const BREAKPOINTS = {
  SM: 0,
  MD: 600,
  LG: 960,
  XL: 1200,
};

type ResponsiveObject<T> = {
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
};

type ResponsiveValue<T> = T | ResponsiveObject<T>;

function isResponsiveObject<T>(styles: ResponsiveValue<T>): styles is ResponsiveObject<T> {
  if (typeof styles !== "object" || styles === null || Array.isArray(styles)) {
    return false;
  }

  return "sm" in styles || "md" in styles || "lg" in styles || "xl" in styles;
}

function compute<T>(styles: ResponsiveValue<T>): T {
  if (!isResponsiveObject(styles)) {
    return styles as T;
  }

  let current: T | undefined;
  if (styles.sm !== undefined && window.innerWidth >= BREAKPOINTS.SM) current = styles.sm;
  if (styles.md !== undefined && window.innerWidth >= BREAKPOINTS.MD) current = styles.md;
  if (styles.lg !== undefined && window.innerWidth >= BREAKPOINTS.LG) current = styles.lg;
  if (styles.xl !== undefined && window.innerWidth >= BREAKPOINTS.XL) current = styles.xl;
  return current as T;
}

export const useResponsive = <T,>(styles: ResponsiveValue<T>) => {
  const [responsiveStyles, setResponsiveStyles] = useState<T>(() => {
    // If plain value (not a responsive object), return immediately
    if (!isResponsiveObject(styles)) return styles as T;
    return compute(styles);
  });

  const stylesKey = JSON.stringify(styles);

  useEffect(() => {
    const listener = () => setResponsiveStyles(compute(styles));
    listener();
    window.addEventListener("resize", listener);
    return () => window.removeEventListener("resize", listener);
  }, [styles, stylesKey]);

  return responsiveStyles;
};
