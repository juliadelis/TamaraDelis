import type { BlogPost } from '../../models/blog.model';

interface BlogSectionProps {
  posts: BlogPost[];
  viewAllHref?: string;
}

export function BlogSection({ posts, viewAllHref }: BlogSectionProps) {
  return (
    <section id="conteudos" className="relative z-10 mx-auto -mt-8 w-full max-w-7xl px-4 sm:px-8">
      <div className="rounded-[2rem] bg-[#fff0de] p-5 sm:p-8 md:p-10">
        <div className="grid gap-3 align-top md:grid-cols-[1.3fr_0.7fr] md:items-end md:gap-8">
          <h2 className="max-w-lg self-start font-inria text-[33px] leading-tight text-[#241e19] font-bold">
            Um espaço para compreender, refletir e se cuidar
          </h2>
          <p className="text-[18px] leading-relaxed text-[#453c35]">
            Conteúdos sobre saúde emocional, relacionamentos e os desafios da vida cotidiana.
            Um espaço para encontrar informação e ampliar o autoconhecimento.
          </p>
        </div>

        {posts.length > 0 ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <article
                key={post.id}
                className="overflow-hidden rounded-2xl border border-[#c69b78] bg-[#fff7ec]"
              >
                <img
                  src={post.imageUrl}
                  alt={post.imageAlt}
                  loading="lazy"
                  decoding="async"
                  className="h-44 w-full bg-[#d7c8b7] object-cover object-top"
                />
                <div className="p-4">
                  <h3 className="font-serif text-lg font-semibold leading-snug text-[#241e19]">
                    {post.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-[#453c35]">{post.excerpt}</p>
                  <ul aria-label="Categorias" className="mt-3 flex flex-wrap gap-2">
                    {post.categories.map((category) => (
                      <li
                        key={category}
                        className="rounded-full border border-[#b99474] px-2 py-1 text-[0.65rem] text-[#453c35]"
                      >
                        {category}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-6 rounded-xl border border-dashed border-[#b99474] p-6 text-sm text-[#453c35]">
            Novos conteúdos estarão disponíveis em breve.
          </p>
        )}

        {viewAllHref ? (
          <a
            href={viewAllHref}
            className="mt-5 inline-flex min-h-10 items-center justify-center rounded-full bg-[#713a20] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#562b18] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#713a20]"
          >
            Ver mais artigos
          </a>
        ) : null}
      </div>
    </section>
  );
}
