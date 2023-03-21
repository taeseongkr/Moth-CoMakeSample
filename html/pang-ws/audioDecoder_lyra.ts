/// <reference lib="dom" />
import { Observer } from "./observer";
import {
  decodeWithLyra,
  isLyraReady,
  // @ts-ignore
} from "https://unpkg.com/lyra-codec/dist/lyra_bundle.js";

const kSampleRate = 48000;
const kNumRequiredFrames = 2;
const kNumSamplesPerFrame = 0.01 * kSampleRate;
const kNumRequiredSamples = kNumSamplesPerFrame * kNumRequiredFrames;

const AudioDecodeDataObserverEvent = Observer.getInstance();

export const setAudioDecoder = async (audioStream) => {
  // Decoder 생성할 때마다 Worker 새로 생성 (유저별로 Worker 생성)
  const worker = new Worker(
    new URL("../worker/worker-audio-decoder.ts", import.meta.url),
    { type: "module" }
  );

  const AudioDecodeObserverEvent = [
    {
      id: "onmessage_event",
      func: (evtData) => {
        const decoded = decodeChunk(evtData);
        worker.postMessage(decoded);
      },
    },
  ];

  const AudioDecodeObserver = Observer.getInstance();
  AudioDecodeObserver.addObserverEvent(AudioDecodeObserverEvent);

  // 오디오 데이터를 재생시켜줄 stream 생성하고 sub 인스턴스의 stream 멤버에 할당.
  const generator = new MediaStreamTrackGenerator({ kind: "audio" });
  const writer = generator.writable.getWriter();
  audioStream = new MediaStream([generator]); // => 얘를 어떻게 전달하지 ?????
  const audioEl = document.getElementById("audioElement") as HTMLAudioElement;
  audioEl.srcObject = audioStream;

  // Worker로부터 오디오 프레임 받아서 writer에 write 해줌.
  worker.onmessage = (message) => {
    const frame = message.data;

    writer.write(frame);
    frame.close();
  };
};

// Lyra 사용해서 Uint8Array로 된 오디오 데이터를 Float32Array로 decode 함.
const decodeChunk = (chunk: ArrayBuffer) => {
  if (!isLyraReady) return;

  const uint8arr = new Uint8Array(chunk);
  const float32arr = decodeWithLyra(uint8arr, kSampleRate, kNumRequiredSamples);
  return float32arr;
};
