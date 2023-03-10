const precision = 1e5;

function round(number){
  return Math.round(number * precision) / precision;
}

class Vec3D {
  constructor(x, y, z){
    this.x = round(x);
    this.y = round(y);
    this.z = round(z);
  }

  get abs(){
    if(!this._abs){
      this._abs = round(Math.sqrt(
        this.x * this.x +
        this.y * this.y +
        this.z * this.z
      ));
    }
    return this._abs;
  }

  get unit(){
    if(!this._unit){
      this._unit = this.div(this.abs);
    }
    return this._unit;
  }

  dot(vec){
    return round(
      this.x * vec.x +
      this.y * vec.y +
      this.z * vec.z
    );
  }

  cross(vec){
    return new Vec3D(
      this.y * vec.z - this.z * vec.y,
      this.z * vec.x - this.x * vec.z,
      this.x * vec.y - this.y * vec.x
    );
  }

  mul(scalar){
    return new Vec3D(
      this.x * scalar,
      this.y * scalar,
      this.z * scalar
    );
  }

  div(scalar){
    return new Vec3D(
      this.x / scalar,
      this.y / scalar,
      this.z / scalar
    );
  }

  sub(vec){
    return new Vec3D(
      this.x - vec.x,
      this.y - vec.y,
      this.z - vec.z
    );
  }

  add(vec){
    return new Vec3D(
      this.x + vec.x,
      this.y + vec.y,
      this.z + vec.z
    );
  }

  project(vec){
    return vec.unit.mul(this.dot(vec.unit));
  }

  reject(vec){
    return this.sub(this.project(vec));
  }

  rotate(rot){
    const p = new Quat(0, this);

    const q = rot;
    const qi = q.inverse;

    return q.mul(p).mul(qi).vector;
  }

  equals(vec){
    const c = this.sub(vec);
    return c.dot(c) == 0;
  }
}

class Quat {
  constructor(scalar, vector){
    this.scalar = round(scalar);
    this.vector = vector;
  }

  get norm(){
    if(!this._norm){
      this._norm = round(
        Math.sqrt(this.scalar ** 2 + this.vector.dot(this.vector))
      );
    }
    return this._norm;
  }

  get unit(){
    if(!this._unit){
      this._unit = this.sdiv(this.norm);
    }
    return this._unit;
  }

  get unitNorm(){
    if(!this._form){
      this._form = new Quat(
        Math.cos(this.scalar / 2),
        this.vector.unit.mul(Math.sin(this.scalar / 2))
      );
    }
    return this._form;
  }

  get conjugate(){
    if(!this._conjugate){
      this._conjugate = new Quat(
        this.scalar, this.vector.mul(- 1)
      );
    }
    return this._conjugate;
  }

  get inverse(){
    if(!this._inverse){
      this._inverse = this.conjugate.sdiv(this.norm ** 2);
    }
    return this._inverse;
  }

  add(quat){
    return new Quat(
      this.scalar + quat.scalar,
      this.vector.add(quat.vector)
    );
  }

  sub(quat){
    return new Quat(
      this.scalar - quat.scalar,
      this.vector.sub(quat.vector)
    );
  }

  mul(quat){
    const s = this.scalar;
    const v = this.vector;
    return new Quat(
      s * quat.scalar - v.dot(quat.vector),
      quat.vector.mul(s).add(v.mul(quat.scalar)).add(v.cross(quat.vector))
    );
  }

  smul(scalar){
    return new Quat(
      this.scalar * scalar,
      this.vector.mul(scalar)
    );
  }

  sdiv(scalar){
    return new Quat(
      this.scalar / scalar,
      this.vector.div(scalar)
    );
  }
}

class Ray {
  constructor(orig, dir){
    this.orig = orig;
    this.dir = dir;
  }
  point(t){
    return this.orig.add(this.dir.mul(t));
  }
}

/*
  Following code is written by /dev/null
  from https://github.com/sasamil/Quartic/blob/master/quartic.cpp
*/

function solveCubic(a, b, c){
  const a2 = a * a;
  let q = (a2 - 3 * b) / 9;
  const r = (a * (2 * a2 - 9 * b) + 27 * c) / 54;
  const r2 = r * r;
  const q3 = q ** 3;
  let A, B;
  if(r2 < q3){
    let t = r / Math.sqrt(q3);
    if(t < -1) t = -1;
    if(t > 1) t = 1;
    t = Math.acos(t);
    const aa = a / 3;
    q = -2 * Math.sqrt(q);
    return [
      q * Math.cos(t / 3) - aa,
      q * Math.cos((t + Math.PI * 2) / 3) - aa,
      q * Math.cos((t - Math.PI * 2) / 3) - aa
    ];
  } else {
    let A = -((Math.abs(r) + Math.sqrt(r2 - q3)) ** (1/3));
    if(r < 0) A = -A;
    const B = (0 == A ? 0 : q / A);
    const aa = a / 3;
    const x0 = (A + B) - aa;
    const x1 = - (A + B) / 2 - aa;
    const x2 = Math.sqrt(3) / 2 * (A - B);
    if(round(x2) == 0) return [x0, x1];
    return [x0];
  }
}

function solveQuartic(a0, b0, c0, d0, e0){
  const a = b0 / a0;
  const b = c0 / a0;
  const c = d0 / a0;
  const d = e0 / a0;

  const a3 = - b;
  const b3 = a * c - 4 * d;
  const c3 = - a * a * d - c * c + 4 * b * d;

  // cubic resolvent
  // y^3 - b*y^2 + (ac - 4d)*y - a^2*d - c^2+4*b*d = 0

  const x3 = solveCubic(a3, b3, c3);
  let q1, q2, p1, p2, sqD, D;
  const y = x3.slice(1).reduce((a, b) => Math.abs(a) > Math.abs(b) ? a : b, x3[0]);
  D = y * y - 4 * d;
  if(round(D) == 0){
    q1 = q2 = y / 2;
    D = a * a - 4*(b-y);
    if(round(D) == 0) p1 = p2 = a / 2;
    else {
      sqD = Math.sqrt(D);
      p1 = (a + sqD) / 2;
      p2 = (a - sqD) / 2;
    }
  } else {
    sqD = Math.sqrt(D);
    q1 = (y + sqD) / 2;
    q2 = (y - sqD) / 2;
    p1 = (a * q1 - c) / (q1 - q2);
    p2 = (c - a * q2) / (q1 - q2);
  }
  const ret = [];
  // solving quadratic eq. - x^2 + p1*x + q1 = 0
  D = p1 * p1 - 4 * q1;
  if(D >= 0){
    sqD = Math.sqrt(D);
    ret.push((-p1 + sqD) / 2);
    ret.push((-p1 - sqD) / 2);
  }
  // solving quadratic eq. - x^2 + p2*x + q2 = 0
  D = p2 * p2 - 4 * q2;
  if(D >= 0){
    sqD = Math.sqrt(D);
    ret.push((-p2 + sqD) / 2);
    ret.push((-p2 - sqD) / 2);
  }
  return ret.filter((i, j, k) => k.indexOf(i) == j);
}

function clamp(num, down, up){
  return num < down ? down : (num > up ? up : num);
}

module.exports = {
  solveQuartic, solveCubic, Vec3D,
  Ray, Quat, clamp, precision
};
