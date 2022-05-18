import './App.css';
import Navbar from './Navigation/Navbar';
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router,Routes, Route } from 'react-router-dom';
import Upload from './Components/Upload';
import Generate from './Components/Generate';
import Home from './Components/Home';

function App() {
  return (
    <div>
      <Navbar />
      <Router>
           <Routes>
            <Route exact path='/' element={< Home />}></Route>
            <Route exact path='/upload' element={< Upload />}></Route>
            <Route exact path='/generate' element={< Generate />}></Route>
          </Routes>
       </Router>
    </div>
  );
}

export default App;
