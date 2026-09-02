const rileyDemo={initialized:false,active:false,startedAt:0,timer:null,maxSeconds:300,widget:null};

function mountRileyCard(){
  if(document.querySelector('#rileyDemoCard'))return;
  const hero=document.querySelector('#page-overview .hero-row');
  if(!hero)return;
  const card=document.createElement('article');
  card.id='rileyDemoCard';
  card.className='riley-demo-card';
  card.setAttribute('aria-labelledby','rileyDemoTitle');
  card.innerHTML=`<div class="riley-demo-visual" aria-hidden="true"><div class="riley-orb"><span>R</span></div><div class="voice-wave"><i></i><i></i><i></i><i></i><i></i></div></div><div class="riley-demo-copy"><div class="riley-demo-topline"><div class="eyebrow">LIVE AI RECEPTIONIST</div><div id="rileyStatus" class="riley-status"><i></i><span>Connecting Riley…</span></div></div><h2 id="rileyDemoTitle">Talk to Riley</h2><p>Test the complete BrightSmile booking experience from your browser. Riley can check availability, create a patient, and book an appointment through the live workflow.</p><div class="riley-demo-facts"><span>🎙 Browser microphone</span><span>🔒 Restricted Riley access</span><span>↻ Auto-refresh after call</span></div><div class="riley-demo-instruction"><strong>Try saying:</strong> “I’m a new patient and I’d like to book a dental check-up this Friday afternoon.”</div><p class="riley-consent-note">Use test details only. The demo may be recorded and transcribed for testing and quality review.</p></div><div class="riley-widget-column"><div class="riley-live-readout"><small>CALL TIME</small><strong id="rileyCallTimer">00:00</strong><span id="rileyCallNote">Loading voice controls…</span></div><div id="rileyWidgetMount" class="riley-widget-mount" aria-live="polite"></div></div>`;
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
  const safe=Math.max(0,seconds);
  timer.textContent=`${String(Math.floor(safe/60)).padStart(2,'0')}:${String(safe%60).padStart(2,'0')}`;
}

function startRileyTimer(){clearInterval(rileyDemo.timer);rileyDemo.startedAt=Date.now();setRileyTimer(0);rileyDemo.timer=setInterval(()=>setRileyTimer(Math.floor((Date.now()-rileyDemo.startedAt)/1000)),1000)}
function stopRileyTimer(){clearInterval(rileyDemo.timer);rileyDemo.timer=null}

async function waitForRileyWidgetLoader(){
  const deadline=Date.now()+10000;
  while(typeof window.WidgetLoader!=='function'&&Date.now()<deadline)await new Promise(resolve=>setTimeout(resolve,100));
  if(typeof window.WidgetLoader!=='function')throw new Error('Voice controls could not be loaded.');
  return window.WidgetLoader;
}

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
    const WidgetLoader=await waitForRileyWidgetLoader();
    const onCallStart=()=>{rileyDemo.active=true;document.querySelector('#rileyDemoCard')?.classList.add('calling');setRileyStatus('live','Riley is live','Speak naturally');startRileyTimer()};
    const onCallEnd=()=>{rileyDemo.active=false;document.querySelector('#rileyDemoCard')?.classList.remove('calling');stopRileyTimer();setRileyStatus('ready','Call complete','Refreshing dashboard…');setTimeout(async()=>{try{if(typeof load==='function')await load(1)}catch{if(typeof toast==='function')toast('Call completed. Select Refresh to load the latest activity.',true)}finally{setRileyStatus('ready','Riley is online','Ready for another call')}},6000)};
    const onError=error=>{rileyDemo.active=false;document.querySelector('#rileyDemoCard')?.classList.remove('calling');stopRileyTimer();const message=String(error?.message||error||'Voice call could not start.');const friendly=/microphone|permission/i.test(message)?'Allow microphone access, then try again.':'Check your connection and try again.';setRileyStatus('error','Demo needs attention',friendly);if(typeof toast==='function')toast(friendly,true)};
    rileyDemo.widget=new WidgetLoader({
      container:mount,
      component:'VapiWidget',
      props:{publicKey:config.publicKey,assistantId:config.assistantId,mode:'voice',theme:'dark',size:'compact',radius:'large',position:'bottom-right',baseColor:'#071824',accentColor:'#59d3ba',buttonBaseColor:'#0b2736',buttonAccentColor:'#ffffff',mainLabel:'Talk to Riley',startButtonText:'Start Free Demo Call',endButtonText:'End Call',emptyVoiceMessage:'Allow microphone access, then speak naturally with Riley.',showTranscript:true,requireConsent:true,termsContent:'This is a test environment. Do not share real patient or medical information. Calls may be recorded and transcribed for testing and quality review.',localStorageKey:'brightsmile_riley_demo_consent',onCallStart,onCallEnd,onError}
    });
    setRileyStatus('ready','Riley is online','Waiting for a call');
  }catch(error){
    rileyDemo.initialized=false;
    setRileyStatus('error','Demo unavailable',error.message||'Check the Vapi demo configuration.');
  }
}

const rileyAppView=document.querySelector('#appView');
if(rileyAppView)new MutationObserver(()=>initRileyDemo()).observe(rileyAppView,{attributes:true,attributeFilter:['hidden']});
document.addEventListener('DOMContentLoaded',()=>initRileyDemo());
