import { DataService } from './data.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})

export class AppComponent implements OnInit {
  constructor(private dataService: DataService) {}

  i: number = 0;

  languageName: string = '[PL]';
  viewNumber: number;
  scanner:string ;

  scannerChange(){

  }

  ngOnInit(): void {
    this.dataService.setLanguage(0);
    this.viewNumber = 1;
  }

  changeLanguage() {
    this.i++;
    this.i = this.i % 3;
    this.dataService.setLanguage(this.i);
    switch (this.i) {
      case 0: {
        this.languageName = '[PL]';
        break;
      }
      case 1: {
        this.languageName = '[EN]';
        break;
      }
      case 2: {
        this.languageName = '[LT]';
        break;
      }
    }
  }

  isLogin(status: number): void {
    this.viewNumber = status;
  }
}
