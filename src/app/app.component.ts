import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})

export class AppComponent implements OnInit {
  constructor() {}

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
    }
}
