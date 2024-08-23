# Project Name
Markdown graphql server
## Description

This project is a GraphQL server built using [technology/framework] express with GrapghQL. It serves markdown files.

## Installation

1. Clone the repository.
2. Install the dependencies by running `npm install`.
3. Run node index.js.

## Usage

1. [Instructions on how to start the server].
   Run node index.js after npm install the packages
2. [Instructions on how to access the GraphQL endpoint].
 The GraghQl server will run locally on the  http://localhost:4000/graphql.
 Use the queries 
 - query {
  getMarkdownFile(fileName: "sample")
}
 
- query {
  getAllMarkdownFiles {
    id
    title
    fileName
  }
}

- For the mutation of uploading markdowns you can use postman
  1. Create a new GraphQL request in postman
  2. Add Content-Type: application/json to the headers
  3. Use the url that the server is running eg http://localhost:4000/graphql if the server is running locally 
  4. Use the `mutation UploadMarkdownFile {
    uploadMarkdownFile(
        file: {
            filename: "test.md"
            content: "Test Markdown\\nThis is a test markdown file"
        }
    ) {
        filename
        mimetype
        encoding
    }
}`

Postman is too easy to use for GraghQL requests, just by adding the url you can select the queries and the mutation you want to use.


## Features

- Serve markdown content
- Get list of markdown by name id and title
- Upload markdown documents 

## Technologies Used

- Express
- GraphQL
- Apollo server

## Contributing

Contributions are welcome! Please follow the guidelines outlined in [CONTRIBUTING.md].

## License

This project is licensed under the [License Name]. See [LICENSE.md] for more information.

## Contact

For any questions or feedback, please contact Konstantina Kirtsia  at konstantinakirtsia@gmail.com.
