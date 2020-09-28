import { DataService } from './../data.service';
import { dict } from './../dictionary';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ServiceService } from '../service.service';

@Component({
  selector: 'app-main-app',
  templateUrl: './main-app.component.html',
  styleUrls: ['./main-app.component.css'],
})
export class MainAppComponent implements OnInit {
  constructor(
    private serviceService: ServiceService,
    private dataService: DataService
  ) {}

  //Emitery// Bindowanie danych logowania
  @Output()
  isLogin = new EventEmitter<number>();

  userName: string;
  entities: string;
  entitiesParent: string;

  //Deklaracja zmiennych
  barCodeResult: string;
  soapOpeartion: string;
  scannedQty: number = 0;
  scannedPT: number = 0;
  staticLocationButtonClass: string = 'btn btn-warning';
  itemButtonClass: string = 'btn btn-warning';
  locksButtonClass: string = 'btn btn-warning';
  isItemActive: boolean = false;
  isLocksActive: boolean = false;
  isSpecialItem: boolean = false;
  isBlocks: boolean = false;
  isStaticLocation: boolean = false;
  language: number;
  alertType = 0; // 0-brak, 1-pozytywny, 2-negatywny
  alertMessage: string = '';
  wynik: any; // Odpowiedź webservice'u

  txtWorker: string;
  txtPosition: string;
  txtQty: string;
  txtScanner: string;
  txtResult: string;
  txtItems: string;
  txtBlocks: string;
  txtWorkcenter: string;
  txtLocation: string;
  itemsResult: Array<{ item: string; message: string }> = [];
  blockResult: Array<{ item: string; message: string; pos: string}> = [];

  parser = new DOMParser();


  ngOnInit(): void {
    this.serviceService.getResult().subscribe((data: any) => {
      this.wynik = data;

      if (this.soapOpeartion === 'GetLocksSpecialItemsByWo') {
        if (this.wynik.getElementsByTagName('BOM_items')[0].childNodes.length) {
          for (
            let i = 0; i < this.wynik.getElementsByTagName('BOM_items')[0].childNodes.length; i++) {
            this.itemsResult[i] = {item: this.wynik.getElementsByTagName('item')[i].getElementsByTagName('item_name')[0].childNodes[0].nodeValue,
              message: this.wynik.getElementsByTagName('item')[i].getElementsByTagName('message')[0].childNodes[0].nodeValue,
            };
          }
          this.isSpecialItem = true;
        }
      }

      if(this.soapOpeartion == 'GetActiveLocksByWoOperation'){

        let xmlDoc = this.parser.parseFromString(this.wynik.getElementsByTagName('q_LockDetails')[0].childNodes[0].nodeValue, "text/xml");
        if (xmlDoc.getElementsByTagName('Locks').length) {
          for (
            let i = 0; i < xmlDoc.getElementsByTagName('Locks').length; i++) {
            this.blockResult[i] = {item: xmlDoc.getElementsByTagName('Lock')[i].getElementsByTagName('Notes')[0].childNodes[0].nodeValue,
              message: xmlDoc.getElementsByTagName('Lock')[i].getElementsByTagName('LockDescription')[0].childNodes[0].nodeValue,
              pos: this.wynik.getElementsByTagName('BundlePosition')[0].childNodes[0].nodeValue,
            };
          }
          this.isBlocks = true;
          this.dataService.setBlocks(this.blockResult);
        }
        this.isLogin.emit(3);
      }

    });

    this.language = this.dataService.getLanguageFirstTime();
    this.dictionaryChangeLanguage();
    this.dataService.getLanguage().subscribe((data) => {
      this.language = data;
      this.dictionaryChangeLanguage();
    });

    this.userName = this.dataService.getUserName();
    this.entities = this.dataService.getEntName();
    this.entitiesParent = this.dataService.getEntParentName();
  }

  dictionaryChangeLanguage() {
    this.txtWorker = dict.get('Worker')[this.language];
    this.txtWorkcenter = dict.get('Workcenter')[this.language];
    this.txtPosition = dict.get('Position')[this.language];
    this.txtQty = dict.get('Qty')[this.language];
    this.txtResult = dict.get('Result')[this.language];
    this.txtItems = dict.get('Items')[this.language];
    this.txtBlocks = dict.get('Blocks')[this.language];
    this.txtLocation = dict.get('StaticLocation')[this.language];
    this.txtScanner = dict.get('Scanner')[this.language];
  }

  //Skaner - gdy odczyta kod kreskowy zapisuje do zmiennej
  //biblioteka Quagga - https://serratus.github.io/quaggaJS/
  barcodeEvent(status: string): void {
    //Wpisz kod kreskowy do aktywnego okna
    this.barCodeResult = status;

    if (this.isItemActive) {
      this.getGetLocksSpecialItemsByWo();
    }

    if (this.isLocksActive) {
      this.getActiveLocksByWoOperation();

    }
  }

  //Webserwis - obsluga wydarzenia
  getGetLocksSpecialItemsByWo(): any {
    this.soapOpeartion = `GetLocksSpecialItemsByWo`;
    const soapParameters =
      `<woId>` +
      this.barCodeResult +
      `</woId>` +
      `<entityId>` +
      this.dataService.getEntId() +
      `</entityId>`;
    this.serviceService.soapCall(this.soapOpeartion, soapParameters);
  }

  getActiveLocksByWoOperation(): any {
    this.soapOpeartion = `GetActiveLocksByWoOperation`;
    const soapParameters =
      `<wo>` +
      this.barCodeResult +
      `</wo>` +
      `<operation>` +
      this.dataService.getEntParentName() +
      `</operation>`;
    this.serviceService.soapQsCall(this.soapOpeartion, soapParameters);
  }

  logout(): void {
    this.isLogin.emit(1);
  }

  activeItem() {
    this.isItemActive = !this.isItemActive.valueOf();
    this.isLocksActive = false;

    if (this.isItemActive) {
      this.itemButtonClass = 'btn btn-info';
      this.locksButtonClass = 'btn btn-warning';
    } else {
      this.itemButtonClass = 'btn btn-warning';
      this.locksButtonClass = 'btn btn-warning';
    }
  }
  activeLocks() {

    this.isLocksActive = !this.isLocksActive;
    this.isItemActive = false;

    if (this.isLocksActive) {
      this.locksButtonClass = 'btn btn-info';
      this.itemButtonClass = 'btn btn-warning';
    } else {
      this.locksButtonClass = 'btn btn-warning';
      this.itemButtonClass = 'btn btn-warning';
    }

  }

  closeSpecialItemWindow(res: boolean) {
    this.isSpecialItem = !res;
    this.itemsResult.length = 0;
  }
}
