import { Observer } from "./observer.js";

const hostInput = document.getElementById("host");
const portInput = document.getElementById("port");
const instantName = document.getElementById("channelName");
const selectChannel = document.getElementById("channel");
const canvasBlank = document.getElementById("canvas");
const ObserverInstance = Observer.getInstance();
const keyObject = {
  Q: "",
  W: "Go Front",
  E: "",
  R: "",
  T: "",
  Y: "",
  U: "Go Left Diagonal",
  I: "Go Right Diagonal",
  O: "",
  P: "STOP",
  A: "Go Left",
  S: "Go Back",
  D: "Go Right",
  F: "",
  G: "",
  H: "",
  J: "Back Left Diagonal",
  K: "Back Right Diagonal",
  L: "",
  Z: "Gear Down",
  X: "Gear Up",
  C: "",
  V: "",
  B: "",
  N: "",
  M: "",
};
// instantName.onchange()
var button = document.getElementById("onConnect");
var apply = document.getElementById("onApply");
let controlWsPub;
let controlWsSub;
let controlWsUrlPub;
let controlWsUrlSub;
let speed = 5;
var imgObj = new Image();
imgObj.src = "./spider.png";
let ctx;
const scale = Math.min(canvasBlank.width / imgObj.width, canvasBlank.height / imgObj.height);
let imageX;
let imageY;
let imageHeight = imgObj.height * scale * 0.2;
let imageWidth = imgObj.width * scale * 0.2;

var APIOptionPub = {
  mode: "pub",
  track: "colink",
  mime: "text/plain",
};
var APIOptionSub = {
  mode: "sub",
  track: "colink",
  mime: "text/plain",
};

button.addEventListener("click", function () {
  alert(`Host: ${hostInput.value}, Port: ${portInput.value}`);
});
apply.addEventListener("click", function () {
  alert(`${channelName.value}`);
});

const printOutputHost = (message) => {
  var d = document.createElement("div");
  d.innerHTML = message;
  outputHost.appendChild(d);
};

const setUrl = (OptionObject) => {
  let WsUrl;
  if (selectChannel.value === "instant") {
    // instant 채널을 사용할 때
    if (window.location.protocol == "https:") {
      WsUrl = `wss://${hostInput.value}:${portInput.value}}/pang/ws/${OptionObject.mode}?channel=instant&name=${channelName.value}&track=${OptionObject.track}&mode=single`;
    } else {
      WsUrl = `ws://${hostInput.value}:${portInput.value}/pang/ws/${OptionObject.mode}?channel=instant&name=${channelName.value}&track=${OptionObject.track}&mode=single`;
    }
  } else {
    // 기존 채널을 사용할 때
    if (window.location.protocol == "https:") {
      WsUrl = `wss://${hostInput.value}:${portInput.value}/pang/ws/${OptionObject.mode}?channel=${OptionObject.channelName}&track=${OptionObject.track}&mode=single`;
    } else {
      WsUrl = `ws://${hostInput.value}:${portInput.value}/pang/ws/${OptionObject.mode}?channel=${OptionObject.channelName}&track=${OptionObject.track}&mode=single`;
    }
  }
  return WsUrl;
};

