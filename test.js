/*
  This script and many more are available free online at
  The JavaScript Source!! http://javascriptsource.com
  Created by: Brian Kieffer | http://www.freewebs.com/brianjs/

  Rewritten to nodejs by /dev/null
*/


function calcmult(a2, b2, c2, d2, e2){
  const real = a2 * c2 - b2 * d2;
  const img = b2 * c2 + a2 * d2;

  if(e2 == 0){
    return real;
  } else {
    return img;
  }
}

function isquareroot(a1, b1, n1){
  const y = Math.sqrt((a1 * a1) + (b1 * b1));
  const y1 = Math.sqrt((y - a1) / 2);
  const x1 = b1 / (2 * y1);

  if(n1 == 0) return x1;
  else return y1;
}

function solve(aq, bq, cq, dq, eq){

  let aq2 = aq;
  let bq2 = bq;

  // Define Perfect Quartic Varible
  let perfect = 0;
  let perfectbiquadratic = 0;

  // The Bi-Quadratic 2 Perfect Squares that are negative test
  if(cq * cq - 4 * aq * eq == 0 && cq > 0){
    perfectbiquadratic = 1;
  }

  bq /= aq;
  cq /= aq;
  dq /= aq;
  eq /= aq;
  aq = 1;

  const f2 = cq - (3 * bq * bq / 8);
  const g2 = dq + (bq * bq * bq / 8) - (bq * cq / 2);
  const h2 = eq - (3 * bq * bq * bq * bq / 256) + (bq * bq * (cq / 16)) - (bq * dq / 4);
  const a = 1;
  const b = f2 / 2;
  const c = (f2 * f2 - (4 * h2)) / 16;
  const d = -1 * ((g2 * g2) / 64);

  if(b == 0 && c == 0 && d == 0) perfect = 1;

  // Cubic routine starts here...
  const f = (((3 * c) / a) - ((b * b) / (a * a))) / 3;
  const g = (((2 * b * b * b) / (a * a * a)) - ((9 * b * c) / (a * a)) + ((27 * d) / a)) / 27;
  const h = eval(((g * g) / 4) + ((f * f * f) / 27));
  const z = 1 / 3;
  let i, j, k, l, m, n;
  let x1term;
  let x2term;
  let x3term;
  let alreadydone = 0;
  let alreadydone2 = 0;

  let ipart = 0;
  let p = 0;
  let q = 0;
  let p2, p2ipart, qipart;
  let r = 0;
  let s = 0;

  if(h <= 0){
    const exec = 2;
    i = Math.sqrt(((g * g) / 4) - h);
    j = Math.pow(i, z);
    k = Math.acos(-1 * (g / (2 * i)));
    l = - 1 * j;
    m = Math.cos(k / 3);
    n = Math.sqrt(3) * Math.sin(k / 3);
    p = (b / (3 * a)) * -1;
    x1term = (2 * j) * Math.cos(k / 3) - (b / (3 * a));
    x2term = l * (m + n) + p;
    x3term = l * (m - n) + p;
  }

  if(h > 0){
    const exec = 1;
    const R = (-1 * (g / 2)) + Math.sqrt(h);

    let S, U;
    if(R < 0){
      S = -1 * (Math.pow((-1 * R), z));
    } else {
      S = Math.pow(R, z);
    }

    const T = (-1 * (g / 2)) - Math.sqrt(h);
    if(T < 0){
      U = -1 * (Math.pow((-1 * T), z));
    } else {
      U = Math.pow(T, z);
    }

    x1term = (S + U) - (b / (3 * a));
    x2term = (-1 * (S + U) / 2) - (b / (3 * a));
    ipart = ((S - U) * Math.sqrt(3)) / 2;
    x3term = x2term;
  }

  if(f == 0 && g == 0 && h == 0){
    if((d / a) < 0){
      x1term = (Math.pow((-1 * (d / a)), z));
      x2term = x1term;
      x3term = x1term;
    } else {
      x1term = -1 * (Math.pow((d / a), z));
      x2term = x1term;
      x3term = x1term;
    }
  }
  // ...and ends here.

  // Return to solving the Quartic.
  if(ipart == 0 && x1term.toFixed(10) == 0){
    alreadydone2 = 1;
    p2 = Math.sqrt(x2term);
    q = Math.sqrt(x3term);
    r = - g2 / (8 * p2 * q);
    s = bq2 / (4 * aq2);
  }

  if(ipart == 0 && x2term.toFixed(10) == 0 && alreadydone2 == 0 && alreadydone2 != 1){
    alreadydone2 = 2;
    p2 = Math.sqrt(x1term);
    q = Math.sqrt(x3term);
    r = - g2 / (8 * p2 * q);
    s = bq2 / (4 * aq2);
  }

  if(ipart == 0 && x3term.toFixed(10) == 0 && alreadydone2 == 0 && alreadydone2 != 1 && alreadydone2 != 2){
    alreadydone2 = 3;
    p2 = Math.sqrt(x1term);
    q = Math.sqrt(x2term);
    r = - g2 / (8 * p2 * q);
    s = bq2 / (4 * aq2);
  }

  if(alreadydone2 == 0 && ipart == 0){
    if(x3term.toFixed(10) < 0){
      alreadydone2 = 4;
      p2 = Math.sqrt(x1term);
      q = Math.sqrt(x2term);
      r = - g2 / (8 * p2 * q);
      s = bq2 / (4 * aq2);
    } else {
      alreadydone2 = 5;
      p2 = Math.sqrt(x1term.toFixed(10));
      q = Math.sqrt(x3term.toFixed(10));
      r = - g2 / (8 * p2 * q);
      s = bq2 / (4 * aq2);
    }
  }

  if(ipart != 0){
    p2 = isquareroot(x2term, ipart, 0);
    p2ipart = isquareroot(x2term, ipart, 1);
    q = isquareroot(x3term, - ipart, 0);
    qipart = isquareroot(x3term, - ipart, 1);
    const mult = calcmult(p2, p2ipart, q, qipart, 0);
    r = - g2 / (8 * mult);
    s = bq2 / (4 * aq2);
  }

  if(ipart == 0 && x2term.toFixed(10) < 0 && x3term.toFixed(10) < 0){
    x2term /= -1;
    x3term /= -1;
    p2 = 0;
    q = 0;
    p2ipart = Math.sqrt(x2term);
    qipart = Math.sqrt(x3term);
    const mult = calcmult(p2, p2ipart, q, qipart, 0);
    r = - g2 / (8 * mult);
    s = bq2 / (4 * aq2);
    ipart = 1;
  }

  if(x1term.toFixed(10) > 0 && x2term.toFixed(10) < 0 && x3term.toFixed(10) == 0 && ipart == 0){
    x2term /= -1;
    p2 = Math.sqrt(x1term);
    q = 0;
    p2ipart = 0;
    qipart = Math.sqrt(x2term);
    const mult = calcmult(p2, p2ipart, q, qipart, 0);
    const mult2 = calcmult(p2, p2ipart, q, qipart, 1);
    r = - g2 / (8 * mult);
    if(mult2 != 0){
      //var ripart = g2 / (8 * mult2);
      r = 0;
    }
    s = bq2 / (4 * aq2);
    ipart = 1;
  }

  if(x2term.toFixed(10) == 0 && x3term.toFixed(10) == 0 && ipart == 0){
    var p2 = Math.sqrt(x1term);
    var q = 0;
    var r = 0;
    var s = bq2 / (4 * aq2);
  }

  if(ipart == 0){
    return [
      eval((p2 + q + r - s).toFixed(10)),
      eval((p2 - q - r - s).toFixed(10)),
      eval((- p2 + q - r - s).toFixed(10)),
      eval((- p2 - q + r - s).toFixed(10))
    ];
  }

  if(perfect == 1) return [- bq / 4];

  if(ipart == 0 && x2term.toFixed(10) < 0 && x3term.toFixed(10) < 0){
    x2term /= -1
    x3term /= -1;
    var p2 = 0;
    var q = 0;
    var p2ipart = Math.sqrt(x2term);
    var qipart = Math.sqrt(x3term);
    var mult = calcmult(p2, p2ipart, q, qipart, 0);
    var r = - g2 / (8 * mult);
    var s = bq2 / (4 * aq2);
    var ipart = 1;
  }

  if(x1term.toFixed(10) > 0 && x2term.toFixed(10) < 0 && x3term.toFixed(10) == 0 && ipart == 0){
    x2term /= -1;
    var p2 = Math.sqrt(x1term);
    var q = 0;
    var p2ipart = 0;
    var qipart = Math.sqrt(x2term);
    var mult = calcmult(p2, p2ipart, q, qipart, 0);
    var mult2 = calcmult(p2, p2ipart, q, qipart, 1);
    var r = - g2 / (8 * mult);
    if(mult2 != 0){
      //var ripart = g2/(8*mult2);
      var r = 0;
    }
    var s = bq2 / (4 * aq2);
    var ipart = 1;
  }

  if(x2term.toFixed(10) == 0 && x3term.toFixed(10) == 0 && ipart == 0){
    var p2 = Math.sqrt(x1term);
    var q = 0;
    var r = 0;
    var s = bq2 / (4 * aq2);
  }

  if(ipart != 0){

    return [
      [
        eval((p2 + q + r - s).toFixed(10)),
        eval((p2ipart + qipart).toFixed(10))
      ],
      [
        eval((p2 - q - r - s).toFixed(10)),
        eval((p2ipart - qipart).toFixed(10))
      ],
      [
        eval((- p2 + q - r - s).toFixed(10)),
        eval((- p2ipart + qipart).toFixed(10))
      ],
      [
        eval((- p2 - q + r - s).toFixed(10)),
        eval((- p2ipart - qipart).toFixed(10))
      ]
    ].filter(n => !n[1]).map(n => n[0]);
  }

  if(perfectbiquadratic == 1) return [];

  return [];
}

console.log(solve(1, 4, 2, -3, 1).filter((a,b,c) => c.indexOf(a) == b));

