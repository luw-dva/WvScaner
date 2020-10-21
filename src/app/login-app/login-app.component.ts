import { XmlParser } from '@angular/compiler';
import { ServiceService } from './../service.service';
import { ServiceMethod } from './../service.method';
import { DataService } from './../data.service';
import { dict } from './../dictionary';
import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { faIndustry, faUser, faQrcode } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-login-app',
  templateUrl: './login-app.component.html',
  styleUrls: ['./login-app.component.css'],
})

export class LoginAppComponent implements OnInit {
  constructor(
    private serviceService: ServiceService,
    private dataService: DataService
  ) {}

//------DEKLARACJA ZMIENNYCH------
  //Icons
  faIndustry = faIndustry;
  faUser = faUser;
  faQrcode = faQrcode;
  serviceMethod = new ServiceMethod(this.serviceService);

  //Emitery// Bindowanie danych logowania
  @Output()
  isLogin = new EventEmitter<number>();

  //Deklaracja zmiennych standardowych
  userId: string;
  language: number;
  entityId: string;
  entName: string;
  entParentName: string;
  entHasChildren: boolean = true;
  userPcs: string;
  userProcess: string;
  scanner: string;
  Can_confirm_single_orders:string;
  Ask_for_steps:string;
  Store_products_attr:string;
  Can_type_location:string;
  Allow_static_location: string;
  soapOpeartion: string;
  soapParameters = '';
  islogin: boolean = false;
  alertType = 0; // 0-brak, 1-pozytywny, 2-negatywny
  alertMessage: string = '';
  spanUserClass = 'input-group-prepend';
  spanEntClass = 'input-group-prepend';
  wynik: any; //odpowiedź web-serwisu

//------TŁUMACZENIA------
  //Obsługa słownika dla wielu języków odbywa się za pośrednictwem klasy dictionary.ts
  //Deklaracja zmiennych tekstowych, które zostaną pobrane dla danego widoku
  Header_login: string;
  Input_worker: string;
  Input_position: string;
  Message1: string;
  Message2: string;
  Message3: string;
  dictionaryChangeLanguage() {
    this.Header_login = dict.get('Header_login')[this.language];
    this.Input_worker = dict.get('Worker')[this.language];
    this.Input_position = dict.get('Position')[this.language];
    this.Message1 = dict.get('Message1')[this.language];
    this.Message2 = dict.get('Message2')[this.language];
    this.Message3 = dict.get('Message3')[this.language];
  }

//------POBIERANIE DANYCH ZE SKANERA------
  //Scaner odczytuje dane z kodu kreskowego i wprowadza go w aktywne pole tekstowe.
  //Jeśli aktywne nie jest żadne pole tekstowe zczytana wartość zostanie pominięta
  //Dla aplikacji ważne jest aby odczytywać wszystkie skany, dlatego stale aktywuje ona niewidzialne dla użytkownika
  //pole input gdzie obsługiwane jest poźniej.
  //Autofocusowanie się na obiekcie html-input, który pobiera dane ze szczytywanego kodu na skanerze
  @ViewChild('scanInput', {static: false}) scanInput:ElementRef;
  focusOnScanner(){
    setTimeout(() => {
      this.scanInput.nativeElement.setAttribute('readonly', 'readonly'); //nadanie atrybutu readonly uniemożliwi wyświetlenie się na urządzeniach android klawiatury
      this.scanInput.nativeElement.focus();
      setTimeout(() => {
        this.scanInput.nativeElement.removeAttribute('readonly', 'readonly'); //skoro jesteśmy już sfokusowani na tym polu usuwamy readonly, żeby móc wprowadzać wartości
      }, 50);
    }, 50
    )
  }

  //Po odczytaniu danych ze skanera należy obsłużyć zczytaną wartość. Zostaje ona wprowadzona do zmiennej scanner.
  //Menu logowania: dla wartości większych niż 7 znaków zostanie ona umieszczona w polu 'Pracownik'
  //w innym przypadku będzie to pole 'Stanowisko'
  scannerChange(): void {
    if(this.scanner.length > 7){
      this.userId = this.scanner;
      this.serviceMethod.getUsers(this.userId);
      this.scanner = '';
    } else {
      this.entityId = this.scanner;
      this.serviceMethod.getEntity(this.entityId);
      this.scanner = '';
    }
  }

//ngOnInit - uruchamiana jest gdy widok zostaje zainicjowany. (tj. pokazany na ekranie za każdym razem)
  ngOnInit(): void {

    //Focus na niewidoczny input
    this.focusOnScanner();

    //Pobranie tekstów które są tłumaczone na różne języki
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
      this.soapOpeartion = this.serviceService.getSoapOperation();

      //Gdy odpowiedź nadejdzie w zależności od operacji i jej wyniku wyknane zostaną odpowiednie działania
      switch (this.soapOpeartion) {
        case 'ValidateUser': {
          if (this.wynik.childNodes[0].nodeValue === 'true') {
            this.spanUserClass = 'input-group-prepend ok'; //Zmiana koloru inputu na zielony
            this.dataService.setUserName(this.userId); //Wysyłanie userId do zmiennej globalnej, aby móc odczytać ją w każdym widoku
            this.alertMessage = this.Message1;
            this.alertType = 1;
          } else {
            this.spanUserClass = 'input-group-prepend nok'; //Zmiana koloru inputu na czerwony
            this.alertMessage = this.Message2;
            this.alertType = 2;
          }
          break;
        }

        case 'GetEntAndParentNameById': {

            if (this.wynik != 'false') {

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

            this.spanEntClass = 'input-group-prepend ok';  //Zmiana koloru inputu na zielony
            this.alertType = 1;
            this.alertMessage = this.entName;

            this.serviceMethod.getChildren(this.entityId);

              break;
          } else {
            this.spanEntClass = 'input-group-prepend nok';
            this.alertType = 2;
            this.alertMessage = this.Message3;
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
        this.isLogin.emit(2);
        }
      }
    });
  }
  // downloadFile(data) {
  //   const blob = new Blob([data], { type: 'text/xml' });
  //   const url= window.URL.createObjectURL(blob);
  //   window.open(url);
  // }
}
