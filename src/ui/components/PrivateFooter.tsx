import packageJson from '../../../package.json';

function PrivateFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <div id="footer" className="app-footer" data-testid="private-footer">
      &copy; {currentYear} Alfonso Martin.{' '}
      <span style={{ marginLeft: 8 }}>v{packageJson.version}</span>
    </div>
  );
}

export default PrivateFooter;
