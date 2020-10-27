import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { Observable, of, Subject } from 'rxjs';
import { catchError, map, takeUntil } from 'rxjs/operators';
import { Location } from '@angular/common';



import { SharedSelectComponent, SharedSelectOption, SharedSelectOptionPayload } from 'src/app/0-shared-components/shared-select/shared-select.component';
import { postAuthorMut, updateAuthorMut } from 'src/app/util/mutationsDef';
import { getAuthorByIDQry, getAuthorsQry, getBooksQry } from 'src/app/util/queriesDef';
import { FORM_MODE, ImgCategory, loadImageFromStorage } from 'src/app/util/util';
import { MyValidators } from 'src/app/util/_Validators';

@Component({
  selector: 'app-author-form',
  templateUrl: './author-form.component.html',
  styleUrls: ['./author-form.component.css']
})
export class AuthorFormComponent implements OnInit {

  MODE: FORM_MODE;
  authorId: string;

  isLoading: boolean = false;
  isLoadingFailed: boolean = false;

  // Holds the values which presented in the html
  formGroup: FormGroup;

  // Holds the DB values to be edited 
  authorToEdit: _Author;

  submitLabel: string = "";

  booksSelectOptionPayLoad: SharedSelectOptionPayload;

  @ViewChild(SharedSelectComponent)
  private booksSelectComponent: SharedSelectComponent;

  constructor(private apollo: Apollo, private formBuilder: FormBuilder, private route: ActivatedRoute, private location: Location) { }

  ngOnInit(): void {
    this.authorId = this.route.snapshot.paramMap.get('id');



    this.formGroup = this.formBuilder.group({
 
      name: ['', Validators.required],
      email: ['', [Validators.required , Validators.email , ]],
      about: ['', Validators.required],

      // imgUri: [''],
      allAuthors: this.formBuilder.array([], MyValidators. requiredToSelectSomeValidator({ errMsg: "This book has to have at least one author" }))
    });
    this.initData()

  }

  initData() {
    this.isLoading = true;

    if (this.authorId) {
      this.MODE = FORM_MODE.EDIT
      this.submitLabel = "Edit Book";
      this.getAuthorToUpdate().subscribe((_author) => {
        this.authorToEdit = {
          id: _author.id,
          name: _author.name,
          email: _author.email,
          about: _author.about,
          imgUri: loadImageFromStorage(_author?.imgUri, ImgCategory.PERSON),
          booksToAuthors: _author.booksToAuthors,
        }

        this.isLoading = false;

        // NOTE: booksToAuthors, booksToReaders and id: will be ignored inside "patchValue()", since they don't have a correspondent FormControl
        this.formGroup.patchValue(this.authorToEdit)

        this.getlistOfAllBooks().subscribe((books) => {
          this.createSharedSelectOptions(books)
        })
      })
    } else {
      this.MODE = FORM_MODE.CREATE
      this.submitLabel = "Submit";
      this.getlistOfAllBooks().subscribe((books) => {
        this.isLoading = false;
        this.createSharedSelectOptions(books)
      })
    }

  }

  getAuthorToUpdate(): Observable<any> {
    return this.apollo.watchQuery<_Author>({
      variables: { id: this.authorId },
      query: getAuthorByIDQry,
    })
      .valueChanges
      .pipe(
      takeUntil(this._ngUnsubscribe$),

        map((res: any) => res.data.author),
        catchError((err, c) => {
          this.isLoadingFailed = true;
          console.log(err)
          console.log(c)
          return of({})
        })
      )
  }

  getlistOfAllBooks(): Observable<any> {
    return this.apollo.watchQuery<any>({
      query: getBooksQry,
    })
      .valueChanges
      .pipe(
      takeUntil(this._ngUnsubscribe$),

        map((res: any) => res.data.books),

        catchError((err, c) => {
          console.log(err)
          console.log(c)
          return of([])
        }),
      )
  }

  createSharedSelectOptions(_books): void {
    let _booksIdOfThisAuthor = this.authorToEdit?.booksToAuthors?.map((_bta) => _bta.book?.id) || []
    let allBooksFormArray: FormArray = this.formGroup.get('allBooks') as FormArray
    let _list = _books.map(book => {
      let isThisBookAuth: boolean = _booksIdOfThisAuthor.indexOf(book?.id) !== -1
      let fc = new FormControl(isThisBookAuth)
      allBooksFormArray.push(fc)
      let option: SharedSelectOption = {
        uniqueValue: book?.id,
        viewValue: { fst: book?.title, snd: book?.description },
        formControllerBoolean: fc
      }
      return option
    })

    this.booksSelectOptionPayLoad = {
      parentForm: this.formGroup,
      formArray: allBooksFormArray,
      list: _list
    }
  }

