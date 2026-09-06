// Synthetic local checkout fixtures only. No purchase or network requests.
const test = require('node:test');
const assert = require('node:assert/strict');
const { createKitSessionHandler } = require('../api/kit-session');
const { createKitDownloadHandler } = require('../api/kit-download');
function response() {
  return { code: 200, headers: {}, status(n) { this.code=n; return this; },
    setHeader(k,v) { this.headers[k.toLowerCase()]=v; },
    json(x) { this.body=x; return this; }, end(x) { this.body=x; return this; } };
}
const id='cs_live_SYNTHETIC_local_flow';
const session={id,livemode:true,payment_status:'paid',status:'complete',
  payment_link:'plink_1UA9cyCwGoUDklRezKVZTA7W',amount_total:700,currency:'usd'};
const expected=['time-stamp-defense-checklist','rental-car-damage-prevention',
  'dispute-script-pack','editable-dispute-script-pack'];
test('synthetic paid checkout follows actual session URLs to all four download handlers', async () => {
  const lookup=async (p) => { assert.equal(p,`/v1/checkout/sessions/${id}`); return session; };
  const verified=response();
  await createKitSessionHandler({stripeRequest:lookup})({method:'GET',query:{session_id:id}},verified);
  assert.equal(verified.code,200);
  const keys=[];
  for (const item of verified.body.assets) {
    const url=new URL(item.url,'https://carshake.online');
    assert.equal(url.pathname,'/api/kit-download');
    const query=Object.fromEntries(url.searchParams); keys.push(query.asset);
    const bytes=Buffer.from(`SYNTHETIC NOT THE PURCHASED KIT: ${query.asset}`);
    const res=response();
    await createKitDownloadHandler({stripeRequest:lookup,readAsset:async (asset) => {
      assert.equal(asset.key,query.asset); return bytes;
    }})({method:'GET',query},res);
    assert.equal(res.code,200); assert.deepEqual(res.body,bytes);
    assert.equal(res.headers['content-length'],String(bytes.length));
    assert.match(res.headers['cache-control'],/no-store/);
    assert.match(res.headers['content-disposition'],/^attachment;/);
  }
  assert.deepEqual(keys,expected);
});
test('all four actual download handlers deny invalid checkout fixtures without reading assets', async () => {
  for (const key of expected) for (const delta of [
    {payment_status:'unpaid'},{status:'open'},{livemode:false},
    {payment_link:'plink_SYNTHETIC_foreign'},{amount_total:699},{currency:'eur'},
  ]) {
    let reads=0; const res=response();
    await createKitDownloadHandler({stripeRequest:async()=>({...session,...delta}),
      readAsset:async()=>{reads++; return Buffer.from('MUST NOT SERVE');}
    })({method:'GET',query:{session_id:id,asset:key}},res);
    assert.equal(res.code,403); assert.equal(reads,0);
  }
});
