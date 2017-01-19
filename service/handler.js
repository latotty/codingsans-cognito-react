const AWS = require('aws-sdk');
const signUrl = require('aws-device-gateway-signed-url');
const vandium = require('vandium');

const GLOBAL_CHAT_OUT_TOPIC = 'globalChatOut';
const REGION_NAME = process.env.REGION_NAME || 'eu-west-1';
const ENDPOINT = process.env.ENDPOINT || 'a2afhnqe1p94hn.iot.eu-west-1.amazonaws.com';
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;

function getSignedUrl() {
  return signUrl({
    regionName: REGION_NAME,
    endpoint: ENDPOINT,
    secretKey: AWS_SECRET_ACCESS_KEY,
    accessKey: AWS_ACCESS_KEY_ID,
  });
}
function globalChatIn(event, context, cb) {
  console.log('event', JSON.stringify(event));
  const iot = new AWS.IotData({ endpoint: ENDPOINT });

  const params = {
    topic: GLOBAL_CHAT_OUT_TOPIC,
    payload: JSON.stringify(event),
  };

  iot.publish(params, (err, data) => {
    if (err) {
      console.error('Error when publishing:', err);
      return cb(err, {});
    }
    console.log('Successfully published:', data);
    return cb(null, {});
  });
}

const getSignUrl = vandium(() => {
  const signedUrl = getSignedUrl();

  return {
    statusCode: 200,
    body: JSON.stringify({ signedUrl }),
    headers: {
      'Access-Control-Allow-Origin' : '*', // Required for CORS support to work
    },
  };
});

exports.globalChatIn = globalChatIn;

exports.getSignUrl = getSignUrl;
