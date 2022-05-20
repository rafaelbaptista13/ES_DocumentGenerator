import { React, useState } from 'react';
import { Form } from 'react-bootstrap';


import TemplateService from '../Services/template.service';


function Upload (){

    const [file, setFile] = useState("");

    function getTemplate(e) {
        e.preventDefault();
        console.log("entrei")
        console.log(file)

        TemplateService.upload_template(file);
    }

    return (
        <div style={{marginLeft: '10%', marginRight: '10%', marginTop: '2%'}}>
            <h1>Upload a template</h1>
            <br/>
            <form onSubmit={getTemplate}>
                <Form.Group controlId="formFile" className="mb-3">
                    <Form.Label>Upload a document template</Form.Label>
                    <Form.Control type="file" 
                        onChange={e => setFile(e.target.files[0] )}
                        />
                    
                    <button
                        type="submit"
                        value="Upload"
                        className="btn btn-outline-secondary"
                        style={{marginTop : "15px"}}

                    >Upload</button>

                </Form.Group>
            </form>
        </div>
    )
}
 
export default Upload;