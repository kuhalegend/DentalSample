(()=>{
  let lastStamp='';
  const $x=(q,r=document)=>r.querySelector(q), $$x=(q,r=document)=>[...r.querySelectorAll(q)];
  const safe=v=>typeof esc==='function'?esc(v):String(v??'');
  const nice=v=>typeof pretty==='function'?pretty(v):String(v||'').replaceAll('_',' ');
  const when=v=>typeof dt==='function'?dt(v):(v?new Date(v).toLocaleString():'—');
  const age=v=>typeof rel==='function'?rel(v):'';
  const ini=v=>typeof initials==='function'?initials(v):String(v||'P').slice(0,2).toUpperCase();
  const badge=v=>`<span class="status-pill ${typeof sclass==='function'?sclass(v):''}">${safe(nice(v||'unknown'))}</span>`;
  const digits=v=>String(v||'').replace(/\D/g,'');

  function currentData(){try{return S?.d||null}catch{return null}}

  function navExtra(page,title,crumb){
    $$x('.page').forEach(x=>x.classList.toggle('active',x.id===`page-${page}`));
    $$x('.nav-item').forEach(x=>x.classList.remove('active'));
    $x(`[data-extra-page="${page}"]`)?.classList.add('active');
    if($x('#breadcrumb'))$x('#breadcrumb').textContent=crumb;
    if($x('#pageTitle'))$x('#pageTitle').textContent=title;
    $x('.sidebar')?.classList.remove('open');
  }

  function setupNav(){
    $$x('[data-extra-page]').forEach(b=>{if(b.dataset.bound)return;b.dataset.bound='1';b.addEventListener('click',()=>navExtra(b.dataset.extraPage,b.dataset.extraTitle,b.dataset.extraCrumb))});
    $$x('[data-page]').forEach(b=>{if(b.dataset.extraClear)return;b.dataset.extraClear='1';b.addEventListener('click',()=>$$x('[data-extra-page]').forEach(x=>x.classList.remove('active')))});
  }

  function samePhone(a,b){
    const x=digits(a),y=digits(b);if(!x||!y)return false;
    return x===y || (x.length>=10&&y.length>=10&&x.slice(-10)===y.slice(-10));
  }

  function patientAppts(patient,d){
    const email=String(patient.email||'').toLowerCase();
    return (d.appointments||[]).filter(a=>a.patient_id===patient.id || samePhone(a.patient_phone,patient.phone) || (email&&String(a.patient_email||'').toLowerCase()===email));
  }

  function patientHistory(patient,d,aps){
    const ids=new Set(aps.map(a=>a.id));
    const out=[];
    aps.forEach(a=>out.push({at:a.updated_at||a.created_at||a.starts_at,label:`Appointment · ${a.service_name||'Dental service'}`,detail:`${nice(a.status||'booked')} · ${when(a.starts_at)}`}));
    (d.communications||[]).filter(x=>x.patient_id===patient.id||ids.has(x.appointment_id)).forEach(x=>out.push({at:x.created_at,label:`${String(x.channel||'Message').toUpperCase()} · ${nice(x.direction||'event')}`,detail:x.message||nice(x.status||'recorded')}));
    (d.reminders||[]).filter(x=>ids.has(x.appointment_id)).forEach(x=>out.push({at:x.sent_at||x.updated_at||x.scheduled_at,label:`Reminder · ${nice(x.status||'queued')}`,detail:`Scheduled ${when(x.scheduled_at)}`}));
    (d.followups||[]).filter(x=>ids.has(x.appointment_id)).forEach(x=>out.push({at:x.sent_at||x.updated_at||x.scheduled_at,label:`Follow-up · ${nice(x.kind||'patient')}`,detail:nice(x.status||'queued')}));
    (d.calls||[]).filter(x=>x.patient_id===patient.id||ids.has(x.appointment_id)).forEach(x=>out.push({at:x.created_at,label:`AI call · ${nice(x.direction||'call')}`,detail:x.summary||nice(effectiveCallStatus(x))}));
    return out.filter(x=>x.at).sort((a,b)=>new Date(b.at)-new Date(a.at));
  }

  function historyMarkup(items){
    if(!items.length)return '<span class="extra-muted">No linked history yet</span>';
    return `<details class="transcript"><summary>View history (${items.length})</summary><div style="display:grid;gap:8px;margin-top:9px">${items.slice(0,30).map(x=>`<div style="padding:8px 9px;background:#f7f9f9;border-radius:9px"><strong style="display:block;font-size:9px">${safe(x.label)}</strong><small style="display:block;margin-top:3px;color:#6f818b">${safe(x.detail||'')}</small><small style="display:block;margin-top:3px;color:#9aa6ac">${safe(when(x.at))}</small></div>`).join('')}</div></details>`;
  }

  function renderPatients(){
    const d=currentData(); if(!d)return;
    const q=String($x('#patientSearch')?.value||'').toLowerCase().trim();
    const rows=(d.patients||[]).filter(p=>!q||[p.full_name,p.phone,p.email].some(v=>String(v||'').toLowerCase().includes(q))).sort((a,b)=>new Date(b.updated_at||b.created_at)-new Date(a.updated_at||a.created_at));
    const el=$x('#patientRows'); if(!el)return;
    el.innerHTML=rows.map(p=>{
      const aps=patientAppts(p,d).sort((a,b)=>new Date(b.starts_at)-new Date(a.starts_at));
      const latest=aps[0],history=patientHistory(p,d,aps);
      return `<tr><td><div class="patient-cell"><b>${safe(ini(p.full_name))}</b><span><strong>${safe(p.full_name||'Unnamed patient')}</strong><small>${safe(p.phone||'No phone')}</small></span></div></td><td>${safe(p.email||'—')}</td><td><strong>${aps.length} appointment${aps.length===1?'':'s'}</strong><small>${latest?`Latest: ${safe(when(latest.starts_at))}`:'No appointment yet'}</small>${historyMarkup(history)}</td><td>${latest?badge(latest.status):'<span class="extra-muted">—</span>'}</td><td><button class="row-button" data-book-patient="${p.id}">Book appointment →</button></td></tr>`;
    }).join('');
    if($x('#patientEmpty'))$x('#patientEmpty').hidden=!!rows.length;
    $$x('[data-book-patient]').forEach(b=>b.onclick=()=>bookPatient(b.dataset.bookPatient));
  }

  function bookPatient(id){
    const d=currentData(),p=(d?.patients||[]).find(x=>x.id===id); if(!p)return;
    if(typeof openBooking==='function')openBooking();
    const form=$x('#bookingForm'); if(!form)return;
    const set=(n,v)=>{const x=form.elements.namedItem(n);if(x)x.value=v||''};
    set('patient_name',p.full_name);set('patient_phone',p.phone);set('patient_email',p.email);
  }

  function linkedAppointment(c,d){return (d.appointments||[]).find(a=>a.id===c.appointment_id)||null}
  function linkedPatient(c,d){return (d.patients||[]).find(p=>p.id===c.patient_id)||null}
  function duration(s){const n=Number(s||0);return n?`${Math.floor(n/60)}m ${n%60}s`:'—'}
  function effectiveCallStatus(c){const s=String(c.status||'').toLowerCase();return(['queued','ringing','in-progress','in_progress'].includes(s)&&(Number(c.duration_seconds||0)>0||c.summary||c.transcript))?'ended':(c.status||'unknown')}

  function renderCalls(){
    const d=currentData();if(!d)return;
    const q=String($x('#callSearch')?.value||'').toLowerCase().trim();
    const dir=$x('#callDirection')?.value||'all';
    const calls=(d.calls||[]).filter(c=>(dir==='all'||c.direction===dir)&&(!q||[c.caller,c.callee,c.summary,c.transcript,c.status].some(v=>String(v||'').toLowerCase().includes(q)))).sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
    const el=$x('#callCards');if(!el)return;
    el.innerHTML=calls.length?calls.map(c=>{
      const p=linkedPatient(c,d),a=linkedAppointment(c,d),displayStatus=effectiveCallStatus(c);
      const who=p?.full_name||(c.direction==='inbound'?c.caller:c.callee)||'Unknown caller';
      return `<article class="call-card"><div class="call-card-top"><div class="call-who"><span class="call-avatar">${safe(ini(who))}</span><div><small>${safe((c.direction||'call').toUpperCase())} CALL</small><h3>${safe(who)}</h3><p>${safe(c.caller||'—')} → ${safe(c.callee||'—')}</p></div></div>${badge(displayStatus)}</div><div class="call-meta"><div><small>Time</small><strong>${safe(when(c.created_at))}</strong></div><div><small>Duration</small><strong>${duration(c.duration_seconds)}</strong></div><div><small>Appointment outcome</small><strong>${a?safe(nice(a.status)):'Not linked'}</strong></div><div><small>Provider call ID</small><strong>${safe(c.provider_call_id||'—')}</strong></div></div><div class="call-summary"><small>AI SUMMARY</small><p>${safe(c.summary||'No call summary has been recorded yet.')}</p></div><details class="transcript"><summary>View transcript</summary><pre>${safe(c.transcript||'No transcript available.')}</pre></details>${a?`<button class="row-button call-open-appt" data-call-appt="${a.id}">Open linked appointment →</button>`:''}</article>`;
    }).join(''):'<div class="empty-state"><span>☎</span><h3>No calls yet</h3><p>Once the live AI phone number is connected, inbound and outbound calls will appear here with summaries and transcripts.</p></div>';
    $$x('[data-call-appt]').forEach(b=>b.onclick=()=>{if(typeof openAppt==='function')openAppt(b.dataset.callAppt)});
    const live=$x('#page-calls .extra-kpi-row .extra-kpi:nth-child(2) strong');
    if(live){const v=(d.integrations||[]).find(x=>String(x.provider).toLowerCase()==='vapi');live.textContent=(v?.status==='connected'||calls.length)?'Connected':'Not connected'}
  }

  function renderExtras(){
    const d=currentData();if(!d)return;
    renderPatients();renderCalls();
    if($x('#navPatientCount'))$x('#navPatientCount').textContent=(d.patients||[]).length;
    if($x('#navCallCount'))$x('#navCallCount').textContent=(d.calls||[]).length;
    if($x('#patientCount'))$x('#patientCount').textContent=(d.patients||[]).length;
    if($x('#callCount'))$x('#callCount').textContent=(d.calls||[]).length;
  }

  function bindFilters(){
    const ps=$x('#patientSearch');if(ps&&!ps.dataset.bound){ps.dataset.bound='1';ps.addEventListener('input',renderPatients)}
    const cs=$x('#callSearch');if(cs&&!cs.dataset.bound){cs.dataset.bound='1';cs.addEventListener('input',renderCalls)}
    const cd=$x('#callDirection');if(cd&&!cd.dataset.bound){cd.dataset.bound='1';cd.addEventListener('change',renderCalls)}
  }

  setupNav();bindFilters();
  setInterval(()=>{setupNav();bindFilters();const d=currentData();if(!d)return;const stamp=[d.generated_at,(d.patients||[]).length,(d.appointments||[]).length,(d.calls||[]).length,(d.communications||[]).length,(d.followups||[]).length,(d.reminders||[]).length].join(':');if(stamp!==lastStamp){lastStamp=stamp;renderExtras()}},350);
})();