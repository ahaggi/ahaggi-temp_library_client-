import { ChangeDetectorRef, Input, SimpleChange } from '@angular/core';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';



@Component({
  selector: 'app-shared-paginated-cards',
  templateUrl: './shared-paginated-cards.component.html',
  styleUrls: ['./shared-paginated-cards.component.css']
})
export class SharedPaginatedCardsComponent<T> implements OnInit {
  @Input()
  payload: _PaginatedCardsPayload<T>;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  dataSource: MatTableDataSource<T>

  obs$: any;

  constructor(private changeDetectorRef: ChangeDetectorRef) {
  }

  ngOnInit() {
    /* 
    used "this.changeDetectorRef.detectChanges()", to avoid
    ExpressionChangedAfterItHasBeenCheckedError: Expression has changed after it was checked
    https://stackoverflow.com/questions/34364880/expression-has-changed-after-it-was-checked 
    */
    this.changeDetectorRef.detectChanges();

    this.dataSource = new MatTableDataSource<T>(this.payload.cards);

    this.dataSource.paginator = this.paginator;

    //this is used to extract the data from dataSource inside the template, since we will use the dataSource without the "mat-table"
    this.obs$ = this.dataSource.connect();
  }

  ngAfterViewInit(): void {

    // this.dataSource.sort = this.sort;

    // If the user changes the sort order, reset back to the first page.
    // this.sort.sortChange.subscribe(() => this.paginator.firstPage());
  }


  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    // if (changes['listOfAllOptions'].isFirstChange()) { // Due to initialization by angular
    //   doStuff();
    // } else {  // due to business logic 
    //   doMoreStuff();
    // }

    this.payload = changes['payload'].currentValue;
    if (this.dataSource != null) {
      this.dataSource.data = this.payload.cards
      this.dataSource.filterPredicate = this.payload.filterPredicate;

    }
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim();
    filterValue = filterValue.toLowerCase();
    this.dataSource.filter = filterValue;
  }

   

}



export type _PaginatedCardsPayload<T>={
  cards: T[];
  filterPredicate:any;
}