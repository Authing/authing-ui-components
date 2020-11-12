import { Component } from '@angular/core'
import {
  CommonMessage,
  AuthenticationClient,
  GuardScenes,
} from 'ng-ui-components'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'demo'

  userPoolId = '59f86b4832eb28071bdd9214'
  config = {
    target: '#authing_guard_container',

    apiHost: 'http://console.authing.localhost:3000',
    // loginMethods: Object.values(LoginMethods),
    logo:
      'https://files.authing.co/user-contents/photos/0a4c99ff-b8ce-4030-aaaf-584c807cb21c.png',
    title: 'Authing',
    // defaultLoginMethod: LoginMethods.LDAP,
    // registerMethods: Object.values(RegisterMethods),
    // defaultRegisterMethod: RegisterMethods.Email,
    defaultScenes: GuardScenes.Login,
    // socialConnections: Object.values(SocialConnections),
    // enterpriseConnections: ["oidc1"],
    appId: '5fa5053e252697ad5302ce7e',
    // autoRegister: true,
  }

  onLoad(e: AuthenticationClient) {
    console.log('ffffff', e)
  }

  onLoginError([msg]: [msg: CommonMessage, client: AuthenticationClient]) {
    console.log(msg)
  }
}
