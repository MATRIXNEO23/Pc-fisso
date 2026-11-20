const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
function load(file,stored){
 const html=fs.readFileSync(file,'utf8'),els={},data=Object.fromEntries([...html.matchAll(/<script id="([^"]+)" type="application\/json">([\s\S]*?)<\/script>/g)].map(m=>[m[1],m[2]]));
 function el(id){return els[id]||=( {value:'',textContent:data[id]||'',innerHTML:'',checked:false,disabled:false,hidden:false,dataset:{},style:{},classList:{toggle(){}},handlers:{},addEventListener(k,f){this.handlers[k]=f},showModal(){this.open=true},close(){this.open=false},focus(){},select(){},reset(){for(const [k,e] of Object.entries(els))if(k.startsWith('f-')){e.value='';e.checked=false}}} );}
 const storage=new Map(stored?[stored]:[]),ctx={console,URL,Intl,Date,Math,JSON,Number,Object,String,Array,Set,Map,Blob,setTimeout:()=>0,clearTimeout(){},location:{protocol:'file:',hostname:''},confirm:()=>true,TextEncoder,TextDecoder,Uint8Array,btoa,atob,document:{documentElement:{dataset:{theme:'dark'}},getElementById:el,querySelector:()=>null,querySelectorAll:()=>[]},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},window:{}};
 vm.createContext(ctx);const code=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].filter(m=>!m[0].slice(0,m[0].indexOf('>')).includes('application/json')).map(m=>m[1]).join('\n');vm.runInContext(code,ctx);
 return {ctx,el,storage,run:code=>vm.runInContext(code,ctx)};
}
module.exports={load};
