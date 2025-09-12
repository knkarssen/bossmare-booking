exports.handler = async (event, context) => {
  try {
    const params = event.queryStringParameters || {};
    
    const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
    
    if (!STRIPE_SECRET_KEY) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'text/html' },
        body: '<h1>Missing Stripe Key</h1>'
      };
    }
    
    // Fix the euro symbol encoding issue
    let packageName = params.package || 'Photography / Full Coverage - €500';
    packageName = packageName.replace('â‚¬', '€');
    
    let totalAmount = 500;
    
    // Simple matching
    if (packageName.includes('Full Coverage')) {
      totalAmount = 500;
    } else if (packageName.includes('2 Classes + Candids')) {
      totalAmount = 325;
    } else if (packageName.includes('2 Classes')) {
      totalAmount = 250;
    } else if (packageName.includes('1 Class')) {
      totalAmount = 175;
    }

    // For now, return debug instead of calling Stripe
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html' },
      body: `
        <h1>Working!</h1>
        <p><strong>Package:</strong> ${packageName}</p>
        <p><strong>Calculated Amount:</strong> €${totalAmount}</p>
        <p><strong>Horse:</strong> ${params.horse}</p>
      `
    };

  } catch (error) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html' },
      body: `<h1>Caught Error</h1><p>${error.message}</p><p>Stack: ${error.stack}</p>`
    };
  }
};

