const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const fileUpload = require('express-fileupload');

const cors = require('cors');
const typeDefs = require('./modules/schema');
const resolvers = require('./modules/resolvers');
const { PORT } = require('./modules/config');

const startServer = async () => {
  const app = express();
  app.use(cors());
  app.use(fileUpload());


  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });

  app.listen({ port: PORT }, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
  });
};

startServer().catch(error => {
  console.error('Server failed to start', error);
});
