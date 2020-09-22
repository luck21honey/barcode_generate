var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var multer = require('multer');
var fs = require('fs');
const csv = require('csvtojson');

var jsonArray = [];

app.use(bodyParser.json());

var storage = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, cb) {
        cb(null, './')
    },
    filename: function (req, file, cb) {
        var datetimestamp = Date.now();
        cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1])
    }
});

var upload = multer({ //multer settings
    storage: storage,
    fileFilter: function (req, file, callback) { //file filter
        if (['csv'].indexOf(file.originalname.split('.')[file.originalname.split('.').length - 1]) === -1) {
            return callback(new Error('Wrong extension type'));
        }
        callback(null, true);
    }
}).single('file');

/** API path that will upload the files */
app.post('/upload', function (req, res) {
    jsonArray = [];
    upload(req, res, function (err) {
        if (err) {
            res.json({ error_code: 1, err_desc: err });
            return;
        }
        /** Multer gives us file info in req.file object */
        if (!req.file) {
            res.json({ error_code: 1, err_desc: "No file passed" });
            return;
        }

        const csvFilePath = req.file.path;
        console.log(csvFilePath);
        try {
            csv()
                .fromFile(csvFilePath)
                .then((jsonObj) => {
                    jsonArray = jsonObj;
                    fs.unlinkSync(csvFilePath); // Deleting the uploaded file
                });
            res.json({ error_code: 0, err_desc: null, data: [] });
        } catch (e) {
            res.json({ error_code: 1, err_desc: "Corupted csv file" });
        }
    })

});

app.get('/generate', function (req, res) {
    console.log('jsonArray>>>', jsonArray);
    res.send("barcode generate api is working>>");
});

app.get('/', function (req, res) {
    res.sendFile(__dirname + "/index.html");
});

app.listen('3000', function () {
    console.log('running on 3000...');
});