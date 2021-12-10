import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { GuardModule } from 'ng-ui-components';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, GuardModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule { }
