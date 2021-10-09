import { checkEnvironmentAndLoadEnvVariablesFromS3 } from './loaders.js';
import app from './app.js';
// setting the timeout to be longer than the timeout
// in the checkEnvironmentAndLoadEnvVariablesFromS3 function
const timeout = setTimeout(() => {
    
    app.listen(process.env.PORT, () => {
        console.log(`Server listening on PORT: ${process.env.PORT}`);
    });
}, 500);