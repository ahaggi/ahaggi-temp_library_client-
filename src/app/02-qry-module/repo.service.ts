import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable, of, Subject } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { _Book } from '../01-library-module/01-books/book-form/book-form.component';
import { _getAuthorsByWhereInput, _getBooksByWhereInput, _getReadersByWhereInput } from '../util/gqlUtil/queriesDef';


// import {QryModule} from './qry.module'

// @Injectable({
//   providedIn: QryModule  // OBS: available just in the QryModule scope
// })

@Injectable({
  providedIn: 'root'
})
export class RepoService {

  constructor(private apollo: Apollo) {


    
  }

  getBooksByWhereInput(_bookQryArgs: any): Observable<any> {
    return this.apollo.query<any>({
      variables: { bookQryArgs: _bookQryArgs },
      query: _getBooksByWhereInput,
    })
  }
  getAuthorsByWhereInput(_authorQryArgs: any): Observable<any> {
    return this.apollo.query<any>({
      variables: { authorQryArgs: _authorQryArgs },
      query: _getAuthorsByWhereInput,
    })
  }
  getReadersByWhereInput(_readerQryArgs: any): Observable<any> {
    return this.apollo.query<any>({
      variables: { readerQryArgs: _readerQryArgs },
      query: _getReadersByWhereInput,
    })
  }

}





