import { Component, Input, OnDestroy, OnInit, SimpleChange } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Observable, of, merge, Subject } from 'rxjs';
import { distinctUntilChanged, map, startWith, takeUntil, toArray } from 'rxjs/operators';

@Component({
  selector: 'app-shared-select',
  templateUrl: './shared-select.component.html',
  styleUrls: ['./shared-select.component.css']
})
export class SharedSelectComponent implements OnInit, OnDestroy {

  @Input()
  payload: SharedSelectOptionPayload;

  filteredOptionsObs$: Observable<SharedSelectOption[]>;

  selectedOptions: SharedSelectOption[];

  filterController = new FormControl();

  private _ngUnsubscribe$: Subject<void> = new Subject<void>();

  constructor() { }

  ngOnDestroy(): void {

    this._ngUnsubscribe$.next();
    this._ngUnsubscribe$.complete();
  }

  // Intercept inputs property changes with ngOnChanges
  // https://angular.io/guide/component-interaction
  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {

    if (changes.hasOwnProperty('payload')) {
      this.payload = changes['payload'].currentValue;
      this.selectedOptions = this.selectedOptions || []
      this._init()
    }
  }


  ngOnInit(): void {


    this.filteredOptionsObs$ = this.filterController.valueChanges.pipe(
      distinctUntilChanged(),
      startWith(''),
      map((value: string) => this.applyFilter(value))
    );
  }



  _init() {
    // Edeg usecase: what if the value of listOfAllUsers been updated, while the user filling the form?
    // ...

    this.payload.list.forEach((option => {
      if (option.formControllerBoolean.value) this.selectedOptions.push(option)
    }))

    // To listen to any event triggered by each FormController inside this.payload.formArray
    let listOfObservables = this.payload.formArray.controls.map((control: AbstractControl, index: number) =>
      control.valueChanges.pipe(
        map(value => { return { formControlIndex: index, value: value } }),
      ));

    merge(...listOfObservables).pipe(
      takeUntil(this._ngUnsubscribe$)
    ).subscribe(changeEvent => this.onChange(changeEvent));


    this.filterController.setValue('')
  }


  onChange(changeEvent) {
    if (changeEvent.value)
      this.addselectedOption(this.payload.list[changeEvent.formControlIndex])
    else
      this.removeselectedOption(this.payload.list[changeEvent.formControlIndex])
  }

  addselectedOption(option) {
    this.selectedOptions.push(option)
  }

  removeselectedOption(option) {
    let ndx = this.selectedOptions.indexOf(option)
    if (ndx != -1)
      this.selectedOptions.splice(ndx, 1)
  }

  changeFormControllerValue(option) {
    // curr.value is true ==> becuase this function has been called through chiplist  
    let curr: FormControl = option.formControllerBoolean
    if (curr.value) {
      curr.setValue(false); // this will emit an event, and that event cuase the function 'removeselectedOption(option)' to be excuted
      curr.markAsDirty()
    }
  }

  applyFilter(term: string) {
    const filterValue = term.toLowerCase();
    console.log(filterValue)
    return this.payload.list.filter(option =>
      (option.viewValue.fst.toLowerCase().includes(filterValue) ||
        option.viewValue.snd.toLowerCase().includes(filterValue))
    );
  }


  getSelectedOptions() {
    return this.selectedOptions
  }
}




export type SharedSelectOption = {
  uniqueValue: string;
  viewValue: { fst: string, snd: string };
  formControllerBoolean: FormControl;
}

export type SharedSelectOptionPayload = {
  list: SharedSelectOption[],
  formArray: FormArray,
  parentForm:FormGroup
}