import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { VideoProvider } from './context/VideoContext';
import { AuthProvider } from './context/AuthContext'; // Import AuthProvider
import HomePage from './pages/HomePage';
import VideoPage from './pages/VideoPage';
import SearchPage from './pages/SearchPage';
import MoviesPage from './pages/MoviesPage';
import TVShowsPage from './pages/TVShowsPage';
import AnimePage from './pages/AnimePage';
import SeriesPage from './pages/SeriesPage';
import UploadPage from './pages/UploadPage';
import SettingsPage from './pages/SettingsPage';
import { LoginPage, SignupPage } from './pages/AuthPages'; // Import LoginPage and SignupPage
// Removed Modal imports and React hooks for now

function App() {
  // Removed modal state and useEffect

  // Removed handleCloseWelcomeModal function

  return (
    <Router>
      <AuthProvider> {/* Add AuthProvider here */}
        <VideoProvider>
          {/* Removed Welcome Modal */}

          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/video/:id" element={<VideoPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/movies" element={<MoviesPage />} />
          <Route path="/tv" element={<TVShowsPage />} />
          <Route path="/anime" element={<AnimePage />} />
          <Route path="/series/:seriesId" element={<SeriesPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/login" element={<LoginPage />} /> {/* Add Login Page Route */}
          <Route path="/signup" element={<SignupPage />} /> {/* Add Signup Page Route */}
        </Routes>
      </VideoProvider>
    </AuthProvider> {/* Close AuthProvider here */}
    </Router>
  );
}

export default App;