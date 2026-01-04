import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { EventForm } from '@/pages/EventForm';
import { SuccessPage } from '@/pages/SuccessPage';
import { AdminPage } from '@/pages/AdminPage';
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/chronosadminpage" element={<AdminPage />} />
        <Route path="/evento/:token" element={<EventForm />} />
        <Route path="/sucesso" element={<SuccessPage />} />
        {/* Rota de teste ou redirecionamento */}
        <Route path="/" element={
          <div className="min-h-screen flex items-center justify-center p-6 text-center">
            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-primary">Chronos by Anotaê!</h1>
              <p className="text-muted-foreground">Acesse o link único enviado para o seu evento.</p>
            </div>
          </div>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
