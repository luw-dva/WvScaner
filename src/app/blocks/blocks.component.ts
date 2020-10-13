import { DataService } from './../data.service';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
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

  childBLock: Array<{ item: string; message: string; pos: string }>;

  constructor(private serviceService: ServiceService,
    private dataService: DataService) { }

  faUserLock = faUserLock;
  faKey = faKey;
  faArrowAltCircleLeft = faArrowAltCircleLeft;
  faArrowAltCircleRight = faArrowAltCircleRight;

  qualityNumer: string;
  qualityPIN: string;
  wynik: string;
  qUserData:string;
  soapOpeartion: string;
  focusedInputName: string = 'QualityNumber';
  spanUserClass: string = 'input-group-prepend';
  spanPinClass: string = 'input-group-prepend';

  ngOnInit(): void {
    this.childBLock = this.dataService.getBlocks();
    this.language = this.dataService.getLanguageFirstTime();

    this.dictionaryChangeLanguage();
    this.dataService.getLanguage().subscribe((data) => {
      this.language = data;
      this.dictionaryChangeLanguage();
    });

    this.serviceService.getResult().subscribe((data) => {
      this.wynik = data;

      switch (this.soapOpeartion) {
        case 'Login': {
          if(this.wynik == 'false'){
            this.spanUserClass = 'input-group-prepend nok';
            this.spanPinClass = 'input-group-prepend nok';
          }else{
            this.spanUserClass = 'input-group-prepend ok';
            this.spanPinClass = 'input-group-prepend ok';
          }
        }
      }
    });
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

  //Pobieranie nazwy obecnie aktywnego pola
  getFocusedInputName(name: string) {
    this.focusedInputName = name;
  }

  barcodeEvent(status: string): void {
  //Wpisz kod kreskowy do aktywnego okna
    (<HTMLInputElement>(
      document.getElementById(this.focusedInputName)
    )).value = status;
  //Wywołanie odpowiedniego webservisu
    switch (this.focusedInputName) {
      case 'QualityNumber': {
        this.qualityNumer = status;
        break;
      }
      case 'QualityPIN': {
        this.qualityPIN = status;
        break;
      }
    }

    if (this.qualityNumer.length != 0 && this.qualityPIN.length != 0){
      this.getLogin();
    }
  }

  @Output()
  isLogin = new EventEmitter<number>();

  goToMainView() {
    this.isLogin.emit(2);
    this.dataService.setBlocks([]);
  }

  getLogin(): any {
    this.soapOpeartion = `Login`;
    const soapParameters = `<userName>` +  this.qualityNumer + `</userName>
                            <password>` +  this.qualityPIN +`</password>`;
    this.serviceService.soapGsCall(this.soapOpeartion, soapParameters);
  }

  getDeactivateLocks(): any {
    let xml_doc = new DOMParser;
    xml_doc.parseFromString(`<UserData><UserId>` + this.qualityNumer +`<UserId></UserData>`, 'text/xml');

    this.soapOpeartion = `DeactivateLocks`;
    const soapParameters = `<jobs>` +  '?' + `</jobs>` +
                          xml_doc.parseFromString('<UserData><UserId>` + this.qualityNumer +`<UserId></UserData>', 'text/xml');
    this.serviceService.soapQsCall(this.soapOpeartion, soapParameters);
  }
}
