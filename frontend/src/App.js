import React, { useEffect, useRef, useState } from 'react'
import './App.css';

function App() {
  const [link, setLink] = useState('');

  var canvas, context, radius, canvasWidth, canvasHeight, ms, secMS;

  const canvasRef = useRef(undefined);
  const videoRef = useRef(undefined);

  let hours;
  let minutes;
  let seconds;

  let hourColor = "#e53935";
  let minuteColor = "#E0E0E0";
  let secondColor = "#1E88E5";

  useEffect(() => {
    canvas = canvasRef.current;
    context = canvas.getContext("2d");
    canvasWidth = canvas.width;
    canvasHeight = canvas.height;

    drawClock();
    setInterval(drawClock, 1);
  }, []);
 
  //function to update our time variables
  const updateTime = () => {
    let currentTime = new Date();
    hours = currentTime.getHours();
    minutes = currentTime.getMinutes();
    seconds = currentTime.getSeconds();
    ms = currentTime.getMilliseconds();
    secMS = seconds + ms / 1000;
  }

  //function to convert the degrees to radians
  const degreesToRadians = (degrees) => {
    //we're subtracting Math.PI/2 due to radians starting at
    //45 degrees (3 o'clock) rather than 0
    return degrees * (Math.PI / 180) - Math.PI / 2;
  };

  const drawClock = () => {
    updateTime();
    context.clearRect(0, 0, canvasWidth, canvasHeight);

    //draw background
    context.fillStyle = "#212121";
    context.fillRect(0, 0, canvasWidth, canvasHeight);

    //draw hours hand
    context.strokeStyle = hourColor;
    context.lineWidth = 15;
    context.beginPath();

    //calculate the position in degrees
    let hourPos = 360 * (hours / 24);
    //draw an arc that starts at 0 degrees and ends up in a position based on our hours variable
    context.arc(canvasWidth / 2, canvasHeight / 2, 250, 1.5 * Math.PI, degreesToRadians(hourPos));
    context.stroke();

    //draw minutes hand
    context.strokeStyle = minuteColor;
    context.lineWidth = 15;
    context.beginPath();
    //calculate the position in degrees
    let minutePos = 360 * (minutes / 60);
    //draw an arc that starts at 0 degrees and ends up in a position based on our minutes variable
    context.arc(canvasWidth / 2, canvasHeight / 2, 225, 1.5 * Math.PI, degreesToRadians(minutePos));
    context.stroke();

    //draw seconds hand
    context.strokeStyle = secondColor;
    context.lineWidth = 15;
    context.beginPath();
    //calculate the position in degrees
    let secondPos = 360 * (secMS / 60);
    //draw an arc that starts at 0 degrees and ends up in a position based on our seconds variable
    context.arc(canvasWidth / 2, canvasHeight / 2, 200, 1.5 * Math.PI, degreesToRadians(secondPos));
    context.stroke();

    //draw text
    context.font = "45px Arial";
    context.fillStyle = "#FFFDE7";
    context.fillText(":", canvasWidth / 2 + 52, canvasHeight / 2 - 4);
    context.fillText(":", canvasWidth / 2 + 115, canvasHeight / 2 - 4);
    context.fillStyle = hourColor;
    context.fillText(prependNumber(hours), canvasWidth / 2, canvasHeight / 2);
    context.fillStyle = minuteColor;
    context.fillText(prependNumber(minutes), canvasWidth / 2 + 63, canvasHeight / 2);
    context.fillStyle = secondColor;
    context.fillText(prependNumber(seconds), canvasWidth / 2 + 130, canvasHeight / 2);
  }

  // this is a function to prepend a 0 to the number if it is only a single digit
  function prependNumber(number) {
    let checkNum = number.toString();
    checkNum = checkNum.split("");
    if (checkNum.length == 1) {
      return "0" + number.toString();
    } else {
      return number;
    }
  }

  const recordCanvas = () => {
    console.log('canvas', canvas);
    const chunks = [];
    const stream = canvas.captureStream(); // grab our canvas MediaStream
    const rec = new MediaRecorder(stream); // init the recorder

    rec.ondataavailable = e => chunks.push(e.data);
    rec.onstop = e => uploadHandler(new Blob(chunks, { type: 'video/webm' }));

    rec.start();
    setTimeout(() => rec.stop(), 6000);
  }

  const uploadHandler = async (blob) => {
    await readFile(blob).then((encoded_file) => {
      try {
        console.log(encoded_file)
        fetch('/api/upload', {
          method: 'POST',
          body: JSON.stringify({ data: encoded_file }),
          headers: { 'Content-Type': 'application/json' },
        })
          .then((response) => response.json())
          .then((data) => {
            setLink(data.data);
            console.log(link)
          });
      } catch (error) {
        console.error(error);
      }
    });
  }

  function readFile(file) {
    console.log("readFile()=>", file);
    return new Promise(function (resolve, reject) {
      let fr = new FileReader();

      fr.onload = function () {
        resolve(fr.result);
      };

      fr.onerror = function () {
        reject(fr);
      };

      fr.readAsDataURL(file);
    });
  };

  return (
    <>
      <nav>
        <h4>Canvas to Webm</h4>
        {link && <a href={link}><h6><b>your link</b></h6></a>}
        <button onClick={recordCanvas}>convert canvas to video</button>
      </nav>
      <div className="container">
        <div className="row">
          <div className="column">
            <h3 onClick={drawClock}>CANVAS ANIMATED SAMPLE</h3><br />

            <canvas id="canvas" width="550" height="550" ref={canvasRef} />
          </div>
          <div className="column">
            <h3>PROCESSED WEBM FILE</h3><br />
            <video src = "https://res.cloudinary.com/dogjmmett/video/upload/v1658162286/vhekrp6err4mbx4hdlvu.webm" loop autoPlay controls/>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
