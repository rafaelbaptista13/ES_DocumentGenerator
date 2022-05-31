const { Console } = require("console");
const { StringDecoder } = require("string_decoder");

// Generate a document
exports.generate = (req, res) => {
	console.log(req.file);

	/* Validate request section */
	if (req.file == undefined) {
		res.status(400).send({
			message: "You must send a JSON file in order to generate a file.",
		});
		return;
	}

	var filename = req.file.originalname;
	var fileformat = filename.split(".").pop();

	if (fileformat != "json") {
		res.status(400).send({
			message:
				"Document format is not supported. Supported formats: [JSON].",
		});
		return;
	}
	/* End validate request section */

	const fs = require("fs");
	let rawdata = fs.readFileSync(req.file.path, "utf-8");
	let json = JSON.parse(rawdata);

	readJSON(json);


	// async doesnt finish????
	fs.unlink(req.file.path, (err) => {
		if (err) {
			console.error(err);
			return;
		}

		//file removed
	});

	res.status(200).send({
		message: "Document generated with sucess!",
	});
};

function readJSON(json) {


	let pages = Object.keys(json);

	pages.forEach(element => {
		const pageJson = json[element];
		console.log("PAGE: " + element);
		
		const pagename = Object.keys(pageJson);
		pagename.forEach(element => {
			const newJson = pageJson[element];

			console.log("PAGE NAME: " + pagename);
			console.log("Fields: ");

			const fields = Object.keys(newJson);
			fields.forEach(element => {
				console.log(newJson[element]);
			});
		});

	});
 } 
 