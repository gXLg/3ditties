class Key {
  constructor(key, ctrl, alt){
    this.key = key;
    this.ctrl = ctrl ?? false;
    this.alt = alt ?? false;
  }
}

const ALPHA = [
  "A", "B", "C", "D", "E",
  "F", "G", "H", "I", "J",
  "K", "L", "M", "N", "O",
  "P", "Q", "R", "S", "T",
  "U", "V", "W", "X", "Y",
  "Z"
];

const Keys = { };
[
  "UNKNOWN",
  "UP", "LEFT", "DOWN", "RIGHT",
  ...ALPHA, "SPACE",
  "HOME", "END", "ESC", "DEL",
  "N0", "N1", "N2", "N3", "N4",
  "N5", "N6", "N7", "N8", "N9"
].forEach(a => Keys[a] = a);

class KeyListener {
  constructor(){
    this.buffer = [];
  }

  start(){
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on("data", m => {
      const key = this.parseStroke(m);
      this.buffer.push(key);
    });
  }

  stop(){
    process.stdin.pause();
  }

  getKey(){
    return this.buffer.shift() ?? null;
  }

  parseStroke(stroke){
    if(stroke.length == 1){
      const s = stroke[0];
      if(s == 0) return new Key(Keys.SPACE, true);
      if(s == 27) return new Key(Keys.ESC);
      if(s == 127) return new Key(Keys.DEL);
      if(s > 0 && s < 27) return new Key(Keys[ALPHA[s - 1]], true);
      if(s > 27 && s < 32) return new Key(Keys["N" + (s - 24)], true);
      if(s == 32) return new Key(Keys.SPACE);
      if(s > 47 && s < 58) return new Key(Keys["N" + (s - 48)]);
      if(s > 64 && s < 91) return new Key(Keys[ALPHA[s - 65]]);
      if(s > 96 && s < 123) return new Key(Keys[ALPHA[s - 97]]);
    }
    if(stroke.length == 2){
      const a = stroke[0];
      const b = stroke[1];
      if(a == 27){
        const k = parseStroke([b]);
        k.alt = true;
        return k;
      }
    }
    // TODO
    // other keystrokes
    // like "UP", "DOWN" etc.
    return new Key(Keys.UNKNOWN);
  }
}

const IOTools = {
  "cursor": s => process.stdout.write("\x1b[?25" + (s ? "h" : "l")),
  "clear": () => process.stdout.write("\x1b[H\x1b[2J\x1b[3J")
}

module.exports = { Key, Keys, KeyListener, IOTools };
