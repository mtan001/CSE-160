// ColoredPoint.js (c) 2012 matsuda

document.getElementById("angleSlide").value = "45";
document.getElementById("headSlide").value = "0";
document.getElementById("frontLeftLegSlide").value = "20";
document.getElementById("frontRightLegSlide").value = "20";
document.getElementById("backLeftLegSlide").value = "25";
document.getElementById("backRightLegSlide").value = "25";
document.getElementById("tailSlide").value = "10";

// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
  }
  `

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }
  `

// Global Variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;
let u_ModelMatrix;

function setupWebGL(){
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  gl.enable(gl.DEPTH_TEST);

}

function connectVariablesToGLSL(){
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if(!u_ModelMatrix){
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if(!u_GlobalRotateMatrix){
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);

}

function mouseRotation(ev){

  let dx = ev.clientX - g_lastX;
  let dy = ev.clientY - g_lastY;

  g_mouseX += dy * 0.5;
  g_mouseY += dx * 0.5;

  g_lastX = ev.clientX;
  g_lastY = ev.clientY;

  renderAllShapes();
}

// Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;
const PAINTBRUSH = 3;

// Globals related UI elements
let g_selectedColor=[1.0,1.0,1.0,1.0];
let g_selectedSize=5;
let g_selectedType=POINT;
// Global joint angles
let g_globalAngle=0;
let g_headAngle=0;
let g_FLLAngle=0;
let g_FRLAngle=0;
let g_BLLAngle=0;
let g_BRLAngle=0;
let g_tailAngle=0;
// Global animation booleans
let g_headAnimation=false;
let g_FLLAnimation=false;
let g_FRLAnimation=false;
let g_BLLAnimation=false;
let g_BRLAnimation=false;
let g_tailAnimation=false;
// Global mouse rotation 
let g_mouseX = 0;
let g_mouseY = 0;
let g_isDragging = false;
let g_lastX = 0;
let g_lastY = 0;


function addActionsForHtmlUI(){
  // Animation Buttons
  document.getElementById('animationHeadOnButton').onclick = function() {g_headAnimation=true };
  document.getElementById('animationHeadOffButton').onclick = function() {g_headAnimation=false };
  document.getElementById('animationFLLOnButton').onclick = function() {g_FLLAnimation=true };
  document.getElementById('animationFLLOffButton').onclick = function() {g_FLLAnimation=false };
  document.getElementById('animationFRLOnButton').onclick = function() {g_FRLAnimation=true };
  document.getElementById('animationFRLOffButton').onclick = function() {g_FRLAnimation=false };
  document.getElementById('animationBLLOnButton').onclick = function() {g_BLLAnimation=true };
  document.getElementById('animationBLLOffButton').onclick = function() {g_BLLAnimation=false };
  document.getElementById('animationBRLOnButton').onclick = function() {g_BRLAnimation=true };
  document.getElementById('animationBRLOffButton').onclick = function() {g_BRLAnimation=false };
  document.getElementById('animationTailOnButton').onclick = function() {g_tailAnimation=true };

  // Joint Sliders
  document.getElementById('headSlide').addEventListener('mousemove', function() {g_headAngle = this.value; renderAllShapes(); });
  document.getElementById('frontLeftLegSlide').addEventListener('mousemove', function() {g_FLLAngle = this.value; renderAllShapes(); });
  document.getElementById('frontRightLegSlide').addEventListener('mousemove', function() {g_FRLAngle = this.value; renderAllShapes(); });
  document.getElementById('backLeftLegSlide').addEventListener('mousemove', function() {g_BLLAngle = this.value; renderAllShapes(); });
  document.getElementById('backRightLegSlide').addEventListener('mousemove', function() {g_BRLAngle = this.value; renderAllShapes(); });
  document.getElementById('tailSlide').addEventListener('mousemove', function() {g_tailAngle = this.value; renderAllShapes(); });

  // Camera Angle Slider
  document.getElementById('angleSlide').addEventListener('mousemove', function() {g_globalAngle = this.value; renderAllShapes(); });

}

function main() {

  setupWebGL();
  connectVariablesToGLSL();
  addActionsForHtmlUI();

  // Mouse Rotation Handler
  canvas.onmousedown = function(ev){
    g_isDragging = true; 
    g_lastX = ev.clientX;
    g_lastY = ev.clientY;
    click(ev, gl, canvas, a_Position, u_FragColor); 
  };
  canvas.onmouseup = function(){g_isDragging = false; };
  canvas.onmousemove = function(ev){if (g_isDragging) {mouseRotation(ev);} };

  // Poke Animation
  canvas.addEventListener('click', function(ev){if (ev.shiftKey) {pokeAnimation();}} );

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  requestAnimationFrame(tick);

}

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0-g_startTime;

function tick() {
  // save current time
  g_seconds = performance.now()/1000.0-g_startTime;
  
  // update animation angles
  updateAnimationAngles();

  // draw everything
  renderAllShapes();

  // update browser
  requestAnimationFrame(tick);
}

function updateAnimationAngles() {
  if (g_headAnimation) {
    g_headAngle = (10*Math.sin(g_seconds));
  }
  if (g_FLLAnimation) {
    g_FLLAngle = (20+25*Math.sin(g_seconds));
  }
  if (g_FRLAnimation) {
    g_FRLAngle = (20+25*Math.sin(g_seconds));
  }
  if (g_BLLAnimation) {
    g_BLLAngle = (25+25*Math.sin(g_seconds));
  }
  if (g_BRLAnimation) {
    g_BRLAngle = (25+25*Math.sin(g_seconds));
  }
  if (g_tailAnimation) {
    g_tailAngle = (10+20*Math.sin(g_seconds));
  }
}

function toggleAnimation(bool){
  g_headAnimation=bool;
  g_FLLAnimation=bool;
  g_FRLAnimation=bool;
  g_BLLAnimation=bool;
  g_BRLAnimation=bool;
  g_tailAnimation=bool;
}

function pokeAnimation() {
  toggleAnimation(false);
  g_globalAngle = 45;
  g_headAngle = -25;
  g_FLLAngle = 75;
  g_FRLAngle = 75;
  g_BLLAngle = 70;
  g_BRLAngle = 70;
  g_tailAngle = -30;
}

var g_shapesList = [];

function click(ev, gl, canvas, a_Position, u_FragColor) {

  // Extract the event click and return it in WebGL coordinates
  [x,y] = convertCoordinatesEventToGL(ev);

  let point;
  if (g_selectedType == POINT) {
    point = new Point();
  } else if (g_selectedType == TRIANGLE){
    point = new Triangle();
  } else if (g_selectedType == CIRCLE){
    point = new Circle();
  } else {
    point = new Paintbrush();
  }
  point.position=[x,y];
  point.color=g_selectedColor.slice();
  point.size=g_selectedSize;
  if (g_selectedType == CIRCLE){
    point.segments=g_selectedSegments;
  }
  if (g_selectedType == PAINTBRUSH){
    point.size=g_selectedSize+10;
  }
  g_shapesList.push(point);

  // Draw every shape that is supposed to be in the canvas
  renderAllShapes();

}

function convertCoordinatesEventToGL(ev){
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return([x,y]);

}

function renderAllShapes(){

  // Check time at the start of this function
  var startTime = performance.now();

  // Pass matrix to u_ModelMatrix attribute
  //var globalRotMat=new Matrix4().rotate(g_globalAngle, 0, 1, 0);
  var globalRotMat = new Matrix4().rotate(g_mouseX, 1, 0, 0).rotate(g_mouseY + g_globalAngle, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Cone
  var cone = new Cone();
  cone.matrix.translate(0.5, -0.72, 0);
  cone.matrix.scale(0.25, 0.5, 0.25);
  cone.render();

  // Head
  var head1 = new Cube();
  head1.color = [0.95, 0.78, 0.75, 1.0];
  head1.matrix.translate(-.245, 0.03, -0.23);
  head1.matrix.rotate(180, 1, 0, 0);
  head1.matrix.rotate(g_headAngle, 1, 0, 0);
  //head1.matrix.rotate(10*Math.sin(g_seconds), 1, 0, 0);
  var head_CoordMat = new Matrix4(head1.matrix);
  head1.matrix.scale(0.4, 0.4, 0.3);
  head1.render();

  var head2 = new Cube();
  head2.color = [0.95, 0.78, 0.75, 1.0];
  head2.matrix = head_CoordMat;
  head2.matrix.translate(0.025, 0.02, 0.26);
  var head2_CoordMat = new Matrix4(head2.matrix);
  head2.matrix.rotate(-15, 1, 0, 0);
  head2.matrix.scale(0.34, 0.34, 0.2);
  head2.render();

  var head3 = new Cube();
  head3.color = [0.95, 0.78, 0.75, 1.0];
  head3.matrix = new Matrix4(head2_CoordMat);
  head3.matrix.translate(0, 0.05, 0.11);
  head3.matrix.scale(0.34, 0.33, 0.1);
  head3.render();

  var head4 = new Cube();
  head4.color = [0.95, 0.78, 0.75, 1.0];
  head4.matrix = new Matrix4(head_CoordMat);
  head4.matrix.translate(0.11, 0.32, 1.05);
  head4.matrix.scale(0.8, 0.6, 0.8);
  head4.render();


  // Ears
  var leftEar = new Cube();
  leftEar.color = [0.9, 0.73, 0.7, 1.0];
  leftEar.matrix = new Matrix4(head_CoordMat);
  leftEar.matrix.translate(0.95, 0.14, 0.4);
  leftEar.matrix.rotate(-30, 0, 0, 1);
  leftEar.matrix.scale(0.4, 0.1, 0.4);
  leftEar.render();

  var rightEar = new Cube();
  rightEar.color = [0.9, 0.73, 0.7, 1.0];
  rightEar.matrix = new Matrix4(head_CoordMat);
  rightEar.matrix.scale(-1, 1, 1);
  rightEar.matrix.translate(-0.05, 0.14, 0.4);
  rightEar.matrix.rotate(-30, 0, 0, 1);
  rightEar.matrix.scale(0.4, 0.1, 0.4);
  rightEar.render();

  // Eyes
  var leftEye = new Cube();
  leftEye.color = [0.3, 0.3, 0.3, 1.0];
  leftEye.matrix = new Matrix4(head3.matrix);
  leftEye.matrix.translate(0.83, 0.22, 0.8);
  leftEye.matrix.scale(0.15, 0.16, 0.4);
  leftEye.render();

  var rightEye = new Cube();
  rightEye.color = [0.3, 0.3, 0.3, 1.0];
  rightEye.matrix = new Matrix4(head3.matrix);
  rightEye.matrix.translate(0.03, 0.22, 0.8);
  rightEye.matrix.scale(0.15, 0.16, 0.4);
  rightEye.render();

  // Snout
  var snout = new Cube();
  snout.color = [0.93, 0.68, 0.66, 1.0];
  snout.matrix = new Matrix4(head4.matrix);
  snout.matrix.translate(0.15, 0.05, 0.85);
  snout.matrix.scale(0.7, 0.7, 0.3);
  snout.render();

  var leftNostril = new Cube();
  leftNostril.color = [0.58, 0.33, 0.31, 1.0];
  leftNostril.matrix = new Matrix4(head4.matrix);
  leftNostril.matrix.translate(0.65, 0.15, 0.9);
  leftNostril.matrix.scale(0.12, 0.37, 0.3);
  leftNostril.render();

  var rightNostril = new Cube();
  rightNostril.color = [0.58, 0.33, 0.31, 1.0];
  rightNostril.matrix = new Matrix4(head4.matrix);
  rightNostril.matrix.translate(0.24, 0.15, 0.9);
  rightNostril.matrix.scale(0.12, 0.37, 0.3);
  rightNostril.render();

  // Draw body cube
  var body1 = new Cube();
  body1.color = [0.95, 0.78, 0.75, 1.0];
  body1.matrix.translate(-.3, -.43, -0.4);
  body1.matrix.scale(0.5, 0.5, 0.2);
  body1.render();

  var body2 = new Cube();
  body2.color = [0.95, 0.78, 0.75, 1.0];
  body2.matrix.translate(-.35, -.48, -0.2);
  body2.matrix.scale(0.6, 0.6, 0.2);
  body2.render();

  var body3 = new Cube();
  body3.color = [0.95, 0.78, 0.75, 1.0];
  body3.matrix.translate(-.37, -.5, 0);
  body3.matrix.scale(0.65, 0.65, 0.5);
  body3.render();

  var body4 = new Cube();
  body4.color = [0.95, 0.78, 0.75, 1.0];
  body4.matrix.translate(-.325, -.45, 0.5);
  body4.matrix.scale(0.55, 0.55, 0.2);
  body4.render();

  var body5 = new Cube();
  body5.color = [0.95, 0.78, 0.75, 1.0];
  body5.matrix.translate(-.275, -.4, 0.65);
  body5.matrix.scale(0.45, 0.45, 0.1);
  body5.render();

  var body6 = new Cube();
  body6.color = [0.95, 0.78, 0.75, 1.0];
  body6.matrix.translate(-.275, -.35, 0.75);
  body6.matrix.scale(0.35, 0.35, 0.05);
  body6.render();

  // Draw a front left Leg
  var frontLeftLeg1 = new Cube();
  frontLeftLeg1.color = [0.95, 0.78, 0.75, 1.0];
  frontLeftLeg1.matrix.setTranslate(0.1, -0.37, -0.22);
  frontLeftLeg1.matrix.rotate(160, 1, 0, 0);
  frontLeftLeg1.matrix.rotate(g_FLLAngle, 1, 0, 0);
  //frontLeftLeg1.matrix.rotate(20+25*Math.sin(g_seconds), 1, 0, 0);
  var FLL_CoordMat = new Matrix4(frontLeftLeg1.matrix);
  frontLeftLeg1.matrix.scale(0.15, .15, .15);
  frontLeftLeg1.render();

  var frontLeftLeg2 = new Cube();
  frontLeftLeg2.color = [0.95, 0.78, 0.75, 1.0];
  frontLeftLeg2.matrix = FLL_CoordMat;
  frontLeftLeg2.matrix.translate(0, 0.13, 0.01);
  frontLeftLeg2.matrix.rotate(20, 1, 0, 0);
  frontLeftLeg2.matrix.scale(0.13, .13, .13);
  frontLeftLeg2.render();

  var frontLeftLeg3 = new Cube();
  frontLeftLeg3.color = [0.95, 0.78, 0.75, 1.0];
  frontLeftLeg3.matrix = new Matrix4(frontLeftLeg2.matrix);
  frontLeftLeg3.matrix.translate(0.05, 0.85, 0.02);
  frontLeftLeg3.matrix.scale(0.9, .9, .9);
  frontLeftLeg3.render();

  // Draw a front right Leg
  var frontRightLeg1 = new Cube();
  frontRightLeg1.color = [0.95, 0.78, 0.75, 1.0];
  frontRightLeg1.matrix.setTranslate(-0.34, -0.37, -0.22);
  frontRightLeg1.matrix.rotate(160, 1, 0, 0);
  frontRightLeg1.matrix.rotate(g_FRLAngle, 1, 0, 0);
  //frontRightLeg1.matrix.rotate(20+25*Math.sin(g_seconds), 1, 0, 0);
  var FRL_CoordMat = new Matrix4(frontRightLeg1.matrix);
  frontRightLeg1.matrix.scale(0.15, .15, .15);
  frontRightLeg1.render();

  var frontRightLeg2 = new Cube();
  frontRightLeg2.color = [0.95, 0.78, 0.75, 1.0];
  frontRightLeg2.matrix = FRL_CoordMat;
  frontRightLeg2.matrix.translate(0.02, 0.13, 0.01);
  frontRightLeg2.matrix.rotate(20, 1, 0, 0);
  frontRightLeg2.matrix.scale(0.13, .13, .13);
  frontRightLeg2.render();

  var frontRightLeg3 = new Cube();
  frontRightLeg3.color = [0.95, 0.78, 0.75, 1.0];
  frontRightLeg3.matrix = new Matrix4(frontRightLeg2.matrix);
  frontRightLeg3.matrix.translate(0.05, 0.85, 0.02);
  frontRightLeg3.matrix.scale(0.9, .9, .9);
  frontRightLeg3.render();

  // Draw a back left Leg
  var backLeftLeg1 = new Cube();
  backLeftLeg1.color = [0.95, 0.78, 0.75, 1.0];
  backLeftLeg1.matrix.setTranslate(0.06, -0.3, 0.57);
  backLeftLeg1.matrix.rotate(115, 1, 0, 0);
  backLeftLeg1.matrix.rotate(-g_BLLAngle, 1, 0, 0);
  //backLeftLeg1.matrix.rotate(-25-30*Math.sin(g_seconds), 1, 0, 0);
  var BLL_CoordMat = new Matrix4(backLeftLeg1.matrix);
  backLeftLeg1.matrix.scale(0.2, .2, .2);
  backLeftLeg1.render();

  var backLeftLeg2 = new Cube();
  backLeftLeg2.color = [0.95, 0.78, 0.75, 1.0];
  backLeftLeg2.matrix = BLL_CoordMat;
  backLeftLeg2.matrix.translate(0.03, 0.1, 0.3);
  backLeftLeg2.matrix.rotate(-115, 1, 0, 0);
  backLeftLeg2.matrix.scale(0.15, .13, .13);
  backLeftLeg2.render();

  var backLeftLeg3 = new Cube();
  backLeftLeg3.color = [0.95, 0.78, 0.75, 1.0];
  backLeftLeg3.matrix = new Matrix4(backLeftLeg2.matrix);
  backLeftLeg3.matrix.translate(0.1, -0.8, 0.05);
  backLeftLeg3.matrix.scale(0.9, 0.9, 0.9);
  backLeftLeg3.render();

  // Draw a back right Leg
  var backRightLeg1 = new Cube();
  backRightLeg1.color = [0.95, 0.78, 0.75, 1.0];
  backRightLeg1.matrix.setTranslate(-0.35, -0.3, 0.57);
  backRightLeg1.matrix.rotate(115, 1, 0, 0);
  backRightLeg1.matrix.rotate(-g_BRLAngle, 1, 0, 0);
  //backRightLeg1.matrix.rotate(-25-30*Math.sin(g_seconds), 1, 0, 0);
  var BRL_CoordMat = new Matrix4(backRightLeg1.matrix);
  backRightLeg1.matrix.scale(0.2, .2, .2);
  backRightLeg1.render();

  var backRightLeg2 = new Cube();
  backRightLeg2.color = [0.95, 0.78, 0.75, 1.0];
  backRightLeg2.matrix = BRL_CoordMat;
  backRightLeg2.matrix.translate(0.03, 0.1, 0.3);
  backRightLeg2.matrix.rotate(-115, 1, 0, 0);
  backRightLeg2.matrix.scale(0.15, .13, .13);
  backRightLeg2.render();

  var backRightLeg3 = new Cube();
  backRightLeg3.color = [0.95, 0.78, 0.75, 1.0];
  backRightLeg3.matrix = new Matrix4(backRightLeg2.matrix);
  backRightLeg3.matrix.translate(0.1, -0.8, 0.05);
  backRightLeg3.matrix.scale(0.9, 0.9, 0.9);
  backRightLeg3.render();

  // Tail
  var tail1 = new Cube();
  tail1.color = [0.9, 0.73, 0.7, 1.0];
  tail1.matrix.translate(-0.14, -0.13, 0.72);
  tail1.matrix.rotate(-35, 1, 0, 0);
  tail1.matrix.rotate(g_tailAngle, 1, 0, 0);
  //tail1.matrix.rotate(10+20*Math.sin(g_seconds), 1, 0, 0);
  var tail_CoordMat = new Matrix4(tail1.matrix);
  tail1.matrix.scale(0.05, 0.05, 0.25);
  tail1.render();

  var tail2 = new Cube();
  tail2.color = [0.9, 0.73, 0.7, 1.0];
  tail2.matrix = tail_CoordMat;
  tail2.matrix.translate(0.01, 0.11, 0.21);
  var tail2_CoordMat = new Matrix4(tail2.matrix);
  tail2.matrix.rotate(90, 1, 0, 0);
  tail2.matrix.scale(0.04, 0.04, 0.07);
  tail2.render();

  var tail3 = new Cube();
  tail3.color = [0.9, 0.73, 0.7, 1.0];
  tail3.matrix = new Matrix4(tail2_CoordMat);
  tail3.matrix.translate(0.01, 0.03, 0.045);
  tail3.matrix.rotate(-180, 1, 0, 0);
  tail3.matrix.scale(0.03, 0.04, 0.07);
  tail3.render();


  // Check time at the end of this function, show on web page
  var duration = performance.now() - startTime;
  sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10, "numdot");

}

function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}