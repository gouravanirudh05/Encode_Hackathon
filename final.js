import { WebSocketServer } from 'ws';
import express from 'express';
import { fileURLToPath } from 'url'; 
import { createServer } from 'http';
import pkg from 'wavefile';
import path from 'path';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server }); // Correct usage
let assembly;
let chunks = [];
const {WaveFile} = pkg;

wss.on('connection', (ws) => {
    console.log('New Connection Initiated');
    ws.on('message', (message) => {
        if(!assembly)
        {
            console.log("No assembly connection");
        }
        const msg = JSON.parse(message);
        switch (msg.event) {
            case 'connected':
                console.log(`A new call has connected.`);
                const texts={};
                assembly.onmessage = (assemblyMsg)=>{
                    const res = JSON.parse(assemblyMsg.data);
      	            texts[res.audio_start] = res.text;
      	            const keys = Object.keys(texts);
      	            keys.sort((a, b) => a - b);
                    let msg = '';
      	            for (const key of keys) {
                    if (texts[key]) {
                        msg += ` ${texts[key]}`;
                    }
                    }
                    console.log(msg);
                    wss.clients.forEach((client) => {
                        if (client.readyState === WebSocket.OPEN) {
                            client.send(
                                JSON.stringify({
                                    event: "interim-transcription",
                                    text: msg,
                                })
                            );
                        }
                    });
                };
                break;
            case 'start':
                console.log(`Starting Media Stream`);
                break;
            case 'media':
                try {
                    const twilioData = msg.media.payload;
            
                    // Create a new WaveFile instance
                    let wav = new WaveFile();
                    
                    // Initialize from scratch with the correct parameters
                    wav.fromScratch(1, 8000, '8m', Buffer.from(twilioData, "base64"));
            
                    // Decode from MuLaw
                    wav.fromMuLaw(); // Correct method name
            
                    // Convert to Base64 audio buffer
                    const twilio64Encoded = wav.toDataURI().split("base64,")[1];
                    const twilioAudioBuffer = Buffer.from(twilio64Encoded, "base64");
            
                    // Push sliced buffer to chunks
                    chunks.push(twilioAudioBuffer.slice(44)); // Correct slicing
            
                    // Process chunks when enough data is collected
                    if (chunks.length >= 5) {
                        const audioBuffer = Buffer.concat(chunks);
                        const encodedAudio = audioBuffer.toString("base64");
                        
                        // Send processed audio to AssemblyAI WebSocket
                        assembly.send(JSON.stringify({ audio: encodedAudio }));
            
                        // Reset chunks
                        chunks = [];
                    }
                } catch (error) {
                    console.error('Error processing media stream:', error);
                }
                break;
                
            case 'stop':
                console.log(`Call Has Ended`);
                assembly.send(JSON.stringify({termintate_session: true}));
            break;
        }
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "/index.html"));
});

app.post('/', (req, res) => {
    assembly=new WebSocket(
        "wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000?encoding=pcm_mulaw",
        {headers: {authorization: "e20e67e8009446e7b12481471d3785cc"}}
    );
    res.set('Content-Type', 'text/xml');
    res.send(`
        <Response>
            <Start>
                <Stream url="wss://${req.headers.host}/"/>
            </Start>
            <Say>I will stream the next 60 seconds of audio through your websocket</Say>
            <Pause length="60" />
        </Response>
        `);
});

server.listen(8080, () => {
    console.log('Server is listening on port 8080');
});
