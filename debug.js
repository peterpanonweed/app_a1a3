// debug.js — Drohnenschein.app Debug Panel
// Aktivierung: ?debug=1 in der URL
// Einbindung: <script src="debug.js"></script> vor </body>

(function(){
  if(!window.location.search.includes('debug=1')) return;

  // ── Welches Modul sind wir? ──────────────────────────
  const page = window.location.pathname.split('/').pop() || 'index.html';
  const isIndex = page === 'index.html' || page === '';
  const moduleMatch = page.match(/modul-(\d+)/);
  const mNum = moduleMatch ? moduleMatch[1] : null;
  const mKey = mNum ? 'm'+mNum : null;

  // ── Modul-Config ────────────────────────────────────
  const MODULE_CONFIG = {
    m1: {
      answered: ['q0_1','q0_2','q1_1','q1_2','sc_sc0_1','q2_1','q3_1','sc_sc2_1','q4_1','q4_2'],
      chapters: ['m1_ch1','m1_ch2','m1_ch3','m1_ch4','m1_ch5'],
      chapterNames: ['Kap 1','Kap 2','Kap 3','Kap 4','Kap 5'],
      completed: 'm1_completed'
    },
    m2: {
      answered: ['q0_1','q0_2','q0_3','q0_4','q0_5','q0_6','q1_1','q1_2','q1_3','q1_4','q1_5','q1_6'],
      chapters: ['m2_ch1','m2_ch2'],
      chapterNames: ['Kap 6','Kap 7'],
      completed: 'm2_completed'
    },
    m3: {
      answered: [],
      chapters: ['m3_ch1','m3_ch2','m3_ch3'],
      chapterNames: ['Kap 8','Kap 9','Kap 10'],
      completed: 'm3_completed'
    },
    m4: {
      answered: [],
      chapters: ['m4_ch1','m4_ch2','m4_ch3','m4_ch4'],
      chapterNames: ['Kap 11','Kap 12','Kap 13','Kap 14'],
      completed: 'm4_completed'
    }
  };

  // ── Styles ──────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    #dbg-toggle {
      position:fixed;bottom:80px;right:16px;z-index:9999;
      background:#FF6D00;color:#fff;border:none;border-radius:50%;
      width:48px;height:48px;font-size:20px;cursor:pointer;
      box-shadow:0 4px 12px rgba(0,0,0,.4);
    }
    #dbg-panel {
      position:fixed;bottom:140px;right:16px;z-index:9998;
      background:#1A1A1A;color:#fff;border-radius:14px;
      padding:1.25rem;width:300px;max-height:72vh;overflow-y:auto;
      box-shadow:0 8px 32px rgba(0,0,0,.6);display:none;
      font-family:'DM Sans',sans-serif;font-size:13px;line-height:1.5;
    }
    #dbg-panel h4 {
      font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;
      color:#FF6D00;margin:1rem 0 .4rem;
    }
    #dbg-panel h4:first-child { margin-top:0; }
    .dbg-btn {
      display:block;width:100%;padding:9px 12px;margin-bottom:6px;
      border:none;border-radius:8px;font-size:13px;font-weight:600;
      cursor:pointer;text-align:left;font-family:'DM Sans',sans-serif;
    }
    .dbg-btn.green  { background:#00C853;color:#000; }
    .dbg-btn.red    { background:#FF3D00;color:#fff; }
    .dbg-btn.blue   { background:#0066CC;color:#fff; }
    .dbg-btn.gray   { background:#444;color:#fff; }
    .dbg-btn.yellow { background:#FFD600;color:#000; }
    .dbg-state {
      background:#000;border-radius:8px;padding:.75rem;
      font-size:11px;font-family:monospace;white-space:pre-wrap;
      word-break:break-all;color:#00C853;max-height:180px;overflow-y:auto;
    }
    .dbg-divider { border:none;border-top:1px solid #333;margin:.75rem 0; }
    .dbg-label { color:#aaa;font-size:11px;margin-bottom:8px;display:block; }
  `;
  document.head.appendChild(style);

  // ── DOM aufbauen ────────────────────────────────────
  const toggle = document.createElement('button');
  toggle.id = 'dbg-toggle';
  toggle.textContent = '🐛';
  toggle.title = 'Debug Panel';

  const panel = document.createElement('div');
  panel.id = 'dbg-panel';
  document.body.appendChild(toggle);
  document.body.appendChild(panel);

  toggle.addEventListener('click', () => {
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    if(panel.style.display === 'block') renderPanel();
  });

  // ── Hilfsfunktionen ─────────────────────────────────
  function getP(){ try{ return JSON.parse(localStorage.getItem('drohnenschein_progress')||'{}'); }catch(e){ return {}; } }
  function setP(p){ localStorage.setItem('drohnenschein_progress', JSON.stringify(p)); }
  function reload(){ window.location.reload(); }

  function btn(label, cls, fn){
    const b = document.createElement('button');
    b.className = 'dbg-btn ' + cls;
    b.textContent = label;
    b.addEventListener('click', fn);
    return b;
  }

  // ── Panel rendern ────────────────────────────────────
  function renderPanel(){
    panel.innerHTML = '';
    const p = getP();

    // Titel
    const title = document.createElement('div');
    title.style.cssText = 'font-weight:700;font-size:14px;margin-bottom:.75rem;';
    title.textContent = '🐛 Debug Panel' + (mKey ? ' — Modul '+mNum : ' — Index');
    panel.appendChild(title);

    // ── MODUL-SPEZIFISCH ──
    if(mKey && MODULE_CONFIG[mKey]){
      const cfg = MODULE_CONFIG[mKey];

      const h1 = document.createElement('h4');
      h1.textContent = 'Schnellaktionen';
      panel.appendChild(h1);

      // Alle Checks auf 100%
      panel.appendChild(btn('✅ Alle Checks beantworten → 100%', 'green', ()=>{
        const p2 = getP();
        const answered = {};
        cfg.answered.forEach(id => answered[id] = true);
        p2[mKey+'_answered'] = JSON.stringify(answered);
        cfg.chapters.forEach(k => p2[k] = true);
        p2[mKey+'_progress'] = 100;
        p2[mKey+'_chapter'] = cfg.chapters.length - 1;
        setP(p2); reload();
      }));

      // Kapitel einzeln abschließen
      cfg.chapters.forEach((chKey, i) => {
        panel.appendChild(btn('📗 '+cfg.chapterNames[i]+' als erledigt markieren', 'blue', ()=>{
          const p2 = getP();
          p2[chKey] = true;
          p2[mKey+'_chapter'] = i;
          setP(p2); reload();
        }));
      });

      // Modul als bestanden markieren
      panel.appendChild(btn('🏆 Modul als bestanden markieren', 'yellow', ()=>{
        const p2 = getP();
        p2[cfg.completed] = true;
        setP(p2); reload();
      }));

      const hr1 = document.createElement('hr');
      hr1.className = 'dbg-divider';
      panel.appendChild(hr1);

      // Reset
      panel.appendChild(btn('🗑 Dieses Modul zurücksetzen', 'red', ()=>{
        if(!confirm('Fortschritt für dieses Modul wirklich löschen?')) return;
        const p2 = getP();
        Object.keys(p2).forEach(k => { if(k.startsWith(mKey)) delete p2[k]; });
        setP(p2); reload();
      }));
    }

    // ── INDEX-SPEZIFISCH ──
    if(isIndex){
      const h1 = document.createElement('h4');
      h1.textContent = 'Schnellaktionen';
      panel.appendChild(h1);

      Object.keys(MODULE_CONFIG).forEach(mk => {
        const cfg = MODULE_CONFIG[mk];
        const num = mk.replace('m','');
        panel.appendChild(btn('✅ Modul '+num+' komplett abschließen', 'green', ()=>{
          const p2 = getP();
          const answered = {};
          cfg.answered.forEach(id => answered[id] = true);
          p2[mk+'_answered'] = JSON.stringify(answered);
          cfg.chapters.forEach(k => p2[k] = true);
          p2[mk+'_progress'] = 100;
          p2[cfg.completed] = true;
          setP(p2);
          if(typeof renderModules === 'function') renderModules();
          renderPanel();
        }));
      });
    }

    // ── GLOBAL ──
    const hr2 = document.createElement('hr');
    hr2.className = 'dbg-divider';
    panel.appendChild(hr2);

    const h2 = document.createElement('h4');
    h2.textContent = 'Global';
    panel.appendChild(h2);

    panel.appendChild(btn('💣 Gesamten Fortschritt löschen', 'red', ()=>{
      if(!confirm('Wirklich ALLES löschen?')) return;
      localStorage.removeItem('drohnenschein_progress');
      reload();
    }));

    // ── STATE ANZEIGE ──
    const hr3 = document.createElement('hr');
    hr3.className = 'dbg-divider';
    panel.appendChild(hr3);

    const h3 = document.createElement('h4');
    h3.textContent = 'localStorage State';
    panel.appendChild(h3);

    const refreshBtn = btn('🔄 Aktualisieren', 'gray', renderPanel);
    refreshBtn.style.marginBottom = '8px';
    panel.appendChild(refreshBtn);

    const state = document.createElement('div');
    state.className = 'dbg-state';
    const p2 = getP();
    // Lesbarer ausgeben
    const display = {};
    Object.keys(p2).sort().forEach(k => {
      if(k.endsWith('_answered')){
        try{ display[k] = JSON.parse(p2[k]); }catch(e){ display[k] = p2[k]; }
      } else {
        display[k] = p2[k];
      }
    });
    state.textContent = JSON.stringify(display, null, 2);
    panel.appendChild(state);
  }

})();
