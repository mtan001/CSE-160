class Cube{
  constructor(){
    this.type='cube';
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();
  }

  render() {
    var rgba = this.color;

    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);

    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    // Cube Front
    drawTriangle3D( [0.0,0.0,0.0, 1.0,1.0,0.0, 1.0,0.0,0.0 ]);
    drawTriangle3D( [0.0,0.0,0.0, 0.0,1.0,0.0, 1.0,1.0,0.0 ]);

    gl.uniform4f(u_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3]);

    // Cube Top
    drawTriangle3D( [0,1,0, 0,1,1, 1,1,1]);
    drawTriangle3D( [0,1,0, 1,1,1, 1,1,0]);

    // Cube Right
    drawTriangle3D( [1,0,0,  1,0,1, 1,1,0]);
    drawTriangle3D( [1,1,1,  1,0,1, 1,1,0]);

    // Cube Left
    drawTriangle3D([0,0,0,  0,1,0,  0,0,1]);
    drawTriangle3D([0,1,1,  0,1,0,  0,0,1]);


    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    // Cube Back
    drawTriangle3D([0,0,1,  1,0,1,  1,1,1]);
    drawTriangle3D([0,0,1,  1,1,1,  0,1,1]);

    // Cube Bottom
    drawTriangle3D([0,0,0,  1,0,0,  1,0,1]);
    drawTriangle3D([0,0,0,  1,0,1,  0,0,1]);

  }
}
