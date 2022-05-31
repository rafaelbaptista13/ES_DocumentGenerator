const s3 = require("../config/bucketconfig");
const fs = require("fs");


// Get Current Templates
exports.getCurrentTemplates = (req, res) => {
    
    var params = {
        Bucket:  process.env.AWS_BUCKET_NAME,
        Prefix: "templates/"
    };

    s3.listObjectsV2(params, function(err, data) {
        if (err) {
            res.status(500).send({
                message: "An error occurred while retrieving the current template list! Please try again."
            });
        }
        else {
            var templates = []
            data.Contents.forEach(element => {
                templates.push(element.Key.substring(10,))
            }); 

            res.status(200).send({
                message: "Templates were retrieved with success!",
                templates: templates
            });
        }
    });

  };
  


// Upload Template
exports.uploadTemplate = (req, res) => {
    
    /* Validate request section */
    if (req.file == undefined) {

        res.status(400).send({
            message: "You must send a template to upload."
        });
        return;

    }

    var filename = req.file.originalname
    var fileformat = filename.split('.').pop()
    
    if (fileformat != 'xlsx' && fileformat != 'pptx' && fileformat != 'docx') {

        res.status(400).send({
            message: "Template format is not supported. Supported formats: [xlsx, pptx, docx]."
        });
        return;

    }
    /* End validate request section */

    const fileContent = fs.readFileSync(req.file.path)
    
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: "templates/"+filename,
        Body: fileContent
    }


    s3.upload(params, (err, data) => {
        if (err) {
            res.status(500).send({
                message: "An error occurred while uploading the template! Please try again."
            });
        }
            res.status(201).send({
                message: "Template was uploaded with success!"
            });
        })

  };
  


// Get Current Templates
exports.deleteTemplate = (req, res) => {
    
    /* Validate request section */
    if (req.params.name == undefined || req.params.name == null) {

        res.status(400).send({
            message: "You must indicate which template you want to delete."
        });
        return;

    }
    /* End validate request section */

    var params = {
        Bucket:  process.env.AWS_BUCKET_NAME,
        Key: "templates/"+req.params.name
    };

    s3.deleteObject(params, function(err, data) {
        if (err) {
            res.status(500).send({
                message: "An error occurred while deleting template! Please try again."
            });
        }
        else {
            
            res.status(200).send({
                message: "Templates were deleted with success!",
            });
        }
      });

  };
  

