// Synthetic inline-page behavior only. No payment or external requests.
const test=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const {defaultReadHtml}=require('../api/kit-thanks');
const SESSION='cs_live_SYNTHETIC_parent_refresh';
async function page(search, state, paid=true) {
 const events=[];
 const els={loading:{hidden:false},missing:{hidden:true},downloads:{hidden:true},'asset-list':{appendChild(){}}};
 const history={state,replaceState(next,unused,url){this.state=next;events.push({kind:'scrub',url});}};
 const sandbox={location:{search},history,URLSearchParams,encodeURIComponent,
  document:{getElementById:id=>els[id],createElement:()=>({appendChild(){}})},
  fetch:async url=>{events.push({kind:'verify',url});return {ok:paid,json:async()=>({ready:paid,assets:paid?[{name:'SYNTHETIC kit',url:'/api/kit-download?asset=SYNTHETIC'}]:[]})};}};
 const script=[...defaultReadHtml().matchAll(/<script>([\s\S]*?)<\/script>/g)].at(-1)[1];
 await vm.runInNewContext(script,sandbox,{timeout:1000});
 return {events,els,state:history.state};
}
test('approved history reference survives refresh only after fresh server verification',async()=>{
 const first=await page('?session_id='+SESSION,null);
 assert.equal(first.state?.kitSession,SESSION,'first visit must retain the approved history reference');
 assert.deepEqual(first.events.map(e=>e.kind),['scrub','verify']);
 assert.equal(first.events[0].url,'/kit-thanks');
 const refreshed=await page('',first.state);
 assert.equal(refreshed.events.filter(e=>e.kind==='verify').length,1,'refresh must re-verify with server');
 assert.equal(refreshed.els.downloads.hidden,false);
 const denied=await page('',first.state,false);
 assert.equal(denied.events.filter(e=>e.kind==='verify').length,1);
 assert.equal(denied.els.downloads.hidden,true,'stored reference is never payment proof');
 assert.equal(denied.els.missing.hidden,false);
 const invalid=await page('?session_id=invalid',first.state);
 assert.equal(invalid.state,null,'invalid new query must not revive an old reference');
 assert.equal(invalid.events.filter(e=>e.kind==='verify').length,0);
 const absent=await page('',null);
 assert.equal(absent.els.downloads.hidden,true);
 assert.equal(absent.events.filter(e=>e.kind==='verify').length,0);
});
