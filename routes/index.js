var express = require('express');
var router = express.Router();
var JSZip = require('jszip');
var fs = require('fs');
var forge = require('node-forge');
/* GET home page. */
router.get('/', function(req, res, next) {
    var pki = forge.pki;
    var keys = pki.rsa.generateKeyPair(2048);
    // Creating Certificate

    var certificate = pki.createCertificate();

    //configuring certificate 

    certificate.publicKey = keys.publicKey
    certificate.serialNumber = '01';
    certificate.validity.notBefore = new Date();    
    certificate.validity.notAfter = new Date();
    certificate.validity.notAfter.setFullYear(certificate.validity.notBefore.getFullYear() + 1);

    // Attributes of Certificate  Hard coded : 

    var attribute = [
        {
            name: 'commonName',
            value: 'example.org'
        },{
            name: 'countryName',
             value: 'US'
        },{
            shortName: 'ST',
            value: 'Virginia'
        },{
            name: 'localityName',
            value: 'Blacksburg'
        },{
            name: 'organizationName',
            value: 'Test'
        },{
            shortName: 'OU',
            value: 'Test'
        }
    ]

    // Adding to Attributes

    certificate.setSubject(attribute);
    certificate.setIssuer(attribute);

    // Signing the certificate with private Key

    certificate.sign(keys.privateKey);

    // convert the certificate .pem

    var certificate_pem = pki.certificateToPem(certificate);

    // Writing file to a 
    let path_to_certificate = 'path to the certificate with .pem extention';
    let path_to_zip = 'path to the zip file with .zip extention';

    // Writing the certificate to a file 

    fs.writeFile(path_to_certificate , certificate_pem.toString() , err=>{
        if(err)
        {
            console.log('ERROR:-  ',err );
        }
    });

    // Sending a certificate the user 

    fs.readFile(path_to_certificate ,'utf8' ,(err, data)=>{

        // Creating a zip file

        const zip = new JSZip();

        // adding data to Zip file 

        zip.file('certificate.pem',data);

        // Writing the zip at a location 

        zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
         .pipe(fs.createWriteStream(path_to_zip))
         .on('finish',()=>{
            console.log("Zip Creation Finished");

            // Returning the zip file are response to the request

            res.sendFile(path_to_zip);
        });
    } );
    

});

module.exports = router;
