// =========================================================================
// 🔴 YOUR MODEL URL (Keep trailing slash '/')
// =========================================================================
let audioModelURL = 'https://teachablemachine.withgoogle.com/models/Vn2AEYTUb/';

let classifier;
let label = "Click screen to start mic...";
let confidence = 0.0;
let lightOn = false;
let isListening = false;
let canToggle = true;

// Volume visualizer to verify mic is recording
let mic;
let micLevel = 0;

function setup() {
  createCanvas(640, 480);
}

// User click is required by browsers to unblock microphone audio
function mousePressed() {
  if (!isListening) {
    userStartAudio(); // Resume audio context

    // Start live microphone level monitor
    mic = new p5.AudioIn();
    mic.start();

    label = "Loading audio model...";
    
    // Exactly 3 arguments: (modelPath, options, callback)
    let options = { probabilityThreshold: 0.70 };
    classifier = ml5.soundClassifier(
      audioModelURL + 'model.json',
      options,
      modelReady
    );

    isListening = true;
  }
}

function modelReady() {
  console.log("Audio Model Loaded!");
  label = "Listening for sound...";
  classifier.classify(gotResult);
}

function gotResult(err, res) {
  if (err) {
    console.error(err);
    return;
  }

  if (res && res.length > 0) {
    label = res[0].label;
    confidence = res[0].confidence;

    // Trigger toggle when above 75% confidence and cooldown has passed
    if (confidence > 0.75 && canToggle) {
      let currentLabel = label.toLowerCase();

      if (currentLabel.includes("clap")) {
        lightOn = !lightOn;

        // Prevent rapid multi-triggers: 1.2 second cooldown
        canToggle = false;
        setTimeout(() => {
          canToggle = true;
        }, 1200);
      }
    }
  }
}

function draw() {
  // 1. Lamp Background Toggle
  if (lightOn) {
    background(255, 240, 160); // Warm lamp ON
    fill(40);
    textAlign(CENTER, CENTER);
    textSize(36);
    text("💡 SMART LAMP: ON", width / 2, 130);
  } else {
    background(25); // Dark OFF
    fill(200);
    textAlign(CENTER, CENTER);
    textSize(36);
    text("🌑 SMART LAMP: OFF", width / 2, 130);
  }

  // 2. Click Prompt
  if (!isListening) {
    fill(255, 100, 100);
    textSize(20);
    text("👆 Click anywhere on this canvas to enable microphone", width / 2, height / 2 + 20);
    return;
  }

  // 3. Live Microphone Activity Meter (shows green bar when you make noise)
  if (mic) {
    micLevel = mic.getLevel();
  }

  fill(50, 50, 50, 200);
  noStroke();
  rect(100, 240, width - 200, 70, 8);

  fill(90);
  rect(120, 280, width - 240, 16, 4);

  // Dynamic green volume indicator
  fill(0, 255, 120);
  let barWidth = map(micLevel, 0, 0.3, 0, width - 240, true);
  rect(120, 280, barWidth, 16, 4);

  fill(255);
  textSize(14);
  textAlign(LEFT, CENTER);
  text("🎙️ Mic Volume:", 120, 262);
  textAlign(RIGHT, CENTER);
  text(floor(micLevel * 100) + "%", width - 120, 262);

  // 4. Teachable Machine HUD readout
  fill(50, 50, 50, 200);
  rect(40, height - 90, width - 80, 60, 8);

  fill(255);
  textSize(20);
  textAlign(CENTER, CENTER);
  text("Heard: " + label + " (" + floor(confidence * 100) + "%)", width / 2, height - 60);
}
