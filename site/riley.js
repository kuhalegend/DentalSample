const rileyDemo={initialized:false,active:false,starting:false,startedAt:0,timer:null,vapi:null,assistantId:null,transcript:[],localAudioSeen:false,micCheckTimer:null};

function mountRileyCard(){
  if(document.querySelector('#rileyDemoCard'))return;
  const hero=document.querySelector('#page-overview .hero-row');
  if(!hero)return;
  const card=document.createElement('article');
  card.id='rileyDemoCard';
  card.className='riley-demo-card';
  card.setAttribute('aria-labelledby','rileyDemoTitle');
  card.innerHTML=`<div class="riley-demo-visual" aria-hidden="true"><div class="riley-orb"><span>R</span></div><div class="voice-wave"><i></i><i></i><i></i><i></i><i></i></div></div><div class="riley-demo-copy"><div class="riley-demo-topline"><div class="eyebrow">LIVE AI RECEPTIONIST</div><div id="rileyStatus" class="riley-status"><i></i><span>Connecting Riley…</span></div></div><h2 id="rileyDemoTitle">Talk to Riley</h2><p>Test the complete BrightSmile booking experience from your browser. Riley can check availability, create a patient, and book an appointment through the live workflow.</p><div class="riley-demo-facts"><span>🎙 Browser microphone</span><span>🔒 Restricted Riley access</span><span>↻ Auto-refresh after call</span></div><div class="riley-demo-instruction"><strong>Try saying:</strong> “I’m a new patient and I’d like to book a dental check-up this Friday afternoon.”</div><p class="riley-consent-note">Use test details only. The demo may be recorded and transcribed for testing and quality review.</p></div><div class="riley-widget-column"><div class="riley-live-readout"><small>CALL TIME</small><strong id="rileyCallTimer">00:00</strong><span id="rileyCallNote">Loading secure voice controls…</span></div><div id="rileyWidgetMount" class="riley-widget-mount" aria-live="polite"></div></div>`;
  hero.insertAdjacentElement('afterend',card);
}

function setRileyStatus(kind,label,note){
  const status=document.querySelector('#rileyStatus'),noteEl=document.querySelector('#rileyCallNote');
  if(status){status.className=`riley-status ${kind}`;const labelEl=status.querySelector('span');if(labelEl)labelEl.textContent=label}
  if(noteEl&&note)noteEl.textContent=note;
}

function setRileyTimer(seconds=0){
  const timer=document.querySelector('#rileyCallTimer');if(!timer)return;
  const safe=Math.max(0,seconds);timer.textContent=`${String(Math.floor(safe/60)).padStart(2,'0')}:${String(safe%60).padStart(2,'0')}`;
}
function startRileyTimer(){clearInterval(rileyDemo.timer);rileyDemo.startedAt=Date.now();setRileyTimer(0);rileyDemo.timer=setInterval(()=>setRileyTimer(Math.floor((Date.now()-rileyDemo.startedAt)/1000)),1000)}
function stopRileyTimer(){clearInterval(rileyDemo.timer);rileyDemo.timer=null}

function rileyErrorText(error){
  const strings=[],seen=new WeakSet(),blocked=/url|token|key|authorization|stack/i;
  const walk=(value,depth=0,key='')=>{
    if(depth>4||value==null||blocked.test(key))return;
    if(typeof value==='string'){const text=value.trim();if(text&&text!=='[object Object]')strings.push(text);return}
    if(typeof value==='number'){strings.push(String(value));return}
    if(typeof value!=='object'||seen.has(value))return;seen.add(value);
    ['message','errorMsg','reason','code','status','stage','type','error','cause','details','response','data'].forEach(name=>{if(name in value)walk(value[name],depth+1,name)});
  };
  walk(error);
  const useful=strings.find(text=>!/^(start-method-error|unknown|error)$/i.test(text));
  return String(useful||strings[0]||'').slice(0,180);
}

function rileyFriendlyError(error){
  const raw=rileyErrorText(error),lower=raw.toLowerCase();
  if(/microphone|permission|notallowed|not allowed|media device/.test(lower))return'Microphone is blocked. Allow it in Chrome and Android settings.';
  if(/notfound|not found|no device/.test(lower))return'No microphone was detected on this device.';
  if(/401|403|unauthor|invalid key|forbidden/.test(lower))return'Vapi access was rejected. Check the public key origin and Riley restriction.';
  if(/meeting|daily|transport|network|websocket|connection/.test(lower))return`Voice transport failed: ${raw}`;
  return raw?`Call could not start: ${raw}`:'Call could not start. Check microphone and network permissions.';
}

