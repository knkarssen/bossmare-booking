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
      'Photography / Full Coverage - €500': 'price_1S3wI72LaZerWfYwUMBCdcVa' //'prod_SzwAFokHYB3blK',
      'Photography / 2 Classes Candids - €325': 'price_1S3wKN2LaZerWfYweJqzbfTz' //'prod_SzwCAn3jDCrxg7',
      'Photography / 2 Classes - €250': 'price_1S3wLY2LaZerWfYwgW600Kg3' //'prod_SzwDGI4aGxixqf',
      'Photography / 1 Class - €175': 'price_1S3wMc2LaZerWfYwZTNMtJu0' //'prod_SzwFkX8GxrJsh8',
      'Video / Reel + Clips - €500': 'price_1S3wUp2LaZerWfYwogCGI8Ll' //'prod_SzwNEqoHYhs9PM',

      'Video Add-On / Reel Clips - €350': 'price_1S3wQi2LaZerWfYwGvfnTKuc' //'prod_SzwJv8yAmQGh6b',
      'Video Add-On / Reel - €250': 'price_1S3wPl2LaZerWfYwtqhZTUmg' //'prod_SzwI5Nn8zmdZZI',
      'Video Add-On / Clips - €150': 'price_1S3wOw2LaZerWfYwmtwMAod2' //'prod_SzwHgzMX9SzLXE'
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
      let addonName = (horseAddon || '').replace(/â‚¬/g, '€').replace(/\s+/g, ' ').trim();
      console.log(`${packageName in packages} '${packageName}' in packages`)
      if (packageName in packages) {
        const priceId = packages[packageName]
        console.log(`Push ${priceId}`)
        selectedProducts.push(priceId)
      }
      console.log(`${addonName in packages} '${addonName}' in packages`)
      if (addonName in packages) {
        const priceId = packages[addonName]
        selectedProducts.push(priceId)
      }
      
      // let horseAmount = 500; // default
      
      // // Package pricing (handle extra spaces)
      // if (packageName.includes('Full Coverage')) {
      //   horseAmount = 500;
      // } else if (packageName.includes('2 Classes') && packageName.includes('Candids')) {
      //   horseAmount = 325;
      // } else if (packageName.includes('2 Classes') && !packageName.includes('Candids')) {
      //   horseAmount = 250;
      // } else if (packageName.includes('1 Class')) {
      //   horseAmount = 175;
      // } else if (packageName.includes('Video') && packageName.includes('Reel')) {
      //   horseAmount = 500;
      // }
      
      // // Add-ons (only for Full Coverage)
      // if (packageName.includes('Full Coverage') && addonName) {
      //   if (addonName.includes('Reel') && addonName.includes('Clips')) {
      //     horseAmount += 350;
      //   } else if (addonName.includes('Reel') && !addonName.includes('Clips')) {
      //     horseAmount += 250;
      //   } else if (addonName.includes('Clips') && !addonName.includes('Reel')) {
      //     horseAmount += 150;
      //   }
      // }
      
      // totalAmount += horseAmount;
      // horseDetails.push(`${horseName} (€${horseAmount})`);
    }
    
    // // If no horses found, show debug
    // if (totalAmount === 0) {
    //   return {
    //     statusCode: 200,
    //     headers: { 'Content-Type': 'text/html' },
    //     body: `<h1>Still No Horses Found</h1><p>Looking for: horse1name, horse1package, etc.</p><pre>${JSON.stringify(params, null, 2)}</pre>`
    //   };
    // }
    
    // let productName = `Photography Booking - ${horseDetails.join(', ')}`;
    let productName = `Product IDs: (${selectedProducts.length}) ${selectedProducts.join(',')}`

    let searchParams = {
      'mode': 'payment',
      'success_url': 'https://bossmaremedia.com/booking-success',
      'cancel_url': 'https://bossmaremedia.com/booking-cancelled',
      'customer_email': params.email || '',
      'automatic_tax[enabled]': 'true',
      'tax_id_collection[enabled]': true
      'billing_address_collection': 'required',
    }

    for (let i = 0; i < selectedProducts.length; i++) {
      // searchParams[`line_items[${i}][price_data][currency]`] = 'eur'
      // searchParams[`line_items[${i}][price_data][product]`] = selectedProducts[i]
      // searchParams[`line_items[${i}][price_data][unit_amount]`] = 
      // searchParams[`line_items[${i}][price_data][tax_behavior]`] = 'exclusive'
      searchParams[`line_items[${i}][price]`] = selectedProducts[i]
      searchParams[`line_items[${i}][quantity]`] = 1
    }

    console.log(searchParams)

    // Call Stripe
    const checkoutSession = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams(searchParams)
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
