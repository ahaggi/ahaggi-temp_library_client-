
import gql from 'graphql-tag';

export const getBookByIDQry = gql`
query($id: String!) {
  book: getBookByID(id: $id) {
    id
    title
    isbn
    pages
    chapters
    price
    description
    imgUri
    storage {id quantity borrowedQuantity }
    available
    booksToAuthors {
      id
      author {id name email about imgUri }
    }
    booksToReaders { id borrowDate returnDate returned remainingTime
                      reader {id name email costumerId address phone imgUri }
    }
  }
}`;

export const getBookByIsbnQry = gql`
query($isbn: String!) {
  book: getBookByISBN(isbn:$isbn) {
    id
    isbn
  }
}`;

export const getBooksQry = gql`
    {
      books:getBooks{
        id
        title
        isbn
        pages
        chapters
        price
        description
        imgUri
        storage {id quantity borrowedQuantity }
        available
        booksToAuthors {
          id
          author {id name email about imgUri }
        }
        booksToReaders { id borrowDate returnDate returned remainingTime
                          reader {id name email costumerId address phone imgUri }
        }
      }
    }
    `;

export const _getBooksByWhereInput = gql`
    query($bookQryArgs: _BookWhereInput) {
      books: getBooksByWhereInput(_bookArgs: $bookQryArgs) {
        id
        title
        isbn
        pages
        chapters
        price
        description
        imgUri
        storage {id quantity borrowedQuantity }
        available
        booksToAuthors {
          id
          author {id name email about imgUri }
        }
        booksToReaders { 
          id borrowDate returnDate returned remainingTime
          reader {
            id name email costumerId address phone imgUri 
          }
        }
      }
    }
    `;




export const getAuthorByIDQry = gql`
query($id: String!) {
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
        title
        isbn
        pages
        chapters
        price
        description
        imgUri
        storage { id quantity borrowedQuantity }
        available
      }
    }
  }
}
`
// IMPORTANT keep the result alais as "res"
export const getAuthorByEmailQry = gql`
          query ($email:String!){
            res: getAuthorByEmail(email: $email) {
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
      id
      book {
        id
        title
        isbn
        pages
        chapters
        price
        description
        imgUri
        storage { id quantity borrowedQuantity }
        available
      }
    }
  }
}
`;

export const _getAuthorsByWhereInput = gql`
    query($authorQryArgs: _AuthorWhereInput) {
      authors: getAuthorsByWhereInput(_authorArgs: $authorQryArgs) {
        id
        name
        email
        about
        imgUri
        booksToAuthors {
          id
          book {
            id
            title
            isbn
            pages
            chapters
            price
            description
            imgUri
            storage { id quantity borrowedQuantity }
            available
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
                  costumerId,
                  address,
                  phone,
                  imgUri,
                  booksToReaders{ id  borrowDate  returnDate  returned remainingTime
                                book {
                                  id
                                  title
                                  isbn
                                  pages
                                  chapters
                                  price
                                  description
                                  imgUri
                                  storage { id quantity borrowedQuantity }
                                  available}
                                }
                }
            }
          `


                    
export const _getReadersByWhereInput = gql`
query($readerQryArgs: _ReaderWhereInput) {
  readers: getReadersByWhereInput(_readerArgs: $readerQryArgs) {
    id,
    name,
    email,
    costumerId,
    address,
    phone,
    imgUri,
    booksToReaders{ id  borrowDate  returnDate  returned remainingTime
                  book {
                    id
                    title
                    isbn
                    pages
                    chapters
                    price
                    description
                    imgUri
                    storage { id quantity borrowedQuantity }
                    available}
                  }

  }
}`;
      


export const getReaderByIDQry = gql`
        query ($id:String!){
          reader:getReaderByID(id: $id) {
            id,
            name,
            email,
            costumerId,
            address,
            phone,
            imgUri,
            booksToReaders{ id  borrowDate  returnDate  returned remainingTime
                          book {
                            id
                            title
                            isbn
                            pages
                            chapters
                            price
                            description
                            imgUri
                            storage { id quantity borrowedQuantity }
                            available}
                          }

          }
        }
`

// IMPORTANT keep the result alais as "res"
export const getReaderByEmailQry = gql`
      query ($email:String!){
        res: getReaderByEmail(email: $email) {
          id
        }
      }
  `





