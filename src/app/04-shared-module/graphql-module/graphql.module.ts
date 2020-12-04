import { NgModule } from '@angular/core';
import { APOLLO_OPTIONS } from 'apollo-angular';
import { ApolloClientOptions, ApolloLink, InMemoryCache } from '@apollo/client/core';

import { HttpLink } from 'apollo-angular/http';

import { WebSocketLink } from 'apollo-link-ws';
import { split } from 'apollo-link';
import { getMainDefinition } from 'apollo-utilities';
import { OperationDefinitionNode } from 'graphql/language/ast';


const uriHttp = 'https://temp-library-server.herokuapp.com/graphql'; // <-- add the URL of the GraphQL server here
const uriWs = 'wss://temp-library-server.herokuapp.com/graphql'; // <-- add the URL of the GraphQL server here

export function createApollo(httpLink: HttpLink): ApolloClientOptions<any> {

  // Create an http link for queries and mutations:
  const http: any = httpLink.create({
    uri: uriHttp
  });
  // Create a WebSocket link for subscriptions:
  const ws = new WebSocketLink({
    uri: uriWs,
    options: {
      reconnect: true
    }
  });

  // using the ability to split links, you can send data to each link
  // depending on what kind of operation is being sent
  const link = split(
    // split based on operation type
    ({ query }) => {
      const definintion = getMainDefinition(query);
      return definintion.kind === 'OperationDefinition' && definintion.operation === 'subscription';
    },
    ws,
    http,
  );
  return {
    // casting the variable "link" to Any and casting it back to ApolloLink is just to fix : 
    // error TS2739: Type 'ApolloLink' is missing the following properties from type 'ApolloLink': onError, setOnError
    link:   (link as any) as ApolloLink, 

    cache: new InMemoryCache({
      typePolicies: {
        Query: { fields: { getBooks: { merge: false } } },
        Book: { fields: { booksToReaders: { merge: false } } },
        Reader: { fields: { booksToReaders: { merge: false } } },
      },
    }),
  };
}

@NgModule({
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory: createApollo,
      deps: [HttpLink],
    },
  ],
})
export class GraphQLModule {
  constructor() {
    console.log("------------------- ModuleWithProviders is initiated -------------------")
  }
}
