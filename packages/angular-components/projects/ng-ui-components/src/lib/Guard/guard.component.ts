import {
  OnInit,
  Output,
  Component,
  EventEmitter,
  ViewEncapsulation,
  Input,
  OnChanges,
} from '@angular/core';

import {
  AuthenticationClient,
  Guard as NativeGuard,
  GuardEvents,
  GuardLocalConfig,
} from '@authing/native-js-ui-components';

@Component({
  selector: 'guard',
  template: `<div id="guard_container"></div>`,
  styles: [],
  styleUrls: ['./guard.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class GuardComponent implements OnInit, OnChanges {
  constructor() {}

  guard: NativeGuard;

  @Input() appId?: string;
  @Input() visible?: boolean;
  @Input() tenantId?: string;
  @Input() authClient?: AuthenticationClient;
  @Input() config?: Partial<GuardLocalConfig>;

  @Output() onLoad = new EventEmitter<Parameters<GuardEvents['onLoad']>>();
  @Output() onLoadError = new EventEmitter<
    Parameters<GuardEvents['onLoadError']>
  >();
  @Output() onLogin = new EventEmitter<Parameters<GuardEvents['onLogin']>>();
  @Output() onLoginError = new EventEmitter<
    Parameters<GuardEvents['onLoginError']>
  >();
  @Output() onRegister = new EventEmitter<
    Parameters<GuardEvents['onRegister']>
  >();
  @Output() onRegisterError = new EventEmitter<
    Parameters<GuardEvents['onRegisterError']>
  >();
  @Output() onPwdEmailSend = new EventEmitter<
    Parameters<GuardEvents['onPwdEmailSend']>
  >();
  @Output() onPwdEmailSendError = new EventEmitter<
    Parameters<GuardEvents['onPwdEmailSendError']>
  >();
  @Output() onPwdPhoneSend = new EventEmitter<
    Parameters<GuardEvents['onPwdPhoneSend']>
  >();
  @Output() onPwdPhoneSendError = new EventEmitter<
    Parameters<GuardEvents['onPwdPhoneSendError']>
  >();
  @Output() onPwdReset = new EventEmitter<
    Parameters<GuardEvents['onPwdReset']>
  >();
  @Output() onPwdResetError = new EventEmitter<
    Parameters<GuardEvents['onPwdResetError']>
  >();
  @Output() onClose = new EventEmitter<Parameters<GuardEvents['onClose']>>();

  @Output() onLangChange = new EventEmitter<
    Parameters<GuardEvents['onLangChange']>
  >();

  ngAfterViewInit() {
    // @ts-ignore

    if (this.authClient) {
      this.guard = new NativeGuard({
        appId: this.appId,
        config: this.config,
        tenantId: this.tenantId,
        authClient: this.authClient,
      });
    } else {
      this.guard = new NativeGuard(
        this.appId,
        this.config,
        this.tenantId,
        this.authClient
      );
    }

    this.guard.on('load', (...rest) => this.onLoad.emit(rest));
    this.guard.on('load-error', (...rest) => this.onLoadError.emit(rest));
    this.guard.on('login', (...rest) => this.onLogin.emit(rest));
    this.guard.on('login-error', (...rest) => this.onLoginError.emit(rest));
    this.guard.on('register', (...rest) => this.onRegister.emit(rest));
    this.guard.on('register-error', (...rest) =>
      this.onRegisterError.emit(rest)
    );
    this.guard.on('pwd-email-send', (...rest) =>
      this.onPwdEmailSend.emit(rest)
    );
    this.guard.on('pwd-email-send-error', (...rest) =>
      this.onPwdEmailSendError.emit(rest)
    );
    this.guard.on('pwd-phone-send', (...rest) =>
      this.onPwdPhoneSend.emit(rest)
    );
    this.guard.on('pwd-phone-send-error', (...rest) =>
      this.onPwdPhoneSendError.emit(rest)
    );
    this.guard.on('pwd-reset', (...rest) => this.onPwdReset.emit(rest));
    this.guard.on('pwd-reset-error', (...rest) =>
      this.onPwdResetError.emit(rest)
    );
    this.guard.on('close', (...rest) => this.onClose.emit(rest));

    this.guard.on('lang-change', (...rest) => this.onLangChange.emit(rest));

    if (this.visible === true) {
      this.guard.show();
    }
  }

  ngOnInit(): void {}

  ngOnChanges(v) {
    if (this.visible !== undefined) {
      if (this.visible) {
        this.guard.show();
      } else {
        this.guard.hide();
      }
    }
  }
}
