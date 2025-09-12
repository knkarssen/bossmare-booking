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

    let checkoutUrl = null;
    
    if (typeof result === 'object') {
      checkoutUrl = result.checkout_url || 
                   result.url || 
                   result.stripe_url ||
                   result.payment_url;
    }

    // Check for YOUR custom Stripe domain
    if (checkoutUrl && (checkoutUrl.includes('checkout.stripe.com') || checkoutUrl.includes('pay.bossmaremedia.com'))) {
      return {
        statusCode: 302,
        headers: { 'Location': checkoutUrl }
      };
    }
    
    return {
      statusCode: 302,
      headers: { 'Location': 'https://www.bossmaremedia.com/contact' }
    };
    
  } catch (error) {
    return {
      statusCode: 302,
      headers: { 'Location': 'https://www.bossmaremedia.com/contact' }
    };
  }
};
