import Koa from 'koa'
import { join } from 'path'
import { readFileSync } from 'fs'
import http from 'http';
import { ApolloServer } from 'apollo-server-koa';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import { gql } from 'apollo-server'
import { Resolvers } from "./generated/resolvers-types";

// GraphQL type definitions.
const typeDefs = gql(
    readFileSync(join(__dirname, '../schema/schema.graphql')).toString()
)


import { verifyTypedData } from 'ethers/lib/utils';

const resolvers: Resolvers = {
    Mutation: {
        authenticate: (parent, args, context, info) => {
            const { signature, address } = args.request
            
            // console.log(parent, args, context, info)
            return null
        }
    }
};



async function start(
    typeDefs?: any,
    resolvers?: any,
) {
    const httpServer = http.createServer();

    // Setup Apollo GQL.
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
        context: async ({ req }) => {}
    });
    await server.start();

    // Create Koa server.
    const app = new Koa();
    server.applyMiddleware({ app });
    httpServer.on('request', app.callback());

    // Run server.
    await new Promise<void>(resolve => {
        httpServer.listen({ port: 4000 }, resolve)
        console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
    });

    return { server, app };
}

start(typeDefs, resolvers)