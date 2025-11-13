import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ScenesIndex from './routes/ScenesIndex';
import SceneWrapper from './routes/SceneWrapper';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ScenesIndex />} />
        <Route path="/scene/:id" element={<SceneWrapper />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
