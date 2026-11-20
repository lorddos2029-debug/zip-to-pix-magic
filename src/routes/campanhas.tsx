import { createFileRoute } from '@tanstack/react-router';
import { InfoPage } from '@/components/InfoPage';
export const Route=createFileRoute('/campanhas')({head:()=>({meta:[{title:"Campanhas | Juntos por Vidas"}]}),component:()=> <InfoPage page="campanhas"/>});
