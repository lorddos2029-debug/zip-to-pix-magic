import { createFileRoute } from '@tanstack/react-router';
import { InfoPage } from '@/components/InfoPage';
export const Route=createFileRoute('/privacidade-dos-doadores')({head:()=>({meta:[{title:"Privacidade dos doadores | Juntos por Vidas"}]}),component:()=> <InfoPage page="privacidade-dos-doadores"/>});
