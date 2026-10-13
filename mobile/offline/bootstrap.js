class OfflineSocket {
  static CONNECTING=0;static OPEN=1;static CLOSING=2;static CLOSED=3;
  constructor() {
    this.readyState=0;this.worker=new Worker('/offline/worker.js',{type:'module'});
    this.worker.onmessage=({data})=>{
      if(data.ready){this.readyState=1;this.onopen?.({});}
      else if(data.message)this.onmessage?.({data:JSON.stringify(data.message)});
      else if(data.fatal){console.error('[offline]',data.fatal);this.onerror?.({message:data.fatal});this.close(4000,data.fatal);}
    };
    this.worker.onerror=error=>{console.error('[offline worker]',error.message);this.onerror?.(error);this.close(4000,'本地引擎启动失败');};
    OfflineSocket.current=this;
  }
  send(data) {if(this.readyState!==1)throw new Error('本地引擎未就绪');this.worker.postMessage({message:JSON.parse(data)});}
  close(code=1000,reason='') {if(this.readyState===3)return;this.worker.terminate();this.readyState=3;this.onclose?.({code,reason});}
}
globalThis.WebSocket=OfflineSocket;
globalThis.__SP_OFFLINE_SUSPEND__=()=>OfflineSocket.current?.worker.postMessage({suspend:true});
document.addEventListener('visibilitychange',()=>{if(document.hidden)globalThis.__SP_OFFLINE_SUSPEND__();});
localStorage.setItem('sp.name',localStorage.getItem('sp.name')||'单机博士');
sessionStorage.setItem('sp.entered','1');
await import('/js/main.js');
