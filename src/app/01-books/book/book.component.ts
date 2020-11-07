import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { of, Subject } from 'rxjs';
import { catchError, map, takeUntil } from 'rxjs/operators';
import { getBookByIDQry } from 'src/app/util/queriesDef';


import { _CardDetails } from '../../0-shared-components/card/shared-card.component'
import { _PaginatedCardsPayload } from '../../0-shared-components/shared-paginated-cards/shared-paginated-cards.component'
import { loadImageFromStorage, ImgCategory, formatDateAndTime } from '../../util/util'



@Component({
  selector: 'app-book',
  templateUrl: './book.component.html',
  styleUrls: ['./book.component.css']
})
export class BookComponent implements OnInit {

  book: _Book = {
    id: "",
    title: "",
    isbn: "",
    pages: 0,
    chapters: 0,
    storage: {},
    price: 0,
    available: false,
    authors: [],
    readers: [],
    imgUri: "",

  } as _Book


  readersCards: _PaginatedCardsPayload<_CardDetails> = {} as _PaginatedCardsPayload<_CardDetails>;
  authorsCards: _PaginatedCardsPayload<_CardDetails> = {} as _PaginatedCardsPayload<_CardDetails>;

  constructor(
    private apollo: Apollo,
    private route: ActivatedRoute,
  ) {
  }

  BTRformVisible = false
  showBTRform(bool) {
    this.BTRformVisible = bool
  }

  ngOnInit(): void {
    this.getBook()
  }

  getBook(): void {
    const id: string = this.route.snapshot.paramMap.get('id');
    this.apollo.watchQuery<_Book>({
      variables: { id: id },
      query: getBookByIDQry,
    })
      .valueChanges
      .pipe(
        // delay(3000),
        takeUntil(this._ngUnsubscribe$),
        map((res: any) => {
          console.log(res)
          return res.data.book
        }),
        catchError((err, c) => {
          console.log(err)
          console.log(c)
          return of({}) // TODO
        }),

      ).subscribe((book) => {
        console.log(book)

        this.book.id = book.id
        this.book.title = book.title
        this.book.isbn = book.isbn
        this.book.pages = book.pages
        this.book.chapters = book.chapters
        this.book.price = book.price
        this.book.description = book.description


        this.book.storage = book.storage

        this.book.available = book.available
        this.book.imgUri = loadImageFromStorage(book?.imgUri, ImgCategory.BOOK)

        this.book.authors = book.booksToAuthors.map((bta) => {
          //_CardDetails  {header:{title:"wer" ,avatar:"" , subtitle:"" } , content:"content" , actionButtons:[]}
          let cardDetails: _CardDetails = {};
          cardDetails.header = { avatar: loadImageFromStorage(bta.author.imgUri, ImgCategory.PERSON), title: bta.author.name, subtitle: bta.author.about, title_routerLink: `/author/${bta.author.id}` };
          return cardDetails;
        })

        // instead of using "this.book.readers" in this component's template, it will be assigned to one of the "this.readersCards" properties.
        this.book.readers = book.booksToReaders.map((btr) => {
          //_CardDetails  {header:{title:"wer" ,avatar:"" , subtitle:"" } , content:"content" , actionButtons:[]}
          let { date: bd } = formatDateAndTime(btr.borrowDate)
          let { date: rd } = formatDateAndTime(btr.returnDate)
          let cardDetails: _CardDetails = {};
          cardDetails.header = { title: btr.reader.name, subtitle: `Id: ${btr.reader.costumerId},\n Borrowing's Date: ${bd} - ${rd}`, title_routerLink: `/reader/${btr.reader.id}` };
          return cardDetails;
        })

        //------------------------------------------------------------------------------------------------------------------------
        // this will be used inside the "SharedPaginatedCardsComponent" which wraps list of cards with a pagination and filtering features.
        // The list of cards in this case are an instance of the component "SharedCardComponent"
        this.authorsCards = {
          cards: this.book.authors,
          filterPredicate: (authorCard, filter: string): boolean => {
            return authorCard.header.title.toLowerCase().includes(filter.toLowerCase());
          },
          filterInputPlaceholder: "Filter Author's name only.."

        }

        this.readersCards = {
          cards: this.book.readers,
          filterPredicate: (readerCard, filter: string): boolean => {
            let term = filter.toLowerCase()
            return (
              readerCard.header.title.toLowerCase().includes(term) ||
              readerCard.header.subtitle.toLowerCase().includes(term)
            );
          },
          filterInputPlaceholder: "Filter By Reader or Date.."

        }
        //------------------------------------------------------------------------------------------------------------------------
      })
  }

  hasReaders(){
    return this.readersCards.cards && this.readersCards.cards.length != 0
  }

  hasAuthors(){
    return this.authorsCards.cards && this.authorsCards.cards.length != 0
  }
  private _ngUnsubscribe$: Subject<void> = new Subject<void>();
  ngOnDestroy(): void {
    this._ngUnsubscribe$.next();
    this._ngUnsubscribe$.complete();
  }


  removePayload() {

  }

}

type _Book = {
  id: string;
  title: string;
  isbn: string;
  pages: number;
  chapters: number;
  storage: any;
  price: number;
  description: string;
  available: boolean;
  authors: any[];
  readers: any[];
  imgUri: string;
}




  ;
