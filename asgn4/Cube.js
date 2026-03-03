class Cube{
  constructor(){
    this.type='cube';
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();
    this.normalMatrix = new Matrix4();
    this.textureNum = -2;
  }

  render() {
    var rgba = this.color;

    gl.uniform1i(u_whichTexture, this.textureNum);

    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    // Cube Front
    drawTriangle3DUVNormal([0,0,0, 1,1,0, 1,0,0], [0,0, 1,1, 1,0], [0,0,-1, 0,0,-1, 0,0,-1]);
    drawTriangle3DUVNormal([0,0,0, 0,1,0, 1,1,0], [0,0, 0,1, 1,1], [0,0,-1, 0,0,-1, 0,0,-1]);

    //gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);

    // Cube Top
    drawTriangle3DUVNormal([0,1,0, 0,1,1, 1,1,1], [0,0, 0,1, 1,1], [0,1,0, 0,1,0, 0,1,0]);
    drawTriangle3DUVNormal([0,1,0, 1,1,1, 1,1,0], [0,0, 1,1, 1,0], [0,1,0, 0,1,0, 0,1,0]);

    //gl.uniform4f(u_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3]);

    // Cube Right
    drawTriangle3DUVNormal([1,1,0, 1,1,1, 1,0,0], [0,1, 1,1, 0,0], [1,0,0, 1,0,0, 1,0,0]);
    drawTriangle3DUVNormal([1,0,0, 1,1,1, 1,0,1], [0,0, 1,1, 1,0], [1,0,0, 1,0,0, 1,0,0]);

    //gl.uniform4f(u_FragColor, rgba[0]*.7, rgba[1]*.7, rgba[2]*.7, rgba[3]);

    // Cube Left
    drawTriangle3DUVNormal([0,1,0, 0,1,1, 0,0,0], [0,1, 1,1, 0,0], [-1,0,0, -1,0,0, -1,0,0]);
    drawTriangle3DUVNormal([0,0,0, 0,1,1, 0,0,1], [0,0, 1,1, 1,0], [-1,0,0, -1,0,0, -1,0,0]);

    //gl.uniform4f(u_FragColor, rgba[0]*.6, rgba[1]*.6, rgba[2]*.6, rgba[3]);

    // Cube Bottom
    drawTriangle3DUVNormal([0,0,0, 0,0,1, 1,0,1], [0,0, 0,1, 1,1], [0,-1,0, 0,-1,0, 0,-1,0]);
    drawTriangle3DUVNormal([0,0,0, 1,0,1, 1,0,0], [0,0, 1,1, 1,0], [0,-1,0, 0,-1,0, 0,-1,0]);

    //gl.uniform4f(u_FragColor, rgba[0]*.5, rgba[1]*.5, rgba[2]*.5, rgba[3]);

    // Cube Back
    drawTriangle3DUVNormal([0,0,1, 1,1,1, 1,0,1], [0,0, 1,1, 1,0], [0,0,1, 0,0,1, 0,0,1]);
    drawTriangle3DUVNormal([0,0,1, 0,1,1, 1,1,1], [0,0, 0,1, 1,1], [0,0,1, 0,0,1, 0,0,1]);
    //gl.uniform4f(u_FragColor, rgba[0]*.4, rgba[1]*.4, rgba[2]*.4, rgba[3]);

  }

  renderfast() {
    var rgba = this.color;

    gl.uniform1i(u_whichTexture, this.textureNum);

    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);

    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
    gl.uniformMatrix4fv(u_NormalMatrix, false, this.normalMatrix.elements);

    var allverts=[];
    var allUVs=[];
    var allNormals=[];

    // Cube Front
    allverts = allverts.concat([0,0,0, 1,1,0, 1,0,0]);
    allverts = allverts.concat([0,0,0, 0,1,0, 1,1,0]);
    allUVs = allUVs.concat([0,0, 1,1, 1,0]);
    allUVs = allUVs.concat([0,0, 0,1, 1,1]);
    allNormals = allNormals.concat([0,0,-1, 0,0,-1, 0,0,-1]);
    allNormals = allNormals.concat([0,0,-1, 0,0,-1, 0,0,-1]);

    //gl.uniform4f(u_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3]);

    // Cube Top
    allverts = allverts.concat([0,1,0, 0,1,1, 1,1,1]);
    allverts = allverts.concat([0,1,0, 1,1,1, 1,1,0]);
    allUVs = allUVs.concat([0,0, 0,1, 1,1]);
    allUVs = allUVs.concat([0,0, 1,1, 1,0]);
    allNormals = allNormals.concat([0,1,0, 0,1,0, 0,1,0]);
    allNormals = allNormals.concat([0,1,0, 0,1,0, 0,1,0]);

    // Cube Right
    allverts = allverts.concat([1,0,0,  1,0,1, 1,1,0]);
    allverts = allverts.concat([1,1,1,  1,0,1, 1,1,0]);
    allUVs = allUVs.concat([0,0, 0,1, 1,1]);
    allUVs = allUVs.concat([0,0, 1,1, 1,0]);
    allNormals = allNormals.concat([1,0,0, 1,0,0, 1,0,0]);
    allNormals = allNormals.concat([1,0,0, 1,0,0, 1,0,0]);

    // Cube Left
    allverts = allverts.concat([0,0,0,  0,1,0,  0,0,1]);
    allverts = allverts.concat([0,1,1,  0,1,0,  0,0,1]);
    allUVs = allUVs.concat([0,0, 0,1, 1,1]);
    allUVs = allUVs.concat([0,0, 1,1, 1,0]);
    allNormals = allNormals.concat([-1,0,0, -1,0,0, -1,0,0]);
    allNormals = allNormals.concat([-1,0,0, -1,0,0, -1,0,0]);


    //gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    // Cube Bottom
    allverts = allverts.concat([0,0,0,  1,0,0,  1,0,1]);
    allverts = allverts.concat([0,0,0,  1,0,1,  0,0,1]);
    allUVs = allUVs.concat([0,0, 0,1, 1,1]);
    allUVs = allUVs.concat([0,0, 1,1, 1,0]);
    allNormals = allNormals.concat([0,-1,0, 0,-1,0, 0,-1,0]);
    allNormals = allNormals.concat([0,-1,0, 0,-1,0, 0,-1,0]);

    // Cube Back
    allverts = allverts.concat([0,0,1,  1,0,1,  1,1,1]);
    allverts = allverts.concat([0,0,1,  1,1,1,  0,1,1]);
    allUVs = allUVs.concat([0,0, 0,1, 1,1]);
    allUVs = allUVs.concat([0,0, 1,1, 1,0]);
    allNormals = allNormals.concat([0,0,1, 0,0,1, 0,0,1]);
    allNormals = allNormals.concat([0,0,1, 0,0,1, 0,0,1]);

    drawTriangle3DUVNormal(allverts, allUVs, allNormals);

  }
}
