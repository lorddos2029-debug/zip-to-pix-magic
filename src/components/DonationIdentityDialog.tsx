import { type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { formatBRL } from "@/lib/pix";

export interface DonationIdentityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  anonymous: boolean;
  onNomeChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onCpfChange: (value: string) => void;
  onTelefoneChange: (value: string) => void;
  onAnonymousChange: (value: boolean) => void;
  total: number;
  busy: boolean;
  error: string | null;
  onSubmit: () => Promise<void>;
}

export function DonationIdentityDialog(props: DonationIdentityDialogProps) {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!props.busy) void props.onSubmit();
  };
  const telefoneFormatado = props.telefone
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
  const inputClass = "h-12 w-full rounded-lg border border-input bg-background px-4 text-base text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring";
  return (
    <Dialog open={props.open} onOpenChange={(open) => { if (!props.busy) props.onOpenChange(open); }}>
      <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] max-w-[500px] overflow-y-auto rounded-lg p-6 font-[Montserrat,sans-serif]">
        <DialogHeader>
          <DialogTitle className="text-left text-xl tracking-normal">Identificação 💚</DialogTitle>
          <DialogDescription className="text-left">Preencha seus dados ou doe anonimamente.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} noValidate className="grid gap-3">
          <fieldset disabled={props.busy} className="grid min-w-0 gap-3">
            <div className="flex min-h-14 items-center justify-between gap-4 rounded-lg bg-muted px-4 py-3">
              <label htmlFor="anonymous-donation" className="cursor-pointer text-sm font-semibold text-foreground">
                <span aria-hidden="true">🎭</span> Quero doar anonimamente
              </label>
              <Switch
                id="anonymous-donation"
                checked={props.anonymous}
                onCheckedChange={props.onAnonymousChange}
                aria-label="Quero doar anonimamente"
                className="h-6 w-11 data-[state=checked]:bg-success data-[state=unchecked]:bg-border [&>span]:h-5 [&>span]:w-5 [&>span]:data-[state=checked]:translate-x-5"
              />
            </div>
            {!props.anonymous && (
              <>
                <input className={inputClass} aria-label="Nome completo" placeholder="Seu nome completo" autoComplete="name" maxLength={200} value={props.nome} onChange={(e) => props.onNomeChange(e.target.value)} />
                <input className={inputClass} type="email" aria-label="E-mail" placeholder="Seu e-mail" autoComplete="email" maxLength={255} value={props.email} onChange={(e) => props.onEmailChange(e.target.value)} />
              </>
            )}
            <input className={inputClass} type="tel" inputMode="numeric" aria-label="CPF" placeholder="CPF" value={props.cpf} onChange={(e) => props.onCpfChange(e.target.value)} />
            <input className={inputClass} type="tel" inputMode="numeric" aria-label="Celular com DDD" placeholder="Celular com DDD" autoComplete="tel" value={telefoneFormatado} onChange={(e) => props.onTelefoneChange(e.target.value.replace(/\D/g, "").slice(0, 11))} />
            {props.anonymous && (
              <p className="rounded-lg bg-muted px-3 py-2 text-left text-xs leading-5 text-muted-foreground">
                <span aria-hidden="true">🔒</span> CPF e celular são exigidos pelo banco para gerar o Pix. Eles não aparecem na vakinha — sua doação continua anônima.
              </p>
            )}
          </fieldset>
          {props.error && <p role="alert" className="text-sm text-destructive">{props.error}</p>}
          <p className="text-center text-xs text-muted-foreground">Total da doação: <strong className="text-foreground">{formatBRL(props.total)}</strong></p>
          <Button type="submit" disabled={props.busy} className="h-12 w-full text-base font-bold">{props.busy ? "Gerando Pix…" : "Gerar PIX agora"}</Button>
          <Button type="button" variant="ghost" disabled={props.busy} onClick={() => props.onOpenChange(false)} className="w-full text-muted-foreground">Cancelar</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
