import { Component, OnInit } from '@angular/core'
import { AuthingGuard } from 'native-js'

@Component({
  selector: 'lib-AuthingGuard',
  template: ` <div id="authing_guard_container"></div> `,
  styles: [],
})
export class AuthingGuardComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}

  ngAfterViewInit() {
    const guard = new AuthingGuard('59f86b4832eb28071bdd9214', {
      target: '#root',

      apiHost: 'http://console.authing.localhost:3000',
      // loginMethods: Object.values(LoginMethods),
      logo:
        'https://files.authing.co/user-contents/photos/0a4c99ff-b8ce-4030-aaaf-584c807cb21c.png',
      title: 'Authing',
      // defaultLoginMethod: LoginMethods.LDAP,
      // registerMethods: Object.values(RegisterMethods),
      // defaultRegisterMethod: RegisterMethods.Email,
      defaultScenes: 'login',
      // socialConnections: Object.values(SocialConnections),
      // enterpriseConnections: ["oidc1"],
      appId: '5fa5053e252697ad5302ce7e',
      // autoRegister: true,
    })
  }
}
