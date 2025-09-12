exports.handler = async (event, context) => {
  const params = event.queryStringParameters || {};
  
  // Get key from environment variable (secure)
  const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
  
  if (!STRIPE_SECRET_KEY) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'text/html' },
      body: '<h1>Configuration Error</h1>'
    };
  }
  
  // Price calculation
  const packagePrices = {
    'Photography / Full Coverage - €500': 500,
    'Photography / Two Classes + Candids - €325': 325,
    'Photography / Two Classes - €250': 250,
    'Photography / Single Class - €175': 175,
    'Video-Only / Clips - €350': 350,
    'Video-Only / Reel + Clips - €500': 500
  };

  const addonPrices = {
    'Video Add-On / Clips - €150': 150,
    'Video Add-On / Reel - €250': 250,
    'Video Add-On / Clips+Reel - €350': 350
  };

  const packageName = params.package || 'Photography / Full Coverage - €500';
  const addonName = params.addons || '';
  
  let totalAmount = packagePrices[packageName] || 500;
  
  if (packageName.includes('Full Coverage') && addonName) {
    totalAmount += addonPrices[addonName] || 0;
  }

  try {
    const checkoutSession = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        'mode': 'payment',
        'line_items[0][price_data][currency]': 'eur',
        'line_items[0][price_data][product_data][name]': `Photography Package - ${params.horse || 'Horse'}`,
        'line_items[0][price_data][unit_amount]': (totalAmount * 100).toString(),
        'line_items[0][quantity]': '1',
        'success_url': 'https://bossmaremedia.com/booking-success',
        'cancel_url': 'https://bossmaremedia.com/booking-cancelled',
        'customer_email': params.email || '',
        'automatic_tax[enabled]': 'true',
        'billing_address_collection': 'required'
      })
    });

    const session = await checkoutSession.json();
    
    return {
      statusCode: 302,
      headers: { 'Location': session.url }
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'text/html' },
      body: `<h1>Error</h1><p>${error.message}</p>`
    };
  }
};
