
// Upload Template
exports.upload = (req, res) => {

    console.log(req.file)
    
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


    res.status(200).send({
        message: "Template upload with sucess!"
    });
    
  };
  