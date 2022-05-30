const multer = require('multer');

const upload = multer();

module.exports = app => {
    const document = require("../controllers/document.controller.js");
    var router = require("express").Router();

    /**
     * @swagger
     * /api/generate/:
     *  post:
     *    description: Generate a document from a template and a JSON file
     *    responses: 
     *      '200':
     *         description: Document generation was performed with success
     *      '500':
     *         description: An internal error has occoured
     */
    router.post("/", upload.single('file'), document.generate);
  
    app.use('/api/generate', router);
  };
