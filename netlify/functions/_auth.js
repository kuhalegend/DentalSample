const crypto=require('crypto');
const COOKIE='dental_demo_session';
function b64(v){return Buffer.from(v).toString('base64url')}
function unb64(v){return Buffer.from(v,'base64url').toString('utf8')}
function sign(payload,secret){return crypto.createHmac('sha256',secret).update(payload).digest('base64url')}
function safeEqual(a,b){a=Buffer.from(String(a));b=Buffer.from(String(b));if(a.length!==b.length)return false;return crypto.timingSafeEqual(a,b)}
function secret(){const s=process.env.DASHBOARD_SESSION_SECRET;if(!s||s.length<24)throw new Error('dashboard_session_secret_not_configured');return s}
function issueSession(username){const payload=b64(JSON.stringify({u:username,exp:Date.now()+8*60*60*1000}));return `${payload}.${sign(payload,secret())}`}
function parseCookies(header=''){return Object.fromEntries(header.split(';').map(x=>x.trim()).filter(Boolean).map(x=>{const i=x.indexOf('=');return i<0?[x,'']:[x.slice(0,i),decodeURIComponent(x.slice(i+1))]}))}
function verify(event){try{const token=parseCookies(event.headers.cookie||event.headers.Cookie||'')[COOKIE];if(!token)return null;const [payload,sig]=token.split('.');if(!payload||!sig||!safeEqual(sig,sign(payload,secret())))return null;const data=JSON.parse(unb64(payload));if(!data.exp||data.exp<Date.now())return null;return data}catch{return null}}
function requireAuth(event){const s=verify(event);if(!s){const e=new Error('unauthorized');e.statusCode=401;throw e}return s}
function cookie(token,maxAge=28800){const secure=process.env.CONTEXT==='dev'?'':' Secure;';return `${COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly;${secure} SameSite=Lax; Max-Age=${maxAge}`}
function json(statusCode,body,headers={}){return{statusCode,headers:{'Content-Type':'application/json','Cache-Control':'no-store',...headers},body:JSON.stringify(body)}}
module.exports={safeEqual,issueSession,requireAuth,verify,cookie,json,COOKIE};