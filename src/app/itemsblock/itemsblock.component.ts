import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-itemsblock',
  templateUrl: './itemsblock.component.html',
  styleUrls: ['./itemsblock.component.css']
})
export class ItemsblockComponent implements OnInit {

  constructor() { }

  @Input()
  childBLock;

  @Input()
  isToConfirm:boolean = false; // DLA T4000140 -> zatwierdzanie koloru

  @Output()
  closeEmiter = new EventEmitter<boolean>();

  @Output()
  confirmEmiter = new EventEmitter<boolean>();
  closeWindow = false;

  ngOnInit(): void {
  }

  close(){
    this.closeEmiter.emit(true);
  }

  confirm(){
    this.closeEmiter.emit(true);
    this.confirmEmiter.emit(true);
  }
}
