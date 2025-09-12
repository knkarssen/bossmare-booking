exports.handler = async (event, context) => {
  const params = event.queryStringParameters || {};
  
  // Debug what the actual form sends
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/html' },
    body: `
      <h1>Real Form Debug</h1>
      <p><strong>All Parameters:</strong></p>
      <pre>${JSON.stringify(params, null, 2)}</pre>
      <p><strong>Parameter Names:</strong></p>
      <ul>
        ${Object.keys(params).map(key => `<li>${key}: "${params[key]}"</li>`).join('')}
      </ul>
    `
  };
};
