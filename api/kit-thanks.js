const KIT_THANKS_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow,noarchive">
<title>Your CarShake Emergency Kit</title>
<style>
  body{margin:0;background:#0b1120;color:#e2e8f0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;line-height:1.6}
  main{max-width:680px;margin:0 auto;padding:64px 22px}h1{color:#f8fafc;font-size:clamp(30px,6vw,46px);line-height:1.1;margin:0 0 14px}
  .lead{color:#94a3b8;font-size:1.05rem;margin-bottom:30px}.card{display:block;background:#111c30;border:1px solid #334155;border-radius:14px;padding:18px 20px;margin:12px 0;color:#e2e8f0;text-decoration:none}
  .card:hover{border-color:#00d4aa}.card strong{color:#5eead4;display:block}.note{margin-top:28px;padding:16px;border-left:3px solid #00d4aa;background:#0f172a;color:#94a3b8}a{color:#5eead4}
</style>
</head>
<body>
<main id="loading"><h1>Verifying your checkout…</h1><p class="lead">This normally takes only a moment.</p></main>
<main id="downloads" hidden>
  <p style="color:#5eead4;font-weight:700;letter-spacing:.08em;text-transform:uppercase">Purchase verified</p>
  <h1>Your Emergency Kit is ready.</h1>
  <p class="lead">Download the files below and save a local copy. The templates are educational information, not legal advice.</p>
  <div id="asset-list"></div>
  <div class="note">Keep this page private. Need help with access or a refund? Email <a href="mailto:refund@carshake.online">refund@carshake.online</a>.</div>
</main>
<main id="missing" hidden>
  <h1>Checkout confirmation required.</h1>
  <p class="lead">Open the link Stripe showed after payment. If you completed checkout and cannot access the kit, email <a href="mailto:refund@carshake.online">refund@carshake.online</a>.</p>
</main>
<script>
(async function(){
  var session=new URLSearchParams(location.search).get('session_id')||'';
  history.replaceState(null,'','/kit-thanks');
  var loading=document.getElementById('loading');
  var missing=document.getElementById('missing');
  try{
    if(!/^cs_live_[A-Za-z0-9_]+$/.test(session))throw new Error('missing');
    var response=await fetch('/api/kit-session?session_id='+encodeURIComponent(session),{headers:{Accept:'application/json'},cache:'no-store'});
    var result=await response.json();
    if(!response.ok||!result.ready||!Array.isArray(result.assets))throw new Error('unverified');
    var list=document.getElementById('asset-list');
    result.assets.forEach(function(asset){
      var link=document.createElement('a');link.className='card';link.href=asset.url;link.download='';
      var title=document.createElement('strong');title.textContent=asset.name;link.appendChild(title);list.appendChild(link);
    });
    loading.hidden=true;document.getElementById('downloads').hidden=false;
  }catch(_){loading.hidden=true;missing.hidden=false;}
})();
</script>
</body>
</html>
`;

function defaultReadHtml() {
  return KIT_THANKS_HTML;
}

function setPrivateHeaders(res) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'private, no-store, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
}

function createKitThanksHandler({ readHtml = defaultReadHtml } = {}) {
  return async function kitThanksHandler(req, res) {
    setPrivateHeaders(res);
    if (req.method !== 'GET') return res.status(405).send('Method not allowed');
    try {
      return res.status(200).send(readHtml());
    } catch (error) {
      console.error('[kit-thanks] private page unavailable:', error.message);
      return res.status(500).send('Checkout confirmation is temporarily unavailable');
    }
  };
}

const handler = createKitThanksHandler();
module.exports = handler;
module.exports.default = handler;
module.exports.createKitThanksHandler = createKitThanksHandler;
module.exports.defaultReadHtml = defaultReadHtml;
module.exports.setPrivateHeaders = setPrivateHeaders;
