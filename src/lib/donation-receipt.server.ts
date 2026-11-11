import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { DonationReceipt } from "./donation-email.server";
import { donationLogoBase64 } from "./donation-brand.server";

/** Payment acknowledgement only; never a tax invoice or tax-deductibility certificate. */
export async function createDonationReceipt(receipt: DonationReceipt): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const date = new Date(receipt.confirmedAt);
  if (!Number.isFinite(date.getTime())) throw new Error("Data de confirmação inválida.");
  pdf.setTitle("Recibo de doação - sem valor fiscal");
  pdf.setAuthor("Juntos por Vidas");
  pdf.setCreationDate(date);
  pdf.setModificationDate(date);
  const page = pdf.addPage([595.28, 841.89]);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const green = rgb(0.09, 0.54, 0.28);
  const ink = rgb(0.15, 0.2, 0.23);
  const muted = rgb(0.4, 0.44, 0.46);
  const safe = (text: string) =>
    [...text.replace(/[\r\n\t]/g, " ")]
      .map((char) => {
        try {
          regular.encodeText(char);
          return char;
        } catch {
          return "?";
        }
      })
      .join("");
  const draw = (text: string, y: number, size = 11, strong = false, color = ink, x = 48) => {
    page.drawText(safe(text), { x, y, size, font: strong ? bold : regular, color });
  };
  page.drawRectangle({ x: 0, y: 805, width: 595.28, height: 37, color: green });
  const logo = await pdf.embedPng(donationLogoBase64);
  page.drawImage(logo, { x: 48, y: 709, width: 88, height: 88 });
  draw("JUNTOS POR VIDAS", 760, 18, true, green, 154);
  draw("Transformando solidariedade em esperança.", 740, 10, false, muted, 154);
  draw("juntos-por-vidas.online", 723, 10, false, muted, 154);
  draw("Recibo de doação", 675, 27, true);
  draw("SEM VALOR FISCAL", 648, 11, true, muted);
  const locale = receipt.currency === "EUR" ? "pt-PT" : "pt-BR";
  const timezone = receipt.currency === "EUR" ? "Europe/Lisbon" : "America/Sao_Paulo";
  const amount = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: receipt.currency,
  }).format(receipt.amountInCents / 100);
  const when = new Intl.DateTimeFormat(locale, {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: timezone,
  }).format(date);
  const method = { pix: "Pix", mbway: "MB WAY", multibanco: "Multibanco" }[receipt.method];
  page.drawRectangle({ x: 48, y: 543, width: 499, height: 73, color: rgb(0.92, 0.97, 0.94) });
  draw("VALOR CONFIRMADO", 592, 10, true, green, 64);
  draw(amount, 562, 24, true, green, 64);
  let y = 505;
  const field = (label: string, value: string) => {
    draw(label, y, 10, true, muted);
    y -= 19;
    // Wrap by actual font metrics so long donor names and email addresses never clip.
    let line = "";
    for (const char of safe(value)) {
      if (regular.widthOfTextAtSize(line + char, 11) > 495) {
        draw(line, y);
        y -= 16;
        line = "";
      }
      line += char;
    }
    if (line) draw(line, y);
    y -= 31;
  };
  field("Número do pedido", receipt.orderId);
  field("Doador", receipt.name);
  field("Email", receipt.email);
  field("Método de pagamento", method);
  field("Confirmação registrada em", when + " (" + timezone + ")");
  draw("Obrigado pela sua solidariedade.", 162, 13, true, green);
  draw("Este documento confirma o pagamento de uma doação.", 130, 10, false, muted);
  draw(
    "Não é nota fiscal e não comprova direito a benefício ou dedução fiscal.",
    113,
    10,
    false,
    muted,
  );
  draw("Rua da Alegria, nº 43, 2º Esquerdo, 4000-032 Porto, Portugal", 83, 9, false, muted);
  draw("NIF Empresarial: 245443371", 67, 9, true, muted);
  draw("Juntos por Vidas | Comprovante emitido automaticamente", 48, 9, false, muted);
  return pdf.save();
}
