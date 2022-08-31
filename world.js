const { Vec3D, Ray, Quat } = require("./math.js");

class World {
  constructor(){
    this.objects = [];
  }

  addObjects(...o){
    this.objects.push(...o);
  }
}

class WorldObject {
  constructor(cords){
    this.cords = cords;
    this.rotation = new Quat(1, new Vec3D(0, 0, 0));
  }

  moveGlobal(vec){
    this.cords = this.cords.add(vec);
  }

  moveLocal(vec){
    this.cords = this.cords.add(vec.rotate(this.rotation));
  }

  moveTo(pt){
    this.cords = pt;
  }

  rotate(rot){
    this.rotation = this.rotation.mul(rot.unitNorm);
  }
}

class PhysicalWorldObject extends WorldObject {
  constructor(cords){
    super(cords);
  }
}

class AbstractWorldObject extends WorldObject {
  constructor(cords){
    super(cords);
  }
}

module.exports = { World, WorldObject, PhysicalWorldObject, AbstractWorldObject };