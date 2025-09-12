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
  
  // Fix the euro symbol encoding issue
  let packageName = params.package || 'Photography / Full Coverage - €500';
  packageName = packageName.replace('â‚¬', '€'); // Fix encoding
  
  let totalAmount = 500; // default
  
  // Match packages (now with fixed euro symbols)
  if (packageName.includes('Full Coverage')) {
    totalAmount = 500;
  } else if (packageName.includes('2 Classes + Candids')) {
    totalAmount = 325;
  } else if (packageName.includes('2 Classes') && !packageName.includes('Candids')) {
    totalAmount = 250;
  } else if (packageName.includes('1 Class')) {
    totalAmount = 175;
  } else if (packageName.includes('Video') && packageName.includes('Reel + Clips')) {
    totalAmount = 500;
  }

  // Add-ons (only for Full Coverage)
  let addonName = params.addons || '';
  addonName = addonName.replace('â‚¬', '€'); // Fix encoding
  
  if (packageName.includes('Full Coverage') && addonName && addonName !== 'none') {
    if (addonName.includes('Reel + Clips')) {
      totalAmount += 350;
    } else if (addonName.includes('Reel') && !addonName.includes('Clips')) {
      totalAmount += 250;
    } else if (addonName.includes('Clips') && !addonName.includes('Reel')) {
      totalAmount += 150;
    }
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
