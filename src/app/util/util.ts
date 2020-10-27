import { AbstractControl, ValidatorFn } from '@angular/forms';



const PERSONS_IMAGES = "assets/img/PersonsImgs/"
const BOOK_IMAGES = "assets/img/BooksImgs/"

export let loadImageFromStorage = (imgUri = "", category: ImgCategory) => {

  let imgsPath = category == ImgCategory.BOOK ? BOOK_IMAGES : PERSONS_IMAGES;

  if (imgUri !== "" && isImageExist(imgsPath , imgUri))
    return imgsPath + imgUri
  else
    return imgsPath + "placeHolder.png"
}


let isImageExist = (imgsPath , imgUri) => {
  let regexp = new RegExp('^((person|book)([1-9]|10).png)$');
  return (regexp.test(imgUri));

  // console.log("***************************************")
  // console.log(fs.existsSync)
  // if (fs.existsSync(imgsPath + imgUri))
  //   return true;
  // else
  //   return false;
}



export enum ImgCategory {
  PERSON = 'person',
  BOOK = 'book'
}


export enum FORM_MODE {
  EDIT,
  CREATE
}

