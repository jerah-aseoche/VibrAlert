const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sensorRoutes = require('./routes/sensor');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use('/api', sensorRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
