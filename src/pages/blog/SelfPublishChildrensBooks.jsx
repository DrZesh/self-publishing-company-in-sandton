import React from 'react';
import BlogArticlePage from './BlogArticlePage';
import { blogArticles } from '../../lib/blogArticles';
export default function SelfPublishChildrensBooks() {
  return <BlogArticlePage article={blogArticles['/howtoselfpublishchildrensbooks']} />;
}