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

    this.orig = new Vector(0, 0, 0);
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

  setOrig(point){
    this.orig = point;
    return this;
  }
}

class Sphere extends Body {
  constructor(x, y, z, r){
    super(x, y, z);

    this.r = r;
  }

  intersect(P, U){
    P = P.sub(this.orig).rotate(this.pitch, this.roll, this.yaw) //.sub(this.orig);
    U = U.rotate(this.pitch, this.roll, this.yaw);

    const Q = P.add(this.orig);

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
    //return (theta > Math.PI / 2) ? (theta * 2 - Math.PI) : 0;
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
    P = P.rotate(this.pitch, this.roll, this.yaw).sub(this.orig);
    U = U.rotate(this.pitch, this.roll, this.yaw);

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

    //return (theta > Math.PI / 2) ? (theta * 2 - Math.PI) : 0;
    return theta;
  }
}

class Disc extends Body {
  constructor(x, y, z, r){
    super(x, y, z);

    this.r = r;
  }

  intersect(P, U){
    P = P.rotate(this.pitch, this.roll, this.yaw).sub(this.orig);
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
    //return (theta > Math.PI / 2) ? (theta * 2 - Math.PI) : 0;
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
    P = P.rotate(this.pitch, this.roll, this.yaw).sub(this.orig);
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
    //return (theta > Math.PI / 2) ? (theta * 2 - Math.PI) : 0;
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
    P = P.rotate(this.pitch, this.roll, this.yaw).sub(this.orig);
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
    //return (theta > Math.PI / 2) ? (theta * 2 - Math.PI) : 0;
    return theta;
  }
}

