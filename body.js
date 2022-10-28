const { solveQuartic, Vec3D, Ray, Quat } = require("./math.js");
const { Movable } = require("./world.js");
const { RadialCollider, PlaneCollider, PointsCollider } = require("./collision.js");

class Shape extends Movable {
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
}

class ImplicitShape extends Shape {
  constructor(cords, orig){
    super(cords, orig);
  }
}

class Sphere extends ImplicitShape {
  collider = RadialCollider;

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
        Math.round(
          ((- b + Math.sqrt(D)) / (2 * a)) * 1e7) / 1e7,
        Math.round(
          ((- b - Math.sqrt(D)) / (2 * a)) * 1e7) / 1e7
      ];
    } else if(D == 0){
      return [Math.round((- b / (2 * a)) * 1e7) / 1e7];
    } else return [];
  }

  surface(ray, point){
    return point.sub(this.cords).unit;
  }

  inside(point){
    return point.sub(this.cords).abs < this.radius;
  }
}

class Plane extends ImplicitShape {
  collider = PlaneCollider;

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

  inside(point){
    return !point.sub(this.cords).dot(this.normal);
  }
}

class Parallelogram extends Plane {
  collider = PointsCollider;

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

    if(this.inside(ray.point(t)))
      return [t];
    return [];
  }

  inside(point){
    const o = point.sub(this.cords);

    const pn = this.p.cross(this.normal).unit;
    const po = pn.mul(this.q.dot(pn));

    const qn = this.q.cross(this.normal).unit;
    const qo = qn.mul(this.p.dot(qn));

    return (
      0 <= o.dot(po) && o.dot(po) <= po.dot(po) &&
      0 <= o.dot(qo) && o.dot(qo) <= qo.dot(qo)
    );
  }

  get points(){
    return [
      this.cords,
      this.cords.add(this.p),
      this.cords.add(this.q),
      this.cords.add(this.p).add(this.q)
    ];
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

    if(this.inside(ray.point(t)))
      return [t];
    return [];
  }

  inside(point){
    return point.sub(this.cords).abs <= this.radius;
  }
}


class Polygon extends Plane {
  collider = PointsCollider;

  constructor(orig, points){

    if(points.length < 3)
      throw new Error("Not enough points for a plane");

    const normal = points[1].sub(points[0]).cross(
      points[2].sub(points[0])).unit;

    for(let i = 3; i < points.length; i ++)
      if(normal.cross(
        points[1].sub(points[0]).cross(
          points[i].sub(points[0]))).abs != 0)
        throw new Error("Points do not lie on the same plane!" + i);

    super(points[0], orig, normal);

    this.points = points;
  }

  rotate(rot){
    super.rotate(rot);
    this.points = this.points.map(p =>
      p.sub(this.orig).rotate(rot.unitNorm).add(this.orig));
  }

  intersects(ray){
    const t = super.intersects(ray)[0];
    if(t == undefined) return [];

    if(this.inside(ray.point(t)))
      return [t];
    return [];
  }

  inside(point){
    const D = this.points[0].add(this.points[1]).div(2);
    const p43 = D.sub(point);

    let intersect = 0;

    for(let p = 0; p < this.points.length; p ++){

      const A = this.points[p];
      const B = this.points[(p + 1) % this.points.length];

      if(cut.equals(A)) return [t];

      const para = B.sub(A).cross(p43);
      if(para.dot(para) == 0) continue;

      const p13 = A.sub(point);
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

    return !!(intersect % 2);
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
      shape.rotate(rot);
    });
  }

  moveGlobal(vec){
    super.moveGlobal(vec);
    this.shapes.forEach(shape => {
      shape.moveGlobal(vec);
      shape.orig = this.cords;
    });
  }

  intersects(ray){
    const ts = [];
    this.shapes.forEach(shape => ts.push(...shape.intersects(ray)));
    return ts;
  }

  surface(ray, point){
    for(const shape of this.shapes){
      const t = Math.min(...shape.intersects(ray));
      if(t == Infinity) continue;
      if(ray.point(t).equals(point)) return shape.surface(ray, point);
    }
    const l = ray.dir.mul(- 1);
    let a = new Vec3D(1, 0, 0);
    if(a.dot(l) == 0) a = new Vector(0, 1, 0);
    return l.cross(a);
  }
}

class Parallelepiped extends ComposedShape {
  collider = PointsCollider;

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

    this.p = p;
    this.q = q;
    this.r = r;
  }

  rotate(rot){
    super.rotate(rot);

    this.p = this.p.rotate(rot.unitNorm);
    this.q = this.q.rotate(rot.unitNorm);
    this.r = this.r.rotate(rot.unitNorm);
  }

  inside(point){
    const s = point.sub(this.cords);

    const u = this.p.cross(this.q);
    const v = this.q.cross(this.r);
    const w = this.r.cross(this.p);

    const p = (a, b) => {
      if(a == 0) return true;
      if(a * b > 0)
        return Math.abs(a) <= Math.abs(b);
      return false;
    };

    return (
      p(u.dot(s), u.dot(this.r)) &&
      p(v.dot(s), v.dot(this.p)) &&
      p(w.dot(s), w.dot(this.q))
    );
  }

  get points(){
    return [
      this.cords,
      this.cords.add(this.p),
      this.cords.add(this.q),
      this.cords.add(this.r),
      this.cords.add(this.p).add(this.q),
      this.cords.add(this.q).add(this.r),
      this.cords.add(this.r).add(this.p),
      this.cords.add(this.p).add(this.q).add(this.r)
    ];
  }
}

module.exports = { Sphere, Parallelogram, Disc, Polygon, Plane, Parallelepiped };
