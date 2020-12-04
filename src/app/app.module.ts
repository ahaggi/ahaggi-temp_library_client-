import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { SharedModule } from './04-shared-module/shared-module.module'

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { NavigationBarComponent } from './navigation-bar/navigation-bar.component';

import { NotificationsComponent } from './dashboard/notifications/notifications.component';
import { DashboardComponent } from './dashboard/dashboard.component';

import {LibraryModule} from './01-library-module/library.module'
import {QryModule} from './02-qry-module/qry.module'

import { SharedTableFactoryModule } from './03-shared-table-factory-module/shared-table-factory.module';

@NgModule({
  declarations: [
    AppComponent,
    NavigationBarComponent,
    DashboardComponent,
    NotificationsComponent,
  ],
  imports: [
    BrowserModule,
    // SharedModule contains:  Common, BrowserAnimations, ReactiveForms, HttpClient, Materials , GraphQLModule and (declares & exports MatButtonLoadingDirective, SubstringPipe)
    SharedModule,

    SharedTableFactoryModule,// because we are using the tables in dash-board.html
    LibraryModule,
    QryModule,

    AppRoutingModule,// since the wildcard routes presence in "AppRoutingModule", always keep "AppRoutingModule" after importing another modules the contains routings configurations
  ],
  providers: [],

  bootstrap: [AppComponent]
})
export class AppModule { }
