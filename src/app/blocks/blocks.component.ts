import { DataService } from './../data.service';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { dict } from './../dictionary';
import { ServiceService } from './../service.service';
import { faUserLock, faKey, faArrowAltCircleLeft, faArrowAltCircleRight } from '@fortawesome/free-solid-svg-icons';

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

        }
      }
    });

  }

  //Dictionary
  language: number;
  block_header: string;
  qualityWorkerNumber: string;
  confirmButton: string;

  dictionaryChangeLanguage() {
    this.block_header = dict.get('block_header')[this.language];
    this.qualityWorkerNumber = dict.get('qualityWorkerNumber')[this.language];
    this.confirmButton = dict.get('confirmButton')[this.language];
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
    this.soapOpeartion = `DeactivateLocks`;
    const soapParameters = `<jobs>` +  '?' + `</jobs>
                            <userData><UserData><UserId>` + this.qualityNumer +`<UserId></UserData></userData>`;
    this.serviceService.soapGsCall(this.soapOpeartion, soapParameters);
  }
}
