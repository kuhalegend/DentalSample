const rileyDemo={initialized:false,active:false,startedAt:0,timer:null,maxSeconds:300};

function mountRileyCard(){
  if(document.querySelector('#rileyDemoCard'))return;
  const hero=document.querySelector('#page-overview .hero-row');
  if(!hero)return;
  const card=document.createElement('article');
  card.id='rileyDemoCard';
  card.className='riley-demo-card';
  card.setAttribute('aria-labelledby','rileyDemoTitle');
  card.innerHTML=`<div class="riley-demo-visual" aria-hidden="true"><div class="riley-orb"><span>R</span></div><div class="voice-wave"><i></i><i></i><i></i><i></i><i></i></div></div><div class="riley-demo-copy"><div class="riley-demo-topline"><div class="eyebrow">LIVE AI RECEPTIONIST</div><div id="rileyStatus" class="riley-status"><i></i><span>Connecting Riley…</span></div></div><h2 id="rileyDemoTitle">Talk to Riley</h2><p>Test the complete BrightSmile booking experience from your browser. Riley can check availability, create a patient, and book an appointment through the live workflow.</p><div class="riley-demo-facts"><span>🎙 Browser microphone</span><span>⏱ 5-minute demo limit</span><span>↻ Auto-refresh after call</span></div><div class="riley-demo-instruction"><strong>Try saying:</strong> “I’m a new patient and I’d like to book a dental check-up this Friday afternoon.”</div><p class="riley-consent-note">Use test details only. The demo may be recorded and transcribed for testing and quality review.</p></div><div class="riley-widget-column"><div class="riley-live-readout"><small>CALL TIME</small><strong id="rileyCallTimer">00:00</strong><span id="rileyCallNote">Loading voice controls…</span></div><div id="rileyWidgetMount" class="riley-widget-mount" aria-live="polite"></div></div>`;
  hero.insertAdjacentElement('afterend',card);
}

function setRileyStatus(kind,label,note){
  const status=document.querySelector('#rileyStatus');
  const noteEl=document.querySelector('#rileyCallNote');
  if(status){status.className=`riley-status ${kind}`;const labelEl=status.querySelector('span');if(labelEl)labelEl.textContent=label}
  if(noteEl&&note)noteEl.textContent=note;
}

function setRileyTimer(seconds=0){
  const timer=document.querySelector('#rileyCallTimer');
  if(!timer)return;
  const safe=Math.max(0,Math.min(seconds,rileyDemo.maxSeconds));
  timer.textContent=`${String(Math.floor(safe/60)).padStart(2,'0')}:${String(safe%60).padStart(2,'0')}`;
}

function startRileyTimer(){clearInterval(rileyDemo.timer);rileyDemo.startedAt=Date.now();setRileyTimer(0);rileyDemo.timer=setInterval(()=>setRileyTimer(Math.floor((Date.now()-rileyDemo.startedAt)/1000)),1000)}
function stopRileyTimer(){clearInterval(rileyDemo.timer);rileyDemo.timer=null}

async function initRileyDemo(){
  if(document.querySelector('#appView')?.hidden)return;
  mountRileyCard();
  if(rileyDemo.initialized)return;
  const mount=document.querySelector('#rileyWidgetMount');
  if(!mount)return;
  rileyDemo.initialized=true;
  try{
    const response=await fetch('/.netlify/functions/vapi-config',{headers:{Accept:'application/json'}});
    const config=await response.json().catch(()=>({}));
    if(!response.ok)throw new Error(config.error||'Riley browser demo is unavailable.');
    rileyDemo.maxSeconds=Math.min(300,Number(config.maxDemoSeconds)||300);
    await Promise.race([customElements.whenDefined('vapi-widget'),new Promise((_,reject)=>setTimeout(()=>reject(new Error('Voice controls could not be loaded.')),10000))]);
    const widget=document.createElement('vapi-widget');
    const attributes={
      'public-key':config.publicKey,'assistant-id':config.assistantId,'assistant-overrides':JSON.stringify({maxDurationSeconds:rileyDemo.maxSeconds}),mode:'voice',theme:'dark',size:'full',radius:'large',position:'bottom-right','base-color':'#071824','accent-color':'#59d3ba','button-base-color':'#0b2736','button-accent-color':'#ffffff','main-label':'Talk to Riley','start-button-text':'Start Free Demo Call','end-button-text':'End Call','empty-voice-message':'Allow microphone access, then speak naturally with Riley.','show-transcript':'true','require-consent':'true','terms-content':'This is a test environment. Do not share real patient or medical information. Calls may be recorded and transcribed for testing and quality review.','local-storage-key':'brightsmile_riley_demo_consent'
    };
    Object.entries(attributes).forEach(([name,value])=>widget.setAttribute(name,value));
    widget.addEventListener('call-start',()=>{rileyDemo.active=true;document.querySelector('#rileyDemoCard')?.classList.add('calling');setRileyStatus('live','Riley is live','Speak naturally');startRileyTimer()});
    widget.addEventListener('call-end',()=>{rileyDemo.active=false;document.querySelector('#rileyDemoCard')?.classList.remove('calling');stopRileyTimer();setRileyStatus('ready','Call complete','Refreshing dashboard…');setTimeout(async()=>{try{if(typeof load==='function')await load(1)}catch{if(typeof toast==='function')toast('Call completed. Select Refresh to load the latest activity.',true)}finally{setRileyStatus('ready','Riley is online','Ready for another call')}},6000)});
    widget.addEventListener('error',event=>{rileyDemo.active=false;document.querySelector('#rileyDemoCard')?.classList.remove('calling');stopRileyTimer();const message=String(event.detail?.message||event.detail||'Voice call could not start.');const friendly=/microphone|permission/i.test(message)?'Allow microphone access, then try again.':'Check your connection and try again.';setRileyStatus('error','Demo needs attention',friendly);if(typeof toast==='function')toast(friendly,true)});
    mount.appendChild(widget);
    setRileyStatus('ready','Riley is online','Waiting for a call');
  }catch(error){
    rileyDemo.initialized=false;
    setRileyStatus('error','Demo unavailable',error.message||'Check the Vapi demo configuration.');
  }
}

const rileyAppView=document.querySelector('#appView');
if(rileyAppView)new MutationObserver(()=>initRileyDemo()).observe(rileyAppView,{attributes:true,attributeFilter:['hidden']});
document.addEventListener('DOMContentLoaded',()=>initRileyDemo());
