const fetch = require('isomorphic-fetch');

exports.handler = async function(event, context, callback) {
  const clientId = process.env.dropboxClientId;
  const clientSecret = process.env.dropboxClientSecret;
  const refreshToken = process.env.api;
  const uploadUrl = 'https://content.dropboxapi.com/2/files/upload';
  const filePath = `/participant_choices_${Date.now()}.csv`;

  // Helper function to refresh the access token
  const refreshAccessToken = async () => {
    const authUrl = 'https://api.dropbox.com/oauth2/token';
    const body = new URLSearchParams();
    body.append('grant_type', 'refresh_token');
    body.append('refresh_token', refreshToken);
    body.append('client_id', clientId);
    body.append('client_secret', clientSecret);

    const response = await fetch(authUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString()
    });

    if (response.ok) {
      const data = await response.json();
      return data.access_token;
    } else {
      throw new Error('Failed to refresh access token');
    }
  };

  const csvContent = event.body; // The CSV content received from the frontend
  const accessToken = await refreshAccessToken(); // Obtain a new access token

  const headers = {
    'Authorization': 'Bearer ' + accessToken,
    'Content-Type': 'application/octet-stream',
    'Dropbox-API-Arg': JSON.stringify({
      path: filePath,
      mode: 'add',
      autorename: true,
      mute: false
    })
  };

  try {
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: headers,
      body: csvContent
    });

    if (response.ok) {
      const result = await response.json();
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'File uploaded successfully', result })
      };
    } else {
      const error = await response.text();
      return {
        statusCode: response.status,
        body: JSON.stringify({ error })
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'An error occurred during file upload' })
    };
  }
};