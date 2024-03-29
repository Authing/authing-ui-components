import { Component } from '@angular/core';
import { CommonMessage, AuthenticationClient } from 'ng-ui-components';
import { User } from '@authing/native-js-ui-components';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'demo';
  visible = true;
  appId = '5f6265c67ff6fdae64ec516e';
  config = {
    // target: '#authing_guard_container',
    mode: 'modal',
    // apiHost: 'https://lb68p7-demo.authing.cn',
    // loginMethods: Object.values(LoginMethods),
    // logo:
    //   'https://files.authing.co/user-contents/photos/0a4c99ff-b8ce-4030-aaaf-584c807cb21c.png',
    // title: 'Authing',
    // defaultLoginMethod: LoginMethods.LDAP,
    // registerMethods: Object.values(RegisterMethods),
    // defaultRegisterMethod: RegisterMethods.Email,
    // defaultScenes: GuardModuleType.LOGIN,
    // socialConnections: Object.values(SocialConnections),
    // enterpriseConnections: ["oidc1"],
    // autoRegister: true,
  };

  onLoad(e: AuthenticationClient): void {
    console.log('ffffff', e);
  }

  onLoginError([msg]: [
    msg: CommonMessage,
    client: AuthenticationClient
  ]): void {
    console.log(msg);
  }

  onClose(): void {
    this.visible = false;
  }

  onLogin([user]: [User, AuthenticationClient]): void {
    console.log('onLogin by Guard in Angular: ', user);
  }
}
