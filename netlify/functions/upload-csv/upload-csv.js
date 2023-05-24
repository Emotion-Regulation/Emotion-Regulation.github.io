const AWS = require('aws-sdk');

exports.handler = async function(event, context, callback) {
  const csvContent = event.body; // The CSV content received from the frontend
  
  // Configure AWS SDK with your credentials and the desired endpoint URL
  AWS.config.update({
    accessKeyId: process.env.key_id,
    secretAccessKey: process.env.secret_key,
    region: process.env.region,
    s3ForcePathStyle: true,
    endpoint: process.env.endpoint, 
  });

  const s3 = new AWS.S3();

  const bucketName = process.env.AWS_BUCKET_NAME;
  const timestamp = new Date().toISOString();
  const filePath = `participant_choices_${timestamp}.csv`;

  const params = {
    Bucket: bucketName,
    Key: filePath,
    Body: csvContent,
  };

  try {
    const response = await s3.upload(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'File uploaded successfully', response }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'An error occurred during file upload' }),
    };
  }
};
