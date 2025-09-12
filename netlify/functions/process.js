exports.handler = async (event, context) => {
  const params = event.queryStringParameters || {};
  
  const formData = {
    name: params.name || '',
    e_mail: params.email || '',
    choose_a_package: params.package || '',
    video_add_ons: params.addons || '',
    horses_name: params.horse || '',
    choose_the_event: params.event || ''
  };

  try {
    const response = await fetch('https://hooks.zapier.com/hooks/catch/24584121/um346uh/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const result = await response.json();

    return {
      statusCode: 302,
      headers: { 'Location': result.checkout_url || 'https://bossmaremedia.com/error' }
    };
  } catch (error) {
    return {
      statusCode: 302,
      headers: { 'Location': 'https://bossmaremedia.com/error' }
    };
  }
};
