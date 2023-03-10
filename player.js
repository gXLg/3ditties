const { Parallelepiped } = require("./body.js");
const { VisualObject } = require("./world.js");
const { Vec3D, Quat } = require("./math.js");
const { Camera } = require("./graphics.js");

class Player extends VisualObject {
  constructor(cords, world){
    cords = cords ?? new Vec3D(0, 0, 0);
    const box = new Parallelepiped(
      cords.sub(new Vec3D(0.1, 0.25, 0)), cords,
      new Vec3D(0.2, 0, 0),
      new Vec3D(0, 0.5, 0),
      new Vec3D(0, 0, 2)
    );
    super(box, world);

    const fp = new Camera(
      cords.add(new Vec3D(0.12, 0, 1.5)),
      cords, 2, 2, 60, world
    );
    const sp = new Camera(
      cords.sub(new Vec3D(3, 0, - 3)),
      cords, 2, 2, 80, world
    );
    //sp.rotate(new Quat(Math.PI / 6, new Vec3D(0, 1, 0)))
    this.cams = [fp, sp];
    this.cam = fp;
  }
  nextCam(){
    const i = this.cams.indexOf(this.cam);
    this.cam = this.cams[(i + 1) % this.cams.length];
    return this.cam;
  }
  moveGlobal(vec){
    vec = super.moveGlobal(vec);
    this.cams.forEach(c => c.moveGlobal(vec));
    return vec;
  }
  rotate(rot){
    super.rotate(rot);
    this.cams.forEach(c => c.rotate(rot));
  }
}

module.exports = {
  Player
};
