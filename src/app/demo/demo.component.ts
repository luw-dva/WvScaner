import { Component, ViewChild, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { BarecodeScannerLivestreamComponent } from 'ngx-barcode-scanner';
import {faCamera } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-demo',
  templateUrl: './demo.component.html',
  styleUrls: ['./demo.component.css']
})
export class DemoComponent implements AfterViewInit {

  constructor(){}

 @ViewChild(BarecodeScannerLivestreamComponent)
    barecodeScanner: BarecodeScannerLivestreamComponent;

    faCamera= faCamera;

    @Output()
    barCodeResult = new EventEmitter<string>();

    barcodeValue: string;
    isCamActive: boolean = false;
    isCamIconHidden: boolean = true;

    ngAfterViewInit() {
    //  this.barecodeScanner.start();
    }


    onValueChanges(result){
      if(
        this.barcodeValue != result.codeResult.code){
        this.barcodeValue = result.codeResult.code ;
        this.barCodeResult.emit(this.barcodeValue);
        this.isCamActive = false;
        this.isCamIconHidden = true;
        this.barecodeScanner.stop();
      }
    }

    onStarted(started){
      console.log(started);
      this.barecodeScanner.start();
    }

    changeCamActive(){
      this.barecodeScanner.start();
      this.isCamActive = !this.isCamActive;
      this.isCamIconHidden = !this.isCamIconHidden;
      this.barcodeValue = '';
      // if(this.isCamActive){
      //   this.barecodeScanner.stop();
      // }else{
      //   this.barecodeScanner.stop();
      // }
    }
}
