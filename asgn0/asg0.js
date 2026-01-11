// DrawTriangle.js (c) 2012 matsuda

function main() {  
  // Clear forms
  document.getElementById("v1-x").value = "";
  document.getElementById("v1-y").value = "";
  document.getElementById("v2-x").value = "";
  document.getElementById("v2-y").value = "";
  document.getElementById("op-select").value = "";
  document.getElementById("scalar").value = "";

  // Retrieve <canvas> element
  var canvas = document.getElementById('example');  
  if (!canvas) { 
    console.log('Failed to retrieve the <canvas> element');
    return false; 
  } 

  // Get the rendering context for 2DCG
  var ctx = canvas.getContext('2d');

  // Draw black rectangle background
  ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; 
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw Vector
  function drawVector(v, stringColor) {
    ctx.beginPath();
    ctx.strokeStyle = stringColor;
    ctx.moveTo(200, 200);
    ctx.lineTo(200+v.elements[0]*20, 200-v.elements[1]*20);
    ctx.stroke();
  }

  // Draw Button
  function handleDrawEvent() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    var v1X = document.getElementById("v1-x");
    var v1Y = document.getElementById("v1-y");
    var v1 = new Vector3([v1X.value, v1Y.value, 0]);
    drawVector(v1, "red");
    var v2X = document.getElementById("v2-x");
    var v2Y = document.getElementById("v2-y");
    var v2 = new Vector3([v2X.value, v2Y.value, 0]);
    drawVector(v2, "blue");
  }

  const drawButton = document.getElementById('draw');
  drawButton.addEventListener('click', handleDrawEvent);

  // Operation Helper Functions
  function angleBetween(v1, v2) {
    var angle = Math.acos(Vector3.dot(v1, v2) / (v1.magnitude() * v2.magnitude()));
    angle = angle * (180 / Math.PI); // convert from radians to degrees
    return angle;
  }
  function areaTriangle(v1, v2) {
    var area = Vector3.cross(v1, v2).magnitude() / 2;
    return area;
  }

  // Draw Operation Button
  function handleDrawOperationEvent() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    var v1X = document.getElementById("v1-x");
    var v1Y = document.getElementById("v1-y");
    var v1 = new Vector3([v1X.value, v1Y.value, 0]);
    drawVector(v1, "red");
    var v2X = document.getElementById("v2-x");
    var v2Y = document.getElementById("v2-y");
    var v2 = new Vector3([v2X.value, v2Y.value, 0]);
    drawVector(v2, "blue");

    var operation = document.getElementById("op-select").value;
    var scalar = document.getElementById("scalar").value;
    var v3 = v1;
    var v4 = v2;
    switch(operation) {
      case "add":
        v3.add(v2);
        drawVector(v3, "green");
        break;
      case "sub":
        v3.sub(v2);
        drawVector(v3, "green");
        break;
      case "div":
        v3.div(scalar);
        v4.div(scalar);
        drawVector(v3, "green");
        drawVector(v4, "green");
        break;
      case "mul":
        v3.mul(scalar);
        v4.mul(scalar);
        drawVector(v3, "green");
        drawVector(v4, "green");
        break;
      case "mag":
        console.log("Magnitude v1: ", v1.magnitude());
        console.log("Magnitude v2: ", v2.magnitude());
        break;
      case "norm":
        v3.normalize();
        v4.normalize();
        drawVector(v3, "green");
        drawVector(v4, "green");
        break;
      case "ang":
        console.log("Angle: ", angleBetween(v1, v2));
        break;
      case "area":
        console.log("Area of the triangle: ", areaTriangle(v1, v2));
        break;
      default:
        console.log('Invalid Operation');
    }
  }

  const drawOpButton = document.getElementById('drawOp');
  drawOpButton.addEventListener('click', handleDrawOperationEvent);
}