function renderRileyTranscript(){
  const box=document.querySelector('#rileyTranscript'),list=document.querySelector('#rileyTranscriptList');
  if(!box||!list)return;box.hidden=!rileyDemo.transcript.length;
  list.innerHTML=rileyDemo.transcript.slice(-8).map(item=>`<p><b>${item.role==='user'?'You':'Riley'}:</b> ${typeof esc==='function'?esc(item.text):item.text}</p>`).join('');
}

async function waitForVapiSDK(){
  const deadline=Date.now()+20000;
  while(typeof window.BrightSmileVapi!=='function'&&Date.now()<deadline)await new Promise(resolve=>setTimeout(resolve,100));
  if(typeof window.BrightSmileVapi!=='function')throw new Error('The secure voice SDK could not be loaded.');
  return window.BrightSmileVapi;
}

function mountRileyControls(mount){
  const consented=localStorage.getItem('brightsmile_riley_demo_consent')==='true';
  mount.innerHTML=`<div class="riley-call-controls"><label class="riley-consent-check"><input id="rileyConsent" type="checkbox" ${consented?'checked':''}><span>I agree to use test data and understand this call may be recorded or transcribed.</span></label><button id="rileyCallButton" class="riley-call-button" type="button" ${consented?'':'disabled'}>Start Free Demo Call</button><p id="rileyStage" class="riley-stage">Ready for a browser call</p><div id="rileyTranscript" class="riley-transcript" hidden><small>LIVE TRANSCRIPT</small><div id="rileyTranscriptList"></div></div></div>`;
  const consent=document.querySelector('#rileyConsent'),button=document.querySelector('#rileyCallButton');
  consent.addEventListener('change',()=>{if(consent.checked)localStorage.setItem('brightsmile_riley_demo_consent','true');else localStorage.removeItem('brightsmile_riley_demo_consent');button.disabled=!consent.checked||rileyDemo.starting});
  button.addEventListener('click',()=>rileyDemo.active?endRileyCall():startRileyCall());
}

function setRileyButton(label,disabled=false){const button=document.querySelector('#rileyCallButton');if(button){button.textContent=label;button.disabled=disabled}}
function setRileyStage(text){const stage=document.querySelector('#rileyStage');if(stage)stage.textContent=text}

async function startRileyCall(){
  if(rileyDemo.starting||rileyDemo.active||!rileyDemo.vapi)return;
  if(!navigator.mediaDevices?.getUserMedia){const message='This browser does not support microphone calls.';setRileyStatus('error','Demo needs attention',message);setRileyStage(message);return}
  rileyDemo.starting=true;rileyDemo.localAudioSeen=false;rileyDemo.transcript=[];renderRileyTranscript();
  setRileyButton('Connecting…',true);setRileyStatus('ready','Connecting Riley…','Allow microphone access when prompted');setRileyStage('Creating secure voice call and opening microphone');
  try{
    await rileyDemo.vapi.start(rileyDemo.assistantId);
  }catch(error){
    console.error('Riley call start failed:',error);const friendly=rileyFriendlyError(error);
    rileyDemo.starting=false;setRileyButton('Start Free Demo Call',false);setRileyStatus('error','Demo needs attention',friendly);setRileyStage(friendly);if(typeof toast==='function')toast(friendly,true);
  }
}

async function endRileyCall(){
  if(!rileyDemo.vapi)return;setRileyButton('Ending call…',true);
  try{await rileyDemo.vapi.stop()}catch(error){console.error('Riley call stop failed:',error)}
  finishRileyCall();
}

function finishRileyCall(){
  if(!rileyDemo.active&&!rileyDemo.starting)return;
  rileyDemo.active=false;rileyDemo.starting=false;rileyDemo.localAudioSeen=false;clearTimeout(rileyDemo.micCheckTimer);rileyDemo.micCheckTimer=null;document.querySelector('#rileyDemoCard')?.classList.remove('calling');stopRileyTimer();setRileyButton('Start Free Demo Call',false);setRileyStatus('ready','Call complete','Refreshing dashboard…');setRileyStage('Call ended · refreshing dashboard data');
  setTimeout(async()=>{try{if(typeof load==='function')await load(1)}catch{if(typeof toast==='function')toast('Call completed. Select Refresh to load the latest activity.',true)}finally{setRileyStatus('ready','Riley is online','Ready for another call');setRileyStage('Ready for another browser call')}},6000);
}

