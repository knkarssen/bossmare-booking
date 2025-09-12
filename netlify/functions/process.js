exports.handler = async (event, context) => {
  const params = event.queryStringParameters || {};
  
  const formData = {
    name: params.name || '',
    e_mail: params.email || '',
    choose_a_package: params.package || '',
    video_add_ons: params.addons || '',
    horses_name: params.horse || '',
    choose_the_event: params.event || '',
    would_you_like_to_add_coverage_for_another_horse: 'No'
  };

  try {
    const response = await fetch('https://hooks.zapier.com/hooks/catch/24584121/um346uh/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const result = await response.json();
    console.log('Full Zapier result:', result);

    // Try to extract checkout URL from the Stripe step data
    // The URL should be in the response somewhere
    let checkoutUrl = null;
    
    if (typeof result === 'object') {
      // Look for common Stripe checkout URL patterns
      checkoutUrl = result.checkout_url || 
                   result.url || 
                   result.stripe_url ||
                   result.payment_url;
    }

    if (checkoutUrl && checkoutUrl.includes('checkout.stripe.com')) {
      return {
        statusCode: 302,
        headers: { 'Location': checkoutUrl }
      };
    }
    
    // If no checkout URL found, redirect to manual payment page
    return {
      statusCode: 302,
      headers: { 'Location': 'https://www.bossmaremedia.com/contact' }
    };
    
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 302,
      headers: { 'Location': 'https://www.bossmaremedia.com/contact' }
    };
  }
};
