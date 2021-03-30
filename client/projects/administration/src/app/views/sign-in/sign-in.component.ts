import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services';
import {ActivatedRoute, Router} from "@angular/router";
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent implements OnInit {
  loginForm = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(6)]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  message = '';
  loading = false;

  constructor(
    private auth: AuthService, 
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void { 
    this.loginForm.valueChanges.subscribe(() => { this.message = ''});
  }

  markFormControlTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      if ((control as any).controls) {
        this.markFormControlTouched(control as FormGroup);
      } else {
        control.markAsTouched();
      }
    });
  }

  onLoginFormSubmit() {
    this.markFormControlTouched(this.loginForm);

    if (this.loginForm.valid) {
      this.loading = true;

      const value = this.loginForm.value;
      this.auth.login(value.username, value.password)
        .subscribe(user => {
          if (user) {
            this.message = '';
            this.loading = false;

            const redirectUrl = this.route.snapshot.queryParamMap.get('redirect') || '/dashboard';
            this.router.navigateByUrl(redirectUrl);
          }
        }, response => {
          this.loading = false;

          const error = response.error;
          switch (error && error.code) {
            case 'INVALID_CREDENTIALS':
              this.message = 'Username or password is incorrect';
              break;
            case 'ACCOUNT_UNAVAILABLE':
              this.message = 'This account has been deactivated';
              break;
            default:
              this.router.navigate(['/error']);
          }
        });
    } else {
      this.message = 'Username or password is incorrect';
    }
  }
}
