
document.getElementById("headSlide").value = "0";
document.getElementById("frontLeftLegSlide").value = "20";
document.getElementById("frontRightLegSlide").value = "20";
document.getElementById("backLeftLegSlide").value = "25";
document.getElementById("backRightLegSlide").value = "25";
document.getElementById("tailSlide").value = "10";

// Vertex shader program
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  attribute vec3 a_Normal;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  varying vec4 v_VertPos;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_NormalMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
    //v_Normal = a_Normal;
    v_Normal = normalize(vec3(u_NormalMatrix * vec4(a_Normal, 1)));
    v_VertPos = u_ModelMatrix * a_Position;
  }
  `

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform sampler2D u_Sampler3;
  uniform int u_whichTexture;
  uniform vec3 u_lightPos;
  uniform vec3 u_spotlightPos;
  uniform vec3 u_spotlightDir;
  uniform float u_spotlightRange;
  uniform vec3 u_lightColor;
  uniform vec3 u_spotlightColor;
  uniform vec3 u_cameraPos;
  varying vec4 v_VertPos;
  uniform bool u_lightOn;
  uniform bool u_spotlightOn;
  void main() {
    if (u_whichTexture == -3) {
      gl_FragColor = vec4((v_Normal+1.0)/2.0, 1.0);
    } else if (u_whichTexture == -2){
      gl_FragColor = u_FragColor;
    } else if (u_whichTexture == -1) {
      gl_FragColor = vec4(v_UV,1.0,1.0);
    } else if (u_whichTexture == 0) {
      gl_FragColor = texture2D(u_Sampler0, v_UV);
    } else if (u_whichTexture == 1) {
      gl_FragColor = texture2D(u_Sampler1, v_UV);
    } else if (u_whichTexture == 2) {
      gl_FragColor = texture2D(u_Sampler2, v_UV);
    } else if (u_whichTexture == 3) {
      gl_FragColor = texture2D(u_Sampler3, v_UV);
    } else {
      gl_FragColor = vec4(1,.2,.2,1);
    }

    // Point Light
    vec3 lightVector = u_lightPos-vec3(v_VertPos);
    float r=length(lightVector);

    // Red/Green Distance Visualization
    //if(r < 1.0) {
    //  gl_FragColor = vec4(1,0,0,1);
    //} else if (r < 2.0) {
    //  gl_FragColor = vec4(0,1,0,1);
    //}

    //gl_FragColor = vec4(vec3(gl_FragColor)/(r*r),1);

    // N dot L
    vec3 L = normalize(lightVector);
    vec3 N = normalize(v_Normal);
    float nDotL = max(dot(N, L), 0.0);

    // Reflection
    vec3 R = reflect(-L, N);

    // eye
    vec3 E = normalize(u_cameraPos-vec3(v_VertPos));

    // specular
    float specular = pow(max(dot(E, R), 0.0), 64.0) * 0.8;

    vec3 diffuse = vec3(gl_FragColor) * nDotL * 0.9;
    vec3 ambient = vec3(gl_FragColor) * 0.3;

    //vec3 finalLight = vec3(0.0);

    if (u_lightOn) {
      if (u_whichTexture == 1) {
        gl_FragColor = vec4(diffuse+ambient, 1.0);
        //finalLight += vec4(diffuse+ambient, 1.0);
      } else {
        gl_FragColor = vec4(u_lightColor * (specular+diffuse+ambient), 1.0);
        //finalLight += vec4(u_lightColor * (specular+diffuse+ambient), 1.0);
      }
    }


    // Spotlight
    vec3 spotlightVec = u_spotlightPos - vec3(v_VertPos);
    vec3 spotlightL = normalize(spotlightVec);

    float theta = dot(normalize(-spotlightL), normalize(u_spotlightDir));

    float spotlightIntensity = 0.0;

    if (theta > u_spotlightRange) {
      spotlightIntensity = pow(theta, 10.0);
    }

    float spotlightNDotL = max(dot(N, spotlightL), 0.0);
    vec3 spotlightDiffuse = vec3(gl_FragColor) * spotlightNDotL * 0.7;

    vec3 spotlightR = reflect(-spotlightL, N);

    float spotlightSpecular = pow(max(dot(E, spotlightR), 0.0), 64.0) * 0.8;
    /*float spotlightSpecular = 0.0;
    if (spotlightNDotL > 0.0 && theta > u_spotlightRange) {
      spotlightSpecular =
          pow(max(dot(E, spotlightR), 0.0), 64.0)
          * 0.8
          * spotlightIntensity;
    }*/

    vec3 spotlightAmbient = vec3(gl_FragColor) * 0.3;
    vec3 spotColor = (spotlightDiffuse + spotlightSpecular) * spotlightIntensity;
    //vec3 spotColor = spotlightDiffuse + vec3(spotlightSpecular);

    /*if (u_lightOn) {
      if (u_whichTexture == 1) {
        gl_FragColor = vec4(spotlightDiffuse+spotlightAmbient, 1.0);
        //finalLight += vec4(spotlightDiffuse+spotlightAmbient, 1.0);
      } else {
        //gl_FragColor = vec4(u_spotlightColor * (spotlightSpecular+spotlightDiffuse+spotlightAmbient+spotColor), 1.0);
        gl_FragColor = vec4(u_spotlightColor * (spotlightDiffuse + spotlightAmbient + vec3(spotlightSpecular)), 1.0);
        //finalLight += vec4(u_spotlightColor * (spotlightSpecular+spotlightDiffuse+spotlightAmbient+spotColor), 1.0);
      }
    }*/
    if (u_spotlightOn)
      gl_FragColor = vec4(u_spotlightColor * (spotlightDiffuse + spotlightAmbient + spotColor), 1.0);

  }
  `

// Global Variables
let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_NormalMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_cameraPos;
let u_lightColor;
let u_spotlightColor;

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

  // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of a_UV
  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
    return;
  }

  // Get the storage location of a_Normal
  a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  if (a_Normal < 0) {
    console.log('Failed to get the storage location of a_Normal');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_lightPos
  u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
  if (!u_lightPos) {
    console.log('Failed to get the storage location of u_lightPos');
    return;
  }

  // Get the storage location of u_lightColor
  u_lightColor = gl.getUniformLocation(gl.program, 'u_lightColor');
  if (!u_lightColor) {
    console.log('Failed to get the storage location of u_lightColor');
    return;
  }

  // Get the storage location of u_spotlightPos
  u_spotlightPos = gl.getUniformLocation(gl.program, 'u_spotlightPos');
  if (!u_spotlightPos) {
    console.log('Failed to get the storage location of u_spotlightPos');
    return;
  }

  // Get the storage location of u_spotlightDir
  u_spotlightDir = gl.getUniformLocation(gl.program, 'u_spotlightDir');
  if (!u_spotlightDir) {
    console.log('Failed to get the storage location of u_spotlightDir');
    return;
  }

  // Get the storage location of u_spotlightRange
  u_spotlightRange = gl.getUniformLocation(gl.program, 'u_spotlightRange');
  if (!u_spotlightRange) {
    console.log('Failed to get the storage location of u_spotlightRange');
    return;
  }

  // Get the storage location of u_spotlightColor
  u_spotlightColor = gl.getUniformLocation(gl.program, 'u_spotlightColor');
  if (!u_spotlightColor) {
    console.log('Failed to get the storage location of u_spotlightColor');
    return;
  }

  // Get the storage location of u_cameraPos
  u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
  if (!u_cameraPos) {
    console.log('Failed to get the storage location of u_cameraPos');
    return;
  }

  // Get the storage location of u_lightOn
  u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
  if (!u_lightOn) {
    console.log('Failed to get the storage location of u_lightOn');
    return;
  }
  // Get the storage location of u_spotlightOn
  u_spotlightOn = gl.getUniformLocation(gl.program, 'u_spotlightOn');
  if (!u_spotlightOn) {
    console.log('Failed to get the storage location of u_spotlightOn');
    return;
  }

  // Get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if(!u_ModelMatrix){
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  // Get the storage location of u_NormalMatrix
  u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  if(!u_NormalMatrix){
    console.log('Failed to get the storage location of u_NormalMatrix');
    return;
  }

  // Get the storage location of u_GlobalRotateMatrix
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if(!u_GlobalRotateMatrix){
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  // Get the storage location of u_ProjectionMatrix
  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if(!u_ProjectionMatrix){
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }

  // Get the storage location of u_ViewMatrix
  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if(!u_ViewMatrix){
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }

  // Get the storage location of u_Sampler0
  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if (!u_Sampler0) {
    console.log('Failed to get the storage location of u_Sampler0');
    return false;
  }

  // Get the storage location of u_Sampler1
  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if (!u_Sampler1) {
    console.log('Failed to get the storage location of u_Sampler1');
    return false;
  }

  // Get the storage location of u_Sampler2
  u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
  if (!u_Sampler2) {
    console.log('Failed to get the storage location of u_Sampler2');
    return false;
  }

  // Get the storage location of u_Sampler3
  u_Sampler3 = gl.getUniformLocation(gl.program, 'u_Sampler3');
  if (!u_Sampler3) {
    console.log('Failed to get the storage location of u_Sampler3');
    return false;
  }

  // Get the storage location of u_whichTexture
  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture) {
    console.log('Failed to get the storage location of u_whichTexture');
    return false;
  }

  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
  gl.uniformMatrix4fv(u_ViewMatrix, false, identityM.elements);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, identityM.elements);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, identityM.elements);

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
// Global lighting
let g_normalOn = false;
let g_lightPos = [0,1,2];
let g_lightOn = true;
let g_spotlightOn = true;
let g_lightColor = [1.0, 1.0, 1.0];
let g_spotlightPos = [2,1,2];
let g_spotlightColor = [1.0, 1.0, 1.0];
let g_spotlightRange = 1;


function addActionsForHtmlUI(){
  // Play Game Button
  document.getElementById('playGameButton').onclick = function() {startGame() };
  // Normals Buttons
  document.getElementById('normalOnButton').onclick = function() {g_normalOn=true };
  document.getElementById('normalOffButton').onclick = function() {g_normalOn=false };
  // Lighting Buttons
  document.getElementById('lightOnButton').onclick = function() {g_lightOn=true };
  document.getElementById('lightOffButton').onclick = function() {g_lightOn=false };
  document.getElementById('spotlightOnButton').onclick = function() {g_spotlightOn=true };
  document.getElementById('spotlightOffButton').onclick = function() {g_spotlightOn=false };
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

  // Point Light Sliders
  document.getElementById('lightColorRSlide').addEventListener('mousemove', function() {g_lightColor[0] = this.value/100; });
  document.getElementById('lightColorGSlide').addEventListener('mousemove', function() {g_lightColor[1] = this.value/100; });
  document.getElementById('lightColorBSlide').addEventListener('mousemove', function() {g_lightColor[2] = this.value/100; });
  document.getElementById('lightXSlide').addEventListener('mousemove', function() {g_lightPos[0] = this.value; });
  document.getElementById('lightYSlide').addEventListener('mousemove', function() {g_lightPos[1] = this.value; });
  document.getElementById('lightZSlide').addEventListener('mousemove', function() {g_lightPos[2] = this.value; });

  // Spotight Sliders
  document.getElementById('spotlightColorRSlide').addEventListener('mousemove', function() {g_spotlightColor[0] = this.value/100; });
  document.getElementById('spotlightColorGSlide').addEventListener('mousemove', function() {g_spotlightColor[1] = this.value/100; });
  document.getElementById('spotlightColorBSlide').addEventListener('mousemove', function() {g_spotlightColor[2] = this.value/100; });
  document.getElementById('spotlightXSlide').addEventListener('mousemove', function() {g_spotlightPos[0] = this.value; });
  document.getElementById('spotlightYSlide').addEventListener('mousemove', function() {g_spotlightPos[1] = this.value; });
  document.getElementById('spotlightZSlide').addEventListener('mousemove', function() {g_spotlightPos[2] = this.value; });
  document.getElementById('spotlightRangeSlide').addEventListener('mousemove', function() {g_spotlightRange = this.value; });

}

