import { LanguageService } from './../language.service';
import { dict } from './../dictionary';
import { ServiceService } from './../service.service';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-login-app',
  templateUrl: './login-app.component.html',
  styleUrls: ['./login-app.component.css'],
})

export class LoginAppComponent implements OnInit {
  constructor(
    private serviceService: ServiceService,
    private languageService: LanguageService
  ) { }

  //Emitery// Bindowanie danych logowania
  @Output()
  EntitiesEmit = new EventEmitter<string>();
  @Output()
  EntitiesParentEmit = new EventEmitter<string>();
  @Output()
  UserNameEmit = new EventEmitter<string>();
  @Output()
  isLogin = new EventEmitter<boolean>();

  //Deklaracja zmiennych
  userId: string;
  language: number;
  entityId: string;
  entName: string;
  entParentName: string;
  focusedInputName: string = 'userInput';
  soapOpeartion: string;
  soapParameters = '';
  alertType = 0; // 0-brak, 1-pozytywny, 2-negatywny
  alertMessage: string = '';
  barcodeValue;
  spanUserClass = 'input-group-prepend';
  spanEntClass = 'input-group-prepend';
  wynik = ''; //odpowiedź web-serwisu
  title = 'Skaner';

  Header_login: string;
  Input_worker: string;
  Input_position: string;
  Message1: string;
  Message2: string;
  Message3: string;
  //Dictionary
  dictionaryChangeLanguage() {
    this.Header_login = dict.get('Header_login')[this.language];
    this.Input_worker = dict.get('Worker')[this.language];
    this.Input_position = dict.get('Position')[this.language];
    this.Message1 = dict.get('Message1')[this.language];
    this.Message2 = dict.get('Message2')[this.language];
    this.Message3 = dict.get('Message3')[this.language];
  }

  //Pobieranie nazwy obecnie aktywnego pola
  getFocusedInputName(name: string) {
    this.focusedInputName = name;
  }
  //Operacje do wykonania po zlokalizowaniu kodu kreskowego
  //Skaner kodów kreskowych - biblioteka Quagga - https://serratus.github.io/quaggaJS/
  barcodeEvent(status: string): void {
    //Wpisz kod kreskowy do aktywnego okna
    (<HTMLInputElement>(
      document.getElementById(this.focusedInputName)
    )).value = status;

    //Wywołanie odpowiedniego webservisu
    switch (this.focusedInputName) {
      case 'userInput': {
        this.userId = status;
        this.getUsers();
        break;
      }
      case 'entInput': {
        this.entityId = status;
        this.getEntity();
        break;
      }
    }
  }

  ngOnInit(): void {

    //Uruchomienie LanguageServisu
    this.language = this.languageService.getLanguageFirstTime();
    this.dictionaryChangeLanguage();
    this.languageService.getLanguage().subscribe((data) => {
      this.language = data;
      this.dictionaryChangeLanguage();
    });

    //Uruchomienie Webserwisu - nasłuchiwanie odpowiedz zwrotnej
    this.serviceService.getResult().subscribe((data) => {
      this.wynik = data;

      //Gdy odpowiedź nadejdzie w zależności od operacji i jej wyniku dokonaj formatowania
      switch (this.soapOpeartion) {
        case 'ValidateUser': {
          if (this.wynik == 'true') {
            this.spanUserClass = 'input-group-prepend ok';
            this.UserNameEmit.emit(this.userId); //Wysyłanie userId do zmiennej globalnej
            this.alertType = 1;
            this.alertMessage = this.Message1;
          } else {
            this.spanUserClass = 'input-group-prepend nok';
            this.alertType = 2;
            this.alertMessage = this.Message2;
          }
          break;
        }
        case 'GetEntAndParentNameById': {
          const entityArray: Array<string> = this.wynik.split('|');
          if (entityArray[0].substring(1, 12) === 'Entity_name') {
            this.entName = entityArray[0];
            this.entParentName = entityArray[1];
            this.alertMessage = entityArray[0];
            this.EntitiesEmit.emit(this.entName); //Wysyłanie ent do zmiennej globalnej
            this.EntitiesParentEmit.emit(this.entParentName);
            this.alertType = 1;
            this.spanEntClass = 'input-group-prepend ok';
            break;
          } else {
            this.alertMessage = this.Message3;
            this.spanEntClass = 'input-group-prepend nok';
            this.alertType = 2;
            break;
          }
        }
      }

      //Jeśli oba pola logowania są poprawne zaloguj użytkownika - przełączenie komponentów w app.component
      if (
        this.spanEntClass == 'input-group-prepend ok' &&
        this.spanUserClass == 'input-group-prepend ok'
      ) {
        this.isLogin.emit(true);
      }
    });
  }

  //Obsługa webserwisów
  getUsers(): any {
    this.soapOpeartion = `ValidateUser`;
    const soapParameters = `<userId>` + this.userId + `</userId>`;
    this.serviceService.soapCall(this.soapOpeartion, soapParameters);
  }

  getEntity(): any {
    this.soapOpeartion = `GetEntAndParentNameById`;
    const soapParameters = `<entId>` + this.entityId + `</entId>`;
    this.serviceService.soapCall(this.soapOpeartion, soapParameters);
  }

  saveU(event) {
    this.getUsers();
  }

  saveE(event) {
    this.getEntity();
  }
}