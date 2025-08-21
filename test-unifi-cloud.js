const https = require('https');
const nodeFetch = import('node-fetch');

const agent = new https.Agent({ rejectUnauthorized: false });

async function authenticateUnifiCloud() {
  const { default: fetch } = await nodeFetch;
  console.log('Tentative d\'authentification UniFi Cloud...');
  
  try {
    const loginResponse = await fetch('https://account.ui.com/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        username: 'WifiUAM',
        password: '@cceswifi0823'
      }),
      agent
    });

    console.log('Statut de la réponse:', loginResponse.status);
    const cookies = loginResponse.headers.raw()['set-cookie'];
    console.log('Cookies reçus:', cookies);

    if (loginResponse.ok) {
      const data = await loginResponse.json();
      console.log('Données de connexion:', JSON.stringify(data, null, 2));
      return data;
    } else {
      const errorText = await loginResponse.text();
      console.error('Erreur d\'authentification:', errorText);
      throw new Error(`Échec de l'authentification: ${loginResponse.status}`);
    }
  } catch (error) {
    console.error('Erreur lors de l\'authentification:', error);
    throw error;
  }
}

async function getUnifiDevices(authData) {
  const { default: fetch } = await nodeFetch;
  try {
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-CSRF-Token': authData.csrf_token || '',
      'Authorization': `Bearer ${authData.access_token}`,
      'X-Api-Key': '4RbVXflSvIcUANMlVWyTGP1GC2TSfWBW'
    };

    console.log('En-têtes de la requête devices:', headers);

    const devicesResponse = await fetch('https://account.ui.com/api/app/unifi/proxy/network/api/s/F4E2C6E27BEF0000000007D03103000000000836FE44000000006551396D:855187386/stat/sta', {
      headers,
      agent
    });

    console.log('Statut de la réponse devices:', devicesResponse.status);
    const responseText = await devicesResponse.text();
    console.log('Réponse devices:', responseText);

    if (devicesResponse.ok) {
      try {
        return JSON.parse(responseText);
      } catch (e) {
        console.error('Erreur parsing JSON:', e);
        throw new Error('Réponse invalide');
      }
    } else {
      throw new Error(`Échec de la récupération des appareils: ${devicesResponse.status}`);
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des appareils:', error);
    throw error;
  }
}

// Exécution du test
async function main() {
  try {
    const authData = await authenticateUnifiCloud();
    console.log('\nAuthentification réussie, récupération des appareils...\n');
    const devices = await getUnifiDevices(authData);
    console.log('\nAppareils récupérés:', JSON.stringify(devices, null, 2));
  } catch (error) {
    console.error('\nErreur globale:', error);
  }
}

main();
