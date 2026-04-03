import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { T } from '../constants';

export const fmt = (n: any) => { if(n==null) return "—"; const a=Math.abs(n); return a>=1e9?`${(n/1e9).toFixed(1)}B`:a>=1e6?`${(n/1e6).toFixed(1)}M`:a>=1e3?`${(n/1e3).toFixed(0)}K`:`${n}`; };
export const uzs = (n: any) => n==null?"—":`${fmt(n)} so'm`;

export function useWindowSize() {
  const [sz, setSz] = useState({ w: window.innerWidth, h: window.innerHeight });
  useEffect(() => {
    const fn = () => setSz({ w:window.innerWidth, h:window.innerHeight });
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return sz;
}

export function detectAnomalies(arr: any[], key: string) {
  const vals = arr.map(d=>d[key]).filter(v=>v!=null&&!isNaN(v));
  if (vals.length<3) return arr.map(d=>({...d,isAnomaly:false}));
  const mean=vals.reduce((a,b)=>a+b,0)/vals.length;
  const std=Math.sqrt(vals.reduce((a,b)=>a+(b-mean)**2,0)/vals.length);
  return arr.map(d=>({...d, isAnomaly:std>0&&Math.abs(((d[key]||0)-mean)/std)>1.75, zScore:std>0?((d[key]||0)-mean)/std:0 }));
}

export function exportCSV(data: any[], name: string) {
  if(!data?.length) return;
  const h=Object.keys(data[0]).join(","), r=data.map(d=>Object.values(d).join(",")).join("\n");
  const url=URL.createObjectURL(new Blob([h+"\n"+r],{type:"text/csv"}));
  const a=document.createElement("a"); a.href=url; a.download=`${name}.csv`; a.click(); setTimeout(()=>URL.revokeObjectURL(url),1000);
}

export function exportJSON(data: any[], name: string) {
  const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:"application/json"}));
  const a=document.createElement("a"); a.href=url; a.download=`${name}.json`; a.click(); setTimeout(()=>URL.revokeObjectURL(url),1000);
}

import { useState, useEffect } from 'react';
import { useFilters as useFiltersContext } from '../context/FilterContext';

export function useFilters() { return useFiltersContext(); }
