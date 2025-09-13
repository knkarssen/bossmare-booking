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

    const selectedProducts = []
    const packages = {
      'Photography / Full Coverage - €500': 'prod_SzwAFokHYB3blK',
      'Photography / 2 Classes + Candids - €325': 'prod_SzwCAn3jDCrxg7',
      'Photography / 2 Classes - €250': 'prod_SzwDGI4aGxixqf',
      'Photography / 1 Class - €175': 'prod_SzwFkX8GxrJsh8',
      'Video / Reel + Clips - €500': 'prod_SzwNEqoHYhs9PM',

      'Video Add-On / Reel + Clips - €350': 'prod_SzwJv8yAmQGh6b',
      'Video Add-On / Reel - €250': 'prod_SzwI5Nn8zmdZZI',
      'Video Add-On / Clips - €150': 'prod_SzwHgzMX9SzLXE'
    }
    console.log(packages)
    console.log(params)
    for (let i = 1; i <= 5; i++) {
      console.log(i)
      const horseName = params[`horse${i}name`];
      const horsePackage = params[`horse${i}package`];
      const horseAddon = params[`horse${i}addon`];
      console.log(horseName)
      console.log(horsePackage)
      console.log(horseAddon)
      
      // Skip if no horse name or package
      if (!horseName || !horsePackage) continue;
      
      // Clean up encoding
      let packageName = horsePackage.replace(/â‚¬/g, '€').replace(/\s+/g, ' ').trim();
      let addonName = (horseAddon || '').replace(/â‚¬/g, '€');
      console.log(`${packageName in packages} '${packageName}' in packages`)
      if (packageName in packages) {
        selectedProducts.push(packages[packageName])
      }
      console.log(`${addonName in packages} '${addonName}' in packages`)
      if (addonName in packages) {
        selectedProducts.push(packages[addonName])
      }
      
      let horseAmount = 500; // default
      
      // Package pricing (handle extra spaces)
      if (packageName.includes('Full Coverage')) {
        horseAmount = 500;
      } else if (packageName.includes('2 Classes') && packageName.includes('Candids')) {
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
      horseDetails.push(`${horseName} (€${horseAmount})`);
    }
    
    // If no horses found, show debug
    if (totalAmount === 0) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'text/html' },
        body: `<h1>Still No Horses Found</h1><p>Looking for: horse1name, horse1package, etc.</p><pre>${JSON.stringify(params, null, 2)}</pre>`
      };
    }
    
    // let productName = `Photography Booking - ${horseDetails.join(', ')}`;
    let productName = `Product IDs: (${selectedProducts.length}) ${selectedProducts.join(',')}`

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
