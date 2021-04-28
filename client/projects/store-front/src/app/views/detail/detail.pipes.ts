import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({ name: 'countRating' })
export class CountRatingPipe implements PipeTransform {
  transform(rating, star): number {
    if (!rating) return;

    if (!rating.count) return 0;

    return rating[star] * 100 / rating.count;
  }
}

@Pipe({ name: 'diffTime' })
export class DiffTimePipe implements PipeTransform {
  constructor() {
    moment.updateLocale('vi', {
      relativeTime: {
        future: "in %s",
        past: "%s trước",
        s: function (number, withoutSuffix, key, isFuture) {
          return '00:' + (number < 10 ? '0' : '') + number + ' phút';
        },
        m: "1 phút",
        mm: function (number, withoutSuffix, key, isFuture) {
          return (number < 10 ? '0' : '') + number  + ' phút';
        },
        h: "một giờ",
        hh: "%d giờ",
        d: "a ngày",
        dd: "%d ngày",
        M: "a tháng",
        MM: "%d tháng",
        y: "a năm",
        yy: "%d năm"
      }
    });
  }

  transform(time): string {
    if (!time) return '';
    return moment(time).fromNow();
  }
}

@Pipe({
  name: 'sanitizeHtml'
})
export class SanitizeHtmlPipe implements PipeTransform {
  constructor(private _sanitizer: DomSanitizer) { }

  transform(v: string): SafeHtml {
    return this._sanitizer.bypassSecurityTrustHtml(v);
  }
}