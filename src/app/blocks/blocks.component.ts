import { ServiceMethod } from './../service.method';
import { DataService } from './../data.service';
import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { dict } from './../dictionary';
import { ServiceService } from './../service.service';
import { faUserLock, faKey, faArrowAltCircleLeft, faArrowAltCircleRight } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-blocks',
  templateUrl: './blocks.component.html',
  styleUrls: ['./blocks.component.css']
})
export class BlocksComponent implements OnInit {

  childBLock: Array<{ item: string; message: string; pos: string; qConfirm: string }>;

  @Output()
  isLoader = new EventEmitter<boolean>();


  constructor(private serviceService: ServiceService,
    private dataService: DataService) { }

  private sub: any;
  loader: boolean = false;
  faUserLock = faUserLock;
  faKey = faKey;
  faArrowAltCircleLeft = faArrowAltCircleLeft;
  faArrowAltCircleRight = faArrowAltCircleRight;
  serviceMethod = new ServiceMethod(this.serviceService);
  alertType = 0; // 0-brak, 1-pozytywny, 2-negatywny
  alertMessage: string = '';
  qualityNumer: string = '';
  btnClass = 'btn btn-secondary';
  scanner: string;
  isBlock2Check: boolean = false;
  isBlock2Check2: boolean = true;
  childBLockElement: number = 1;
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

    this.sub = this.serviceService.getResult().subscribe((data) => {
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
          this.goToMainView();
          break;
        }
      }
      this.loader = false;
      this.isLoader.emit(this.loader);
    });
  }

  scannerChange(): void {
    if(!this.loader){
        this.loader = true;
        this.isLoader.emit(this.loader);
      if (this.scanner.length >4) {
        this.qualityNumer = this.scanner;
        this.scanner = '';
      }else{
        this.qualityPIN = this.scanner;
        this.scanner = '';
      }
      if (this.qualityNumer.length != 0 && this.qualityPIN.length != 0){
        this.getLoginQuality();
      }
    }
  }

  goLeft():void {
    if (this.childBLockElement > 1){
      this.childBLockElement--
      this.rightClass = 'btn btn-warning'
      if (this.childBLockElement == 1) this.leftClass = 'btn btn-secondary';
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
  txtMsgSuccesfullyUnlocked: string;

  dictionaryChangeLanguage() {
    this.block_header = dict.get('block_header')[this.language];
    this.qualityWorkerNumber = dict.get('qualityWorkerNumber')[this.language];
    this.confirmButton = dict.get('confirmButton')[this.language];
    this.backButton = dict.get('back')[this.language];
    this.txtMsgSuccesfullyUnlocked = dict.get('MsgSuccesfullyUnlocked')[this.language];
  }

  DeactivateWoLocks(){
    if (this.btnClass == 'btn btn-warning'){
    this.getDeactivateLocks();
    this.serviceMethod.confirmBackground(this.dataService.getWo(), this.dataService.getEntId(), this.dataService.getUserName())
    this.goToMainView();
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

  getLoginQuality(): any {
    this.soapOpeartion = `Login`;
    const soapParameters = `<userName>` + this.qualityNumer + `</userName>
                            <password>` + this.qualityPIN +`</password>`;
    this.serviceService.soapGsCall(this.soapOpeartion, soapParameters);
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

    this.alertType = 1;
        this.alertMessage = this.txtMsgSuccesfullyUnlocked;
        setTimeout(() => {
          this.alertType = 0;
        }, 2000);
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
