import React from 'react';
import BlogArticlePage from './BlogArticlePage';
import { blogArticles } from '../../lib/blogArticles';
export default function WhatIsGhostwriting() {
  return <BlogArticlePage article={blogArticles['/whatisghostwriting']} />;
}