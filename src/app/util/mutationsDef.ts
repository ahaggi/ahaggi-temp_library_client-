import gql from 'graphql-tag';

// Notice how we list all the properties of an object (with the new values) after a mutation, 
// these properties can be used by "Apollo Client" to update the cache/store with these new values
// at any place which shows the object in the application. 
//
// ApolloClient can automatically generate unique "object identifiers" (by concatenating __typename + sqlID,, i.e Book:1),
// this allow ApolloClient to identify the mutated object and updated accordingly.
//
// https://www.apollographql.com/blog/the-concepts-of-graphql-bc68bd819be3/
export const updateBookMut = gql`
mutation ($id:String!, $data: _BookUpdateInput!) {
  updateBook(where: { id: $id }, data: $data) {
    id
  }
}
`;

export const postBookMut = gql`
mutation ($data: _BookCreateInput!) {
  createBook( data: $data ) {
    id
  }
}
`;


export const deleteBookMut = gql`
mutation deleteBook($id: String!) {
  deleteBook(where: { id: $id }) {
    id
  }
}
`;

export const deleteBooksToReadersMut = gql`
mutation deleteBooksToReaders($id: String!) {
  deletedBtr:deleteBooksToReaders(where: { id: $id }) {
    id
  }
}
`;



/********************************************************************* */


export const updateAuthorMut = gql`
mutation ($id:String!, $data: _AuthorUpdateInput!){
  updateAuthor(where: { id: $id }, data: $data) {
    id
  }
}
`

export const postAuthorMut = gql`

mutation ($data: _AuthorCreateInput!) {
  createAuthor(data:$data){
    id
  }
}
`


// export const deleteAuthorMut = gql``



/********************************************************************* */


export const updateReaderMut = gql`
                  mutation ($id:String!, $data: _ReaderUpdateInput!){
                    updateReader(where: { id: $id }, data: $data) {
                      id
                    }
                  }
`

export const postReaderMut = gql`
                  mutation ($data: _ReaderCreateInput!) {
                    createReader(data:$data){
                      id
                    }
                  }
`

// export const deleteReaderMut = gql``
