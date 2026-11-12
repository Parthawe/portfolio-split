import PublicProjectSummary from '../../components/case-study/PublicProjectSummary'

export default function TransfiPage() {
  return <PublicProjectSummary
    slug="transfi-project"
    workflow={{
      role: 'Lead product designer',
      subtitle: 'Redesigning the buy-crypto quote so customers can review what they pay, what they receive, and the fees before continuing.',
      contribution: 'I led product design for the consumer widget and merchant dashboard. For this flow, I separated the spend and receive fields and grouped the estimate, network fee, and processing fee in one summary above the buy button.',
      media: (
        <section className="transfi-quote-proof" aria-labelledby="transfi-quote-title">
          <h2 id="transfi-quote-title">Reviewing a buy quote</h2>
          <div className="transfi-quote-proof__screens">
            <figure>
              <figcaption>Before</figcaption>
              <img data-project-preview src="/Assets/Projects/Transfi/public/buy-quote-before.webp" width="485" height="668"
                alt="Original buy screen with asset and payment method selectors above a compact price summary." decoding="async" />
              <p>Asset, payment method, and price summary share one screen.</p>
            </figure>
            <figure>
              <figcaption>Redesign</figcaption>
              <img data-project-preview src="/Assets/Projects/Transfi/public/buy-quote-after.webp" width="401" height="699"
                alt="Redesigned buy screen with separate pay and receive fields, an estimated quote, and itemized network and processing fees." decoding="async" />
              <p>Pay and receive have their own fields. The estimate includes a fee breakdown.</p>
            </figure>
          </div>
          <p className="transfi-quote-proof__note">Example amounts from the original design comparison.</p>
        </section>
      ),
    }}
  />
}
