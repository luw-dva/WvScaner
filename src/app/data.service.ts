import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor() {
  }

  private lang = new Subject<number>();
  private language:number = 0;
  private userName:string;
  private entName:string;
  private entParentName: string;

  setLanguage(num:number){
        this.language = num;
        this.lang.next(num);
  }

  getLanguage(): Observable<number> {
    return this.lang.asObservable();
  }

  getLanguageFirstTime(): number {
    return this.language;
  }

  setEntName(name:string){
    this.entName = name;
  }

  getEntName(){
    return this.entName;
  }

  setEntParentEntName(name:string){
    this.entParentName = name;
  }

  getEntParentEntName(){
    return this.entParentName;
  }

  setUserName(name:string){
    this.userName = name;
  }

  getUserName(){
    return this.userName;
  }
}
