import { videoEncoderSettings } from "./videoCodecs.js";
import {
  configVideoEncoder,
  startVideoEncoding,
  stopVideoEncoding,
} from "./videoEncoder.js";

let APIOption = {
  //host: null, // moth 도메인 이름 또는 IP 주소
  //port: null, // port 번호 (ex: 8277)
  mode: "pub",
  //channelName: null,
  track: "video",
  mime: "video/vp8",
};

const codecConfig = videoEncoderSettings[APIOption.mime].low;
codecConfig.width = 640;
codecConfig.height = 480;

let videoWsUrl;
let videoWs = "";
var mimeSendInterval;
var outputHost = document.getElementById("outputHost");
const hostInput = document.getElementById("host");
const portInput = document.getElementById("port");
const instantName = document.getElementById("channelName");
const selectChannel = document.getElementById("channel");
var video = document.getElementById("video");
var button = document.getElementById("onPortConnect");
button.addEventListener("click", function () {
  const inputText = host.value;
  alert(`Input value: ${inputText}`);
});

var printOutputHost = function (message) {
  //output 자식노드로 div 생성.
  var d = document.createElement("div");
  d.innerHTML = message;
  outputHost.appendChild(d);
};
let userStream;
navigator.mediaDevices
  .getUserMedia({ video: true, audio: true })
  .then(function (stream) {
    /* 스트림 사용 */
    video.srcObject = stream;
    userStream = stream;
    video.play();
  })
  .catch(function (err) {
    /* 오류 처리 */
    console.log("에러 : ", err);
  });

document.getElementById("onOpenSocketHost").onclick = function (evt) {
  const setURL = (OptionObject) => {
    let WsUrl;
    // This part means that you will use the instant channel, so you need to enter the instant channel name.

    if (selectChannel.value === 'instant') {
      
      if (window.location.protocol == "https:") {
        WsUrl = `wss://${hostInput.value}:${portInput.value}/pang/ws/${OptionObject.mode}?channel=instant&name=${instantName.value}&track=${OptionObject.track}&mode=single`;
      } else {
        WsUrl = `ws://${hostInput.value}:${portInput.value}/pang/ws/${OptionObject.mode}?channel=instant&name=${instantName.value}&track=${OptionObject.track}&mode=single`;
      }
    } else {
      //This means that we will use existing channels. Therefore, you do not need to enter an instant channel name.

      if (window.location.protocol == "https:") {
        WsUrl = `wss://${hostInput.value}:${portInput.value}/pang/ws/${OptionObject.mode}?channel=${OptionObject.channel}&track=${OptionObject.track}&mode=single`;
      } else {
        WsUrl = `ws://${hostInput.value}:${portInput.value}/pang/ws/${OptionObject.mode}?channel=${OptionObject.channel}&track=${OptionObject.track}&mode=single`;
      }
    }
    console.log(WsUrl);
    return WsUrl;
  };
  if (videoWs) {
    return false;
  }
  videoWsUrl = setURL(APIOption);
  if (videoWsUrl == "") {
    alert("Please specify host, port, and channel");
  }

  videoWs = new WebSocket(videoWsUrl);
  console.log(videoWs);
  videoWs.binaryType = "arraybuffer";

  videoWs.onopen = function (evt) {
    printOutputHost("Open Video Pub Websocket");
    console.log(videoWs);
  };
  videoWs.onclose = function (evt) {
    printOutputHost("Close Video Pub Websocket");
    videoWs = null;
    console.log(videoWs);
  };
  videoWs.onerror = function (evt) {
    // WebSocket에 error 발생 시 실행
    console.log("ERROR: " + evt.data);
  };
};

document.getElementById("onSendVideoDataHost").onclick = function (evt) {
  //send 클릭 시.
  printOutputHost("Sending");
  if (!videoWs) {
    alert("Please press the open button");
    return;
  }
  configVideoEncoder(codecConfig, userStream, videoWs); // encoder setting

  mimeSendInterval = setInterval(() => {
    // 매 초마다 mime 정보 보냄
    videoWs.send(APIOption.mime);
  }, 1000);
  startVideoEncoding();
};
document.getElementById("onCloseSocketHost").onclick = function (evt) {
  const closeWs = (videoElement) => {
    if (!videoWs) {
      return;
    }
    clearInterval(mimeSendInterval); // mime 정보 전송 중지
    stopVideoEncoding(); // Video encoding 종료
    videoWs.close(); // web socket close
    videoWs = null;
    return false;
  };
  closeWs();
};
