// SamaCollect — pages complémentaires : confidentialité et tableau de bord administrateur
const CFG = window.SAMA_CONFIG || {};
const CONTACT = 'kurambisaan@gmail.com'; // adresse de contact à afficher sur la page de confidentialité (laisser vide pour la masquer)
const { createClient } = CFG.supabaseUrl
  ? await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm')
  : await import('./demo.js');
const sb = createClient(CFG.supabaseUrl, CFG.supabaseAnonKey);
const app = document.getElementById('app');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const nf = n => Number(n || 0).toLocaleString('fr-FR');
const MONTHS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
const month = k => { const [y, m] = String(k).split('-'); return `${MONTHS[+m - 1] || m} ${y}`; };

function bars(items, label = x => x) {
  if (!items.length) return '<p class="muted" style="margin:0">Pas encore de données.</p>';
  const max = Math.max(1, ...items.map(x => x.n));
  return items.map(x => `<div class="bar"><span class="l" title="${esc(label(x.k))}">${esc(label(x.k))}</span><span class="t"><i style="width:${x.n / max * 100}%"></i></span><span class="v">${nf(x.n)}</span></div>`).join('');
}

function privacy() {
  app.innerHTML = `<div class="card" style="line-height:1.6">
  <h1>Politique de confidentialité</h1>
  <p class="muted">Dernière mise à jour : 20 novembre 2026</p>
  <h2>1. Qui sommes-nous ?</h2>
  <p>SamaCollect est un outil gratuit de collecte et d’analyse de données destiné à la recherche, conçu et administré au Sénégal. Il est soumis à la loi sénégalaise n° 2008-12 du 25 janvier 2008 sur la protection des données à caractère personnel.</p>
  <h2>2. Quelles données sont traitées ?</h2>
  <ul>
    <li><b>Compte chercheur</b> : nom, adresse e-mail et mot de passe (chiffré, jamais visible, même par l’administrateur).</li>
    <li><b>Formulaires</b> : les questionnaires créés par les chercheurs et leur fiche scientifique.</li>
    <li><b>Réponses</b> : les réponses aux questionnaires, et le cas échéant les photos et positions GPS lorsque le questionnaire les demande. Les répondants n’ont pas besoin de compte.</li>
    <li><b>Indicateurs de saisie</b> : durée de remplissage, nombre de frappes et de caractères collés dans les champs texte. Ils servent uniquement au contrôle qualité des données. Le contenu de vos autres applications n’est jamais lu.</li>
  </ul>
  <p>SamaCollect n’utilise ni publicité, ni cookies de suivi, ni revente de données.</p>
  <h2>3. Qui peut voir les données ?</h2>
  <ul>
    <li>Chaque chercheur est le seul à voir les réponses de ses formulaires.</li>
    <li>L’administrateur technique peut, pour la maintenance ou à la demande d’un utilisateur, accéder à la base. Il consulte uniquement des statistiques globales (nombres d’inscrits, de formulaires et de réponses) et n’ouvre pas les données individuelles sans motif.</li>
    <li><b>Données ouvertes</b> : uniquement si le chercheur l’active. Les questions marquées « donnée personnelle », les photos, les positions GPS et le nom des enquêteurs sont alors retirés automatiquement.</li>
  </ul>
  <h2>4. Détecteur IA</h2>
  <p>Les textes analysés par le Détecteur IA (YAAKOBIND?) sont traités directement dans votre navigateur. Ils ne sont ni envoyés, ni enregistrés, ni transmis à un service d’intelligence artificielle.</p>
  <h2>5. Où sont hébergées les données ?</h2>
  <p>La base de données est hébergée par Supabase sur des serveurs situés dans l’Union européenne (Francfort). Le site est servi par GitHub Pages. Les échanges sont chiffrés (HTTPS). Hors connexion, les réponses sont gardées temporairement sur le téléphone jusqu’à leur envoi.</p>
  <h2>6. Durée de conservation</h2>
  <p>Les données sont conservées tant que le chercheur ne supprime pas ses formulaires ou son compte. La suppression d’un formulaire efface définitivement toutes ses réponses et photos.</p>
  <h2>7. Responsabilités du chercheur</h2>
  <p>Le chercheur qui crée un questionnaire est responsable de sa collecte : il informe les répondants de l’objectif de l’étude, recueille leur consentement et ne demande que les données nécessaires à sa recherche.</p>
  <h2>8. Vos droits</h2>
  <p>Vous disposez d’un droit d’accès, de rectification, d’opposition et de suppression de vos données. Les répondants peuvent s’adresser au chercheur qui leur a transmis le questionnaire${CONTACT ? `, et toute personne peut écrire à l’administrateur de SamaCollect : <b>${esc(CONTACT)}</b>` : ''}. Vous pouvez aussi saisir la Commission de protection des données personnelles (CDP) du Sénégal.</p>
  </div>`;
}

