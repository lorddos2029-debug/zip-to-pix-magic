import { createFileRoute } from '@tanstack/react-router';
import { InfoPage } from '@/components/InfoPage';
export const Route=createFileRoute('/ajuda-com-donativos')({head:()=>({meta:[{title:"Ajuda com donativos | Juntos por Vidas"}]}),component:()=> <InfoPage page="ajuda-com-donativos"/>});
