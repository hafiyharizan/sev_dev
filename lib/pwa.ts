/** True only for Safari on iPhone/iPad (Chrome/Firefox on iOS cannot "Add to Home Screen" as an app). */
export function isIosSafari(userAgent: string): boolean {
  const ios = /iPhone|iPad|iPod/.test(userAgent);
  const otherBrowser = /CriOS|FxiOS|EdgiOS|OPiOS/.test(userAgent);
  return ios && !otherBrowser && /Safari\//.test(userAgent);
}
