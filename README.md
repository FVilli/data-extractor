# data-extractor

In generale la versione a.b.c è in grado di gestire [DataPacket] fino alla versione a.b

Quindi ad esempio la versione 0.2.7 gestisce [DataPacket] fino alle 0.2 (quindi anche 0.1)
```
...
const uncompressed_data = PAKO.inflate(msg.payload);
const dv = new DataView(uncompressed_data.buffer);

const dt = new DataPacket<DataPacket_0V1>(dv,DataPacketVersion.DP0V1);
        
if(dt.Valid)
    console.log(JSON.stringify(dt.Value));
else
    console.error("Dati non validi");
        
const du = new DataPacket<any>(dv);
if(du.Valid)
    console.log(du.Version);
else
    console.error("Dati non validi");
...
...
```