class Plane extends Body {
  constructor(x, y, z, points){
    super(x, y, z);

    if(points.length < 3)
      throw new Error("Not enough points for a plane");

    this.points = points;
    const ps = points.map(p => p.sub(points[0]));
    const N = unitVector(ps[1].sub(ps[0]).cross(ps[2].sub(ps[0])));
    this.N = N;
    for(let i = 3; i < ps.length; i ++)
      if(N.cross(ps[1].sub(ps[0]).cross(ps[i].sub(ps[0]))).a != 0)
        throw new Error("Points do not lie on the same plane!");

    /*
    const U = unitVector(ps[1].sub(ps[0]));
    const V = U.cross(N);
    const v = ps[0].add(V);
    const u = ps[0].add(U);
    const n = ps[0].add(N);

    const S = [
      [ps[0].x, u.x, v.x, n.x],
      [ps[0].y, u.y, v.y, n.y],
      [ps[0].z, u.z, v.z, n.z],
      [1,       1,   1,   1  ]
    ];
    const iS = [
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null]
    ];


    let L = 4;
    function getCofactor(A, temp, p, q, n){
      let i = 0, j = 0;
      for(let row = 0; row < n; row ++)
        for(let col = 0; col < n; col ++)
          if(row != p && col != q){
            temp[i][j ++] = A[row][col];
            if(j == n - 1){
              j = 0;
              i++;
            }
          }
    }
    function determinant(A, n){
      let D = 0;
      if(n == 1)
        return A[0][0];
      let temp = new Array(L);
      for(let i = 0; i < L; i ++)
        temp[i] = new Array(L);
      let sign = 1;
      for(let f = 0; f < n; f++){
        getCofactor(A, temp, 0, f, n);
        D += sign * A[0][f] * determinant(temp, n - 1);
        sign = - sign;
      }
      return D;
    }

    function adjoint(A, adj){
      if(L == 1){
        adj[0][0] = 1;
        return;
      }
      let sign = 1;
      let temp = new Array(L);
      for(let i = 0; i < L; i ++)
        temp[i]=new Array(L);

      for(let i = 0; i < L; i++){
        for(let j = 0; j < L; j++){
          getCofactor(A, temp, i, j, L);
          sign = ((i + j) % 2 == 0) ? 1 : -1;
          adj[j][i] = sign * determinant(temp, L - 1);
        }
      }
    }
    let det = determinant(S, L);
    if(det == 0)
      throw new Error("Singular matrix");
    let adj = new Array(L);
    for(let i = 0; i < L; i ++)
      adj[i] = new Array(L);
    adjoint(S, adj);
    for (let i = 0; i < L; i ++)
      for (let j = 0; j < L; j ++)
        iS[i][j] = adj[i][j] / det;

    console.log({ S, iS, points });

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

    this.tf = p => new Vector(
      p.x * M[0][0] + p.y * M[1][0] + p.z * M[2][0] + M[3][0],
      p.x * M[0][1] + p.y * M[1][1] + p.z * M[2][1] + M[3][1],
      p.x * M[0][2] + p.y * M[1][2] + p.z * M[2][2] + M[3][2]
    );

    this.ps = ps.map(p => this.tf(p));
    console.log({ M, "ps": this.ps });
    */


    /*
    const Nq = Math.sqrt(N.x ** 2 + N.y ** 2);

    const Rz = [
      [  N.x / Nq, N.y / Nq, 0],
      [- N.y / Nq, N.x / Nq, 0],
      [0,          0,        1]
    ];

    this.tf = p => {
      const pd = new Vector(
        p.x * Rz[0][0] + p.y * Rz[1][0] + p.z * Rz[2][0],
        p.x * Rz[0][1] + p.y * Rz[1][1] + p.z * Rz[2][1],
        p.x * Rz[0][2] + p.y * Rz[1][2] + p.z * Rz[2][2]
      );

      const Ry = [
        [pd.z, 0, - pd.x],
        [0,    1, 0     ],
        [pd.x, 0, pd.z  ]
      ];

      return new Vector(
        pd.x * Ry[0][0] + pd.y * Ry[1][0] + pd.z * Ry[2][0],
        pd.x * Ry[0][1] + pd.y * Ry[1][1] + pd.z * Ry[2][1],
        pd.x * Ry[0][2] + pd.y * Ry[1][2] + pd.z * Ry[2][2]
      )
    };

    this.ps = ps.map(p => this.tf(p));
    */


    /*
    const nZ = N;

    let nX = nZ.cross(new Vector(1, 0, 0));
    if(nX.a != 0)
      nX = unitVector(nX);
    else
      nX = unitVector(nZ.cross(new Vector(0, 1, 0)));
    const nY = unitVector(nZ.cross(nX));

    this.tf = p => new Vector(
      p.x * nX.x + p.y * nY.x + p.z * nZ.x,
      p.x * nX.y + p.y * nY.y + p.z * nZ.y,
      p.x * nX.z + p.y * nY.z + p.z * nZ.z
    );

    this.ps = ps.map(p => this.tf(p));
    */

    /*if(N.cross(new Vector(0, 0, 1)).a == 0)
      this.tf = p => p;
    else if(N.cross(new Vector(0, 1, 0)).a == 0)
      this.tf = p => new Vector(p.x, p.z, 0);
    else if(N.cross(new Vector(1, 0, 0)).a == 0)
      this.tf = p => new Vector(p.z, p.y, 0);
    else*/ {

      const ex = unitVector(ps[0].sub(ps[1]));
      const ez = unitVector(new Vector(
        (ps[2].z - ps[0].z) * ex.y - (ps[2].y - ps[0].y) * ex.z,
        (ps[2].x - ps[0].x) * ex.z - (ps[2].z - ps[0].z) * ex.x,
        (ps[2].y - ps[0].y) * ex.x - (ps[2].x - ps[0].x) * ex.y
      ));
      const ey = unitVector(new Vector(
        ez.z * ex.y - ez.y * ex.z,
        ez.x * ex.z - ez.z * ex.x,
        ez.y * ex.x - ez.z * ex.y
      ));
      const M = [
        [ex.x, ex.y, ex.z],
        [ey.x, ey.y, ey.z],
        [ez.x, ez.y, ez.z]
      ];

      this.tf = p => new Vector(
        p.x * M[0][0] + p.y * M[1][0] + p.z * M[2][0],
        p.x * M[0][1] + p.y * M[1][1] + p.z * M[2][1],
        p.x * M[0][2] + p.y * M[1][2] + p.z * M[2][2]
      );

    }

    this.ps = ps.map(p => this.tf(p));

    this.orig = points[0];

    //console.log({ "ps": this.ps, N, ex });

  }

  intersect(P, U){
    P = P.rotate(this.pitch, this.roll, this.yaw).sub(this.orig);
    U = U.rotate(this.pitch, this.roll, this.yaw);
    const N = this.N;

    const denom = N.dot(U);
    if(Math.abs(denom) > 1e-7){
      const D = new Vector(0, 0, 0).sub(P);
      const t = D.dot(N) / denom;
      if(t < 0) return [false, null];
      let S = P.add(U.mul(t));

      const M = this.T;
      S = this.tf(S);

      let intersect = 0;

      const ps = this.ps.concat(this.ps[0]);
      for(let p = 0; p < this.ps.length; p ++){

        const A = ps[p];
        const B = ps[p + 1];

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

    const N = new Vector(0, 0, 1).rotate(this.pitch, this.roll, this.yaw);
    const V = unitVector(L.sub(S));
    const theta = Math.acos(V.dot(N) / (V.a * N.a));
    return (theta > Math.PI / 2) ? (theta * 2 - Math.PI) : 0;
    //return theta;
  }

}

class Model extends Body {
  constructor(x, y, z, [bodies]){
    super(x, y, z);
  }

  rot(pitch, roll, yaw){
    this.bodies.forEach(b => b.rot(pitch, roll, yaw));
    return this;
  }
}

module.exports = { Sphere, Donut, Disc, RectPlane, Plane, Box };