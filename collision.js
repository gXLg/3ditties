const { Ray } = require("./math.js");

class CollisionManager {
  static types(){
    return [RadialCollider, PlaneCollider];
  }
}

class Collider {
  constructor(a){
    this.a = a;
  }
  collides(b, vec){}
}

class RadialCollider extends Collider {
  collides(b, vec){
    const a = this.a;
    if(b instanceof RadialCollider){
      const r = a.radius + b.a.radius;
      const aa = vec.dot(vec);
      const bb = 2 * a.cords.sub(b.a.cords).dot(vec);
      const c = a.cords.sub(b.a.cords);
      const cc = c.dot(c) - r * r;

      const d = bb * bb - 4 * aa * cc;

      const x = [];
      if(d == 0) x.push(Math.round((- bb / 2 / aa) * 1e7) / 1e7);
      if(d > 0){
        x.push(Math.round(((- bb + Math.sqrt(d))/ 2 / aa) * 1e7) / 1e7);
        x.push(Math.round(((- bb - Math.sqrt(d))/ 2 / aa) * 1e7) / 1e7);
      }
      return x;
    } else if(b instanceof PlaneCollider){
      const n = b.a.normal;
      const p1 = a.cords.add(n.mul(a.radius));
      const p2 = a.cords.sub(n.mul(a.radius));
      const v1 = p1.sub(b.a.cords);
      const v2 = p2.sub(b.a.cords);
      const d1 = - v1.dot(n);
      const d2 = - v2.dot(n);
      const q = n.dot(vec);
      return [
        Math.round(d1 / q * 1e7) / 1e7,
        Math.round(d2 / q * 1e7) / 1e7
      ];
    } else if(b instanceof PointsCollider){
      return b.collides(this, vec.mul(- 1));
    }
    return [];
  }
}

class PlaneCollider extends Collider {
  collides(b, vec){
    const a = this.a;
    if(b instanceof RadialCollider){
      return b.collides(this, vec.mul(- 1));
    }
    return [];
  }
}

class PointsCollider extends Collider {
  collides(b, vec){
    const a = this.a;
    if(b instanceof RadialCollider){
      const pp = a.points;
      const ff = pp
        .map(p => [b.a.intersects(new Ray(p, vec)), b.a.inside(p)])
        .filter(p => p[0].length);
      if(!ff.length) return [];
      const dd = [];
      for(const f of ff){
        if(f[1]) return f[0];
        if(f[0].filter(i => i > 0).length) dd.push(f[0]);
      }
      if(!dd.length) return [];
      return dd.sort((a, b) => {
        Math.min(...a.filter(i => i > 0)) -
        Math.min(...b.filter(i => i > 0))
      })[0];
    }
    return [];
  }
}

module.exports = {
  RadialCollider, PlaneCollider, PointsCollider
};