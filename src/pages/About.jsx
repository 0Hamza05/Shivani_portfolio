import { motion } from 'framer-motion';

export default function About() {
  return (
    <div style={{ paddingTop: 'calc(var(--nav-h) + 80px)', minHeight: '100vh', paddingLeft: '32px', paddingRight: '32px', maxWidth: '800px', margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <p style={{ fontSize: '1.4rem', lineHeight: '1.6', marginBottom: '64px', fontFamily: "'EB Garamond', serif" }}>
          I am a self-taught artist, photographer and director. My pieces have been acquired by places like the Whitney Museum, and I've auctioned my work internationally with Phillips; but my artwork on my Caribbean grandmother's wall holds more value to me than any museum exhibit.
          <br/><br/>
          I'm versatile because I have so many interests, and I enjoy the challenge of expressing myself in my work in as many ways as possible.
          <br/><br/>
          This is actually my second career, and the best part about my job is meeting new people, and telling their stories through each new project.
          <br/><br/>
          See you soon — S
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '80px', fontSize: '0.85rem', letterSpacing: '0.15em' }}>
          <a href="mailto:hello@shivani.com" style={{ textDecoration: 'none', color: 'var(--fg)', transition: 'color 0.2s' }}>HELLO@SHIVANI.COM</a>
          <a href="#" style={{ textDecoration: 'none', color: 'var(--fg)', transition: 'color 0.2s' }}>NEWSLETTER</a>
          <a href="#" style={{ textDecoration: 'none', color: 'var(--fg)', transition: 'color 0.2s' }}>INSTAGRAM</a>
          <a href="#" style={{ textDecoration: 'none', color: 'var(--fg)', transition: 'color 0.2s' }}>LINKEDIN</a>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '40px', paddingBottom: '80px' }}>
          <h3 style={{ fontSize: '0.65rem', letterSpacing: '0.2em', marginBottom: '32px', color: 'var(--fg-dim)' }}>SELECTED PRESS</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {[
              { publication: 'VOGUE', title: '10 Photographers Give Personal Accounts From The US Protests' },
              { publication: 'TIME', title: 'The Story Behind the Photograph That Resonated Around The World' },
              { publication: 'GQ', title: '25 Photographers on What Drives Their Work' },
              { publication: 'W MAGAZINE', title: 'For Some Photographers, There’s No Such Thing as Neutral' },
              { publication: 'NEW YORK MAGAZINE', title: 'Scenes From the Enduring Protests in New York' }
            ].map((press, i) => (
              <a key={i} href="#" style={{ display: 'flex', flexDirection: 'column', gap: '8px', cursor: 'pointer' }}>
                <span style={{ fontSize: '0.65rem', letterSpacing: '0.15em', color: 'var(--fg-dim)' }}>{press.publication}</span>
                <span style={{ fontFamily: "'EB Garamond', serif", fontSize: '1.2rem', color: 'var(--fg)' }}>{press.title}</span>
              </a>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