  onSubmit() {
    if (this.formGroup.valid) {
      let _booksToAuthors = this.computeBooksToAuthorsStatus()
      let auhtor = {
        id: "string",
        name: "string",
        email: "string",
        about: "string",
        booksToAuthors: _booksToAuthors
      }

      if (this.MODE === FORM_MODE.EDIT) {
        this.updateAuthor(auhtor)
      } else {
        this.postAuthor(auhtor)
      }

      this.goBack();
    }
  }

  postAuthor(data): void {
    console.log("*******************postAuthor*******************")
    this.apollo.mutate({
      mutation: postAuthorMut,
      variables: { data: data },

      refetchQueries: [{
        query: getAuthorsQry
      }],
    })
      .pipe(
      takeUntil(this._ngUnsubscribe$),

        catchError((err, c) => {
          console.log(err)
          console.log(c)
          return of({})
        }),

      ).subscribe((id) => {
        console.log(id)
      })
  }

  updateAuthor(_data): void {
    console.log("*******************updateAuthor*******************")
    this.apollo.mutate({
      mutation: updateAuthorMut,
      variables: { id: this.authorId, data: _data },
    })
      .pipe(
      takeUntil(this._ngUnsubscribe$),

        catchError((err, c) => {
          console.log(err)
          console.log(c)
          return of({})
        }),
      ).subscribe((id) => {
        console.log(id)
      })
  }

  goBack() {
    this.formGroup.disable()
    this.formGroup.reset() // important to prevent canDeactivate guarde from showing a msg.
    this.location.back();

  }

  computeBooksToAuthorsStatus() {

    // selectedAuthsID: this is the list of authors' ids that has been choosed by the user
    // this.authorToEdit will be null in create mode.
    // this.authorToEdit.booksToAuthors: this the state of booksToAuthors in the db which means this is the edit mode
    // this.authorToEdit.booksToAuthors has the flwg structure:
    //                                                     booksToAuthors:{
    //                                                      id:"booksToAuthorsID"
    //                                                       book:{
    //                                                         id:"bookID"
    //                                                         title:"qwe"
    //                                                         ...
    //                                                      }
    //                                                     }

    // if create mode => there's no books' list to edit, but only to add
    let _booksToAuthors: any[] = this.authorToEdit?.booksToAuthors || []
    let booksIDsBeforeEdit = _booksToAuthors.map(({ book: { id } }) => id)

    let selectedBooksID: string[] = this.booksSelectComponent.getSelectedOptions().map(selectOption => selectOption.uniqueValue)

    // let booksIdToConnect = selectedBooksID - booksIDsBeforeEdit
    let booksIdToConnect = selectedBooksID.filter(id => !booksIDsBeforeEdit.includes(id))
    let bookToAuthsIdsToCreate = booksIdToConnect.map(id => { return { book: { connect: { id: id } } } })

    let res = { create: bookToAuthsIdsToCreate }

    if(this.MODE == FORM_MODE.EDIT){
    // let bookToAuthsIDsToDelete = (this.authorToEdit.booksToAuthors.bookId) - selectedBooksID
      let bookToAuthsIDsToDelete = (_booksToAuthors.filter(({ book: { id: bookId } }) => !selectedBooksID.includes(bookId))).map(({ id }) => id)
      let bookToAuthsToDelete = bookToAuthsIDsToDelete.map(btaId => { return { id: btaId } })
      // res = { create: bookToAuthsIdsToCreate, delete: bookToAuthsToDelete }
       res['delete'] =  bookToAuthsToDelete 
    }
    
    return res;
  }

  canDeactivate() {
    if (!this.formGroup.pristine)
      return window.confirm('Discard changes?');
    return true;
  }
  private _ngUnsubscribe$: Subject<void> = new Subject<void>();
  ngOnDestroy(): void {
    this._ngUnsubscribe$.next();
    this._ngUnsubscribe$.complete();
  }

}

type _Author = {
  id: string;
  name: string;
  email: string;
  about: string;
  imgUri: string;
  booksToAuthors: any[];
}
