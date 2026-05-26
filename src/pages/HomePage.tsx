import { Hero } from '../components/home/Hero'
import { FeaturedProducts } from '../components/home/FeaturedProducts'
import { Categories } from '../components/home/Categories'
import { WhyChooseUs } from '../components/home/WhyChooseUs'
import { HowToOrder } from '../components/home/HowToOrder'
import { ReviewsSection } from '../components/reviews/ReviewsSection'
import { FAQPreview } from '../components/home/FAQPreview'
import { CTABanner } from '../components/home/CTABanner'
import { ContactSection } from '../components/home/ContactSection'
import { reviews } from '../data/reviews'

export function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedProducts />
      <Categories />
      <WhyChooseUs />
      <HowToOrder />
      <ReviewsSection reviews={reviews} />
      <FAQPreview />
      <ContactSection />
      <CTABanner />
    </>
  )
}
