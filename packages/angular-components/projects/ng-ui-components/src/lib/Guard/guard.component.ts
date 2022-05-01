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
  Guard,
  GuardEventsHandler,
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

  guard: Guard;

  @Input() appId: string;
  @Input() visible?: boolean;
  @Input() tenantId?: string;
  @Input() config?: Partial<GuardLocalConfig>;

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
    // @ts-ignore
    const guard = new Guard(this.appId, this.config);

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

  ngOnInit(): void {}

  ngOnChanges(v) {
    if (v.visible.currentValue) {
      this.guard?.show();
    } else {
      this.guard.hide();
    }
  }
}
