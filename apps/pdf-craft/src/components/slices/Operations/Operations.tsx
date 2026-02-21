import { Button, Heading } from '../../ui'
import './operations.css'
export default function Operations() {
  return (
    <div className="operations-slice">
      <Heading variant='section'>Start editing your PDF</Heading>
      <OperationsContainer />
    </div>
  )
}

export function OperationsContainer() {
  return (
    <div className="operations-container">
      <div className="operation-card">
        <img src="/icons/icon-merge.svg" alt="Merge PDFs" />
        <h3>Merge PDFs</h3>
        <p>Combine multiple PDF documents into one document.</p>
        <Button kind="secondary" type="linkButton" url="/mergepdf" text="MERGE" />
      </div>
      <div className="operation-card">
        <img src="/icons/icon-convert.svg" alt="Image to PDF" />
        <h3>Image to PDF</h3>
        <p>Convert JPG & PNG into PDF format.</p>
        <Button kind="secondary" type="linkButton" url="/imagetopdf" text="CONVERT" />
      </div>
      <div className="operation-card disabled">
        <img src="/icons/icon-encrypt.svg" alt="Protect PDF" />
        <h3>Protect PDF</h3>
        <p>Secure PDF from unauthorised use with a password.</p>
        <h4>Coming Soon!</h4>
      </div>
      <div className="operation-card disabled">
        <img src="/icons/icon-unlock.svg" alt="Unlock PDF" />
        <h3>Unlock PDF</h3>
        <p>Remove password protection and restrictions easily.</p>
        <h4>Coming Soon!</h4>
      </div>
    </div>
  )
}