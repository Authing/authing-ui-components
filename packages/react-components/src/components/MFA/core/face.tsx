import { Button } from 'antd'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { detectSingleFace, nets, TinyFaceDetectorOptions } from 'face-api.js'
import { useGuardHttp } from 'src/utils/guradHttp'
import { useAuthClient } from 'src/components/Guard/authClient'

let inputSize = 512
let scoreThreshold = 0.5

let devicesConstraints = {
  video: {
    width: 210,
    height: 210,
  },
}
const FACE_SCORE = 0.65

function getFaceDetectorOptions() {
  return new TinyFaceDetectorOptions({ inputSize, scoreThreshold })
}

function getCurrentFaceDetectionNet() {
  return nets.tinyFaceDetector
}

function isFaceDetectionModelLoaded() {
  return !!getCurrentFaceDetectionNet().params
}

// const dataURItoBlob = (base64Data: any) => {
//   let byteString
//   if (base64Data.split(',')[0].indexOf('base64') >= 0)
//     byteString = atob(base64Data.split(',')[1])
//   else byteString = unescape(base64Data.split(',')[1])
//   let mimeString = base64Data.split(',')[0].split(':')[1].split(';')[0]
//   let ia = new Uint8Array(byteString.length)
//   for (let i = 0; i < byteString.length; i++) {
//     ia[i] = byteString.charCodeAt(i)
//   }
//   return new Blob([ia], { type: mimeString })
// }

function dataURItoBlob(base64Data: any) {
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
export const MFAFace = (props: any) => {
  let { post } = useGuardHttp()
  const interval = useRef<NodeJS.Timeout | undefined>()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [faceState, setFaceState] = useState('准备中') // 准备中, 识别中
  const [percent, setPercent] = useState(0) // 识别进度（相似性）
  const client = useAuthClient()
  // console.log(client.mfa)

  // 预加载数据
  useEffect(() => {
    // 载入 cdn
    const cdnBase = props.config.__publicConfig__.cdnBase
    let cdnContext = getCurrentFaceDetectionNet().loadFromUri(
      `${cdnBase}/face-api/v1/tiny_face_detector_model-weights_manifest.json`
    )
    cdnContext.then((result) => {
      // setLoading(false)
      console.log('cdn result', result)
    })

    if (faceState !== '识别中') {
      // 不存在 video dom，不要去尝试了
      return
    }
    let devicesContext = navigator.mediaDevices.getUserMedia(devicesConstraints)
    devicesContext
      .then((stream) => {
        videoRef.current!.srcObject = stream
        console.log('成功读取视频流')
      })
      .catch((e) => {
        // 没有设备，或没有授权
        console.error(e)
        // setVideoType(VideoAction.ERROR)
        // setProgressStatus('exception')
        // setPercent(100)
        // setVideoError(e.message)
      })

    return () => {
      interval.current && clearInterval(interval.current)
    }
  }, [faceState, interval, props.config])

  // 识别成功，退出
  const quitIdentifying = () => {
    console.log('识别成功，退出')
    setPercent(100)
    interval.current && clearInterval(interval.current)
  }

  // 上传文件
  const uploadImage = async (blob: Blob) => {
    const formData = new FormData()
    formData.append('folder', 'photos')
    formData.append('file', blob, 'personal.jpeg')

    console.log('formData', formData)

    const ur = await post(
      '/api/v2/upload?folder=photos&private=true',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    console.log('formdata 上传', ur)

    // const res: any = await onFinish({ photo: key })

    // switch (res.code) {
    //   case 200:
    //     setErrorMes('')
    //     return false

    //   default:
    //     setErrorMes(res.message)
    //     return false
    // }
  }

  // 识别开始
  const onIdentify = useCallback(async () => {
    // console.log('onPlay do')
    if (!interval.current) {
      interval.current = setInterval(() => onIdentify(), 500)
    }
    const videoDom = videoRef.current!
    if (videoDom.paused || videoDom.ended || !isFaceDetectionModelLoaded()) {
      console.log('onPlay return')
      return
    }
    const options = getFaceDetectorOptions()
    const result = await detectSingleFace(videoDom, options)
    // console.log('检查 videoDom', videoDom)
    console.log('检查 result', result?.score)

    if (result) {
      // 识别成功，退出识别
      if (result.score > FACE_SCORE) {
        quitIdentifying()

        const canvas = canvasRef.current!
        const ctx = canvas!.getContext('2d')!
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(videoDom, 0, 0, canvas.width, canvas.height)

        const base64Data = canvas.toDataURL('image/jpeg', 1.0)
        const blob = dataURItoBlob(base64Data)
        uploadImage(blob)

        // if (onSeize && (await onSeize(blob))) {
        //   checking.current = false
        //   setPercent(0)
        //   setProgressStatus('active')
        // } else {
        //   clearInterval(interval.current)
        //   isVideoStop && setVideoType(VideoAction.STOP)
        //   isVideoStop && setProgressStatus('exception')
        // }
      } else {
        // 识别失败，但是有结果，输出相似性
        // setProgressStatus('active')
        setPercent(() => {
          return (result.score / FACE_SCORE) * 100
        })
      }
    }
    // if (!checking.current && result) {
    //   if (result.score > FACE_SCORE) {
    //     checking.current = true
    //     setLoading(true)
    //     setPercent(100)
    //     setProgressStatus('success')
    //     const mycanvas = canvasRef.current!

    //     const ctx = mycanvas!.getContext('2d')!
    //     ctx.clearRect(0, 0, mycanvas.width, mycanvas.height)
    //     ctx.drawImage(videoEl, 0, 0, mycanvas.width, mycanvas.height)

    //     const base64Data = mycanvas.toDataURL('image/jpeg', 1.0)
    //     const blob = dataURItoBlob(base64Data)

    //     if (onSeize && (await onSeize(blob))) {
    //       checking.current = false
    //       setPercent(0)
    //       setProgressStatus('active')
    //     } else {
    //       clearInterval(interval.current)
    //       isVideoStop && setVideoType(VideoAction.STOP)
    //       isVideoStop && setProgressStatus('exception')
    //     }

    //     setLoading(false)
    //   } else {
    //     setProgressStatus('active')
    //     setPercent(() => {
    //       return (result.score / FACE_SCORE) * 100
    //     })
    //   }
    // }
  }, [])

  return (
    <div className="g2-mfa-content">
      <h3 className="g2-mfa-title">绑定人脸识别</h3>
      <p className="g2-mfa-tips">请保持摄像头已打开并无遮挡</p>
      {faceState === '准备中' && (
        <>
          <img
            className="g2-mfa-face-image"
            src="//files.authing.co/user-contents/photos/0a4c99ff-b8ce-4030-aaaf-584c807cb21c.png"
            alt=""
          />
          <Button
            type="primary"
            className="authing-g2-submit-button mfa-face"
            onClick={() => {
              // onPlay()
              setFaceState('识别中')
            }}
          >
            开始验证
          </Button>
        </>
      )}
      {faceState === '识别中' && (
        <div>
          <video
            className="g2-mfa-face-image video-round"
            ref={videoRef}
            onLoadedMetadata={() => onIdentify()}
            id="inputVideo"
            autoPlay
            muted
            playsInline
          />
          识别率 {percent}
        </div>
      )}

      <canvas
        style={{
          width: 210,
          height: 210,
          opacity: 0,
          position: 'absolute',
          display: 'none',
        }}
        ref={canvasRef}
      />
    </div>
  )
}
