import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Helmet } from 'react-helmet-async';
import { track } from '@/lib/posthog';

const Blog = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const PAGE_SIZE = 10;

  const fetchPosts = async (pageNum: number) => {
    const from = pageNum * PAGE_SIZE;
    const to = from + PAGE_SIZE;
    const { data } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .range(from, to);
    if (data) {
      if (pageNum === 0) setPosts(data);
      else setPosts((prev) => [...prev, ...data]);
      setHasMore(data.length > PAGE_SIZE);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts(0);
  }, []);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchPosts(next);
  };

  return (
    <div className="min-h-screen bg-page">
      <Helmet>
        <title>CarShake Blog — Parking Protection Insights</title>
        <meta name="description" content="Insights on parking protection, valet liability, car condition documentation, and AI-powered damage detection." />
      </Helmet>

      <header className="px-4 py-6 border-b border-border bg-white">
        <div className="max-w-3xl mx-auto">
          <Link to="/" className="font-display text-xl font-bold text-gold mb-4 block">CarShake</Link>
          <h1 className="font-display text-[28px] font-bold text-ink">CarShake Blog</h1>
          <p className="font-body text-[15px] text-muted-custom mt-1">Insights on parking protection, valet liability, and car care</p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold" />
          </div>
        ) : posts.length === 0 ? (
          <p className="text-center text-body font-body py-16">No posts yet. Check back soon!</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {posts.map((post) => (
              <Link
                key={post.id}
                to={`/blog/${post.category || 'guides'}/${post.slug}`}
                className="bg-white rounded-[14px] border border-border shadow-card overflow-hidden hover:shadow-lg transition group"
                onClick={() => track('blog_post_viewed', { slug: post.slug, category: post.category })}
              >
                <div className="p-5">
                  {post.category && (
                    <span className="inline-block px-2.5 py-0.5 rounded-pill bg-gold-subtle text-gold text-[10px] font-body font-bold uppercase tracking-wider mb-3">
                      {post.category}
                    </span>
                  )}
                  <h2 className="font-display text-lg font-bold text-ink mb-2 group-hover:text-gold transition line-clamp-2">
                    {post.title}
                  </h2>
                  <p className="font-body text-sm text-body line-clamp-2 mb-3">{post.excerpt}</p>
                  <p className="font-body text-xs text-muted-custom">
                    {post.read_time_minutes} min read · {new Date(post.published_at).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {hasMore && (
          <div className="text-center mt-8">
            <button
              onClick={loadMore}
              className="min-h-[48px] px-8 rounded-[12px] border-2 border-border text-ink font-body font-semibold hover:bg-surface transition"
            >
              Load more
            </button>
          </div>
        )}

        <div className="text-center mt-12">
          <a
            href="/#demo"
            className="inline-flex items-center justify-center min-h-[52px] px-8 rounded-[12px] bg-gold text-white font-body font-semibold hover:bg-gold-dark transition"
            onClick={() => track('cta_clicked', { location: 'blog' })}
          >
            🛡️ Protect Your Car — Free
          </a>
        </div>
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

export default Blog;
