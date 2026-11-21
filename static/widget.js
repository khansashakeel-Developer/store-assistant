/* thekhansa Store Assistant - chat bubble.
   Add to a Shopify theme (theme.liquid, before </body>):
   <script src="https://YOUR-APP.vercel.app/widget.js" data-client="noor" defer></script>
*/
(function () {
  var script = document.currentScript || document.querySelector('script[data-client]');
  if (!script) return;
  var CLIENT = script.getAttribute('data-client');
  var API = new URL(script.src).origin;
  var KEY = 'tk_chat_' + CLIENT;

  var host = document.createElement('div');
  host.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:2147483000;';
  document.body.appendChild(host);
  var root = host.attachShadow({ mode: 'open' });

  var AV = 'data:image/svg+xml;utf8,' + encodeURIComponent("<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 200 200\" width=\"400\" height=\"400\"><defs><radialGradient id=\"bg\" cx=\"50%\" cy=\"35%\" r=\"75%\"><stop offset=\"0\" stop-color=\"#3f8a75\"/><stop offset=\"1\" stop-color=\"#2f6f5e\"/></radialGradient><linearGradient id=\"skin\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0\" stop-color=\"#f6d2b8\"/><stop offset=\"1\" stop-color=\"#eebf9f\"/></linearGradient><linearGradient id=\"hij\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\"><stop offset=\"0\" stop-color=\"#f7cfd9\"/><stop offset=\"1\" stop-color=\"#e9a9bb\"/></linearGradient><linearGradient id=\"top\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0\" stop-color=\"#ffffff\"/><stop offset=\"1\" stop-color=\"#e5efe9\"/></linearGradient><clipPath id=\"c\"><circle cx=\"100\" cy=\"100\" r=\"100\"/></clipPath></defs><g clip-path=\"url(#c)\"><rect width=\"200\" height=\"200\" fill=\"url(#bg)\"/><circle cx=\"45\" cy=\"40\" r=\"26\" fill=\"#ffffff\" opacity=\".07\"/><circle cx=\"165\" cy=\"60\" r=\"18\" fill=\"#ffffff\" opacity=\".07\"/><!-- body --><path d=\"M18 205 C20 158 52 142 100 142 C148 142 180 158 182 205 Z\" fill=\"url(#top)\"/><!-- hijab back/shoulders --><path d=\"M30 205 C32 160 55 136 100 134 C145 136 168 160 170 205 Z\" fill=\"url(#hij)\" opacity=\".98\"/><path d=\"M100 140 C84 150 70 170 66 205 L134 205 C130 170 116 150 100 140Z\" fill=\"#fbe3e9\" opacity=\".55\"/><!-- hijab around head --><path d=\"M100 22 C60 22 42 56 44 92 C45 118 56 138 74 148 C86 154 114 154 126 148 C144 138 155 118 156 92 C158 56 140 22 100 22Z\" fill=\"url(#hij)\"/><!-- face --><ellipse cx=\"100\" cy=\"92\" rx=\"35\" ry=\"41\" fill=\"url(#skin)\"/><!-- hijab front edge --><path d=\"M64 80 C66 52 84 40 100 40 C116 40 134 52 136 80 C128 62 114 58 100 58 C86 58 72 62 64 80Z\" fill=\"#f1b9c8\"/><!-- brows --><path d=\"M78 80 Q86 75 94 79\" stroke=\"#5a3a2e\" stroke-width=\"3\" fill=\"none\" stroke-linecap=\"round\"/><path d=\"M106 79 Q114 75 122 80\" stroke=\"#5a3a2e\" stroke-width=\"3\" fill=\"none\" stroke-linecap=\"round\"/><!-- eyes --><ellipse cx=\"86\" cy=\"92\" rx=\"6.5\" ry=\"7.5\" fill=\"#fff\"/><ellipse cx=\"114\" cy=\"92\" rx=\"6.5\" ry=\"7.5\" fill=\"#fff\"/><circle cx=\"87\" cy=\"93\" r=\"4.6\" fill=\"#4a2c1d\"/><circle cx=\"115\" cy=\"93\" r=\"4.6\" fill=\"#4a2c1d\"/><circle cx=\"88.6\" cy=\"91.2\" r=\"1.7\" fill=\"#fff\"/><circle cx=\"116.6\" cy=\"91.2\" r=\"1.7\" fill=\"#fff\"/><path d=\"M79 87 Q86 83 93 87\" stroke=\"#3b2318\" stroke-width=\"2\" fill=\"none\" stroke-linecap=\"round\"/><path d=\"M107 87 Q114 83 121 87\" stroke=\"#3b2318\" stroke-width=\"2\" fill=\"none\" stroke-linecap=\"round\"/><!-- nose, cheeks, smile --><path d=\"M100 98 Q97 107 101 109\" stroke=\"#d99f84\" stroke-width=\"2\" fill=\"none\" stroke-linecap=\"round\"/><ellipse cx=\"74\" cy=\"108\" rx=\"7\" ry=\"4.5\" fill=\"#f4a3a3\" opacity=\".45\"/><ellipse cx=\"126\" cy=\"108\" rx=\"7\" ry=\"4.5\" fill=\"#f4a3a3\" opacity=\".45\"/><path d=\"M88 117 Q100 129 112 117 Q100 122 88 117Z\" fill=\"#c84f66\" stroke=\"#c84f66\" stroke-width=\"2\" stroke-linejoin=\"round\"/><path d=\"M92 118 Q100 124 108 118\" fill=\"#fff\" opacity=\".9\"/><!-- headset --><path d=\"M56 90 C52 44 80 28 100 28 C120 28 148 44 144 90\" stroke=\"#2b2f33\" stroke-width=\"7\" fill=\"none\" stroke-linecap=\"round\"/><rect x=\"46\" y=\"82\" width=\"15\" height=\"30\" rx=\"7\" fill=\"#2b2f33\"/><rect x=\"139\" y=\"82\" width=\"15\" height=\"30\" rx=\"7\" fill=\"#2b2f33\"/><rect x=\"49\" y=\"86\" width=\"5\" height=\"22\" rx=\"2.5\" fill=\"#4a5056\"/><path d=\"M146 108 C146 126 130 134 112 132\" stroke=\"#2b2f33\" stroke-width=\"4\" fill=\"none\" stroke-linecap=\"round\"/><ellipse cx=\"108\" cy=\"132\" rx=\"8\" ry=\"5\" fill=\"#2b2f33\"/><!-- collar --><path d=\"M82 146 L100 160 L118 146 L112 142 L100 150 L88 142Z\" fill=\"#2f6f5e\" opacity=\".9\"/></g></svg>");
  var history = [];
  try { history = JSON.parse(sessionStorage.getItem(KEY) || '[]'); } catch (e) { history = []; }
  function save() { try { sessionStorage.setItem(KEY, JSON.stringify(history.slice(-20))); } catch (e) {} }

  root.innerHTML = '\
<style>\
:host{all:initial;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif}\
*{box-sizing:border-box}\
.btn{width:60px;height:60px;border-radius:50%;border:0;cursor:pointer;background:var(--c);color:#fff;box-shadow:0 4px 14px rgba(0,0,0,.25);display:flex;align-items:center;justify-content:center}\
.btn{padding:0;position:relative}\
.btn .av{width:100%;height:100%;border-radius:50%;object-fit:cover;border:3px solid #fff;display:block}\
.btn .dot{position:absolute;right:2px;bottom:2px;width:13px;height:13px;border-radius:50%;background:#3ddc84;border:2px solid #fff}\
.who{display:flex;align-items:center;gap:10px}\
.who .hav{width:38px;height:38px;border-radius:50%;border:2px solid rgba(255,255,255,.8);object-fit:cover;background:#fff}\
.who small{display:block;font-weight:400;font-size:11px;opacity:.85;margin-top:1px}\
.panel{display:none;position:absolute;bottom:72px;right:0;width:360px;max-width:calc(100vw - 32px);height:520px;max-height:calc(100vh - 110px);background:#fff;border-radius:16px;box-shadow:0 10px 40px rgba(0,0,0,.25);overflow:hidden;flex-direction:column}\
.panel.open{display:flex}\
.head{background:var(--c);color:#fff;padding:14px 16px;font-weight:600;font-size:15px;display:flex;justify-content:space-between;align-items:center}\
.head button{background:none;border:0;color:#fff;font-size:22px;cursor:pointer;line-height:1}\
.msgs{flex:1;overflow-y:auto;padding:14px;background:#f7f7f8;display:flex;flex-direction:column;gap:8px}\
.m{max-width:85%;padding:9px 12px;border-radius:14px;font-size:14px;line-height:1.45;white-space:pre-wrap;word-wrap:break-word}\
.m a{color:inherit;text-decoration:underline}\
.bot{background:#fff;color:#222;align-self:flex-start;border:1px solid #e6e6e8}\
.me{background:var(--c);color:#fff;align-self:flex-end}\
.typing{opacity:.6;font-style:italic}\
.bar{display:flex;gap:6px;padding:10px;border-top:1px solid #eee;background:#fff}\
.bar input{flex:1;border:1px solid #ddd;border-radius:20px;padding:9px 14px;font-size:14px;outline:none}\
.bar button{border:0;background:var(--c);color:#fff;border-radius:20px;padding:0 14px;cursor:pointer;font-size:14px}\
.lead{border:0;background:none;color:var(--c);font-size:12px;cursor:pointer;padding:6px;text-decoration:underline}\
.form{display:none;padding:10px;gap:6px;flex-direction:column;border-top:1px solid #eee;background:#fff}\
.form.open{display:flex}\
.form input{border:1px solid #ddd;border-radius:8px;padding:8px 10px;font-size:13px}\
.form button{border:0;background:var(--c);color:#fff;border-radius:8px;padding:8px;cursor:pointer}\
.foot{text-align:center;font-size:10px;color:#999;padding:4px;background:#fff}\
.foot a{color:#999}\
</style>\
<div class="panel" part="panel">\
  <div class="head"><div class="who"><img class="hav" alt=""><div><span class="title">Assistant</span><small>Online &middot; replies instantly</small></div></div><button class="x" aria-label="Close">&times;</button></div>\
  <div class="msgs"></div>\
  <div class="form">\
    <input class="fname" placeholder="Your name" maxlength="100">\
    <input class="fcontact" placeholder="Email or WhatsApp number" maxlength="150">\
    <button class="fsend">Send to the team</button>\
  </div>\
  <div class="bar"><input class="in" dir="auto" placeholder="Type your question..." maxlength="1000"><button class="send">Send</button></div>\
  <button class="lead">Leave your contact</button>\
  <div class="foot">AI assistant by <a href="https://thekhansa.com" target="_blank" rel="noopener">thekhansa</a></div>\
</div>\
<button class="btn" aria-label="Open chat"><img class="av" alt=""><span class="dot"></span></button>';
  function setAv(u, custom) { if (custom && u.charAt(0) === "/") u = API + u; var a = root.querySelectorAll(".av,.hav"); for (var i = 0; i < a.length; i++) { a[i].onerror = custom ? function () { this.onerror = null; this.src = AV; } : null; a[i].src = u; } }
  setAv(AV);

  var $ = function (s) { return root.querySelector(s); };
  var panel = $('.panel'), msgs = $('.msgs'), input = $('.in'), form = $('.form');
  host.style.setProperty('--c', '#2f6f5e');
  var greeting = 'Hi! How can I help you today?';

  function linkify(text) {
    var div = document.createElement('div');
    div.textContent = text;
    var h = div.innerHTML;
    h = h.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    h = h.replace(/(^|[^">])(https?:\/\/[^\s<]+[^\s<.,)!?])/g,
      '$1<a href="$2" target="_blank" rel="noopener">View product &rarr;</a>');
    h = h.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/\*\*/g, '');
    return h;
  }
  function add(role, text, extraClass) {
    var el = document.createElement('div');
    el.setAttribute('dir', 'auto');
    el.className = 'm ' + (role === 'user' ? 'me' : 'bot') + (extraClass ? ' ' + extraClass : '');
    el.innerHTML = linkify(text);
    msgs.appendChild(el);
    msgs.scrollTop = msgs.scrollHeight;
    return el;
  }
  function render() {
    msgs.innerHTML = '';
    add('assistant', greeting);
    history.forEach(function (m) { add(m.role, m.content); });
  }

  fetch(API + '/api/config/' + encodeURIComponent(CLIENT)).then(function (r) { return r.json(); })
    .then(function (c) {
      if (c.color) host.style.setProperty('--c', c.color);
      if (c.bot_name) $('.title').textContent = c.bot_name;
      if (c.avatar) setAv(c.avatar, true);
      if (c.greeting) greeting = c.greeting;
      render();
    }).catch(render);

  var busy = false;
  function send() {
    var text = input.value.trim();
    if (!text || busy) return;
    busy = true;
    input.value = '';
    history.push({ role: 'user', content: text });
    add('user', text);
    var typing = add('assistant', 'Typing...', 'typing');
    fetch(API + '/api/chat', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client: CLIENT, messages: history.slice(-10) })
    }).then(function (r) {
      return r.json().then(function (d) { if (!r.ok) throw new Error(d.detail || 'Error'); return d; });
    }).then(function (d) {
      typing.remove();
      history.push({ role: 'assistant', content: d.reply });
      add('assistant', d.reply);
      save();
    }).catch(function (e) {
      typing.remove();
      history.pop();
      add('assistant', (e && e.message && e.message !== 'Failed to fetch') ? e.message
        : 'Sorry, I could not connect. Please try again.');
    }).finally(function () { busy = false; });
  }

  $('.btn').onclick = function () { panel.classList.toggle('open'); if (panel.classList.contains('open')) input.focus(); };
  $('.x').onclick = function () { panel.classList.remove('open'); };
  $('.send').onclick = send;
  input.addEventListener('keydown', function (e) { if (e.key === 'Enter') send(); });
  $('.lead').onclick = function () { form.classList.toggle('open'); };
  $('.fsend').onclick = function () {
    var contact = $('.fcontact').value.trim();
    if (contact.length < 3) { $('.fcontact').focus(); return; }
    var lastQ = history.filter(function (m) { return m.role === 'user'; }).slice(-1)[0];
    fetch(API + '/api/lead', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client: CLIENT, name: $('.fname').value.trim(), contact: contact,
        question: lastQ ? lastQ.content : '' })
    }).then(function () {
      form.classList.remove('open');
      add('assistant', 'Thank you! Our team will contact you soon.');
    }).catch(function () { add('assistant', 'Sorry, that did not send. Please try again.'); });
  };
})();