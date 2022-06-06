const multer = require("multer");

const documentsFilter = (req, file, cb) => {
	if (file.mimetype == "application/json") {
		cb(null, true);
	} else {
		cb(null, false);
	}
};

const upload = multer({
	dest: "uploads/", // "uploads"
	fileFilter: documentsFilter,
	limits: {
		fileSize: 20000000, // 20MB
	},
});

module.exports = (app) => {
	const document = require("../controllers/document.controller.js");
	var router = require("express").Router();

	/**
	 * @swagger
	 * /api/documents/:
	 *  post:
	 *    description: Generate a document from a template and a JSON file
	 *    responses:
	 *      '200':
	 *         description: Document generation was performed with success
	 *      '500':
	 *         description: An internal error has occoured
	 */
	router.post(
		"/",
		upload.fields([
			{ name: "template_name" },
			{ name: "jsonfile", maxCount: 1 },
		]),
		document.generate
	);

	app.use("/api/documents", router);
};
