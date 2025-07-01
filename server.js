const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname,'build'))); // Serve static files from 'public' directory
// Home route - plain text
app.get('/',function (req, res) {
  res.sendFile(path.join(__dirname,'build','index.html')); // Serve the index.html file
});
// Basic middleware
//app.use(express.json());


app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});