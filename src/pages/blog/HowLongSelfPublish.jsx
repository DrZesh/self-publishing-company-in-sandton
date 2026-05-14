import React from 'react';
import BlogArticlePage from './BlogArticlePage';
import { blogArticles } from '../../lib/blogArticles';
export default function HowLongSelfPublish() {
  return <BlogArticlePage article={blogArticles['/howlongdoesittaketoselfpublish']} />;
}