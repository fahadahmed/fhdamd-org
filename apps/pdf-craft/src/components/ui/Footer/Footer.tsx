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
          title: 'Tools',
          links: [
            { href: '/mergepdf',   label: 'Merge PDFs' },
            { href: '/imagetopdf', label: 'Image to PDF' },
            { href: '/encryptpdf', label: 'Protect PDF' },
            { href: '/decryptpdf', label: 'Unlock PDF' },
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
