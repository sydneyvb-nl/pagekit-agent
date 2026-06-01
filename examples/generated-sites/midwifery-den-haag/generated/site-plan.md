# Site plan — Verloskundigenpraktijk Example

- **Vertical:** `midwifery_practice`
- **Theme:** `warm-family-practice`
- **Language:** `nl`
- **Pages:** 13

## Content cautions

- Do not make medical guarantees or outcome promises.
- Do not replace or imply replacement of professional medical advice.
- Use reassuring but precise, non-alarming language.
- Do not request sensitive medical details in the generic contact form.
- Only use MedicalBusiness schema; do not claim Physician/Hospital subtypes.

## Pages

### /

- **Type:** home
- **Title:** Verloskundigenpraktijk Example | Den Haag
- **Intent:** Introduce the business, build trust, drive the primary action.
- **Target keyword:** verloskundige Den Haag
- **Sections:** hero.local-service, trust-bar, services-grid, process-steps, testimonials, faq-preview, final-cta
- **Schema:** MedicalBusiness, WebSite, Organization
- **Min words:** 400
- **Image slots:** hero, services
- **Internal links:**
  - Zwangerschapscontroles in Den Haag → `/diensten/zwangerschapscontroles/`
  - Echo's in Den Haag → `/diensten/echo-s/`
  - Kraamzorg in Den Haag → `/diensten/kraamzorg/`
  - Neem contact op → `/contact/`

### /diensten/

- **Type:** services
- **Title:** Diensten | Verloskundigenpraktijk Example
- **Intent:** Give an overview of all services and route to detail pages.
- **Sections:** hero.service, services-grid, final-cta
- **Schema:** MedicalBusiness, BreadcrumbList
- **Min words:** 300
- **Image slots:** hero
- **Internal links:**
  - Home → `/`
  - Diensten → `/diensten/`
  - Contact → `/contact/`

### /over-ons/

- **Type:** about
- **Title:** Over ons | Verloskundigenpraktijk Example
- **Intent:** Explain who the business is and why to trust them.
- **Sections:** hero.local-service, rich-text, trust-bar, final-cta
- **Schema:** MedicalBusiness, BreadcrumbList
- **Min words:** 300
- **Image slots:** hero
- **Internal links:**
  - Home → `/`
  - Diensten → `/diensten/`
  - Contact → `/contact/`

### /team/

- **Type:** team
- **Title:** Team | Verloskundigenpraktijk Example
- **Intent:** Introduce the people; humanise the business.
- **Sections:** hero.local-service, rich-text, final-cta
- **Schema:** MedicalBusiness, BreadcrumbList
- **Min words:** 200
- **Image slots:** hero
- **Internal links:**
  - Home → `/`
  - Diensten → `/diensten/`
  - Contact → `/contact/`

### /locatie/

- **Type:** location
- **Title:** Locatie & route | Verloskundigenpraktijk Example
- **Intent:** Help visitors find and reach the business; reinforce local SEO.
- **Sections:** hero.location, location-map, service-area, contact-card
- **Schema:** MedicalBusiness, BreadcrumbList
- **Min words:** 200
- **Image slots:** hero
- **Internal links:**
  - Home → `/`
  - Diensten → `/diensten/`
  - Contact → `/contact/`

### /contact/

- **Type:** contact
- **Title:** Contact | Verloskundigenpraktijk Example
- **Intent:** Convert intent into a contact request or booking.
- **Sections:** hero.local-service, contact-card, appointment-cta
- **Schema:** MedicalBusiness, ContactPoint, BreadcrumbList
- **Min words:** 150
- **Image slots:** hero
- **Internal links:**
  - Home → `/`
  - Diensten → `/diensten/`

### /veelgestelde-vragen/

- **Type:** faq
- **Title:** Veelgestelde vragen | Verloskundigenpraktijk Example
- **Intent:** Answer common questions; reduce friction; capture long-tail SEO.
- **Sections:** hero.local-service, faq, final-cta
- **Schema:** FAQPage, BreadcrumbList
- **Min words:** 250
- **Image slots:** hero
- **Internal links:**
  - Home → `/`
  - Diensten → `/diensten/`
  - Contact → `/contact/`

### /privacy/

- **Type:** privacy
- **Title:** Privacyverklaring | Verloskundigenpraktijk Example
- **Intent:** Legally required privacy statement.
- **Sections:** rich-text
- **Schema:** BreadcrumbList
- **Min words:** 100
- **Image slots:** hero

### /404/

- **Type:** 404
- **Title:** Pagina niet gevonden | Verloskundigenpraktijk Example
- **Intent:** Friendly not-found page that routes back to key pages.
- **Sections:** rich-text, final-cta
- **Schema:** (none)
- **Min words:** 30
- **Image slots:** hero

### /cookies/

- **Type:** cookies
- **Title:** Cookiebeleid | Verloskundigenpraktijk Example
- **Intent:** Cookie policy where analytics/forms set cookies.
- **Sections:** rich-text
- **Schema:** BreadcrumbList
- **Min words:** 80
- **Image slots:** hero

### /diensten/zwangerschapscontroles/

- **Type:** service
- **Title:** Zwangerschapscontroles in Den Haag | Verloskundigenpraktijk Example
- **Intent:** Explain one service: what it is, who it is for, how it works, what to expect, next step.
- **Target keyword:** zwangerschapscontroles den haag
- **Sections:** hero.service, service-summary, benefits, process-steps, faq.service, related-services, final-cta
- **Schema:** Service, MedicalBusiness, BreadcrumbList
- **Min words:** 700
- **Image slots:** hero, process
- **Internal links:**
  - Alle diensten → `/diensten/`
  - Echo's in Den Haag → `/diensten/echo-s/`
  - Kraamzorg in Den Haag → `/diensten/kraamzorg/`
  - Maak een afspraak → `/contact/`

### /diensten/echo-s/

- **Type:** service
- **Title:** Echo's in Den Haag | Verloskundigenpraktijk Example
- **Intent:** Explain one service: what it is, who it is for, how it works, what to expect, next step.
- **Target keyword:** echo's den haag
- **Sections:** hero.service, service-summary, benefits, process-steps, faq.service, related-services, final-cta
- **Schema:** Service, MedicalBusiness, BreadcrumbList
- **Min words:** 700
- **Image slots:** hero, process
- **Internal links:**
  - Alle diensten → `/diensten/`
  - Zwangerschapscontroles in Den Haag → `/diensten/zwangerschapscontroles/`
  - Kraamzorg in Den Haag → `/diensten/kraamzorg/`
  - Maak een afspraak → `/contact/`

### /diensten/kraamzorg/

- **Type:** service
- **Title:** Kraamzorg in Den Haag | Verloskundigenpraktijk Example
- **Intent:** Explain one service: what it is, who it is for, how it works, what to expect, next step.
- **Target keyword:** kraamzorg den haag
- **Sections:** hero.service, service-summary, benefits, process-steps, faq.service, related-services, final-cta
- **Schema:** Service, MedicalBusiness, BreadcrumbList
- **Min words:** 700
- **Image slots:** hero, process
- **Internal links:**
  - Alle diensten → `/diensten/`
  - Zwangerschapscontroles in Den Haag → `/diensten/zwangerschapscontroles/`
  - Echo's in Den Haag → `/diensten/echo-s/`
  - Maak een afspraak → `/contact/`
