import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import App from './App';
import AdminFrontend from './admin/AdminFrontend';
// ... other imports

// We need to wrap the existing App component content into a Layout or similar to keep it clean.
// Or we can move the current App.jsx content to a new 'PublicView.jsx' component.

import PublicView from './PublicView';

function Root() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/*" element={<PublicView />} />
                <Route path="/admin/*" element={<AdminFrontend />} />
            </Routes>
        </BrowserRouter>
    );
}

export default Root;
