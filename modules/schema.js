const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type Query {
    getMarkdownFile(fileName: String!): String
    getAllMarkdownFiles: [MarkdownFile]
  }
  type MarkdownFile {
    id: ID!
    title: String!
    fileName: String!
  }
`;

module.exports = typeDefs;