async function admin() {
  app.innerHTML = '<div class="empty">Chargement des statistiques…</div>';
  const { data: { session } } = await sb.auth.getSession();
  if (!session) { app.innerHTML = '<div class="card empty">Connecte-toi pour accéder à l’administration.</div>'; return; }
  const { data: s, error } = await sb.rpc('admin_stats');
  if (location.hash !== '#/admin') return;
  if (error || !s) { app.innerHTML = '<div class="card empty">Accès réservé à l’administrateur de SamaCollect.</div>'; return; }
  const k = (label, v, sub) => `<div class="kpi"><span class="muted">${label}</span><b>${nf(v)}</b>${sub ? `<span class="muted small">${sub}</span>` : ''}</div>`;
  app.innerHTML = `<h1>Tableau de bord administrateur</h1>
    <p class="muted">Chiffres globaux uniquement : aucune réponse individuelle n’est affichée.</p>
    <div class="kpis">
      ${k('Comptes inscrits', s.users, `+${nf(s.users_30d)} en 30 jours`)}
      ${k('Chercheurs actifs', s.researchers, 'ont créé au moins un formulaire')}
      ${k('Formulaires', s.forms, `${nf(s.published)} en collecte`)}
      ${k('Réponses collectées', s.submissions, `+${nf(s.submissions_30d)} en 30 jours`)}
      ${k('Jeux de données ouverts', s.open_data)}
    </div>
    <div class="card"><h3>Réponses collectées par mois</h3>${bars(s.subs_by_month || [], month)}</div>
    <div class="card"><h3>Nouvelles inscriptions par mois</h3>${bars(s.users_by_month || [], month)}</div>
    <div class="grid2">
      <div class="card"><h3>Zones d’étude</h3>${bars(s.regions || [])}</div>
      <div class="card"><h3>Disciplines</h3>${bars(s.disciplines || [])}</div>
    </div>`;
}

const ROUTES = { '#/confidentialite': privacy, '#/admin': admin };
function route() { const fn = ROUTES[location.hash]; if (fn) { window.scrollTo(0, 0); fn(); } }
// Le routeur principal affiche « Page introuvable » pour ces adresses : on prend alors le relais.
new MutationObserver(() => { if (ROUTES[location.hash] && app.textContent.includes('Page introuvable')) route(); })
  .observe(app, { childList: true });
addEventListener('hashchange', () => setTimeout(route, 0));
route();

// Pied de page avec le lien vers la confidentialité
const foot = document.createElement('footer');
foot.className = 'foot';
foot.innerHTML = '<a href="#/confidentialite">Confidentialité</a> · SamaCollect';
document.querySelector('main').after(foot);

// Mention sur la page de connexion
new MutationObserver(() => {
  const f = document.getElementById('authF');
  if (f && !document.getElementById('privLine')) {
    const p = document.createElement('p'); p.id = 'privLine'; p.className = 'muted small';
    p.innerHTML = 'En utilisant SamaCollect, tu acceptes la <a href="#/confidentialite">politique de confidentialité</a>.';
    f.after(p);
  }
}).observe(app, { childList: true, subtree: true });

// Lien « Admin » dans la barre de navigation, pour l’administrateur seulement
let isAdmin = false;
async function checkAdmin() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) { isAdmin = false; return; }
  const { data } = await sb.rpc('is_admin'); isAdmin = data === true; addAdminLink();
}
function addAdminLink() {
  const nav = document.getElementById('topnav');
  if (!isAdmin || !nav || nav.querySelector('[href="#/admin"]') || !nav.querySelector('[href="#/deconnexion"]')) return;
  const a = document.createElement('a'); a.href = '#/admin'; a.textContent = 'Admin';
  if (location.hash === '#/admin') a.className = 'on';
  nav.querySelector('[href="#/deconnexion"]').before(a);
}
new MutationObserver(addAdminLink).observe(document.getElementById('topnav'), { childList: true });
sb.auth.onAuthStateChange(() => setTimeout(checkAdmin, 0));
checkAdmin();
