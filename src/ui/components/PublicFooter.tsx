function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <div id="footer" className="app-footer" data-testid="public-footer">
      &copy; {currentYear} Alfonso Martin.
    </div>
  );
}

export default PublicFooter;
