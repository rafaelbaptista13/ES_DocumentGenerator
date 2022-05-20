
// Upload Template
exports.upload = (req, res) => {

    console.log(req.body)
    
    /*
    // Validate request
    if (!req.body) {
        res.status(400).send({
        message: "Content can not be empty!"
        });
        return;
    }*/

    res.status(200).send({
        message: "Template upload with sucess!"
    });
    
  };
  