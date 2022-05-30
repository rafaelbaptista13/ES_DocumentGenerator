const multer = require('multer');

const upload = multer({
  dest: "uploads/"
});

module.exports = app => {
    const templates = require("../controllers/template.controller.js");
    var router = require("express").Router();
  
    /**
     * @swagger
     * /api/templates/upload:
     *  post:
     *    description: Upload a new template
     *    responses: 
     *      '200':
     *         description: Upload was performed with success
     *      '500':
     *         description: An internal error has occoured
     */
    
    router.post("/upload", upload.single('file'), templates.upload);
  
    app.use('/api/templates', router);
  };
