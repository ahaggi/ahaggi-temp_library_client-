import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'substring'
})
export class SubstringPipe implements PipeTransform {



  transform(value: string, startIndex: number, length: number): any {

    // if (startIndex >= value.length)
    //   throw new Error('invalid startIndex!');

    if (startIndex + length  >= value.length)
      return value

    return value.substr(startIndex, length) + '...' ;
  }
}
