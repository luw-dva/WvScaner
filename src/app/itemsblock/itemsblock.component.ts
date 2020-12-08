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

  @Output()
  closeEmiter = new EventEmitter<boolean>();
  closeWindow = false;

  ngOnInit(): void {
  }

  close(){
    this.closeEmiter.emit(true);
  }
}
