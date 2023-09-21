const express = require('express');
const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const app = express();

const client = new Client({
  puppeteer: {
    args: ['--no-sandbox'],
  },
});



app.get('/', (req, res) => {
  res.send('Hello world!');
});

app.get('/qr-code', async (req, res) => {
  try {
    client.on('auth_failure', (message) => {
        console.error('Authentication failed:', message);
    });

    client.on('ready', () => {
        console.log('Client is ready!');
      });
      
      client.on('message', message => {
        console.log(message)
          if(message.body === '!ping') {
              message.reply('pong');
          }
      });
       
      client.initialize().catch((error) => {
        console.error('Initialization error:', error);
      });
      
    const qrCode = await generateQRCode(client);

    res.send(`
      <html>
        <head>
          <style>
            .qr-container {
              width: 300px;
              height: 300px;
              display: flex;
              justify-content: center;
              align-items: center;
            }
            .qr-code {
              font-size: 20px;
              line-height: 20px;
              border: 1px solid black;
              padding: 20px;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <div class="qr-code">
              <img src="${qrCode}" alt="QR Code" />
            </div>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('QR code generation error:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(3000, () => {
  console.log('App is listening on port 3000!');
});

async function generateQRCode(client) {
  return new Promise((resolve, reject) => {
    client.on('qr', async (qrCode) => {
      try {
        const qrDataURL = await qrcode.toDataURL(qrCode);
        resolve(qrDataURL);
      } catch (error) {
        reject(error);
      }
    });
  });
}
