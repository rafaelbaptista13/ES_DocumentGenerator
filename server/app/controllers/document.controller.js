
// Generate a document
exports.generate = (req, res) => {

    console.log(req.file)
    
    /* Validate request section */
    if (req.file == undefined) {
        res.status(400).send({
            message: "You must send a JSON file in order to generate a file."
        });
        return;
    }

    var filename = req.file.originalname
    var fileformat = filename.split('.').pop()
    
    if (fileformat != 'json') {
        res.status(400).send({
            message: "Document format is not supported. Supported formats: [JSON]."
        });
        return;
    }
    /* End validate request section */


    res.status(200).send({
        message: "Document generated with sucess!"
    });
    
  };
  