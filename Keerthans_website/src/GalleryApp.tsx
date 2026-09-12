import { useEffect, useRef, useState, type FormEvent } from 'react'
import { PROJECTS, type ProjectImage } from './projects'

const ALL_IMAGES = PROJECTS.flatMap((project) => project.images)

// REPLACE THIS URL with your deployed Google Apps Script URL
const GOOGLE_SHEET_API = 'https://script.google.com/macros/s/AKfycbzDSi7oqNniAuFUZu5nY_SSZt-p2LE_wSnYdvByUW86mIctHsY8b8T_YcdQH5jtdEyI/exec';

const formatFeedbackDate = (createdAt?: string) => {
  if (!createdAt) return ''
  const date = new Date(createdAt)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export default function GalleryApp() {
  const [page, setPage] = useState<'home' | 'projects' | 'feedback' | 'careers'>('home')
  const [selected, setSelected] = useState<{ images: ProjectImage[]; index: number } | null>(null)
  const galleryTrackRef = useRef<HTMLDivElement>(null)
  const [testimonials, setTestimonials] = useState<Array<{ message: string; author: string; createdAt?: string }>>([])
  const [feedback, setFeedback] = useState({ author: '', message: '' })
  const [feedbackStatus, setFeedbackStatus] = useState('')
  const [applicationStatus, setApplicationStatus] = useState('')

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!selected) return
      if (event.key === 'Escape') setSelected(null)
      if (event.key === 'ArrowLeft') setSelected({ ...selected, index: (selected.index - 1 + selected.images.length) % selected.images.length })
      if (event.key === 'ArrowRight') setSelected({ ...selected, index: (selected.index + 1) % selected.images.length })
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selected])

  const loadTestimonials = () => {
    fetch(GOOGLE_SHEET_API)
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Unable to load testimonials')))
      .then((data) => setTestimonials(Array.isArray(data.testimonials) ? data.testimonials : []))
      .catch(() => setTestimonials([]))
  }

  useEffect(() => {
    loadTestimonials()
  }, [])

  useEffect(() => {
    const interval = window.setInterval(() => {
      const track = galleryTrackRef.current
      if (track && track.scrollWidth > track.clientWidth) {
        track.scrollLeft += 1
        if (track.scrollLeft >= track.scrollWidth - track.clientWidth - 1) track.scrollLeft = 0
      }
    }, 24)
    return () => window.clearInterval(interval)
  }, [page])
  
  // Add a reference for the testimonials section to allow auto-scrolling it too
  const testimonialsTrackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const interval = window.setInterval(() => {
      const track = testimonialsTrackRef.current
      if (track && track.scrollWidth > track.clientWidth) {
        track.scrollLeft += 1
        if (track.scrollLeft >= track.scrollWidth - track.clientWidth - 1) track.scrollLeft = 0
      }
    }, 24)
    return () => window.clearInterval(interval)
  }, [page])

  const openProject = (images: ProjectImage[], index = 0) => setSelected({ images, index })

  const submitFeedback = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFeedbackStatus('Sending...')
    try {
      await fetch(GOOGLE_SHEET_API, { 
        method: 'POST', 
        mode: 'no-cors', // Required for Google Script POST requests
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(feedback) 
      })
      
      setFeedback({ author: '', message: '' })
      setFeedbackStatus('Thank you for sharing your experience.')
      
      // Refresh the list from the sheet after submission
      setTimeout(() => {
        loadTestimonials()
      }, 1000)
    } catch (error) {
      setFeedbackStatus('We could not send your feedback. Please try again.')
    }
  }

  const submitApplication = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setApplicationStatus('Sending application...')
    const formData = new FormData(event.currentTarget)
    try {
      const response = await fetch(`${import.meta.env.BASE_URL}api/apply`, { method: 'POST', body: formData })
      if (!response.ok) throw new Error('Unable to submit application')
      setApplicationStatus('Application submitted successfully.')
      event.currentTarget.reset()
    } catch {
      setApplicationStatus('We could not submit your application. Please try again.')
    }
  }

  return (
    <main className="gallery-app">
      <header className="gallery-nav">
        <button className="gallery-brand" onClick={() => setPage('home')} aria-label="RehkaHomes home">
          <span className="brand-name">REHKAHOMES</span>
          <span className="brand-tagline">BUILD. LOVE. LIVE.</span>
        </button>
        <nav aria-label="Primary navigation">
          <button onClick={() => setPage('home')}>Home</button>
          <a href="#about">About</a>
          <a href="#services">Our Services</a>
          <button onClick={() => setPage('projects')}>Our Work</button>
          {/* <button onClick={() => setPage('careers')}>Join Our Team</button> */}
          <a href="#contact">Contact</a>
        </nav>
      </header>

      {page === 'home' ? (
        <>
          <section className="gallery-hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(18, 17, 15, .86), rgba(18, 17, 15, .48)), url('${import.meta.env.BASE_URL}assets/image-13.jpeg')` }}>
            <p className="gallery-kicker">REHKAHOMES / PORTFOLIO</p>
            <h1>Spaces with a sense of place.</h1>
            <p className="gallery-lede">A collection of homes and spaces brought to life by RehkaHomes.</p>
            <button className="gallery-link" onClick={() => setPage('projects')}>VIEW ALL OUR WORK <span>→</span></button>
          </section>
          <section id="about" className="about-section">
            <p className="gallery-kicker">About RehkaHomes</p>
            <div>
              <h2>Thoughtful spaces, carefully brought to life.</h2>
              <p>RehkaHomes brings together construction, interiors, and considered design to create homes and spaces made for everyday life.</p>
              <p>Explore the gallery to see the work through the details, materials, and spaces themselves.</p>
              <p>From the first idea to the final finish, we focus on honest materials, careful coordination, and spaces that feel truly lived in.</p>
            </div>
            <div className="about-visuals" aria-label="From construction to finished space">
              <figure className="about-image about-image-process">
                <img src={`${import.meta.env.BASE_URL}assets/image-07.jpeg`} alt="RehkaHomes construction in progress" loading="lazy" />
                <figcaption><span>01</span> In progress</figcaption>
              </figure>
              <figure className="about-image about-image-result">
                <img src={`${import.meta.env.BASE_URL}assets/image-28.jpeg`} alt="RehkaHomes completed space" loading="lazy" />
                <figcaption><span>02</span> Final result</figcaption>
              </figure>
              <div className="about-visual-line" aria-hidden="true">→</div>
            </div>
          </section>
          <section className="home-work" aria-label="Our work gallery">
            <div className="home-work-heading">
              <p className="gallery-kicker">OUR WORK</p>
              <h2>Explore the gallery.</h2>
            </div>
            <div className="project-masonry all-images-gallery" ref={galleryTrackRef}>
              {ALL_IMAGES.map((image, index) => (
                <button className={`project-image project-image-${index % 3 + 1}`} key={image.url} onClick={() => openProject(ALL_IMAGES, index)}>
                  <img src={image.url} alt={image.alt} loading="lazy" />
                </button>
              ))}
            </div>
          </section>
          <section id="services" className="services-section">
            <div className="services-header">
              <span className="kicker">Our Services</span>
              <h2>Architectural and construction solutions for modern living</h2>
            </div>
            <div className="services-grid">
              <div className="service-card">
                <h3>Residential Design & Construction</h3>
                <p>Creating bespoke homes and luxury villas with optimized layouts and sustainable modern designs.</p>
                <img src={`${import.meta.env.BASE_URL}assets/image-01.jpeg`} alt="Residential" className="service-image" />
              </div>
              <div className="service-card">
                <h3>Strategic Project Planning</h3>
                <p>Comprehensive budgeting and timeline management to ensure a seamless transition from blueprint to building.</p>
                <img src={`${import.meta.env.BASE_URL}assets/image-02.jpeg`} alt="Planning" className="service-image" />
              </div>
              <div className="service-card">
                <h3>Commercial & Industrial Development</h3>
                <p>Developing high-utility commercial hubs and industrial plants engineered for durability and efficiency.</p>
                <img src={`${import.meta.env.BASE_URL}assets/image-03.jpeg`} alt="Commercial" className="service-image" />
              </div>
              <div className="service-card">
                <h3>Interior Renovation & Design</h3>
                <p>Transforming dated interiors into contemporary spaces through artistic remodeling and precision finishes.</p>
                <img src={`${import.meta.env.BASE_URL}assets/image-04.jpeg`} alt="Renovation" className="service-image" />
              </div>
            </div>
          </section>
          <section className="philosophy-section">
            <div className="philosophy-header">
              <h2>The Rehka Standard</h2>
            </div>
            <div className="philosophy-content">
              <div className="philosophy-item">
                <h3>Uncompromising Integrity</h3>
                <p>We believe a building is only as strong as the honesty of its materials. From the foundation to the final coat of paint, we use only verified, premium-grade resources.</p>
              </div>
              <div className="philosophy-item">
                <h3>Architectural Empathy</h3>
                <p>We don't just build structures; we build for the people who live in them. Every corner is designed to enhance the daily rituals and emotional well-being of the homeowner.</p>
              </div>
              <div className="philosophy-item">
                <h3>Precision Engineering</h3>
                <p>Where others see 'good enough,' we see a millimeter of difference. Our commitment to precision ensures that your home remains a timeless asset for generations.</p>
              </div>
            </div>
          </section>
          <section className="partners-banner" aria-label="Our trusted vendors">
            <div className="partners-heading">
              <h2>Our Trusted Vendors</h2>
              <p>Building long-term partnerships through quality, precision, and reliability.</p>
            </div>
            <div className="partners-track" ref={galleryTrackRef}>
              {[...Array(2)].map((_, i) => (
                <div key={i} className="partners-slide">
                  <img src="https://www.asianpaints.com/favicon.ico" alt="Asian Paints" className="partner-logo" />
                  <img src="https://www.jaquar.com/favicon.ico" alt="Jaquar" className="partner-logo" />
                  <img src="https://www.kajaria.com/favicon.ico" alt="Kajaria" className="partner-logo" />
                  <img src="https://www.saint-gobain.com/favicon.ico" alt="Saint-Gobain" className="partner-logo" />
                  <img src="https://www.ultratechcement.com/favicon.ico" alt="UltraTech Cement" className="partner-logo" />
                </div>
              ))}
            </div>
          </section>
          <section className="faq-section" id="faq">
            <div className="faq-header">
              <h2>Frequently Asked Questions</h2>
            </div>
            <div className="faq-grid">
              <div className="faq-item">
                <h3>Do you provide a warranty on construction?</h3>
                <p>Yes, we provide a comprehensive structural warranty that ensures your home remains safe and sound for decades.</p>
              </div>
              <div className="faq-item">
                <h3>How do you handle budget overruns?</h3>
                <p>We provide a detailed cost breakdown at the start. Any changes are discussed and approved in writing before implementation to ensure no surprises.</p>
              </div>
              <div className="faq-item">
                <h3>Can you work with our own architects?</h3>
                <p>Absolutely. We collaborate seamlessly with external architects to bring your specific vision to life with our construction expertise.</p>
              </div>
              <div className="faq-item">
                <h3>How long does a typical project take?</h3>
                <p>Timelines vary by project scale, but we provide a precise Gantt chart at the start so you can track progress in real-time.</p>
              </div>
              <div className="faq-item">
                <h3>Do you handle all the government permits and approvals?</h3>
                <p>Yes, we manage the entire legal process, from zoning approvals to occupancy certificates, ensuring a stress-free experience for the client.</p>
              </div>
              <div className="faq-item">
                <h3>What makes your design approach different?</h3>
                <p>We blend traditional craftsmanship with smart-home technology, ensuring your space is both timeless in beauty and modern in functionality.</p>
              </div>
            </div>
          </section>
          <section id="testimonials" className="testimonials-section">
            <div>
              <p className="gallery-kicker">CLIENT VOICES</p>
              <h2>What clients say.</h2>
            </div>
            <div className="testimonials-list" ref={testimonialsTrackRef}>
              {testimonials.length ? testimonials.map((testimonial, index) => (
                <blockquote key={`${testimonial.author}-${index}`}>
                  “{testimonial.message}”
                  <cite>{testimonial.author}{formatFeedbackDate(testimonial.createdAt) ? ` · ${formatFeedbackDate(testimonial.createdAt)}` : ''}</cite>
                </blockquote>
              )) : <p>No feedback has been shared yet.</p>}
            </div>
            <button className="feedback-cta" onClick={() => setPage('feedback')}>Share your feedback <span>→</span></button>
          </section>
        </>
      ) : page === 'projects' ? (
        <section className="projects-page">
          <div className="projects-heading">
            <p className="gallery-kicker">REHKAHOMES / PROJECTS</p>
            <h1>OUR WORK</h1>
            <p>Every project is an opportunity to build something meaningful.</p>
          </div>
          <div className="project-masonry all-images-gallery" ref={galleryTrackRef}>
            {ALL_IMAGES.map((image, index) => (
              <button className={`project-image project-image-${index % 3 + 1}`} key={image.url} onClick={() => openProject(ALL_IMAGES, index)}>
                <img src={image.url} alt={image.alt} loading="lazy" />
              </button>
            ))}
          </div>
        </section>
      ) : page === 'feedback' ? (
        <section className="form-page">
          <p className="gallery-kicker">SHARE FEEDBACK</p>
          <h1>Tell us about your experience.</h1>
          <form className="site-form" onSubmit={submitFeedback}>
            <label>Your name<input required value={feedback.author} onChange={(event) => setFeedback({ ...feedback, author: event.target.value })} /></label>
            <label>Your feedback<textarea required rows={6} value={feedback.message} onChange={(event) => setFeedback({ ...feedback, message: event.target.value })} /></label>
            <button className="form-submit" type="submit">Submit Feedback</button>
            {feedbackStatus && <p className="form-status">{feedbackStatus}</p>}
          </form>
        </section>
      ) : (
        <section className="form-page">
          <p className="gallery-kicker">JOIN OUR TEAM</p>
          <h1>Bring your craft to the work.</h1>
          <form className="site-form" onSubmit={submitApplication} encType="multipart/form-data">
            <label>Full name<input required name="name" /></label>
            <label>Degree or qualification<input required name="degree" /></label>
            <label>Experience level<select required name="status" defaultValue=""><option value="" disabled>Select one</option><option value="fresher">Fresher</option><option value="experienced">Experienced</option></select></label>
            <label>Years of experience<input name="years" type="number" min="0" /></label>
            <label>Phone number<input required name="phone" type="tel" /></label>
            <label>Resume<input required name="resume" type="file" accept=".pdf,.doc,.docx" /></label>
            <button className="form-submit" type="submit">Submit Application</button>
            {applicationStatus && <p className="form-status">{applicationStatus}</p>}
          </form>
        </section>
      )}

      <section id="contact" className="contact-section">
        <div>
          <p className="gallery-kicker">Contact</p>
          <h2>Let’s talk about your space.</h2>
        </div>
        <div className="contact-details">
          <a href="mailto:hello@rehkahomes.com">hello@rehkahomes.com</a>
          <a href="tel:+919876543210">+91 98765 43210</a>
          <span>Tamil Nadu, India</span>
          <span>Mon – Sat, 9:00 AM – 6:00 PM</span>
        </div>
      </section>
      <footer className="gallery-footer">
        <span className="footer-brand">
          <strong>REHKAHOMES</strong>
          <small>BUILD. LOVE. LIVE.</small>
        </span>
        <a href="mailto:hello@rehkahomes.com">Email us</a>
        <span>© 2026</span>
      </footer>

      {selected && <div className="lightbox" role="dialog" aria-modal="true" aria-label="Project gallery">
        <button className="lightbox-close" onClick={() => setSelected(null)} aria-label="Close gallery">×</button>
        <button className="lightbox-arrow left" onClick={() => setSelected({ ...selected, index: (selected.index - 1 + selected.images.length) % selected.images.length })} aria-label="Previous image">←</button>
        <img src={selected.images[selected.index].url} alt={selected.images[selected.index].alt} />
        <button className="lightbox-arrow right" onClick={() => setSelected({ ...selected, index: (selected.index + 1) % selected.images.length })} aria-label="Next image">→</button>
        <div className="lightbox-counter">{String(selected.index + 1).padStart(2, '0')} / {String(selected.images.length).padStart(2, '0')}</div>
      </div>}
    </main>
  )
}