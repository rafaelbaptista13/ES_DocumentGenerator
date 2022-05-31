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
     *      '201':
     *         description: Upload was performed with success.
     *      '400':
     *         description: Bad request occured due to no file sent or file sent with unsupported extension.
     *      '500':
     *         description: An internal error has occoured.
     */
    
    router.post("/upload", upload.single('file'), templates.uploadTemplate);


    /**
     * @swagger
     * /api/templates/:
     *  get:
     *    description: Get all available templates
     *    responses: 
     *      '200':
     *         description: Templates were return succesfully.
     *      '500':
     *         description: An internal error has occoured.
     */
    
     router.get("/", templates.getCurrentTemplates);
  
    app.use('/api/templates', router);
  };
