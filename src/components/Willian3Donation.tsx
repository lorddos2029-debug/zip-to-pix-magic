import { useEffect, useRef, useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import QRCode from "react-qr-code";
import { createUrusCharge, checkUrusStatus, type UrusChargeResult } from "@/lib/urus.functions";
import { getCampaignAttribution, getSavedFacebookFbc } from "@/lib/campaign-attribution";
import { trackPixPageOpen } from "@/lib/tracking.functions";
import { trackMetaInitiateCheckout, trackMetaPurchase } from "@/lib/meta-pixel";
import "@/styles/willian3-donation.css";

const key = "willian3:pix:v1";
const money = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
function cookie(name: string) {
  return (
    document.cookie
      .split("; ")
      .find((v) => v.startsWith(name + "="))
      ?.slice(name.length + 1) || ""
  );
}
export function validCpf(value: string) {
  const s = value.replace(/\D/g, "");
  if (s.length !== 11 || /^(\d)\1+$/.test(s)) return false;
  return [9, 10].every((n) => {
    let sum = 0;
    for (let i = 0; i < n; i++) sum += Number(s[i]) * (n + 1 - i);
    const digit = (sum * 10) % 11;
    return Number(s[n]) === (digit === 10 ? 0 : digit);
  });
}
type Saved = { charge: UrusChargeResult; eventId: string };
export default function Willian3Donation({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null),
    busy = useRef(false);
  const [step, setStep] = useState(1),
    [amount, setAmount] = useState("30"),
    [anonymous, setAnonymous] = useState(false);
  const [pending, setPending] = useState(false),
    [uncertain, setUncertain] = useState(false),
    [error, setError] = useState("");
  const [saved, setSaved] = useState<Saved | null>(null),
    [paid, setPaid] = useState(false),
    [status, setStatus] = useState(""),
    [copied, setCopied] = useState(false);
  const event = useRef(""),
    purchase = useRef(false);
  const create = useServerFn(createUrusCharge),
    check = useServerFn(checkUrusStatus),
    trackOpen = useServerFn(trackPixPageOpen);
  const value = Number(amount.replace(",", "."));
  useEffect(() => {
    if (!open) return;
    const el = dialog.current;
    el?.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    try {
      const raw = sessionStorage.getItem(key);
      if (raw) {
        const data = JSON.parse(raw);
        if (data.charge?.venda_id && data.charge?.pix_code && data.eventId) setSaved(data);
        else if (data.pending) setUncertain(true);
      }
    } catch {}
    if (!event.current) {
      event.current = "ev_" + crypto.randomUUID();
      trackMetaInitiateCheckout(event.current);
      void trackOpen({
        data: {
          event_id: event.current,
          fbp: cookie("_fbp"),
          fbc: cookie("_fbc") || getSavedFacebookFbc(),
          source_url: location.href,
        },
      }).catch(() => {});
    }
    return () => {
      el?.close();
      document.body.style.overflow = overflow;
    };
  }, [open, trackOpen]);
  useEffect(() => {
    if (!saved || paid) return;
    let stop = false,
      timer: ReturnType<typeof setTimeout>;
    const poll = async () => {
      try {
        const result = await check({ data: { venda_id: saved.charge.venda_id } });
        if (stop) return;
        if (result.pago) {
          setPaid(true);
          setStatus("");
          if (!purchase.current) {
            trackMetaPurchase(saved.eventId, saved.charge.valor);
            purchase.current = true;
          }
          return;
        }
        const failed = /expired|expirado|cancel|failed|falh/i.test(result.status);
        setStatus(
          failed
            ? "Este pedido foi encerrado sem confirmação de pagamento. Consulte o suporte antes de tentar novamente."
            : "Aguardando a confirmação do pagamento.",
        );
      } catch {
        if (!stop)
          setStatus(
            "Não foi possível atualizar agora. Vamos consultar novamente; não é necessário gerar outro Pix.",
          );
      }
      if (!stop) timer = setTimeout(poll, 5000);
    };
    void poll();
    return () => {
      stop = true;
      clearTimeout(timer);
    };
  }, [saved, paid, check]);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy.current || uncertain || saved) return;
    const data = new FormData(e.currentTarget),
      cpf = String(data.get("cpf") || "").replace(/\D/g, ""),
      phone = String(data.get("phone") || "").replace(/\D/g, "");
    if (!validCpf(cpf)) {
      setError("Informe um CPF válido.");
      return;
    }
    if (!/^(?:55)?[1-9][0-9]{9,10}$/.test(phone)) {
      setError("Informe o telefone com DDD.");
      return;
    }
    if (!Number.isFinite(value) || value < 1 || value > 1000000) {
      setError("Informe um valor entre R$ 1 e R$ 1.000.000.");
      return;
    }
    busy.current = true;
    setPending(true);
    setError("");
    const id = crypto.randomUUID().replaceAll("-", "");
    try {
      sessionStorage.setItem(key, JSON.stringify({ pending: true }));
      const charge = await create({
        data: {
          valor: Math.round(value * 100) / 100,
          moeda: "BRL",
          nome: anonymous
            ? "Doador Anônimo " + id.slice(0, 6)
            : String(data.get("name") || "").trim(),
          email: anonymous
            ? "anonimo-" + id + "@example.com"
            : String(data.get("email") || "").trim(),
          cpf,
          telefone: phone,
          descricao: "Doação — Willian",
          itens: [
            {
              id: "doacao",
              nome: "Doação — Willian",
              quantidade: 1,
              preco_unitario: Math.round(value * 100) / 100,
            },
          ],
          ...getCampaignAttribution(),
          fbp: cookie("_fbp"),
          fbc: cookie("_fbc") || getSavedFacebookFbc(),
          evento_id: event.current,
          user_agent: navigator.userAgent,
        },
      });
      const result = { charge, eventId: event.current };
      setSaved(result);
      try {
        sessionStorage.setItem(key, JSON.stringify(result));
      } catch {}
    } catch {
      setUncertain(true);
      setError(
        "Não foi possível confirmar a geração do Pix. Consulte o suporte antes de gerar outro pedido para evitar duplicidade.",
      );
    } finally {
      setPending(false);
      busy.current = false;
    }
  }
  async function copy() {
    if (!saved) return;
    try {
      await navigator.clipboard.writeText(saved.charge.pix_code);
      setCopied(true);
    } catch {
      setError("Selecione e copie o código no campo abaixo.");
    }
  }
  return (
    <dialog
      ref={dialog}
      className="w3-donation"
      aria-labelledby="w3-donation-title"
      onCancel={(e) => {
        e.preventDefault();
        if (!pending) onClose();
      }}
    >
      <header className="w3d-header">
        <h2 id="w3-donation-title">{saved ? "♡ Sua doação" : "♥ Faça sua Doação"}</h2>
        <button type="button" aria-label="Fechar" disabled={pending} onClick={onClose}>
          ×
        </button>
      </header>
      {saved ? (
        <div className="w3d-payment">
          <img
            src="/willian/juntos-por-vidas-logo.png"
            alt="Juntos por Vidas"
            width="86"
            height="86"
          />
          <span className="w3d-total">Doação de {money(saved.charge.valor)}</span>
          <h2>{paid ? "Doação confirmada!" : "Quase lá!"}</h2>
          <p>
            {paid
              ? "Obrigado por apoiar o Willian e sua família. Seu gesto faz a diferença."
              : "Falta só um passo para concluir sua doação ao Willian."}
          </p>
          {!paid && (
            <>
              <section>
                <h3>1. Copie o código Pix</h3>
                <label htmlFor="w3-pix-code">Pix Copia e Cola</label>
                <textarea
                  id="w3-pix-code"
                  readOnly
                  value={saved.charge.pix_code}
                  onFocus={(e) => e.target.select()}
                />
                <button className="w3d-cta" onClick={copy}>
                  {copied ? "CÓDIGO COPIADO ✓" : "COPIAR CÓDIGO PIX"}
                </button>
              </section>
              <section>
                <h3>2. Finalize no seu banco</h3>
                <ol>
                  <li>Abra o aplicativo do seu banco.</li>
                  <li>Na área Pix, escolha Pix Copia e Cola.</li>
                  <li>
                    Cole o código, confira o valor e o destinatário apresentado pelo banco e
                    confirme.
                  </li>
                </ol>
              </section>
              <section className="w3d-qr">
                <h3>Ou escaneie o QR Code</h3>
                <p>No aplicativo do banco, escolha pagar com QR Code.</p>
                <QRCode value={saved.charge.pix_code} size={208} />
              </section>
              <p role="status">{status || "Aguardando a confirmação do pagamento."}</p>
            </>
          )}
          <small>Pedido #{saved.charge.venda_id} · Pix processado pela UrusPay</small>
          {error && <p role="alert">{error}</p>}
        </div>
      ) : (
        <>
          <div className="w3d-steps">
            <span className={step === 1 ? "active" : ""}>❶ VALOR</span>
            <span className={step === 2 ? "active" : ""}>❷ IDENTIFICAÇÃO</span>
          </div>
          {step === 1 ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (Number.isFinite(value) && value >= 1 && value <= 1000000) {
                  setError("");
                  setStep(2);
                }
              }}
            >
              <div className="w3d-body">
                <div className="w3d-values">
                  {[15, 30, 50, 100, 150, 200, 250, 500, 1000].map((n) => (
                    <button
                      type="button"
                      key={n}
                      aria-pressed={value === n}
                      className={value === n ? "selected" : ""}
                      onClick={() => setAmount(String(n))}
                    >
                      {n === 30 && <small>MAIS ESCOLHIDO</small>}
                      {money(n).replace(",00", "")}
                    </button>
                  ))}
                </div>
                <label className="w3d-custom">
                  OU DIGITE OUTRO VALOR
                  <div>
                    <b>R$</b>
                    <input
                      aria-label="Outro valor em reais"
                      type="number"
                      inputMode="decimal"
                      min="1"
                      max="1000000"
                      step=".01"
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                </label>
              </div>
              <footer>
                <button className="w3d-cta">CONTINUAR →</button>
              </footer>
            </form>
          ) : (
            <form onSubmit={submit}>
              <div className="w3d-body">
                <h3>Falta pouco!</h3>
                <p className="w3d-summary">
                  Total da doação: <strong>{money(value)}</strong>
                  <button type="button" disabled={pending || uncertain} onClick={() => setStep(1)}>
                    Alterar
                  </button>
                </p>
                <fieldset disabled={pending || uncertain}>
                  <label className="w3d-anonymous">
                    <input
                      type="checkbox"
                      checked={anonymous}
                      onChange={(e) => setAnonymous(e.target.checked)}
                    />{" "}
                    Doar anonimamente
                  </label>
                  {!anonymous && (
                    <>
                      <label>
                        Seu nome
                        <input name="name" autoComplete="name" required maxLength={200} />
                      </label>
                      <label>
                        Seu e-mail
                        <input
                          name="email"
                          type="email"
                          autoComplete="email"
                          required
                          maxLength={255}
                        />
                      </label>
                    </>
                  )}
                  <label>
                    CPF
                    <input
                      name="cpf"
                      inputMode="numeric"
                      autoComplete="off"
                      required
                      maxLength={14}
                      placeholder="000.000.000-00"
                    />
                  </label>
                  <label>
                    Telefone com DDD
                    <input
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      required
                      maxLength={20}
                      placeholder="(11) 99999-9999"
                    />
                  </label>
                </fieldset>
                <small>
                  Dados usados para processar seu pagamento. Não aparecem publicamente na campanha.
                </small>
                {(error || uncertain) && (
                  <p role="alert">
                    {error ||
                      "Há uma tentativa de pagamento em análise. Consulte o suporte antes de gerar outro pedido."}
                  </p>
                )}
              </div>
              <footer>
                <button className="w3d-cta" disabled={pending || uncertain}>
                  {pending ? "GERANDO SEU PIX…" : "GERAR PIX AGORA →"}
                </button>
                <small>Pagamento Pix processado pela UrusPay</small>
              </footer>
            </form>
          )}
        </>
      )}
    </dialog>
  );
}
