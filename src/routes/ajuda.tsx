import { createFileRoute } from '@tanstack/react-router';
import { InfoPage } from '@/components/InfoPage';
export const Route=createFileRoute('/ajuda')({head:()=>({meta:[{title:"Ajuda e FAQ | Juntos por Vidas"}]}),component:()=> <InfoPage page="ajuda"/>});
