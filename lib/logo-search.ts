import {seedTools} from './tools';
export type LogoResult={name:string;domain:string;logoUrl:string;source:'match'|'guess'};
export async function searchLogoCandidates(query:string):Promise<LogoResult[]>{const q=query.trim().toLowerCase();if(!q||q.length>80)return [];return seedTools.filter(t=>`${t.name} ${t.vendor}`.toLowerCase().includes(q)).slice(0,6).map(t=>{const domain=new URL(t.website).hostname;return {name:t.name,domain,logoUrl:t.logoUrl||`https://www.google.com/s2/favicons?sz=128&domain=${encodeURIComponent(domain)}`,source:'match'}})}
