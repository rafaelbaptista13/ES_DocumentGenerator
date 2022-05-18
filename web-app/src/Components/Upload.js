import React from 'react';
import { Form } from 'react-bootstrap';
 
function Upload (){
    return (
        <div style={{marginLeft: '10%', marginRight: '10%', marginTop: '2%'}}>
            <h1>Upload a template</h1>
            <br/>
            <Form.Group controlId="formFile" className="mb-3">
                <Form.Label>Upload a document template</Form.Label>
                <Form.Control type="file" />
            </Form.Group>
        </div>
    )
}
 
export default Upload;