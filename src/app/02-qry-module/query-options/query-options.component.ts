import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { RepoService } from '../repo.service';
import { Observable } from 'rxjs';
import { MODE } from 'src/app/03-shared-table-factory-module/01-books-table/books-table.component';


@Component({
  selector: 'app-query-options',
  templateUrl: './query-options.component.html',
  styleUrls: ['./query-options.component.css']
})
export class QueryOptionsComponent implements OnInit {

  options: any[]
  queryType: QueryType

  qryRes: Observable<any>

  // These are just to hold the values of some excuted qry;
  // i.e. if the user excuted some book qry and after that changed the qry type from book to author and changed back from author to book,
  // then the last excuted book qry should be presented.
  bookQryRes: Observable<any>
  AuthorQryRes: Observable<any>
  ReaderQryRes: Observable<any>

  constructor(private repoService: RepoService) { }

  ngOnInit(): void {

    this.options = [
      { viewValue: "Book", value: QueryType.BOOK },
      { viewValue: "Author", value: QueryType.AUTHOR },
      { viewValue: "Reader", value: QueryType.READER }
    ]
  }


  selected({ value }) {
    this.queryType = value
    this.qryRes = null;
    switch (this.queryType) {
      case QueryType.BOOK:
        this.qryRes = this.bookQryRes;
        break;
      case QueryType.AUTHOR:
        this.qryRes = this.AuthorQryRes;
        break;
      case QueryType.READER:
        this.qryRes = this.ReaderQryRes;
        break;

      default:
        break;
    }

  }



  excuteQryByWhereInput(qryByWhereInput) {
    switch (this.queryType) {
      case QueryType.BOOK:
        this.bookQryRes = this.repoService.getBooksByWhereInput(qryByWhereInput)
        this.qryRes = this.bookQryRes;
        break;
      case QueryType.AUTHOR:
        this.AuthorQryRes = this.repoService.getAuthorsByWhereInput(qryByWhereInput)
        this.qryRes = this.AuthorQryRes;
        break;
      case QueryType.READER:
        this.ReaderQryRes = this.repoService.getReadersByWhereInput(qryByWhereInput)
        this.qryRes = this.ReaderQryRes;
        break;

      default:
        break;
    }
  }




  QueryType: typeof QueryType = QueryType
  NestedgqlObject: typeof NestedgqlObject = NestedgqlObject
  MODE: typeof MODE = MODE

}



enum QueryType {
  BOOK = 1,
  AUTHOR = 2,
  READER = 3
}

export enum NestedgqlObject {
  BOOK = 'BOOK',
  AUTHOR = 'AUTHOR',
  READER = 'READER',
  BOOKSTOREADERS = 'BOOKSTOREADERS',
  NONE = 'NONE'
}
