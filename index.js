const express = require('express');
const path = require('path');
const pair = require('./pair');
const app = express();
app.use(express.static(__dirname));
app.use('/code', pair);
app.get('/', (req, res) => { res.sendFile(path.join(__dirname, 'pair.html')); });
app.listen(process.env.PORT || 8080, () => { console.log("Server Started!"); });
           
