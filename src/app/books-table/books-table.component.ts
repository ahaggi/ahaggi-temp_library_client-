import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
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
export class BooksTableComponent implements AfterViewInit, OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatTable) table: MatTable<BooksItem>;
  dataSource: BooksTableDataSource;


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

  ngOnInit() {
    this.dataSource = new BooksTableDataSource(this.apollo);
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.table.dataSource = this.dataSource;
    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe(() => 
      this.paginator.firstPage()
      );

  }

  constructor(private apollo: Apollo) { }
}
