import { Observable, Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { parseString } from 'xml2js';

@Injectable()
export class ServiceService {
  constructor(private http: HttpClient) {}
  private WSDL =
    'http://dkvdc-wmes0001/MESServices/MESConfirmOperation.asmx?WSDL';
  private WSDLgs =
    'http://dkvdc-wmes0001/MESServices/GeneralServices.asmx?WSDL';
  private WSDLus =
    'http://dkvdc-wmes0001/MESServices/UserServices.asmx?WSDL';
  private WSDLqs =
    'http://dkvdc-wmes0001/MESServices/QualityLockServices.asmx?WSDL';
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

    xmlhttp.open('POST', WSDL, true);

    const sr =
      `<?xml version="1.0" encoding="utf-8"?>
    <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
      <soap12:Body>
      <` +
      operation +
      ` xmlns="http://tempuri.org/">
      ` +
      parameters +
      `</` +
      operation +
      `>
      </soap12:Body>
      </soap12:Envelope>`;

      xmlhttp.onreadystatechange = () => {

        if (xmlhttp.readyState == 4) {
          if (xmlhttp.status == 200) {
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
    xmlhttp.setRequestHeader('Content-Type', 'text/xml');
    xmlhttp.responseType = 'document';
    xmlhttp.send(sr);
    }

  getResult(): Observable<string> {
    return this.result.asObservable();
  }
}
