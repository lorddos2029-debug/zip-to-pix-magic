import { randomUUID } from 'node:crypto';
import { redisCommand } from './utmify-queue.server';
import { sendFacebookEvent, sendUtmifyOrder } from './tracking.server';
const PREFIX='jpv:nsq:v1:';
const QUEUE=PREFIX+'tracking-pending';
const release="if redis.call('GET',KEYS[1]) == ARGV[1] then return redis.call('DEL',KEYS[1]) end return 0";
export async function syncPortugalPurchase(orderId:string) {
 if(!/^PT-[a-f0-9-]{36}$/.test(orderId)) throw new Error('Invalid order');
 const raw=await redisCommand('GET',PREFIX+'order:'+orderId);
 const order=typeof raw==='string'?JSON.parse(raw):null;
 if(!order || order.status!=='paid' || !order.transactionId || !order.paidAt) {await redisCommand('ZREM',QUEUE,orderId);return {facebook:'not_paid',utmify:'not_paid'};}
 if(order.currency!=='EUR' || !Number.isSafeInteger(order.amountInCents) || order.amountInCents<=0)throw new Error('Invalid paid amount');
 await redisCommand('ZADD',QUEUE,Date.now()+60000,orderId);
 const lock=PREFIX+'tracking-lock:'+orderId, owner=randomUUID();
 if(await redisCommand('SET',lock,owner,'EX',120,'NX')!=='OK')return {facebook:'processing',utmify:'processing'};
 try {
  const tracking=order.tracking || {};
  const metaKey=PREFIX+'tracking-meta:'+orderId, utmKey=PREFIX+'tracking-utmify:'+orderId;
  let facebook=await redisCommand('GET',metaKey)==='sent'?'already_sent':'pending';
  let utmify=await redisCommand('GET',utmKey)==='sent'?'already_sent':'pending';
  if(facebook==='pending'){
   const paidTime=Math.floor(Date.parse(order.paidAt)/1000);
   facebook=Number.isFinite(paidTime)&&paidTime>Math.floor(Date.now()/1000)-7*86400?await sendFacebookEvent({eventName:'Purchase',eventId:'purchase_'+orderId,value:order.amountInCents/100,currency:'EUR',country:'PT',email:order.customer.email,phone:order.customer.phone||order.phoneNumber,eventTime:paidTime,fbp:tracking.fbp,fbc:tracking.fbc,ip:tracking.ip,userAgent:tracking.userAgent,sourceUrl:tracking.sourceUrl||'https://www.juntos-por-vidas.online/doar'}):'event_expired';
   if(facebook==='enviado')await redisCommand('SET',metaKey,'sent','EX',34560000);
  }
  if(utmify==='pending'){
   utmify=await sendUtmifyOrder({orderId,status:'paid',currency:'EUR',country:'PT',platform:'VorkPay',paymentMethod:order.method,createdAt:order.createdAt,approvedDate:order.paidAt,valor:order.amountInCents/100,nome:order.customer.name,email:order.customer.email,telefone:order.customer.phone||order.phoneNumber,ip:tracking.ip,utm:tracking.utm,itens:order.items.map((i:{id:string;name:string;quantity:number;priceInCents:number})=>({id:i.id,nome:i.name,quantidade:i.quantity,preco_unitario:i.priceInCents/100}))});
   if(utmify==='enviado')await redisCommand('SET',utmKey,'sent','EX',34560000);
  }
  await redisCommand('SET',PREFIX+'tracking-result:'+orderId,JSON.stringify({facebook,utmify,checkedAt:new Date().toISOString()}),'EX',2592000);
  if(['enviado','already_sent','event_expired'].includes(facebook)&&['enviado','already_sent'].includes(utmify))await redisCommand('ZREM',QUEUE,orderId);
  return {facebook,utmify};
 }finally{await redisCommand('EVAL',release,1,lock,owner);}
}
export async function retryPortugalPurchases(){
 const ids=await redisCommand('ZRANGEBYSCORE',QUEUE,0,Date.now(),'LIMIT',0,20);
 if(!Array.isArray(ids))return {attempted:0};
 const results=await Promise.allSettled(ids.map(id=>syncPortugalPurchase(String(id))));
 return {attempted:ids.length,completed:results.filter(r=>r.status==='fulfilled').length};
}
