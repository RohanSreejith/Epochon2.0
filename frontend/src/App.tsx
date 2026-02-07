import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SessionProvider } from './state/SessionContext';
import { Layout } from './Layout';
import { Home } from './pages/Home';
import { Session } from './pages/Session';

function App() {
  return (
    <Router>
      <SessionProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/session" element={<Session />} />
          </Route>
        </Routes>
      </SessionProvider>
    </Router>
  );
}

export default App;
