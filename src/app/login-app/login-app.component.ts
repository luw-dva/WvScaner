import { DataService } from './../data.service';
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
    private dataService: DataService
  ) { }

  //Emitery// Bindowanie danych logowania
  @Output()
  isLogin = new EventEmitter<boolean>();

  //Deklaracja zmiennych
  userId: string;
  language: number;
  entityId: string;
  entName: string;
  entParentName: string;
  entHasChildren: boolean = true;
  Can_confirm_single_orders:string;
  Ask_for_steps:string;
  Store_products_attr:string;
  Can_type_location:string;
  Allow_static_location: string;
  focusedInputName: string = 'userInput';
  soapOpeartion: string;
  soapParameters = '';
  islogin: boolean = false;
  alertType = 0; // 0-brak, 1-pozytywny, 2-negatywny
  alertMessage: string = '';
  barcodeValue;
  spanUserClass = 'input-group-prepend';
  spanEntClass = 'input-group-prepend';
  wynik: any; //odpowiedź web-serwisu
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
    this.language = this.dataService.getLanguageFirstTime();

    this.dictionaryChangeLanguage();
    this.dataService.getLanguage().subscribe((data) => {
      this.language = data;
      this.dictionaryChangeLanguage();
    });

    //Uruchomienie Webserwisu - nasłuchiwanie odpowiedz zwrotnej
    this.serviceService.getResult().subscribe((data) => {
      if (!this.islogin){
      this.wynik = data;


      //Gdy odpowiedź nadejdzie w zależności od operacji i jej wyniku dokonaj formatowania
      switch (this.soapOpeartion) {
        case 'ValidateUser': {
          if (this.wynik.childNodes[0].nodeValue === 'true') {
            this.spanUserClass = 'input-group-prepend ok';
            this.dataService.setUserName(this.userId); //Wysyłanie userId do zmiennej globalnej
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
          if (this.wynik.childNodes[0].nodeValue != 'false') {
            try{
              this.entName =this.wynik.getElementsByTagName('Entity_name')[0].childNodes[0].nodeValue;
              this.dataService.setEntName(this.entName);
              this.dataService.setEntId(this.entityId);
            }catch(err){};

            try{
              this.entParentName =  this.wynik.getElementsByTagName('Parent_entity_name')[0].childNodes[0].nodeValue;
              this.dataService.setEntParentName(this.entParentName);
            }catch(err){};

            try{
              this.Can_confirm_single_orders =  this.wynik.getElementsByTagName('Can_confirm_single_orders')[0].childNodes[0].nodeValue;
              this.dataService.setCanConfirmSingleOrders(this.Can_confirm_single_orders);
            }catch(err){};

            try{
              this.Ask_for_steps =  this.wynik.getElementsByTagName('Ask_for_steps')[0].childNodes[0].nodeValue;
              this.dataService.setAskForSteps(this.Ask_for_steps);
            }catch(err){};

            try{
              this.Store_products_attr =  this.wynik.getElementsByTagName('Store_products_attr')[0].childNodes[0].nodeValue;
              this.dataService.setStoreProductsAttr(this.Store_products_attr);
            }catch(err){};

            try{
              this.Can_type_location =  this.wynik.getElementsByTagName('Can_type_location')[0].childNodes[0].nodeValue;
              this.dataService.setCanTypeLocation(this.Can_type_location);
            }catch(err){};

            try{
              this.Allow_static_location =  this.wynik.getElementsByTagName('Allow_static_location')[0].childNodes[0].nodeValue;
              this.dataService.setAllowStaticLocation(this.Allow_static_location);
            }catch(err){};

              this.alertType = 1;
              this.alertMessage = this.entName;
              this.spanEntClass = 'input-group-prepend ok';
              this.getChildren();
              break;
          } else {
              this.alertType = 2;
              this.alertMessage = this.Message3;
              this.spanEntClass = 'input-group-prepend nok';
              break;
          }
        }
        case 'GetChildEntities': {
         this.entHasChildren = this.wynik.childNodes[1].hasChildNodes();

        }
      }

      //Jeśli oba pola logowania są poprawne zaloguj użytkownika - przełączenie komponentów w app.component
      if (
        !this.entHasChildren &&
        this.spanEntClass == 'input-group-prepend ok' &&
        this.spanUserClass == 'input-group-prepend ok'
      ) {
        this.islogin = true;
        this.isLogin.emit(true);
      }
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

  getChildren(): any {
    this.soapOpeartion = `GetChildEntities`;
    const soapParameters = `<entId>` + this.entityId + `</entId>`;
    this.serviceService.soapGsCall(this.soapOpeartion, soapParameters);
  }
}
