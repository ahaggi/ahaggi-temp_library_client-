
import gql from 'graphql-tag';

export const getBookQry = gql`
    query ($id:String!){
        book: getBookByID(id:$id){
            id
            title
            pages
            chapters
            price
            description
            imgUri
            storage{id quantity borrowedQuantity}
            available
            booksToAuthors{id author{id name about imgUri}}
            booksToReaders{ id  borrowDate  returnDate  returned reader{id name imgUri}}
        }
    }`;
export const getBooksQry = gql`
    {
      books:getBooks{
            id
            title
            pages
            chapters
            price
            description
            imgUri
            storage{id quantity borrowedQuantity}
            available
            booksToAuthors{id author{id name about imgUri}}
            booksToReaders{ id  borrowDate  returnDate  returned reader{id name imgUri}}
        }
    }
    `;




export const getAuthorByIDQry = gql`
    query ($id:String!){
      author: getAuthorByID(id: $id) {
        id
        name
        email
        about
        imgUri
        booksToAuthors {
          id
          book {
            id
          }
        }
      }
    }
`

export const getAuthorsQry = gql`
{
  authors: getAuthors {
    id
    name
    email
    about
    imgUri
    booksToAuthors {
      book {
        id
        title
      }
    }
  }
}
`;




export const getReadersQry = gql`
            {
              readers:getReaders{
                  id,
                  name,
                  email,
                  imgUri
                  booksToReaders{ id  borrowDate  returnDate  returned book{id title}}
                }
            }
          `
