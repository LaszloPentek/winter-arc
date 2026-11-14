import {useEffect,useRef,useState} from 'react';
import {watchAppUpdate} from '../services/appUpdate';
export function UpdateNotice() {
 const [available,setAvailable]=useState(false);const [hidden,setHidden]=useState(false);const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState('');const control=useRef<ReturnType<typeof watchAppUpdate>|null>(null);
 useEffect(()=>{
  if(!import.meta.env.PROD||!('serviceWorker' in navigator))return;
  const watcher=watchAppUpdate(navigator.serviceWorker,`${import.meta.env.BASE_URL}sw.js`,()=>setAvailable(true),()=>{},()=>window.location.reload());
  control.current=watcher;
  return ()=>{watcher.stop();control.current=null;};
 },[]);
 useEffect(()=>{if(!busy)return;const timer=window.setTimeout(()=>{setBusy(false);setMessage('A frissítés még nem fejeződött be. Próbáld újra később.');},15000);return()=>window.clearTimeout(timer);},[busy]);
 if(!available||hidden)return null;
 return <aside className="update-notice" aria-label="Alkalmazásfrissítés"><p role="status"><strong>Új verzió érhető el.</strong> Mentsd el a megkezdett módosításaidat, majd frissíts.</p><div><button className="primary" disabled={busy} onClick={()=>{
  if(!window.confirm('A frissítés újratölti ezt az oldalt. A még el nem mentett beírások elveszhetnek. Elmentettél mindent, és frissíthetünk?'))return;
  setBusy(true);setMessage('');control.current?.activate();
 }}>{busy?'Frissítés…':'Új verzió betöltése'}</button><button disabled={busy} onClick={()=>setHidden(true)}>Később</button></div>{message&&<p role="alert">{message}</p>}</aside>;
}
