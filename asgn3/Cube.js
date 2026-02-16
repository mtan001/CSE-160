class Cube{
  constructor(){
    this.type='cube';
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();
    this.textureNum = -2;
  }

  render() {
    var rgba = this.color;

    gl.uniform1i(u_whichTexture, this.textureNum);

    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);

    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    // Cube Front
    drawTriangle3DUV( [0,0,0, 1,1,0, 1,0,0], [0,0, 1,1, 1,0]);
    drawTriangle3DUV( [0,0,0, 0,1,0, 1,1,0], [0,0, 0,1, 1,1]);

    gl.uniform4f(u_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3]);

    // Cube Top
    drawTriangle3DUV([0,1,0, 0,1,1, 1,1,1], [0,0, 0,1, 1,1]);
    drawTriangle3DUV([0,1,0, 1,1,1, 1,1,0], [0,0, 1,1, 1,0]);

    // Cube Right
    drawTriangle3DUV([1,0,0,  1,0,1, 1,1,0], [0,0, 1,0, 0,1]);
    drawTriangle3DUV([1,1,1,  1,0,1, 1,1,0], [1,1, 1,0, 0,1]);

    // Cube Left
    drawTriangle3DUV([0,0,0,  0,1,0,  0,0,1], [0,0, 1,0, 0,1]);
    drawTriangle3DUV([0,1,1,  0,1,0,  0,0,1], [1,1, 1,0, 0,1]);


    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    // Cube Back
    drawTriangle3DUV([0,0,1,  1,0,1,  1,1,1], [0,0, 1,0, 1,1]);
    drawTriangle3DUV([0,0,1,  1,1,1,  0,1,1], [0,0, 1,1, 0,1]);

    // Cube Bottom
    drawTriangle3DUV([0,0,0,  1,0,0,  1,0,1], [0,0, 1,0, 1,1]);
    drawTriangle3DUV([0,0,0,  1,0,1,  0,0,1], [0,0, 1,1, 0,1]);

  }

  renderfast() {
    var rgba = this.color;

    gl.uniform1i(u_whichTexture, this.textureNum);

    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);

    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    var allverts=[];
    var allUVs=[];

    // Cube Front
    allverts = allverts.concat([0,0,0, 1,1,0, 1,0,0]);
    allverts = allverts.concat([0,0,0, 0,1,0, 1,1,0]);
    allUVs = allUVs.concat([0,0, 1,1, 1,0]);
    allUVs = allUVs.concat([0,0, 0,1, 1,1]);

    //gl.uniform4f(u_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3]);

    // Cube Top
    allverts = allverts.concat([0,1,0, 0,1,1, 1,1,1]);
    allverts = allverts.concat([0,1,0, 1,1,1, 1,1,0]);
    allUVs = allUVs.concat([0,0, 0,1, 1,1]);
    allUVs = allUVs.concat([0,0, 1,1, 1,0]);

    // Cube Right
    allverts = allverts.concat([1,0,0,  1,0,1, 1,1,0]);
    allverts = allverts.concat([1,1,1,  1,0,1, 1,1,0]);
    allUVs = allUVs.concat([0,0, 1,0, 0,1]);
    allUVs = allUVs.concat([1,1, 1,0, 0,1]);

    // Cube Left
    allverts = allverts.concat([0,0,0,  0,1,0,  0,0,1]);
    allverts = allverts.concat([0,1,1,  0,1,0,  0,0,1]);
    allUVs = allUVs.concat([0,0, 1,0, 0,1]);
    allUVs = allUVs.concat([1,1, 1,0, 0,1]);


    //gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    // Cube Back
    allverts = allverts.concat([0,0,1,  1,0,1,  1,1,1]);
    allverts = allverts.concat([0,0,1,  1,1,1,  0,1,1]);
    allUVs = allUVs.concat([0,0, 1,0, 1,1]);
    allUVs = allUVs.concat([0,0, 1,1, 0,1]);

    // Cube Bottom
    allverts = allverts.concat([0,0,0,  1,0,0,  1,0,1]);
    allverts = allverts.concat([0,0,0,  1,0,1,  0,0,1]);
    allUVs = allUVs.concat([0,0, 1,0, 1,1]);
    allUVs = allUVs.concat([0,0, 1,1, 0,1]);
    drawTriangle3DUV(allverts, allUVs);

  }
}
