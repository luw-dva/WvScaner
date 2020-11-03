import { DataService } from './../data.service';
import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { dict } from './../dictionary';
import { ServiceService } from './../service.service';

import { faUserLock, faKey, faArrowAltCircleLeft, faArrowAltCircleRight } from '@fortawesome/free-solid-svg-icons';
import { XmlParser } from '@angular/compiler';

@Component({
  selector: 'app-blocks',
  templateUrl: './blocks.component.html',
  styleUrls: ['./blocks.component.css']
})
export class BlocksComponent implements OnInit {

  childBLock: Array<{ item: string; message: string; pos: string; qConfirm: string }>;

  constructor(private serviceService: ServiceService,
    private dataService: DataService) { }

  faUserLock = faUserLock;
  faKey = faKey;
  faArrowAltCircleLeft = faArrowAltCircleLeft;
  faArrowAltCircleRight = faArrowAltCircleRight;

  alertType = 0; // 0-brak, 1-pozytywny, 2-negatywny
  alertMessage: string = '';
  qualityNumer: string = '';
  btnClass = 'btn btn-secondary';
  scanner: string;
  isBlock2Check: boolean = false;
  isBlock2Check2: boolean = true;
  childBLockElement: number = 0;
  qualityPIN: string = '';
  wynik: any;
  qUserData:string;
  soapOpeartion: string;
  focusedInputName: string = 'QualityNumber';
  spanUserClass: string = 'input-group-prepend';
  spanPinClass: string = 'input-group-prepend';
  leftClass: string = 'btn btn-secondary';
  rightClass: string = 'btn btn-secondary';

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

    this.childBLock = this.dataService.getBlocks();
    this.hideElements();



    this.focusOnScanner();

    this.childBLock = this.dataService.getBlocks();
    if (this.childBLock.length > 1 ){
      this.rightClass = 'btn btn-warning';
    }

    this.language = this.dataService.getLanguageFirstTime();
    this.dictionaryChangeLanguage();
    this.dataService.getLanguage().subscribe((data) => {
      this.language = data;
      this.dictionaryChangeLanguage();
    });

    this.serviceService.getResult().subscribe((data) => {
      this.wynik = data;
      this.soapOpeartion = this.serviceService.getSoapOperation();

      switch (this.soapOpeartion) {
        case 'Login': {
          try{
          if(!this.wynik.childNodes[1].hasChildNodes()){
            this.spanUserClass = 'input-group-prepend nok';
            this.spanPinClass = 'input-group-prepend nok';
          }else{
            this.spanUserClass = 'input-group-prepend ok';
            this.spanPinClass = 'input-group-prepend ok';
            this.btnClass = 'btn btn-warning'
          }
          break;
        }catch(err){}}
        case 'DeactivateLocks2': {
          break;
        }
      }
    });
  }

  scannerChange(): void {
    if (this.scanner.length >4) {
      this.qualityNumer = this.scanner;
      this.scanner = '';
    }else{
      this.qualityPIN = this.scanner;
      this.scanner = '';
    }
    if (this.qualityNumer.length != 0 && this.qualityPIN.length != 0){
      this.getLogin();
    }
  }

  goLeft():void {
    if (this.childBLockElement > 0){
      this.childBLockElement--
      this.rightClass = 'btn btn-warning'
      if (this.childBLockElement = 0) this.leftClass = 'btn btn-secondary';
    }
  }

  goRight(): void {
    if (this.childBLockElement != this.childBLock.length){
      this.childBLockElement++
      this.leftClass = 'btn btn-warning'
      if (this.childBLockElement == this.childBLock.length) this.rightClass = 'btn btn-secondary';
    }
  }

  hideElements(){

    for (let i = 0; i < this.childBLock.length; i++){
      if (this.childBLock[i].qConfirm == "true") this.isBlock2Check2 = false;
      }

    if (this.isBlock2Check2 == true){
        this.btnClass = 'btn btn-warning'
        this.alertType = 1
        this.alertMessage = 'Potwierdzenie jakościowca nie jest wymagane'

    }

    if(this.dataService.getBlockJust2Check()){
      this.isBlock2Check = true;
      this.isBlock2Check2 = true;
    }
  }


  //Dictionary
  language: number;
  backButton: string;
  block_header: string;
  qualityWorkerNumber: string;
  confirmButton: string;

  dictionaryChangeLanguage() {
    this.block_header = dict.get('block_header')[this.language];
    this.qualityWorkerNumber = dict.get('qualityWorkerNumber')[this.language];
    this.confirmButton = dict.get('confirmButton')[this.language];
    this.backButton = dict.get('back')[this.language];
  }

  DeactivateWoLocks(){
    if (this.btnClass == 'btn btn-warning'){
    this.getDeactivateLocks();
    this.confirmOperation();
    }
  }

  //Pobieranie nazwy obecnie aktywnego pola
  getFocusedInputName(name: string) {
    this.focusedInputName = name;
  }

  @Output()
  isLogin = new EventEmitter<number>();

  goToMainView() {
    this.isLogin.emit(2);
    this.dataService.setBlocks([]);
  }

  getLogin(): any {
    this.soapOpeartion = `Login`;
    const soapParameters = `<userName>` + this.qualityNumer + `</userName>
                            <password>` + this.qualityPIN +`</password>`;
    this.serviceService.soapGsCall(this.soapOpeartion, soapParameters);
  }

    confirmOperation(): any {
    this.soapOpeartion = `ConfirmOperation`;
    const soapParameters =
      `<entityId>` +  this.dataService.getEntId() +  `</entityId>` +
      `<woId>` + this.dataService.getWo() + `</woId>` +
      `<operId>` + this.dataService.getEntParentName() + `</operId>` +
      `<worker>` +this.dataService.getUserName() + `</worker>`;
    this.serviceService.soapCall(this.soapOpeartion, soapParameters);
    this.dataService.setWo('');
  }

  getDeactivateLocks(): any {
    this.soapOpeartion = `DeactivateLocksText`;
    let serial = new XMLSerializer
    let X: string;
    let Y: string;

    X = serial.serializeToString(this.dataService.getLockWoData());
    Y =  `<?xml version="1.0" encoding="UTF-8"?><UserData><UserId>` + this.qualityNumer +`</UserId></UserData>`;

    const soapParameters =
    `<jobs>` +
        escape(X) +
    `</jobs>
    <userData>` +
        escape(Y) +
    `</userData>`;

    this.serviceService.soapQsCall(this.soapOpeartion, soapParameters);
  }

}
