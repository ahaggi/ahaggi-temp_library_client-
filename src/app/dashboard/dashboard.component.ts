import { Component } from '@angular/core';
import { map } from 'rxjs/operators';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import {MODE} from '../03-shared-table-factory-module/01-books-table/books-table.component'
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {


  MODE: typeof MODE = MODE

  /** Based on the screen size, switch from standard to one column per row */
  cardsLayout = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
    map(({ matches }) => {
      if (matches) {
        return {
          gridListCols:1,
          booksTable:{title: 'Card 1', cols: 1, rows: 2 },
          info:{title: 'Card 2', cols: 1, rows: 1 },
          todo1:{title: 'Card 3', cols: 1, rows: 1},
          todo2:{title: 'Card 4', cols: 1, rows: 1},
        }
        }
        
        
      

      return {
        gridListCols:4,
        booksTable:{title: 'Card 1', cols: 3, rows: 2 },
        info:{title: 'Card 2', cols: 1, rows: 1 },
        todo1:{title: 'Card 3', cols: 2, rows: 1},
        todo2:{title: 'Card 4', cols: 2, rows: 1},

      } 
      
    })
  );

  constructor(private breakpointObserver: BreakpointObserver) {}
}
