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

  var history = [];
  try { history = JSON.parse(sessionStorage.getItem(KEY) || '[]'); } catch (e) { history = []; }
  function save() { try { sessionStorage.setItem(KEY, JSON.stringify(history.slice(-20))); } catch (e) {} }

  root.innerHTML = '\
<style>\
:host{all:initial;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif}\
*{box-sizing:border-box}\
.btn{width:60px;height:60px;border-radius:50%;border:0;cursor:pointer;background:var(--c);color:#fff;box-shadow:0 4px 14px rgba(0,0,0,.25);display:flex;align-items:center;justify-content:center}\
.btn svg{width:28px;height:28px}\
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
  <div class="head"><span class="title">Assistant</span><button class="x" aria-label="Close">&times;</button></div>\
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
<button class="btn" aria-label="Open chat"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H8l-4 4V6a2 2 0 0 1 2-2z"/></svg></button>';

  var $ = function (s) { return root.querySelector(s); };
  var panel = $('.panel'), msgs = $('.msgs'), input = $('.in'), form = $('.form');
  host.style.setProperty('--c', '#2f6f5e');
  var greeting = 'Hi! How can I help you today?';

  function linkify(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML.replace(/(https?:\/\/[^\s<]+[^\s<.,)!?])/g,
      '<a href="$1" target="_blank" rel="noopener">$1</a>');
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
