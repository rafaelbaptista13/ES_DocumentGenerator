import './App.css';
import Navbar from './Components/Navbar';
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router,Routes, Route } from 'react-router-dom';
import Upload from './Pages/Upload';
import Generate from './Pages/Generate';
import Home from './Pages/Home';
import Templates from './Pages/Templates'



function App() {
  return (
    <div>
      <Navbar />
      <Router>
           <Routes>
            <Route exact path='/' element={< Home />}></Route>
            <Route exact path='/upload' element={< Upload />}></Route>
            <Route exact path='/generate' element={< Generate />}></Route>
            <Route exact path='/templates' element={< Templates />}></Route>
          </Routes>
       </Router>
    </div>
  );
}



export default App;
