const { Vec3D, Ray, Quat } = require("./math.js");

class World {
  constructor(){
    this.objects = [];
  }

  visual(){
    return this.objects.map(o => o.visual).filter(o => o);
  }

  light(){
    return this.objects.map(o => o.light).filter(o => o);
  }

  collider(){
    return this.objects.map(o => o.collider).filter(o => o);
  }

  addObjects(...o){
    this.objects.push(...o);
  }
}

class Movable {
  constructor(cords){
    this.cords = cords;
    this.rotation = new Quat(1, new Vec3D(0, 0, 0));
  }
  moveGlobal(vec){
    this.cords = this.cords.add(vec);
    return vec;
  }
  moveLocal(vec){
    return this.moveGlobal(vec.rotate(this.rotation));
  }
  moveTo(pt){
    return this.moveGlobal(pt.sub(this.cords));
  }
  rotate(rot){
    this.rotation = this.rotation.mul(rot.unitNorm);
  }
}


class OrigMovable extends Movable {
  constructor(cords, orig){
    super(cords);
    this.orig = orig ?? cords;
  }

  rotate(rot){
    super.rotate(rot);
    // rotate center around orig
    this.cords = this.cords.sub(this.orig)
      .rotate(rot.unitNorm).add(this.orig);
    return this;
  }

  moveGlobal(vec){
    super.moveGlobal(vec);
    this.orig = this.orig.add(vec);
    return vec;
  }
}

class WorldObject extends Movable {
  constructor(pos, light, visual){
    super(pos);
    this.light = light ?? null;
    this.visual = visual ?? null;
  }
  moveGlobal(vec){
    vec = super.moveGlobal(vec);
    this.light?.moveGlobal(vec);
    this.visual?.moveGlobal(vec);
    return vec;
  }
  rotate(rot){
    super.rotate(rot);
    this.light?.rotate(rot);
    this.visual?.rotate(rot);
  }
}

class LightObject extends WorldObject {
  constructor(cords){
    super(cords, new LightSource(cords), null );
  }
}

class VisualObject extends WorldObject {
  constructor(object){
    super(object.cords, null, object);
  }
}

class LightSource extends Movable {
  constructor(cords){
    super(cords);
  }
}

module.exports = {
  World, Movable, WorldObject,
  LightObject, VisualObject,
  OrigMovable
};
