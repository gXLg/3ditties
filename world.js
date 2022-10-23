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
  }
  moveLocal(vec){
    this.cords = this.cords.add(vec.rotate(this.rotation));
  }
  moveTo(pt){
    moveGlobal(pt.sub(this.cords));
  }
  rotate(rot){
    this.rotation = this.rotation.mul(rot.unitNorm);
  }
}

class WorldObject extends Movable {
  constructor(pos, light, collider, visual){
    super(pos);
    this.light = light ?? null;
    this.visual = visual ?? null;
    this.collider = collider ?? null;
  }
  moveGlobal(vec){
    super.moveGlobal(vec);
    this.light?.moveGlobal(vec);
    this.visual?.moveGlobal(vec);
    this.collider?.moveGlobal(vec);
  }
  moveLocal(vec){
    super.moveLocal(vec);
    this.light?.moveLocal(vec);
    this.visual?.moveLocal(vec);
    this.collider?.moveLocal(vec);
  }
  moveTo(pt){
    super.moveTo(pt);
    this.light?.moveTo(pt);
    this.visual?.moveTo(pt);
    this.collider?.moveTo(pt);
  }
  rotate(rot){
    super.rotate(rot);
    this.light?.rotate(rot);
    this.visual?.rotate(rot);
    this.collider?.rotate(rot);
  }
}

/*
class ColliderObject extends WorldObject {
  constructor(object){
    super(null, object, );
  }
}
*/

class LightObject extends WorldObject {
  constructor(cords){
    super(cords, new LightSource(cords), null, null);
  }
}

class GhostObject extends WorldObject {
  constructor(object){
    super(object.cords, null, null, object);
  }
}

class LightSource extends Movable {
  constructor(cords){
    super(cords);
  }
}

module.exports = { World, Movable, WorldObject, LightObject, GhostObject };
