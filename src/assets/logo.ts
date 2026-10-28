import bopkriLogoImg from './images/logo_bopkri_gondolayu.png';
import qrisCodeImg from './images/qris_bopkri_code_1792603194917.jpg';
import schoolCrestImg from './images/school_crest_bopkri_1792603178165.jpg';
import officialStampImg from './images/aaa.jpg';

// Bundled assets processed by Vite for guaranteed loading across all devices & browsers
export const BOPKRI_LOGO = bopkriLogoImg;
export const QRIS_CODE = qrisCodeImg;
export const SCHOOL_CREST = schoolCrestImg;
export const OFFICIAL_STAMP = officialStampImg;

// Public root fallbacks in case of external embeds or direct URLs
export const BOPKRI_LOGO_FALLBACK = './logo_bopkri_gondolayu.png';
export const QRIS_CODE_FALLBACK = './qris_bopkri_code_1792603194917.jpg';

/**
 * Image error handler to ensure fallback to public root if bundling fails
 */
export const handleImageError = (
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  fallbackUrl: string = BOPKRI_LOGO_FALLBACK
) => {
  const target = e.currentTarget;
  if (!target.dataset.triedFallback) {
    target.dataset.triedFallback = 'true';
    target.src = fallbackUrl;
  }
};
