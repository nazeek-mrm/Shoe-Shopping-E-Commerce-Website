import { Link } from 'react-router-dom'

export default function About() {
  return (
    <div className="page section">
      <div className="split">
        <div>
          <h1>A shoe store that tells you everything</h1>
          <p>
            SHOE MART started in 2020 as a small import counter on Peradeniya Road. We noticed
            that customers kept returning other online purchases — wrong size, wrong material,
            not what the photo showed. So we decided to build something different: a store where
            every specification is listed clearly, and every pair can be inspected in person.
          </p>
          <p>
            We stock genuine footwear from Nike, Adidas, Puma, Reebok, New Balance, Vans and
            Converse — sourced through authorised distributors. No grey market imports,
            no fakes, no compromises.
          </p>

          <h2 style={{ marginTop: 34 }}>What happens before a pair is listed</h2>
          <p>
            New pairs are unpacked and inspected for manufacturing defects before they go on the
            shelf. Pre-owned pairs receive more attention: the upper, sole, insole and stitching
            are all checked, and the pair is cleaned before listing. Only then does it get a
            photograph and a price.
          </p>

          <h2 style={{ marginTop: 34 }}>Buying a pre-owned pair here</h2>
          <p>
            Our pre-owned stock is mostly lightly used pairs from individuals and corporate
            uniforms, inspected and cleaned to a consistent standard. They carry a six month
            warranty from the shop and we will show you photos of the actual pair before you
            commit to buying.
          </p>

          <Link className="btn" to="/shop" style={{ marginTop: 12 }}>See what's in stock</Link>
        </div>

        <div className="panel">
          <h3>The shop</h3>
          <ul className="info-list">
            <li><strong>Address</strong>142 Peradeniya Road, Kandy</li>
            <li><strong>Open</strong>Monday to Saturday, 9am to 7pm. Closed Sundays and poya days.</li>
            <li><strong>Phone or WhatsApp</strong>077 123 4567</li>
            <li><strong>Email</strong>hello@shoemart.lk</li>
            <li><strong>Sizing help</strong>Not sure about your size? Come in and try the pair before you buy. We measure your foot if needed.</li>
            <li><strong>Trade in</strong>Bring your old pair and we will value it against the new one.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
