import { Component, EventEmitter, forwardRef, Input, OnInit, Output, SimpleChange } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Subject, Observable } from 'rxjs';
import { distinctUntilChanged, map, startWith } from 'rxjs/operators';


//************* CVA **************************
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS, Validator, Validators, AbstractControl, ValidationErrors } from "@angular/forms";
//--------------------------------------------

@Component({
  selector: 'app-shared-filtered-select',
  templateUrl: './shared-filtered-select.component.html',
  styleUrls: ['./shared-filtered-select.component.css'],
//************* CVA **************************
/**
 * When we use a formController with some DOM-element, angular uses one of the built-in value accessors provided by the Angular Core
      CheckboxControlValueAccessor
      DefaultValueAccessor
      NumberValueAccessor
      RadioControlValueAccessor
      RangeValueAccessor
      SelectControlValueAccessor
      SelectMultipleControlValueAccessor
 * But if we want to use a FormControl to get the value of (childComponent's formGroup), we can implement CVA.
 */
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SharedFilteredSelectComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => SharedFilteredSelectComponent),
      multi: true
    }
  ]
//--------------------------------------------

})
export class SharedFilteredSelectComponent implements OnInit {


  @Input()
  payload: SharedFilteredSelectPayload;

  formGroup_SFSelect: FormGroup
  
  filteredOptionsObs$: Observable<_Option[]>;

  _filterController = new FormControl();

  constructor(private formBuilder: FormBuilder) { }


  // Intercept inputs property changes with ngOnChanges
  // https://angular.io/guide/component-interaction
  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    if (changes.hasOwnProperty('payload')) {
      this.payload = changes['payload'].currentValue;

      // To make the obsv emit all value for the first time
      this._filterController.setValue('')
    }
  }


  ngOnInit(): void {
    this.formGroup_SFSelect = this.formBuilder.group({
      selectedOption: ['' , Validators.required]
    })

    this.filteredOptionsObs$ = this._filterController.valueChanges.pipe(
      distinctUntilChanged(),
      startWith(''),
      map((value: string) => this.applyFilter(value))
    );
  }

  applyFilter(term: string) {
    const filterValue = term.toLowerCase();
    console.log(filterValue)
    return this.payload?.options?.filter(option => option.viewValue.toLowerCase().includes(filterValue));
  }

  private _ngUnsubscribe$: Subject<void> = new Subject<void>();
  ngOnDestroy(): void {
    this._ngUnsubscribe$.next();
    this._ngUnsubscribe$.complete();
  }


//************* CVA **************************

  public onTouched: () => void = () => {};

  writeValue(val: any): void {
    if(val== '' || val == null){
      this.formGroup_SFSelect.reset()
    }

    val && this.formGroup_SFSelect.setValue(val);
  }
  registerOnChange(fn: any): void {
    this.formGroup_SFSelect.valueChanges.subscribe(fn);
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  
  validate(c: AbstractControl): ValidationErrors | null{
    /* 
    This is a costum validation for the parentFormGroup.formControl (in this case BooksToReadersFormComponent.formGroup.selectedOptionId), since we are using CVA to communicate with the parentFormGroup.formControl.
    To Show this errMsg go to the parent.html for example (books-to-readers-form.component.html) and add the flwg:
    <mat-error *ngIf="this.formGroup.controls.selectedOptionId.hasError('invalidSubForm')">
        {{this.formGroup.controls.selectedOptionId?.errors?.invalidSubForm?.message}}
    </mat-error>

    which is eqv to:
    <mat-error *ngIf="this.formGroup_SFSelect.hasError('invalidSubForm')">
        {{this.formGroup_SFSelect.errors?.invalidSubForm?.message}}
    </mat-error>

*/
    return this.formGroup_SFSelect.valid ? null : { invalidSubForm: {valid: false, message: "SharedFilteredSelectComponent fields are invalid"}};
  }
//--------------------------------------------



}


export type SharedFilteredSelectPayload = {
  optionsLabel: string;
  filterPlaceholder:string;
  options: _Option[];
}

export type _Option = { uniqueValue: any, viewValue: string }

