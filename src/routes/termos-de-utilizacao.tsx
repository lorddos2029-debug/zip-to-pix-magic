import { createFileRoute } from '@tanstack/react-router';
import { InfoPage } from '@/components/InfoPage';
export const Route=createFileRoute('/termos-de-utilizacao')({head:()=>({meta:[{title:"Termos de Utilização | Juntos por Vidas"}]}),component:()=> <InfoPage page="termos-de-utilizacao"/>});
