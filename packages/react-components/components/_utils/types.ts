export enum SceneType {
  SCENE_TYPE_LOGIN = 'CHANNEL_LOGIN',
  SCENE_TYPE_REGISTER = 'CHANNEL_REGISTER',
  SCENE_TYPE_RESET = 'CHANNEL_RESET_PASSWORD',
  SCENE_TYPE_BIND = 'CHANNEL_BIND_PHONE',
  SCENE_TYPE_UNBIND = 'CHANNEL_UNBIND_PHONE',
  SCENE_TYPE_MFA_BIND = 'CHANNEL_BIND_MFA',
  SCENE_TYPE_MFA_VERIFY = 'CHANNEL_VERIFY_MFA',
  SCENE_TYPE_MFA_UNBIND = 'CHANNEL_UNBIND_MFA',
  SCENE_TYPE_COMPLETE_PHONE = 'CHANNEL_COMPLETE_PHONE',
  CHANNEL_IDENTITY_VERIFICATION = 'CHANNEL_IDENTITY_VERIFICATION',
  CHANNEL_DELETE_ACCOUNT = 'CHANNEL_DELETE_ACCOUNT',
}
