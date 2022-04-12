import { FacePlugin } from './interface'

let facePluginInstance: FacePlugin

export const getFacePlugin = () => {
  if (!facePluginInstance) {
    throw new Error('facePlugin is not initialized')
  }

  return facePluginInstance
}

export const initFacePlugin = (facePlugin: FacePlugin) => {
  facePluginInstance = facePlugin

  return facePluginInstance
}
