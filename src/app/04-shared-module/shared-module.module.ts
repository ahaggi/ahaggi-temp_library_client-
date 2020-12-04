import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';


import { _MaterialModule } from './material-module/material.module'

import { GraphQLModule } from './graphql-module/graphql.module';

import { MatButtonLoadingDirective } from './00-directives/mat-button-loading.directive';
import { SubstringPipe } from './costume-pipes/substring.pipe';

const mm = [
  CommonModule,
  BrowserAnimationsModule,
  FormsModule,
  ReactiveFormsModule,
  HttpClientModule,
  _MaterialModule,
  GraphQLModule,
]

@NgModule({
  declarations: [
    MatButtonLoadingDirective,
    SubstringPipe,

  ],
  imports: [mm],
  exports: [mm, MatButtonLoadingDirective, SubstringPipe],
})

export class SharedModule { }
