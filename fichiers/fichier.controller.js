const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('./../middleware/validate-request');
const authorize = require('./../middleware/authorize');
const fService = require('./fichier.service');
const formidable = require('formidable');
var Minio = require('minio');
var Multer = require("multer");
var BodyParser = require("body-parser");
var fs = require('fs');
var path = require('path');

// AWS
const AWS = require('aws-sdk');
const s3 = new AWS.S3({
    region: 'de',
    accessKeyId: 'f6920d3469784ad8af3f72472d89ae56',
    secretAccessKey: '645c52c0f42f4de5bb3599eea1fb14da',
    endpoint: "https://s3.de.io.cloud.ovh.net/"
  });
// routes
router.post('/add', addSchema, add);
router.get('/', authorize(), getAll);
router.get('/current', authorize(), getCurrent);
router.get('/:id', authorize(), getById);
router.put('/:id', authorize(), updateSchema, update);
router.delete('/:id', authorize(), _delete);


module.exports = router;


function addSchema(req, res, next) {
    const schema = Joi.object({
        offre: Joi.number(),
        autre: Joi.number(),
        name: Joi.string(),
        path: Joi.string(),
        url: Joi.string().required(),
        type: Joi.string()
    });
    validateRequest(req, next, schema);
}

function add(req, res, next) {
    fService.create(req.body)
        .then(() => res.json({ message: 'File Uploaded' }))
        .catch(next);
}

function getAll(req, res, next) {
    fService.getAll()
        .then(fs => res.json(fs))
        .catch(next);
}

function getCurrent(req, res, next) {
    res.json(req.f);
}

function getById(req, res, next) {
    fService.getById(req.params.id)
        .then(f => res.json(f))
        .catch(next);
}

function updateSchema(req, res, next) {
    const schema = Joi.object({
        offre: Joi.number().empty(),
        autre: Joi.number().empty(),
        name: Joi.string(),
        path: Joi.string(),
        url: Joi.string().empty(),
        type: Joi.string().empty()
    });
    validateRequest(req, next, schema);
}

function update(req, res, next) {
    fService.update(req.params.id, req.body)
        .then(f => res.json(f))
        .catch(next);
}

function _delete(req, res, next) {
    fService.delete(req.params.id)
        .then(() => res.json({ message: 'Sup' }))
        .catch(next);
}

// Handle files upload and donwload
const isFileValid = (file) => {
    const type = file.type.split("/").pop();
    const validTypes = ["jpg", "jpeg", "png"];
    if (validTypes.indexOf(type) === -1) {
      return false;
    }
    return true;
};

const form = formidable({ 
    multiples: true, 
    keepExtensions: true,
    maxFiles: 10,
    maxFields: 3, 
    allowEmptyFiles: false,
    uploadDir: './fichiers/fichiers/',
    filename: (name, ext, part, form) => `${name}${new Date().valueOf()}.${ext}`
});


form.on('progress', (bytesReceived, bytesExpected) => {
    console.log("Progress: "+((bytesReceived*100)/bytesExpected));
});
 
// AWS Upload and Download
router.post('/uploadaws', authorize(), Multer().single("file"), function(req, res) {
    req.body.path = req.file.path;
    req.body.name = req.file.originalname;
    req.body.type = req.file.originalname.substr(req.file.originalname.lastIndexOf('.') + 1);
    s3.upload({
        Bucket: "elcarhba",
        Key: req.file.originalname,
        Body: req.file.buffer
        }, (err, data) => {
        if (err) {
        console.error(err);
        } else {
        console.log(`File uploaded successfully. ${data.Location}`);
        }
    });
    fService.create(req.body);
    res.send(req.file);
});

router.post("/downloadaws", function(req, res) {
    console.log(req.body);
    s3.getObject({ Bucket: "elcarhba", Key: req.body.filename }, function(err, data)
    {
        if (err) {
            res.status(200);
            res.end('Error Fetching File');
          }
          else {
            res.attachment(req.body.filename); // Set Filename
            res.type(data.ContentType); // Set FileType
            res.send(data.Body);        // Send File Buffer
          }
    });
});

// handle storage using multer + formidable
router.post('/upload', authorize(), (req, res, next) => {

    form.parse(req, (err, fields, files) => {
        var i =0;
        if (!files.files) { 
            console.log(JSON.stringify({ fields, files }));
            return res.status(400).send({ message: 'Please upload a file.' });
        }
        else {
            console.log(JSON.stringify({ fields, files }));
            if (Array.from(files.files).length > 1) {
            Array.from(files.files).forEach(files => {
            req.body.offre = fields.offre;
            req.body.autre = fields.autre;
            req.body.path = files.files.filepath;
            // req.body.url = new Buffer(fs.readFileSync(files.files.filepath)).toString('base64');
            req.body.type = files.originalFilename.substr(files.originalFilename.lastIndexOf('.') + 1);
            fService.create(req.body);
            i++;
            });}
            else {
                req.body.offre = fields.relatedam;
                req.body.autre = fields.relatedf;
                req.body.path = files.files.filepath;
                // req.body.url = new Buffer(fs.readFileSync(files.files.filepath)).toString('base64');
                req.body.type = files.files.originalFilename.substr(files.files.originalFilename.lastIndexOf('.') + 1);
                fService.create(req.body);
                i++;  
            }
        }

        return res.status(200).send({ message: i + ' Files Uploaded Successfully' });
    });
 });


router.post('/download/:fiche/:analyse', async (req, res, next) => {
    fichier = await fService.downloadFichiers(req.params.fiche, req.params.analyse)
    if (fichier != null) {
        console.log(fichier);
        var filePath = fichier; // Or format the path using the `id` rest param
        var fileName = "fichier" + req.params.fiche + req.params.analyse +".pdf"; // The default name the browser will use
        // res.attachment(filePath);
        res.download(filePath, fileName); 
    } 
});

// Minio
var minioClient = new Minio.Client({
    endPoint: 'play.min.io',
    port: 9000,
    useSSL: true,
    accessKey: 'GYE0SqDnnmWzyd4Ptdok',
    secretKey: 'ZxaZ1GrC8MDJTp6nN3adHCFGWxawvhKwz3e8biA5',
  })


router.post('/uploadminio', Multer({dest: "./fichiers/files"}).single("file"), function(req, res) {
    console.log(req.file);
    minioClient.putObject("test", req.file.originalname, req.file.path, function(error, etag) {
        if(error) {
            return console.log(error);
        }
        req.body.path = req.file.path;
        req.body.name = req.file.originalname;
        req.body.type = req.file.originalname.substr(req.file.originalname.lastIndexOf('.') + 1);
        fService.create(req.body);
        res.send(req.file);
    });
 });

router.post("/downloadminio", function(req, res) {
    minioClient.getObject("test", req.query.filename, function(error, stream) {
        if(error) {
            return res.status(500).send(error);
        }
        stream.pipe(res);
    });
});
