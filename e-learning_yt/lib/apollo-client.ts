import { ApolloClient, InMemoryCache } from '@apollo/client';

const client = new ApolloClient({
  uri: 'https://e-learning-smbe.onrender.com/graphql',
  cache: new InMemoryCache(),
});

export default client; 