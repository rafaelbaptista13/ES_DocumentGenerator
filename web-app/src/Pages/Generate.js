import React from 'react';
import { Form, Button } from 'react-bootstrap'; 

function Generate (){
    return ( 
        <div style={{marginLeft: '10%', marginRight: '10%', marginTop: '2%'}}>
            <h1>Document Generator</h1>
            <br/>
            <span>Select a document template:</span>
            <Form.Select id='document_template_form' aria-label="Default select example">
                <option>Choose a document template</option>
                <option value="1">Excel template 1</option>
                <option value="2">Word template 1</option>
                <option value="3">PowerPoint template 2</option>
            </Form.Select>
            <br/>
            <Form.Group controlId="formFile" className="mb-3">
                <Form.Label>Upload a JSON file</Form.Label>
                <Form.Control type="file" />
            </Form.Group>
            <br />
            <Button as="input" type="submit" value="Generate" />{' '}
        </div>
    )
}

export default Generate;