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
  User,
  GuardMode,
  UserConfig,
  GuardScenes,
  AuthingGuard,
  LoginMethods,
  getAuthClient,
  CommonMessage,
  initAuthClient,
  RegisterMethods,
  GuardEventsHandler,
  AuthenticationClient,
  GuardEventsHandlerKebab,
  AuthenticationClientOptions,
} from '@authing/native-js-ui-components';

export type {
  User,
  UserConfig,
  CommonMessage,
  GuardEventsHandler,
  AuthenticationClient,
  GuardEventsHandlerKebab,
  AuthenticationClientOptions,
};

export {
  GuardMode,
  GuardScenes,
  LoginMethods,
  getAuthClient,
  initAuthClient,
  RegisterMethods,
};

@Component({
  selector: 'authing-guard',
  template: `<div id="authing_guard_container"></div>`,
  styles: [],
  styleUrls: ['./authing-guard.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AuthingGuardComponent implements OnInit, OnChanges {
  constructor() {}

  guard: AuthingGuard;

  ngOnInit(): void {}

  ngOnChanges(v) {
    if (v.visible.currentValue) {
      this.guard?.show();
    } else {
      this.guard.hide();
    }
  }

  @Input() appId: string;
  @Input() visible?: boolean;
  @Input() tenantId?: string;
  @Input() config?: UserConfig;

  @Output() onLoad = new EventEmitter<
    Parameters<GuardEventsHandler['onLoad']>
  >();
  @Output() onLoadError = new EventEmitter<
    Parameters<GuardEventsHandler['onLoadError']>
  >();
  @Output() onLogin = new EventEmitter<
    Parameters<GuardEventsHandler['onLogin']>
  >();
  @Output() onLoginError = new EventEmitter<
    Parameters<GuardEventsHandler['onLoginError']>
  >();
  @Output() onRegister = new EventEmitter<
    Parameters<GuardEventsHandler['onRegister']>
  >();
  @Output() onRegisterError = new EventEmitter<
    Parameters<GuardEventsHandler['onRegisterError']>
  >();
  @Output() onPwdEmailSend = new EventEmitter<
    Parameters<GuardEventsHandler['onPwdEmailSend']>
  >();
  @Output() onPwdEmailSendError = new EventEmitter<
    Parameters<GuardEventsHandler['onPwdEmailSendError']>
  >();
  @Output() onPwdPhoneSend = new EventEmitter<
    Parameters<GuardEventsHandler['onPwdPhoneSend']>
  >();
  @Output() onPwdPhoneSendError = new EventEmitter<
    Parameters<GuardEventsHandler['onPwdPhoneSendError']>
  >();
  @Output() onPwdReset = new EventEmitter<
    Parameters<GuardEventsHandler['onPwdReset']>
  >();
  @Output() onPwdResetError = new EventEmitter<
    Parameters<GuardEventsHandler['onPwdResetError']>
  >();
  @Output() onClose = new EventEmitter<
    Parameters<GuardEventsHandler['onClose']>
  >();

  ngAfterViewInit() {
    const guard = new AuthingGuard(this.appId, this.config, this.tenantId);

    guard.on('load', (...rest) => this.onLoad.emit(rest));
    guard.on('load-error', (...rest) => this.onLoadError.emit(rest));
    guard.on('login', (...rest) => this.onLogin.emit(rest));
    guard.on('login-error', (...rest) => this.onLoginError.emit(rest));
    guard.on('register', (...rest) => this.onRegister.emit(rest));
    guard.on('register-error', (...rest) => this.onRegisterError.emit(rest));
    guard.on('pwd-email-send', (...rest) => this.onPwdEmailSend.emit(rest));
    guard.on('pwd-email-send-error', (...rest) =>
      this.onPwdEmailSendError.emit(rest)
    );
    guard.on('pwd-phone-send', (...rest) => this.onPwdPhoneSend.emit(rest));
    guard.on('pwd-phone-send-error', (...rest) =>
      this.onPwdPhoneSendError.emit(rest)
    );
    guard.on('pwd-reset', (...rest) => this.onPwdReset.emit(rest));
    guard.on('pwd-reset-error', (...rest) => this.onPwdResetError.emit(rest));
    guard.on('close', (...rest) => this.onClose.emit(rest));

    if (this.visible) {
      guard.show();
    }

    this.guard = guard;
  }
}
