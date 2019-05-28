import { DataPacket, DataPacket_0V0, DataPacket_0V1, DataPacketVersion } from ".";

class Test {
    public static async Run() {
      try {

        let hex = 'FEDE6971000101';
        hex += '01000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';
        hex += '00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';
        hex += '00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';
        hex += '0000000000000000000000000000000000000000';

        const data = Buffer.alloc(hex.length/2,hex, 'hex');
        const ab = new Uint8Array(data).buffer;
        const dv = new DataView(ab);

        const dt = new DataPacket<DataPacket_0V1>(dv,DataPacketVersion.DP_0V1);
        
        if(dt.Valid)
          console.log(JSON.stringify(dt.Value));
        else
          console.error("Dati non validi");
        
        const du = new DataPacket<any>(dv);
        if(du.Valid)
          console.log(du.Version);
        else
          console.error("Dati non validi");

      } 
      catch(err) {
        console.error(err);
      }
    }
}
Test.Run();