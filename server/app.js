var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var multer = require('multer');
var fs = require('fs');
const csv = require('csvtojson');
const bwipjs = require('bwip-js');
var zip = require('express-zip');

var barcodeJson = []; // from csv file
var barcodeFiles = []; // generate barcode as png file

app.use(bodyParser.json());

//multers disk storage settings
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './')
    },
    filename: function (req, file, cb) {
        var datetimestamp = Date.now();
        cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1])
    }
});

//multer settings
var upload = multer({
    storage: storage,
    fileFilter: function (req, file, callback) {
        //file filter
        if (['csv'].indexOf(file.originalname.split('.')[file.originalname.split('.').length - 1]) === -1) {
            return callback(new Error('Wrong extension type'));
        }
        callback(null, true);
    }
}).single('file');

/** API path that will upload the files */
app.post('/upload', function (req, res) {
    console.log('csv file upload requesting...')
    barcodeJson = [];
    
    barcodeFiles.forEach(element => {
        fs.unlinkSync(element.path); // Deleting the barcode png
    });

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
        // console.log(csvFilePath);
        try {
            csv()
                .fromFile(csvFilePath)
                .then((jsonObj) => {
                    barcodeJson = jsonObj;
                    fs.unlinkSync(csvFilePath); // Deleting the uploaded file
                });

            console.log('Uploaded successfully')
            res.json({ error_code: 0, err_desc: null, data: "Uploaded successfully" });
        } catch (e) {
            res.json({ error_code: 1, err_desc: "Corupted csv file" });
        }
    })

});

app.get('/generate', function (req, res) {
    console.log('generating barcode is started...')
    barcodeFiles = [];
    if (!barcodeJson.length) {
        res.json({ error_code: 1, err_desc: "Please upload csv file" });
        return;
    }

    barcodeJson.forEach((element, index) => {
        console.log(index, ' element>>>', element)
        let value = element['type;value'].split(';');
        let type = value[0];
        let data = value[1];

        if (type === 'ean13') {
            data = data.substr(1);
        }

        bwipjs.toBuffer({
            bcid: type,       // Barcode type
            text: data,    // Text to encode
            scale: 3,               // 3x scaling factor
            height: 10,              // Bar height, in millimeters
            includetext: true,
            textxalign: 'center',
        })
            .then(png => {
                var datetimestamp = Date.now();
                var filePath = `./barcodes/${datetimestamp}-${type}-${data}.png`;
                fs.writeFileSync(filePath, png);
                barcodeFiles.push({ path: filePath, name: `${datetimestamp}-${type}-${data}.png` });
            })
            .catch(err => {
                console.log('generate barcode error>>', err)
            });

    });

    console.log('generating barcode is finished...')
    res.json({ error_code: 0, err_desc: null, data: "Barcode is generated successfully" });
});

app.get('/download', function (req, res) {
    console.log('download api is working>>');
    if (!barcodeFiles.length) {
        console.log('there is no data to download');
        res.json({ error_code: 1, err_desc: "there is no data to download" });
        return;
    }

    res.zip(barcodeFiles);
});

app.get('/', function (req, res) {
    console.log('api is working fine...')
    res.sendFile(__dirname + "/index.html");
});

app.listen('3000', function () {
    console.log('running on 3000...');
});