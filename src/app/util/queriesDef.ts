
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
// IMPORTANT keep the result alais as "res"
export const getAuthorByEmailQry = gql`
          query ($email:String!){
            res: _getAuthorByEmail(email: $email) {
              id
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

          
          


export const getReaderByIDQry = gql`
        query ($id:String!){
          reader:getReaderByID(id: $id) {
            id
            name
            email
            imgUri
            booksToReaders {
              id
              borrowDate
              returnDate
              returned
              book {
                id
              }
            }
          }
        }
`

// IMPORTANT keep the result alais as "res"
export const getReaderByEmailQry = gql`
      query ($email:String!){
        res: _getReaderByEmail(email: $email) {
          id
        }
      }
  `


  export const getBtrByReaderId = gql`
  query ($readerId:String!){
    res: getBooksToReadersBy(_booksToReadersArgs: { reader: { id: $readerId } }) {
      id
      returned
      borrowDate
      returnDate
      book {
        id
        title
      }
    }
  }

`
export const getBtrByBookId = gql`
  query ($bookId:String!){
    res: getBooksToReadersBy(_booksToReadersArgs: { book: { id: $bookId } }) {
      id
      returned
      borrowDate
      returnDate
      reader {
        id
        name
        email
      }
    }
  }

`
   

  