function initTextures() {
  var sky = new Image();
  if (!sky) {
    console.log('Failed to create the image object');
    return false;
  }
  sky.onload = function(){ sendTextureToGLSL(sky, 0); };
  sky.src = 'sky.jpg';

  var blue_sky = new Image();
  if (!blue_sky) {
    console.log('Failed to create the image object');
    return false;
  }
  blue_sky.onload = function(){ sendTextureToGLSL(blue_sky, 1); };
  blue_sky.src = 'blue_sky.jpg';

  var dirt = new Image();
  if (!dirt) {
    console.log('Failed to create the image object');
    return false;
  }
  dirt.onload = function(){ sendTextureToGLSL(dirt, 2); };
  dirt.src = 'dirt.jpg';

  var grass = new Image();
  if (!grass) {
    console.log('Failed to create the image object');
    return false;
  }
  grass.onload = function(){ sendTextureToGLSL(grass, 3); };
  grass.src = 'grass.jpg';
  
  return true;
}

function sendTextureToGLSL(image, textureNum){
  var texture = gl.createTexture();
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE0 + textureNum);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  if (textureNum === 0) gl.uniform1i(u_Sampler0, 0);
  if (textureNum === 1) gl.uniform1i(u_Sampler1, 1);
  if (textureNum === 2) gl.uniform1i(u_Sampler2, 2);
  if (textureNum === 3) gl.uniform1i(u_Sampler3, 3);
  console.log('finished loadTexture' + textureNum);
}

var teapot;

function main() {

  setupWebGL();
  connectVariablesToGLSL();
  addActionsForHtmlUI();

  teapot = new Model(gl, "teapot.obj"); 
  teapot.color = [0.0, 0.0, 1.0, 1.0]; 
  if (g_normalOn) teapot.textureNum = -3;
  else teapot.textureNum = -2;
  teapot.matrix.setScale(0.3, 0.3, 0.3); 
  teapot.matrix.translate(-4, -2, 0);
  teapot.matrix.rotate(240, 0, 1, 0); 

  // Mouse Rotation Handler
  canvas.onmousedown = function(ev){
    g_isDragging = true; 
    g_lastX = ev.clientX;
    g_lastY = ev.clientY;
  };
  
  window.onmouseup = function(){g_isDragging = false; };
  canvas.onmousemove = function(ev){if (g_isDragging) {g_camera.onMouseMove(ev.clientX, ev.clientY);} else return;};
  canvas.onmouseleave = function(){g_isDragging = false; };


  // Poke Animation
  //canvas.addEventListener('click', function(ev){if (ev.shiftKey) {pokeAnimation();}} );

  document.onkeydown = keydown;
  initTextures(gl, 0);
  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  requestAnimationFrame(tick);

}

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0-g_startTime;
let g_timeLimit = 25;
let g_timeLeft = g_timeLimit;
let g_timerOn = false;

