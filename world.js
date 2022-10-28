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
  }
  moveLocal(vec){
    this.moveGlobal(vec.rotate(this.rotation));
  }
  moveTo(pt){
    this.moveGlobal(pt.sub(this.cords));
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
  }
  moveLocal(vec){
    super.moveLocal(vec);
    this.light?.moveLocal(vec);
    this.visual?.moveLocal(vec);
  }
  moveTo(pt){
    super.moveTo(pt);
    this.light?.moveTo(pt);
    this.visual?.moveTo(pt);
  }
  rotate(rot){
    super.rotate(rot);
    this.light?.rotate(rot);
    this.visual?.rotate(rot);
  }
}

class ColliderObject extends WorldObject {
  constructor(object, world){
    super(object.cords, null, new object.collider(object), object);
    this.world = world;
  }
  moveGlobal(vec){
    const dd = this.world.collider()
      .filter(c => c != this.collider)
      .map(c => this.collider.collides(c, vec));
    const ff = [1];
    for(const d of dd){
      // not >=0 because that handles case of touching objects perfectly
      const n = d.filter(i => i > 0);
      // behind object
      if(!n.length) continue;
      // inside object
      if((n.length % 2) && (d.length - n.length)){
        ff.push(0);
        break;
      }
      const f = Math.min(...n);
      // can fully move or can move only partially
      ff.push(f < 1 ? f : 1);
    }
    vec = vec.mul(Math.min(...ff));
    super.moveGlobal(vec);
  }
}

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

module.exports = {
  World, Movable, WorldObject,
  LightObject, GhostObject,
  ColliderObject
};
