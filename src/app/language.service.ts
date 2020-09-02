import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class LanguageService {

  constructor() {
  }
  private lang = new Subject<number>();
  private language:number = 0;

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
}
