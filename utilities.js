import dotenv from 'dotenv';
import * as v4 from './aws-signature-v4.js';
import crypto from 'crypto'; // to sign our pre-signed URL
import { fromInstanceMetadata } from '@aws-sdk/credential-providers';
import fetch from 'node-fetch';


dotenv.config();


const getCredentials = async () => {
    // const credentialsProvider = fromInstanceMetadata();
    // const credentials = await credentialsProvider();
    // return credentials;

    const response = await fetch(`http://169.254.169.254/latest/meta-data/iam/security-credentials/${process.env.IAM_ROLE}`);
    const data = await response.json();
    return data;
};



export const createPresignedUrl = async () => {
    try {
        let endpoint = "transcribestreaming." + process.env.AWS_REGION + ".amazonaws.com:8443";
        let ec2RoleCredentials = {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        };

        // if (process.env.NODE_ENV === 'production') {
        //     const credentials = await getCredentials();
        //     ec2RoleCredentials.accessKeyId = credentials.AccessKeyId;
        //     ec2RoleCredentials.secretAccessKey = credentials.SecretAccessKey;
        // }

        console.log(ec2RoleCredentials);
        // get a preauthenticated URL that we can use to establish our WebSocket
        return v4.createPresignedURL(
            'GET',
            endpoint,
            '/stream-transcription-websocket',
            'transcribe',
            crypto.createHash('sha256').update('', 'utf8').digest('hex'), {
            'key': ec2RoleCredentials.accessKeyId,
            'secret': ec2RoleCredentials.secretAccessKey,
            'protocol': 'wss',
            'expires': 300,
            'region': process.env.AWS_REGION,
            'query': "language-code=" + process.env.LANGUAGE_CODE + "&media-encoding=pcm&sample-rate=" + process.env.SAMPLE_RATE
        }
        );
    } catch (error) {
        console.log(error);
    }
}