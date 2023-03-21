import { videoMimeAPI } from "./mothVideo.js";

// 비디오 인코더를 저장할 인코더 개체 Encoder object to store the video encoder
const encoder = (() => {
  let encoderObject;

  return {
    set: videoEncoder => {
      encoderObject = videoEncoder;
    },
    get: () => {
      return encoderObject;
    },
  };
})();

// 코덱 구성 및 스트림을 사용하여 비디오 인코더를 구성 Configures the video encoder with the codec configuration and stream
export const configVideoEncoder = async (codecConfig, stream, mothPub) => {
  // 비디오 인코더의 초기화 매개 변수 설정 Setting up the init parameters for the video encoder
  const init = {
    // 인코딩에서 얻은 데이터 청크를 처리하는 함수 Function to handle the chunk of data obtained from encoding
    output: chunk => {
      encoder.pendingOutputs--;
      handleChunk(chunk);
    },
    error: err => {
      encoder.keepGoing = false;
      throw err;
    },
  };

  // 인코딩된 데이터 청크를 필요한 곳에 이동 Move encoded data chunks to where they are needed.
  const handleChunk = chunk => {
    const chunkData = new Uint8Array(chunk.byteLength);
    chunk.copyTo(chunkData);
    if (mothPub) {
      mothPub.send(chunkData);
    }
    // const decoderObserver = Observer.getInstance()
    // decoderObserver.notifyObserver("encodeVideo_chunkData", chunkData)
  };

  // 스트림에서 비디오 트랙 가져오기 Getting the video track from the stream
  const track = stream.getVideoTracks()[0];
  const trackProcessor = new MediaStreamTrackProcessor(track);

  // 처리된 트랙에서 판독기 가져오기 Getting the reader from the processed track
  encoder.reader = trackProcessor.readable.getReader();

  // 코덱 구성이 지원되는지 확인 Checking if the codec configuration is supported
  const { supported } = await VideoEncoder.isConfigSupported(codecConfig);
  if (supported) {
    // 비디오 인코더 개체 생성 Creating the video encoder object
    const videoEncoder = new VideoEncoder(init);
    videoEncoder.configure(codecConfig);

    // 비디오 인코더 개체를 인코더 싱글톤에 저장 Storing the video encoder object in the encoder singleton
    encoder.set(videoEncoder);

    // 보류 중인 출력 수를 초기화하고 진행 플래그를 true로 유지 Initializing the number of pending outputs and keepGoing flag to true
    encoder.pendingOutputs = 0;
    encoder.keepGoing = true;

    // 프레임 카운터 및 keyFrame 간격 초기화 Initializing the frame counter and keyFrame interval
    encoder.frameCounter = 0;
    encoder.keyFrameInterval = codecConfig.interval;

    // 비디오 MIME API 오브젝트 작성 및 MIME 문자열 가져오기 Creating the video mime API object and getting the mime string
    const mimeAPI = new videoMimeAPI();
    mimeAPI.parseByCodecConfig(codecConfig);
    const mimeString = mimeAPI.getMimeString(codecConfig);

    // WS으로 MIME 문자열 보내기 Sending the mime
    mothPub.send(mimeString);
  } else {
    throw 'Codec Configuration Not supported';
  }
};

// 비디오 인코딩 Video encoding
export const startVideoEncoding = async () => {
  // 판독기에서 각 프레임을 읽는 재귀 함수 This is a recursive function that reads each frame from the scanner
  async function readFrame() {
    // 판독기에서 다음 프레임 읽기 Read the next frame from the reader
    const result = await encoder.reader.read();
    const frame = result.value;

    // 모든 프레임을 읽었는지 확인 Check if all frames have been read
    if (frame === undefined) {
      return;
    }

    // 인코더가 구성되어 있고 여전히 실행 중이고 보류 중인 출력이 2개 미만인 경우, 
    // If the encoder is configured and still running and there are fewer than 2 pending outputs,
    // 현재 프레임을 인코딩하고 대기 중인 출력과 프레임 카운터를 증가
    // encode the current frame and increment the pending outputs and frame counter
    if (
      encoder.get().state == 'configured' &&
      encoder.keepGoing &&
      encoder.pendingOutputs <= 2
    ) {
      encoder.frameCounter++;
      encoder.pendingOutputs++;
      encoder.get().encode(frame, {
        keyFrame: encoder.frameCounter % encoder.keyFrameInterval == 0,
      });
      frame.close();
    } else {
      frame.close();
    }

    setTimeout(readFrame, 1);
  }

  readFrame();
};

export const stopVideoEncoding = async () => {
  try {
    // 비디오 인코더 및 현재 프레임 가져오기 Get the video encoder and the current frame
    const videoEncoder = encoder.get();
    let frame = await encoder.reader.read().value;

    // 프레임이 있으면 닫기 If there is a frame, close it
    if (frame) {
      await encoder.reader.read().value.close();
      frame = undefined;
      console.log('Encoding : frame close');
    }

    // 비디오 인코더를 플러시하고 닫기 Flush the video encoder and close it
    await videoEncoder.flush();
    videoEncoder.close();

    return true;
  } catch (err) {
    console.log(err);
  }
};