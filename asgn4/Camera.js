class Camera{
    constructor(){
        this.eye=new Vector3([0,0,3]);
        this.at=new Vector3([0,0,-100]);
        this.up=new Vector3([0,1,0]);
        this.speed = 0.2;
    }
    forward() {
        var f = new Vector3(this.at.elements).sub(this.eye).normalize();
        f.normalize();
        f = f.mul(this.speed);

        /*let nextX = this.eye.elements[0] + f.elements[0];
        let nextZ = this.eye.elements[2] + f.elements[2];

        if (!isWallAt(nextX, nextZ)) {
            this.eye = this.eye.add(f);
            this.at = this.at.add(f);
        }*/

        this.at=this.at.add(f);
        this.eye=this.eye.add(f);
    }
    back() {
        var f = new Vector3(this.eye.elements).sub(this.at).normalize();
        f.normalize();
        f = f.mul(this.speed);

        /*
        let nextX = this.eye.elements[0] + f.elements[0];
        let nextZ = this.eye.elements[2] + f.elements[2];

        if (!isWallAt(nextX, nextZ)) {
            this.at=this.at.add(f);
            this.eye=this.eye.add(f);
        }
        */

        this.at=this.at.add(f);
        this.eye=this.eye.add(f);
    }
    left() {
        var f = new Vector3(this.at.elements).sub(this.eye).normalize();
        f.normalize();
        var s = Vector3.cross(this.up, f);
        s.normalize();
        s = s.mul(this.speed);

        /*
        let nextX = this.eye.elements[0] + f.elements[0];
        let nextZ = this.eye.elements[2] + f.elements[2];

        if (!isWallAt(nextX, nextZ)) {
            this.at=this.at.add(s);
            this.eye=this.eye.add(s);
        }
        */

        this.at=this.at.add(s);
        this.eye=this.eye.add(s);
    }
    right() {
        var f = new Vector3(this.at.elements).sub(this.eye).normalize();
        f.normalize();
        f = f.mul(this.speed);
        var s = Vector3.cross(this.up, f);
        s.normalize();
        s = s.mul(this.speed);

        /*
        let nextX = this.eye.elements[0] + f.elements[0];
        let nextZ = this.eye.elements[2] + f.elements[2];

        if (!isWallAt(nextX, nextZ)) {
            this.at=this.at.sub(s);
            this.eye=this.eye.sub(s);
        }
        */

        this.at=this.at.sub(s);
        this.eye=this.eye.sub(s);
    }
    onMouseMove(x, y) {
        let dx = x - g_lastX;
        let dy = y - g_lastY;

        g_lastX = x;
        g_lastY = y;

        let f = new Vector3(this.at.elements).sub(this.eye);

        let rotY = new Matrix4();
        rotY.setRotate(-dx * 0.2, 0, 1, 0);
        f = rotY.multiplyVector(f);
        
        let right = Vector3.cross(f, this.up);
        right.normalize();

        let rotX = new Matrix4();
        rotX.setRotate(-dy * 0.2, right.elements[0], right.elements[1], right.elements[2]);
        f = rotX.multiplyVector(f);

        this.at = new Vector3(this.eye.elements).add(f);
    }

    rotateLeft() {
        let f = new Vector3(this.at.elements).sub(this.eye);

        let rotY = new Matrix4();
        rotY.setRotate(5, 0, 1, 0);  
        f = rotY.multiplyVector(f);

        this.at = new Vector3(this.eye.elements).add(f);
    }

    rotateRight() {
        let f = new Vector3(this.at.elements).sub(this.eye);

        let rotY = new Matrix4();
        rotY.setRotate(-5, 0, 1, 0); 
        f = rotY.multiplyVector(f);

        this.at = new Vector3(this.eye.elements).add(f);
    }

}