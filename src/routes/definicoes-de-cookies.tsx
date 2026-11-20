import { createFileRoute } from '@tanstack/react-router';
import { InfoPage } from '@/components/InfoPage';
export const Route=createFileRoute('/definicoes-de-cookies')({head:()=>({meta:[{title:"Definições de cookies | Juntos por Vidas"}]}),component:()=> <InfoPage page="definicoes-de-cookies"/>});
