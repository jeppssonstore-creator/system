import { Container } from 'react-bootstrap';
import { Outlet } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';

const App = () => {
  return (
    <div className='d-flex flex-column min-vh-100'>
      <Header />
      <div className='d-flex flex-grow-1'>
        <Sidebar />
        <main className='flex-grow-1 p-4 bg-light'>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default App;