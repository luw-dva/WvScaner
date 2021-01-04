import { ServiceService } from '../service.service';
import { ServiceMethod } from '../service.method';
import { DataService } from './../data.service';
import { dict } from './../dictionary';
import { Component, OnInit, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';
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
  ){}

//--------DEKLARACJA ZMIENNYCH------
  //Icons
  faPowerOff = faPowerOff;

  //Emitery// Bindowanie danych logowania
  @Output()
  isLogin = new EventEmitter<number>();
  @Output()
  isLoader = new EventEmitter<boolean>();

  //Deklaracja zmiennych
  private sub: any;
  serviceMethod = new ServiceMethod(this.serviceService);
  userName: string;
  entities: string;
  entId: string;
  scanner: string;
  loader: boolean = false;
  entitiesParent: string = 'none';
  soapOpeartion: string;
  scannedQty: string = '0';
  scannedPT: string = '0';
  staticLocationButtonClass: string = 'btn btn-warning';
  itemButtonClass: string = 'btn btn-warning';
  locksButtonClass: string = 'btn btn-warning';
  isItemActive: boolean = false;
  isLocksActive: boolean = false;
  isSpecialItem: boolean = false;
  isSpecialItemConfirm: boolean = false;
  isBlocks: boolean = false;
  userPcs: string = '0';
  userProcess: string = '0';
  isStaticLocation: boolean = false;
  language: number;
  alertType = 0; // 0-brak, 1-pozytywny, 2-negatywny
  alertMessage: string = '';
  wynik: any; // Odpowiedź webservice'u
  rgb: string = 'x';
  rgb2: string = 'x';
  rgbBG: string;
  rgbBG2: string;
  itemsResult: Array<{ item: string; message: string; rgb: string}> = [];
  blockResult: Array<{ item: string; message: string; pos: string; qConfirm}> = [];
  parser = new DOMParser();

  txtWorker: string;
  txtPosition: string;
  txtQty: string;
  txtScanner: string;
  txtResult: string;
  txtItems: string;
  txtBlocks: string;
  txtNoBlocks: string;
  txtNoSpecItem: string;
  txtWorkcenter: string;
  txtLocation: string;

