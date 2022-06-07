const s3 = require("../config/bucketconfig");
const fs = require("fs");
const uuid = require("uuid");
const XlsxPopulate = require("xlsx-populate");

// Generate a document
exports.generate = async (req, res) => {
	/* Validate request section */
	if (req.body.template_name == undefined) {
		res.status(400).send({
			message: "You must send the template file name.",
		});
		return;
	}
	if (req.files.jsonfile == undefined) {
		res.status(400).send({
			message: "You must send a JSON file in order to generate a file.",
		});
		return;
	}
	/* End validate request section */

	let jsonfile = req.files.jsonfile[0];
	let template_name = req.body.template_name;
	let template_path = "uploads/" + template_name;

	// Get template from bucket
	let params = {
		Bucket: process.env.AWS_BUCKET_NAME,
		Key: "templates/" + req.body.template_name,
	};
	const template = await s3
		.getObject(params)
		.promise()
		.catch((err) => {
			console.error(err.message);
			return false;
		});

	// Case of bucket error
	if (template === false) {
		res.status(404).send({
			message: "Requested template was not found.",
		});
		return;
	}

	// Temporary store the file
	fs.writeFileSync(template_path, template.Body);

	// Read json file and parse it
	let rawdata = fs.readFileSync(jsonfile.path, "utf-8");

	let json;
	try {
		json = JSON.parse(rawdata);
	} catch (err) {
		res.status(400).send({
			message: "JSON is not correctly formatted",
		});
		fs.unlinkSync(jsonfile.path, (err) => {
			if (err && err.code === "ENOENT")
				console.log("File " + jsonfile.path + " not found.");
		});
		fs.unlinkSync(template_path, (err) => {
			if (err && err.code === "ENOENT")
				console.log("File " + template_path + " not found.");
		});
		return;
	}

	let extension = template_path.split(".").pop();

	let file_uid;
	let downloadURL;
	if (extension === "xlsx") {
		file_uid = uuid.v1() + ".xlsx";

		downloadURL = await readJSON_writeExcel(file_uid, template_path, json); // Open and rewrite the excel file
	}

	// Return message
	if (downloadURL) {
		res.status(200).send({
			message: "Document was generated with success!",
			downloadURL: downloadURL,
		});
	} else {
		res.status(500).send({
			message: "An error occured while generating the document.",
		});
	}

	// Delete temporary files
	fs.unlink(jsonfile.path, (err) => {
		if (err && err.code === "ENOENT")
			console.log("File " + jsonfile.path + " not found.");
	});
	fs.unlink(template_path, (err) => {
		if (err && err.code === "ENOENT")
			console.log("File " + template_path + " not found.");
	});
	fs.unlink(file_uid, (err) => {
		if (err && err.code === "ENOENT")
			console.log("File " + file_uid + " not found.");
	});

	return;
};

async function readJSON_writeExcel(file_uid, template_path, json) {
	try {
		const workbook = await XlsxPopulate.fromFileAsync(template_path);

		let pages = Object.keys(json);
		pages.forEach((element) => {
			const pageJson = json[element];
			const pagenames = Object.keys(pageJson);

			pagenames.forEach((pagename) => {
				const newJson = pageJson[pagename];

				newJson.forEach((element) => {
					var key = String(Object.keys(element));
					var value = element[key];

					// Create sheet if doesnt exist
					if (workbook.sheet(pagename) === undefined) {
						workbook.addSheet(pagename);
					}
					workbook.sheet(pagename).cell(key).value(value);
				});
			});
		});

		await workbook.toFileAsync(file_uid);
	} catch (err) {
		console.error(err.message);
		return false;
	}

	// Store excel in s3 bucket
	const fileContent = fs.readFileSync(file_uid);

	const params = {
		Bucket: process.env.AWS_BUCKET_NAME,
		Key: "documents/" + file_uid,
		Body: fileContent,
	};

	await s3.upload(params, (err) => {
		if (err) {
			console.log("Erro no upload: ", err);
			return false;
		}
	});

	const downloadURL = s3.getSignedUrl("getObject", {
		Bucket: process.env.AWS_BUCKET_NAME,
		Key: "documents/" + file_uid,
		Expires: 60 * 5,
	});

	return downloadURL;
}
