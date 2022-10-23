class Ticker {
  constructor(delay){
    this.delay = delay;
    this.running = false;

    this.ticking = false;
    this.ticks = 0;

    this.phases = [];
  }

  addPhase(phase){
    this.phases.push(phase);
  }

  start(){
    if(this.running) return;
    this.running = true;

    this.interval = setInterval(() => this.tick(), this.delay);
  }

  stop(){
    clearInterval(this.interval);
    this.running = false;
  }

  async tick(){
    this.ticks ++;
    if(this.ticking) return;
    this.ticking = true;
    const ticks = this.ticks;
    this.ticks = 0;

    for(const p of this.phases){
      await p.run(ticks);
    }
    this.ticking = false;
  }
}

class TickPhase {
  constructor(runner){
    this.runner = runner;
  }
  async run(ticks){
    await this.runner(ticks);
  }
}

class ProgressTickPhase extends TickPhase {
  constructor(runner){
    super(runner);
  }
  async run(ticks){
    for(let i = 0; i < ticks; i ++){
      await this.runner(ticks);
    }
  }
}

module.exports = { Ticker, TickPhase, ProgressTickPhase };
