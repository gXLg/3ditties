class Vector {
  constructor(x, y, z){
    this.x = x;
    this.y = y;
    this.z = z;
  }

  get a(){
    return Math.sqrt(
      this.x * this.x +
      this.y * this.y +
      this.z * this.z
    );
  }

  dot(vector){
    return (
      this.x * vector.x +
      this.y * vector.y +
      this.z * vector.z
    );
  }

  cross(vector){
    return new Vector(
      this.y * vector.z - this.z * vector.y,
      this.z * vector.x - this.x * vector.z,
      this.x * vector.y - this.y * vector.x
    );
  }

  mul(scalar){
    return new Vector(
      this.x * scalar,
      this.y * scalar,
      this.z * scalar
    );
  }

  sub(vector){
    return new Vector(
      this.x - vector.x,
      this.y - vector.y,
      this.z - vector.z
    );
  }

  add(vector){
    return new Vector(
      this.x + vector.x,
      this.y + vector.y,
      this.z + vector.z
    );
  }

  rotate(pitch, roll, yaw){

    [roll, yaw, pitch] = [pitch, roll, yaw];

    const cosa = Math.cos(yaw);
    const sina = Math.sin(yaw);

    const cosb = Math.cos(pitch);
    const sinb = Math.sin(pitch);

    const cosc = Math.cos(roll);
    const sinc = Math.sin(roll);

    const Axx = cosa * cosb;
    const Axy = cosa * sinb * sinc - sina * cosc;
    const Axz = cosa * sinb * cosc + sina * sinc;

    const Ayx = sina * cosb;
    const Ayy = sina * sinb * sinc + cosa * cosc;
    const Ayz = sina * sinb * cosc - cosa * sinc;

    const Azx = - sinb;
    const Azy = cosb * sinc;
    const Azz = cosb * cosc;

    const px = this.x;
    const py = this.y;
    const pz = this.z;

    const x = Axx * px + Axy * py + Axz * pz;
    const y = Ayx * px + Ayy * py + Ayz * pz;
    const z = Azx * px + Azy * py + Azz * pz;

    return new Vector(x, y, z);
  }
}

function unitVector(vector){
  return new Vector(
    vector.x / vector.a,
    vector.y / vector.a,
    vector.z / vector.a
  );
}

function eq(a, b){
  return Math.abs(a - b) < 0.2;
}

class Complex {
  constructor(a, b){
    // a + bi
    this.a = a ?? 0;
    this.b = b ?? 0;
  }
  polar(){
    const r = this.abs();
    const th = Math.atan(this.b / this.a);
    const ad = this.a < 0 ? 1 : (this.b < 0 ? 2 : 0)
    return [r, th + ad * Math.PI];
  }
  abs(){
    return Math.sqrt(this.a ** 2 + this.b ** 2);
  }
  pow(p){
    const [r, th] = this.polar();
    return toCartesian(r ** p, th * p);
  }
  add(a){
    if(typeof a == Complex)
      return new Complex(this.a + a.a, this.b + b.b);
    else
      return new Complex(this.a + a, this.b);
  }
  mul(m){
    return new Complex(this.a * m, this.b * m);
  }
}
function toCartesian(r, th){
  return new Complex(r * Math.cos(th), r * Math.sin(th));
}

function solveQuartic(a, b, c, d, e){

  const alpha = - (3 * b * b) / (8 * a * a) + c / a;
  const beta = (b * b * b) / (8 * a * a * a) -
    (b * c) / (2 * a * a) + d / a;
  const gamma = - (3 * b * b * b * b) / (256 * a * a * a * a) +
    (c * b * b) / (16 * a * a * a) - (b * d) / (4 * a * a) + e / a;
  if(beta == 0){
    const x1 = - b / (4 * a) + Math.sqrt(
      (- alpha + Math.sqrt(alpha ** 2 - 4 * gamma)) / 2
    );
    const x2 = - b / (4 * a) + Math.sqrt(
      (- alpha - Math.sqrt(alpha ** 2 - 4 * gamma)) / 2
    );
    const x3 = - b / (4 * a) - Math.sqrt(
      (- alpha + Math.sqrt(alpha ** 2 - 4 * gamma)) / 2
    );
    const x4 = - b / (4 * a) - Math.sqrt(
      (- alpha - Math.sqrt(alpha ** 2 - 4 * gamma)) / 2
    );
    return [x1, x2, x3, x4].filter(x => !isNaN(x));
  }

  const P = - (alpha ** 2) / 12 - gamma;
  const Q = - (alpha ** 3) / 108 +
    (alpha * gamma) / 3 - (beta ** 2) / 8;
  const R = new Complex((Q * Q) / 4 + (P * P * P) / 27).pow(0.5).add(- Q / 2);
  let U = R.pow(1 / 3).abs();

  const y = - 5 * alpha / 6 + (U ? U - P / (3 * U) : Math.cbrt(Q));
  const W = Math.sqrt(y * 2 + alpha);

  const x1 = - b / (4 * a) + (
    + W + Math.sqrt(- (3 * alpha + 2 * y + (2 * beta) / W))
  ) / 2;
  const x2 = - b / (4 * a) + (
    - W + Math.sqrt(- (3 * alpha + 2 * y - (2 * beta) / W))
  ) / 2;
  const x3 = - b / (4 * a) + (
    + W - Math.sqrt(- (3 * alpha + 2 * y + (2 * beta) / W))
  ) / 2;
  const x4 = - b / (4 * a) + (
    - W - Math.sqrt(- (3 * alpha + 2 * y - (2 * beta) / W))
  ) / 2;

  return [x1, x2, x3, x4].filter(x => !isNaN(x)).map(x => x);

}

module.exports = { solveQuartic, eq, unitVector, Vector, Complex };