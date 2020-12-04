import gql from 'graphql-tag';

export const createdBookSub = gql`
subscription{
    createdBookSub{
      id
      title
      isbn
    }
  }
`;

export const updatedBookSub = gql`
subscription{
    updatedBookSub{
      id
      title
      isbn
    }
  }
`;

export const deletedBookSub = gql`
subscription{
    deletedBookSub{
        id
        title
        isbn
    }
  }
`;

export const createdAuthorSub = gql`
subscription{
    createdAuthorSub{
        id
        name
        email
    }
  }
`;

export const updatedAuthorSub = gql`
subscription{
    updatedAuthorSub{
        id
        name
        email
    }
  }
`;

export const deletedAuthorSub = gql`
subscription{
    deletedAuthorSub{
        id
        name
        email
    }
  }
`;

export const createdReaderSub = gql`
subscription{
    createdReaderSub{
        id,
        name,
        email,
        costumerId,
    }
  }
`;

export const updatedReaderSub = gql`
subscription{
    updatedReaderSub{
        id,
        name,
        email,
        costumerId,
    }
  }
`;

export const deletedReaderSub = gql`
subscription{
    deletedReaderSub{
        id,
        name,
        email,
        costumerId,
    }
  }
`;
