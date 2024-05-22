import { Injectable, OnInit } from '@angular/core';
import { Timestamp } from 'firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class CommonService implements OnInit {
  ngOnInit() {}

  convertTimestampToDate(timestamp: Timestamp | undefined): string {
    if (timestamp) {
    const date = timestamp.toDate();
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    const hours = ('0' + date.getHours()).slice(-2);
    const minutes = ('0' + date.getMinutes()).slice(-2);
    const seconds = ('0' + date.getSeconds()).slice(-2);
    return `${day}-${month}-${year}, ${hours}:${minutes}:${seconds}`;
    }
    return 'N/A'
  }

  convertDateToReadableDate(date: Date | undefined): string {
    if (date) {        
      const year = date.getFullYear();
      const month = ('0' + (date.getMonth() + 1)).slice(-2);
      const day = ('0' + date.getDate()).slice(-2);
      const hours = ('0' + date.getHours()).slice(-2);
      const minutes = ('0' + date.getMinutes()).slice(-2);
      const seconds = ('0' + date.getSeconds()).slice(-2);
      return `${year}-${month}-${day}, ${hours}:${minutes}:${seconds}`;
    }
    return 'N/A';
  }
}
