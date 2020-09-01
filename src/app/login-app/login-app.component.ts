import { ServiceService } from './../service.service';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-login-app',
  templateUrl: './login-app.component.html',
  styleUrls: ['./login-app.component.css'],
})
export class LoginAppComponent implements OnInit {
  constructor(private serviceService: ServiceService) {}

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
  entityId: string;
  entName: string;
  entParentName: string;
  focusedInputName: string = 'userInput';
  soapOpeartion: string;
  soapParameters = '';
  alertType = 0; // 0-brak, 1-pozytywny, 2-negatywny
  alertMessage:string = '';
  barcodeValue;
  spanUserClass = 'input-group-prepend';
  spanEntClass = 'input-group-prepend';
  wynik = ''; //odpowiedź web-serwisu
  title = 'Skaner';

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
    document.getElementById('userInput').focus();

    //Uruchomienie serwisu - nasłuchiwanie odpowiedz zwrotnej
    this.serviceService.getResult().subscribe((data) => {
      this.wynik = data;

      //Gdy odpowiedź nadejdzie w zależności od operacji i jej wyniku dokonaj formatowania
      switch (this.soapOpeartion) {
        case 'ValidateUser': {
          if (this.wynik == 'true') {
            this.spanUserClass = 'input-group-prepend ok';
            this.UserNameEmit.emit(this.userId);//Wysyłanie userId do zmiennej globalnej
            this.alertType = 1;
            this.alertMessage = 'Uzytkownik znaleziony'
          } else {
            this.spanUserClass = 'input-group-prepend nok';
            this.alertType = 2;
            this.alertMessage = 'Uzytkownik nie istnieje'
          }
          break;
        }
        case 'GetEntAndParentNameById': {
          const entityArray: Array<string> = this.wynik.split('|');
          if (entityArray[0].substring(1, 12) === 'Entity_name') {
            this.entName = entityArray[0];
            this.entParentName = entityArray[1];
            this.alertMessage = entityArray[0];
            this.EntitiesEmit.emit(this.entName);//Wysyłanie ent do zmiennej globalnej
            this.EntitiesParentEmit.emit(this.entParentName)
            this.alertType = 1;
            this.spanEntClass = 'input-group-prepend ok';
            break;
          } else {
            this.alertMessage = 'Nie znaleziono';
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
