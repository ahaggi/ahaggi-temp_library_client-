Reactive forms:

- To disable a form-feild-input that has a formController, we can use one of the flwg:
  1- disable the form controller in the component
    borrowedQuantity: [ {value:0 , disabled:true}, Validators... ]
  OR
  2- mark the feild as readOnly in the template:
    <input matInput type="text" formControlName="borrowedQuantity" [readonly]="true" >

ErrorStateMatcher 
    By default, these error messages are shown when the control is invalid and either (touched or the parent form is submitted), 
    If you wish to override this behavior, you can use the errorStateMatcher.

    Usecases:
      - idiomatic validation onChange: Instead of implementing some sort of validation function on (change) property of an input, we can use ErrorStateMatcher to change the validation mechanism which is an idiomatic solution. 
      - idiomatic cross validation onChange: the same as the prev point, but want to validate data in our form, based on other data — in the same form, i.e. 2 feilds for entering a password and we want to validate the 2. field value onChange.
    try to use it for app-shared-select  



Validators:
  sync
    costume validation: take a look at "MyValidator.requiredToSelectSomeValidator" which is a curry-function that returns a 
    function (control: AbstractControl):(ValidationErrors | null).
  Async 
    the same as costume sync validators, but note that:
      1- when adding asyncValidator to controller, make sure to add the validator as 3. arg even if we don't have any syncValidators
       for ex. someControl('' , [] , [asyncValidator]); Notice the empty arr for sync validators.
      2- if you have to use apolloClient in the costume validator, DON'T use apollo.watchQuery BUT use apollo.query
      apollo.watchQuery is like Subject that emits but does not complete,, "open-stream"-ish
      3- if you must use an "open-stream"-ish Observable add the operator "first() or take(1)" at the end of the pipe operator

 Validators.email is dependent on (whatwg specification + some trivial length rules)
^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$

ngOnDestroy does not get excuted:
  If you navigate to another route via <a herf="anotherRoute">, this will cause the whole page to reload,
  which means the hooks-life-cycle will be interrupted and the ngOnDestroy will NOT be excuted. 



------------------------------------------------------------
Updating the Store after a mutation

    ApolloClient can automatically generate unique "object identifiers" (by concatenating __typename + sqlID,, i.e Book:1), this allow ApolloClient to identify the mutated object and updated accordingly.

    If that is not enough, we can mutate the apollo client cache by using one of the following strategy:
    https://www.apollographql.com/docs/angular/features/cache-updates/#updating-after-a-mutation

    1- update strategy (Recomended approach):
        Using update gives you full control over the cache, allowing you to make changes to your data model in response to a mutation in any way you like. update is the recommended way of updating the cache after a query.

            this.apollo.mutate({
              mutation: postBookMut, // this is the mutation
              variables: { data: data },
              update: (store, resp:any) => {
                let createdBook: any =resp?.data?.createdBook
                this.updateStoreAfterCreateBook({store, createdBook})
              }
            })

            updateStoreAfterCreateBook({ store, createdBook }) {
              // 1- Read the data as stored in the cache
              // OBS readQuery will never make a request to your GraphQL server, and it will throw an error if the data is not in your cache. 
              const dataFromStore = store.readQuery({
                query: getBooksQry,
              });

              // 2- mutate the data
              dataFromStore.books = [...dataFromStore.books , createdBook ]

              // 3- update the cache with the updated data
              store.writeQuery({
                query: getBooksQry,
                dataFromStore
              })
            }
    2- refetchQueries
        Take a look at "book-form.component.ts" postBook(_) function


------------------------------------------------------------




Table conditional rendering with (*ngIf)
      Because of the conditional rendering (*ngIf) of the "table", the flwg will be "undefined" inside ngAfterViewInit:
            @ViewChild(MatPaginator) paginator: MatPaginator;
            @ViewChild(MatSort) sort: MatSort;
            @ViewChild(MatTable) table: MatTable<BooksItem>;  Note: the use case of "table: MatTable" can be that, if the data 
                                                              inside "this.dataSource" is updated (when an obs emit new items), we need to set 
                                                              `this.table.dataSource = this.dataSource`
      Solutions
      1- ngAfterViewInit approach:
      
          setDataSourceAttributes() {
                  this.dataSource.sort = this.sort;
                    this.dataSource.paginator = this.paginator;
                  this.table.dataSource = this.dataSource;
          }
        

          alt. 1- if we er using MatTableDataSource instead of a custume one, we can set:
            .subscribe(books => {
                    this.data = books;
                    this.setDataSourceAttributes()
              })
      
        OR
      
        alt.  2- use ngDoCheck
              - check if the this.dataSource.data is changed, then call setDataSourceAttributes()
      
      2- without ngAfterViewInit: see the flwg code
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


mat- toolbar duplicate scrollbar issue:
wrap the content of the navigation-component in one div








*********************************************************
css
NOTE: ::ng-deep is deprecated
applying costumized css to the elems generated by angular/material and been injucted into html page 
/* make the rest of space inside .mat-checkbox clickable */
:host .checkbox-list ::ng-deep .mat-checkbox-layout , :host .checkbox-list ::ng-deep  .mat-checkbox-label  {
    width: 100%;
}
