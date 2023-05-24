const fetch = require('isomorphic-fetch');

exports.handler = async function(event, context, callback) {
  const accessToken = process.env.api;
  const uploadUrl = 'https://content.dropboxapi.com/2/files/upload';
  const filePath = `/participant_choices_${Date.now()}.csv`;

  const csvContent = event.body; // The CSV content received from the frontend
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