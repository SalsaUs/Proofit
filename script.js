/* ─── ProofIt — script.js ─── */

/* ══════════════════════════════════════════
   SHARED UTILITIES
══════════════════════════════════════════ */

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}

function getNow() {
  const now = new Date();
  return now.toLocaleDateString('en-AU') + ' ' + now.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' });
}

function makePhotoThumb(src, ts) {
  return `<div class="photo-thumb"><img src="${src}" alt="Photo"/><div class="photo-ts">${ts}</div></div>`;
}

function makePhotoAddSm(onclick) {
  return `<div class="photo-add-sm" onclick="${onclick}">
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2v12M2 8h12" stroke="#2D7DD2" stroke-width="1.8" stroke-linecap="round"/></svg>
    <span>Add</span>
  </div>`;
}

function makePhotoAddBtn(onclick) {
  return `<div class="photo-add-btn" onclick="${onclick}">
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><path d="M13 3v20M3 13h20" stroke="#2D7DD2" stroke-width="2" stroke-linecap="round"/></svg>
    <div class="photo-add-label">Take Photo</div>
  </div>`;
}


/* ══════════════════════════════════════════
   TENANT FLOW
   (runs on tenant.html)
══════════════════════════════════════════ */

if (document.getElementById('t-insp-body') !== null) {

  const T_ROOMS = [
    { id: 'living',   name: 'Living Room' },
    { id: 'kitchen',  name: 'Kitchen' },
    { id: 'bathroom', name: 'Bathroom' },
    { id: 'bedroom',  name: 'Bedroom' },
    { id: 'other',    name: 'Other' },
  ];

  let tCur = 0;
  let tPhotoTarget = null;
  const tData = {};
  T_ROOMS.forEach(r => { tData[r.id] = [{ photos: [], comment: '' }]; });

  /* ── Start ── */
  function startTenant() {
    const addr = document.getElementById('t-addr').value || '12 Collins Street';
    document.getElementById('t-insp-addr').textContent = addr.split(',')[0];
    buildTTabs();
    tRenderRoom(0);
    showScreen('s-insp');
  }

  function buildTTabs() {
    document.getElementById('t-tabs').innerHTML = T_ROOMS.map((r, i) =>
      `<div class="tab-pill ${i === 0 ? 'active' : ''}" onclick="tRenderRoom(${i})">${r.name.split(' ')[0]}</div>`
    ).join('');
  }

  function tCountEntries() {
    let total = 0;
    T_ROOMS.forEach(r => { tData[r.id].forEach(e => { if (e.photos.length || e.comment) total++; }); });
    return total;
  }

  function tUpdateCount() {
    const n = tCountEntries();
    const el = document.getElementById('t-entries-count');
    if (el) el.innerHTML = `<strong>${n} ${n === 1 ? 'entry' : 'entries'}</strong> recorded`;
  }

  /* ── Render room ── */
  function tRenderRoom(idx) {
    tCur = idx;
    document.querySelectorAll('#t-tabs .tab-pill').forEach((t, i) => {
      t.className = 'tab-pill' + (i === idx ? ' active' : i < idx ? ' done' : '');
    });
    const nextBtn = document.getElementById('t-btn-next');
    if (nextBtn) nextBtn.textContent = idx === T_ROOMS.length - 1 ? 'View My Report →' : 'Next Room →';
    tUpdateCount();

    const r = T_ROOMS[idx];
    const entries = tData[r.id];
    const ts = getNow();

    let html = '';
    entries.forEach((entry, ei) => {
      const thumbs = entry.photos.map(src => makePhotoThumb(src, ts)).join('');
      const photoSection = entry.photos.length
        ? `<div class="photo-grid">${thumbs}${makePhotoAddSm(`tTriggerPhoto('${r.id}',${ei})`)}</div>`
        : makePhotoAddBtn(`tTriggerPhoto('${r.id}',${ei})`);

      const delBtn = entries.length > 1
        ? `<button class="entry-del" onclick="tDeleteEntry('${r.id}',${ei})">Remove</button>`
        : '';

      html += `
        <div class="entry-block">
          <div class="entry-header">
            <div class="entry-label">Entry ${ei + 1}</div>
            ${delBtn}
          </div>
          ${photoSection}
          <div class="notes-label">Notes</div>
          <textarea class="comment-box" placeholder="Describe what you see…"
            onchange="tData['${r.id}'][${ei}].comment=this.value">${entry.comment}</textarea>
        </div>`;
    });

    html += `
      <div class="add-entry-block" onclick="tAddEntry('${r.id}')">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 2v12M2 8h12" stroke="#aaa" stroke-width="1.8" stroke-linecap="round"/>
        </svg>
        <div class="add-entry-label">Add another entry</div>
      </div>`;

    document.getElementById('t-insp-body').innerHTML = html;
  }

  function tAddEntry(rid) {
    tData[rid].push({ photos: [], comment: '' });
    tRenderRoom(tCur);
    setTimeout(() => {
      const b = document.getElementById('t-insp-body');
      if (b) b.scrollTop = b.scrollHeight;
    }, 50);
  }

  function tDeleteEntry(rid, idx) {
    tData[rid].splice(idx, 1);
    tRenderRoom(tCur);
  }

  function tTriggerPhoto(rid, ei) {
    tPhotoTarget = { rid, ei };
    document.getElementById('photo-input').click();
  }

  document.getElementById('photo-input').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file || !tPhotoTarget) return;
    const reader = new FileReader();
    reader.onload = ev => {
      tData[tPhotoTarget.rid][tPhotoTarget.ei].photos.push(ev.target.result);
      tRenderRoom(tCur);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  });

  function tNextRoom() {
    if (tCur < T_ROOMS.length - 1) {
      tRenderRoom(tCur + 1);
    } else {
      tBuildReport();
      showScreen('s-report');
    }
  }

  function tPrevRoom() {
    if (tCur > 0) {
      tRenderRoom(tCur - 1);
    } else {
      showScreen('s-setup');
    }
  }

  /* ── Build report ── */
  function tBuildReport() {
    const addr   = document.getElementById('t-addr').value  || '12 Collins Street, Melbourne VIC';
    const name   = document.getElementById('t-name').value  || 'Tenant';
    const email  = document.getElementById('t-email').value || '—';
    const leaseDate = document.getElementById('t-date').value
      ? new Date(document.getElementById('t-date').value).toLocaleDateString('en-AU')
      : new Date().toLocaleDateString('en-AU');
    const ts = getNow();

    let html = `
      <div class="report-header-card">
        <div class="rh-title">Proof<span class="rh-accent">It</span> Move-In Report</div>
        <div class="rh-sub">Tenant Condition Report — Personal Copy</div>
        <div class="rh-meta">
          <div class="rh-meta-item"><div class="rh-meta-label">Address</div><div class="rh-meta-value">${addr}</div></div>
          <div class="rh-meta-item"><div class="rh-meta-label">Tenant</div><div class="rh-meta-value">${name}</div></div>
          <div class="rh-meta-item"><div class="rh-meta-label">Lease start</div><div class="rh-meta-value">${leaseDate}</div></div>
          <div class="rh-meta-item"><div class="rh-meta-label">Report created</div><div class="rh-meta-value">${ts}</div></div>
        </div>
      </div>
      <div class="evidence-badge">
        <div style="font-size:18px;">🔒</div>
        <div class="evidence-badge-text">This report will be emailed to ${email} as timestamped evidence.</div>
      </div>`;

    let hasContent = false;
    T_ROOMS.forEach(r => {
      const entries = tData[r.id].filter(e => e.photos.length || e.comment);
      if (!entries.length) return;
      hasContent = true;
      html += `<div class="report-room-card"><div class="rr-header"><div class="rr-title">${r.name}</div></div>`;
      entries.forEach((entry, ei) => {
        html += `<div class="rr-entry"><div class="rr-entry-label">Entry ${ei + 1}</div>`;
        if (entry.photos.length) html += `<div class="rr-photos">${entry.photos.map(s => `<div class="rr-photo"><img src="${s}" alt=""/></div>`).join('')}</div>`;
        if (entry.comment) html += `<div class="rr-comment">"${entry.comment}"</div>`;
        html += `<div class="rr-ts">Recorded ${ts}</div></div>`;
      });
      html += `</div>`;
    });

    if (!hasContent) {
      html += `<div class="report-room-card"><div style="font-size:13px;color:#bbb;">No entries yet. Go back and add photos or notes.</div></div>`;
    }

    document.getElementById('t-report-body').innerHTML = html;
  }

  /* ── Wire up buttons ── */
  document.getElementById('t-btn-next').addEventListener('click', tNextRoom);

  const tSendBtn = document.getElementById('t-send-btn');
  if (tSendBtn) {
    tSendBtn.addEventListener('click', () => {
      const email = document.getElementById('t-email').value;
      if (email) {
        alert(`Report would be emailed to: ${email}\n\n(Email integration to be connected in production)`);
      } else {
        alert('Please enter your email address on the setup screen first.');
      }
    });
  }

  /* Expose to HTML onclick attributes */
  window.startTenant   = startTenant;
  window.tRenderRoom   = tRenderRoom;
  window.tNextRoom     = tNextRoom;
  window.tPrevRoom     = tPrevRoom;
  window.tAddEntry     = tAddEntry;
  window.tDeleteEntry  = tDeleteEntry;
  window.tTriggerPhoto = tTriggerPhoto;
  window.showScreen    = showScreen;
}


