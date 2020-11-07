import { AbstractControl, ValidatorFn } from '@angular/forms';



const PERSONS_IMAGES = "assets/img/PersonsImgs/"
const BOOK_IMAGES = "assets/img/BooksImgs/"

export const loadImageFromStorage = (imgUri = "", category: ImgCategory) => {

  let imgsPath = category == ImgCategory.BOOK ? BOOK_IMAGES : PERSONS_IMAGES;

  if (imgUri !== "" && isImageExist(imgsPath, imgUri))
    return imgsPath + imgUri
  else
    return imgsPath + "placeHolder.png"
}


let isImageExist = (imgsPath, imgUri) => {
  let regexp = new RegExp('^((person|book)([1-9]|10).png)$');
  return (regexp.test(imgUri));

  // console.log("***************************************")
  // console.log(fs.existsSync)
  // if (fs.existsSync(imgsPath + imgUri))
  //   return true;
  // else
  //   return false;
}

export const formatDateAndTime = (dateAndTime: string): { date: string; time: string; } => {
  if (typeof dateAndTime === 'undefined')
    console.error("formatDateAndTime:  dateAndTime is undefined")
  else if (dateAndTime == null)
    console.error("formatDateAndTime:  dateAndTime is null")
  else if (dateAndTime.length == 0)
    console.error("formatDateAndTime:  dateAndTime is empty string")

  let temp = new Date(dateAndTime)

  var formatDateOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
  var formaTimeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short' };
  var formatDate = new Intl.DateTimeFormat('nb-NO', formatDateOptions)
  var formatTime = new Intl.DateTimeFormat('nb-NO', formaTimeOptions)

  return { date: formatDate.format(temp), time: formatTime.format(temp) }
}


export const generateFakeISBN = ():string => {
// let i = 0;

  // if (i<50){
  //   let a = ["123-4-56782-349-2",
  //   "123-4-56785-534-9",
  //   "123-4-56788-790-6",
  //   "123-4-56784-029-1",
  //   "123-4-56780-199-5",
  //   "123-4-56788-398-4",
  //   "123-4-56784-699-6",
  //   "123-4-56783-712-3",
  //   "123-4-56786-592-8",
  //   "123-4-56788-785-2"]
  //   // i++;
  //   console.log(i)
  //   return a[Math.floor(Math.random() * 10)]
  
  // }else{
    let isbnArr = [1, 2, 3, 4, 5, 6, 7, 8]

    for (let index = 0; index < 4; index++) {
      let digit = Math.floor(Math.random() * 10)
      isbnArr.push(digit);
    }
    let check_digit = 0
  
    isbnArr.forEach((d, i) => {
      let mult = i % 2 == 0 ? 1 : 3
      check_digit += (d * mult)
    })
    check_digit = (10 - (check_digit % 10)) % 10
    isbnArr.push(check_digit)
    let res = isbnArr.map(d => '' + d)
  
    res.splice(12, 0, '-');
    res.splice(9, 0, '-');
    res.splice(4, 0, '-');
    res.splice(3, 0, '-');
  
    // console.log(isbnArr)
    console.log(res.join(''))
    return res.join('')
  
  // }

}


export enum ImgCategory {
  PERSON = 'person',
  BOOK = 'book'
}


export enum FORM_MODE {
  EDIT,
  CREATE
}

