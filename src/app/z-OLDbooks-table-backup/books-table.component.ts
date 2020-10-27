import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { Apollo, Query } from 'apollo-angular';

import { BooksTableDataSource, BooksItem } from './books-table-datasource';

@Component({
  selector: 'app-books-table',
  templateUrl: './books-table.component.html',
  styleUrls: ['./books-table.component.css']
})
export class BooksTableComponent implements OnInit {
  // @ViewChild(MatPaginator) paginator: MatPaginator;
  // @ViewChild(MatSort) sort: MatSort;
  // @ViewChild(MatTable) table: MatTable<BooksItem>;
  dataSource: BooksTableDataSource;


/****************************************************************************************** */
/**
 * Because of the conditional rendering (*ngIf) of the "table", the flwg will be "undefined" inside ngAfterViewInit:
 *      @ViewChild(MatPaginator) paginator: MatPaginator;
 *      @ViewChild(MatSort) sort: MatSort;
 *      @ViewChild(MatTable) table: MatTable<BooksItem>;  Note: the use case of "table: MatTable" can be that, if the data 
 *                                                        inside "this.dataSource" is updated (when an obs emit new items), we need to set 
 *                                                        `this.table.dataSource = this.dataSource`
 * Solutions
 * 1- ngAfterViewInit approach:
 * 
 *     setDataSourceAttributes() {
 *             this.dataSource.sort = this.sort;
 *              this.dataSource.paginator = this.paginator;
 *             this.table.dataSource = this.dataSource;
 *    }
 *  

 *    alt. 1- if we er using MatTableDataSource instead of a custume one, we can set:
 *       .subscribe(books => {
 *               this.data = books;
 *               this.setDataSourceAttributes()
 *        })
 * 
 *   OR
 * 
 *   alt.  2- use ngDoCheck
 *        - check if the this.dataSource.data is changed, then call setDataSourceAttributes()
 * 
 * 2- without ngAfterViewInit: see the flwg code
 */
  private paginator: MatPaginator;
  private sort: MatSort;
  private table: MatTable<BooksItem>;
  @ViewChild(MatSort) set matTable(mt: MatTable<BooksItem>) {
    this.table = mt;
    this.setDataSourceAttributes();
  }
  @ViewChild(MatSort) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSourceAttributes();
  }
  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.setDataSourceAttributes();
  }
  setDataSourceAttributes() {
    if (this.table) {
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
      this.table.dataSource = this.dataSource;
    }
    if (this.sort) {
      // If the user changes the sort order, reset back to the first page.
      this.sort.sortChange.subscribe(() =>
        this.paginator.firstPage()
      );
    }

  }
/****************************************************************************************** */


  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns: string[] = ['id', 'title', 'chapters', 'pages', 'price'];
  // id: String!
  // title: String
  // chapters: Int
  // pages: Int
  // price: Float
  // storage: Storage!
  // booksToAuthors: [BooksToAuthors!]!
  // booksToReaders: [BooksToReaders!]!
  constructor(private apollo: Apollo) { }

  ngOnInit() {
    this.dataSource = new BooksTableDataSource(this.apollo);
  }



}
