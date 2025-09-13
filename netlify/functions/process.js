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
    // const packages = {
    //   'Photography / Full Coverage - €500': 'price_1S3wI72LaZerWfYwUMBCdcVa', //'prod_SzwAFokHYB3blK',
    //   'Photography / 2 Classes Candids - €325': 'price_1S3wKN2LaZerWfYweJqzbfTz', //'prod_SzwCAn3jDCrxg7',
    //   'Photography / 2 Classes - €250': 'price_1S3wLY2LaZerWfYwgW600Kg3', //'prod_SzwDGI4aGxixqf',
    //   'Photography / 1 Class - €175': 'price_1S3wMc2LaZerWfYwZTNMtJu0', //'prod_SzwFkX8GxrJsh8',
    //   'Video / Reel + Clips - €500': 'price_1S3wUp2LaZerWfYwogCGI8Ll', //'prod_SzwNEqoHYhs9PM',

    //   'Video Add-On / Reel Clips - €350': 'price_1S3wQi2LaZerWfYwGvfnTKuc', //'prod_SzwJv8yAmQGh6b',
    //   'Video Add-On / Reel - €250': 'price_1S3wPl2LaZerWfYwtqhZTUmg', //'prod_SzwI5Nn8zmdZZI',
    //   'Video Add-On / Clips - €150': 'price_1S3wOw2LaZerWfYwmtwMAod2' //'prod_SzwHgzMX9SzLXE'
    // }
    let packages = {
      'Photography / Full Coverage - €500': 'prod_SzwAFokHYB3blK',
      'Photography / 2 Classes Candids - €325': 'prod_SzwCAn3jDCrxg7',
      'Photography / 2 Classes - €250': 'prod_SzwDGI4aGxixqf',
      'Photography / 1 Class - €175': 'prod_SzwFkX8GxrJsh8',
      'Video / Reel + Clips - €500': 'prod_SzwNEqoHYhs9PM',

      'Video Add-On / Reel Clips - €350': 'prod_SzwJv8yAmQGh6b',
      'Video Add-On / Reel - €250': 'prod_SzwI5Nn8zmdZZI',
      'Video Add-On / Clips - €150': 'prod_SzwHgzMX9SzLXE'
    }
    console.log(packages)
    console.log(params)

    const searchParams2 = {}

    for (const idx in Object.values(packages)) {
      searchParams2[`ids[${idx}]`] = packages[idx]
    }
    console.log(searchParams2)

    const checkoutSession1 = await fetch('https://api.stripe.com/v1/products', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams(searchParams2)
    });
    const products = await checkoutSession1.json().data;
    for (const pckge in packages) {
      for (const product of products) {
        if (packages[pckge] == product.id) {
          packages[pckge] = product.default_price
          break 
        }
      }
    }
    console.log("NEW DICT")
    console.log(packages)

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

    }
    
    let searchParams = {
      'mode': 'payment',
      'success_url': 'https://bossmaremedia.com/booking-success',
      'cancel_url': 'https://bossmaremedia.com/booking-cancelled',
      'customer_email': params.email || '',
      'automatic_tax[enabled]': 'true',
      'tax_id_collection[enabled]': true,
      'billing_address_collection': 'required'
    }

    for (let i = 0; i < selectedProducts.length; i++) {
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
