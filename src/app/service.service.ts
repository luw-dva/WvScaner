import xml2js from 'xml2js';
import { Observable, Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpParams, HttpClient } from '@angular/common/http';


@Injectable()
export class ServiceService {

  constructor(private http: HttpClient) {}
  private WSDL = 'http://dkvdc-wmes0001/MESServices/MESConfirmOperation.asmx?WSDL';
  private responseSOAP: string;
  private result = new Subject<string>();

  soapCall(operation: string, parameters: string): void {

    this.responseSOAP = '';
    const xmlhttp = new XMLHttpRequest();
    xmlhttp.open(
      'POST',
      this.WSDL,
      true
    );

    const sr = `<?xml version="1.0" encoding="utf-8"?>
    <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
      <soap12:Body>
      <` + operation + ` xmlns="http://tempuri.org/">
      ` + parameters +
      `</` + operation + `>
      </soap12:Body>
      </soap12:Envelope>`;

    xmlhttp.onreadystatechange = () => {

      if (xmlhttp.readyState == 4) {
        if (xmlhttp.status == 200) {
          const xml = xmlhttp.responseXML;

          if (xml.getElementsByTagName(operation + 'Result')[0].childNodes[0].nodeName != 'Reply'){
            this.responseSOAP = xml.getElementsByTagName(operation + 'Result')[0].childNodes[0].nodeValue;
          }else{
            const num_results = xml.getElementsByTagName('Reply')[0].childNodes.length;

            for (let i = 0; i < num_results; i++){
            let Parameters_name =  xml.getElementsByTagName('Reply')[0].childNodes[i].nodeName;
            let Parameters_value = '###';
            if (xml.getElementsByTagName('Reply')[0].childNodes[i].lastChild != null){
               Parameters_value =  xml.getElementsByTagName('Reply')[0].childNodes[i].childNodes[0].nodeValue;
            }
            this.responseSOAP = this.responseSOAP + ' ' + Parameters_name + ' : ' + Parameters_value + ' |';
            }
          }
          } else if (xmlhttp.status == 500)
            {this.responseSOAP = 'Response is false'}
            this.result.next(this.responseSOAP);
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
