import { useState } from 'react';
import { AppSidebar, NavSection } from '../components/AppSidebar';

export default function Index() {
  const [section, setSection] = useState<NavSection>('chat');

  return (
    <div className="app-shell">
      <AppSidebar active={section} onNavigate={setSection} />
      <main className="app-main">
        <div className="app-header">
          <div>
            <h1 className="page-title">VoipTupniquim</h1>
            <p>Seção atual: {section}</p>
          </div>
        </div>
        <section className="panel">
          <h2>Bem-vindo ao painel</h2>
          <p>Escolha uma seção na barra lateral para navegar entre as telas.</p>
        </section>
      </main>
    </div>
  );
}
