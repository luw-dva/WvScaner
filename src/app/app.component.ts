import { Component, OnInit } from '@angular/core';
import { LanguageService } from './language.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})

export class AppComponent implements OnInit {
  constructor(private languageService: LanguageService) {

  }

  i: number = 0
  languageName: string = '[PL]';

  changeLanguage(){
  this.i++;
  this.i = this.i%3;
  this.languageService.setLanguage(this.i);
    switch(this.i){
      case 0:{
        this.languageName = '[PL]';
        break;
      }
      case 1:{
        this.languageName = '[EN]';
        break;
      }
      case 2:{
        this.languageName = '[LT]';
        break;
      }
    };
  }

  userName: string;
  entName: string;
  entParentName: string;
  isLoginSucces: boolean = false;

  getEntName(name: string){
    this.entName = name.substring(name.indexOf(':')+2);
  }

  getParentName(name: string){
    this.entParentName = name.substring(name.indexOf(':')+2);
  }

  getUserName(name: string){
    this.userName = name;
  }

  isLogin(status: boolean): void{
    this.isLoginSucces = status;
  }

  ngOnInit(): void {
    this.languageService.setLanguage(0);
    }
}
