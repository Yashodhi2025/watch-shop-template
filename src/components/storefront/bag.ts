"use client";
import { useSyncExternalStore } from "react";
const key="aurel-bag-v1", event="aurel-bag-change";
const empty="{}";
function snapshot(){try{return localStorage.getItem(key)||empty;}catch{return empty;}}
function subscribe(fn:()=>void){window.addEventListener(event,fn);window.addEventListener("storage",fn);return()=>{window.removeEventListener(event,fn);window.removeEventListener("storage",fn);};}
export function useBag(){
 const raw=useSyncExternalStore(subscribe,snapshot,()=>empty);
 let quantities:Record<string,number>={};
 try{const value=JSON.parse(raw);if(value&&typeof value==="object"&&!Array.isArray(value))for(const [id,n] of Object.entries(value))if(typeof n==="number"&&Number.isSafeInteger(n)&&n>0)quantities[id]=Math.min(n,99);}catch{}
 const set=(id:string,quantity:number)=>{let current:Record<string,number>={};try{const v=JSON.parse(snapshot());if(v&&typeof v==="object"&&!Array.isArray(v))current=v;}catch{}if(quantity<=0)delete current[id];else current[id]=Math.min(99,Math.max(1,Math.floor(quantity)));try{localStorage.setItem(key,JSON.stringify(current));}catch{}window.dispatchEvent(new Event(event));};
 return {quantities,set,add:(id:string)=>{let n=0;try{n=Number(JSON.parse(snapshot())[id])||0;}catch{}set(id,n+1);}};
}
