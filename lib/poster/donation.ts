// Static donation panel shown on the generated poster (spec 9b). Changed only by a code deploy so that
// no admin account can swap the bank details. The account number matches public/images/QR_SEV.jpg.
export const DONATION = {
  heading: 'Jom Berinfaq & Imarah',
  bank: 'BANK ISLAM',
  account: '1229 8010 0202 49',
  accountName: 'SURAU ELMINA VALLEY',
} as const;

// Where the QR code sits inside public/images/QR_SEV.jpg (pixels), so the poster can crop just the QR.
export const QR_CROP = { imageWidth: 2048, imageHeight: 1448, x: 57, y: 1030, size: 367 } as const;
