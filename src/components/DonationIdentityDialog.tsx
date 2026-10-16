import { type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

export interface DonationIdentityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nome: string;
  cpf: string;
  anonymous: boolean;
  onNomeChange: (value: string) => void;
  onCpfChange: (value: string) => void;
  onAnonymousChange: (value: boolean) => void;
  busy: boolean;
  error: string | null;
  onSubmit: () => Promise<void>;
}

export function DonationIdentityDialog(props: DonationIdentityDialogProps) {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!props.busy) void props.onSubmit();
  };
  const inputClass = "h-14 w-full rounded-xl border border-[#ebebeb] bg-white px-4 text-base text-[#333] outline-none focus-visible:ring-2 focus-visible:ring-[#20c768]";
  return (
    <Dialog open={props.open} onOpenChange={(open) => { if (!props.busy) props.onOpenChange(open); }}>
      <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] max-w-[440px] overflow-y-auto rounded-[22px] border-0 bg-white p-6 font-[Montserrat,sans-serif] shadow-xl [&>button.absolute]:hidden">
        <DialogHeader>
          <DialogTitle className="text-left text-xl tracking-normal">Identificação 💚</DialogTitle>
          <DialogDescription className="text-left">Preencha seus dados ou doe anonimamente.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} noValidate className="grid gap-3">
          <fieldset disabled={props.busy} className="grid min-w-0 gap-3">
            <div className="flex min-h-14 items-center justify-between gap-4 rounded-xl bg-[#f3f3f3] px-4 py-3">
              <label htmlFor="anonymous-donation" className="cursor-pointer text-sm font-semibold text-foreground">
                <span aria-hidden="true">🎭</span> Quero doar anonimamente
              </label>
              <Switch
                id="anonymous-donation"
                checked={props.anonymous}
                onCheckedChange={props.onAnonymousChange}
                aria-label="Quero doar anonimamente"
                className="h-6 w-11 data-[state=checked]:bg-[#20c768] data-[state=unchecked]:bg-[#eaeaea] [&>span]:h-5 [&>span]:w-5 [&>span]:data-[state=checked]:translate-x-5"
              />
            </div>
            {!props.anonymous && (
              <>
                <input className={inputClass} aria-label="Nome completo" placeholder="Seu nome completo" autoComplete="name" maxLength={200} value={props.nome} onChange={(e) => props.onNomeChange(e.target.value)} />
                <input className={inputClass} type="tel" inputMode="numeric" aria-label="CPF" placeholder="CPF" value={props.cpf} onChange={(e) => props.onCpfChange(e.target.value)} />
              </>
            )}
          </fieldset>
          {props.error && <p role="alert" className="text-sm text-destructive">{props.error}</p>}
          <Button type="submit" disabled={props.busy} className="h-14 w-full rounded-xl bg-[#20c768] text-base font-bold text-white hover:bg-[#18ad56]">{props.busy ? "Gerando Pix…" : "Gerar PIX agora"}</Button>
          <Button type="button" variant="ghost" disabled={props.busy} onClick={() => props.onOpenChange(false)} className="w-full text-[#9b9b9b]">Cancelar</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
