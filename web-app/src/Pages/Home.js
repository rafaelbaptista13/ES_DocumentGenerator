import React from 'react';
 
function Home (){
    return (
        <div style={{marginTop: '2%', textAlign: 'center'}}>
            <br/>
            <h1>Welcome to the Document Generator WebSite!</h1>
            <br/>
            <p> Here you can upload your templates of documents, and then you can generate documents just uploading a JSON file.</p>
            <p style={{ position: 'fixed', bottom: '3%', textAlign: 'center', width: '100%'}}>This work was performed in Software Engineering Course in Master's Degree in Software Engineering at the University of Aveiro.</p>
        </div>
    )
}
 
export default Home;