import { Mail, MapPin, Phone } from "lucide-react";

export function ContactPage() {
  return (
    <section className="single-page">
      <article className="contact-panel">
        <p className="eyebrow">Contact Us</p>
        <h1>Speak to Haikonda Technologies</h1>
        <div className="contact-row"><Mail size={18} /> info@haikondatechnologies.com</div>
        <div className="contact-row"><Phone size={18} /> +264 00 000 0000</div>
        <div className="contact-row"><MapPin size={18} /> Windhoek, Namibia</div>
        <p>
          Add your official support hours, office address, WhatsApp line, escalation contact, business registration details, and customer support process here.
        </p>
      </article>
    </section>
  );
}
