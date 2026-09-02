const {requireAuth,json}=require('./_auth');

exports.handler=async(event)=>{
  if(event.httpMethod!=='GET')return json(405,{error:'method_not_allowed'});
  try{
    requireAuth(event);
    const publicKey=process.env.VAPI_PUBLIC_KEY;
    const assistantId=process.env.VAPI_ASSISTANT_ID;
    if(!publicKey||!assistantId)return json(503,{error:'Riley browser demo is not configured yet.'});
    return json(200,{publicKey,assistantId,assistantName:'Riley',maxDemoSeconds:300});
  }catch(e){
    return json(e.statusCode||500,{error:e.message||'vapi_config_failed'});
  }
};
