import { Observable, Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class ServiceService {
  constructor(private http: HttpClient) {}
  private WSDL =
    'https://dkvdc-wmes0001.dovista.org/MESServices/MESConfirmOperation.asmx?WSDL';
  private WSDLgs =
    'https://dkvdc-wmes0001.dovista.org/MESServices/GeneralServices.asmx?WSDL';
  private WSDLus =
    'https://dkvdc-wmes0001.dovista.org/MESServices/UserServices.asmx?WSDL';
  private WSDLqs =
    'https://dkvdc-wmes0001.dovista.org/MESServices/QualityLockServices.asmx?WSDL';
  private responseSOAP: any;
  private result = new Subject<string>();

  soapCall(operation: string, parameters: string): void {
    this.soapStructure(operation, parameters, this.WSDL);
  }

  soapGsCall(operation: string, parameters: string): void {
    this.soapStructure(operation, parameters, this.WSDLgs);
  }

  soapUsCall(operation: string, parameters: string): void {
    this.soapStructure(operation, parameters, this.WSDLus);
  }

  soapQsCall(operation: string, parameters: string): void {
    this.soapStructure(operation, parameters, this.WSDLqs);
  }

  soapStructure(operation: string, parameters: string, WSDL: string){
    this.responseSOAP = '';
    const xmlhttp = new XMLHttpRequest();
    const sr =
      `<?xml version="1.0" encoding="utf-8"?>
      <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
      <soap12:Body>
      <` + operation + ` xmlns="http://tempuri.org/">` +
      parameters +
      `</` + operation + `>
      </soap12:Body>
      </soap12:Envelope>`;

      xmlhttp.onreadystatechange = () => {

        if (xmlhttp.readyState == 4) {
          if (xmlhttp.status == 200) {
            console.log(xmlhttp.getAllResponseHeaders());
            const xml = xmlhttp.responseXML;


              console.log(xml);
              this.responseSOAP = this.responseSOAP = xml.getElementsByTagName(operation + 'Result')[0];

          } else if (xmlhttp.status == 500) {
            this.responseSOAP = 'false';
          }

          this.result.next(this.responseSOAP);
          this.responseSOAP = '';
        }
      };
    // Send the POST request.

    xmlhttp.open('POST', WSDL, true);
    xmlhttp.setRequestHeader('Content-Type', 'text/xml');
    xmlhttp.responseType = 'document';
//    xmlhttp.withCredentials = true;
    xmlhttp.send(sr);
    }

  getResult(): Observable<string> {
    return this.result.asObservable();
  }
}
