import React from 'react';
import BlogArticlePage from './BlogArticlePage';
import { blogArticles } from '../../lib/blogArticles';
export default function ProfessionalCopyEditing() {
  return <BlogArticlePage article={blogArticles['/professionalcopyeditingservices']} />;
}