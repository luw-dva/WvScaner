import { LanguageService } from './language.service';
import { ServiceService } from './service.service';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DemoComponent } from './demo/demo.component';
import { BarecodeScannerLivestreamModule } from 'ngx-barcode-scanner';
import { LoginAppComponent } from './login-app/login-app.component';
import { MainAppComponent } from './main-app/main-app.component';
@NgModule({
  declarations: [AppComponent, DemoComponent, LoginAppComponent, MainAppComponent],
  imports: [BrowserModule, HttpClientModule, FormsModule, NgbModule, BarecodeScannerLivestreamModule],
  providers: [ServiceService, LanguageService],
  bootstrap: [AppComponent],
})
export class AppModule {}
