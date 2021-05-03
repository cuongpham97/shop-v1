import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';
import * as _ from 'lodash';

@Pipe({
  name: 'orderTime'
})
export class OrderTimePipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    if (!value) return '';
    return moment(value).format('DD/MM/YYYY hh:mm:ss');
  }

}

@Pipe({ name: 'orderStatus' })
export class OrderStatusPipe implements PipeTransform {
  transform(order: any): string {
    if (!order) return '';
    
    switch ((_.last(order.status) as any).name) {
      case 'PENDING':
        return 'Đơn hàng đang chờ xử lí';
      case 'SHIPPING':
        return 'Đang giao hàng';
      case 'DELIVERED':
        return 'Đã giao hàng';
      case 'DONE':
        return 'Đã xong';
      case 'DENIED':
        return 'Đơn hàng bị từ chối';
      case 'CANCELED':
        return 'Đơn hàng đã hủy';
    }
  }
}