//------TŁUMACZENIA-------
  dictionaryChangeLanguage() {
    this.txtNoSpecItem = dict.get('NoSpecItem')[this.language]
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

//-----INPUT DLA SKANERA-----
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

//Uruchomienie tłumaczeń
  dictionaryInit(){
       this.language = this.dataService.getLanguageFirstTime();
       this.dictionaryChangeLanguage();
       this.dataService.getLanguage().subscribe((data) => {
         this.language = data;
         this.dictionaryChangeLanguage();
       });
  }

  scannerChange(): void {
    if(!this.loader){
        this.loader = true;
        this.isLoader.emit(this.loader);
      if (this.isItemActive) {
        this.serviceMethod.getLocksSpecialItemsById(this.scanner, this.entId);
        this.scanner = '';
      }

      if (this.isLocksActive) {
        this.dataService.setBlockJust2Check(true);
        this.serviceMethod.GetActiveLocksByIdOperation(this.scanner, this.entitiesParent);
        this.scanner = '';
      }

      if (this.entitiesParent == 'T4000140' && !this.isItemActive && !this.isLocksActive ){
        this.isSpecialItemConfirm = true;
        this.serviceMethod.getLocksSpecialItemsById(this.scanner, this.entId);
      }else if (!this.isItemActive && !this.isLocksActive){
        this.dataService.setWo(this.scanner);
        this.dataService.setBlockJust2Check(false);
        this.serviceMethod.GetActiveLocksByIdOperation(this.scanner, this.entitiesParent);
        this.scanner = '';
      }
    }
  }

//------ngOnINIT----
  ngOnInit(): void {
    this.focusOnScanner();
    this.dictionaryInit();
    this.isSpecialItemConfirm = false;

    this.userName = this.dataService.getUserName();
    this.entities = this.dataService.getEntName();
    this.entId = this.dataService.getEntId();
    this.entitiesParent = this.dataService.getEntParentName();
    this.serviceMethod.getUserData(this.entId, this.userName);

    //Funckje dla webservice'u
    this.sub = this.serviceService.getResult().subscribe((data: any) => {
      this.wynik = data;
      this.soapOpeartion = this.serviceService.getSoapOperation();

      if (this.soapOpeartion == 'ConfirmBackground') {
        if (data != false){
        this.userPcs =this.wynik.getElementsByTagName('Worker_pcs')[0].childNodes[0].nodeValue
        this.dataService.setUserPcs(this.userPcs);
        this.userProcess =this.wynik.getElementsByTagName('Worker_process')[0].childNodes[0].nodeValue
        this.dataService.setUserProcess(this.userProcess);
        this.scannedPT = this.dataService.getUserProcess();
        this.scannedQty = this.dataService.getUserPcs();
      }
      this.soapOpeartion = '';
      this.isSpecialItemConfirm = false;
      this.scanner = '';
    }

      if (this.soapOpeartion == 'GetLocksSpecialItemsById') {
        try{
        if (this.wynik.getElementsByTagName('BOM_items')[0].childNodes.length) {
          this.rgb = '';
          this.rgb2 = '';
          for (let i = 0; i < this.wynik.getElementsByTagName('BOM_items')[0].childNodes.length; i++) {
              let rgb_ds = 'x';
              try {
                rgb_ds = this.wynik.getElementsByTagName('item')[i].getElementsByTagName('rgb')[0].childNodes[0].nodeValue;
                if( this.rgb == ''){
                  this.rgb = rgb_ds;
                }else{
                  this.rgb2 = rgb_ds;
                }
              } catch(error){};

            this.itemsResult[i] = {item: this.wynik.getElementsByTagName('item')[i].getElementsByTagName('item_name')[0].childNodes[0].nodeValue,
              message: this.wynik.getElementsByTagName('item')[i].getElementsByTagName('message')[0].childNodes[0].nodeValue,
              rgb: rgb_ds
            };
          }
            this.isSpecialItem = true;
            this.rgbBG = '';
            this.rgbBG2 = '';

          if (this.entitiesParent == 'T4000140'){
            if (this.rgb != '' && this.rgb2 == ''){
              this.rgb2 = this.rgb
            }
            this.rgbBG = this.rgb;
            this.rgbBG2 = this.rgb2;
          }
        }
        this.soapOpeartion = '';
      }catch(err){
        if(this.isItemActive){
          this.alertType = 1;
          this.alertMessage = this.txtNoSpecItem;
          setTimeout(() => {
            this.alertType = 0;
          }, 2000);
        }

        if (this.entitiesParent == 'T4000140' && this.isSpecialItemConfirm){
          this.dataService.setWo(this.scanner);
          this.dataService.setBlockJust2Check(false);
          this.serviceMethod.GetActiveLocksByIdOperation(this.scanner, this.entitiesParent);
          this.isSpecialItemConfirm = false;
          this.scanner = '';
        }

        this.soapOpeartion = '';
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
        this.soapOpeartion = ''
      }

      if(this.soapOpeartion == 'GetActiveLocksByIdOperation'){
        if (this.wynik.childNodes[1].hasChildNodes()){
          let xmlDoc = this.parser.parseFromString(this.wynik.getElementsByTagName('q_LockDetails')[0].childNodes[0].nodeValue, "text/xml");
          if (xmlDoc.getElementsByTagName('Locks').length) {
            for (let i = 0; i < xmlDoc.getElementsByTagName('Locks')[0].childNodes.length; i++) {
              let items = '';
              let messages = '';
              let poss = '';
              let qConf = '';

              try{
                items = xmlDoc.getElementsByTagName('Lock')[i].getElementsByTagName('Notes')[0].childNodes[0].nodeValue;
              }catch(err){};

              try{
                messages = xmlDoc.getElementsByTagName('Lock')[i].getElementsByTagName('LockDescription')[0].childNodes[0].nodeValue;
              }catch(err){};

              try{
                poss = this.wynik.getElementsByTagName('BundlePosition')[0].childNodes[0].nodeValue;
              }catch(err){};

              try{
                qConf = xmlDoc.getElementsByTagName('Lock')[i].getAttributeNode("unlockable").value;
              }catch(err){};

              if(items.length + messages.length + poss.length > 5 ){
              this.blockResult[i] = { item: items, message: messages, pos: poss, qConfirm: qConf };
              }
          }
          this.dataService.setLockWoData(this.wynik);
          this.isBlocks = true;
          this.dataService.setBlocks(this.blockResult);
        }
        this.isLogin.emit(3);
        this.soapOpeartion = '';
      }else{
        if(this.isLocksActive){
          this.alertType = 1;
          this.alertMessage = this.txtNoBlocks;
          setTimeout(() => {
            this.alertType = 0;
          }, 2000);
        }else{
          this.serviceMethod.confirmBackground(this.dataService.getWo(), this.entId, this.userName);
        }
      }
      this.soapOpeartion = '';
    }
    this.loader = false;
    this.isLoader.emit(this.loader);
    });
  }

//-------FUNCKJE DODATKOWE-------
  logout(): void {
    this.dataService.setUserName('');
    this.sub.unsubscribe();
    this.isLogin.emit(1);
    window.location.reload();
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

  closeSpecialItemWindow2(res: boolean) {
    this.dataService.setWo(this.scanner);
    this.dataService.setBlockJust2Check(false);
    this.serviceMethod.GetActiveLocksByIdOperation(this.scanner, this.entitiesParent);
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
