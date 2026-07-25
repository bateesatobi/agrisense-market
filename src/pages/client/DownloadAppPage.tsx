import { CloudSun, FlaskConical, ScanLine, Smartphone, Sprout } from 'lucide-react';
import { APP_DOWNLOAD } from '../../data/seed';

const TOOLS = [
  {
    icon: ScanLine,
    title: 'Crop scanning',
    text: 'Symptom photo diagnosis and early spectrum scans.',
  },
  {
    icon: FlaskConical,
    title: 'Soil pH from GPS',
    text: 'Estimate pH with SoilGrids using your farm location.',
  },
  {
    icon: Sprout,
    title: 'Yield estimation',
    text: 'Walk your field boundary and use Sentinel-2 NDVI.',
  },
  {
    icon: CloudSun,
    title: 'Weather for farming',
    text: 'Local forecasts to plan spraying and planting.',
  },
];

export function DownloadAppPage() {
  return (
    <div className="container section">
      <div className="app-cta-panel" style={{ marginBottom: '1.5rem' }}>
        <div>
          <p className="eyebrow" style={{ color: '#f0d36b' }}>
            AgriSense mobile
          </p>
          <h2>Field tools live in the app — shopping stays here</h2>
          <p>{APP_DOWNLOAD.tagline}</p>
          <a
            className="btn btn-gold"
            href={APP_DOWNLOAD.androidApk}
            target="_blank"
            rel="noreferrer"
          >
            <Smartphone size={18} /> Download Android APK
          </a>
        </div>
        <div className="tool-grid">
          {TOOLS.map((t) => (
            <div key={t.title} className="tool-tile">
              <t.icon size={22} />
              <strong>{t.title}</strong>
              <span style={{ fontWeight: 500, opacity: 0.85, fontSize: 13 }}>{t.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <h3 style={{ marginTop: 0 }}>Why split website and app?</h3>
        <p className="muted">
          Marketplace checkout works best in the browser for buyers and suppliers. Scanning,
          GPS soil mapping, satellite yield walks, and weather alerts need camera, GPS tracking,
          and offline-friendly mobile UX — so we guide farmers to AgriSense for those tools.
        </p>
      </div>
    </div>
  );
}
