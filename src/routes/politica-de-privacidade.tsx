import { createFileRoute } from '@tanstack/react-router';
import { InfoPage } from '@/components/InfoPage';
export const Route=createFileRoute('/politica-de-privacidade')({head:()=>({meta:[{title:"Política de Privacidade | Juntos por Vidas"}]}),component:()=> <InfoPage page="politica-de-privacidade"/>});
