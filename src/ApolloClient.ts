import _ from 'lodash'
import VueApollo from 'vue-apollo'
import { ApolloClient } from 'apollo-client'
import { createHttpLink } from 'apollo-link-http'
import { ApolloLink, concat, split } from 'apollo-link'
import { WebSocketLink } from 'apollo-link-ws'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { getMainDefinition } from 'apollo-utilities'

const authMiddleware = new ApolloLink((operation:any, forward:any) => {
  const store = JSON.parse(window.localStorage.getItem('mm'))
  // add the authorization to the headers
  operation.setContext({
    headers: {
      Authorization: `Bearer ${_.get(store, 'auth.token')}`
    }
  })
  return forward(operation)
})

const wsLink = new WebSocketLink({
  uri: `${process.env.VUE_APP_WS || 'ws://localhost:4015'}`,
  options: {
    reconnect: true,
  },
})

const httpLink = createHttpLink({
  uri: process.env.VUE_APP_API || 'http://localhost:4015',
})

const link = split(
  // split based on operation type
  ({ query }) => {
    const definition = getMainDefinition(query)
    return definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
  },
  concat(authMiddleware, wsLink),
  concat(authMiddleware, httpLink)
)

// Cache implementation
const cache = new InMemoryCache()

// Create the apollo client
export const client = new ApolloClient({
  link,
  cache,
})

export const provider = new VueApollo({
  defaultClient: client,
  errorHandler ({ graphQLErrors, networkError }):any {
    if (graphQLErrors) {
      graphQLErrors.map(({ message, locations, path }) =>
        console.log(
          `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
        )
      )
    }
    if (networkError) {
      console.log(`[Network error]: ${networkError}`)
    }
  }
})