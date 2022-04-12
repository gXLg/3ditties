const { solveQuartic, eq, unitVector, Vector } = require("./math.js");

class Body {
  constructor(x, y, z){
    this.x = x;
    this.y = y;
    this.z = z;

    this.M = new Vector(x, y, z);

    this.pitch = 0;
    this.roll = 0;
    this.yaw = 0;
  }

  intersectCam(P, K){
    P = P.sub(this.M);
    const U = unitVector(P.sub(new Vector(0, 0, - K).sub(this.M)));
    return this.intersect(P, U);
  }

  intersectL(L, V){
    L = L.sub(this.M);
    return this.intersect(L, V);
  }

  rot(pitch, roll, yaw){
    this.pitch = (this.pitch + (pitch ?? 0)) % (2 * Math.PI);
    this.roll = (this.roll + (roll ?? 0)) % (2 * Math.PI);
    this.yaw = (this.yaw + (yaw ?? 0)) % (2 * Math.PI);
    return this;
  }
}

class Sphere extends Body {
  constructor(x, y, z, r){
    super(x, y, z);

    this.r = r;
  }

  intersect(P, U){
    P = P.rotate(this.pitch, this.roll, this.yaw);
    U = U.rotate(this.pitch, this.roll, this.yaw);

    // formula from
    // https://math.stackexchange.com/questions/1939423/calculate-if-vector-intersects-sphere

    const Q = P.sub(new Vector(0, 0, 0));

    const a = U.dot(U);
    const b = 2 * U.dot(Q);
    const c = Q.dot(Q) - this.r * this.r;
    const d = b * b - 4 * a * c;

    if(d < 0) return [false, null];

    const t1 = (Math.sqrt(d) - b) / (2 * a);
    const t2 = (- Math.sqrt(d) - b) / (2 * a);
    const t = Math.min(t1, t2);

    return [true, t];
  }

  angle(L, S){
    L = L.sub(this.M).rotate(this.pitch, this.roll, this.yaw);
    S = S.sub(this.M).rotate(this.pitch, this.roll, this.yaw);

    const V = unitVector(L.sub(S));
    const U = unitVector(new Vector(0, 0, 0).sub(S));
    const theta = Math.acos(V.dot(U) / (V.a * U.a));
    return theta;
  }
}

class Donut extends Body {
  constructor(x, y, z, r, R){
    super(x, y, z);

    this.r = r;
    this.R = R;
  }

