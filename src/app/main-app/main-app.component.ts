import { DataService } from './../data.service';
import { dict } from './../dictionary';
import { Component, OnInit, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';
import { ServiceService } from '../service.service';
import { faPowerOff } from '@fortawesome/free-solid-svg-icons';

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

  //Icons
  faPowerOff = faPowerOff;

  //Emitery// Bindowanie danych logowania
  @Output()
  isLogin = new EventEmitter<number>();

  //Deklaracja zmiennych
  userName: string;
  entities: string;
  entId: string;
  scanner: string;
  entitiesParent: string;
  barCodeResult: string;
  soapOpeartion: string;
  scannedQty: string = '0';
  scannedPT: string = '0';
  staticLocationButtonClass: string = 'btn btn-warning';
  itemButtonClass: string = 'btn btn-warning';
  locksButtonClass: string = 'btn btn-warning';
  isItemActive: boolean = false;
  isLocksActive: boolean = false;
  isSpecialItem: boolean = false;
  isBlocks: boolean = false;
  userPcs: string = '0';
  userProcess: string = '0';
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
  txtNoBlocks: string;
  txtWorkcenter: string;
  txtLocation: string;
  itemsResult: Array<{ item: string; message: string }> = [];
  blockResult: Array<{ item: string; message: string; pos: string}> = [];
  parser = new DOMParser();

  @ViewChild('scanInput', {static: false}) scanInput:ElementRef;
  focusOnScanner(){
    setTimeout(() => {
      this.scanInput.nativeElement.setAttribute('readonly', 'readonly');
      this.scanInput.nativeElement.focus();
      setTimeout(() => {
        this.scanInput.nativeElement.removeAttribute('readonly', 'readonly');
      }, 50);
    }, 50
    )
  }

  ngOnInit(): void {
    this.focusOnScanner();
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

     if(this.soapOpeartion == 'GetUserResult'){
        if (this.wynik != 'false') {
          this.userPcs =this.wynik.getElementsByTagName('Worker_pcs')[0].childNodes[0].nodeValue
          this.dataService.setUserPcs(this.userPcs);
          this.userProcess =this.wynik.getElementsByTagName('Worker_process')[0].childNodes[0].nodeValue
          this.dataService.setUserProcess(this.userProcess);
          this.scannedPT = this.dataService.getUserProcess();
          this.scannedQty = this.dataService.getUserPcs();
        }
      }


      if(this.soapOpeartion == 'GetActiveLocksByWoOperation'){
        console.log(this.wynik.childNodes[1].hasChildNodes());
        if (this.wynik.childNodes[1].hasChildNodes()){
        let xmlDoc = this.parser.parseFromString(this.wynik.getElementsByTagName('q_LockDetails')[0].childNodes[0].nodeValue, "text/xml");
        if (xmlDoc.getElementsByTagName('Locks').length) {
          console.log(xmlDoc.childNodes.length);
          console.log(xmlDoc);
          for (
            let i = 0; i < xmlDoc.getElementsByTagName('Locks')[0].childNodes.length; i++) {
              console.log(i + '')
              let items = '';
              let messages = '';
              let poss = '';

              try{
                items = xmlDoc.getElementsByTagName('Lock')[i].getElementsByTagName('Notes')[0].childNodes[0].nodeValue;
              }catch(err){};

              try{
                messages = xmlDoc.getElementsByTagName('Lock')[i].getElementsByTagName('LockDescription')[0].childNodes[0].nodeValue;
              }catch(err){};

              try{
                poss = this.wynik.getElementsByTagName('BundlePosition')[0].childNodes[0].nodeValue;
              }catch(err){};

              if(items.length + messages.length + poss.length > 0 ){
              this.blockResult[i] = { item: items, message: messages, pos: poss };
              }
          }
          this.isBlocks = true;
          this.dataService.setBlocks(this.blockResult);
        }
        this.isLogin.emit(3);
      }else{
        this.alertType = 1;
        this.alertMessage = this.txtNoBlocks;
        setTimeout(() => {
          this.alertType = 0;
        }, 2000);
      }
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
    this.entId = this.dataService.getEntId();
    this.entitiesParent = this.dataService.getEntParentName();
    this.getUserData();
  }

  dictionaryChangeLanguage() {
    this.txtNoBlocks = dict.get('NoLocks')[this.language];
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

  scannerChange(): void {
    if (this.isItemActive) {
      this.getGetLocksSpecialItemsByWo();
      this.scanner = '';
    }

    if (this.isLocksActive) {
      this.getActiveLocksByWoOperation();
      this.scanner = '';
    }
  }

  //Skaner - gdy odczyta kod kreskowy zapisuje do zmiennej
  //biblioteka Quagga - https://serratus.github.io/quaggaJS/
  barcodeEvent(status: string): void {
    //Wpisz kod kreskowy do aktywnego okna
    this.barCodeResult = status;

    if (this.isItemActive) {
      this.getGetLocksSpecialItemsByWo();
      this.scanner = '';
    }

    if (this.isLocksActive) {
      this.getActiveLocksByWoOperation();
      this.scanner = '';
    }
  }

  //Webserwis - obsluga wydarzenia
  getGetLocksSpecialItemsByWo(): any {
    this.soapOpeartion = `GetLocksSpecialItemsByWo`;
    const soapParameters =
      `<woId>` + this.scanner + `</woId>` +
      `<entityId>` + this.entId + `</entityId>`;
    this.serviceService.soapCall(this.soapOpeartion, soapParameters);
  }

  confirmOperation(): any {
    this.soapOpeartion = `ConfirmOperation`;
    const soapParameters =
      `<entityId>` +  this.entId +  `</entityId>` +
      `<woId>` + this.barCodeResult + `</woId>` +
      `<operId>` + this.entitiesParent + `</operId>` +
      `<worker>` +this.userName + `</worker>`;
    this.serviceService.soapCall(this.soapOpeartion, soapParameters);
  }

  confirmBundle(): any {
    this.soapOpeartion = `ConfirmBundle`;
    const soapParameters =
      `<entityId>` +  this.entId +  `</entityId>` +
      `<bundle>` + this.scanner + `</bundle>` +
      `<operId>` + this.entitiesParent + `</operId>` +
      `<worker>` +this.userName + `</worker>`;
    this.serviceService.soapCall(this.soapOpeartion, soapParameters);
  }

  getActiveLocksByWoOperation(): any {
    this.soapOpeartion = `GetActiveLocksByWoOperation`;
    const soapParameters =
      `<wo>` + this.scanner + `</wo>` +
      `<operation>` + 'T5000120' + `</operation>`;
    this.serviceService.soapQsCall(this.soapOpeartion, soapParameters);
  }

  getUserData(): any {
    this.soapOpeartion = `GetUserResult`;
    const soapParameters =
      `<entityId>` + this.entId + `</entityId>
      <worker>` + this.userName + `</worker>`;
    this.serviceService.soapCall(this.soapOpeartion, soapParameters);
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
