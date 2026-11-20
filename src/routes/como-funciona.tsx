import { createFileRoute } from '@tanstack/react-router';
import { InfoPage } from '@/components/InfoPage';
export const Route=createFileRoute('/como-funciona')({head:()=>({meta:[{title:"Como funciona | Juntos por Vidas"}]}),component:()=> <InfoPage page="como-funciona"/>});
