(function(){
'use strict';
if(window.__KG_TR_LOCATION_SELECTS__)return;
window.__KG_TR_LOCATION_SELECTS__=true;

var API='https://api.turkiyeapi.dev/v2';
var provinceCache=null;
var districtCache={};
var busyPairs=new WeakSet();

function q(s,r){return (r||document).querySelector(s)}
function norm(v){return String(v||'').trim().toLocaleLowerCase('tr-TR')}
function copyAttrs(from,to){
  ['id','name','class','required','autocomplete','aria-label','aria-describedby'].forEach(function(k){
    if(k==='required'){if(from.required)to.required=true;return}
    var v=from.getAttribute&&from.getAttribute(k);if(v)to.setAttribute(k,v)
  });
}
function option(value,label,id){var o=document.createElement('option');o.value=value||'';o.textContent=label||value||'';if(id!=null)o.dataset.id=String(id);return o}
async function fetchJson(url){
  var r=await fetch(url,{headers:{'Accept':'application/json'}});
  if(!r.ok)throw new Error('Konum verisi alınamadı');
  return r.json();
}
async function provinces(){
  if(provinceCache)return provinceCache;
  try{var saved=JSON.parse(sessionStorage.getItem('kgTrProvincesV2')||'null');if(Array.isArray(saved)&&saved.length===81){provinceCache=saved;return saved}}catch(e){}
  var j=await fetchJson(API+'/provinces?fields=id,name&limit=100&sort=name');
  provinceCache=(j&&j.data)||[];
  try{sessionStorage.setItem('kgTrProvincesV2',JSON.stringify(provinceCache))}catch(e){}
  return provinceCache;
}
async function districts(provinceId){
  var key=String(provinceId||'');if(!key)return[];
  if(districtCache[key])return districtCache[key];
  try{var saved=JSON.parse(sessionStorage.getItem('kgTrDistrictsV2_'+key)||'null');if(Array.isArray(saved)&&saved.length){districtCache[key]=saved;return saved}}catch(e){}
  var j=await fetchJson(API+'/districts?provinceId='+encodeURIComponent(key)+'&fields=id,name&limit=100&sort=name');
  districtCache[key]=(j&&j.data)||[];
  try{sessionStorage.setItem('kgTrDistrictsV2_'+key,JSON.stringify(districtCache[key]))}catch(e){}
  return districtCache[key];
}
function findByName(list,name){var n=norm(name);return (list||[]).find(function(x){return norm(x.name)===n})||null}
function buildSelect(input,placeholder){var s=document.createElement('select');copyAttrs(input,s);s.appendChild(option('',placeholder));return s}
async function fillDistricts(citySel,districtSel,wantedDistrict){
  var selected=citySel.options[citySel.selectedIndex],id=selected&&selected.dataset?selected.dataset.id:'';
  districtSel.innerHTML='';districtSel.appendChild(option('',id?'İlçe seçin':'Önce il seçin'));districtSel.disabled=!id;
  if(!id)return;
  districtSel.disabled=true;districtSel.options[0].textContent='İlçeler yükleniyor…';
  try{
    var list=await districts(id);districtSel.innerHTML='';districtSel.appendChild(option('','İlçe seçin'));
    list.forEach(function(x){districtSel.appendChild(option(x.name,x.name,x.id))});
    var found=findByName(list,wantedDistrict);if(found)districtSel.value=found.name;
    districtSel.disabled=false;
  }catch(e){districtSel.innerHTML='';districtSel.appendChild(option('','İlçeler yüklenemedi'));districtSel.disabled=true}
}
async function enhance(cityInput,districtInput){
  if(!cityInput||!districtInput||busyPairs.has(cityInput)||cityInput.dataset.kgLocationSelect==='1')return;
  if(cityInput.tagName==='SELECT'&&districtInput.tagName==='SELECT'){cityInput.dataset.kgLocationSelect='1';districtInput.dataset.kgLocationSelect='1';return}
  busyPairs.add(cityInput);
  var wantedCity=String(cityInput.value||''),wantedDistrict=String(districtInput.value||'');
  try{
    var list=await provinces();
    if(!cityInput.isConnected||!districtInput.isConnected)return;
    var citySel=buildSelect(cityInput,'İl seçin'),districtSel=buildSelect(districtInput,'Önce il seçin');
    citySel.dataset.kgLocationSelect='1';districtSel.dataset.kgLocationSelect='1';districtSel.disabled=true;
    list.forEach(function(x){citySel.appendChild(option(x.name,x.name,x.id))});
    cityInput.replaceWith(citySel);districtInput.replaceWith(districtSel);
    var found=findByName(list,wantedCity);if(found){citySel.value=found.name;await fillDistricts(citySel,districtSel,wantedDistrict)}
    citySel.addEventListener('change',function(){fillDistricts(citySel,districtSel,'')});
  }catch(e){
    cityInput.dataset.kgLocationSelectError='1';districtInput.dataset.kgLocationSelectError='1';
  }finally{busyPairs.delete(cityInput)}
}
function scan(){
  var appCity=q('#kgDaForm [name="city"]'),appDistrict=q('#kgDaForm [name="district"]');if(appCity&&appDistrict)enhance(appCity,appDistrict);
  var sellCity=q('#kgDealerCity'),sellDistrict=q('#kgDealerDistrict');if(sellCity&&sellDistrict)enhance(sellCity,sellDistrict);
}
var timer=null;function schedule(){clearTimeout(timer);timer=setTimeout(scan,60)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',scan,{once:true});else scan();
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
})();
