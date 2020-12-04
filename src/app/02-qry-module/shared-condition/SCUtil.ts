import { AbstractControl, ValidationErrors, Validators } from '@angular/forms'

export class SCUtil{

    static getDatePatternValidator(filteringCondition:string): ((control: AbstractControl) => ValidationErrors) {

        // equals: "=",       
        // in: "∈",           
        // notIn: "∉",        
        // lt: "<",               before the date
        // lte: "<=",             at the date or before 
        // gt: ">",               after the date               
        // gte: ">=",             at the date or after       
        // Invalid value for a date, a valid value is in form of 'dd*MM*yyyy' without space, where * is one of (/ , - , .)
    
        // contains: "∋",                                      
        // Invalid value for a date, a valid value is in form of 'dd*MM*yyyy', 'dd*MM*', '*MM*yyyy', '*yyyy' , '*MM*' or 'dd*' without space, where * is one of (/ , - , .)
    
    
        const dd_MM_yyyy = '^(?:(?:31(?<a>\\/|-|\\.)(?:0[13578]|1[02]))\\k<a>|(?:(?:29|30)(?<b>\\/|-|\\.)(?:0[13-9]|1[0-2])\\k<b>))(?:(?:20|19)\\d{2})$|^(?:29(?<c>\\/|-|\\.)(?:02)\\k<c>(?:(?:(?:20|19)(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0[1-9]|1\\d|2[0-8])(?<d>\\/|-|\\.)(?:(?:0[1-9])|(?:1[0-2]))\\k<d>(?:(?:20|19)\\d{2})$'
        // const dd_MM_ = '^(?:(?:31(?<e>\\/|-|\\.)(?:0[13578]|1[02]))\\k<e>|(?:(?:29|30)(?<f>\\/|-|\\.)(?:0[13-9]|1[0-2])\\k<f>))$|^(?:29(?<g>\\/|-|\\.)(?:02)\\k<g>)$|^(?:0[1-9]|1\\d|2[0-8])(?<h>\\/|-|\\.)(?:(?:0[1-9])|(?:1[0-2]))\\k<h>$'
        const _MM_yyyy = '^(?:(?<i>\\/|-|\\.)(?:0[1-9]|1[012])\\k<i>(?:19|20)\\d\\d)$'
        const _yyyy = '^(?:(?<j>\\/|-|\\.)(?:19|20)\\d\\d)$'
        const _MM_ = '^(?<k>\\/|-|\\.)(?:0[1-9]|1[012])\\k<k>$'
        // const dd_ = '^(?:0[1-9]|[12][0-9]|3[01])(?:\\/|-|\\.)$'
    


        let pattern = dd_MM_yyyy;
    
        switch (filteringCondition) {
          case "contains":
            pattern = dd_MM_yyyy + //'|' + dd_MM_ +
             '|' + _MM_yyyy + '|' + _yyyy + '|' + _MM_ // + '|' + dd_
            break;
          // case "startsWith":
          //   pattern = dd_MM_yyyy //+ '|' + dd_MM_ + '|' + dd_
    
          //   break;
          // case "endsWith":
          //   pattern = dd_MM_yyyy + '|' + _MM_yyyy + '|' + _yyyy
          //   break;
    
          default:
            pattern = dd_MM_yyyy;
            break;
        }
        return Validators.pattern(pattern)
      }
}