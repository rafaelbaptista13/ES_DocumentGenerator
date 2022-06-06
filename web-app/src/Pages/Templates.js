import { React, useState, useEffect } from 'react';

import TemplateService from '../Services/template.service';

function Templates (){

    const [current_templates, setCurrentTemplates] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [boolToUpdatePage, setBoolToUpdatePage] = useState(false);

    function display_error_message() {
        document.getElementById("sucessoDelete").style.display = "none";
        document.getElementById("erroDelete").style.display = "block";
    }

    function display_success_message() {
        document.getElementById("erroDelete").style.display = "none";
        document.getElementById("sucessoDelete").style.display = "block";
    }

    function hide_message(id) {
        var elemento = document.getElementById(id)
        if (elemento !== undefined && elemento !== null)
            elemento.style.display = "none"
    }

    function hide_everything() {
        document.getElementById("sucessoDelete").style.display = "none";
        document.getElementById("erroDelete").style.display = "none";
    }


    async function delete_template(template) {
        hide_everything();

        var res = await TemplateService.delete_template(template);
        var json;

        if (res.status === undefined) {
            setErrorMessage(res)
            display_error_message();
            return
        }
        else if (res.status !== 200) {
            json = await res.json();
            setErrorMessage(json["message"])
            display_error_message();
            return
        } else {
            json = await res.json();
            setSuccessMessage(json["message"])
            display_success_message();
        }
    }
    
    useEffect(() => {
            async function fetchCurrentTemplates() {

                var res = await TemplateService.get_current_templates();
                var json;

                if (res.status === undefined) {
                    setErrorMessage(res)
                    display_error_message();
                    return
                }
                else if (res.status !== 200) {
                    json = await res.json();
                    setErrorMessage(json["message"])
                    display_error_message();
                    return
                }

                json = await res.json();
            
                setCurrentTemplates(json["templates"]);

                setBoolToUpdatePage(!boolToUpdatePage)
            }

            fetchCurrentTemplates()
        }, [boolToUpdatePage]);


    return ( 
        <div style={{marginLeft: '10%', marginRight: '10%', marginTop: '2%'}}>
            <h1>Available templates</h1>
            <br/>

            <div id={"erroDelete"} className="alert alert-danger row" role="alert" style={{margin:"10px auto", width: "90%", textAlign:"center", fontSize:"22px", display:"none", justifyContent: 'center'}} >
                {errorMessage}
                <img src={`${process.env.PUBLIC_URL}/crossicon.png`}   style={{width: "5%", height: "auto", marginLeft:"8px"}} alt={"Close Icon"} onClick={() => hide_message("erroDelete")}></img>
            </div>

            <div id={"sucessoDelete"} className="alert alert-success row" role="alert" style={{margin:"10px auto", width: "90%", textAlign:"center", fontSize:"22px", display:"none", justifyContent: 'center'}}>
                {successMessage}
                <img src={`${process.env.PUBLIC_URL}/crossicon.png`}  style={{width: "5%", height: "auto", marginLeft:"8px"}} alt={"Close Icon"} onClick={() => hide_message("sucessoDelete")}></img>
            </div> 

            <table className="table table-hover" style={{width: "70%", textAlign: "center"}}>
                <thead>
                    <tr>
                        <th scope="col">#</th>
                        <th scope="col">Template</th>
                        <th style={{textAlign: "right"}} scope="col">Delete</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        current_templates.length === 0 ?
                            <tr>
                                <th style={{textAlgin:"center"}}>No templates available</th> 
                                <td></td>
                                <td></td>
                            </tr>                     
                            
                            :

                            current_templates.map( (template, key) => {

                                return(

                                    <tr key={key}>
                                        <th scope='row'>{key}</th>
                                        <td>{template}</td>
                                        <td style={{textAlign: "right"}}><img src={`${process.env.PUBLIC_URL}/crossicon.png`}   style={{width: "2%"}} alt={"Close Icon"} onClick={() => delete_template(template)}></img></td>
                                    </tr>
                                )
                            })
                        
                        
                    }
                </tbody>
            </table>
            

        </div>
    )
}
 
export default Templates;