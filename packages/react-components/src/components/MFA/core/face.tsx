import { Button } from 'antd'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { detectSingleFace } from 'face-api.js'
import { useGuardHttp } from 'src/utils/guradHttp'
import {
  FACE_SCORE,
  devicesConstraints,
  dataURItoBlob,
  getCurrentFaceDetectionNet,
  getFaceDetectorOptions,
  isFaceDetectionModelLoaded,
} from './face_deps'

const useDashoffset = (percent: number) => {
  // 接受 0 - 1，返回 0-700 之间的偏移量
  let offset = percent * 7

  // 在识别成功的时候，返回绿色
  let dashStyle = {}
  // let dashStyle = percent > 0.65 ? { stroke: '#1EB76D' } : {}
  return { offset, dashStyle }
}

export const MFAFace = (props: any) => {
  let { postForm, post } = useGuardHttp()
  const [faceState, setFaceState] = useState('准备中') // 准备中, 识别中, 点击重试
  const [percent, setPercent] = useState(0) // 识别进度（相似性）

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const interval = useRef<NodeJS.Timeout | undefined>()
  const p1 = useRef<string>() // p1 key
  const p2 = useRef<string>() // p2 key
  const cooldown = useRef<number>(6) // p2 cooldown, * 500ms

  let { offset, dashStyle } = useDashoffset(percent)

  // 预加载数据
  useEffect(() => {
    // 载入 cdn
    const cdnBase = props.config.__publicConfig__.cdnBase
    let cdnContext = getCurrentFaceDetectionNet().loadFromUri(
      `${cdnBase}/face-api/v1/tiny_face_detector_model-weights_manifest.json`
    )
    cdnContext.then((result) => {
      // setLoading(false)
    })

    if (faceState !== '识别中') {
      return // 不存在 video dom，不要去尝试了
    }
    let devicesContext = navigator.mediaDevices.getUserMedia(devicesConstraints)
    devicesContext
      .then((stream) => {
        videoRef.current!.srcObject = stream
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

  // 监听 faceState
  useEffect(() => {
    if (faceState === '识别中' || faceState === '点击重试') {
      props.setShowMethods(false)
    } else {
      props.setShowMethods(true)
    }
  }, [faceState])

  // 上传文件
  const uploadImage = async (blob: Blob) => {
    const formData = new FormData()
    formData.append('folder', 'photos')
    formData.append('file', blob, 'personal.jpeg')

    let url = '/api/v2/upload?folder=photos&private=true'
    let result = await postForm<any>(url, formData)
    let key = result.data?.key
    return key
  }

  // get base 64
  const getBase64 = (videoDom: any) => {
    const canvas = canvasRef.current!
    const ctx = canvas!.getContext('2d')!
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(videoDom, 0, 0, canvas.width, canvas.height)
    const base64Data = canvas.toDataURL('image/jpeg', 1.0)
    return base64Data
  }

  const faceLogin = (result: any) => {
    let { code, data, message } = result

    if (code === 1700 || code === 1701 || code === 1702) {
      p1.current = undefined
      p2.current = undefined
      interval.current = undefined
      cooldown.current = 6
      setFaceState('点击重试')
    }
    props.mfaLogin(code, data, message)
  }

  const faceBind = () => {
    let url = '/api/v2/mfa/face/associate'
    let data = {
      photoA: p1.current,
      photoB: p2.current,
    }
    let mfaToken = props.initData.mfaToken
    let config = {
      headers: {
        authorization: mfaToken,
      },
    }
    post(url, data, config).then((result) => {
      faceLogin(result)
    })
  }

  const faceCheck = () => {
    let url = '/api/v2/mfa/face/verify'
    let data = {
      photo: p1.current,
    }
    let mfaToken = props.initData.mfaToken
    let config = {
      headers: {
        authorization: mfaToken,
      },
    }
    post(url, data, config).then((result) => {
      // 如果是 1702，那么久绑定一个
      faceLogin(result)
    })
  }

  // bind 的情况
  const goToBindScene = (key: string) => {
    if (!p1.current) {
      p1.current = key
    } else {
      if (cooldown.current > 0) {
        cooldown.current -= 1
      }
      if (cooldown.current <= 0) {
        p2.current = key
        // 彻底上传完了，应该走验证了
        interval.current && clearInterval(interval.current)
        faceBind()
      }
    }
  }

  // goToCheck 的情况
  const goToCheckScene = (key: string) => {
    p1.current = key
    interval.current && clearInterval(interval.current)
    faceCheck()
  }

  // 识别成功，自动前进到下一个步骤
  const quitIdentifying = (blob: Blob) => {
    setPercent(100)
    uploadImage(blob).then((key) => {
      if (props.initData?.faceMfaEnabled === true) {
        goToCheckScene(key)
      } else {
        goToBindScene(key)
      }
    })
  }

  const autoShoot = useCallback(async () => {
    if (!interval.current) {
      interval.current = setInterval(() => autoShoot(), 500)
    }
    const videoDom = videoRef.current!
    if (videoDom.paused || videoDom.ended || !isFaceDetectionModelLoaded()) {
      return
    }
    const options = getFaceDetectorOptions()
    const result = await detectSingleFace(videoDom, options)

    console.log('重试', result?.score)
    if (result) {
      if (result.score > FACE_SCORE) {
        const base64Data = getBase64(videoDom)
        const blob = dataURItoBlob(base64Data)
        quitIdentifying(blob) // 识别成功，退出识别
      } else {
        // 识别失败，但是有结果，设置相似性
        setPercent(() => {
          return (result.score / FACE_SCORE) * 100
        })
        // console.log('识别失败，但是有结果，设置相似性', percent)
      }
    } else {
      setPercent(10)
    }
  }, [])

  return (
    <div>
      <h3 className="authing-g2-mfa-title">绑定人脸识别</h3>
      <p className="authing-g2-mfa-tips">请保持摄像头已打开并无遮挡</p>
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
              setFaceState('识别中')
              autoShoot()
            }}
          >
            开始验证
          </Button>
        </>
      )}
      <div
        className="g2-mfa-face-identifying"
        style={{
          display: faceState !== '准备中' ? 'flex' : 'none',
        }}
      >
        <video
          className="video-round"
          ref={videoRef}
          // onLoadedMetadata={() => onIdentify()}
          id="inputVideo"
          autoPlay
          muted
          playsInline
        />
        <div
          className="video-round mesh"
          style={{
            display: faceState === '点击重试' ? 'flex' : 'none',
          }}
          onClick={() => {
            setFaceState('识别中')
            setPercent(0)
            autoShoot()
          }}
        >
          重试一次
        </div>

        <div className="video-round ring">
          <svg width={240} height={240} fill="none">
            {/* <circle
              id="circleBg"
              className="svg-circle-bg"
              cx={120}
              cy={120}
              r={110}
            /> */}
            <circle
              className="svg-circle-running"
              style={dashStyle}
              strokeDasharray={700} // 根据周长做 0-700 之间的数值表示准确率
              strokeDashoffset={700 - offset} // 处理这个 offset, 0-700之间的数
              cx={120}
              cy={120}
              r={110}
            />
          </svg>
        </div>
      </div>

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
