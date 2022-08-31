const { Vec3D, Ray, Quat } = require("./math.js");
const { PhysicalWorldObject, AbstractWorldObject } = require("./world.js");

class LightSource extends AbstractWorldObject {
  constructor(cords){
    super(cords);
  }
}

class Camera extends AbstractWorldObject {
  constructor(width, height, fov, world){

    super(new Vec3D(0, 0, height / 2));

    this.width = width;
    this.height = height;
    this.K = width / 2 / Math.tan(Math.PI * fov / 360);

    this.world = world;
  }

  getLightLevel(cx, cy){
    const x = this.K;
    const y = cx - this.width / 2;
    const z = this.height / 2 - cy;

    const camRay = new Ray(
      new Vec3D(0, y, z).rotate(this.rotation).add(this.cords),
      new Vec3D(x, y, z).rotate(this.rotation).unit
    );

    const int = this.world.objects.filter(o => o instanceof PhysicalWorldObject)
      .map(s => {
        const i = s.intersects(camRay);
        // no intersects
        if(!i.length) return [0, NaN];
        const n = i.filter(j => j > 0);
        // all intersects behind cam
        if(!n.length) return [0, NaN];
        // cam stuck inside object
        if((n.length % 2) && (i.length - n.length)) return [- 1, Math.min(...n)];
        // usual intersects
        return [s, Math.min(...n)];
      }).filter(i => !isNaN(i[1]));

    if(!int.length) return - 2;

    const min = int.sort((a, b) => a[1] - b[1])[0];
    if(min[0] == - 1) return - 1;

    const cut = camRay.point(min[1]);

    const surface = min[0].surface(camRay, cut);
    const c = camRay.dir.mul(- 1).unit;
    const phi = Math.acos(Math.min(1, c.dot(surface) / (c.abs * surface.abs)));

    return Math.min(1, this.world.objects.filter(o => o instanceof LightSource)
      .map(light => {
        const l = cut.sub(light.cords).unit;
        const l2 = l.mul(- 1);
        const lightRay = new Ray(light.cords, l);

        const int2 = this.world.objects.filter(o => o instanceof PhysicalWorldObject)
          .map(s => {
            const i = s.intersects(lightRay);
            // no intersects
            if(!i.length) return NaN;
            // all intersects behind source
            if(!i.filter(j => j > 0).length) return NaN;
            // usual intersects
            return Math.min(...i);
          }).filter(i => !isNaN(i));

        if(!int2.length) return 0;

        const min2 = Math.min(...int2);

        if(!lightRay.point(min2).equals(cut)) return 0;

        const theta = Math.acos(Math.min(1, l2.dot(surface) / (l2.abs * surface.abs)));
        if((phi > Math.PI / 2) != (theta > Math.PI / 2)) return 0;

        return Math.abs(1 - 2 * theta / Math.PI);
        //return 4 * theta * (theta - Math.PI) / (Math.PI ** 2) + 1;
        //return 1 - Math.sin(theta);
      }).reduce((a, b) => a + b, 0));
  }

  render(x, y){
    const LEVELS = "-.,:;!?+=%&#@";
    const CUT = "/";
    const DARK = " ";

    const l = this.getLightLevel(x, y);
    return l == - 1 ? CUT : (
      l == - 2 ? DARK :
        LEVELS[Math.floor(l * (LEVELS.length - 1))]
    );
  }
}

class Screen {
  constructor(width, height){
    this.width = width;
    this.height = height;
  }

  setCamera(camera){
    this.camera = camera;
  }

  renderPixel(screenX, screenY){
    const cx = screenX * this.camera.width / this.width;
    const cy = screenY * this.camera.height / this.height;
    return this.camera.render(cx, cy);
  }

  render(){
    const rows = ["_"];
    for(let y = 0; y < this.height; y ++){
      const row = ["|"];
      for(let x = 0; x < this.width; x += 0.5)
        row.push(this.renderPixel(x, y));
      row.push("|");
      rows.push(row.join(""));
    }
    return rows.join("\n");
  }
}

module.exports = { Camera, Screen, LightSource };
