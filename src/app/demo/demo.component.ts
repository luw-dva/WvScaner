import { Component, ViewChild, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { BarecodeScannerLivestreamComponent } from 'ngx-barcode-scanner';

@Component({
  selector: 'app-demo',
  templateUrl: './demo.component.html',
  styleUrls: ['./demo.component.css']
})
export class DemoComponent implements AfterViewInit {

  constructor(){

  }
 @ViewChild(BarecodeScannerLivestreamComponent)
    barecodeScanner: BarecodeScannerLivestreamComponent;

    @Output()
    barCodeResult = new EventEmitter<string>();

    barcodeValue;

    ngAfterViewInit() {
      this.barecodeScanner.start();
    }

    onValueChanges(result){
        this.barcodeValue = result.codeResult.code ;
        this.barCodeResult.emit(this.barcodeValue);
        setTimeout(()=>{                           //<<<---using ()=> syntax

        }, 100);


    }

    onStarted(started: any){
      console.log(started);
    }
}
