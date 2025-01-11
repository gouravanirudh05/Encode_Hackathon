//const fs = require('fs');
import fs from "fs";

const options = {
  method: 'POST',
  headers: {
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2Nzc5MDdlYWM0NDE1ODdhYjZlODExNzEiLCJrZXlOYW1lIjoidG92b2ljZSIsImlhdCI6MTczNjI0Njg1M30.Q-PH9fShlLuNjiMlVESlUOEf-nwOpj9Eaaa24I_EndQ',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    voice_id: 'emily',
    text: 'Amazon technical team calling maam,how may i help you?',
    speed: 1,
    sample_rate: 24000,
    add_wav_header: true,
  }),
};

fetch('https://waves-api.smallest.ai/api/v1/lightning/get_speech', options)
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.arrayBuffer();
  })
  .then(buffer => {
    // Write the binary data to a file
    fs.writeFileSync('speech.wav', Buffer.from(buffer));
    console.log('Audio file saved as speech.wav');
  })
  .catch(err => console.error('Error:', err));
