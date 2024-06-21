const express = require('express');
const path = require('path');
const { ApolloServer } = require('@apollo/server');
const db = require('./config/connection');
const routes = require('./routes');
const { typeDefs, resolvers } = require('./schemas');
const { authMiddleware } = require('./utils/auth');
const {expressMiddleware} = require('@apollo/server/express4');

const app = express();
const PORT = process.env.PORT || 3001;
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// Apollo Server setup
const server = new ApolloServer({
  typeDefs,
  resolvers,
  // context: ({ req }) => authMiddleware(req),
});


const startApolloServer = async () => {
  await server.start();
  app.use('/graphql', expressMiddleware(server, {context: authMiddleware}));
  // if we're in production, serve client/dist as static assets
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/dist')));

    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    });
  } 
  db.once('open', () => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`API server running on port ${PORT}!`);
      console.log(`Use GraphQL at http://0.0.0.0:${PORT}/graphql`);
    });
  });
};
 
startApolloServer();