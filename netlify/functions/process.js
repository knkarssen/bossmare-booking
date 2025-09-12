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

    const result = await response.text(); // Get as text first
    console.log('Raw response:', result);
    
    // Try to parse as JSON
    let jsonResult;
    try {
      jsonResult = JSON.parse(result);
    } catch (e) {
      // If it's not JSON, look for URL in the text
      if (result.includes('pay.bossmaremedia.com')) {
        const urlMatch = result.match(/(https:\/\/pay\.bossmaremedia\.com[^\s"'<>]+)/);
        if (urlMatch) {
          return {
            statusCode: 302,
            headers: { 'Location': urlMatch[1] }
          };
        }
      }
    }

    // If we got JSON, look for checkout_url
    if (jsonResult && jsonResult.checkout_url) {
      return {
        statusCode: 302,
        headers: { 'Location': jsonResult.checkout_url }
      };
    }

    // Search through all values for the URL
    if (jsonResult && typeof jsonResult === 'object') {
      for (const value of Object.values(jsonResult)) {
        if (typeof value === 'string' && value.includes('pay.bossmaremedia.com')) {
          return {
            statusCode: 302,
            headers: { 'Location': value }
          };
        }
      }
    }

    // If all else fails, return debug info
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html' },
      body: `<h1>Debug</h1><pre>Raw: ${result}\nParsed: ${JSON.stringify(jsonResult, null, 2)}</pre>`
    };
    
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'text/html' },
      body: `<h1>Error</h1><p>${error.message}</p>`
    };
  }
};
