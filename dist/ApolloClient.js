"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.provider = exports.client = void 0;
const lodash_1 = __importDefault(require("lodash"));
const vue_apollo_1 = __importDefault(require("vue-apollo"));
const apollo_client_1 = require("apollo-client");
const apollo_link_http_1 = require("apollo-link-http");
const apollo_link_1 = require("apollo-link");
const apollo_link_ws_1 = require("apollo-link-ws");
const apollo_cache_inmemory_1 = require("apollo-cache-inmemory");
const apollo_utilities_1 = require("apollo-utilities");
const authMiddleware = new apollo_link_1.ApolloLink((operation, forward) => {
    const store = JSON.parse(window.localStorage.getItem(lodash_1.default.get(process, "env.VUE_APP_STORE_KEY", "mm")));
    let tokenString = lodash_1.default.get(store, "auth.token", null);
    // add the authorization to the headers
    operation.setContext({
        headers: {
            Authorization: tokenString ? `Bearer ${tokenString}` : null,
        },
    });
    return forward(operation);
});
const wsLink = new apollo_link_ws_1.WebSocketLink({
    uri: `${process.env.VUE_APP_WS || "ws://localhost:4015"}`,
    options: {
        reconnect: true,
    },
});
const httpLink = apollo_link_http_1.createHttpLink({
    uri: process.env.VUE_APP_API || "http://localhost:4015",
});
const link = apollo_link_1.split(
// split based on operation type
({ query }) => {
    const definition = apollo_utilities_1.getMainDefinition(query);
    return (definition.kind === "OperationDefinition" &&
        definition.operation === "subscription");
}, apollo_link_1.concat(authMiddleware, wsLink), apollo_link_1.concat(authMiddleware, httpLink));
// Cache implementation
const cache = new apollo_cache_inmemory_1.InMemoryCache();
// Create the apollo client
exports.client = new apollo_client_1.ApolloClient({
    link,
    cache,
});
exports.provider = new vue_apollo_1.default({
    defaultClient: exports.client,
    errorHandler({ graphQLErrors, networkError }) {
        if (graphQLErrors) {
            graphQLErrors.map(({ message, locations, path }) => console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`));
        }
        if (networkError) {
            console.log(`[Network error]: ${networkError}`);
        }
    },
});
//# sourceMappingURL=ApolloClient.js.map