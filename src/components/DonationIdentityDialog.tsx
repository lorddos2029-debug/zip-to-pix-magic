import { type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatBRL } from "@/lib/pix";

export interface DonationIdentityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  onNomeChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onCpfChange: (value: string) => void;
  onTelefoneChange: (value: string) => void;
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
  const inputClass = "h-12 w-full rounded-lg border border-input bg-background px-4 text-base text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring";
  return (
    <Dialog open={props.open} onOpenChange={(open) => { if (!props.busy) props.onOpenChange(open); }}>
      <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] max-w-[500px] overflow-y-auto rounded-lg p-6 font-[Montserrat,sans-serif]">
        <DialogHeader>
          <DialogTitle className="text-left text-xl tracking-normal">Identificação 💚</DialogTitle>
          <DialogDescription className="text-left">Preencha seus dados para doar {formatBRL(props.total)}.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} noValidate className="grid gap-3">
          <fieldset disabled={props.busy} className="grid min-w-0 gap-3">
            <input className={inputClass} aria-label="Nome completo" placeholder="Seu nome completo" autoComplete="name" value={props.nome} onChange={(e) => props.onNomeChange(e.target.value)} />
            <input className={inputClass} type="email" aria-label="E-mail" placeholder="Seu e-mail" autoComplete="email" value={props.email} onChange={(e) => props.onEmailChange(e.target.value)} />
            <input className={inputClass} inputMode="numeric" aria-label="CPF" placeholder="CPF (000.000.000-00)" value={props.cpf} onChange={(e) => props.onCpfChange(e.target.value)} />
            <input className={inputClass} type="tel" aria-label="Celular com DDD (opcional)" placeholder="Celular com DDD (opcional)" autoComplete="tel" value={props.telefone} onChange={(e) => props.onTelefoneChange(e.target.value.replace(/\D/g, "").slice(0, 11))} />
          </fieldset>
          {props.error && <p role="alert" className="text-sm text-destructive">{props.error}</p>}
          <Button type="submit" disabled={props.busy} className="h-12 w-full text-base font-bold">{props.busy ? "Gerando Pix…" : "Gerar PIX agora"}</Button>
          <Button type="button" variant="ghost" disabled={props.busy} onClick={() => props.onOpenChange(false)} className="w-full text-muted-foreground">Cancelar</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
