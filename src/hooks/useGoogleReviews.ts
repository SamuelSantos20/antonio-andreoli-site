import { useEffect, useRef, useState } from 'react';
import { isGoogleReviewsData, type GoogleReviewsData } from '../types/googleReviews';
type State='idle'|'loading'|'ready'|'unavailable'|'not-configured';
export function useGoogleReviews(enabled:boolean,provided?:GoogleReviewsData|null) {
  const host=useRef<HTMLElement>(null);
  const [state,setState]=useState<State>(provided?'ready':'idle');
  const [data,setData]=useState<GoogleReviewsData|null>(provided||null);
  useEffect(()=>{
    if(provided){setData(provided);setState('ready');return;}
    if(!enabled)return;
    const controller=new AbortController();
    let started=false,disposed=false;
    const load=async()=>{
      if(started||disposed)return;
      started=true;setState('loading');
      try {
        const response=await fetch(`${import.meta.env.BASE_URL}api/google-reviews`,{cache:'no-store',signal:controller.signal});
        const payload=await response.json();
        if(disposed)return;
        if(response.ok&&payload.state==='ready'&&isGoogleReviewsData(payload.data)){setData(payload.data);setState('ready');}
        else setState(payload.state==='not-configured'?'not-configured':'unavailable');
      }catch{if(!disposed)setState('unavailable');}
    };
    const observer=new IntersectionObserver(entries=>{
      if(entries.some(entry=>entry.isIntersecting)){void load();observer.disconnect();}
    },{threshold:0});
    if(host.current)observer.observe(host.current);
    return()=>{disposed=true;controller.abort();observer.disconnect();};
  },[enabled,provided]);
  return {host,state,data};
}
