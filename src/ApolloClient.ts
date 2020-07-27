import _ from "lodash";
import VueApollo from "vue-apollo";
import { ApolloClient } from "apollo-client";
import { createHttpLink } from "apollo-link-http";
import { ApolloLink, concat, split } from "apollo-link";
import { WebSocketLink } from "apollo-link-ws";
import { InMemoryCache } from "apollo-cache-inmemory";
import { getMainDefinition } from "apollo-utilities";
import { createUploadLink } from 'apollo-upload-client'

const authMiddleware = new ApolloLink((operation: any, forward: any) => {
  const store = JSON.parse(
    window.localStorage.getItem(_.get(process, "env.VUE_APP_STORE_KEY", "mm"))
  );
  let tokenString: string = _.get(store, "auth.token", null);
  let headers: any = {};

  if (tokenString) {
    headers["Authorization"] = `Bearer ${tokenString}`;
  }

  operation.setContext({
    headers,
  });
  return forward(operation);
});

const wsLink = process.env.VUE_APP_WS
  ? new WebSocketLink({
      uri: process.env.VUE_APP_WS,
      options: {
        reconnect: true,
      },
    })
  : undefined;

const httpOptions = {
  uri: process.env.VUE_APP_API || "http://localhost:4015",
}

const httpLink = createHttpLink(httpOptions);
const uploadLink = createUploadLink(httpOptions)

let link;

const requestLink = concat(authMiddleware, split(
  ({ getContext }) => getContext().hasUpload,
  concat(authMiddleware, uploadLink),
  concat(authMiddleware, httpLink))
);

// WebSocket is optional
if (wsLink) {
  link = split(
    // split based on operation type
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === "OperationDefinition" &&
        definition.operation === "subscription"
      );
    },
    concat(authMiddleware, wsLink),
    requestLink
  );
} else {
  link = requestLink
}

// Cache implementation
const cache = new InMemoryCache();

// Create the apollo client
export const client = new ApolloClient({
  link,
  cache,
});

export const provider = new VueApollo({
  defaultClient: client,
  errorHandler({ graphQLErrors, networkError }): any {
    if (graphQLErrors) {
      graphQLErrors.map(({ message, locations, path }) =>
        console.log(
          `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
        )
      );
    }
    if (networkError) {
      console.log(`[Network error]: ${networkError}`);
    }
  },
});
