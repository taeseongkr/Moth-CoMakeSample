export {};

const kSampleRate = 48000;
const kNumRequiredFrames = 2;
const kNumSamplesPerFrame = 0.01 * kSampleRate;
const kNumRequiredSamples = kNumSamplesPerFrame * kNumRequiredFrames;

let timeStamp = 0;

const pendingFrames: AudioData[] = [];
let underflow = true;
let baseTime = 0;

onmessage = (message) => {
  const dataArray = message.data;
  const audioData = new AudioData({
    format: "f32-planar",
    sampleRate: kSampleRate,
    numberOfFrames: dataArray.length,
    numberOfChannels: 1,
    timestamp: timeStamp,
    data: dataArray,
  });
  // 프레임 하나가 10ms고 하나의 AudioData는 두 개의 프레임으로 이루어지므로
  // 타임스탬프는 20ms 간격으로 늘어나야 함. (20ms = 20,000us)
  timeStamp += 20000;

  handleFrame(audioData);
};

// pendingFrames 배열에 오디오 프레임 푸쉬하고 renderFrame 호출.
const handleFrame = (frame: AudioData) => {
  pendingFrames.push(frame);
  if (underflow) setTimeout(renderFrame, 0);
};

// pendingFrames에 프레임이 남아 있다면 프레임을 꺼내서 wasm-decoder.ts으로 전송.
const renderFrame = async () => {
  underflow = pendingFrames.length === 0;
  if (underflow) return;

  const frame = pendingFrames.shift();
  if (frame === undefined) return;

  postMessage(frame);

  frame.close();

  // Immediately schedule rendering of the next frame
  setTimeout(renderFrame, 0);
};
