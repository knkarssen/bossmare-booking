exports.handler = async (event, context) => {
  const params = event.queryStringParameters || {};
  
  const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
  
  if (!STRIPE_SECRET_KEY) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'text/html' },
      body: '<h1>Configuration Error</h1>'
    };
  }
  
  // More flexible price matching
  const packageName = params.package || 'Photography / Full Coverage - €500';
  let totalAmount = 500; // default
  
  // Simple matching logic
  if (packageName.includes('Full Coverage')) {
    totalAmount = 500;
  } else if (packageName.includes('Two Classes + Candids')) {
    totalAmount = 325;
  } else if (packageName.includes('Two Classes')) {
    totalAmount = 250;
  } else if (packageName.includes('Single Class')) {
    totalAmount = 175;
  } else if (packageName.includes('Video-Only') && packageName.includes('Clips')) {
    totalAmount = 350;
  } else if (packageName.includes('Video-Only') && packageName.includes('Reel')) {
    totalAmount = 500;
  }

  // Add-ons (only for Full Coverage)
  const addonName = params.addons || '';
  if (packageName.includes('Full Coverage') && addonName) {
    if (addonName.includes('Clips') && addonName.includes('Reel')) {
      totalAmount += 350;
    } else if (addonName.includes('Reel')) {
      totalAmount += 250;
    } else if (addonName.includes('Clips')) {
      totalAmount += 150;
    }
  }

  console.log('Package:', packageName, 'Total:', totalAmount);

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
        'line_items[0][price_data][product_data][name]': `Photography Package - ${params.horse || 'Package'}`,
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
    
    if (session.url) {
      return {
        statusCode: 302,
        headers: { 'Location': session.url }
      };
    } else {
      throw new Error('No checkout URL returned');
    }

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'text/html' },
      body: `<h1>Error</h1><p>Package: ${packageName}</p><p>Error: ${error.message}</p>`
    };
  }
};
