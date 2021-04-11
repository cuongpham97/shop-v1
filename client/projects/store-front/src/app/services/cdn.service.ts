import { Injectable } from '@angular/core';

declare const swal: any; 
declare const $: any;
declare const initHeader: Function;

@Injectable({
  providedIn: 'root'
})
export class CdnService {

  swal = swal;
  $ = $;
  initHeader = initHeader;
  
  constructor() { }
}
