/*

  x - Front
  y - Right
  z - Up

*/

const { Sphere, Parallelogram, Disc, Polygon, Plane, Parallelepiped } = require("./body.js");
const { Vec3D, Quat } = require("./math.js");
const { Camera, Screen, LightSource } = require("./graphics.js");
const { Keys, KeyListener, IOTools } = require("./keyboard.js");
const { World } = require("./world.js");
const { Ticker, TickPhase, ProgressTickPhase } = require("./tick.js");

(async () => {

  const shapes = [
    // floor
    new Plane(new Vec3D(0, 0, 0), null, new Vec3D(0, 0, 1)),

    new Sphere(
      new Vec3D(30, 0, 2), null, 2
    )
  ];

  const lights = [
    new LightSource(new Vec3D(- 10, 10, 10))
  ];

  const world = new World();
  world.addObjects(...shapes, ...lights);

  const camera = new Camera(2, 2, 60, world);

  const screen = new Screen(50, 50);
  screen.setCamera(camera);

  const listener = new KeyListener();
  const ticker = new Ticker(1);

  ticker.addPhase(new TickPhase(userPhase));
  ticker.addPhase(new ProgressTickPhase(workingPhase));
  ticker.addPhase(new TickPhase(renderPhase));

  listener.start();
  ticker.start();
  IOTools.cursor(false);

  let fps = 0;

  async function userPhase(ticks){

    const key = listener.getKey();
    if(key == null) return;

    if(key.key == Keys.W) camera.moveLocal(new Vec3D(0.5, 0, 0));
    if(key.key == Keys.S) camera.moveLocal(new Vec3D(- 0.5, 0, 0));
    if(key.key == Keys.A) camera.moveLocal(new Vec3D(0, - 0.5, 0));
    if(key.key == Keys.D) camera.moveLocal(new Vec3D(0, 0.5, 0));

    if(key.key == Keys.Q) camera.rotate(new Quat(- 0.05, new Vec3D(0, 0, 1)));
    if(key.key == Keys.E) camera.rotate(new Quat(0.05, new Vec3D(0, 0, 1)));

    if(key.key == Keys.X){
      ticker.stop();
      listener.stop();
      IOTools.cursor(true);
    }
  }

  async function workingPhase(ticks){ }

  async function renderPhase(ticks){

    const frame = screen.render();

    fps ++;
    setTimeout(() => { fps --; }, 1000);

    process.stdout.write(
      "\x1b[H\x1b[2J\x1b[3J" +
      frame + "\n" +
      "FPS: " + fps + "\n" +
      "Ticks Skipped: " + (ticks - 1) + "\n" +
      "Cords: " + camera.cords.x + " " + camera.cords.y + " " + camera.cords.z + "\n" +
      "World Objects: " + world.objects.length + "\n"
    );
  }

})();
