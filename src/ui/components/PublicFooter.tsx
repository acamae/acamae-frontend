import packageJson from '../../../package.json';

function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <div id="footer" className="app-footer" data-testid="public-footer">
      &copy; {currentYear} Alfonso Martin.{' '}
      <span style={{ marginLeft: 8 }}>v{packageJson.version}</span>
    </div>
  );
}

export default PublicFooter;
