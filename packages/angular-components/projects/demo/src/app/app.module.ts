import { BrowserModule } from '@angular/platform-browser'
import { NgModule } from '@angular/core'
import { AuthingGuardModule } from 'ng-ui-components'

import { AppComponent } from './app.component'

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, AuthingGuardModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
