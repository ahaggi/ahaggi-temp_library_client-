import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class InputFieldService {
  fields: GQLObjectType = {}

  constructor() {

    const BOOK: GQLObjectType = {
      title: { viewValue: "Book's Title:", cache: { [CacheType.SINGLE]: null, [CacheType.LIST]: null }, inputValueType: InputValueType.STRING,  },
      isbn: { viewValue: "ISBN:", cache: { [CacheType.SINGLE]: null, [CacheType.LIST]: null }, inputValueType: InputValueType.STRING,  },
      pages: { viewValue: "Nr. of Pages:", cache: { [CacheType.SINGLE]: null, [CacheType.LIST]: null }, inputValueType: InputValueType.INT,  },
      chapters: { viewValue: "Nr. of Chapters:", cache: { [CacheType.SINGLE]: null, [CacheType.LIST]: null }, inputValueType: InputValueType.INT,  },
      price: { viewValue: "Book's Price:", cache: { [CacheType.SINGLE]: null, [CacheType.LIST]: null }, inputValueType: InputValueType.FLOAT,  },
      description: { viewValue: "Book's Description:", cache: { [CacheType.SINGLE]: null, [CacheType.LIST]: null }, inputValueType: InputValueType.STRING,  },
      storage: {
        quantity: { viewValue: "Book's Total Qty:", cache: { [CacheType.SINGLE]: null, [CacheType.LIST]: null }, inputValueType: InputValueType.INT,  },
        borrowedQuantity: { viewValue: "Book's Borrowed Qty:", cache: { [CacheType.SINGLE]: null, [CacheType.LIST]: null }, inputValueType: InputValueType.INT,  },
      },

      booksToAuthors: null
    }

    const AUTHOR: GQLObjectType = {
      name: { viewValue: "Author's Name:", cache: { [CacheType.SINGLE]: null, [CacheType.LIST]: null }, inputValueType: InputValueType.STRING,  },
      email: { viewValue: "Author's Email:", cache: { [CacheType.SINGLE]: null, [CacheType.LIST]: null }, inputValueType: InputValueType.EMAIL,  },
      about: { viewValue: "Author's Bio:", cache: { [CacheType.SINGLE]: null, [CacheType.LIST]: null }, inputValueType: InputValueType.STRING,  },
      booksToAuthors: null,
    }

    const READER: GQLObjectType = {
      name: { viewValue: "Reader's Name:", cache: { [CacheType.SINGLE]: null, [CacheType.LIST]: null }, inputValueType: InputValueType.STRING,  },
      email: { viewValue: "Reader's Email:", cache: { [CacheType.SINGLE]: null, [CacheType.LIST]: null }, inputValueType: InputValueType.EMAIL,  },
      costumerId: { viewValue: "Reader's Id:", cache: { [CacheType.SINGLE]: null, [CacheType.LIST]: null }, inputValueType: InputValueType.STRING,  },
      address: { viewValue: "Reader's Address:", cache: { [CacheType.SINGLE]: null, [CacheType.LIST]: null }, inputValueType: InputValueType.STRING,  },
      phone: { viewValue: "Reader's Phone:", cache: { [CacheType.SINGLE]: null, [CacheType.LIST]: null }, inputValueType: InputValueType.STRING,  },
      booksToReaders: null
    }

    const BOOKSTOAUTHORS = {
      some: {
        author: AUTHOR,
        book: BOOK
      }
    }

    const BOOKSTOREADERS = {
      some: {
        borrowDate: { viewValue: "Borrow Date:", cache: { [CacheType.SINGLE]: null, [CacheType.LIST]: null }, inputValueType: InputValueType.DATE,  },
        returnDate: { viewValue: "Return Date:", cache: { [CacheType.SINGLE]: null, [CacheType.LIST]: null }, inputValueType: InputValueType.DATE,  },
        returned: { viewValue: "Is returned?:", cache: { [CacheType.SINGLE]: null }, inputValueType: InputValueType.BOOLEAN,  },
        reader: READER,
        book: BOOK
      }
    }

    BOOK.booksToAuthors = BOOKSTOAUTHORS;
    AUTHOR.booksToAuthors = BOOKSTOAUTHORS;

    BOOK.booksToReaders = BOOKSTOREADERS;
    READER.booksToReaders = BOOKSTOREADERS;

    this.fields = {
      book: BOOK,
      author: AUTHOR,
      reader: READER
    }
  }

  traverseDotedPath(_obj: any, _path: string) {
    let pathList = _path.split('.')
    const reducer = (obj, key) => (_path == null || typeof _path === 'undefined') ? null : obj[key];
    return pathList.reduce(reducer, _obj)
  }

  getInputField(_path: string) {
    let field: InputField = this.traverseDotedPath(this.fields, _path)
    if (_path == null || typeof _path === 'undefined' || Object.keys(field).length === 0) {
      console.error(`######### InputFieldService : getInputField #########\ninvalid _path ${_path}`)
      return null
    }

    return field
  }



  getInputFieldType(_path: string) {
    let field: InputField = this.traverseDotedPath(this.fields, _path)
    return field.inputValueType
  }


}
//https://stackoverflow.com/a/8768241
const dateRegex = '^(?:(?:(?:0?[13578]|1[02])(\\/|-|\\.)31)\\1|(?:(?:0?[1,3-9]|1[0-2])(\\/|-|\\.)(?:29|30)\\2))(?:(?:1[6-9]|[2-9]\\d)?\\d{2})$|^(?:0?2(\\/|-|\\.)29\\3(?:(?:(?:1[6-9]|[2-9]\\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:(?:0?[1-9])|(?:1[0-2]))(\\/|-|\\.)(?:0?[1-9]|1\\d|2[0-8])\\4(?:(?:1[6-9]|[2-9]\\d)?\\d{2})$'

export type GQLObjectType = {
  [key: string]: InputField | GQLObjectType
}

export type InputField = {
  viewValue: string,
  cache: { [CacheType.SINGLE]: any, [CacheType.LIST]?: any[] },// boolean fields does NOT have [CacheType.LIST]?: any[]
  inputValueType: InputValueType
}


export enum InputValueType {
  STRING = 1,
  INT = 2,
  FLOAT = 3,
  BOOLEAN = 4,
  DATE = 5,
  EMAIL = 6,
  PHONE = 7
}

export enum CacheType {
  SINGLE = 1,
  LIST = 7
}


