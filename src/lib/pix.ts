// BR Code (EMV MPM) generator — builds a valid "copia e cola" Pix payload.
// Spec: Banco Central do Brasil, Pix EMV QR Code.

const PIX_KEY = "doacao@solidarizaesperanca.org";
const MERCHANT_NAME = "SOLIDARIZE ESPERANCA";
const MERCHANT_CITY = "BARCARENA";

/** CRC16-CCITT-FALSE (poly 0x1021, init 0xFFFF) as 4 uppercase hex chars. */
function crc16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

/** TLV field: id + 2-digit length + value. */
function tlv(id: string, value: string): string {
  return `${id}${value.length.toString().padStart(2, "0")}${value}`;
}

/** Strip accents and characters outside the BR Code allowed set, cap length. */
function sanitize(value: string, maxLength: number): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9 .,\-@]/g, "")
    .trim()
    .slice(0, maxLength);
}

export function buildPixPayload(amount: number, reference?: string): string {
  const safeAmount = Math.max(0, Math.round(amount * 100) / 100);
  const amountField = safeAmount.toFixed(2);

  const merchantAccount =
    tlv("00", "BR.GOV.BCB.PIX") +
    tlv("01", PIX_KEY) +
    (reference ? tlv("02", sanitize(reference, 25)) : "");

  const payloadWithoutCrc =
    tlv("00", "01") + // payload format indicator
    tlv("26", merchantAccount) + // merchant account information (Pix)
    tlv("52", "0000") + // merchant category code
    tlv("53", "986") + // currency: BRL
    tlv("54", amountField) + // transaction amount
    tlv("58", "BR") + // country
    tlv("59", sanitize(MERCHANT_NAME, 25)) + // merchant name
    tlv("60", sanitize(MERCHANT_CITY, 15)) + // merchant city
    tlv("62", tlv("05", "***")) + // txid placeholder (static QR)
    "6304";

  return payloadWithoutCrc + crc16(payloadWithoutCrc);
}

export const PIX_KEY_PUBLIC = PIX_KEY;

/** Format a BRL amount for display, e.g. 70.5 -> "R$ 70,50". */
export function formatBRL(amount: number): string {
  return amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
