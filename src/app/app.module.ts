import { DataService } from './data.service';
import { ServiceService } from './service.service';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { LoginAppComponent } from './login-app/login-app.component';
import { MainAppComponent } from './main-app/main-app.component';
import { ItemsblockComponent } from './itemsblock/itemsblock.component';
import { BlocksComponent } from './blocks/blocks.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { LoaderComponent } from './loader/loader.component';

@NgModule({
  declarations: [AppComponent, LoginAppComponent, MainAppComponent, ItemsblockComponent, BlocksComponent, LoaderComponent],
  imports: [BrowserModule, HttpClientModule, FormsModule, NgbModule, FontAwesomeModule, ],
  providers: [ServiceService, DataService],
  bootstrap: [AppComponent],
})
export class AppModule {}
