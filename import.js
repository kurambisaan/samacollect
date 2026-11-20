// SamaCollect — import d'un formulaire au format JSON (bouton « Importer » dans « Mes formulaires »)
const CFG = window.SAMA_CONFIG || {};
const TYPES = ['text', 'long', 'number', 'single', 'multi', 'yesno', 'rating', 'date', 'gps', 'photo'];
const { createClient } = CFG.supabaseUrl
  ? await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm')
  : await import('./demo.js');
const sb = createClient(CFG.supabaseUrl, CFG.supabaseAnonKey);

function say(msg) {
  const t = document.getElementById('toast'); if (!t) return;
  t.textContent = msg; t.classList.add('on'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('on'), 4000);
}
function clean(raw) {
  const f = raw && raw.form ? raw.form : raw;
  if (!f || typeof f.title !== 'string' || !Array.isArray(f.questions) || !f.questions.length) throw new Error('fichier non reconnu');
  const ids = new Set();
  const questions = f.questions.map((q, i) => {
    if (!q || typeof q.label !== 'string' || !TYPES.includes(q.type)) throw new Error(`question ${i + 1} invalide`);
    const id = String(q.id || ('i' + i)).replace(/[^\w-]/g, '').slice(0, 40) || 'i' + i;
    if (ids.has(id)) throw new Error(`identifiant en double : ${id}`); ids.add(id);
    return { id, code: String(q.code || 'q' + (i + 1)).slice(0, 30), label: q.label.slice(0, 500), hint: String(q.hint || '').slice(0, 500),
      type: q.type, required: !!q.required, personal: !!q.personal,
      options: Array.isArray(q.options) ? q.options.map(String).slice(0, 60) : [],
      min: typeof q.min === 'number' ? q.min : null, max: typeof q.max === 'number' ? q.max : null,
      showIf: q.showIf && ids.has(q.showIf.q) ? { q: q.showIf.q, op: String(q.showIf.op || 'eq'), value: q.showIf.value ?? '' } : null };
  });
  const s = v => String(v || '').slice(0, 200);
  return { title: f.title.slice(0, 200), description: String(f.description || '').slice(0, 4000), questions,
    settings: f.settings && typeof f.settings === 'object' ? { askEnumerator: !!f.settings.askEnumerator } : {},
    discipline: s(f.discipline), region: s(f.region), institution: s(f.institution), author_name: s(f.author_name) };
}
function addButton() {
  if (location.hash !== '#/formulaires' || document.getElementById('impF')) return;
  const anchor = document.getElementById('tplF'); if (!anchor) return;
  const btn = document.createElement('button'); btn.id = 'impF'; btn.textContent = 'Importer';
  btn.title = 'Importer un formulaire SamaCollect (.json)';
  const input = Object.assign(document.createElement('input'), { type: 'file', accept: '.json,application/json' });
  input.style.display = 'none';
  btn.onclick = () => input.click();
  input.onchange = async () => {
    const file = input.files[0]; input.value = ''; if (!file) return;
    try {
      const row = clean(JSON.parse(await file.text()));
      const { data: { session } } = await sb.auth.getSession();
      if (!session) throw new Error('connecte-toi d’abord');
      if (!row.author_name) row.author_name = session.user.user_metadata?.full_name || '';
      btn.disabled = true;
      const { data, error } = await sb.from('forms').insert(row).select().single();
      if (error) throw error;
      say(`« ${row.title} » importé : ${row.questions.length} questions`);
      location.hash = '#/editer/' + data.id;
    } catch (e) { say('Import impossible : ' + (e.message || e)); }
    finally { btn.disabled = false; }
  };
  anchor.after(btn, input);
}
new MutationObserver(addButton).observe(document.getElementById('app'), { childList: true, subtree: true });
addEventListener('hashchange', addButton);
addButton();
