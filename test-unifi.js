const https = require('https');
const fetch = require('node-fetch');

const agent = new https.Agent({ rejectUnauthorized: false });
const headers = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
  'X-CSRF-Token': 'true',
  'X-Api-Key': '4RbVXflSvIcUANMlVWyTGP1GC2TSfWBW'
};

fetch('https://unifi.ui.com/proxy/network/api/s/F4E2C6E27BEF0000000007D03103000000000836FE44000000006551396D:855187386/stat/sta', {
  headers,
  agent
})
.then(res => res.text())
.then(text => console.log('Response:', text))
.catch(err => console.error('Error:', err));
