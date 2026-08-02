// Manual overrides for driver headshots, keyed by driver code (e.g. "PER").
// OpenF1's headshot_url (see getDriverHeadshots in f1Api.js) either lags behind mid-season team
// changes (still serving a driver's old-team photo) or, for brand-new rookies, only has F1's
// generic "no photo available" silhouette — so these take priority over the OpenF1 lookup.
const DRIVER_PHOTO_OVERRIDES = {
    PER: '/images/drivers/perez.png', // was showing old Red Bull kit; now Cadillac
    BOT: '/images/drivers/bottas.png', // was showing old Sauber/Stake kit; now Cadillac
    BOR: '/images/drivers/bortoleto.png', // official Audi studio portrait
    HUL: '/images/drivers/hulkenberg.png', // official Audi studio portrait
    HAD: '/images/drivers/hadjar.png', // was showing old Racing Bulls kit; now Red Bull
    LIN: '/images/drivers/lindblad.png', // rookie; OpenF1 only had the generic silhouette
};

export const getDriverPhotoOverride = (code) => DRIVER_PHOTO_OVERRIDES[code] || null;
