import { Component, forwardRef, Input, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroupDirective, NgForm, ValidationErrors, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CacheType, InputField, InputValueType } from '../../form/input-field.service';

//************* CVA **************************
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS } from "@angular/forms";
import { MatButtonToggleGroup } from '@angular/material/button-toggle';
import { ErrorStateMatcher } from '@angular/material/core';
//--------------------------------------------

@Component({
  selector: 'app-shared-input-boolean',
  templateUrl: './shared-input-boolean.component.html',
  styleUrls: ['./shared-input-boolean.component.css']  ,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SharedInputBooleanComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => SharedInputBooleanComponent),
      multi: true
    }
  ]
})
export class SharedInputBooleanComponent implements OnInit {

  @Input()
  field: InputField;

  termController: FormControl;

  constructor() { }

  ngOnInit(): void {
    this.termController = new FormControl('', [Validators.required]) 

    this.termController.valueChanges.pipe(
      takeUntil(this._ngUnsubscribe$)
    ).subscribe((v) => {
      let bool :boolean = v as boolean
      this.onChange && this.onChange(bool);
      this.field.cache[CacheType.SINGLE] = bool
      console.log(" %%%%%%%%%%%%%%%%%   %%%% SharedInputBooleanComponent termController.valueChanges %%%%   %%%%%%%%%%%%%%%%%")
    })
  }

  // @ViewChild("matButtonToggleGroup") matButtonToggleGroup: MatButtonToggleGroup;
  // errorMatcher: MyErrorStateMatcher;

  
  ngAfterViewInit(): void {
    let prevCachedValue = this.field.cache[CacheType.SINGLE];
    if (prevCachedValue != null) {
      this.termController.setValue(prevCachedValue)
      this.termController.markAllAsTouched()
      this.termController.updateValueAndValidity()
    }
    // this.termController.statusChanges.subscribe(
    //   status => this.matButtonToggleGroup.errorState = status === 'INVALID'
    // );

  }

  InputValueType: typeof InputValueType = InputValueType

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

// class MyErrorStateMatcher implements ErrorStateMatcher {
//   isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
//     let a = !!(control && control.invalid && (control.dirty || control.touched))
//     return a;
//   }
// }
