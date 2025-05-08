import React from 'react';
import Layout from '../components/layout/Layout';
import VideoUploader from '../components/video/VideoUploader';
// import { useAuth } from '../context/AuthContext'; // No longer needed for this page's core logic
// import { Navigate } from 'react-router-dom'; // No longer needed for redirect

const UploadPage: React.FC = () => {
  // const { authState } = useAuth(); // No longer checking authState here

  // Redirect if not authenticated - REMOVED
  // if (!authState.isAuthenticated) {
  //   return <Navigate to="/login" replace />;
  // }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <VideoUploader />
      </div>
    </Layout>
  );
};

export default UploadPage;