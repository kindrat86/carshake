import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Helmet } from 'react-helmet-async';
import ReactMarkdown from 'react-markdown';
import DOMPurify from 'dompurify';
import { track } from '@/lib/posthog';

const BlogPost = () => {
  const { slug } = useParams<{ category: string; slug: string }>();
  const [post, setPost] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    const fetchPost = async () => {
      const { data } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();
      setPost(data);

      if (data) {
        track('blog_post_viewed', { slug: data.slug, category: data.category, scroll_depth: 0 });
        const { data: rel } = await supabase
          .from('blog_posts')
          .select('title, slug, category, excerpt, read_time_minutes, published_at')
          .eq('status', 'published')
          .neq('id', data.id)
          .limit(3);
        setRelated(rel || []);
      }
      setLoading(false);
    };
    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page">
        <div className="text-center">
          <p className="font-body text-body text-lg mb-4">Post not found.</p>
          <Link to="/blog" className="text-gold font-body font-semibold">← Back to blog</Link>
        </div>
      </div>
    );
  }

  const sanitizedContent = DOMPurify.sanitize(post.content, {
    ALLOWED_TAGS: ['h2', 'h3', 'h4', 'p', 'a', 'strong', 'em', 'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'br', 'hr', 'table', 'thead', 'tbody', 'tr', 'th', 'td'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    datePublished: post.published_at,
    author: { '@type': 'Organization', name: 'CarShake' },
    publisher: { '@type': 'Organization', name: 'CarShake', url: 'https://carshake.online' },
    wordCount: post.content.split(/\s+/).length,
    description: post.meta_description || post.excerpt,
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://carshake.online' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://carshake.online/blog' },
      { '@type': 'ListItem', position: 3, name: post.category, item: `https://carshake.online/blog/${post.category}` },
      { '@type': 'ListItem', position: 4, name: post.title },
    ],
  };

  return (
    <div className="min-h-screen bg-page">
      <Helmet>
        <title>{post.meta_title || post.title}</title>
        <meta name="description" content={post.meta_description || post.excerpt} />
        <link rel="canonical" href={`https://carshake.online/blog/${post.category}/${post.slug}`} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbLd)}</script>
      </Helmet>

      <header className="px-4 py-4 border-b border-border bg-white">
        <div className="max-w-[720px] mx-auto flex items-center gap-4">
          <Link to="/" className="font-display text-xl font-bold text-gold">CarShake</Link>
          <Link to="/blog" className="text-sm font-body text-muted-custom hover:text-gold transition">← Blog</Link>
        </div>
      </header>

      <main className="max-w-[720px] mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="text-xs font-body text-muted-custom mb-6">
          <Link to="/" className="hover:text-gold">Home</Link>
          {' / '}
          <Link to="/blog" className="hover:text-gold">Blog</Link>
          {' / '}
          <span className="capitalize">{post.category}</span>
          {' / '}
          <span className="text-ink">{post.title.slice(0, 40)}...</span>
        </nav>

        {post.category && (
          <span className="inline-block px-3 py-1 rounded-pill bg-gold-subtle text-gold text-[10px] font-body font-bold uppercase tracking-wider mb-4">
            {post.category}
          </span>
        )}

        <h1 className="font-display text-[28px] font-bold text-ink mb-3 leading-tight">{post.title}</h1>

        <p className="font-body text-sm text-muted-custom mb-8">
          {new Date(post.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          {' · '}{post.read_time_minutes} min read
        </p>

        {/* Article content */}
        <article className="prose prose-zinc max-w-none font-body text-[15px] leading-relaxed text-body
          [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-ink [&_h2]:mt-8 [&_h2]:mb-4
          [&_h3]:font-display [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-ink [&_h3]:mt-6 [&_h3]:mb-3
          [&_p]:mb-4 [&_strong]:text-ink [&_a]:text-gold [&_a]:underline
          [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4
          [&_li]:mb-1 [&_blockquote]:border-l-4 [&_blockquote]:border-gold [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-ink
        ">
          <ReactMarkdown>{sanitizedContent}</ReactMarkdown>
        </article>

        {/* Embedded CTA */}
        <div className="my-10 p-6 rounded-[14px] border-2 border-gold bg-gold-subtle text-center">
          <p className="font-display text-lg font-bold text-ink mb-2">Your next valet handover could go differently.</p>
          <a
            href="/#demo"
            className="inline-flex items-center justify-center min-h-[48px] px-6 rounded-[12px] bg-gold text-white font-body font-semibold hover:bg-gold-dark transition mt-2"
            onClick={() => track('cta_clicked', { location: 'blog', blog_slug: post.slug })}
          >
            Try CarShake — Free
          </a>
        </div>

        {/* Related Posts */}
        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="font-display text-xl font-bold text-ink mb-6">Related Articles</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  to={`/blog/${r.category || 'guides'}/${r.slug}`}
                  className="bg-white rounded-[14px] border border-border p-4 hover:shadow-lg transition"
                >
                  <span className="text-[10px] font-body font-bold uppercase text-gold tracking-wider">{r.category}</span>
                  <h3 className="font-display text-sm font-bold text-ink mt-1 line-clamp-2">{r.title}</h3>
                  <p className="font-body text-xs text-muted-custom mt-2">{r.read_time_minutes} min read</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="bg-dark py-8 px-4 mt-12">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-display text-gold text-lg font-bold mb-1">CarShake</p>
          <p className="text-muted-custom text-sm font-body">© 2026 CarShake · carshake.online</p>
        </div>
      </footer>
    </div>
  );
};

export default BlogPost;
