import { LanguageService } from './../language.service';
import { dict } from './../dictionary';
import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { ServiceService } from '../service.service';

@Component({
  selector: 'app-main-app',
  templateUrl: './main-app.component.html',
  styleUrls: ['./main-app.component.css']
})
export class MainAppComponent implements OnInit {

  constructor(
    private serviceService: ServiceService,
    private languageService: LanguageService
    ) {}

  //Emitery// Bindowanie danych logowania
  @Output()
  isLogin = new EventEmitter<boolean>();
  @Input()
  userName:string;
  @Input()
  entities:string;
  @Input()
  entitiesParent:string;

  //Deklaracja zmiennych
  barCodeResult: string;
  soapOpeartion: string;
  scannedQty: number = 0;
  scannedPT: number = 0;
  itemButtonClass: string = 'btn btn-warning';
  locksButtonClass: string = 'btn btn-warning';
  isItemActive:boolean = false;
  isLocksActive:boolean = false;
  language: number;
  alertType = 0; // 0-brak, 1-pozytywny, 2-negatywny
  alertMessage:string = '';
  wynik:string; // Odpowiedź webservice'u

  txtWorker: string;
  txtPosition: string;
  txtQty: string;
  txtResult: string
  txtItems: string
  txtBlocks: string
  txtWorkcenter:string;

  ngOnInit(): void {
    this.serviceService.getResult().subscribe((data) => {
      this.wynik = data;
    });

    this.language = this.languageService.getLanguageFirstTime();
    this.dictionaryChangeLanguage();
    this.languageService.getLanguage().subscribe((data) => {
      this.language = data;
      this.dictionaryChangeLanguage();
    });

  }

  dictionaryChangeLanguage() {
    this.txtWorker = dict.get('Worker')[this.language];
    this.txtWorkcenter = dict.get('Workcenter')[this.language];
    this.txtPosition = dict.get('Position')[this.language];
    this.txtQty = dict.get('Qty')[this.language];
    this.txtResult = dict.get('Result')[this.language];
    this.txtItems = dict.get('Items')[this.language];
    this.txtBlocks = dict.get('Blocks')[this.language];
  }

  //Skaner - gdy odczyta kod kreskowy zapisuje do zmiennej
  //biblioteka Quagga - https://serratus.github.io/quaggaJS/
  barcodeEvent(status: string): void {
    //Wpisz kod kreskowy do aktywnego okna
     this.barCodeResult = status;
  }

  //Webserwis - obsluga wydarzenia
  get_XXX(): any {
    this.soapOpeartion = `XXX`;
    const soapParameters = `<Param1>` + this.barCodeResult + `</Param1>`;
    this.serviceService.soapCall(this.soapOpeartion, soapParameters);
  }

  logout(): void {
    this.isLogin.emit(false);
  }

  activeItem(){
    this.isItemActive = !(this.isItemActive.valueOf());
    this.isLocksActive = false;

    if(this.isItemActive){
      this.itemButtonClass = 'btn btn-info';
      this.locksButtonClass = 'btn btn-warning';
     }else{
       this.itemButtonClass = 'btn btn-warning';
       this.locksButtonClass = 'btn btn-warning';
     }
  }
  activeLocks(){
    this.isLocksActive = !this.isLocksActive;
    this.isItemActive = false;

    if(this.isLocksActive){
      this.locksButtonClass = 'btn btn-info';
      this.itemButtonClass = 'btn btn-warning';
     }else{
       this.locksButtonClass = 'btn btn-warning';
       this.itemButtonClass = 'btn btn-warning';
     }
  }
}
