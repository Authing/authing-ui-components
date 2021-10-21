// face 依赖
import { nets, TinyFaceDetectorOptions } from 'face-api.js'

let inputSize = 512
let scoreThreshold = 0.5

export const devicesConstraints = {
  video: {
    width: 210,
    height: 210,
  },
}
export const FACE_SCORE = 0.65

export function getFaceDetectorOptions() {
  return new TinyFaceDetectorOptions({ inputSize, scoreThreshold })
}

export function getCurrentFaceDetectionNet() {
  return nets.tinyFaceDetector
}

export function isFaceDetectionModelLoaded() {
  return !!getCurrentFaceDetectionNet().params
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
