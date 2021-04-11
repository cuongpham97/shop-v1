import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { AuthService, CdnService } from 'projects/store-front/src/app/services';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss']
})
export class SigninComponent implements OnInit {
  @Output() success: EventEmitter<any> = new EventEmitter();
  
  errorMessage;

  constructor(
    private auth: AuthService,
    private cdn: CdnService
  ) { }

  ngOnInit(): void {}

  onFormChange() {
    this.errorMessage = '';
  }

  onLoginButtonClick(form) {
    if (form.valid) {
      this.auth.login(form.value.username, form.value.password)
        .subscribe(_user => {
          this.success.emit();

        }, response => {
          const error = response.error;
          if (error.code === 'INVALID_CREDENTIALS') {
            this.errorMessage = 'Tài khoản hay mật khẩu chưa đúng';
          
          } else {
            // TODO: alert internal error;
          }
        });

    } else {
      this.errorMessage = 'Kiểm tra lại thông tin';
    }
  }

  loginWith(provider) {
    this.auth.loginWithOauth(provider, () => { this.success.emit(); });
  }
}
