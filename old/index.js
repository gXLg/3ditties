(async () => {

  const { Sphere, Donut, Disc, RectPlane, Plane, Box } = require("./body.js");
  const { eq, unitVector, Vector } = require("./math.js");

  const light = {
    "from": [20, 40, 10],
    "power": 15
  };

  const screen = [40, 40];
  const state = ".,-~+:;!?=%&@#";
  //const state = ".-+#@";

  const bodies = [
    new RectPlane(0, 0, 200, 1000, 1000),
    new Donut(0, 0, 100, 10, 20),

    //new Sphere(0, 0, 100, 10),
    //new Box(0, 0, 100, 20, 20, 20)
    /*new Plane(0, 0, 100, [
      new Vector(- 30, - 30, - 30),
      new Vector(30, - 30, - 30),
      new Vector(0, 30, - 30)
    ]),
    new Plane(0, 0, 100, [
      new Vector(30, - 30, - 30),
      new Vector(0, 30, - 30),
      new Vector(0, 0, 30)
    ]),
    new Plane(0, 0, 100, [
      new Vector(0, 30, - 30),
      new Vector(0, 0, 30),
      new Vector(- 30, - 30, - 30)
    ]),
    new Plane(0, 0, 100, [
      new Vector(0, 0, 30),
      new Vector(- 30, - 30, - 30),
      new Vector(30, - 30, - 30)
    ])*/
    // PENIS

    //new Sphere(0, 0, 100, 17).setOrig(new Vector(- 12, - 20, 0)),
    //new Sphere(0, 0, 100, 17).setOrig(new Vector(12, - 20, 0)),
    //new Box(0, 0, 100, 20, 60, 15).setOrig(new Vector(0, 17, 0)),
    //new Box(0, 17, 100, 20, 60, 15),
    //new Sphere(0, 0, 100, 14).setOrig(new Vector(0, 40, 0))
  ];

  const fov = 50;
  const phi = Math.PI * fov / 360;
  const K = (screen[0] / 2) / Math.tan(phi);

  const pitchCycles = 5000;
  const yawCycles = 100;
  const rollCycles = 800;

  while(true){
    for(const b of [1]){
      bodies[b].rot(...[
        1 / pitchCycles * 2 * Math.PI,
        1 / rollCycles * 2 * Math.PI,
        1 / yawCycles * 2 * Math.PI
      ]);
    }
    await render();
    //break;

    //await new Promise(r => setTimeout(r, 10));
  }

  async function render(){
    const L = new Vector(...light.from);

    const rows = ["_"];
    for(let y = 0; y < screen[1]; y ++){
      const row = ["|"];
      for(let x = 0; x < screen[0]; x += 0.5){
        const ts = bodies.map(body => {

          const P = new Vector(x - screen[0] / 2, screen[1] / 2 - y, 0);
          const U = unitVector(P.sub(new Vector(0, 0, - K)));

          return [...body.intersectCam(P, K), P, U, body];
        }).filter(t => t[0]);
        const min = ts.sort((a, b) => a[1] - b[1])[0];

        if(!min) row.push(" ");
        else {
          const t = min[1];
          const P = min[2];
          const U = min[3];
          const body = min[4];

          const S1 = P.add(U.mul(t));
          const V = unitVector(S1.sub(L));

          const ts = bodies.map(body =>
            [...body.intersectL(L, V), body]
          ).filter(t => t[0]);
          const tmin = ts.sort((a, b) => a[1] - b[1])[0];

          if(!tmin) row.push(" ");
          else if(tmin[2] != body) row.push(state[0]);
          else {
            const i = tmin[1];

            const S2 = L.add(V.mul(i));
            if(eq(S1.x, S2.x) && eq(S1.y, S2.y) && eq(S1.z, S2.z)){
              const theta = body.angle(L, S1);
              const lvl = Math.floor((state.length - 1) * theta / Math.PI);
              row.push(state[lvl]);
            } else row.push(state[0]);
          }
        }
      }
      row.push("|");
      rows.push(row.join(""));
    }
    console.log(rows.join("\n"));
  }
})()