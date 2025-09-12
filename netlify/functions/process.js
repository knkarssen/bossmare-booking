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
    console.log('Zapier result:', result);

    if (result.checkout_url) {
      return {
        statusCode: 302,
        headers: { 
          'Location': result.checkout_url,
          'Cache-Control': 'no-cache'
        }
      };
    }
    
    // If no checkout URL, show debug info
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html' },
      body: `<h1>Debug</h1><p>Response: ${JSON.stringify(result)}</p>`
    };
    
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'text/html' },
      body: `<h1>Error</h1><p>${error.message}</p>`
    };
  }
};
