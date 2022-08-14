const { Storage } = require('@google-cloud/storage');
const path = require('path');
const gc = new Storage({
    keyFileName: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    projectId: 'keyhub-359213',
});

gc.getBuckets().then((x) => console.log(x));
const bucket = gc.bucket('keyhub-files');
module.exports = bucket;
