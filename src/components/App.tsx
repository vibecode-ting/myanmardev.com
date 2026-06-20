import React from 'react';
import LanguageProvider from './LanguageProvider';
import HeroSection from './HeroSection';
import ProductsSection from './ProductsSection';
import HowSection from './HowSection';
import PricingSection from './PricingSection';

export default function App() {
  return (
    <LanguageProvider>
      <main>
        <HeroSection />
        <HowSection />
        <ProductsSection />
        <PricingSection />
      </main>
    </LanguageProvider>
  );
}
