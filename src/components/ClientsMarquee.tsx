import '../styles/clients-marquee.css'

const LOGOS = '/Assets/images/logos'

const CLIENT_LOGOS = [
  { src: `${LOGOS}/mentra-logo.webp`, alt: 'Mentra', width: 627, height: 96 },
  { src: `${LOGOS}/ibm-logo.webp`, alt: 'IBM', width: 1100, height: 443 },
  { src: `${LOGOS}/nyu-tisch.webp`, alt: 'NYU Tisch School of the Arts', width: 2549, height: 443 },
  { src: `${LOGOS}/transfi-logo.webp`, alt: 'TransFi', width: 549, height: 98 },
  { src: `${LOGOS}/the-point-logo.webp`, alt: 'The Point CDC', width: 1907, height: 443 },
  { src: `${LOGOS}/monsoonfish-logo.webp`, alt: 'Monsoonfish', width: 1978, height: 443 },
]

/* Infinite right-to-left logo marquee. The track holds two copies of the
   logo set and slides -50%; the second copy is decorative only. */
export default function ClientsMarquee() {
  return (
    <div className="wr-clients cl-marquee" aria-label="Organizations my work made a difference for">
      <p className="wr-clients-label">
        Where my work made a difference <span aria-hidden="true">{'↘'}</span>
      </p>
      <div className="cl-marquee-viewport">
        <div className="cl-marquee-track">
          {CLIENT_LOGOS.map((logo) => (
            <img key={logo.alt} src={logo.src} alt={logo.alt} width={logo.width} height={logo.height} loading="lazy" />
          ))}
          {CLIENT_LOGOS.map((logo) => (
            <img key={`${logo.alt}-dup`} src={logo.src} alt="" width={logo.width} height={logo.height} aria-hidden="true" loading="lazy" />
          ))}
        </div>
      </div>
    </div>
  )
}
