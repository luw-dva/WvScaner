import { DataService } from './data.service';
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
import { ItemsblockComponent } from './itemsblock/itemsblock.component';
import { BlocksComponent } from './blocks/blocks.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';


@NgModule({
  declarations: [AppComponent, DemoComponent, LoginAppComponent, MainAppComponent, ItemsblockComponent, BlocksComponent],
  imports: [BrowserModule, HttpClientModule, FormsModule, NgbModule, BarecodeScannerLivestreamModule, FontAwesomeModule, ],
  providers: [ServiceService, DataService],
  bootstrap: [AppComponent],
})
export class AppModule {}
