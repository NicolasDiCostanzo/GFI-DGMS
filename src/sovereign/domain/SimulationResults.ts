import { MapColor } from './constants/MapColors';

export interface SimulationResults {
    readonly fundingProgress: number;
    readonly additionalJobs: number;
    readonly additionalCO2Tonnes: number;
    readonly isOverTarget: boolean;
    readonly colorHex: MapColor;
}
