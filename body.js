const { solveQuartic, Vec3D, Ray, Quat } = require("./math.js");
const { PhysicalWorldObject } = require("./world.js");

class Shape extends PhysicalWorldObject {
  constructor(cords, orig){
    super(cords);

    this.orig = orig ?? cords;
  }

  rotate(rot){
    super.rotate(rot);
    // rotate center around orig
    this.cords = this.cords.sub(this.orig).rotate(rot.unitNorm).add(this.orig);
    return this;
  }
}

class ImplicitShape extends Shape {
  constructor(cords, orig){
    super(cords, orig);
  }
}

class Sphere extends ImplicitShape {
  constructor(cords, orig, radius){
    super(cords, orig);
    this.radius = radius;
  }

  intersects(ray){
    const l = ray.orig.sub(this.cords);

    const a = 1;
    const b = 2 * l.dot(ray.dir);
    const c = l.abs ** 2 - this.radius ** 2;
    const D = b * b - 4 * a * c;

    if(D > 0){
      return [
        Math.round(((- b + Math.sqrt(D)) / (2 * a)) * 1e7) / 1e7,
        Math.round(((- b - Math.sqrt(D)) / (2 * a)) * 1e7) / 1e7
      ];
    } else if(D == 0){
      return [Math.round((- b / (2 * a)) * 1e7) / 1e7];
    } else return [];
  }

  surface(ray, point){
    return point.sub(this.cords).unit;
  }
}

/*
class Donut extends ImplicitShape {
  constructor(cords, orig, radius, thickness){
    super(cords, orig);

    this.radius = radius;
    this.thickness = thickness;
  }

  intersects(ray){

  }

  surface(ray, point){

  }
}
*/

class Plane extends ImplicitShape {
  constructor(cords, orig, normal){
    super(cords, orig);
    this.normal = normal ?? new Vec3D(1, 0, 0);
  }

  rotate(rot){
    super.rotate(rot);
    this.normal = this.normal.rotate(rot.unitNorm);
  }

  intersects(ray){
    const denom = this.normal.dot(ray.dir);
    if(denom == 0) return [];

    const l = this.cords.sub(ray.orig);
    const t = l.dot(this.normal) / denom;

    return [t];
  }

  surface(ray, point){
    return this.normal;
  }
}

class Parallelogram extends Plane {
  constructor(cords, orig, p, q){
    super(cords, orig, p.cross(q).unit);
    this.p = p;
    this.q = q;
  }

  rotate(rot){
    super.rotate(rot);
    this.p = this.p.rotate(rot.unitNorm);
    this.q = this.q.rotate(rot.unitNorm);
  }

  intersects(ray){
    const t = super.intersects(ray)[0];
    if(t == undefined) return [];
    const cut = ray.point(t);

    const o = cut.sub(this.cords);

    const pn = this.p.cross(this.normal).unit;
    const po = pn.mul(this.q.dot(pn));

    const qn = this.q.cross(this.normal).unit;
    const qo = qn.mul(this.p.dot(qn));

    if(
      0 <= o.dot(po) && o.dot(po) <= po.dot(po) &&
      0 <= o.dot(qo) && o.dot(qo) <= qo.dot(qo)
    ) return [t];
    return [];
  }
}

class Disc extends Plane {
  constructor(cords, orig, normal, radius){
    super(cords, orig, normal);
    this.radius = radius;
  }

  intersects(ray){
    const t = super.intersects(ray)[0];
    if(t == undefined) return [];
    const cut = ray.point(t);

    if(cut.sub(this.cords).abs <= this.radius) return [t];
    return [];
  }
}


class Polygon extends Plane {
  constructor(orig, points){

    if(points.length < 3)
      throw new Error("Not enough points for a plane");

    const normal = points[1].sub(points[0]).cross(points[2].sub(points[0])).unit;

    for(let i = 3; i < points.length; i ++)
      if(normal.cross(points[1].sub(points[0]).cross(points[i].sub(points[0]))).abs != 0)
        throw new Error("Points do not lie on the same plane!" + i);

    super(points[0], orig, normal);

    this.points = points.concat(points[0]);
  }

  rotate(rot){
    super.rotate(rot);
    this.points = this.points.map(p => p.sub(this.orig).rotate(rot.unitNorm).add(this.orig));
  }

  intersects(ray){
    const t = super.intersects(ray)[0];
    if(t == undefined) return [];
    const cut = ray.point(t);

    const D = this.points[0].add(this.points[1]).div(2);
    const p43 = D.sub(cut);

    let intersect = 0;

    for(let p = 0; p < this.points.length - 1; p ++){

      const A = this.points[p];
      const B = this.points[p + 1];

      if(cut.equals(A)) return [t];

      const para = B.sub(A).cross(D.sub(cut));
      if(para.dot(para) == 0) continue;

      const p13 = A.sub(cut);
      const p21 = B.sub(A);

      const d1343 = p13.dot(p43);
      const d4321 = p43.dot(p21);
      const d1321 = p13.dot(p21);
      const d4343 = p43.dot(p43);
      const d2121 = p21.dot(p21);

      const denom = d2121 * d4343 - d4321 * d4321;
      if(denom == 0) continue;

      const ma = (d1343 * d4321 - d1321 * d4343) / denom;
      if(ma <= 0 || ma >= 1) continue;

      const mb = (d1343 + d4321 * ma) / d4343;
      if(mb <= 0) continue;

      // one might think that
      // A.add(B.sub(A).mul(ma)).equals(cut.add(D.sub(cut).mul(mb)))
      // -test is needed, but cut lies on the same plane,
      // therefore no need

      intersect ++;

    }

    if(intersect % 2) return [t];
    return [];
  }
}

class ComposedShape extends Shape {
  constructor(cords, orig, shapes){
    super(cords, orig);
    shapes.forEach(shape => shape.orig = cords);
    this.shapes = shapes;
  }

  rotate(rot){
    super.rotate(rot);
    this.shapes.forEach(shape => {
      shape.cords = shape.cords.add(this.cords.sub(shape.orig));
      shape.orig = this.cords;
    });
    this.shapes.forEach(shape => shape.rotate(rot));
  }

  intersects(ray){
    const ts = [];
    this.shapes.forEach(shape => ts.push(...shape.intersects(ray)));
    return ts;
  }

  surface(ray, point){
    for(const shape of this.shapes){
      const t = Math.min(...shape.intersects(ray));
      if(t == undefined) continue;
      if(ray.point(t).equals(point)) return shape.surface(ray, point);
    }
    const l = ray.dir.mul(- 1);
    let a = new Vec3D(1, 0, 0);
    if(a.dot(l) == 0) a = new Vector(0, 1, 0);
    return l.cross(a);
  }
}

class Parallelepiped extends ComposedShape {
  constructor(cords, orig, p, q, r){

    const shapes = [
      new Parallelogram(cords, null, p, q),
      new Parallelogram(cords, null, q, r),
      new Parallelogram(cords, null, r, p),
      new Parallelogram(cords.add(r), null, p, q),
      new Parallelogram(cords.add(p), null, q, r),
      new Parallelogram(cords.add(q), null, r, p)
    ];
    super(cords, orig, shapes);
  }
}

module.exports = { Sphere, Parallelogram, Disc, Polygon, Plane, Parallelepiped };