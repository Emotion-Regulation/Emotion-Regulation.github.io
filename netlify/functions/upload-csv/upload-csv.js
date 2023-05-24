const fetch = require('isomorphic-fetch');

exports.handler = async function(event, context, callback) {
  const { participantChoices } = JSON.parse(event.body);

  const header = ["part", "decision", "videoId", "reactionTime", "forcedVideoId", "reward", "rewardButton", "rating", "valence", "arousal"];
  const csvRows = [header];

  for (const row of participantChoices) {
    const rowData = [
      row.part,
      row.decision,
      row.videoId,
      row.reactionTime,
      row.forcedVideoId || "",
      row.reward || "",
      row.rewardButton || "",
      row.rating || "",
      row.valence || "",
      row.arousal || "",
    ];
    csvRows.push(rowData);
  }

  const csvContent = csvRows.map(row => row.join(",")).join("\n");

  const accessToken = process.env.api; 
  const uploadUrl = 'https://content.dropboxapi.com/2/files/upload';
  const filePath = '/participant_choices.csv';

  const headers = {
    'Authorization': `Bearer ${accessToken}`,
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
      headers,
      body: csvContent
    });

    if (response.status === 200) {
      const data = await response.json();
      return callback(null, {
        statusCode: 200,
        body: JSON.stringify({ message: 'File uploaded successfully', data })
      });
    } else {
      return callback(null, {
        statusCode: response.status,
        body: JSON.stringify({ error: 'Error uploading file' })
      });
    }
  } catch (error) {
    return callback(null, {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    });
  }
};