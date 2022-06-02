import { React, useState } from 'react';
import { Form } from 'react-bootstrap';


import TemplateService from '../Services/template.service';

function Upload (){

    const [file, setFile] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    async function uploadTemplate(e) {
        e.preventDefault();
        hide_everything();
        var res = await TemplateService.upload_template(file);

        if (res.status == undefined) {
            setErrorMessage(res)
            display_error_message();
        } 
        else if (res.status == 201) {
            var json = await res.json();
            setSuccessMessage(json["message"])
            display_success_message();
            
        } 
        else {
            var json = await res.json();
            setErrorMessage(json["message"])
            display_error_message();
        }
    }


    function display_error_message() {
        document.getElementById("sucessoUpload").style.display = "none";
        document.getElementById("erroUpload").style.display = "block";
    }

    function display_success_message() {
        document.getElementById("erroUpload").style.display = "none";
        document.getElementById("sucessoUpload").style.display = "block";
    }


    function hide_message(id) {
        var elemento = document.getElementById(id)
        if (elemento !== undefined && elemento !== null)
            elemento.style.display = "none"
    }

    function hide_everything() {
        document.getElementById("sucessoUpload").style.display = "none";
        document.getElementById("erroUpload").style.display = "none";
    }


    return (
        <div style={{marginLeft: '10%', marginRight: '10%', marginTop: '2%'}}>
            <h1>Upload a template</h1>
            <br/>

            <div id={"erroUpload"} className="alert alert-danger row" role="alert" style={{margin:"10px auto", width: "90%", textAlign:"center", fontSize:"22px", display:"none", justifyContent: 'center'}} >
                {errorMessage}
                <img src={`${process.env.PUBLIC_URL}/crossicon.png`}   style={{width: "5%", height: "auto", marginLeft:"8px"}} alt={"Close Icon"} onClick={() => hide_message("erroUpload")}></img>
            </div>

            <div id={"sucessoUpload"} className="alert alert-success row" role="alert" style={{margin:"10px auto", width: "90%", textAlign:"center", fontSize:"22px", display:"none", justifyContent: 'center'}}>
                {successMessage}
                <img src={`${process.env.PUBLIC_URL}/crossicon.png`}  style={{width: "5%", height: "auto", marginLeft:"8px"}} alt={"Close Icon"} onClick={() => hide_message("sucessoUpload")}></img>
            </div> 

            <form onSubmit={uploadTemplate}>
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