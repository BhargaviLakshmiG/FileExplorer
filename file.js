const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const bodyparser = require('body-parser');


const app = express();
app.use(cors());
app.use(bodyparser.json());
console.log("DIr name "+__dirname)
app.use(express.static(path.join(__dirname, "public")))

let dir = process.cwd();

app.get('/', (req, res) => {
    console.log("File explorer")
    res.redirect('./public/index.html')
})


app.get('/files/:path?', async(req, res) => {
    console.log("Here")
    let currdir = dir;
    var query = req.params.path || '';
    if (query) {
        currdir = path.join(dir, query);
        dir = currdir;
    }
    console.log("Looking into directory " + currdir);
    fs.readdir(currdir, (err, files) => {
        if (err) {
            res.status(401).json(`Error while trying to read the directory : ${currdir}`);
        }
        let data = [];
        if (files) {
            for (let file of files) {
                let isDirectory = fs.statSync(path.join(currdir, file)).isDirectory();
                if (isDirectory) {
                    data.push({
                        "name": file,
                        "type": "Directory",
                        "directory": currdir
                    });
                } else {
                    let filetype = path.extname(file);
                    data.push({
                        "name": file,
                        "type": "File",
                        "extension": filetype,
                        "directory": currdir
                    });
                }
                console.log(data)
            }
            res.status(200).json(data);
        } else {
            res.status(401).json({ message: "Error while reading the files" });
        }

    })
});


//API to move one level up
app.get('/back', async(req, res) => {
    let currdir = path.join(dir, '../');
    dir = currdir;
    console.log("looking into path " + currdir);
    fs.readdir(currdir, (err, files) => {
        if (err) {
            res.status(401).json("Error reading the directory : " + currdir);
        }
        let data = [];
        for (let file of files) {
            let isDirectory = fs.statSync(path.join(currdir, file)).isDirectory();
            if (isDirectory) {
                data.push({
                    "name": file,
                    "type": "Directory",
                });
            } else {
                let filetype = path.extname(file);
                data.push({
                    "name": file,
                    "type": "File",
                    "extension": filetype
                });
            }
        }
        res.status(200).json(data);
    })
})




app.listen(4000);