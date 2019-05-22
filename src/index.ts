export interface DataPacket_0V0 { version:string, ts:Date }
export interface DataPacket_0V1 { version:string, ts:Date, nsensors:number, sensors:Array<Sensor_V1>, header_data_size:number, sensor_data_size:number }
export interface Sensor_V1 { addr:number, name:string, vbus:number, temp_ext:number, temp_int:number, hum_int:number, offset:XYZ, scale:XYZ, clock_precision:number, samples:Array<XYZ> }
export interface XYZ { x:number, y:number, z:number }
export enum DataPacketVersion { Unknown = "?", DP0V0 = "0V0", DP0V1 = "0V1" }

export class DataPacket<T> {
    private ts:Date;
    private version:string; 
    private valid = false;
    private value:T = null;
    constructor(public DataSource:DataView, public Version:DataPacketVersion) {
        this.ts = new Date(DataSource.getUint32(0) * 1000);
        this.version = DataSource.getUint8(4) + "V" + DataSource.getUint8(5);
        switch(this.version) {
            case "0V0": this.value = this.parse_0V0(DataSource); break;
            case "0V1": this.value = this.parse_0V1(DataSource); break;
        }
        this.valid = !!this.value && (Version===this.version || Version===DataPacketVersion.Unknown);
    }
    get Value():T { return this.value; }
    get Valid():boolean { return this.valid; }
    get TS():Date { return this.ts; }
    
    // ---------------------------------

    private parse_0V0(buffer: DataView): T {
        let rv:DataPacket_0V0 = { ts:this.ts, version:this.version };
        return <T>(<any>rv);
    } 
    private parse_0V1(dv: DataView): T {
        const digit = 0.076;
        const samples_per_sensor = 50
        try {
            let rv:DataPacket_0V1 = { header_data_size:7, sensor_data_size:320, ts:this.ts, version:this.version, nsensors:dv.getUint8(6), sensors:[] };

            if(dv.byteLength!==(rv.header_data_size + rv.sensor_data_size*rv.nsensors)) throw new Error("Invalid data size");

            for (let i = 0; i < rv.nsensors; i++) {

                const offset = rv.header_data_size + i * rv.sensor_data_size;
                const addr = dv.getUint8(offset);
                const vbus = dv.getInt16(offset + 1)/100; 
                const temp_ext = dv.getInt16(offset + 3)/100;
                const temp_int = dv.getInt16(offset + 5)/100; // this.decimal(dv.getInt16(offset + 5) / 256 + 25, 2)
                const hum_int = dv.getInt16(offset + 7)/100;
                const scale: XYZ = { x: dv.getInt8(offset + 15), y: dv.getInt8(offset + 16), z: dv.getInt8(offset + 17) };

                const s: Sensor_V1 = {
                    name: addr>128 ? "SX" + (addr-128) : "DX" + addr,
                    addr, vbus, temp_ext, temp_int, hum_int,
                    offset: { x: dv.getInt16(offset + 9) * digit, y: dv.getInt16(offset + 11) * digit, z: dv.getInt16(offset + 13) * digit },
                    scale,
                    clock_precision: dv.getUint16(offset + 18) / 100,
                    samples: this.parseXYZ(dv, offset + 20, samples_per_sensor, scale, digit/2048)
                };
                
                rv.sensors.push(s)  
            }

            return <T>(<any>rv);
        }
        catch(err) {
            console.error(err);
            return null;
        }
    } 

    private parseXYZ(dv:DataView, offset:number, nofs:number, scale:XYZ, digit:number ): Array<XYZ> {
        const rv: Array<XYZ> = [];
        for (let i = 0; i < nofs; i++) {
            rv.push({
                x: dv.getInt16(offset + i * 6) * Math.pow(2, scale.x) * digit,
                y: dv.getInt16(offset + i * 6 + 2) * Math.pow(2, scale.y) * digit,
                z: dv.getInt16(offset + i * 6 + 4) * Math.pow(2, scale.z) * digit
            });
        }
        return rv;
    }
}