  intersect(P, U){
    P = P.rotate(this.pitch, this.roll, this.yaw);
    U = U.rotate(this.pitch, this.roll, this.yaw);

    // formula from
    // my head

    const a = P.x;
    const b = P.y;
    const c = P.z;
    const f = U.x;
    const g = U.y;
    const h = U.z;
    const r = this.r;
    const R = this.R;

    const j = (f ** 4)
            + (g ** 4)
            + (h ** 4)
            + 2 * (f ** 2) * (g ** 2)
            + 2 * (f ** 2) * (h ** 2)
            + 2 * (g ** 2) * (h ** 2);

    const k = 4 * a * (f ** 3)
            + 4 * b * (g ** 3)
            + 4 * c * (h ** 3)
            + 4 * a * f * (g ** 2)
            + 4 * a * f * (h ** 2)
            + 4 * b * g * (h ** 2)
            + 4 * b * (f ** 2) * g
            + 4 * c * (f ** 2) * h
            + 4 * c * (g ** 2) * h;

    const l = 8 * a * b * f * g
            + 8 * a * c * f * h
            + 8 * b * c * g * h
            + 6 * (a ** 2) * (f ** 2)
            + 6 * (b ** 2) * (g ** 2)
            + 6 * (c ** 2) * (h ** 2)
            + 2 * (a ** 2) * (g ** 2)
            + 2 * (a ** 2) * (h ** 2)
            + 2 * (b ** 2) * (f ** 2)
            + 2 * (b ** 2) * (h ** 2)
            + 2 * (c ** 2) * (f ** 2)
            + 2 * (c ** 2) * (g ** 2)
            - 2 * (f ** 2) * (R ** 2)
            - 2 * (f ** 2) * (r ** 2)
            - 2 * (g ** 2) * (R ** 2)
            - 2 * (g ** 2) * (r ** 2)
            + 2 * (h ** 2) * (R ** 2)
            - 2 * (h ** 2) * (r ** 2);

    const m = 4 * (a ** 3) * f
            + 4 * (b ** 3) * g
            + 4 * (c ** 3) * h
            + 4 * (a ** 2) * b * g
            + 4 * (a ** 2) * c * h
            + 4 * (b ** 2) * c * h
            + 4 * a * (b ** 2) * f
            + 4 * a * (c ** 2) * f
            + 4 * b * (c ** 2) * g
            - 4 * a * f * (R ** 2)
            - 4 * a * f * (r ** 2)
            - 4 * b * g * (R ** 2)
            - 4 * b * g * (r ** 2)
            + 4 * c * h * (R ** 2)
            - 4 * c * h * (r ** 2);

    const n = (a ** 4)
            + (b ** 4)
            + (c ** 4)
            + (R ** 4)
            + (r ** 4)
            + 2 * (a ** 2) * (b ** 2)
            + 2 * (a ** 2) * (c ** 2)
            - 2 * (a ** 2) * (R ** 2)
            - 2 * (a ** 2) * (r ** 2)
            + 2 * (b ** 2) * (c ** 2)
            - 2 * (b ** 2) * (R ** 2)
            - 2 * (b ** 2) * (r ** 2)
            + 2 * (c ** 2) * (R ** 2)
            - 2 * (c ** 2) * (r ** 2)
            - 2 * (R ** 2) * (r ** 2);

    const s = solveQuartic(j, k, l, m, n);
    const mi = Math.min(...s);

    if((s.length == 0) || (mi < 0)) return [false, null];
    else return [true, mi];

  }

  angle(L, S){
    L = L.sub(this.M).rotate(this.pitch, this.roll, this.yaw);
    S = S.sub(this.M).rotate(this.pitch, this.roll, this.yaw);

    const Z = new Vector(0, 0, 0);
    const P = new Vector(S.x, S.y, 0);
    const M = unitVector(P.sub(Z));
    const R = this.R;

    const a = M.x * M.x + M.y * M.y;
    const b = 2 * M.x + 2 * M.y;
    const c = - R * R;
    const t = (- b + Math.sqrt(b * b - 4 * a * c)) / (2 * a);
    const Y = new Vector(M.x * t, M.y * t, 0);

    const V = unitVector(L.sub(S));
    const U = unitVector(Y.sub(S));
    const theta = Math.acos(V.dot(U) / (V.a * U.a));

    return theta;
  }
}

class Disc extends Body {
  constructor(x, y, z, r){
    super(x, y, z);

    this.r = r;
  }

  intersect(P, U){
    P = P.rotate(this.pitch, this.roll, this.yaw);
    U = U.rotate(this.pitch, this.roll, this.yaw);

    const N = new Vector(0, 0, 1);
    const M = new Vector(0, 0, 0);

    const denom = N.dot(U);
    if(Math.abs(denom) > 1e-7){
      const D = M.sub(P);
      const t = D.dot(N) / denom;
      if(t >= 0){
        const Q = P.add(U.mul(t));
        const V = Q.sub(M);
        if(V.dot(V) <= this.r ** 2)
          return [true, t];
      }
    }
    return [false, null];
  }

  angle(L, S){
    L = L.sub(this.M).rotate(this.pitch, this.roll, this.yaw);
    S = S.sub(this.M).rotate(this.pitch, this.roll, this.yaw);

    const N = new Vector(0, 0, 1).rotate(this.pitch, this.roll, this.yaw);
    const V = unitVector(L.sub(S));
    const theta = Math.acos(V.dot(N) / (V.a * N.a));
    return theta;
  }
}

