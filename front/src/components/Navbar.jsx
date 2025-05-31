import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { token, logout } = useAuth();

  if (!token) return null;

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex space-x-4">
            <Link to="/data" className="text-gray-700 hover:text-gray-900">Data</Link>
            <Link to="/manage" className="text-gray-700 hover:text-gray-900">Manage</Link>
            <Link to="/predict" className="text-gray-700 hover:text-gray-900">Predict</Link>
          </div>
          <button 
            onClick={logout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;