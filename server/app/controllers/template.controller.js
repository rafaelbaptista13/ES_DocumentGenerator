const s3 = require("../config/bucketconfig");
const fs = require("fs");

// Upload Template
exports.upload = (req, res) => {
    
    console.log("TOu upload")
    console.log(process.env.AWS_BUCKET_NAME);
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

    console.log(process.env.AWS_BUCKET_NAME);
    const fileContent = fs.readFileSync(req.file.path)
    
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: filename,
        Body: fileContent
    }


    s3.upload(params, (err, data) => {
        if (err) {
            console.log("Erro no upload: ", err)

            res.status(500).send({
                message: "An error occurred while uploading the template!"
            });
        }
            console.log("Sucesso no upload.")

            res.status(201).send({
                message: "Template upload with sucess!"
            });
        })

  };
  