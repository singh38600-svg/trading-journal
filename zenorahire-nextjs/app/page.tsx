import Navbar      from '@/components/Navbar'
import Hero        from '@/components/Hero'
import MarqueeBand from '@/components/MarqueeBand'
import Services    from '@/components/Services'
import Stats       from '@/components/Stats'
import HowItWorks  from '@/components/HowItWorks'
import Testimonials from '@/components/Testimonials'
import CTA         from '@/components/CTA'
import Footer      from '@/components/Footer'

export default function Home() {
  return (
    <main className="relative">
      <Navbar />
      <Hero />
      <MarqueeBand />
      <Services />
      <Stats />
      <HowItWorks />
      <Testimonials />
      <CTA />
      <Footer />
    </main>
  )
}
