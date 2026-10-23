import { useCallback, useEffect, useRef, useState } from 'react';
import { list, request } from './api';
const statusToServer={'New':'new','Under Review':'review','Responded':'responded','Archived':'archived'};
const statusFromServer=Object.fromEntries(Object.entries(statusToServer).map(([a,b])=>[b,a]));
const layerNames={'Flooding / Water Logging':'floodRisk','Heat':'heatRisk','Green Spaces':'greenSpaces','Water Infrastructure':'water','Waste Infrastructure':'waste','Mobility':'mobility','PCMC Climate Projects':'projects','Pedestrian-Friendly Streets':'pedestrianStreets','Municipal Buildings':'municipalBuildings'};
const reverseLayers=Object.fromEntries(Object.entries(layerNames).map(([a,b])=>[b,a]));
function decode(kind,row){
 if(kind==='vendors')return {...row,title:row.name,category:String(row.category),description:row.notes||'',source:row.address,url:row.urlfield||'',status:row.is_active?'Published':'Archived'};
 if(kind==='submissions')return {...row,status:statusFromServer[row.status]||row.status,createdAt:row.created_at,category:row.kind==='query'?'Query':'Suggestion',demo:false};
 return {...row.data,id:row.id,_slug:row.slug,title:row.title,name:row.data.name||row.title,
  ...(kind==='events'?{date:row.data.uiDate||row.data.date?.slice(0,10)||'',posterUrl:row.data.image||row.data.posterUrl||''}:{}),
  ...(kind==='map'?{layer:row.data.uiLayer||reverseLayers[row.data.layer]||row.data.layer}:{}),
  status:row.data.uiStatus||row.data.status||(row.status==='published'?(kind==='map'?'Verified':'Published'):'Draft')};
}
function encode(kind,row){
 const title=row.title||row.name||row.goal||'Record';
 const data=Object.fromEntries(Object.entries(row).filter(([key,value])=>!['id','_slug'].includes(key)&&(['string','number','boolean'].includes(typeof value)||value===null)));
 data.uiStatus=row.status||'Published';
 let status=['Draft','Archived','Pending Verification','Needs Review'].includes(row.status)?'draft':'published';
 if(kind==='events'){
  data.uiDate=row.date;
  if(row.date){data.date=new Date(`${row.date.slice(0,10)}T00:00:00`).toISOString();data.end_date=new Date(`${row.date.slice(0,10)}T23:59:59`).toISOString();}
  data.image=row.posterUrl||row.image||'';
 }
 if(kind==='initiatives')data.photos=row.posterUrl||row.photos||'';
 if(kind==='resources')data.url=row.url||row.fileUrl||'';
 if(kind==='projects')data.stage=row.status;
 if(kind==='map'){
  data.uiLayer=row.layer;data.layer=layerNames[row.layer]||row.layer;data.geometry=row.geometry||'point';
  if(data.geometry==='point'){
   data.latitude=row.latitude===''||row.latitude==null?null:Number(row.latitude);
   data.longitude=row.longitude===''||row.longitude==null?null:Number(row.longitude);
   if(status==='published'&&(data.latitude===null||data.longitude===null))throw new Error('Add verified latitude and longitude before publishing this map record.');
  }
 }
 return {kind,title,slug:row._slug||`${kind}-${crypto.randomUUID()}`,status,data};
}
export function useServerCollection(kind){
 const [records,setLocal]=useState([]),[state,setState]=useState({loading:true,error:'',busy:false}),[version,setVersion]=useState(0);
 const current=useRef([]),pending=useRef(false);
 const endpoint=kind==='submissions'?'submissions/':kind==='vendors'?'vendors/':`publications/?kind=${kind}`;
 useEffect(()=>{const controller=new AbortController();list(endpoint,{authenticated:true,signal:controller.signal}).then(rows=>{const value=rows.map(row=>decode(kind,row));current.current=value;setLocal(value);setState({loading:false,error:'',busy:false});}).catch(error=>{if(error.name!=='AbortError')setState({loading:false,error:error.message,busy:false});});return()=>controller.abort();},[endpoint,kind,version]);
 const setRecords=useCallback(async update=>{
  if(pending.current)throw new Error('Please wait for the current save to finish.');
  const before=current.current;const next=typeof update==='function'?update(before):update;
  pending.current=true;setState(s=>({...s,busy:true,error:''}));
  try{
   const saved=[];
   for(const row of next){
    const old=before.find(item=>item.id===row.id);
    if(old&&JSON.stringify(old)===JSON.stringify(row)){saved.push(old);continue;}
    const body=kind==='vendors'?{name:row.title,category:Number(row.category),phone_number:row.phone_number,email:row.email,address:row.source,notes:row.description,urlfield:row.url||'',is_active:row.status==='Published'}:kind==='submissions'?{status:statusToServer[row.status]||row.status,staff_notes:row.staff_notes||''}:encode(kind,row);
    const path=kind==='vendors'?`vendors/${old?`${row.id}/`:''}`:kind==='submissions'?`submissions/${row.id}/`:`publications/${old?`${row.id}/`:''}`;
    const result=await request(path,{method:old?'PATCH':'POST',body,authenticated:true});saved.push(decode(kind,result));
   }
   for(const row of before)if(!next.some(item=>item.id===row.id))await request(`${kind==='submissions'?'submissions':kind==='vendors'?'vendors':'publications'}/${row.id}/`,{method:'DELETE',authenticated:true});
   current.current=saved;setLocal(saved);setState({loading:false,error:'',busy:false});return saved;
  }catch(error){setState(s=>({...s,error:error.message,busy:false}));throw error;}finally{pending.current=false;}
 },[kind]);
 return [records,setRecords,{...state,reload:()=>setVersion(v=>v+1)}];
}
