import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RsvpPage from './pages/RsvpPage';
import NotFoundPage from './pages/NotFoundPage';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/rsvp/:token" element={<RsvpPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
