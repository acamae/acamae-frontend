function PrivateFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <div id="footer" className="app-footer" data-testid="private-footer">
      &copy; {currentYear} Alfonso Martin.
    </div>
  );
}

export default PrivateFooter;
