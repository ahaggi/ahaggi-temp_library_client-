import { Component, forwardRef, Input, OnInit, SimpleChange } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
//************* CVA **************************
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS, Validator, Validators, AbstractControl, ValidationErrors, } from "@angular/forms";


//--------------------------------------------
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InputField, CacheType, InputValueType } from '../../form/input-field.service';

@Component({
  selector: 'app-qry-shared-input',
  templateUrl: './shared-input.component.html',
  styleUrls: ['./shared-input.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SharedInputComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => SharedInputComponent),
      multi: true
    }
  ]

})
export class SharedInputComponent implements OnInit {

  @Input()
  field: InputField;

  termController: FormControl;

  constructor() { }

  ngOnInit(): void {
    this.termController = new FormControl('', this.getVAlidators())

    this.termController.valueChanges.pipe(
      takeUntil(this._ngUnsubscribe$)
    ).subscribe((v) => {
      let input = (this.field.inputValueType == InputValueType.INT ||
        this.field.inputValueType == InputValueType.FLOAT) ?
        +v :
        v;

      this.onChange && this.onChange(input);
      this.field.cache[CacheType.SINGLE] = input
      console.log(" %%%%%%%%%%%%%%%%%   %%%% SharedInputComponent termController.valueChanges %%%%   %%%%%%%%%%%%%%%%%")
    })
  }

  ngAfterViewInit(): void {
    // In case of the user changes the condition in shared-condition.component OR unselect/select a field, the 
    // prev saved value inside the cache (IF EXISTS) should propegate and update the value and validity of its ancestors
    // example:
    /*
     * formGroup{
     *    title:{
     *      contains: "123"
     *    }
     * }
     * 
     * After changing the condition "contains" to be "equals", the formGroup of QryFormComponent should look like the flwg:
     * 
     * formGroup{
     *    title:{
     *      equals: "123"
     *    }
     * }
     */
    let prevCachedValue = this.field.cache[CacheType.SINGLE];
    if (prevCachedValue != null) {
      this.termController.setValue(prevCachedValue)
      this.termController.markAllAsTouched()
      this.termController.updateValueAndValidity()
    }
  }

  InputValueType: typeof InputValueType = InputValueType

  getVAlidators():((control: AbstractControl) => ValidationErrors)[]{
    let _inputValueType = this.field.inputValueType
    let _validators:((control: AbstractControl) => ValidationErrors)[] = []
    switch (_inputValueType) {
      case InputValueType.STRING:
      case  InputValueType.EMAIL:
        _validators = [Validators.required]
        break;
      case InputValueType.INT:
        _validators = [Validators.required, Validators.pattern('\\d+')]

        break;
      case InputValueType.FLOAT:
        _validators = [Validators.required, Validators.pattern('\\d*(\\.)?\\d*')]
        break;
      case InputValueType.PHONE:
        _validators = [Validators.required, Validators.pattern('\\d{1,8}')]
        break;
        default:
        break;
    }

    return _validators
  }

  //************* CVA **************************
  public onTouched: () => void = () => { };
  private onChange: Function;

  writeValue(val: any): void {
    console.log(val)
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  validate(c: AbstractControl): ValidationErrors | null {
    /* 
    This is a costum validation for the parentFormGroup.formControl, since we are using CVA to communicate with the parentFormGroup.formControl.
    To Show this errMsg go to the parent.html for example and add the flwg:
    <mat-error *ngIf="this.formGroup.controls.placeholderForTheChildFormGroup.hasError('invalidSubForm')">
        {{this.formGroup.controls.placeholderForTheChildFormGroup?.errors?.invalidSubForm?.message}}
    </mat-error>
  */
    return this.termController.valid ? null : { invalidSubForm: { valid: false, message: "SharedInputComponent Err Msg" } };
  }
  //--------------------------------------------
  private _ngUnsubscribe$: Subject<void> = new Subject<void>();
  ngOnDestroy(): void {
    console.log("ngOnDestroy app-qry-shared-input ngOnDestroy")
    this._ngUnsubscribe$.next();
    this._ngUnsubscribe$.complete();
  }


}

