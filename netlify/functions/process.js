exports.handler = async (event, context) => {
  try {
    const params = event.queryStringParameters || {};
    
    const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
    
    if (!STRIPE_SECRET_KEY) {
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'text/html' },
        body: '<h1>Missing Stripe Key</h1>'
      };
    }
    
    let totalAmount = 0;
    let horseDetails = [];
    
    // Map actual Paperform field IDs to horses
    const horses = [
      { name: params.bg538, package: params.ak367, addon: params['9cov'] },      // Horse 1
      { name: params.ciq1t, package: params.endve, addon: params['4runf'] },     // Horse 2  
      { name: params.c6i0e, package: params['6t296'], addon: params.m9fk },      // Horse 3
      { name: params['3tq10'], package: params['97bea'], addon: params.b7o0r },  // Horse 4
      { name: params['1tqls'], package: params['5gesj'], addon: params.cokbc }   // Horse 5
    ];
    
    // Process each horse
    horses.forEach((horse, index) => {
      // Skip if no horse name or package
      if (!horse.name || !horse.package) return;
      
      // Clean up encoding
      let packageName = horse.package.replace(/â‚¬/g, '€');
      let addonName = (horse.addon || '').replace(/â‚¬/g, '€');
      
      let horseAmount = 500; // default
      
      // Package pricing
      if (packageName.includes('Full Coverage')) {
        horseAmount = 500;
      } else if (packageName.includes('2 Classes + Candids')) {
        horseAmount = 325;
      } else if (packageName.includes('2 Classes') && !packageName.includes('Candids')) {
        horseAmount = 250;
      } else if (packageName.includes('1 Class')) {
        horseAmount = 175;
      } else if (packageName.includes('Video') && packageName.includes('Reel')) {
        horseAmount = 500;
      }
      
      // Add-ons (only for Full Coverage)
      if (packageName.includes('Full Coverage') && addonName) {
        if (addonName.includes('Reel') && addonName.includes('Clips')) {
          horseAmount += 350;
        } else if (addonName.includes('Reel') && !addonName.includes('Clips')) {
          horseAmount += 250;
        } else if (addonName.includes('Clips') && !addonName.includes('Reel')) {
          horseAmount += 150;
        }
      }
      
      totalAmount += horseAmount;
      horseDetails.push(`${horse.name} (€${horseAmount})`);
    });
    
    // If no horses found, show debug
    if (totalAmount === 0) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'text/html' },
        body: `<h1>Debug - No Valid Horses</h1><pre>${JSON.stringify(params, null, 2)}</pre>`
      };
    }
    
    let productName = `Photography Booking - ${horseDetails.join(', ')}`;

    // Call Stripe
    const checkoutSession = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        'mode': 'payment',
        'line_items[0][price_data][currency]': 'eur',
        'line_items[0][price_data][product_data][name]': productName,
        'line_items[0][price_data][unit_amount]': (totalAmount * 100).toString(),
        'line_items[0][quantity]': '1',
        'success_url': 'https://bossmaremedia.com/booking-success',
        'cancel_url': 'https://bossmaremedia.com/booking-cancelled',
        'customer_email': params['3ac'] || '', // Real email field ID
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
