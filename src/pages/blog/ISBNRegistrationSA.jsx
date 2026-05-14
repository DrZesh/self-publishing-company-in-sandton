import React from 'react';
import BlogArticlePage from './BlogArticlePage';
import { blogArticles } from '../../lib/blogArticles';
export default function ISBNRegistrationSA() {
  return <BlogArticlePage article={blogArticles['/isbnregistrationsouthafrica']} />;
}