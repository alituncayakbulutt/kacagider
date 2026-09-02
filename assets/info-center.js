(function(){
  'use strict';
  var root=document.querySelector('.kg-help');
  if(!root)return;
  var search=root.querySelector('#kgHelpSearch');
  var items=[].slice.call(root.querySelectorAll('.kg-help-item'));
  var filters=[].slice.call(root.querySelectorAll('[data-help-filter]'));
  var count=root.querySelector('#kgHelpCount');
  var empty=root.querySelector('#kgHelpEmpty');
  var active='all';

  function norm(v){return String(v||'').toLocaleLowerCase('tr-TR').replace(/ı/g,'i').replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ş/g,'s').replace(/ö/g,'o').replace(/ç/g,'c').trim();}
  function ga(name,params){if(typeof window.gtag==='function')window.gtag('event',name,Object.assign({page_path:location.pathname},params||{}));}
  function apply(){
    var q=norm(search&&search.value);
    var visible=0;
    items.forEach(function(item){
      var category=item.getAttribute('data-help-category')||'';
      var hay=norm((item.getAttribute('data-help-keywords')||'')+' '+item.textContent);
      var okCategory=active==='all'||category===active;
      var okQuery=!q||hay.indexOf(q)!==-1||q.split(/\s+/).every(function(part){return !part||hay.indexOf(part)!==-1;});
      var show=okCategory&&okQuery;
      item.hidden=!show;
      item.classList.remove('kg-help-match');
      if(show){visible++;if(q)item.classList.add('kg-help-match');}
    });
    if(count)count.textContent=visible+' sonuç';
    if(empty)empty.hidden=visible!==0;
  }
  function chooseFilter(value){
    active=value||'all';
    filters.forEach(function(btn){btn.classList.toggle('active',btn.getAttribute('data-help-filter')===active);});
    apply();
  }
  filters.forEach(function(btn){btn.addEventListener('click',function(){chooseFilter(btn.getAttribute('data-help-filter'));ga('info_center_filter',{filter:active});});});
  items.forEach(function(item){
    var button=item.querySelector('.kg-help-question');
    if(!button)return;
    button.addEventListener('click',function(){
      var opening=!item.classList.contains('open');
      item.classList.toggle('open',opening);
      button.setAttribute('aria-expanded',opening?'true':'false');
      if(opening)ga('info_center_answer_opened',{question:String(button.textContent||'').trim().slice(0,120),category:item.getAttribute('data-help-category')||''});
    });
  });
  if(search){
    var timer;
    search.addEventListener('input',function(){clearTimeout(timer);apply();timer=setTimeout(function(){var q=String(search.value||'').trim();if(q.length>=3)ga('info_center_search',{search_term:q.slice(0,100)});},500);});
  }
  [].slice.call(root.querySelectorAll('[data-help-query]')).forEach(function(btn){btn.addEventListener('click',function(){if(search){search.value=btn.getAttribute('data-help-query')||'';search.focus();chooseFilter('all');apply();}ga('info_center_popular_clicked',{query:btn.getAttribute('data-help-query')||''});});});
  var wizard=root.querySelector('#kgHelpWizard'),start=root.querySelector('#kgHelpStart'),close=root.querySelector('#kgHelpWizardClose');
  if(start&&wizard)start.addEventListener('click',function(){wizard.hidden=false;wizard.scrollIntoView({behavior:'smooth',block:'nearest'});ga('info_center_wizard_started');});
  if(close&&wizard)close.addEventListener('click',function(){wizard.hidden=true;});
  [].slice.call(root.querySelectorAll('[data-wizard-filter]')).forEach(function(btn){btn.addEventListener('click',function(){var value=btn.getAttribute('data-wizard-filter')||'all';if(search)search.value='';chooseFilter(value);if(wizard)wizard.hidden=true;var first=items.find(function(item){return !item.hidden;});if(first)first.scrollIntoView({behavior:'smooth',block:'center'});ga('info_center_wizard_choice',{filter:value});});});
  root.addEventListener('click',function(e){var link=e.target.closest&&e.target.closest('.kg-help-answer a');if(link)ga('info_center_solution_cta',{destination:link.getAttribute('href')||'',link_text:String(link.textContent||'').trim().slice(0,80)});});
  apply();
})();