import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-shared-card',
  templateUrl: './shared-card.component.html',
  styleUrls: ['./shared-card.component.css']
})
export class SharedCardComponent implements OnInit {
  @Input()
  cardDetails:_CardDetails;

  
  
  
  constructor() { }

  ngOnInit(): void {
  }
}

export type _CardDetails={
  header?:_Header;
  content?:any;
  actionButtons?: _ActionsButtons[]
}

type _Header = {
  avatar?:any;
  img?:any;
  title?:any;
  title_routerLink?:any;

  subtitle?:any;
}

type _ActionsButtons = {
  viewValue:string;
  _onclick?:any
}


