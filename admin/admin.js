/* لوحة الأدمن — textContent فقط، بلا innerHTML (منع XSS ذاتي من رسائل الخطأ). */
const $ = (sel) => document.querySelector(sel);
const logBox = $('#log');
const input = $('#tool');
const button = $('#go');

const token = new URLSearchParams(location.search).get('token') || '';

function log(message, kind = '') {
  const row = document.createElement('div');
  const time = document.createElement('span');
  time.className = 't';
  time.textContent = new Date().toLocaleTimeString('ar-SY', { hour12: false });
  const text = document.createElement('span');
  if (kind) text.className = kind;
  text.textContent = message;
  row.append(time, text);
  logBox.append(row);
  logBox.scrollTop = logBox.scrollHeight;
}

if (!token) log('لا يوجد توكن في الرابط. افتح الرابط المطبوع في الطرفية.', 'bad');
else log('جاهز.', 'ok');

async function loadTools() {
  const tbody = $('#tools');
  tbody.textContent = '';
  try {
    const res = await fetch('/api/tools');
    const { tools } = await res.json();
    if (!tools.length) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = 4;
      td.style.color = 'var(--muted)';
      td.textContent = 'لا يوجد محتوى بعد.';
      tr.append(td);
      tbody.append(tr);
      return;
    }
    for (const tool of tools) {
      const tr = document.createElement('tr');

      const name = document.createElement('td');
      name.textContent = `${tool.name} (${tool.slug})`;

      const status = document.createElement('td');
      const pill = document.createElement('span');
      pill.className = `pill ${tool.status === 'published' ? 'published' : 'draft'}`;
      pill.textContent = tool.status === 'published' ? 'منشور' : 'مسوّدة';
      status.append(pill);

      const plans = document.createElement('td');
      plans.textContent = String(tool.plans);

      const verify = document.createElement('td');
      verify.textContent = tool.verify ? 'يحتاج مراجعة' : '—';
      if (tool.verify) verify.className = 'warn';

      tr.append(name, status, plans, verify);
      tbody.append(tr);
    }
  } catch {
    log('فشل تحميل قائمة الأدوات.', 'bad');
  }
}
loadTools();

async function run() {
  const toolName = input.value.trim();
  if (!toolName) { input.focus(); return; }

  button.disabled = true;
  log(`بدء التوليد: ${toolName}`);

  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Admin-Token': token },
      body: JSON.stringify({ toolName })
    });

    if (!res.ok || !res.body) {
      const { error } = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      log(error, 'bad');
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const chunks = buffer.split('\n\n');
      buffer = chunks.pop() || '';
      for (const chunk of chunks) {
        const line = chunk.split('\n').find((l) => l.startsWith('data: '));
        if (!line) continue;
        let payload;
        try { payload = JSON.parse(line.slice(6)); } catch { continue; }
        if (payload.error) log(payload.error, 'bad');
        else if (payload.done) { log(payload.step, 'ok'); loadTools(); }
        else log(payload.step);
      }
    }
  } catch (error) {
    log(`فشل الاتصال: ${error.message}`, 'bad');
  } finally {
    button.disabled = false;
    input.select();
  }
}

button.addEventListener('click', run);
input.addEventListener('keydown', (event) => { if (event.key === 'Enter') run(); });
