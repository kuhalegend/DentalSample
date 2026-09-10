const { json } = require('./_auth');

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') return json(405, { error: 'method_not_allowed' });

  const publicKey = process.env.VAPI_PUBLIC_KEY;
  const assistantId = process.env.VAPI_ASSISTANT_ID;
  if (!publicKey || !assistantId) {
    return json(503, { error: 'Riley browser demo is not configured yet.' });
  }

  return json(200, {
    publicKey,
    assistantId,
    assistantName: 'Riley',
    clinicName: 'Cleggs Lane Dental Practice',
    maxDemoSeconds: 300,
  });
};
