import { getFacePlugin, useFacePlugin } from '../../_utils/facePlugin'

let inputSize = 512
let scoreThreshold = 0.5

export const devicesConstraints = {
  video: {
    width: 210,
    height: 210,
  },
}
export const FACE_SCORE = 0.65

export const useFaceDetectorOptions = () => {
  // const { TinyFaceDetectorOptions } = useFacePlugin()

  const facePlugin = useFacePlugin()

  return (
    facePlugin?.TinyFaceDetectorOptions &&
    new facePlugin.TinyFaceDetectorOptions({ inputSize, scoreThreshold })
  )
}

export const useCurrentFaceDetectionNet = () => {
  const facePlugin = useFacePlugin()

  return facePlugin?.nets && facePlugin.nets.tinyFaceDetector
}

export const useIsFaceDetectionModelLoaded = () => {
  const currentFaceDetectionNet = useCurrentFaceDetectionNet()

  return currentFaceDetectionNet && !!currentFaceDetectionNet.params
}

export function dataURItoBlob(base64Data: any) {
  var byteString
  if (base64Data.split(',')[0].indexOf('base64') >= 0)
    byteString = atob(base64Data.split(',')[1])
  else byteString = unescape(base64Data.split(',')[1])
  var mimeString = base64Data.split(',')[0].split(':')[1].split(';')[0]
  var ia = new Uint8Array(byteString.length)
  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i)
  }
  return new Blob([ia], { type: mimeString })
}
