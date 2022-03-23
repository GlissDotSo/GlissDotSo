import { Simulation } from "./simulation";

export interface IActor {
    step(t: number): void;
}

export class BaseActor implements IActor {
    sim: Simulation

    constructor(sim: Simulation) {
        this.sim = sim
    }

    step(t: number) { }
}
