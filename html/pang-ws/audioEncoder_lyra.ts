import {
  encodeWithLyra,
  isLyraReady,
  // @ts-ignore
} from "https://unpkg.com/lyra-codec/dist/lyra_bundle.js";

const kSampleRate = 48000;
const kNumRequiredFrames = 2;
const kNumSamplesPerFrame = 0.01 * kSampleRate;
const kNumRequiredSamples = kNumSamplesPerFrame * kNumRequiredFrames;

const buffer = new Float32Array(kNumRequiredSamples);
let buffer_index = 0;
let num_frames_copied = 0;

// 오디오 프레임 받아서 encodeFrame 함수에 전달
export const encodeAudioStream = async (stream: MediaStream) => {
  const track = stream.getAudioTracks()[0];
  const processor = new MediaStreamTrackProcessor({ track });
  const reader = processor.readable.getReader();
  const result = await reader.read();

  const frame = result.value;
  if (frame === undefined) return;

  const encoded = encodeFrame(frame);
  frame.close();

  return encoded;
};

// Lyra 이용해서 오디오 데이터 encoding
const encodeFrame = (audioData: AudioData) => {
  if (!isLyraReady) return;

  copyDataToBuffer(audioData);

  num_frames_copied++;

  // 필요한 프레임 수만큼 버퍼가 채워졌을 때 encoding
  if (num_frames_copied % kNumRequiredFrames == 0) {
    const uint8arr = encodeWithLyra(buffer, kSampleRate);

    return uint8arr;
  }
};

// 오디오 데이터를 버퍼로 복사
const copyDataToBuffer = (audioData: AudioData) => {
  const format = "f32-planar";

  const current_buffer = new Float32Array(audioData.numberOfFrames);
  audioData.copyTo(current_buffer, { planeIndex: 0, format });

  // Copy from current buffer to accumulator buffer.
  for (let i = 0; i < audioData.numberOfFrames; i++) {
    buffer[buffer_index % kNumRequiredSamples] = current_buffer[i];
    buffer_index++;
  }
};
