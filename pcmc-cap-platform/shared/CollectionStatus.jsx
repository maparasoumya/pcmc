export default function CollectionStatus({state}){
 if(state.error)return <div role="alert" style={{padding:14,marginBottom:18,border:'1px solid #e4cccc',borderRadius:9,background:'#f5eaea',color:'#8d302b'}}>{state.error} <button type="button" onClick={state.reload}>Retry</button></div>;
 if(state.loading||state.busy)return <p role="status" style={{marginBottom:16,color:'#65743a'}}>{state.busy?'Saving…':'Loading…'}</p>;
 return null;
}
