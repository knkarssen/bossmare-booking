exports.handler = async (event, context) => {
  const params = event.queryStringParameters || {};
  
  const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
  
  // Debug return to see what's happening
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/html' },
    body: `
      <h1>Debug Info</h1>
      <p><strong>Package:</strong> ${params.package || 'none'}</p>
      <p><strong>Horse:</strong> ${params.horse || 'none'}</p>
      <p><strong>Addons:</strong> ${params.addons || 'none'}</p>
      <p><strong>All Params:</strong> ${JSON.stringify(params)}</p>
      <p><strong>Stripe Key Present:</strong> ${STRIPE_SECRET_KEY ? 'YES' : 'NO'}</p>
    `
  };
};
