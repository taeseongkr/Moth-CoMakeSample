import { videoEncoderSettings } from "./videoCodecs.js";
import {
  configVideoDecoder,
  decodeVideoFrame,
  stopVideoDecode,
} from "./videoDecoder.js";

// Video WebSocket을 구성할 APIOption
let APIOption = {
  // host: null, // moth 도메인 이름 또는 IP 주소
  // port: null, // port 번호 (ex: 8277)
  mode: "sub",
  //channelName: "btlb3pjpc98lsdbc0lj0",
  track: "video",
  mime: "video/vp8",
};

let videoWsUrl;
let videoWs = "";
let isFirstMessage = true;

const codecConfig = videoEncoderSettings[APIOption.mime].low;
codecConfig.width = 640;
codecConfig.height = 480;
const outputClient = document.getElementById("outputClient");
var printOutputClient = function (message) {
  //output 자식노드로 div 생성.
  var d = document.createElement("div");
  d.innerHTML = message;
  outputClient.appendChild(d);
};
var canvas = document.getElementById("canvas");
const hostInput = document.getElementById("host");
const portInput = document.getElementById("port");
const instantName = document.getElementById("channelName");
const selectChannel=document.getElementById("channel");
document.getElementById("onOpenSocketClient").onclick = function (evt) {
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

  const openWs = (canvasElement) => {
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
    videoWs = new WebSocket(videoWsUrl);
    videoWs.binaryType = "arraybuffer";

    videoWs.onopen = function () {
      printOutputClient("Open Video Sub Websocket");
    };

    videoWs.onmessage = function (evt) {
      if (isFirstMessage) {
        const codecConfig = videoEncoderSettings[APIOption.mime].low;
        codecConfig.width = 640;
        codecConfig.height = 480;

        configVideoDecoder(codecConfig, canvasElement);
        isFirstMessage = false;
        return;
      }

      if (typeof evt.data == "object") {
        decodeVideoFrame(evt);
      } else if (evt.data == APIOption.mime) {
        console.log("mime: ", evt.data);
      } else {
        console.log("RESPONSE: " + evt.data);
      }
    };

    videoWs.onclose = function () {
      printOutputClient("Open Video Sub Websocket");
      // WebSocket이 close 되었을 때 실행
      videoWs = null;
    };

    videoWs.onerror = function (evt) {
      // WebSocket에 error 발생 시 실행
      console.log("ERROR: " + evt.data);
    };
  };
  openWs(canvas);
};
document.getElementById("onCloseSocketClient").onclick = function (evt) {
  if (!videoWs) {
    return false;
  }
  printOutputClient("Close Video Sub Websocket");
  stopVideoDecode(); // video decoding 종료
  videoWs.close(); // web socket close
  videoWs = null;
  return false;
};
