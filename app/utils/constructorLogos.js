// Constructor logo assets. No F1 data API (Jolpi/Ergast, OpenF1) provides logos, so these are
// hardcoded — a mix of locally-hosted images the user supplied and Wikipedia/Wikimedia Commons
// emblem images (prancing horse, three-pointed star, four rings, etc.) rather than the full
// sponsor-laden team wordmark.
//
// Each entry has a `fit` mode:
// - 'cover': the image is a self-contained badge (its own colored/white background fills the
//   frame), so it's rendered edge-to-edge with no extra backdrop.
// - 'contain': the image is line art on a transparent background (mostly solid black ink), so
//   it needs a white circular backdrop behind it or it disappears against the dark page.
//
// Caveats:
// - Ferrari's local image is a photo of a physical sign board, not an isolated logo file — it's
//   center-cropped to a circle, which works because the shield sits roughly centered in frame.
// - Aston Martin's local image was a wide title-card (wings badge + "ASTON MARTIN FORMULA ONE
//   TEAM" wordmark on a lot of empty green) — it's been pre-cropped to just the wings badge on
//   its brand-green background, so it's stored locally rather than hotlinked.
// - Audi's local image was the "Audi / Revolut F1 Team" sponsor lockup on black — it's been
//   pre-cropped to just the four rings on that black background.
// - Haas's local image was a wallpaper with the H-emblem/wordmark plus a large decorative
//   watermark shape below — it's been pre-cropped to just the emblem and wordmark on red.
// - Mercedes's local image was the "MERCEDES AMG PETRONAS Formula One Team" wallpaper — it's
//   been pre-cropped to just the three-pointed star on Mercedes' teal background.
const CONSTRUCTOR_LOGOS = {
    'Red Bull': { url: '/images/constructors/redbull.jpg', fit: 'cover' },
    'Alpine': { url: '/images/constructors/alpine.png', fit: 'cover' },
    'McLaren': { url: '/images/constructors/mclaren.jpeg', fit: 'cover' },
    'Ferrari': { url: '/images/constructors/ferrari.jpg', fit: 'cover' },
    'RB': { url: '/images/constructors/racing-bulls.jpg', fit: 'cover' },
    'Aston Martin': { url: '/images/constructors/aston-martin.png', fit: 'cover' },
    'Audi': { url: '/images/constructors/audi.png', fit: 'cover' },
    'Haas': { url: '/images/constructors/haas.png', fit: 'cover' },
    'Mercedes': { url: '/images/constructors/mercedes.png', fit: 'cover' },
    'Williams': { url: 'https://upload.wikimedia.org/wikipedia/commons/8/87/Williams_Racing_Monogram.png', fit: 'contain' },
    'Cadillac': { url: 'https://upload.wikimedia.org/wikipedia/en/6/66/Cadillac_logo_BW.svg', fit: 'contain' },
};

export const getConstructorLogo = (teamName) => {
    if (!teamName) return null;
    for (const [key, logo] of Object.entries(CONSTRUCTOR_LOGOS)) {
        if (teamName.includes(key)) return logo;
    }
    return null;
};
