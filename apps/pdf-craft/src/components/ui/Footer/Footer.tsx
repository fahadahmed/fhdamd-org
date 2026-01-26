import './footer.css'

export default function Footer() {

  const today = new Date().getFullYear();

  return (
    <footer className="footer-container">
      <h6 className="footer-logo">pdf <small>craft</small></h6>
      <ul className="footer-links">
        <li><a href="/terms">Terms & Conditions</a></li>
        <li><a href="/privacy">Privacy Policy</a></li>
        <li><a href="/contact">Contact Us</a></li>
        <li><a href="/resources">Resources</a></li>
      </ul>
    </footer>
  )
}