import { useEffect, useLayoutEffect, useRef } from 'react';
import { AboutSection } from './components/AboutSection';
// import { BlogSection } from '../../../../shared/components/blog_section/BlogSection';
import { CareGuideSection } from './components/CareGuideSection';
import { ClosingSection } from './components/ClosingSection';
import { HeroSection } from './components/HeroSection';
// import { HOME_BLOG_POSTS } from '../../../../shared/data/blogPosts';
import { PublicFooter } from '../../../../shared/components/PublicFooter/PublicFooter';
import { PublicMenu } from '../../../../shared/components/PublicMenu/PublicMenu';
import './homeAnimations.css';

export function PublicHome() {
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Psicóloga Tamara Delis | Psicoterapia em Itapetininga e Online';

    return () => {
      document.title = previousTitle;
    };
  }, []);

  useLayoutEffect(() => {
    if (window.location.hash) {
      document.getElementById(window.location.hash.slice(1))?.scrollIntoView();
    }

    const main = mainRef.current;
    if (!main || !('IntersectionObserver' in window)) return;

    const elements = main.querySelectorAll('.home-enter');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('home-enter-pending');
          entry.target.classList.add('home-enter-visible');
          observer.unobserve(entry.target);
        }
      });
    });

    elements.forEach((element) => {
      element.classList.add('home-enter-pending');
      observer.observe(element);
    });

    return () => {
      observer.disconnect();
      elements.forEach((element) => {
        element.classList.remove('home-enter-pending', 'home-enter-visible');
      });
    };
  }, []);

  return (
    <div className="relative left-1/2 flex min-h-dvh w-[100vw] -translate-x-1/2 flex-col bg-[#a8bfd0] text-left text-[#17232c]">
      <meta
        name="description"
        content="Psicoterapia psicanalítica com Tamara Delis. Atendimento presencial em Itapetininga e Sorocaba e online para adultos, adolescentes e casais."
      />
      <PublicMenu />
      <main ref={mainRef}>
        <HeroSection />
        <AboutSection />
        <CareGuideSection />
        {/* <BlogSection posts={HOME_BLOG_POSTS} /> */}
        <ClosingSection />
      </main>
      <PublicFooter />
    </div>
  );
}
