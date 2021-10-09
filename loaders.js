// This module is used to run functionalities that don't need environment variables

import fetch from 'node-fetch';
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import file from 'fs';
import AbortController from 'abort-controller';
import dotenv from 'dotenv';



// load environment variables from s3.env if we're running on an ec2 instance
export const checkEnvironmentAndLoadEnvVariablesFromS3 = async (s3ClientConfig = { region: "eu-west-2" }, s3CommandInput = { Bucket: 'purple-sound', Key: 'environment-variables/aws.env' }) => {
    const controller = new AbortController();
    const timeout = setTimeout(
        () => { controller.abort(); },
        150,
    );
    try {
        // make a call to the metadata service to see if we're running on an ec2 instance
        const metadata = await fetch('http://169.254.169.254/latest/meta-data', { signal: controller.signal });
        if (metadata.ok) {
            const envVariables = file.createWriteStream('./.env');
            // getobject from s3 and pipe to .env file
            console.log('We are in an ec2 instance.. making call to s3');
            const client = new S3Client(s3ClientConfig);
            const command = new GetObjectCommand(s3CommandInput);
            const response = await client.send(command);
            const stream = response.Body.pipe(envVariables);
            stream.on('finish', () => {
                console.log('Successfully wrote .env file');
                dotenv.config();
            });
            return;
        }
        throw new Error('Not in an ec2 instance');
    } catch (error) {
        console.log(error);
    } finally {
        clearTimeout(timeout);
    }
};

// When the app starts, check if we're in an ec2 instance and load the .env file if we are
(async () => {
    try {
        await checkEnvironmentAndLoadEnvVariablesFromS3();
    } catch (error) {
        console.error(error);
    }
})();