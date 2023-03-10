/*

  x - Front
  y - Right
  z - Up

*/

const { Sphere, Parallelogram, Disc, Polygon, Plane, Parallelepiped, Torus } = require("./body.js");
const { Vec3D, Quat } = require("./math.js");
const { Camera, Screen, Label } = require("./graphics.js");
const { Keys, KeyListener, IOTools } = require("./keyboard.js");
const { World, WorldObject, LightObject, VisualObject } = require("./world.js");
const { Ticker, TickPhase, ProgressTickPhase } = require("./tick.js");
const { Player } = require("./player.js");

(async () => {

  const world = new World();

  const player = new Player(null, world);

  const floor = new VisualObject(
    new Plane(new Vec3D(0, 0, 0), null, new Vec3D(0, 0, 1)), world
  );

  const object = new VisualObject(
    new Torus(new Vec3D(6, 0, 2), null, 1.5, 0.2),
    world
  );

  const light = new LightObject(new Vec3D(- 10, 10, 10));

  world.addObjects(floor, light, object, player);

  const screen = new Screen(50, 50);
  screen.setCamera(player.cam);

  const fps_label = new Label(2, 2, "FPS: %");
  screen.addLabel(fps_label);
  const ticks_label = new Label(2, 4, "Ticks Skipped: %");
  screen.addLabel(ticks_label);

  const listener = new KeyListener();
  const ticker = new Ticker(1);

  ticker.addPhase(new TickPhase(userPhase));
  ticker.addPhase(new ProgressTickPhase(workingPhase));
  ticker.addPhase(new TickPhase(renderPhase));

  listener.start();
  ticker.start();
  IOTools.cursor(false);

  let fps = 0;
  let rot = "";
  async function userPhase(ticks){

    const key = listener.getKey();
    if(key == null) return;

    if(key.key == Keys.W) player.moveLocal(new Vec3D(0.5, 0, 0));
    if(key.key == Keys.S) player.moveLocal(new Vec3D(- 0.5, 0, 0));
    if(key.key == Keys.A) player.moveLocal(new Vec3D(0, - 0.5, 0));
    if(key.key == Keys.D) player.moveLocal(new Vec3D(0, 0.5, 0));

    if(key.key == Keys.Q) rot = rot == "q" ? "" : "q";
    if(key.key == Keys.E) rot = rot == "e" ? "" : "e";

    if(key.key == Keys.C) screen.setCamera(player.nextCam());

    if(key.key == Keys.I) object.moveGlobal(new Vec3D(0, 0, 0.1));
    if(key.key == Keys.J) object.moveGlobal(new Vec3D(0, 0, - 0.1));

    if(key.key == Keys.H) object.rotate(new Quat(0.05, new Vec3D(0, 0, 1)));
    if(key.key == Keys.K) object.rotate(new Quat(- 0.05, new Vec3D(0, 0, 1)));

    if(key.key == Keys.X){
      ticker.stop();
      listener.stop();
      IOTools.cursor(true);
    }
  }

  async function workingPhase(ticks){
    if(rot == "e")
      player.rotate(new Quat(0.05, new Vec3D(0, 0, 1)));
    else if(rot == "q")
      player.rotate(new Quat(- 0.05, new Vec3D(0, 0, 1)));

    object.rotate(new Quat(0.09, new Vec3D(0.2, 1, 1).unit));
  }

  async function renderPhase(ticks){

    fps_label.format(fps);
    ticks_label.format(ticks - 1);

    const frame = screen.render();

    fps ++;
    setTimeout(() => { fps --; }, 1000);

    IOTools.clear();
    process.stdout.write(
      frame + "\n" +
      "Cords: " + player.cords.x + " " + player.cords.y + " " + player.cords.z + "\n" +
      "World Objects: " + world.objects.length + "\n"
    );
  }

})();