class RectPlane extends Body {
  constructor(x, y, z, a, b){
    super(x, y, z);

    this.a = a;
    this.b = b;
  }

  intersect(P, U){
    P = P.rotate(this.pitch, this.roll, this.yaw);
    U = U.rotate(this.pitch, this.roll, this.yaw);

    const N = new Vector(0, 0, 1);
    const M = new Vector(0, 0, 0);

    const denom = N.dot(U);
    if(Math.abs(denom) > 1e-7){
      const D = M.sub(P);
      const t = D.dot(N) / denom;
      if(t >= 0){
        const Q = P.add(U.mul(t));
        const V = Q.sub(M);
        if(Math.abs(V.x) < this.a / 2 && Math.abs(V.y) < this.b / 2)
          return [true, t];
      }
    }
    return [false, null];
  }

  angle(L, S){
    L = L.sub(this.M).rotate(this.pitch, this.roll, this.yaw);
    S = S.sub(this.M).rotate(this.pitch, this.roll, this.yaw);

    const N = new Vector(0, 0, 1).rotate(this.pitch, this.roll, this.yaw);
    const V = unitVector(L.sub(S));
    const theta = Math.acos(V.dot(N) / (V.a * N.a));
    return theta;
  }
}

class Box extends Body {
  constructor(x, y, z, a, b, c){
    super(x, y, z);

    this.a = a;
    this.b = b;
    this.c = c;
  }

  intersect(P, U){
    P = P.rotate(this.pitch, this.roll, this.yaw);
    U = U.rotate(this.pitch, this.roll, this.yaw);

    const bounds = [
      new Vector(- this.a / 2, - this.b / 2, - this.c / 2),
      new Vector(this.a / 2, this.b / 2, this.c / 2)
    ];
    let tmin = (bounds[(U.x < 0) - 0].x - P.x) / U.x;
    let tmax = (bounds[1 - (U.x < 0)].x - P.x) / U.x;
    let tymin = (bounds[(U.y < 0) - 0].y - P.y) / U.y;
    let tymax = (bounds[1 - (U.y < 0)].y - P.y) / U.y;

    if((tmin > tymax) || (tymin > tmax))
      return [false, null];
    if(tymin > tmin)
      tmin = tymin;
    if(tymax < tmax)
      tmax = tymax;

    let tzmin = (bounds[(U.z < 0) - 0].z - P.z) / U.z;
    let tzmax = (bounds[1 - (U.z < 0)].z - P.z) / U.z;

    if((tmin > tzmax) || (tzmin > tmax))
      return [false, null];
    if(tzmin > tmin)
      tmin = tzmin;
    if(tzmax < tmax)
      tmax = tzmax;

    if(tmin < 0) return [false, null];
    return [true, tmin];
  }

  angle(L, S){
    L = L.sub(this.M).rotate(this.pitch, this.roll, this.yaw);
    S = S.sub(this.M).rotate(this.pitch, this.roll, this.yaw);

    const V = unitVector(L.sub(S));
    const U = unitVector(new Vector(0, 0, 0).sub(S));
    const theta = Math.acos(V.dot(U) / (V.a * U.a));
    return theta;
  }
}

