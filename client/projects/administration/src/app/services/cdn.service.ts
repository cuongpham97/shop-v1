import { Injectable } from '@angular/core';

declare let swal: any; 
declare let $: any;
declare let Chart: any;

@Injectable({
  providedIn: 'root'
})
export class CdnService {

  swal = swal;
  $ = $;
  Chart = Chart;
  
  constructor() { }
}