/* ══════════════════════════════════════════
   AGENT FLOW
   (runs on agent.html)
══════════════════════════════════════════ */

if (document.getElementById('a-body') !== null) {

  let inspType = 'Entry';
  let propType = 'House';
  let counters = { beds: 3, baths: 2, cars: 1 };
  let aRooms = ['Entry & Hallway', 'Living Room', 'Kitchen', 'Bathroom', 'Bedroom', 'Laundry', 'Garage / Carport', 'Exterior'];
  let aCur = 0;
  let aPhotoTarget = null;
  let aData = {};

  /* Signature */
  let sigCanvas, sigCtx, sigDrawing = false, sigHasContent = false;

  /* ── Room list init ── */
  function initRoomsList() {
    document.getElementById('rooms-list').innerHTML = aRooms.map((r, i) => `
      <div class="room-row">
        <span class="room-drag">⠿</span>
        <input class="room-row-input" value="${r}" onchange="aRooms[${i}]=this.value" />
        <button class="room-del" onclick="aRemoveRoom(${i})">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M1 1l10 10M11 1L1 11" stroke="#ccc" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>
      </div>`).join('');
  }

  function aAddRoom() {
    aRooms.push('New Room');
    initRoomsList();
  }

  function aRemoveRoom(i) {
    if (aRooms.length <= 1) return;
    aRooms.splice(i, 1);
    initRoomsList();
  }

  /* ── Type selection ── */
  document.getElementById('insp-type-grid').addEventListener('click', e => {
    const card = e.target.closest('.type-card');
    if (!card) return;
    document.querySelectorAll('#insp-type-grid .type-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    inspType = card.dataset.type;
  });

  document.getElementById('prop-type-grid').addEventListener('click', e => {
    const card = e.target.closest('.type-card');
    if (!card) return;
    document.querySelectorAll('#prop-type-grid .type-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    propType = card.dataset.prop;
  });

  /* ── Counters ── */
  document.querySelectorAll('.counter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.key;
      const delta = parseInt(btn.dataset.delta);
      counters[key] = Math.max(0, counters[key] + delta);
      document.getElementById(key + '-val').textContent = counters[key];
    });
  });

  /* ── Add room ── */
  document.getElementById('add-room-btn').addEventListener('click', aAddRoom);

  /* ── Start inspection ── */
  document.getElementById('a-start-btn').addEventListener('click', () => {
    const addr = document.getElementById('a-addr').value || '12 Collins Street';
    document.getElementById('a-addr-title').textContent = addr.split(',')[0];
    aData = {};
    aRooms.forEach(r => {
      aData[r] = [{ photos: [], comment: '', condition: '' }];
      aData[r + '__s'] = '';
    });
    buildATabs();
    aRenderRoom(0);
    showScreen('s-insp');
  });

  function buildATabs() {
    document.getElementById('a-tabs').innerHTML = aRooms.map((r, i) =>
      `<div class="tab-pill ${i === 0 ? 'active' : ''}" onclick="aRenderRoom(${i})">${r.split(' ')[0]}</div>`
    ).join('');
  }

  function aCountEntries() {
    let t = 0;
    aRooms.forEach(r => { aData[r].forEach(e => { if (e.photos.length || e.comment || e.condition) t++; }); });
    return t;
  }

  /* ── Render room ── */
  function aRenderRoom(idx) {
    aCur = idx;
    document.querySelectorAll('#a-tabs .tab-pill').forEach((t, i) => {
      t.className = 'tab-pill' + (i === idx ? ' active' : i < idx ? ' done' : '');
    });

    const pct = Math.round(((idx + 1) / aRooms.length) * 100);
    document.getElementById('a-prog').style.width = pct + '%';
    document.getElementById('a-room-ctr').textContent = `${idx + 1} of ${aRooms.length}`;
    const n = aCountEntries();
    document.getElementById('a-count').innerHTML = `<strong>${n}</strong> ${n === 1 ? 'entry' : 'entries'}`;
    document.getElementById('a-next-btn').textContent = idx === aRooms.length - 1 ? 'Sign Off →' : 'Next Room →';

    const rName = aRooms[idx];
    const entries = aData[rName];
    const summary = aData[rName + '__s'] || '';
    const ts = getNow();

    let html = '';
    entries.forEach((entry, ei) => {
      const thumbs = entry.photos.map(src => makePhotoThumb(src, ts)).join('');
      const photoSection = entry.photos.length
        ? `<div class="photo-grid">${thumbs}${makePhotoAddSm(`aTriggerPhoto('${rName}',${ei})`)}</div>`
        : makePhotoAddBtn(`aTriggerPhoto('${rName}',${ei})`);

      const delBtn = entries.length > 1
        ? `<button class="entry-del" onclick="aDeleteEntry('${rName}',${ei})">Remove</button>`
        : '';

      const c = entry.condition;
      html += `
        <div class="entry-block">
          <div class="entry-header">
            <div class="entry-label">Entry ${ei + 1}</div>
            ${delBtn}
          </div>
          ${photoSection}
          <div class="cond-pills">
            <div class="cpill ${c === 'Good' ? 'good' : ''}" onclick="aSetCond('${rName}',${ei},'Good')">Good</div>
            <div class="cpill ${c === 'Fair' ? 'fair' : ''}" onclick="aSetCond('${rName}',${ei},'Fair')">Fair</div>
            <div class="cpill ${c === 'Poor' ? 'poor' : ''}" onclick="aSetCond('${rName}',${ei},'Poor')">Poor</div>
          </div>
          <div class="notes-label">Notes</div>
          <textarea class="comment-box" placeholder="Describe what you see…"
            onchange="aData['${rName}'][${ei}].comment=this.value">${entry.comment}</textarea>
        </div>`;
    });

    html += `
      <div class="summary-block">
        <div class="summary-block-label">Overall room condition</div>
        <div class="spills">
          <div class="spill ${summary === 'Good' ? 'good' : ''}" onclick="aSetSummary('${rName}','Good')">Good</div>
          <div class="spill ${summary === 'Fair' ? 'fair' : ''}" onclick="aSetSummary('${rName}','Fair')">Fair</div>
          <div class="spill ${summary === 'Poor' ? 'poor' : ''}" onclick="aSetSummary('${rName}','Poor')">Poor</div>
        </div>
      </div>
      <div class="add-entry-block" onclick="aAddEntry('${rName}')">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 2v12M2 8h12" stroke="#aaa" stroke-width="1.8" stroke-linecap="round"/>
        </svg>
        <div class="add-entry-label">Add another entry</div>
      </div>`;

    document.getElementById('a-body').innerHTML = html;
  }

  function aSetCond(rName, ei, val) { aData[rName][ei].condition = val; aRenderRoom(aCur); }
  function aSetSummary(rName, val) { aData[rName + '__s'] = val; aRenderRoom(aCur); }

  function aAddEntry(rName) {
    aData[rName].push({ photos: [], comment: '', condition: '' });
    aRenderRoom(aCur);
    setTimeout(() => {
      const b = document.getElementById('a-body');
      if (b) b.scrollTop = b.scrollHeight;
    }, 50);
  }

  function aDeleteEntry(rName, idx) {
    aData[rName].splice(idx, 1);
    aRenderRoom(aCur);
  }

  function aTriggerPhoto(rName, ei) {
    aPhotoTarget = { rName, ei };
    document.getElementById('a-photo-input').click();
  }

  document.getElementById('a-photo-input').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file || !aPhotoTarget) return;
    const reader = new FileReader();
    reader.onload = ev => {
      aData[aPhotoTarget.rName][aPhotoTarget.ei].photos.push(ev.target.result);
      aRenderRoom(aCur);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  });

  /* ── Navigation ── */
  document.getElementById('a-next-btn').addEventListener('click', () => {
    if (aCur < aRooms.length - 1) {
      aRenderRoom(aCur + 1);
    } else {
      showScreen('s-sig');
      initSig();
    }
  });

  document.getElementById('a-prev-btn').addEventListener('click', () => {
    if (aCur > 0) aRenderRoom(aCur - 1);
    else showScreen('s-setup');
  });

  /* ── Signature ── */
  function initSig() {
    sigCanvas = document.getElementById('sig-canvas');
    sigCtx = sigCanvas.getContext('2d');
    sigCtx.strokeStyle = '#1a1a1e';
    sigCtx.lineWidth = 2.5;
    sigCtx.lineCap = 'round';
    sigCtx.lineJoin = 'round';

    const getPos = (e, r) => ({
      x: (e.clientX - r.left) * (sigCanvas.width / r.width),
      y: (e.clientY - r.top) * (sigCanvas.height / r.height)
    });
    const getTouchPos = (e, r) => ({
      x: (e.touches[0].clientX - r.left) * (sigCanvas.width / r.width),
      y: (e.touches[0].clientY - r.top) * (sigCanvas.height / r.height)
    });

    sigCanvas.onmousedown = e => {
      sigDrawing = true;
      const p = getPos(e, sigCanvas.getBoundingClientRect());
      sigCtx.beginPath(); sigCtx.moveTo(p.x, p.y);
    };
    sigCanvas.onmousemove = e => {
      if (!sigDrawing) return;
      sigHasContent = true;
      const p = getPos(e, sigCanvas.getBoundingClientRect());
      sigCtx.lineTo(p.x, p.y); sigCtx.stroke();
    };
    sigCanvas.onmouseup = () => sigDrawing = false;

    sigCanvas.ontouchstart = e => {
      e.preventDefault(); sigDrawing = true;
      const p = getTouchPos(e, sigCanvas.getBoundingClientRect());
      sigCtx.beginPath(); sigCtx.moveTo(p.x, p.y);
    };
    sigCanvas.ontouchmove = e => {
      e.preventDefault(); if (!sigDrawing) return;
      sigHasContent = true;
      const p = getTouchPos(e, sigCanvas.getBoundingClientRect());
      sigCtx.lineTo(p.x, p.y); sigCtx.stroke();
    };
    sigCanvas.ontouchend = () => sigDrawing = false;
  }

  document.getElementById('sig-clear-btn').addEventListener('click', () => {
    if (sigCtx) sigCtx.clearRect(0, 0, sigCanvas.width, sigCanvas.height);
    sigHasContent = false;
  });

  /* ── View report ── */
  document.getElementById('a-view-report-btn').addEventListener('click', () => {
    aBuildReport();
    showScreen('s-report');
  });

  function aBuildReport() {
    const addr       = document.getElementById('a-addr').value   || '12 Collins Street, Melbourne VIC';
    const agent      = document.getElementById('a-agent').value  || 'Agent';
    const agency     = document.getElementById('a-agency').value || 'Agency';
    const tenantName = document.getElementById('a-tenant-name').value || '';
    const ts = getNow();

    let html = `
      <div class="report-header-card">
        <div class="rh-title">Proof<span class="rh-accent">It</span> Inspection Report</div>
        <div class="rh-sub">${inspType} Condition Report</div>
        <div class="rh-meta">
          <div class="rh-meta-item"><div class="rh-meta-label">Address</div><div class="rh-meta-value">${addr}</div></div>
          <div class="rh-meta-item"><div class="rh-meta-label">Agent</div><div class="rh-meta-value">${agent} — ${agency}</div></div>
          <div class="rh-meta-item"><div class="rh-meta-label">Property</div><div class="rh-meta-value">${propType} · ${counters.beds}bd ${counters.baths}ba ${counters.cars}car</div></div>
          <div class="rh-meta-item"><div class="rh-meta-label">Created</div><div class="rh-meta-value">${ts}</div></div>
        </div>
      </div>`;

    aRooms.forEach(rName => {
      const entries = aData[rName].filter(e => e.photos.length || e.comment || e.condition);
      const summary = aData[rName + '__s'] || '';
      if (!entries.length && !summary) return;

      const sbClass = summary === 'Good' ? 'rr-good' : summary === 'Poor' ? 'rr-poor' : summary ? 'rr-fair' : '';
      html += `<div class="report-room-card">
        <div class="rr-header">
          <div class="rr-title">${rName}</div>
          ${summary ? `<div class="rr-badge ${sbClass}">${summary}</div>` : ''}
        </div>`;

      entries.forEach((entry, ei) => {
        const cc = entry.condition === 'Good' ? 'rr-good' : entry.condition === 'Poor' ? 'rr-poor' : entry.condition ? 'rr-fair' : '';
        html += `<div class="rr-entry">
          <div class="rr-entry-label">
            Entry ${ei + 1}
            ${entry.condition ? `<span class="rr-cond ${cc}">${entry.condition}</span>` : ''}
          </div>`;
        if (entry.photos.length) html += `<div class="rr-photos">${entry.photos.map(s => `<div class="rr-photo"><img src="${s}" alt=""/></div>`).join('')}</div>`;
        if (entry.comment) html += `<div class="rr-comment">"${entry.comment}"</div>`;
        html += `<div class="rr-ts">Recorded ${ts}</div></div>`;
      });
      html += `</div>`;
    });

    if (sigHasContent) {
      html += `
        <div class="sig-preview-wrap">
          <div class="sig-preview-label">Agent signature — ${agent}</div>
          <img class="sig-preview-img" src="${sigCanvas.toDataURL()}" alt="Signature"/>
          <div style="font-size:11px;color:#bbb;margin-top:4px;">${tenantName ? 'Tenant: ' + tenantName + ' · ' : ''}Signed ${ts}</div>
        </div>`;
    }

    document.getElementById('a-report').innerHTML = html;
  }

  /* ── Send / forward buttons ── */
  document.getElementById('a-send-btn').addEventListener('click', () => {
    const agent = document.getElementById('a-agent').value || 'agent';
    alert(`Report would be emailed to ${agent}.\n\n(Email integration to be connected in production)`);
  });

  document.getElementById('a-fwd-btn').addEventListener('click', () => {
    const email = document.getElementById('a-tenant-email').value;
    if (email) {
      alert(`Report would be forwarded to tenant: ${email}\n\n(Email integration to be connected in production)`);
    } else {
      alert('No tenant email entered. Go back to the Sign Off screen to add one.');
    }
  });

  /* ── Expose to HTML onclick attributes ── */
  window.aRenderRoom   = aRenderRoom;
  window.aAddEntry     = aAddEntry;
  window.aDeleteEntry  = aDeleteEntry;
  window.aSetCond      = aSetCond;
  window.aSetSummary   = aSetSummary;
  window.aTriggerPhoto = aTriggerPhoto;
  window.aRemoveRoom   = aRemoveRoom;
  window.showScreen    = showScreen;

  /* ── Init ── */
  initRoomsList();
}