class Plane extends Body {
  constructor(x, y, z, points){
    super(x, y, z);

    if(points.length < 3)
      throw new Error("Not enough points for a plane");

    const ps = points.map(p => p.sub(points[0]));
    const N = unitVector(ps[1].cross(ps[2]));
    for(let i = 3; i < ps.length; i ++)
      if(N.cross(ps[1].cross(ps[i])).a != 0)
        throw new Error("Points do not lie on the same plane!");

    const V = unitVector(ps[1]).cross(N);

    const S = [
      [0, ps[1].x, V.x, N.x],
      [0, ps[1].y, V.y, N.y],
      [0, ps[1].z, V.z, N.z],
      [1, 1,       1,   1  ]
    ];
    const dS = - (
      S[0][1] * S[1][2] * S[2][3] + S[0][2] * S[1][3] * S[2][1] + S[0][3] * S[1][1] * S[2][2] -
      S[0][3] * S[1][2] * S[2][1] - S[0][2] * S[1][1] * S[2][3] - S[0][1] * S[1][3] * S[2][2]
    );
    const aS = [
      [
        S[1][1] * S[2][2] * S[3][3] + S[1][2] * S[2][3] * S[3][1] + S[1][3] * S[2][1] * S[3][2] -
        S[1][3] * S[2][2] * S[3][1] - S[1][2] * S[2][1] * S[3][3] - S[1][1] * S[2][3] * S[3][2],

        S[0][3] * S[2][2] * S[3][1] + S[0][2] * S[2][1] * S[3][3] + S[0][1] * S[2][3] * S[3][2] -
        S[0][1] * S[2][2] * S[3][3] - S[0][2] * S[2][3] * S[3][1] - S[0][3] * S[2][1] * S[3][2],

        S[0][1] * S[1][2] * S[3][3] + S[0][2]
      ],
      [
      ],
      [
      ],
      [
      ]
    ];
    const D = [
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1]
      [1, 1, 1, 1]
    ];
    const M = [
      [
        iS[1][0], iS[1][1], iS[1][2], iS[1][3]
      ],
      [
        iS[2][0], iS[2][1], iS[2][2], iS[2][3]
      ],
      [
        iS[3][0], iS[3][1], iS[3][2], iS[3][3]
      ],
      [
        iS[0][0] + iS[1][0] + iS[2][0] + iS[3][0],
        iS[0][1] + iS[1][1] + iS[2][1] + iS[3][1],
        iS[0][2] + iS[1][2] + iS[2][2] + iS[3][2],
        iS[0][3] + iS[1][3] + iS[2][3] + iS[3][3]
      ]
    ];


    this.points = ps.map(
      //p => new Vector(p.sub(orig).dot(unitVector(new Vector(1, 1, 0))), p.z - orig.z, 0)
      
    );
    console.log(this.points);
    this.N = new Vector(0, 0, 1);
  }

  intersect(P, U){
    P = P.rotate(this.pitch, this.roll, this.yaw);
    U = U.rotate(this.pitch, this.roll, this.yaw);
    const N = this.N;

    const denom = N.dot(U);
    if(Math.abs(denom) > 1e-7){
      const D = new Vector(0, 0, 0).sub(P);
      const t = D.dot(N) / denom;
      if(t < 0) return [false, null];
      const S = P.add(U.mul(t));

      let intersect = 0;

      const points = this.points.concat(this.points[0]);
      for(let p = 0; p < this.points.length; p ++){

        const A = points[p];
        const B = points[p + 1];

        if(S.x == A.x && S.y == A.y) return [true, t];
        if((A.y > S.y) != (B.y > S.y)){
          const slope = (S.x - A.x) * (B.y - A.y) - (B.x - A.x) * (S.y - A.y);
          if(Math.abs(slope) < 1e-7) return [true, t];
          if((slope < 0) != (B.y < A.y)) intersect ++;
        }
      }
      if(intersect % 2) return [true, t];
    }
    return [false, null];
  }

  angle(L, S){
    L = L.sub(this.M).rotate(this.pitch, this.roll, this.yaw);
    S = S.sub(this.M).rotate(this.pitch, this.roll, this.yaw);

    const N = this.N.rotate(this.pitch, this.roll, this.yaw);
    const V = unitVector(L.sub(S));
    const theta = Math.acos(V.dot(N) / (V.a * N.a));
    return theta;
  }

}

module.exports = { Sphere, Donut, Disc, RectPlane, Plane, Box };