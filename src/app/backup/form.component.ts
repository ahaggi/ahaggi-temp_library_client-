import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Apollo, Query } from 'apollo-angular';
import gql from 'graphql-tag';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent implements OnInit {
  formGroup: FormGroup;
  formData: FormData;

  books$: Observable<Book[]>;
  foundBook: Book;

  constructor(private formBuilder: FormBuilder, private apollo: Apollo) {

    this.formGroup = this.formBuilder.group({
      bookId: ['', Validators.required],
    });

  }

  ngOnInit(): void {
    this.books$ = this.apollo.watchQuery<_Query>({
      query: gql`
            {
              books{
                id
                title
                chapters
                pages
              }
            }
          `,
    })
      .valueChanges
      .pipe(
        map(result => {
          console.log(result.data)
          return result.data.books
        }
        )
      );
  }


  onSubmit(_formGroup) {
    this.formGroup.reset();
    this.formData = { bookId: _formGroup.bookId };
    console.log('has been submitted', _formGroup);
    let _q = this.formData.bookId
    this.apollo.watchQuery<_Query>({
      query: gql`
      {
        book(id:"${_q}"){
          id
          title
          chapters
          pages
        }
      }
`,
    })
      .valueChanges
      .subscribe(res=>{
        this.foundBook = res.data && res.data.book
        console.log(this.foundBook)
      })


  }

}
interface FormData {
  bookId: string,
}

type _Query = {
  books: Book[];
  book: Book;
}

interface Book {
  id: number,
  title: string,
  pages: number
  chapters: number
}