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

  input UploadFileInput {
    filename: String!
    content: String!
  }


  type File {
    filename: String!
    mimetype: String!
    encoding: String!
  }

   type Mutation {
    uploadMarkdownFile(file: UploadFileInput!): File!
  }

`;

module.exports = typeDefs;
