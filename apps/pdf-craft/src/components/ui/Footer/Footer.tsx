import './footer.css'

export default function Footer() {

  const today = new Date().getFullYear();

  return (
    <footer className="footer-container">
      <small>Copyright &copy; {today} - PDF Craft</small>
    </footer>
  )
}