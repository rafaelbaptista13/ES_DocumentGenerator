const s3 = require("../config/bucketconfig");
const fs = require("fs");
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater-lastest");
const Docxtemplater_pptx = require("docxtemplater");
const htmlDocx = require("html-docx-js");
const process = require('process');

const path = require("path");
const uuid = require("uuid");
const XlsxPopulate = require("xlsx-populate");
const pptxTemplaterModule = require('pptxtemplater')

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

	process.on('uncaughtException', (error) => {
		console.log("Uncaught Exception: " + error.message )
		res.status(500).send({
			message: "Error Generating the Document",
		});
		return;
	 });

	
	// check template extention
	let extension = template_path.split(".").pop();

	let file_uid;

	switch(extension){
		case 'xlsx':

		file_uid = uuid.v1() + ".xlsx";

		downloadURL = await readJSON_writeExcel(
				file_uid,
				template_path,
				json
			); // Open and rewrite the excel file
			break;

		case 'docx':

			file_uid = uuid.v1() + ".docx";
			try{
				downloadURL =  await populateDocx( file_uid, template_path, json); // populate word document
			}catch(err){
				res.status(406).send({
					message: ` ${err.properties.errors[0]} . `
				});
				return;
			}
			

			break;
		
		case 'pptx':

			file_uid = uuid.v1() + ".pptx";

			downloadURL = await populatePptx( file_uid, template_path, json);			// populate powerpoint document
			break;

		default:
			res.status(500).send({
				message: `Invalid document format ${extension}`,
			});
			return;

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


/**
 * Populate a power point document with a given json data.
 * 
 * @param {*} file_uid file identifier
 * @param {*} template_path path to powerpoint template
 * @param {*} json data to put in the template
 * @returns temporary url to access the generated document
 * 
 */
async function populatePptx(file_uid, template_path, json){

		// load docx file as binary content
	
		const content = fs.readFileSync(template_path, "binary");

		const zip  = new PizZip(content);
	
		// define delimiters

	
		// const doc = new Docxtemplater(zip, {
		// 	delimiters: { start: '{', end: '}' },
		// 	 modules: [pptxTemplaterModule],

		// })

		let doc = new Docxtemplater_pptx(zip);
		doc.attachModule(pptxTemplaterModule);
		doc.templatedFiles = doc.fileTypeConfig.getTemplatedFiles(doc.zip);
		doc.setData(json);
		doc.setOptions({ fileType: "pptx" });
	
		doc.render();

	
		const buf = doc.getZip().generate({
			type: "nodebuffer",
		});
	
		fs.writeFileSync((file_uid), buf);
	
	
		const fileContent = fs.readFileSync(file_uid);
		
	
		// store result in s3
	
		let params = {
			Bucket: process.env.AWS_BUCKET_NAME,
			Key: "documents/"+file_uid,
			Body: fileContent
		}
	
		s3.upload(params, (err) => {
			if (err) {
				console.log("Upload error!");
				return;
			}	
				console.log("Upload file with success .");
			})
		
	

		// get document url
	
		const downloadURL = s3.getSignedUrl("getObject", {
			Bucket: process.env.AWS_BUCKET_NAME,
			Key: "documents/" + file_uid,
			Expires: 60 * 5,
		});
	
	
		return downloadURL;
}

/**
 * Populate a word document with a given json data.
 * 
 * @param {*} file_uid file identifier
 * @param {*} template_path path to word template
 * @param {*} json data to put in the template
 * @returns temporary url to access the generated document
 * 
 */
async function  populateDocx(file_uid, template_path, json){

	// load docx file as binary content
	
	const content = fs.readFileSync(template_path, "binary");

	const zip  = new PizZip(content);

	// define delimiters


	const doc = new Docxtemplater(zip, {
			delimiters: {  start: '${', end: '}' },			
		})


	doc.modules.forEach(function (module) {
		if (module.name === "LoopModule") {
			module.prefix.start = "#";
			module.prefix.start = "/";
		}
	});

	
	// populate document

	doc.render(json);



	const buf = doc.getZip().generate({
		type: "nodebuffer",
	});

	fs.writeFileSync((file_uid), buf);


	const fileContent = fs.readFileSync(file_uid);
	

	// // store result in s3

	let params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: "documents/"+file_uid,
        Body: fileContent
    }

	s3.upload(params, (err) => {
	if (err) {
		console.log("Upload error!");
		return;
	}	
		console.log("Upload file with success .");
	})

	// get document url

	const downloadURL = s3.getSignedUrl("getObject", {
		Bucket: process.env.AWS_BUCKET_NAME,
		Key: "documents/" + file_uid,
		Expires: 60 * 5,
	});

	

	return downloadURL;
}

/**
 * Populate a excel document with a given json data.
 * 
 * @param {*} file_uid file identifier
 * @param {*} template_path path to excel template
 * @param {*} json data to put in the template
 * @returns temporary url to access the generated document
 */
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
};

				
