import { useEffect, useRef, useState, type FormEvent } from 'react'
import { PROJECTS, type ProjectImage } from './projects'

const ALL_IMAGES = PROJECTS.flatMap((project) => project.images)

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

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}api/testimonials`)
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Unable to load testimonials')))
      .then((data) => setTestimonials(Array.isArray(data.testimonials) ? data.testimonials : []))
      .catch(() => setTestimonials([]))
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

  const openProject = (images: ProjectImage[], index = 0) => setSelected({ images, index })

  const submitFeedback = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFeedbackStatus('Sending...')
    try {
      const response = await fetch(`${import.meta.env.BASE_URL}api/testimonials`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(feedback) })
      if (!response.ok) throw new Error('Unable to submit feedback')
      const data = await response.json()
      setTestimonials((current) => [data.testimonial, ...current])
      setFeedback({ author: '', message: '' })
      setFeedbackStatus('Thank you for sharing your experience.')
    } catch {
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
          <button onClick={() => setPage('projects')}>Our Work</button>
          <button onClick={() => setPage('feedback')}>Share Feedback</button>
          <button onClick={() => setPage('careers')}>Join Our Team</button>
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
          <section id="testimonials" className="testimonials-section">
            <div>
              <p className="gallery-kicker">CLIENT VOICES</p>
              <h2>What clients say.</h2>
            </div>
            <div className="testimonials-list">
              {testimonials.length ? testimonials.slice(0, 3).map((testimonial, index) => (
                <blockquote key={`${testimonial.author}-${index}`}>
                  “{testimonial.message}”
                  <cite>{testimonial.author}{formatFeedbackDate(testimonial.createdAt) ? ` · ${formatFeedbackDate(testimonial.createdAt)}` : ''}</cite>
                </blockquote>
              )) : <p>No feedback has been shared yet.</p>}
              <button className="feedback-cta" onClick={() => setPage('feedback')}>Share your feedback <span>→</span></button>
            </div>
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