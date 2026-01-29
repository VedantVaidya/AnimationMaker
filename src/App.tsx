import { Layout } from './components/Layout';
import { Controllers } from './components/Controllers/Controllers';
import { PreviewWindow } from './components/Preview/PreviewWindow';
import { ImageProvider } from './context/ImageContext';

function App() {
  return (
    <ImageProvider>
      <Layout
        controllers={<Controllers />}
        preview={<PreviewWindow />}
      />
    </ImageProvider>
  );
}

export default App;