const draw = (data) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (data == "Go Front") {
    // 예시: 앞으로 이동하라는 명령어를 받아 로봇을 앞으로 이동
    if (imageY > 4) {
      imageY -= speed;
    }
  } else if (data == "Go Back") {
    if (imageY < canvas.height - 55) {
      imageY += speed;
    }
  } else if (data == "Go Left") {
    if (imageX > 4) {
      imageX -= speed;
    }
  } else if (data == "Go Right") {
    if (imageX < canvas.width - 55) {
      imageX += speed;
    }
  } else if (data == "Go Left Diagonal") {
    if (imageY > 4) {
      imageY -= speed;
    }
    if (imageX > 4) {
      imageX -= speed;
    }
  } else if (data == "Go Right Diagonal") {
    if (imageY > 4) {
      imageY -= speed;
    }
    if (imageX < canvas.width - 55) {
      imageX += speed;
    }
  } else if (data == "Back Left Diagonal") {
    if (imageY < canvas.height - 55) {
      imageY += speed;
    }
    if (imageX > 4) {
      imageX -= speed;
    }
  } else if (data == "Back Right Diagonal") {
    if (imageY < canvas.height - 55) {
      imageY += speed;
    }
    if (imageX < canvas.width - 55) {
      imageX += speed;
    }
  } else if (data == "Gear Up") {
    if (speed <= 10) {
      speed += 1;
    }
  } else if (data == "Gear Down") {
    if (speed >= 2) {
      speed -= 1;
    }
  }
  var img = new Image();
  img.src = "./spider.png";
  img.onload = function () {
    ctx.beginPath();
    ctx.drawImage(img, imageX, imageY, imageWidth, imageHeight);
    ctx.closePath();
  };

};
const send = (keyObject) => {
  if (controlWsPub) {
    window.addEventListener("keypress", (e) => {
      // keyboard가 눌렸을 때
      keyPressHandler(e, keyObject); //명령어 websocket으로 보냄
    });
    window.addEventListener("keyup", () => {
      // keyboard가 떼졌을 때
      controlWsPub.send("STOP");
    });
  }
};
// keyboard에 맞는 명령어 websocket으로 보내기
const keyPressHandler = (e, keyObject) => {
  if (controlWsPub) {
    if (e.keyCode === 97 || e.keyCode === 12609 || e.keyCode === 65) {
      // 예시: A를 클릭하여 A 키보드에 설정되어 있는 명령을 web socket을 통해 로봇에게 전송
      controlWsPub.send(keyObject.A);
      ObserverInstance.notifyObserver("send", keyObject.A);
    } else if (e.keyCode === 98 || e.keyCode === 12640 || e.keyCode === 98) {
      controlWsPub.send(keyObject.B);
      ObserverInstance.notifyObserver("send", keyObject.B);
    } else if (e.keyCode === 99 || e.keyCode === 12618 || e.keyCode === 67) {
      controlWsPub.send(keyObject.C);
      ObserverInstance.notifyObserver("send", keyObject.C);
    } else if (e.keyCode === 100 || e.keyCode === 12615 || e.keyCode === 68) {
      controlWsPub.send(keyObject.D);
      ObserverInstance.notifyObserver("send", keyObject.D);
    } else if (e.keyCode === 101 || e.keyCode === 12599 || e.keyCode === 69) {
      controlWsPub.send(keyObject.E);
      ObserverInstance.notifyObserver("send", keyObject.E);
    } else if (e.keyCode === 102 || e.keyCode === 12601 || e.keyCode === 70) {
      controlWsPub.send(keyObject.F);
      ObserverInstance.notifyObserver("send", keyObject.F);
    } else if (e.keyCode === 103 || e.keyCode === 12622 || e.keyCode === 71) {
      controlWsPub.send(keyObject.G);
      ObserverInstance.notifyObserver("send", keyObject.G);
    } else if (e.keyCode === 104 || e.keyCode === 12631 || e.keyCode === 72) {
      controlWsPub.send(keyObject.H);
      ObserverInstance.notifyObserver("send", keyObject.H);
    } else if (e.keyCode === 105 || e.keyCode === 12625 || e.keyCode === 73) {
      controlWsPub.send(keyObject.I);
      ObserverInstance.notifyObserver("send", keyObject.I);
    } else if (e.keyCode === 106 || e.keyCode === 12627 || e.keyCode === 74) {
      controlWsPub.send(keyObject.J);
      ObserverInstance.notifyObserver("send", keyObject.J);
    } else if (e.keyCode === 107 || e.keyCode === 12623 || e.keyCode === 75) {
      controlWsPub.send(keyObject.K);
      ObserverInstance.notifyObserver("send", keyObject.K);
    } else if (e.keyCode === 108 || e.keyCode === 12643 || e.keyCode === 76) {
      controlWsPub.send(keyObject.L);
      ObserverInstance.notifyObserver("send", keyObject.L);
    } else if (e.keyCode === 109 || e.keyCode === 12641 || e.keyCode === 77) {
      controlWsPub.send(keyObject.M);
      ObserverInstance.notifyObserver("send", keyObject.M);
    } else if (e.keyCode === 110 || e.keyCode === 12636 || e.keyCode === 78) {
      controlWsPub.send(keyObject.N);
      ObserverInstance.notifyObserver("send", keyObject.N);
    } else if (e.keyCode === 111 || e.keyCode === 12624 || e.keyCode === 79) {
      controlWsPub.send(keyObject.O);
      ObserverInstance.notifyObserver("send", keyObject.O);
    } else if (e.keyCode === 112 || e.keyCode === 12628 || e.keyCode === 80) {
      controlWsPub.send(keyObject.P);
      ObserverInstance.notifyObserver("send", keyObject.P);
    } else if (e.keyCode === 113 || e.keyCode === 12610 || e.keyCode === 81) {
      controlWsPub.send(keyObject.Q);
      ObserverInstance.notifyObserver("send", keyObject.Q);
    } else if (e.keyCode === 114 || e.keyCode === 12593 || e.keyCode === 82) {
      controlWsPub.send(keyObject.Q);
      ObserverInstance.notifyObserver("send", keyObject.R);
    } else if (e.keyCode === 115 || e.keyCode === 12596 || e.keyCode === 83) {
      controlWsPub.send(keyObject.S);
      ObserverInstance.notifyObserver("send", keyObject.S);
    } else if (e.keyCode === 116 || e.keyCode === 12613 || e.keyCode === 84) {
      controlWsPub.send(keyObject.S);
      ObserverInstance.notifyObserver("send", keyObject.T);
    } else if (e.keyCode === 117 || e.keyCode === 12629 || e.keyCode === 85) {
      controlWsPub.send(keyObject.U);
      ObserverInstance.notifyObserver("send", keyObject.U);
    } else if (e.keyCode === 118 || e.keyCode === 12621 || e.keyCode === 86) {
      controlWsPub.send(keyObject.U);
      ObserverInstance.notifyObserver("send", keyObject.V);
    } else if (e.keyCode === 119 || e.keyCode === 12616 || e.keyCode === 87) {
      controlWsPub.send(keyObject.W);
      ObserverInstance.notifyObserver("send", keyObject.W);
    } else if (e.keyCode === 120 || e.keyCode === 12620 || e.keyCode === 88) {
      controlWsPub.send(keyObject.X);
      ObserverInstance.notifyObserver("send", keyObject.X);
    } else if (e.keyCode === 121 || e.keyCode === 12635 || e.keyCode === 89) {
      controlWsPub.send(keyObject.X);
      ObserverInstance.notifyObserver("send", keyObject.Y);
    } else if (e.keyCode === 122 || e.keyCode === 12619 || e.keyCode === 90) {
      controlWsPub.send(keyObject.Z);
      ObserverInstance.notifyObserver("send", keyObject.Z);
    } else {
      controlWsPub.send("send", "STOP");
    }
  }
};
document.getElementById("onOpenSocket").onclick = function (evt) {
  controlWsUrlPub = setUrl(APIOptionPub);
  controlWsUrlSub = setUrl(APIOptionSub);
  console.log("controlWsUrlPub", controlWsUrlPub);
  console.log("controlWsUrlsub", controlWsUrlSub);
  // Open 버튼 클릭 시 실행되는 WebSocket을 open하는 기능 (pub과 sub을 동시에)
  const openWs = (canvasElement) => {
    if (controlWsPub || controlWsSub) {
      return false;
    }
    if (controlWsUrlPub == "" || controlWsUrlSub == "") {
      alert("Please specify host, port, and channel");
    }

    let canvas = canvasElement; // 가상의 로봇을 보여주는 canvas
    ctx = canvas.getContext("2d");
    imageX = (canvas.width - imageWidth) / 2;
    imageY = (canvas.height - imageHeight) / 2;
    console.log('imageX', imageX);
    controlWsPub = new WebSocket(controlWsUrlPub);
    controlWsPub.binaryType = "arraybuffer";
    controlWsSub = new WebSocket(controlWsUrlSub);
    controlWsSub.binaryType = "arraybuffer";

    controlWsPub.onopen = function () {
      printOutputHost("Open");
    };
    controlWsSub.onopen = function () {
      printOutputHost("Open");
    };

    controlWsSub.onmessage = function (evt) {
      draw(evt.data); // 해당 명령에 맞는 로봇 움직임 그리기
    };

    controlWsPub.onclose = function () {
      // WebSocket이 close 되었을 때 실행
      printOutputHost("Close");
      controlWsPub = null;
    };
    controlWsSub.onclose = function () {
      // WebSocket이 close 되었을 때 실행
      printOutputHost("Close");
      controlWsSub = null;
    };

    controlWsPub.onerror = function (evt) {
      // WebSocket에 error 발생 시 실행
      console.log("ERROR: " + evt.data);
    };
    controlWsSub.onerror = function (evt) {
      // WebSocket에 error 발생 시 실행
      console.log("ERROR: " + evt.data);
    };
  };
  openWs(canvasBlank);
};
let mimeSendInterval;
document.getElementById("onSend").onclick = function (evt) {
    // ctx = canvasBlank.getContext("2d");
    // ctx.drawImage(imgObj, imageX, imageY, imageHeight, imageWidth);
  const sendData = (keyObject) => {
    if (!controlWsPub) {
      alert("Please press the open button");
      return;
    }
    mimeSendInterval = setInterval(() => {
      controlWsPub.send(APIOptionPub.mime); // 매 초마다 mime 정보 보냄
    }, 1000);
    send(keyObject); // keyboard로 정의된 명령 보냄
  };
  sendData(keyObject);
};
document.getElementById("onCloseSocket").onclick = function (evt) {
  const closeWs = () => {
    if (!controlWsPub) {
      return;
    }
    clearInterval(mimeSendInterval); // mime 정보 전송 중지
    controlWsPub.close(); // web socket close
    return false;
  };
  closeWs();
};
