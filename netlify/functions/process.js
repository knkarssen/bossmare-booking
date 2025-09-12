exports.handler = async (event, context) => {
  try {
    const params = event.queryStringParameters || {};
    
    let packageName = params.package || '';
    packageName = packageName.replace(/â‚¬/g, '€');
    
    let addonName = params.addons || '';
    addonName = addonName.replace(/â‚¬/g, '€');
    
    let totalAmount = 500;
    
    // Check package matching
    if (packageName.includes('Full Coverage')) {
      totalAmount = 500;
    }

    // Debug the add-on matching
    let addonAmount = 0;
    let addonDebug = '';
    
    if (packageName.includes('Full Coverage') && addonName && addonName !== 'none') {
      addonDebug = `Checking add-on: "${addonName}"`;
      
      if (addonName.includes('Reel + Clips')) {
        addonAmount = 350;
        addonDebug += ' → Found Reel + Clips (+350)';
      } else if (addonName.includes('Reel') && !addonName.includes('Clips')) {
        addonAmount = 250;
        addonDebug += ' → Found Reel only (+250)';
      } else if (addonName.includes('Clips') && !addonName.includes('Reel')) {
        addonAmount = 150;
        addonDebug += ' → Found Clips only (+150)';
      } else {
        addonDebug += ' → NO MATCH FOUND!';
      }
      
      totalAmount += addonAmount;
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html' },
      body: `
        <h1>Add-on Debug</h1>
        <p><strong>Package:</strong> "${packageName}"</p>
        <p><strong>Add-on Raw:</strong> "${params.addons}"</p>
        <p><strong>Add-on Cleaned:</strong> "${addonName}"</p>
        <p><strong>Add-on Debug:</strong> ${addonDebug}</p>
        <p><strong>Package Amount:</strong> €500</p>
        <p><strong>Add-on Amount:</strong> €${addonAmount}</p>
        <p><strong>Total:</strong> €${totalAmount}</p>
      `
    };

  } catch (error) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html' },
      body: `<h1>Error</h1><p>${error.message}</p>`
    };
  }
};

