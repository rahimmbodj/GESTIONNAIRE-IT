const https = require('https');

const agent = new https.Agent({ rejectUnauthorized: false });
const headers = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
  'X-Api-Key': '4RbVXflSvIcUANMlVWyTGP1GC2TSfWBW'
};

// L'URL de l'API UniFi Network
const url = 'https://unifi.ui.com/network/api/s/F4E2C6E27BEF0000000007D03103000000000836FE44000000006551396D:855187386/stat/sta';

console.log('Envoi de la requête à:', url);
console.log('En-têtes:', headers);

fetch(url, {
  method: 'GET',
  headers,
  agent,
})
.then(res => {
  console.log('Status:', res.status);
  console.log('Headers:', Object.fromEntries(res.headers.entries()));
  return res.text();
})
.then(text => {
  try {
    const data = JSON.parse(text);
    console.log('Response data:', JSON.stringify(data, null, 2));
  } catch (e) {
    console.log('Response text:', text);
  }
})
.catch(err => {
  console.error('Error:', err.message);
  if (err.response) {
    console.error('Response status:', err.response.status);
    console.error('Response headers:', err.response.headers);
  }
});
