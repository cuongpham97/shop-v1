import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

@Injectable()
export class UtilsService {

  constructor(
    private router: Router
  ) {}

  markFormControlTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      if ((control as any).controls) {
        this.markFormControlTouched(control as FormGroup);
      } else {
        control.markAsTouched();
      }
    });
  }

  reload() {
    const currentRoute = this.router.url;

    this.router.navigateByUrl('/', { skipLocationChange: true })
      .then(() => this.router.navigate([currentRoute]));
  }

  serialize(o) {
    const pragments = [];

    for (const [key, value] of Object.entries(o)) {
      if (!value) continue;

      if (Array.isArray(value)) {
        if (!value.length) continue;
        
        const encodedArray = value.map(i => encodeURIComponent(i));
        pragments.push(`${key}=${encodedArray.join(',')}`);

        continue;
      }

      if (typeof value === 'object' && value !== null) {
        const pairs = [];

        for (const [vKey, vValue] of Object.entries(value)) {
          if (!vValue) continue;

          pairs.push(`${vKey}=${encodeURIComponent(vValue)}`);
        }

        if (!pairs.length) continue;
        
        pragments.push(`${key}=${pairs.join(',')}`);
        continue;
      }

      pragments.push(`${key}=${encodeURIComponent(value as string)}`)
    }

    return pragments.join('&');
  }
}