function activateRileyCall(){
  try{rileyDemo.vapi?.setMuted(false)}catch(error){console.warn('Could not explicitly unmute Riley microphone:',error)}
  if(!rileyDemo.active){rileyDemo.active=true;rileyDemo.starting=false;document.querySelector('#rileyDemoCard')?.classList.add('calling');setRileyButton('End Call',false);startRileyTimer()}
  setRileyStatus('live','Riley is live','Microphone is connected');setRileyStage('Connected · speak naturally');
}

function verifyRileyLocalAudio(){
  clearTimeout(rileyDemo.micCheckTimer);
  rileyDemo.micCheckTimer=setTimeout(()=>{
    if(!rileyDemo.active)return;
    try{
      const daily=rileyDemo.vapi?.getDailyCallObject?.();
      const local=daily?.participants?.()?.local;
      const audioState=local?.tracks?.audio?.state;
      const muted=rileyDemo.vapi?.isMuted?.()===true||daily?.localAudio?.()===false;
      if(muted)rileyDemo.vapi?.setMuted(false);
      if(audioState==='blocked'||audioState==='off'||audioState==='interrupted'){
        const message='Microphone track is not active. Select Allow for this site, then start a new call.';
        setRileyStatus('error','Microphone needs attention',message);setRileyStage(message);if(typeof toast==='function')toast(message,true);
      }else if(!rileyDemo.localAudioSeen){
        setRileyStage('Connected · speak now to test the microphone');
      }
    }catch(error){console.warn('Could not inspect Riley microphone track:',error)}
  },2500);
}

function bindRileyEvents(vapi){
  vapi.on('call-start-success',()=>{activateRileyCall();verifyRileyLocalAudio()});
  vapi.on('call-start',()=>{activateRileyCall();verifyRileyLocalAudio()});
  vapi.on('call-end',()=>finishRileyCall());
  vapi.on('speech-start',()=>setRileyStage('Riley is speaking'));
  vapi.on('speech-end',()=>setRileyStage('Riley is listening'));
  vapi.on('local-volume-level',level=>{if(!rileyDemo.active||Number(level)<=0.002)return;rileyDemo.localAudioSeen=true;setRileyStatus('live','Riley is live','Your microphone is working');setRileyStage('Microphone detected · Riley is listening')});
  vapi.on('message',message=>{if(message?.type==='transcript'&&message.transcriptType==='final'&&message.transcript){rileyDemo.transcript.push({role:message.role,text:message.transcript});renderRileyTranscript()}});
  vapi.on('call-start-progress',event=>{const stage=String(event?.stage||'connecting').replaceAll('-',' ');setRileyStage(`${stage} · ${event?.status||'working'}`)});
  vapi.on('call-start-failed',event=>{console.error('Riley call-start-failed:',event);const friendly=rileyFriendlyError(event);setRileyStage(friendly)});
  vapi.on('error',error=>{console.error('Riley browser call error:',error);if(rileyDemo.active)return;const friendly=rileyFriendlyError(error);rileyDemo.starting=false;setRileyButton('Start Free Demo Call',false);setRileyStatus('error','Demo needs attention',friendly);setRileyStage(friendly);if(typeof toast==='function')toast(friendly,true)});
}

async function initRileyDemo(){
  if(document.querySelector('#appView')?.hidden)return;mountRileyCard();if(rileyDemo.initialized)return;
  const mount=document.querySelector('#rileyWidgetMount');if(!mount)return;rileyDemo.initialized=true;
  try{
    const [response,Vapi]=await Promise.all([fetch('/.netlify/functions/vapi-config',{headers:{Accept:'application/json'}}),waitForVapiSDK()]);
    const config=await response.json().catch(()=>({}));if(!response.ok)throw new Error(config.error||'Riley browser demo is unavailable.');
    rileyDemo.assistantId=config.assistantId;rileyDemo.vapi=new Vapi(config.publicKey,undefined,{avoidEval:true,alwaysIncludeMicInPermissionPrompt:true},{audioSource:true,videoSource:false});bindRileyEvents(rileyDemo.vapi);mountRileyControls(mount);setRileyStatus('ready','Riley is online','Waiting for a call');
  }catch(error){rileyDemo.initialized=false;const friendly=rileyFriendlyError(error);setRileyStatus('error','Demo unavailable',friendly)}
}

const rileyAppView=document.querySelector('#appView');
if(rileyAppView)new MutationObserver(()=>initRileyDemo()).observe(rileyAppView,{attributes:true,attributeFilter:['hidden']});
document.addEventListener('DOMContentLoaded',()=>initRileyDemo());
