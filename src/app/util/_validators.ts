import { AbstractControl, ValidatorFn } from '@angular/forms';


export class MyValidators {

     static requiredToSelectSomeValidator: ({errMsg:string}?)=> ValidatorFn = (opt?)=>{
        let {errMsg} = opt
        return (control: AbstractControl): { [key: string]: any } | null =>
          control.value.some(v => v === true)
            ? null : { __errMsg: errMsg || "This list can't be empty" };
      }
      
      static isNotRegisteredEmailValidator: ({errMsg:string}?)=> ValidatorFn = (opt?)=>{
        let {errMsg} = opt
        return (control: AbstractControl): { [key: string]: any } | null =>
          control.value.some(v => v === true)
            ? null : { __errMsg: errMsg || "This list can't be empty" };
      }

}


