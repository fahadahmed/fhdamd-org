import { SiteFooter } from '@fhdamd/threads'
import { RiqaWordmark } from '../Brand/Brand'

export default function Footer() {
  return (
    <SiteFooter
      brand={<RiqaWordmark inverse />}
      copyright={`© ${new Date().getFullYear()} Riqa. All rights reserved.`}
      tagline="Simple tools. Honest pricing."
      columns={[
        {
          title: 'Edit & Convert',
          links: [
            { href: '/splitpdf',    label: 'Split PDF' },
            { href: '/mergepdf',    label: 'Merge PDFs' },
            { href: '/compresspdf', label: 'Compress PDF' },
            { href: '/imagetopdf',  label: 'Image to PDF' },
          ],
        },
        {
          title: 'Protect & Sign',
          links: [
            { href: '/signpdf',    label: 'Sign PDF' },
            { href: '/encryptpdf', label: 'Protect PDF' },
            { href: '/decryptpdf', label: 'Unlock PDF' },
          ],
        },
        {
          title: 'Resources',
          links: [
            { href: '/resources', label: 'Articles' },
          ],
        },
        {
          title: 'Account',
          links: [
            { href: '/signup',   label: 'Sign up' },
            { href: '/signin',   label: 'Log in' },
            { href: '/#pricing', label: 'Buy credits' },
          ],
        },
        {
          title: 'Legal',
          links: [
            { href: '/privacy', label: 'Privacy Policy' },
            { href: '/terms',   label: 'Terms & Conditions' },
            { href: '/contact', label: 'Contact' },
          ],
        },
      ]}
      bottomRight="Built on the Threads design system"
    />
  )
}
