import { Component, OnInit } from '@angular/core';
import { CdnService } from '../../services';
import { charts } from './dashboard.charts';

@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  constructor(private cdn: CdnService) { }

  ngOnInit(): void {
    const Chart = this.cdn.Chart;
    
    let ctx1 = (document.getElementById('membersOnlineChart1') as any).getContext('2d');
    let chart1 = new Chart(ctx1, charts.chart1);

    let ctx2 = (document.getElementById('membersOnlineChart2') as any).getContext('2d');
    let chart2 = new Chart(ctx2, charts.chart2);

    let ctx3 = (document.getElementById('membersOnlineChart3') as any).getContext('2d');
    let chart3 = new Chart(ctx3, charts.chart3);

    let ctx4 = (document.getElementById('membersOnlineChart4') as any).getContext('2d');
    let chart4 = new Chart(ctx4, charts.chart4);

    let ctx5 = (document.getElementById('membersOnlineChart5') as any).getContext('2d');
    let chart5 = new Chart(ctx5, charts.chart5);
  }
}
