import React, { useState, useMemo, memo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  ReferenceLine, Cell,
} from "recharts";
import { fmt, uzs, useWindowSize, detectAnomalies, exportCSV, exportJSON } from '../../lib/utils';
import { useFilters } from '../../contexts/FilterContext';
import DrillDownModal from '../analytics/DrillDownModal';

export const ChartTip = memo(({active, payload, label}: any) => {
  if(!active||!payload?.length) return null;
  return (
    <div className="bg-surface-card border border-border-light p-2.5 rounded-xl shadow-lg">
      <div className="text-text-muted mb-1.5 text-base font-mono">{label}</div>
      {payload.map((p: any,i: number)=>(
        <div key={i} className="flex items-center gap-2 mb-0.5 text-base font-sans">
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: p.color || '#F0F4FF' }}/>
          <span className="text-text-muted">{p.name}:</span>
          <strong style={{ color: p.color || '#F0F4FF' }}>
            {typeof p.value==="number"&&p.value>50000?uzs(p.value):p.value}
          </strong>
        </div>
      ))}
    </div>
  );
});

export const InteractiveChart = memo(({ title, data=[], type="bar", xKey="label", series, color="#00D4FF", height=200, dtype="revenue", initLevel, noExpand=false, delay=0 }: any) => {
  const [modal,   setModal]   = useState(false);
  const [expMenu, setExpMenu] = useState(false);
  const filters = useFilters();
  const annotated = useMemo(()=>detectAnomalies(data,series?.[0]?.key||"revenue"), [data,series]);
  const hasAnom   = annotated.some(d=>d.isAnomaly);

  return (
    <>
      <div className="card chart-clickable fade-up p-5 relative" style={{animationDelay:`${delay}ms`}}>
        {/* Top-border glow */}
        <div className="absolute top-0 left-5 right-14 h-px" style={{background:`linear-gradient(90deg,transparent,${color}55,transparent)`}}/>

        <div className="flex items-center justify-between mb-3.5">
          <div>
            <div className="text-base font-bold text-text-primary uppercase tracking-wider">{title}</div>
            {hasAnom&&<div className="text-base text-amber-500 mt-0.5 font-mono">anomaliya aniqlandi</div>}
          </div>
          <div className="flex gap-1.5 items-center">
            {!noExpand&&<button className="px-3 py-1.5 bg-brand-500/10 text-brand-500 hover:bg-brand-500/20 rounded-lg text-base font-semibold transition-colors" onClick={()=>setModal(true)}>expand</button>}
            <div className="relative">
              <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface-dark text-text-secondary transition-colors" onClick={()=>setExpMenu(v=>!v)}>v</button>
              {expMenu&&(
                <div className="fade-in absolute top-[110%] right-0 bg-surface-card border border-border-light rounded-xl p-1 z-50 min-w-[130px] shadow-xl">
                  {[["csv","CSV"],["json","JSON"],["print","Print"]].map(([t,l])=>(
                    <div key={t} onClick={()=>{ setExpMenu(false); t==="csv"?exportCSV(data,title):t==="json"?exportJSON(data,title):window.print(); }}
                      className="px-3 py-1.5 cursor-pointer text-base text-text-secondary rounded-lg font-sans hover:bg-surface-dark hover:text-text-primary transition-colors">
                      {l}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{height}} onClick={()=>!noExpand&&setModal(true)}>
          <ResponsiveContainer width="100%" height="100%">
            {type==="area"?(
              <AreaChart data={data}>
                <defs>{(series||[{key:"revenue",color}]).map(s=>(
                  <linearGradient key={s.key} id={`ic-${title}-${s.key}`.replace(/\s/g,"")}>
                    <stop offset="5%"  stopColor={s.color||color} stopOpacity={0.28}/>
                    <stop offset="95%" stopColor={s.color||color} stopOpacity={0}/>
                  </linearGradient>
                ))}</defs>
                <CartesianGrid strokeDasharray="2 6" stroke="#2A3655" strokeOpacity={0.5}/>
                <XAxis dataKey={xKey} tick={{fill:'#8B9EC4',fontSize:16,fontFamily:"'JetBrains Mono', monospace"}} axisLine={false} tickLine={false}/>
                <YAxis tickFormatter={fmt} tick={{fill:'#8B9EC4',fontSize:16,fontFamily:"'JetBrains Mono', monospace"}} axisLine={false} tickLine={false} width={60}/>
                <Tooltip content={<ChartTip/>}/>
                {(series||[{key:"revenue",color,name:"Daromad"}]).map(s=>(
                  <Area key={s.key} type="monotone" dataKey={s.key} stroke={s.color||color} strokeWidth={2} fill={`url(#ic-${title}-${s.key}`.replace(/\s/g,"")+`)`} dot={false} name={s.name||s.key}/>
                ))}
              </AreaChart>
            ):type==="line"?(
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="2 6" stroke="#2A3655" strokeOpacity={0.5}/>
                <XAxis dataKey={xKey} tick={{fill:'#8B9EC4',fontSize:16,fontFamily:"'JetBrains Mono', monospace"}} axisLine={false} tickLine={false}/>
                <YAxis tickFormatter={fmt} tick={{fill:'#8B9EC4',fontSize:16,fontFamily:"'JetBrains Mono', monospace"}} axisLine={false} tickLine={false} width={60}/>
                <Tooltip content={<ChartTip/>}/>
                {(series||[{key:"revenue",color,name:"Daromad"}]).map(s=>(
                  <Line key={s.key} type="monotone" dataKey={s.key} stroke={s.color||color} strokeWidth={2} dot={{r:3,fill:s.color||color,strokeWidth:0}} name={s.name||s.key}/>
                ))}
              </LineChart>
            ):(
              <BarChart data={annotated}>
                <CartesianGrid strokeDasharray="2 6" stroke="#2A3655" strokeOpacity={0.5}/>
                <XAxis dataKey={xKey} tick={{fill:'#8B9EC4',fontSize:16,fontFamily:"'JetBrains Mono', monospace"}} axisLine={false} tickLine={false}/>
                <YAxis tickFormatter={fmt} tick={{fill:'#8B9EC4',fontSize:16,fontFamily:"'JetBrains Mono', monospace"}} axisLine={false} tickLine={false} width={60}/>
                <Tooltip content={<ChartTip/>}/>
                {(series||[{key:"revenue",color,name:"Daromad"}]).map((s,si)=>(
                  <Bar key={s.key} dataKey={s.key} name={s.name||s.key} fill={s.color||color} radius={[4,4,0,0]} fillOpacity={si===0?0.9:0.65}>
                    {si===0&&annotated.map((d,i)=><Cell key={i} fill={d.isAnomaly?'#F59E0B':s.color||color} fillOpacity={d.isAnomaly?1:0.9}/>)}
                  </Bar>
                ))}
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {modal&&(
        <DrillDownModal
          isOpen={modal}
          title={title}
          module="finance"
          metric={dtype}
          initialLevel={initLevel||(dtype==="department"?"dept":"month")}
          onClose={()=>setModal(false)}
        />
      )}
    </>
  );
});

InteractiveChart.displayName = 'InteractiveChart';
