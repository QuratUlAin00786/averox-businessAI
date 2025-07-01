import express from 'express';
const app = express();
const port = process.env.PORT || 3000;
const hostname = 'http://104.251.217.237/'; 
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'dist')));
//res.sendFile(path.join(__dirname, 'dist', 'index.html'));





//app.use(express.static(path.join(__dirname,'build'))); // Serve static files from 'public' directory
// Home route - plain text
app.get('/',function (req, res) {
  res.sendFile(path.join(__dirname,'dist','index.html')); // Serve the index.html file
});
// Basic middleware
//app.use(express.json());


app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});