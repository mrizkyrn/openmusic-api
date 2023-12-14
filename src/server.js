const dotenv = require('dotenv');
const hapi = require('@hapi/hapi');

dotenv.config();

const init = async () => {
   const server = hapi.server({
      port: process.env.PORT || 3000,
      host: process.env.HOST || 'localhost',
      routes: {
         cors: {
            origin: ['*'],
         },
      },
   });

   await server.start();
   console.log(`Server running at: ${server.info.uri}`);
};

init();
