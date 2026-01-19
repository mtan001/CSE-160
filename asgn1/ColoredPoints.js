// ColoredPoint.js (c) 2012 matsuda

document.getElementById("redSlide").value = "0";
document.getElementById("greenSlide").value = "0";
document.getElementById("blueSlide").value = "0";
document.getElementById("sizeSlide").value = "5";
document.getElementById("segmentSlide").value = "4";

// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
    gl_Position = a_Position;
    gl_PointSize = u_Size;
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

function setupWebGL(){
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

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

  // Get the storage location of u_Size
  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get the storage location of u_Size');
    return;
  }

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
let g_selectedSegments=4;

function drawPicture() {
  // body
  gl.uniform4f(u_FragColor, 1.0, 1.0, 1.0, 1.0);
  drawTriangle([0.35, -0.05,   0.45, 0.15,   -0.15, 0], [1, 0, 0, 1]);
  drawTriangle([0.65, -0.05,   0.7, 0.25,   0.15, -0.2]);
  drawTriangle([0.1, -0.2,   0.6, 0.04,   -0.1, 0.1]);
  drawTriangle([0, 0,   -0.6, -0.3,   -0.5, -0.05]);
  drawTriangle([0, 0,   -0.1, 0.1,   -0.4, 0]);
  drawTriangle([0, 0,   -0.4, 0,   -0.6, -0.3]);
  drawTriangle([0, 0,   -0.6, -0.3,   -0.45, -0.5]);
  drawTriangle([0, 0,   -0.45, -0.5,   -0.2, -0.55]);
  drawTriangle([0, 0,   -0.2, -0.55,   -0, -0.55]);
  drawTriangle([0, 0,   -0, -0.55,   0.3, -0.45]);
  drawTriangle([0, 0,   0.3, -0.45,   0.7, -0.05]);
  // head
  drawTriangle([-0.6, 0.2,   -0.4, -0.2,   -0.25, 0.2]);
  drawTriangle([-0.25, 0.2,   -0.5, -0.1,   -0.1, 0.1]);
  drawTriangle([-0.3, 0.4,   -0.5, 0.2,   -0.25, 0.2]);
  drawTriangle([-0.3, 0.4,   -0.5, 0.2,   -0.1, 0.1]);
  drawTriangle([-0.5, 0.45,   -0.5, 0.2,   -0.3, 0.4]);
  drawTriangle([-0.7, 0.35,   -0.5, 0.2,   -0.5, 0.45]);
  drawTriangle([-0.7, 0.15,   -0.5, 0.2,   -0.7, 0.35]);
  drawTriangle([-0.6, 0.05,   -0.5, 0.2,   -0.7, 0.15]);
  drawTriangle([-0.5, 0.03,   -0.5, 0.2,   -0.6, 0.05]);
  drawTriangle([-0.5, 0.03,   -0.3, 0.1,   -0.5, -0.3]);
  // face
  gl.uniform4f(u_FragColor, 1.0, 0.5, 0.0, 1.0);
  drawTriangle([-0.7, 0.15,   -0.5, 0.1,   -0.8, -0.1]);
  drawTriangle([-0.8, -0.1,   -0.5, 0.1,   -0.7, -0.15]);
  drawTriangle([-0.8, -0.1,   -0.5, 0.1,   -0.51, 0.04]);
  gl.uniform4f(u_FragColor, 0.0, 0.0, 0.0, 1.0);
  drawTriangle([-0.5, 0.2,   -0.43, 0.3,   -0.4, 0.23]);
  // initials
  gl.uniform4f(u_FragColor, 0.0, 0.0, 0.0, 0.1);
  drawTriangle([-0.1, -0.15,   -0.1, -0.2,   0.1, -0.4]);
  drawTriangle([-0.1, -0.15,   -0.1, -0.2,   0.1, -0.2]);
  drawTriangle([0.1, -0.05,   0.1, -0.15,   0.07, -0.2]);
  drawTriangle([0.1, -0.05,   0.1, -0.1,   0.3, -0.3]);
  drawTriangle([0.2, -0.05,   0.2, -0.1,   0.4, 0.1]);
  drawTriangle([0.3, 0.05,   0.3, 0,   0.45, -0.2]);

}

function addActionsForHtmlUI(){
  // Draw a picture! Button
  document.getElementById('picture').onclick = function() {
    drawPicture();
    const reference_img = document.getElementById('reference');
    reference_img.src = 'duck.jpg';
    reference_img.style.display = 'block';
  };

  // Color Buttons
  document.getElementById('green').onclick = function() {g_selectedColor = [0.0,1.0,0.0,1.0]; };
  document.getElementById('red').onclick = function() {g_selectedColor = [1.0,0.0,0.0,1.0]; };
  document.getElementById('clearButton').onclick = function() {
    g_shapesList = []; 
    renderAllShapes();
    const reference_img = document.getElementById('reference');
    reference_img.style.display = 'none';
  };

  document.getElementById('pointButton').onclick = function() {g_selectedType=POINT};
  document.getElementById('triButton').onclick = function() {g_selectedType=TRIANGLE};
  document.getElementById('circleButton').onclick = function() {g_selectedType=CIRCLE};
  document.getElementById('paintButton').onclick = function() {g_selectedType=PAINTBRUSH};

  // Color Sliders
  document.getElementById('redSlide').addEventListener('mouseup', function() {g_selectedColor[0] = this.value/100; });
  document.getElementById('greenSlide').addEventListener('mouseup', function() {g_selectedColor[1] = this.value/100; });
  document.getElementById('blueSlide').addEventListener('mouseup', function() {g_selectedColor[2] = this.value/100; });

  // Size Slider
  document.getElementById('sizeSlide').addEventListener('mouseup', function() {g_selectedSize = this.value; });

  // Circle Segments Slider
  document.getElementById('segmentSlide').addEventListener('mouseup', function() {g_selectedSegments = this.value; });

}

function main() {

  setupWebGL();
  connectVariablesToGLSL();
  addActionsForHtmlUI();

  canvas.onmousedown = click;
  //canvas.onmousemove = click;
  canvas.onmousemove = function(ev) { if(ev.buttons == 1) {click(ev) }};

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = function(ev){ click(ev, gl, canvas, a_Position, u_FragColor) };

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

}

var g_shapesList = [];

/*
var g_points = [];  // The array for the position of a mouse press
var g_colors = [];  // The array to store the color of a point
var g_sizes =  [];  // The array to store the size of a point
*/

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

  /*
  // Store the coordinates to g_points array
  g_points.push([x, y]);

  // Store the coordinates to g_points array
  g_colors.push(g_selectedColor.slice());

  // Store the size
  g_sizes.push(g_selectedSize);

  
  if (x >= 0.0 && y >= 0.0) {      // First quadrant
    g_colors.push([1.0, 0.0, 0.0, 1.0]);  // Red
  } else if (x < 0.0 && y < 0.0) { // Third quadrant
    g_colors.push([0.0, 1.0, 0.0, 1.0]);  // Green
  } else {                         // Others
    g_colors.push([1.0, 1.0, 1.0, 1.0]);  // White
  }
  */

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

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  //var len = g_points.length;
  var len = g_shapesList.length;

  for(var i = 0; i < len; i++) {
    g_shapesList[i].render();
  }

  // Check time at the end of this function, show on web page
  var duration = performance.now() - startTime;
  sendTextToHTML("numdot: " + len + " ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10, "numdot");

}

function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}