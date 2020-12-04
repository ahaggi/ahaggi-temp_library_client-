import { AbstractControl, AsyncValidatorFn, ValidationErrors, ValidatorFn } from '@angular/forms';
import { debounceTime, delay, distinctUntilChanged, first, map, switchMap, take, tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

import { Apollo } from 'apollo-angular';
import { getAuthorByEmailQry } from './gqlUtil/queriesDef';
import { query } from '@angular/animations';
import { DocumentNode } from 'graphql';


export class MyValidators {

  static requiredToSelectSomeValidator: ({ errMsg }?: { errMsg: string }) => ValidatorFn = (opt?) => {
    let { errMsg } = opt
    return (control: AbstractControl): { [key: string]: any } | null =>
      control.value.some(v => v === true)
        ? null : { __errMsg: errMsg || "This list can't be empty" };
  }

  static emailAlreadyRegisteredValidator: (args: emailAlreadyRegisteredArgs) => AsyncValidatorFn = ({ errMsg, apollo , exceptValue  , query}) => {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {

      if (control?.valueChanges && control.value != exceptValue) {
        return control?.valueChanges
          .pipe(
            debounceTime(400),
            distinctUntilChanged(),
            switchMap((value: string) => // for every new event subscribe to the flwg inner obsv
              apollo.query<any>({
                variables: { email: value },
                query: query,
              })
            ),
            map((res) => ((res.data.res?.id) !== null && typeof (res.data.res?.id) !== 'undefined')),
            map((result: boolean) => result ? { __errMsg: errMsg } : null),
            map((result) => {console.log(result) ; return result}),
            take(1)
          )
      }
      return of(null)
    };
  }
}

type emailAlreadyRegisteredArgs = {
  errMsg: string, apollo: Apollo, exceptValue:string , query:DocumentNode
}

export function example(nameRe: RegExp): ValidatorFn {

  return (control: AbstractControl): { [key: string]: any } | null => {
    const forbidden = nameRe.test(control.value);
    return forbidden ? { forbiddenName: { value: control.value } } : null;
  };


}
