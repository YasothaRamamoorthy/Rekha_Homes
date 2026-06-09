import React, { useEffect, useState } from 'react';

const CATEGORY_FALLBACKS = {
  architecture: ['/src/assets/arch1.svg','/src/assets/arch2.svg','/src/assets/arch3.svg'],
  construction: ['/src/assets/constr1.svg','/src/assets/constr2.svg','/src/assets/constr3.svg'],
  interior: ['/src/assets/interior1.svg','/src/assets/interior2.svg','/src/assets/interior3.svg'],
};

function App() {
  const [images, setImages] = useState({ architecture: [], construction: [], interior: [] });
  const [gallery, setGallery] = useState({ open: false, category: 'architecture', index: 0 });
  const [appointment, setAppointment] = useState({ name: '', email: '', service: '', message: '' });

  const handleAppointmentChange = (e) => {
    const { name, value } = e.target;
    setAppointment((prev) => ({ ...prev, [name]: value }));
  };

  const handleAppointmentSubmit = (e) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Appointment Request from ${appointment.name}`);
    const body = encodeURIComponent(`Name: ${appointment.name}\nEmail: ${appointment.email}\nService: ${appointment.service}\nMessage: ${appointment.message}`);
    window.location.href = `mailto:hello@keerthansbuild.com?subject=${subject}&body=${body}`;
  };

  const openWhatsApp = () => {
    const text = encodeURIComponent(`Hello, I would like to book an appointment for ${appointment.service || 'a service request'}.`);
    window.open(`https://wa.me/7339225634?text=${text}`, '_blank');
  };

  useEffect(() => {
    async function loadImages() {
      try {
        const loaded = {};
        for (const category of Object.keys(CATEGORY_FALLBACKS)) {
          const res = await fetch(`/api/images?category=${category}`);
          if (!res.ok) throw new Error('no api');
          const json = await res.json();
          loaded[category] = Array.isArray(json.images) && json.images.length ? json.images : CATEGORY_FALLBACKS[category];
        }
        setImages(loaded);
      } catch (error) {
        setImages(CATEGORY_FALLBACKS);
      }
    }

    loadImages();
  }, []);

  const getImgs = (key) => {
    return images && images[key] && images[key].length ? images[key] : CATEGORY_FALLBACKS[key];
  };

  const openGallery = (category, index) => {
    setGallery({ open: true, category, index });
  };

  const closeGallery = () => {
    setGallery((prev) => ({ ...prev, open: false }));
  };

  const showPrevious = () => {
    setGallery((prev) => ({
      ...prev,
      index: (prev.index - 1 + getImgs(prev.category).length) % getImgs(prev.category).length,
    }));
  };

  const showNext = () => {
    setGallery((prev) => ({
      ...prev,
      index: (prev.index + 1) % getImgs(prev.category).length,
    }));
  };

  return (
    <div className="site-shell" id="top">
      <div className="topbar">
        <div className="brand">
          <span className="brand-label">Keerthans</span>
          <span className="brand-tag">Construction & Project Delivery</span>
        </div>

        <nav className="top-nav" aria-label="Primary navigation">
          <a href="#top">Home</a>
          <a href="#contact">Contact Us</a>
          <a href="#services">Services</a>
          <a href="#gallery">Gallery</a>
          <a href="#appointment">Online Appointment</a>
          <a href="#testimonials">Testimonials</a>
          <a href="#careers">Join Our Team</a>
        </nav>
      </div>

      <header className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Construction leadership</p>
          <h1>Delivering projects on time with precision and strength.</h1>
          <p>
            Expert construction management, site development, and interior fit-out services built for efficiency, safety, and commercial impact.
          </p>
          <a href="#services" className="button button-primary">Explore services</a>
        </div>
        <div className="hero-image">
          <div className="hero-gallery">
            <img src="/src/assets/building1.svg" alt="3D building presentation" />
            <img src="/src/assets/building2.svg" alt="3D building presentation" />
            <img src="/src/assets/building3.svg" alt="3D building presentation" />
          </div>
        </div>
      </header>

      <section className="section services" id="services">
        <h2>Our Services</h2>
        <div className="cards-grid">
          <article
            className="card service-card service-architecture"
            role="button"
            tabIndex={0}
            onClick={() => openGallery('architecture', 0)}
            onKeyDown={(e) => e.key === 'Enter' && openGallery('architecture', 0)}
          >
            <div className="card-content">
              <h3>Design & Planning</h3>
              <p>Blueprints and site planning with construction-ready accuracy.</p>
            </div>

            <div className="hover-gallery" aria-hidden="true">
              {getImgs('architecture', ['/src/assets/arch1.svg','/src/assets/arch2.svg','/src/assets/arch3.svg']).map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={`Architecture work ${i+1}`}
                  onClick={() => openGallery('architecture', i)}
                />
              ))}
            </div>
          </article>

          <article
            className="card service-card service-construction"
            role="button"
            tabIndex={0}
            onClick={() => openGallery('construction', 0)}
            onKeyDown={(e) => e.key === 'Enter' && openGallery('construction', 0)}
          >
            <div className="card-content">
              <h3>Construction Management</h3>
              <p>End-to-end project delivery with site control, quality checks, and safety first.</p>
            </div>

            <div className="hover-gallery" aria-hidden="true">
              {getImgs('construction', ['/src/assets/constr1.svg','/src/assets/constr2.svg','/src/assets/constr3.svg']).map((src,i)=>(
                <img
                  key={i}
                  src={src}
                  alt={`Construction work ${i+1}`}
                  onClick={() => openGallery('construction', i)}
                />
              ))}
            </div>
          </article>

          <article
            className="card service-card service-interior"
            role="button"
            tabIndex={0}
            onClick={() => openGallery('interior', 0)}
            onKeyDown={(e) => e.key === 'Enter' && openGallery('interior', 0)}
          >
            <div className="card-content">
              <h3>Fit-Out & Interiors</h3>
              <p>Durable interiors and finishes designed for commercial and institutional spaces.</p>
            </div>

            <div className="hover-gallery" aria-hidden="true">
              {getImgs('interior', ['/src/assets/interior1.svg','/src/assets/interior2.svg','/src/assets/interior3.svg']).map((src,i)=>(
                <img
                  key={i}
                  src={src}
                  alt={`Interior work ${i+1}`}
                  onClick={() => openGallery('interior', i)}
                />
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="section projects" id="projects">
        <div className="section-heading">
          <h2>Featured Buildings</h2>
          <p>Projects built to last, with smart structure and elegant form.</p>
        </div>
        <div className="project-grid">
          <article className="project-card">
            <h3>Skyline Residences</h3>
            <p>High-rise living with panoramic city views and sustainable amenities.</p>
          </article>
          <article className="project-card">
            <h3>Green Office Campus</h3>
            <p>Energy-efficient workspaces designed for collaboration and wellness.</p>
          </article>
          <article className="project-card">
            <h3>Urban Gallery</h3>
            <p>A cultural destination combining retail, exhibition space, and public plaza.</p>
          </article>
        </div>
      </section>

      <section className="section gallery" id="gallery">
        <div className="section-heading">
          <h2>Gallery</h2>
          <p>See our latest architecture, construction and interior work in one place.</p>
        </div>
        <div className="gallery-grid">
          {Object.keys(CATEGORY_FALLBACKS).map((category) => (
            <article key={category} className="gallery-card" role="button" tabIndex={0} onClick={() => openGallery(category, 0)} onKeyDown={(e) => e.key === 'Enter' && openGallery(category, 0)}>
              <img src={getImgs(category)[0]} alt={`${category} project`} />
              <div>
                <h3>{category.charAt(0).toUpperCase() + category.slice(1)}</h3>
                <p>Tap to explore {category} work.</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section appointment" id="appointment">
        <div className="section-heading">
          <h2>Online Appointment</h2>
          <p>Book your consultation by email or WhatsApp and our team will respond quickly.</p>
        </div>
        <div className="appointment-grid">
          <div className="appointment-card">
            <h3>Schedule by email</h3>
            <p>Send us the details of your project and preferred time, and we’ll follow up with availability.</p>
            <form className="appointment-form" onSubmit={handleAppointmentSubmit}>
              <label>
                Name
                <input type="text" name="name" value={appointment.name} onChange={handleAppointmentChange} required />
              </label>
              <label>
                Email
                <input type="email" name="email" value={appointment.email} onChange={handleAppointmentChange} required />
              </label>
              <label>
                Service
                <input type="text" name="service" value={appointment.service} onChange={handleAppointmentChange} placeholder="Design, Build, Fit-out..." required />
              </label>
              <label>
                Message
                <textarea name="message" value={appointment.message} onChange={handleAppointmentChange} rows="4" placeholder="Tell us more about your project." />
              </label>
              <div className="appointment-actions">
                <button type="submit" className="button button-primary">Send Request</button>
                <button type="button" className="button button-secondary whatsapp-button" onClick={openWhatsApp}>Book via WhatsApp</button>
              </div>
            </form>
          </div>
          <div className="appointment-card appointment-info">
            <h3>Instant booking</h3>
            <p>Prefer a faster response? Use WhatsApp to send a quick booking request directly to our project team.</p>
            <p>
              <strong>Email:</strong> <a href="mailto:hello@keerthansbuild.com">hello@keerthansbuild.com</a>
            </p>
            <p>
              <strong>WhatsApp:</strong> <a href="https://wa.me/919876543210?text=Hello,%20I%20would%20like%20to%20book%20an%20appointment." target="_blank" rel="noreferrer">+91 98765 43210</a>
            </p>
            <p>We’ll help you choose the best service, schedule a site visit, and confirm the next steps.</p>
          </div>
        </div>
      </section>

      <section className="section testimonials" id="testimonials">
        <div className="section-heading">
          <h2>Testimonials</h2>
          <p>Trusted by clients for quality, schedule, and construction expertise.</p>
        </div>
        <div className="testimonial-grid">
          <article className="testimonial-card">
            <p>"Keerthans delivered our site faster than expected and kept communication clear throughout."</p>
            <span>— A. Natarajan, Developer</span>
          </article>
          <article className="testimonial-card">
            <p>"Their team handled every detail, from planning to finish, with a strong safety focus."</p>
            <span>— S. Priya, Facility Manager</span>
          </article>
          <article className="testimonial-card">
            <p>"A reliable partner for large-scale projects that require precision and skilled coordination."</p>
            <span>— R. Kumar, Project Director</span>
          </article>
        </div>
      </section>

      <section className="section careers" id="careers">
        <div className="section-heading">
          <h2>Join Our Team</h2>
          <p>We’re hiring construction professionals, site supervisors, and project coordinators.</p>
        </div>
        <div className="careers-grid">
          <div>
            <h3>Grow with us</h3>
            <p>Be part of a team delivering strong buildings and modern workplaces.</p>
          </div>
          <a href="mailto:careers@keerthansbuild.com" className="button button-secondary">Apply now</a>
        </div>
      </section>

      <section className="section about" id="about">
        <h2>About Us</h2>
        <p>
          We specialize in building design and construction that reflect modern lifestyles and sustainable practices. Our teams deliver every phase from concept to completion.
        </p>
      </section>

      <section className="section contact" id="contact">
        <div>
          <h2>Let’s build something great.</h2>
          <p>Contact us to discuss your next building project.</p>
        </div>
        <a href="mailto:hello@keerthansbuild.com" className="button button-secondary">hello@keerthansbuild.com</a>
      </section>

      <footer className="footer">
        <p>© 2026 Keerthans Building Showcase</p>
      </footer>

      {gallery.open && (
        <div className="gallery-modal" onMouseLeave={closeGallery}>
          <div className="gallery-backdrop" onClick={closeGallery} />
          <div className="gallery-content">
            <button className="gallery-close" onClick={closeGallery} aria-label="Close gallery">×</button>
            <div className="gallery-frame">
              <button className="gallery-nav gallery-prev" onClick={showPrevious} aria-label="Previous image">‹</button>
              <img
                className="gallery-image"
                src={getImgs(gallery.category)[gallery.index]}
                alt={`${gallery.category} image ${gallery.index + 1}`}
              />
              <button className="gallery-nav gallery-next" onClick={showNext} aria-label="Next image">›</button>
            </div>
            <div className="gallery-thumbnails">
              {getImgs(gallery.category).map((src, i) => (
                <button
                  key={i}
                  type="button"
                  className={`gallery-thumb ${gallery.index === i ? 'active' : ''}`}
                  onClick={() => setGallery((prev) => ({ ...prev, index: i }))}
                >
                  <img src={src} alt={`${gallery.category} thumb ${i + 1}`} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
