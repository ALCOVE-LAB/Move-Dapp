/** Convert string to hex-encoded utf-8 bytes. */
export const stringToHex = (text: string) => {
  const encoder = new TextEncoder();
  const encoded = encoder.encode(text);
  // eslint-disable-next-line unicorn/prefer-spread
  return Array.from(encoded, (i) => i.toString(16).padStart(2, "0")).join("");
};

export const walletAddressEllipsis = (address: string | undefined) => {
  if (!address) {
    return "";
  }
  return address.slice(0, 4) + "..." + address.slice(-6);
};

export const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const isValidUrl = (value: string) => {
  return /^(?:https:)?\/\/(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4])|(?:[\da-z\u00A1-\uFFFF]-*)*[\da-z\u00A1-\uFFFF]+(?:\.(?:[\da-z\u00A1-\uFFFF]-*)*[\da-z\u00A1-\uFFFF]+)*\.[a-z\u00A1-\uFFFF]{2,})(?::\d{2,5})?(?:[#/?]\S*)?$/i.test(
    value
  );
};