function tick() {
  // save current time
  g_seconds = performance.now()/1000.0-g_startTime;

  // update game timer
  if (g_timerOn) {
    g_timeLeft = g_timeLimit - g_seconds;
    if (g_timeLeft <= 0) {
      g_timeLeft = 0;
      g_timerRunning = false;
      endGame();
    }

    document.getElementById('timerDisplay').innerText = Math.ceil(g_timeLeft);

    checkAppleCollisions();
  }
  
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

  //g_lightPos[0] = Math.cos(g_seconds);
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
  } else{
    point = new Circle();
  }
  point.position=[x,y];
  point.color=g_selectedColor.slice();
  point.size=g_selectedSize;
  if (g_selectedType == CIRCLE){
    point.segments=g_selectedSegments;
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

function keydown(ev) {
  if (ev.keyCode == 68) { // move right
    g_camera.right();
    ev.preventDefault();
  } else if (ev.keyCode == 65) { // move left
    g_camera.left();
    ev.preventDefault();
  } else if (ev.keyCode == 87) { // move forward
    g_camera.forward();
    ev.preventDefault();
  } else if (ev.keyCode == 83) { // move backward
    g_camera.back();
    ev.preventDefault();
  } else if (ev.keyCode == 81) { // rotate camera left
    g_camera.rotateLeft();
    ev.preventDefault();
  } else if (ev.keyCode == 69) { // rotate camera right
    g_camera.rotateRight();
    ev.preventDefault();
  } else if (ev.keyCode == 70) { // add/delete block
    let [x, z] = getMapCellInFront();
    if (g_map[x][z] === 0) {
        addBlock(x, z);
    }
    else {
      deleteBlock(x, z);
    }
  }

  renderAllShapes();
  console.log(ev.keyCode);
}

var g_camera = new Camera();

/*var g_map = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];*/

let g_map = Array(32).fill(0).map((_, row) => 
  Array(32).fill(0).map((_, col) => 
    (row === 0 || row === 31 || col === 0 || col === 31) ? 1 : 0
  )
);

function drawMap() {
  for (x=0;x<g_map.length;x++){
    for (z=0;z<g_map[0].length;z++){
      for(y=0;y<g_map[x][z];y++){
        var body = new Cube();
        body.color = [1.0,1.0,1.0,1.0];
        if (g_normalOn) body.textureNum = -3;
        else body.textureNum = 2;
        body.matrix.translate(0, -.75, 0);
        body.matrix.scale(1,1,1);
        body.matrix.translate(x-7, 0, z-7);
        body.normalMatrix.setInverseOf(body.matrix).transpose();
        body.renderfast();
      }
    }
  }
}

function addBlock(x, z) {
  if (x >= 0 && x < g_map.length && z >= 0 && z < g_map[0].length) {
    g_map[x][z] = 1;
    renderAllShapes();
  }
}

function deleteBlock(x, z) {
  if (x >= 0 && x < g_map.length && z >= 0 && z < g_map[0].length) {
    g_map[x][z] = 0;
    renderAllShapes();
  }
}

function getMapCellInFront() {
    // Get normalized forward direction
    let forward = new Vector3(g_camera.at.elements).sub(g_camera.eye).normalize();

    // Pick a small distance ahead
    let lookDist = 3; // how far to place the block
    let targetPos = new Vector3(g_camera.eye.elements).add(forward.mul(lookDist));

    // Convert world coordinates to map indices
    let x = Math.floor(targetPos.elements[0] + g_map.length / 2 - 9.5);
    let z = Math.floor(targetPos.elements[2] + g_map[0].length / 2 - 9);

    // Clamp to map bounds
    x = Math.max(0, Math.min(g_map.length - 1, x));
    z = Math.max(0, Math.min(g_map[0].length - 1, z));

    return [x, z];
}

// Feed the pig game
let g_apples = [];
let g_applesCollected = 0;

function randomApplePosition() {
  let x, z, valid = false;
  while (!valid) {
    x = Math.random() * 32 - 5;
    z = Math.random() * 32 - 5;
    valid = true;
    // check against existing apples
    for (let a of g_apples) {
      let ax = a.matrix.elements[12];
      let az = a.matrix.elements[14];
      let dx = ax - x;
      let dz = az - z;
      if (Math.sqrt(dx*dx + dz*dz) < 0.5) valid = false;
    }
  }
  return [x, z];
}
function spawnApples(count) {
  for (let i = 0; i < count; i++) {
    let [x, z] = randomApplePosition();
    let apple = new Cube();
    apple.matrix.setTranslate(x, -0.5, z);
    apple.matrix.scale(0.4, 0.4, 0.4);
    apple.color = [1, 0, 0, 1];
    g_apples.push(apple);

  }
}

function startGame() {
  g_apples = [];
  g_startTime = performance.now() / 1000.0
  spawnApples(20);
  g_timeLeft = g_timeLimit;
  g_timerOn = true;
  renderAllShapes();
}

function checkAppleCollisions() {
  for (let i = 0; i < g_apples.length; i++) {
    let applePos = g_apples[i].matrix.elements; 
    let appleX = applePos[12]; 
    let appleY = applePos[13]; 
    let appleZ = applePos[14]; 

    let dx = g_camera.eye.elements[0] - appleX;
    let dy = g_camera.eye.elements[1] - appleY;
    let dz = g_camera.eye.elements[2] - appleZ;

    let distance = Math.sqrt(dx*dx + dy*dy + dz*dz);

    if (distance < 2) { 
      g_apples.splice(i, 1);
      i--;

      g_applesCollected++;
      spawnApples(1);
    }
  }
}


function endGame() {
  g_apples = [];
  const msgDiv = document.getElementById("gameMessage");
  msgDiv.innerText = "Time's up! You collected " + g_applesCollected + " apples!";
}

function renderAllShapes(){

  // Check time at the start of this function
  var startTime = performance.now();

  //Pass the projection matrix
  var projMat = new Matrix4();
  projMat.setPerspective(50, canvas.width/canvas.height, .1, 100);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

  //Pass the view matrix
  var viewMat = new Matrix4();
  viewMat.setLookAt(
    g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2],
    g_camera.at.elements[0], g_camera.at.elements[1], g_camera.at.elements[2],
    g_camera.up.elements[0], g_camera.up.elements[1], g_camera.up.elements[2]
  );
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

  // Pass matrix to u_ModelMatrix attribute
  var identity = new Matrix4();
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, identity.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  drawMap();

  for (let i = 0; i < g_apples.length; i++) {
    g_apples[i].render();
  }

  // pass light position to GLSL
  gl.uniform3f(u_lightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  // pass light color to GLSL
  gl.uniform3f(u_lightColor, g_lightColor[0], g_lightColor[1], g_lightColor[2]);

  // pass spotlight pos and color to GLSL
  gl.uniform3f(u_spotlightPos, g_spotlightPos[0], g_spotlightPos[1], g_spotlightPos[2]);
  gl.uniform3f(u_spotlightDir, 0, -1, 0);
  gl.uniform1f(u_spotlightRange, Math.cos(20 * Math.PI / 180)*0.9);
  gl.uniform3f(u_spotlightColor, g_spotlightColor[0], g_spotlightColor[1], g_spotlightColor[2]);

  // pass camera position to GLSL
  gl.uniform3f(u_cameraPos, g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2]);

  gl.uniform1i(u_lightOn, g_lightOn);
  gl.uniform1i(u_spotlightOn, g_spotlightOn);

  // point light
  var light = new Cube();
  light.color = [2,2,0,1];
  light.matrix.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  light.matrix.scale(-.1,-.1,-.1);
  light.matrix.translate(-.5,-.5,-.5);
  light.render();

  // spotlight
  var spotlight = new Cube();
  spotlight.color = [2,2,0,1];
  spotlight.matrix.translate(g_spotlightPos[0], g_spotlightPos[1], g_spotlightPos[2]);
  spotlight.matrix.scale(-.1,-.1,-.1);
  spotlight.matrix.translate(-.5,-.5,-.5);
  spotlight.render();
  

  // sphere
  var sphere = new Sphere();
  sphere.matrix.translate(1.2, 0, 0.5);
  sphere.matrix.scale(0.5, 0.5, 0.5);
  if (g_normalOn) sphere.textureNum = -3;
  else sphere.textureNum = 2;
  sphere.render();

  gl.disableVertexAttribArray(0); 
  gl.disableVertexAttribArray(1); 
  gl.disableVertexAttribArray(2); 
  //console.log(teapot.isReady);
  if (teapot.isReady){
    //console.log("teapot ready");
    teapot.modelRender(gl);
  }
  gl.enableVertexAttribArray(0); 
  gl.enableVertexAttribArray(1); 
  gl.enableVertexAttribArray(2); 

  // Floor
  var floor = new Cube();
  floor.color = [1.0, 0.0, 0.0, 1.0];
  if (g_normalOn) floor.textureNum = -3;
  else floor.textureNum = 3;
  floor.matrix.translate(10, -.75, 10);
  floor.matrix.scale(32, 0, 32);
  floor.matrix.translate(-.5, 0, -0.5);
  floor.normalMatrix.setInverseOf(floor.matrix).transpose();
  floor.renderfast();

  // Sky
  var sky = new Cube();
  sky.color = [1.0, 0.0, 0.0, 1.0];
  if (g_normalOn) sky.textureNum = -3;
  else sky.textureNum = 1;
  sky.matrix.scale(-50, -50, -50);
  sky.matrix.translate(-.5, -.5, -.5);
  sky.render();

  // Head
  var head1 = new Cube();
  head1.color = [0.95, 0.78, 0.75, 1.0];
  if (g_normalOn) head1.textureNum = -3;
  else head1.textureNum = -2;
  head1.matrix.translate(-.245, 0.03, -0.23);
  head1.matrix.rotate(180, 1, 0, 0);
  head1.matrix.rotate(g_headAngle, 1, 0, 0);
  var head_CoordMat = new Matrix4(head1.matrix);
  head1.matrix.scale(0.4, 0.4, 0.3);
  head1.normalMatrix.setInverseOf(head1.matrix).transpose();
  head1.renderfast();

  var head2 = new Cube();
  head2.color = [0.95, 0.78, 0.75, 1.0];
  if (g_normalOn) head2.textureNum = -3;
  else head2.textureNum = -2;
  head2.matrix = head_CoordMat;
  head2.matrix.translate(0.025, 0.02, 0.26);
  var head2_CoordMat = new Matrix4(head2.matrix);
  head2.matrix.rotate(-15, 1, 0, 0);
  head2.matrix.scale(0.34, 0.34, 0.2);
  head2.render();

  var head3 = new Cube();
  head3.color = [0.95, 0.78, 0.75, 1.0];
  if (g_normalOn) head3.textureNum = -3;
  else head3.textureNum = -2;
  head3.matrix = new Matrix4(head2_CoordMat);
  head3.matrix.translate(0, 0.05, 0.11);
  head3.matrix.scale(0.34, 0.33, 0.1);
  head3.render();

  var head4 = new Cube();
  head4.color = [0.95, 0.78, 0.75, 1.0];
  if (g_normalOn) head4.textureNum = -3;
  else head4.textureNum = -2;
  head4.matrix = new Matrix4(head_CoordMat);
  head4.matrix.translate(0.11, 0.32, 1.05);
  head4.matrix.scale(0.8, 0.6, 0.8);
  head4.render();


  // Ears
  var leftEar = new Cube();
  leftEar.color = [0.9, 0.73, 0.7, 1.0];
  if (g_normalOn) leftEar.textureNum = -3;
  else leftEar.textureNum = -2;
  leftEar.matrix = new Matrix4(head_CoordMat);
  leftEar.matrix.translate(0.95, 0.14, 0.4);
  leftEar.matrix.rotate(-30, 0, 0, 1);
  leftEar.matrix.scale(0.4, 0.1, 0.4);
  /*leftEar.matrix.translate(0.5, 0.5, 0.5);
  leftEar.matrix.scale(-1, -1, -1);
  leftEar.matrix.translate(-0.5, -0.5, -0.5);*/
  leftEar.render();

  var rightEar = new Cube();
  rightEar.color = [0.9, 0.73, 0.7, 1.0];
  if (g_normalOn) rightEar.textureNum = -3;
  else rightEar.textureNum = -2;
  rightEar.matrix = new Matrix4(head_CoordMat);
  rightEar.matrix.scale(-1, 1, 1);
  rightEar.matrix.translate(-0.05, 0.14, 0.4);
  rightEar.matrix.rotate(-30, 0, 0, 1);
  rightEar.matrix.scale(0.4, 0.1, 0.4);
  /*rightEar.matrix.translate(0.5, 0.5, 0.5);
  rightEar.matrix.scale(-1, -1, -1);
  rightEar.matrix.translate(-0.5, -0.5, -0.5);*/
  rightEar.render();

  // Eyes
  var leftEye = new Cube();
  leftEye.color = [0.3, 0.3, 0.3, 1.0];
  if (g_normalOn) leftEye.textureNum = -3;
  else leftEye.textureNum = -2;
  leftEye.matrix = new Matrix4(head3.matrix);
  leftEye.matrix.translate(0.83, 0.22, 0.8);
  leftEye.matrix.scale(0.15, 0.16, 0.4);
  /*leftEye.matrix.translate(0.5, 0.5, 0.5);
  leftEye.matrix.scale(-1, -1, -1);
  leftEye.matrix.translate(-0.5, -0.5, -0.5);*/
  leftEye.render();

  var rightEye = new Cube();
  rightEye.color = [0.3, 0.3, 0.3, 1.0];
  if (g_normalOn) rightEye.textureNum = -3;
  else rightEye.textureNum = -2;
  rightEye.matrix = new Matrix4(head3.matrix);
  rightEye.matrix.translate(0.03, 0.22, 0.8);
  rightEye.matrix.scale(0.15, 0.16, 0.4);
  /*rightEye.matrix.translate(0.5, 0.5, 0.5);
  rightEye.matrix.scale(-1, -1, -1);
  rightEye.matrix.translate(-0.5, -0.5, -0.5);*/
  rightEye.render();

  // Snout
  var snout = new Cube();
  snout.color = [0.93, 0.68, 0.66, 1.0];
  if (g_normalOn) snout.textureNum = -3;
  else snout.textureNum = -2;
  snout.matrix = new Matrix4(head4.matrix);
  snout.matrix.translate(0.15, 0.05, 0.85);
  snout.matrix.scale(0.7, 0.7, 0.3);
  /*snout.matrix.translate(0.5, 0.5, 0.5);
  snout.matrix.scale(-1, -1, -1);
  snout.matrix.translate(-0.5, -0.5, -0.5);*/
  snout.render();

  var leftNostril = new Cube();
  leftNostril.color = [0.58, 0.33, 0.31, 1.0];
  if (g_normalOn) leftNostril.textureNum = -3;
  else leftNostril.textureNum = -2;
  leftNostril.matrix = new Matrix4(head4.matrix);
  leftNostril.matrix.translate(0.65, 0.15, 0.9);
  leftNostril.matrix.scale(0.12, 0.37, 0.3);
  /*leftNostril.matrix.translate(0.5, 0.5, 0.5);
  leftNostril.matrix.scale(-1, -1, -1);
  leftNostril.matrix.translate(-0.5, -0.5, -0.5);*/
  leftNostril.render();

  var rightNostril = new Cube();
  rightNostril.color = [0.58, 0.33, 0.31, 1.0];
  if (g_normalOn) rightNostril.textureNum = -3;
  else rightNostril.textureNum = -2;
  rightNostril.matrix = new Matrix4(head4.matrix);
  rightNostril.matrix.translate(0.24, 0.15, 0.9);
  rightNostril.matrix.scale(0.12, 0.37, 0.3);
  /*rightNostril.matrix.translate(0.5, 0.5, 0.5);
  rightNostril.matrix.scale(-1, -1, -1);
  rightNostril.matrix.translate(-0.5, -0.5, -0.5);*/
  rightNostril.render();

  // Draw body cube
  var body1 = new Cube();
  body1.color = [0.95, 0.78, 0.75, 1.0];
  if (g_normalOn) body1.textureNum = -3;
  else body1.textureNum = -2;
  body1.matrix.translate(-.3, -.43, -0.4);
  body1.matrix.scale(0.5, 0.5, 0.2);
  body1.matrix.translate(0.5, 0.5, 0.5);
  body1.matrix.scale(-1, -1, -1);
  body1.matrix.translate(-0.5, -0.5, -0.5);
  body1.render();

  var body2 = new Cube();
  body2.color = [0.95, 0.78, 0.75, 1.0];
  if (g_normalOn) body2.textureNum = -3;
  else body2.textureNum = -2;
  body2.matrix.translate(-.35, -.48, -0.2);
  body2.matrix.scale(0.6, 0.6, 0.2);
  body2.matrix.translate(0.5, 0.5, 0.5);
  body2.matrix.scale(-1, -1, -1);
  body2.matrix.translate(-0.5, -0.5, -0.5);
  body2.render();

  var body3 = new Cube();
  body3.color = [0.95, 0.78, 0.75, 1.0];
  if (g_normalOn) body3.textureNum = -3;
  else body3.textureNum = -2;
  body3.matrix.translate(-.37, -.5, 0);
  body3.matrix.scale(0.65, 0.65, 0.5);
  body3.matrix.translate(0.5, 0.5, 0.5);
  body3.matrix.scale(-1, -1, -1);
  body3.matrix.translate(-0.5, -0.5, -0.5);
  body3.render();

  var body4 = new Cube();
  body4.color = [0.95, 0.78, 0.75, 1.0];
  if (g_normalOn) body4.textureNum = -3;
  else body4.textureNum = -2;
  body4.matrix.translate(-.325, -.45, 0.5);
  body4.matrix.scale(0.55, 0.55, 0.2);
  body4.matrix.translate(0.5, 0.5, 0.5);
  body4.matrix.scale(-1, -1, -1);
  body4.matrix.translate(-0.5, -0.5, -0.5);
  body4.render();

  var body5 = new Cube();
  body5.color = [0.95, 0.78, 0.75, 1.0];
  if (g_normalOn) body5.textureNum = -3;
  else body5.textureNum = -2;
  body5.matrix.translate(-.275, -.4, 0.65);
  body5.matrix.scale(0.45, 0.45, 0.1);
  body5.matrix.translate(0.5, 0.5, 0.5);
  body5.matrix.scale(-1, -1, -1);
  body5.matrix.translate(-0.5, -0.5, -0.5);
  body5.render();

  var body6 = new Cube();
  body6.color = [0.95, 0.78, 0.75, 1.0];
  if (g_normalOn) body6.textureNum = -3;
  else body6.textureNum = -2;
  body6.matrix.translate(-.275, -.35, 0.75);
  body6.matrix.scale(0.35, 0.35, 0.05);
  body6.matrix.translate(0.5, 0.5, 0.5);
  body6.matrix.scale(-1, -1, -1);
  body6.matrix.translate(-0.5, -0.5, -0.5);
  body6.render();

  // Draw a front left Leg
  var frontLeftLeg1 = new Cube();
  frontLeftLeg1.color = [0.95, 0.78, 0.75, 1.0];
  if (g_normalOn) frontLeftLeg1.textureNum = -3;
  else frontLeftLeg1.textureNum = -2;
  frontLeftLeg1.matrix.setTranslate(0.1, -0.37, -0.22);
  frontLeftLeg1.matrix.rotate(160, 1, 0, 0);
  frontLeftLeg1.matrix.rotate(g_FLLAngle, 1, 0, 0);
  var FLL_CoordMat = new Matrix4(frontLeftLeg1.matrix);
  frontLeftLeg1.matrix.scale(0.15, .15, .15);
  /*frontLeftLeg1.matrix.translate(0.5, 0.5, 0.5);
  frontLeftLeg1.matrix.scale(-1, -1, -1);
  frontLeftLeg1.matrix.translate(-0.5, -0.5, -0.5);*/
  frontLeftLeg1.render();

  var frontLeftLeg2 = new Cube();
  frontLeftLeg2.color = [0.95, 0.78, 0.75, 1.0];
  if (g_normalOn) frontLeftLeg2.textureNum = -3;
  else frontLeftLeg2.textureNum = -2;
  frontLeftLeg2.matrix = FLL_CoordMat;
  frontLeftLeg2.matrix.translate(0, 0.13, 0.01);
  frontLeftLeg2.matrix.rotate(20, 1, 0, 0);
  frontLeftLeg2.matrix.scale(0.13, .13, .13);
  /*frontLeftLeg2.matrix.translate(0.5, 0.5, 0.5);
  frontLeftLeg2.matrix.scale(-1, -1, -1);
  frontLeftLeg2.matrix.translate(-0.5, -0.5, -0.5);*/
  frontLeftLeg2.render();

  var frontLeftLeg3 = new Cube();
  frontLeftLeg3.color = [0.95, 0.78, 0.75, 1.0];
  if (g_normalOn) frontLeftLeg3.textureNum = -3;
  else frontLeftLeg3.textureNum = -2;
  frontLeftLeg3.matrix = new Matrix4(frontLeftLeg2.matrix);
  frontLeftLeg3.matrix.translate(0.05, 0.85, 0.02);
  frontLeftLeg3.matrix.scale(0.9, .9, .9);
  /*frontLeftLeg3.matrix.translate(0.5, 0.5, 0.5);
  frontLeftLeg3.matrix.scale(-1, -1, -1);
  frontLeftLeg3.matrix.translate(-0.5, -0.5, -0.5);*/
  frontLeftLeg3.render();

  // Draw a front right Leg
  var frontRightLeg1 = new Cube();
  frontRightLeg1.color = [0.95, 0.78, 0.75, 1.0];
  if (g_normalOn) frontRightLeg1.textureNum = -3;
  else frontRightLeg1.textureNum = -2;
  frontRightLeg1.matrix.setTranslate(-0.34, -0.37, -0.22);
  frontRightLeg1.matrix.rotate(160, 1, 0, 0);
  frontRightLeg1.matrix.rotate(g_FRLAngle, 1, 0, 0);
  var FRL_CoordMat = new Matrix4(frontRightLeg1.matrix);
  frontRightLeg1.matrix.scale(0.15, .15, .15);
  /*frontRightLeg1.matrix.translate(0.5, 0.5, 0.5);
  frontRightLeg1.matrix.scale(-1, -1, -1);
  frontRightLeg1.matrix.translate(-0.5, -0.5, -0.5);*/
  frontRightLeg1.render();

  var frontRightLeg2 = new Cube();
  frontRightLeg2.color = [0.95, 0.78, 0.75, 1.0];
  if (g_normalOn) frontRightLeg2.textureNum = -3;
  else frontRightLeg2.textureNum = -2;
  frontRightLeg2.matrix = FRL_CoordMat;
  frontRightLeg2.matrix.translate(0.02, 0.13, 0.01);
  frontRightLeg2.matrix.rotate(20, 1, 0, 0);
  frontRightLeg2.matrix.scale(0.13, .13, .13);
  /*frontRightLeg2.matrix.translate(0.5, 0.5, 0.5);
  frontRightLeg2.matrix.scale(-1, -1, -1);
  frontRightLeg2.matrix.translate(-0.5, -0.5, -0.5);*/
  frontRightLeg2.render();

  var frontRightLeg3 = new Cube();
  frontRightLeg3.color = [0.95, 0.78, 0.75, 1.0];
  if (g_normalOn) frontRightLeg3.textureNum = -3;
  else frontRightLeg3.textureNum = -2;
  frontRightLeg3.matrix = new Matrix4(frontRightLeg2.matrix);
  frontRightLeg3.matrix.translate(0.05, 0.85, 0.02);
  frontRightLeg3.matrix.scale(0.9, .9, .9);
  /*frontRightLeg3.matrix.translate(0.5, 0.5, 0.5);
  frontRightLeg3.matrix.scale(-1, -1, -1);
  frontRightLeg3.matrix.translate(-0.5, -0.5, -0.5);*/
  frontRightLeg3.render();

  // Draw a back left Leg
  var backLeftLeg1 = new Cube();
  backLeftLeg1.color = [0.95, 0.78, 0.75, 1.0];
  if (g_normalOn) backLeftLeg1.textureNum = -3;
  else backLeftLeg1.textureNum = -2;
  backLeftLeg1.matrix.setTranslate(0.06, -0.3, 0.57);
  backLeftLeg1.matrix.rotate(115, 1, 0, 0);
  backLeftLeg1.matrix.rotate(-g_BLLAngle, 1, 0, 0);
  //backLeftLeg1.matrix.rotate(-25-30*Math.sin(g_seconds), 1, 0, 0);
  var BLL_CoordMat = new Matrix4(backLeftLeg1.matrix);
  backLeftLeg1.matrix.scale(0.2, .2, .2);
  backLeftLeg1.matrix.translate(0.5, 0.5, 0.5);
  backLeftLeg1.matrix.scale(-1, -1, -1);
  backLeftLeg1.matrix.translate(-0.5, -0.5, -0.5);
  backLeftLeg1.render();

  var backLeftLeg2 = new Cube();
  backLeftLeg2.color = [0.95, 0.78, 0.75, 1.0];
  if (g_normalOn) backLeftLeg2.textureNum = -3;
  else backLeftLeg2.textureNum = -2;
  backLeftLeg2.matrix = BLL_CoordMat;
  backLeftLeg2.matrix.translate(0.03, 0.1, 0.3);
  backLeftLeg2.matrix.rotate(-115, 1, 0, 0);
  backLeftLeg2.matrix.scale(0.15, .13, .13);
  backLeftLeg2.matrix.translate(0.5, 0.5, 0.5);
  backLeftLeg2.matrix.scale(-1, -1, -1);
  backLeftLeg2.matrix.translate(-0.5, -0.5, -0.5);
  backLeftLeg2.render();

  var backLeftLeg3 = new Cube();
  backLeftLeg3.color = [0.95, 0.78, 0.75, 1.0];
  if (g_normalOn) backLeftLeg3.textureNum = -3;
  else backLeftLeg3.textureNum = -2;
  backLeftLeg3.matrix = new Matrix4(backLeftLeg2.matrix);
  backLeftLeg3.matrix.translate(0.1, -0.8, 0.05);
  backLeftLeg3.matrix.scale(0.9, 0.9, 0.9);
  backLeftLeg3.matrix.translate(0.5, 0.5, 0.5);
  backLeftLeg3.matrix.scale(-1, -1, -1);
  backLeftLeg3.matrix.translate(-0.5, -0.5, -0.5);
  backLeftLeg3.render();

  // Draw a back right Leg
  var backRightLeg1 = new Cube();
  backRightLeg1.color = [0.95, 0.78, 0.75, 1.0];
  if (g_normalOn) backRightLeg1.textureNum = -3;
  else backRightLeg1.textureNum = -2;
  backRightLeg1.matrix.setTranslate(-0.35, -0.3, 0.57);
  backRightLeg1.matrix.rotate(115, 1, 0, 0);
  backRightLeg1.matrix.rotate(-g_BRLAngle, 1, 0, 0);
  //backRightLeg1.matrix.rotate(-25-30*Math.sin(g_seconds), 1, 0, 0);
  var BRL_CoordMat = new Matrix4(backRightLeg1.matrix);
  backRightLeg1.matrix.scale(0.2, .2, .2);
  backRightLeg1.matrix.translate(0.5, 0.5, 0.5);
  backRightLeg1.matrix.scale(-1, -1, -1);
  backRightLeg1.matrix.translate(-0.5, -0.5, -0.5);
  backRightLeg1.render();

  var backRightLeg2 = new Cube();
  backRightLeg2.color = [0.95, 0.78, 0.75, 1.0];
  if (g_normalOn) backRightLeg2.textureNum = -3;
  else backRightLeg2.textureNum = -2;
  backRightLeg2.matrix = BRL_CoordMat;
  backRightLeg2.matrix.translate(0.03, 0.1, 0.3);
  backRightLeg2.matrix.rotate(-115, 1, 0, 0);
  backRightLeg2.matrix.scale(0.15, .13, .13);
  backRightLeg2.matrix.translate(0.5, 0.5, 0.5);
  backRightLeg2.matrix.scale(-1, -1, -1);
  backRightLeg2.matrix.translate(-0.5, -0.5, -0.5);
  backRightLeg2.render();

  var backRightLeg3 = new Cube();
  backRightLeg3.color = [0.95, 0.78, 0.75, 1.0];
  if (g_normalOn) backRightLeg3.textureNum = -3;
  else backRightLeg3.textureNum = -2;
  backRightLeg3.matrix = new Matrix4(backRightLeg2.matrix);
  backRightLeg3.matrix.translate(0.1, -0.8, 0.05);
  backRightLeg3.matrix.scale(0.9, 0.9, 0.9);
  backRightLeg3.matrix.translate(0.5, 0.5, 0.5);
  backRightLeg3.matrix.scale(-1, -1, -1);
  backRightLeg3.matrix.translate(-0.5, -0.5, -0.5);
  backRightLeg3.render();

  // Tail
  var tail1 = new Cube();
  tail1.color = [0.9, 0.73, 0.7, 1.0];
  if (g_normalOn) tail1.textureNum = -3;
  else tail1.textureNum = -2;
  tail1.matrix.translate(-0.14, -0.13, 0.72);
  tail1.matrix.rotate(-35, 1, 0, 0);
  tail1.matrix.rotate(g_tailAngle, 1, 0, 0);
  //tail1.matrix.rotate(10+20*Math.sin(g_seconds), 1, 0, 0);
  var tail_CoordMat = new Matrix4(tail1.matrix);
  tail1.matrix.scale(0.05, 0.05, 0.25);
  tail1.matrix.translate(0.5, 0.5, 0.5);
  tail1.matrix.scale(-1, -1, -1);
  tail1.matrix.translate(-0.5, -0.5, -0.5);
  tail1.render();

  var tail2 = new Cube();
  tail2.color = [0.9, 0.73, 0.7, 1.0];
  if (g_normalOn) tail2.textureNum = -3;
  else tail2.textureNum = -2;
  tail2.matrix = tail_CoordMat;
  tail2.matrix.translate(0.01, 0.11, 0.21);
  var tail2_CoordMat = new Matrix4(tail2.matrix);
  tail2.matrix.rotate(90, 1, 0, 0);
  tail2.matrix.scale(0.04, 0.04, 0.07);
  tail2.matrix.translate(0.5, 0.5, 0.5);
  tail2.matrix.scale(-1, -1, -1);
  tail2.matrix.translate(-0.5, -0.5, -0.5);
  tail2.render();

  var tail3 = new Cube();
  tail3.color = [0.9, 0.73, 0.7, 1.0];
  if (g_normalOn) tail3.textureNum = -3;
  else tail3.textureNum = -2;
  tail3.matrix = new Matrix4(tail2_CoordMat);
  tail3.matrix.translate(0.01, 0.03, 0.045);
  tail3.matrix.rotate(-180, 1, 0, 0);
  tail3.matrix.scale(0.03, 0.04, 0.07);
  tail3.matrix.translate(0.5, 0.5, 0.5);
  tail3.matrix.scale(-1, -1, -1);
  tail3.matrix.translate(-0.5, -0.5, -0.5);
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