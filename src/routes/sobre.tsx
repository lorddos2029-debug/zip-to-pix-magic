import { createFileRoute } from '@tanstack/react-router';
import { InfoPage } from '@/components/InfoPage';
export const Route=createFileRoute('/sobre')({head:()=>({meta:[{title:"Sobre a Juntos por Vidas | Juntos por Vidas"}]}),component:()=> <InfoPage page="sobre"/>});
