// infinite craft save manager by krish!! (updated to have a better file upload)
// paste into browser console on neal.fun/infinite-craft

const KEY = 'infinite-craft-data';

function download(filename, text) {
  const a = document.createElement('a');
  a.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(text);
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function showUI() {
  // remove if already open
  const existing = document.getElementById('krish-save-manager');
  if (existing) { existing.remove(); return; }

  const data = localStorage.getItem(KEY);
  let elementCount = null;
  if (data) {
    try { elementCount = JSON.parse(data)?.elements?.length ?? null; } catch {}
  }

  const ui = document.createElement('div');
  ui.id = 'krish-save-manager';
  ui.innerHTML = `
    <style>
      #krish-save-manager {
        position: fixed;
        top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        z-index: 99999;
        font-family: 'DM Sans', ui-sans-serif, sans-serif;
        font-weight: 300;
        color: #1c1917;
      }
      #ksm-overlay {
        position: fixed; inset: 0;
        background: rgba(28,25,23,0.3);
        backdrop-filter: blur(4px);
        z-index: -1;
      }
      #ksm-card {
        background: #fafaf7;
        border: 1px solid #e5e1d8;
        border-radius: 12px;
        padding: 2.2rem 2.5rem;
        width: 380px;
        box-shadow: 0 8px 32px rgba(28,25,23,0.12);
        animation: ksm-pop 0.18s ease;
      }
      @keyframes ksm-pop {
        from { transform: scale(0.95); opacity: 0; }
        to   { transform: scale(1); opacity: 1; }
      }
      #ksm-card h2 {
        font-family: 'Caveat', cursive;
        font-size: 1.6rem; font-weight: 700;
        margin-bottom: 0.2rem; color: #1c1917;
      }
      #ksm-card p.ksm-sub {
        font-size: 0.78rem; color: #78716c;
        margin-bottom: 1.6rem; line-height: 1.55;
      }
      #ksm-status {
        display: flex; align-items: center; gap: 0.55rem;
        background: #f3f0e8; border: 1px solid #e5e1d8;
        border-radius: 8px; padding: 0.7rem 0.9rem;
        margin-bottom: 1.6rem; font-size: 0.78rem; color: #78716c;
      }
      .ksm-dot {
        width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0;
        background: #3ac446; box-shadow: 0 0 0 3px rgba(58,196,70,0.18);
      }
      .ksm-dot.empty { background: #78716c; box-shadow: none; }
      #ksm-status strong { color: #1c1917; font-weight: 500; }
      .ksm-actions { display: flex; flex-direction: column; gap: 0.65rem; }
      .ksm-btn {
        width: 100%; padding: 0.8rem 1.1rem;
        border-radius: 8px; font-family: inherit;
        font-size: 0.83rem; font-weight: 500; cursor: pointer;
        border: 1.5px solid transparent;
        display: flex; align-items: center; gap: 0.65rem;
        transition: transform 0.12s, box-shadow 0.15s, border-color 0.15s;
        text-align: left;
      }
      .ksm-btn:hover { transform: translateY(-1px); }
      .ksm-btn:active { transform: translateY(0); }
      .ksm-btn-primary { background: #1c1917; color: #fafaf7; box-shadow: 0 2px 8px rgba(28,25,23,0.15); }
      .ksm-btn-primary:hover { box-shadow: 0 4px 16px rgba(28,25,23,0.22); }
      .ksm-btn-primary:disabled { opacity: 0.38; cursor: not-allowed; transform: none; box-shadow: none; }
      .ksm-btn-secondary { background: #fafaf7; color: #1c1917; border-color: #e5e1d8; }
      .ksm-btn-secondary:hover { border-color: #1c1917; }
      .ksm-btn-text { display: flex; flex-direction: column; line-height: 1.3; }
      .ksm-btn-sub { font-size: 0.68rem; font-weight: 300; opacity: 0.5; margin-top: 0.1rem; }
      .ksm-divider {
        display: flex; align-items: center; gap: 0.7rem;
        font-size: 0.65rem; color: #78716c; opacity: 0.5;
      }
      .ksm-divider::before, .ksm-divider::after {
        content: ''; flex: 1; height: 1px; background: #e5e1d8;
      }
      .ksm-close {
        position: absolute; top: 1.1rem; right: 1.2rem;
        background: none; border: none; cursor: pointer;
        color: #78716c; font-size: 1.1rem; line-height: 1;
        padding: 0.2rem; transition: color 0.15s;
      }
      .ksm-close:hover { color: #1c1917; }
      /* confirm */
      #ksm-confirm {
        display: none; position: fixed; inset: 0;
        z-index: 100000; align-items: center; justify-content: center; padding: 1.5rem;
      }
      #ksm-confirm.show { display: flex; }
      #ksm-confirm-card {
        background: #fafaf7; border: 1px solid #e5e1d8; border-radius: 12px;
        padding: 1.8rem 2rem; max-width: 340px; width: 100%;
        box-shadow: 0 8px 32px rgba(28,25,23,0.14);
        animation: ksm-pop 0.16s ease;
      }
      #ksm-confirm-card h3 {
        font-family: 'Caveat', cursive; font-size: 1.3rem; font-weight: 700; margin-bottom: 0.5rem;
      }
      #ksm-confirm-card p {
        font-size: 0.8rem; color: #78716c; line-height: 1.7; margin-bottom: 1.4rem;
      }
      #ksm-confirm-card p strong { color: #c4413a; font-weight: 500; }
      .ksm-confirm-row { display: flex; gap: 0.55rem; }
      .ksm-confirm-btn {
        flex: 1; padding: 0.65rem; border-radius: 8px;
        font-family: inherit; font-size: 0.8rem; font-weight: 500;
        cursor: pointer; border: 1.5px solid transparent; transition: all 0.14s;
      }
      .ksm-confirm-yes { background: #c4413a; color: white; }
      .ksm-confirm-yes:hover { background: #a83530; }
      .ksm-confirm-no  { background: #fafaf7; color: #1c1917; border-color: #e5e1d8; }
      .ksm-confirm-no:hover { border-color: #1c1917; }
      /* toast */
      #ksm-toast {
        position: fixed; bottom: 2rem; left: 50%;
        transform: translateX(-50%) translateY(8px);
        background: #1c1917; color: #fafaf7;
        font-family: inherit; font-size: 0.76rem;
        padding: 0.5rem 1.1rem; border-radius: 100px;
        opacity: 0; pointer-events: none;
        transition: opacity 0.2s, transform 0.2s;
        z-index: 100001; white-space: nowrap;
      }
      #ksm-toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
      #ksm-toast.ok  { background: #2a6e30; }
      #ksm-toast.err { background: #c4413a; }
    </style>

    <div id="ksm-overlay"></div>

    <div id="ksm-card" style="position:relative;">
      <button class="ksm-close" id="ksm-close-btn" title="close">✕</button>
      <h2>krish.</h2>
      <p class="ksm-sub">infinite craft save manager — back up your progress or restore from a file.</p>

      <div id="ksm-status">
        <span class="ksm-dot ${data ? '' : 'empty'}" id="ksm-dot"></span>
        <span id="ksm-status-text">
          ${data
            ? `save found &mdash; <strong>${elementCount !== null ? elementCount + ' elements' : 'data exists'}</strong>`
            : 'no save data found in this browser'}
        </span>
      </div>

      <div class="ksm-actions">
        <button class="ksm-btn ksm-btn-primary" id="ksm-export-btn" ${!data ? 'disabled' : ''}>
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <path d="M8 1v8M5 6l3 3 3-3M2 11v2a1 1 0 001 1h10a1 1 0 001-1v-2"/>
          </svg>
          <span class="ksm-btn-text">
            <span>export save</span>
            <span class="ksm-btn-sub">downloads infinite-craft-data.json</span>
          </span>
        </button>

        <div class="ksm-divider">or</div>

        <button class="ksm-btn ksm-btn-secondary" id="ksm-import-btn">
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <path d="M8 11V3M5 6l3-3 3 3M2 11v2a1 1 0 001 1h10a1 1 0 001-1v-2"/>
          </svg>
          <span class="ksm-btn-text">
            <span>import save</span>
            <span class="ksm-btn-sub">restore from a .json backup file</span>
          </span>
        </button>

        <input type="file" id="ksm-file-input" accept=".json,application/json" style="display:none"/>
      </div>
    </div>

    <!-- confirm dialog -->
    <div id="ksm-confirm">
      <div id="ksm-confirm-card">
        <h3>overwrite save?</h3>
        <p>this will <strong>permanently replace</strong> your current save. make sure you've exported a backup first if you want to keep it.</p>
        <div class="ksm-confirm-row">
          <button class="ksm-confirm-btn ksm-confirm-no"  id="ksm-cancel-btn">cancel</button>
          <button class="ksm-confirm-btn ksm-confirm-yes" id="ksm-yes-btn">yes, overwrite</button>
        </div>
      </div>
    </div>

    <div id="ksm-toast"></div>
  `;

  document.body.appendChild(ui);

  let pendingData = null;

  function toast(msg, type = '') {
    const t = document.getElementById('ksm-toast');
    t.textContent = msg;
    t.className = 'show' + (type ? ' ' + type : '');
    t.id = 'ksm-toast';
    clearTimeout(t._t);
    t._t = setTimeout(() => { t.className = ''; t.id = 'ksm-toast'; }, 3000);
  }

  document.getElementById('ksm-close-btn').onclick = () => ui.remove();
  document.getElementById('ksm-overlay').onclick   = () => ui.remove();

  document.getElementById('ksm-export-btn').onclick = () => {
    const d = localStorage.getItem(KEY);
    if (!d) { toast('nothing to export', 'err'); return; }
    download('infinite-craft-data.json', d);
    toast('exported!', 'ok');
  };

  document.getElementById('ksm-import-btn').onclick = () => {
    document.getElementById('ksm-file-input').click();
  };

  document.getElementById('ksm-file-input').onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        JSON.parse(reader.result);
        pendingData = reader.result;
        document.getElementById('ksm-confirm').classList.add('show');
      } catch {
        toast("that file isn't valid JSON", 'err');
      }
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  document.getElementById('ksm-cancel-btn').onclick = () => {
    pendingData = null;
    document.getElementById('ksm-confirm').classList.remove('show');
  };

  document.getElementById('ksm-yes-btn').onclick = () => {
    if (!pendingData) return;
    localStorage.setItem(KEY, pendingData);
    pendingData = null;
    document.getElementById('ksm-confirm').classList.remove('show');
    toast('imported! reloading...', 'ok');
    setTimeout(() => location.reload(), 1800);
  };
}

showUI();
