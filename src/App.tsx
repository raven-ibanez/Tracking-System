import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TrackingQuery from './components/TrackingQuery';
import TrackingAdmin from './components/TrackingAdmin';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TrackingQuery />} />
        <Route path="/admin" element={<TrackingAdmin />} />
      </Routes>
    </Router>
  );
}

export default App;