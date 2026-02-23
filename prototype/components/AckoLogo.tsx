'use client';

/**
 * ACKO logo — uses official brand files from /public/brand-logo/.
 *
 * Variants:
 *  - "color"         → gradient purple icon + dark #2C2067 text  (light backgrounds)
 *  - "color-on-dark" → gradient purple icon + white text          (dark transparent/overlay)
 *  - "white"         → all-white icon + text                      (dark / midnight backgrounds)
 *  - "black"         → all-black icon + text                      (pure-white backgrounds)
 *  - "icon"          → isolated icon mark, no wordmark            (chat avatar etc.)
 *
 * Theme mapping guide:
 *  midnight / dark  →  "white"
 *  light            →  "color"
 */

interface AckoLogoProps {
  variant?: 'color' | 'color-on-dark' | 'white' | 'black' | 'icon';
  className?: string;
}

const LOGO_SRC: Record<Exclude<AckoLogoProps['variant'], 'icon'>, string> = {
  'color':         '/brand-logo/acko-color.svg',
  'color-on-dark': '/brand-logo/acko-color-on-dark.svg',
  'white':         '/brand-logo/acko-white.svg',
  'black':         '/brand-logo/acko-black.svg',
};

export default function AckoLogo({ variant = 'color', className = 'h-8' }: AckoLogoProps) {
  if (variant === 'icon') {
    return (
      <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="16" fill="#4e29bb"/>
        <path d="M24.5 13.2c.03-.02.07-.05.08-.07.02-.03.04-.06.05-.09.03-.09.02-.2-.04-.29-.09-.14-.23-.24-.39-.34C19.36 9.24 16.59 8.25 15.62 7.97c-1.34-.38-2.05-.34-2.16-.33-2.44.17-6.57 3.48-6.57 3.48s3.36-0.81 11.13 2.82c.25.12.51.24.77.36l4.24-1.93s.21-.12.27-.15z" fill="white"/>
        <path d="M24.66 14.07v4.12c0 .32-.14.59-.44.78-3.67 2.36-5.62 3.35-6.56 3.62-1.34.38-2.05.34-2.16.33-2.44-.17-6.57-3.48-6.57-3.48s3.36.81 11.13-2.82c1.46-.68 3.08-1.41 4.97-2.27 0 0 .41-.18.5-.25l.13-.03z" fill="white"/>
        <path d="M12.14 16.06c.01-.88.12-1.76.33-2.63l.03-.11c-1.53-.35-2.66-.43-3.34-.43-.56 0-.86.05-.96.07-.18.04-.3.18-.39.3-.55.71-.86 1.73-.86 2.79 0 1.06.31 2.08.86 2.79.09.12.22.25.39.3.1.02.4.07.96.07.68 0 1.81-.08 3.34-.43l-.03-.11c-.2-.87-.32-1.75-.33-2.63z" fill="white"/>
      </svg>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={LOGO_SRC[variant]}
      alt="ACKO"
      className={className}
      style={{ width: 'auto' }}
      draggable={false}
    />
  );
}
