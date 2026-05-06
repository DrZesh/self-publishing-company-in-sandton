import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

// Layout
import MainLayout from './components/layout/MainLayout';

// Core Pages
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import GetQuote from './pages/GetQuote';
import FAQ from './pages/FAQ';
import Blog from './pages/Blog';
import BlogArticle from './pages/BlogArticle';

// Service Silo Pages
import BookPublishing from './pages/services/BookPublishing';
import BookPrinting from './pages/services/BookPrinting';
import BookEditing from './pages/services/BookEditing';
import BookCoverDesign from './pages/services/BookCoverDesign';
import EbookPublishing from './pages/services/EbookPublishing';
import Ghostwriting from './pages/services/Ghostwriting';
import GenericServicePage from './pages/services/GenericServicePage';
import LocationPage from './pages/services/LocationPage';
import ResourcePage from './pages/resources/ResourcePage';
import ISBNRegistration from './pages/resources/ISBNRegistration';

// SEO Landing Pages
import PublishingCompaniesSouthAfrica from './pages/seo/PublishingCompaniesSouthAfrica';
import BookPublishersSouthAfrica from './pages/seo/BookPublishersSouthAfrica';
import BookPublishersJohannesburg from './pages/seo/BookPublishersJohannesburg';
import BookPrintingJohannesburg from './pages/seo/BookPrintingJohannesburg';
import SelfPublishingSouthAfrica from './pages/seo/SelfPublishingSouthAfrica';
import BookCoverDesignSouthAfrica from './pages/seo/BookCoverDesignSouthAfrica';
import ProofreadingServicesSouthAfrica from './pages/seo/ProofreadingServicesSouthAfrica';
import GhostwritersSouthAfrica from './pages/seo/GhostwritersSouthAfrica';
import BestPublishingCompaniesSouthAfrica from './pages/seo/BestPublishingCompaniesSouthAfrica';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-obsidian">
        <div className="w-8 h-8 border-4 border-white/10 border-t-copper rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Core */}
        <Route path="/" element={<Home />} />
        <Route path="/aboutus" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/getquote" element={<GetQuote />} />
        <Route path="/faq" element={<FAQ />} />

        {/* Publishing Silo */}
        <Route path="/bookpublishing" element={<BookPublishing />} />
        <Route path="/selfpublishing" element={<GenericServicePage serviceKey="selfpublishing" />} />
        <Route path="/publishingpackages" element={<GenericServicePage serviceKey="publishingpackages" />} />
        <Route path="/minipublishingpackage" element={<GenericServicePage serviceKey="minipublishingpackage" />} />
        <Route path="/premiumpublishingpackage" element={<GenericServicePage serviceKey="premiumpublishingpackage" />} />
        <Route path="/fullpackagesa5" element={<GenericServicePage serviceKey="fullpackagesa5" />} />
        <Route path="/fullpackages6x9" element={<GenericServicePage serviceKey="fullpackages6x9" />} />
        <Route path="/minipackages" element={<GenericServicePage serviceKey="minipackages" />} />
        <Route path="/poetrybookpublishing" element={<GenericServicePage serviceKey="poetrybookpublishing" />} />
        <Route path="/memoirbookpublishing" element={<GenericServicePage serviceKey="memoirbookpublishing" />} />
        <Route path="/christianbookpublishing" element={<GenericServicePage serviceKey="christianbookpublishing" />} />
        <Route path="/childrensbookpublishing" element={<GenericServicePage serviceKey="childrensbookpublishing" />} />
        <Route path="/memoirpublishing" element={<GenericServicePage serviceKey="memoirpublishing" />} />
        <Route path="/poetrypublishing" element={<GenericServicePage serviceKey="poetrypublishing" />} />
        <Route path="/businessbookpublishing" element={<GenericServicePage serviceKey="businessbookpublishing" />} />

        {/* Printing Silo */}
        <Route path="/bookprinting" element={<BookPrinting />} />
        <Route path="/a5bookprinting" element={<GenericServicePage serviceKey="a5bookprinting" />} />
        <Route path="/6x9bookprinting" element={<GenericServicePage serviceKey="6x9bookprinting" />} />
        <Route path="/hardcoverprinting" element={<GenericServicePage serviceKey="hardcoverprinting" />} />
        <Route path="/softcoverprinting" element={<GenericServicePage serviceKey="softcoverprinting" />} />
        <Route path="/creampaperprinting" element={<GenericServicePage serviceKey="creampaperprinting" />} />
        <Route path="/whitepaperprinting" element={<GenericServicePage serviceKey="whitepaperprinting" />} />
        <Route path="/childrensbookprinting" element={<GenericServicePage serviceKey="childrensbookprinting" />} />
        <Route path="/comicbookprinting" element={<GenericServicePage serviceKey="comicbookprinting" />} />
        <Route path="/workbookprinting" element={<GenericServicePage serviceKey="workbookprinting" />} />
        <Route path="/manualprinting" element={<GenericServicePage serviceKey="manualprinting" />} />

        {/* Editing Silo */}
        <Route path="/bookediting" element={<BookEditing />} />
        <Route path="/proofreading" element={<GenericServicePage serviceKey="proofreading" />} />
        <Route path="/copyediting" element={<GenericServicePage serviceKey="copyediting" />} />
        <Route path="/manuscriptevaluation" element={<GenericServicePage serviceKey="manuscriptevaluation" />} />
        <Route path="/academicediting" element={<GenericServicePage serviceKey="academicediting" />} />
        <Route path="/thesisediting" element={<GenericServicePage serviceKey="thesisediting" />} />
        <Route path="/dissertationediting" element={<GenericServicePage serviceKey="dissertationediting" />} />
        <Route path="/technicalediting" element={<GenericServicePage serviceKey="technicalediting" />} />
        <Route path="/languageediting" element={<GenericServicePage serviceKey="languageediting" />} />

        {/* Design Silo */}
        <Route path="/bookcoverdesign" element={<BookCoverDesign />} />
        <Route path="/typesetting" element={<GenericServicePage serviceKey="typesetting" />} />
        <Route path="/booklayoutdesign" element={<GenericServicePage serviceKey="booklayoutdesign" />} />
        <Route path="/ebookformatting" element={<GenericServicePage serviceKey="ebookformatting" />} />
        <Route path="/authorwebsites" element={<GenericServicePage serviceKey="authorwebsites" />} />

        {/* Digital Silo */}
        <Route path="/ebookpublishing" element={<EbookPublishing />} />
        <Route path="/amazonkdp" element={<GenericServicePage serviceKey="amazonkdp" />} />
        <Route path="/kindlepublishing" element={<GenericServicePage serviceKey="kindlepublishing" />} />

        {/* Writing Silo */}
        <Route path="/ghostwriting" element={<Ghostwriting />} />
        <Route path="/memoirwriting" element={<GenericServicePage serviceKey="memoirwriting" />} />
        <Route path="/biographywriting" element={<GenericServicePage serviceKey="biographywriting" />} />
        <Route path="/christianbookwriting" element={<GenericServicePage serviceKey="christianbookwriting" />} />

        {/* High-Priority SEO Landing Pages */}
        <Route path="/publishingcompaniessouthafrica" element={<PublishingCompaniesSouthAfrica />} />
        <Route path="/bookpublisherssouthafrica" element={<BookPublishersSouthAfrica />} />
        <Route path="/bookpublishersjohannesburg" element={<BookPublishersJohannesburg />} />
        <Route path="/bookprintingjohannesburg" element={<BookPrintingJohannesburg />} />
        <Route path="/selfpublishingsouthafrica" element={<SelfPublishingSouthAfrica />} />
        <Route path="/bookcoverdesignsouthafrica" element={<BookCoverDesignSouthAfrica />} />
        <Route path="/proofreadingservicessouthafrica" element={<ProofreadingServicesSouthAfrica />} />
        <Route path="/ghostwriterssouthafrica" element={<GhostwritersSouthAfrica />} />
        <Route path="/bestpublishingcompaniesinsouthafrica" element={<BestPublishingCompaniesSouthAfrica />} />

        {/* Location SEO (legacy) */}
        <Route path="/editingservicesjohannesburg" element={<LocationPage locationKey="editingservicesjohannesburg" />} />
        <Route path="/selfpublishingjohannesburg" element={<LocationPage locationKey="selfpublishingjohannesburg" />} />
        <Route path="/bookcoverdesignjohannesburg" element={<LocationPage locationKey="bookcoverdesignjohannesburg" />} />

        {/* Resource Pages */}
        <Route path="/isbnregistration" element={<ISBNRegistration />} />
        <Route path="/howtopublishabook" element={<ResourcePage resourceKey="howtopublishabook" />} />
        <Route path="/publishingguide" element={<ResourcePage resourceKey="publishingguide" />} />
        <Route path="/printingguide" element={<ResourcePage resourceKey="printingguide" />} />
        <Route path="/editingguide" element={<ResourcePage resourceKey="editingguide" />} />
        <Route path="/bookmarketingguide" element={<ResourcePage resourceKey="bookmarketingguide" />} />

        {/* Blog */}
        <Route path="/blog" element={<Blog />} />
        <Route path="/publishingtips" element={<Blog />} />
        <Route path="/writingtips" element={<Blog />} />
        <Route path="/printingguides" element={<Blog />} />
        <Route path="/editingguides" element={<Blog />} />
        <Route path="/authorsuccessstories" element={<Blog />} />

        {/* Blog Articles */}
        <Route path="/howmuchdoesitcosttopublishabook" element={<BlogArticle />} />
        <Route path="/howtogetanisbn" element={<BlogArticle />} />
        <Route path="/howtowriteabook" element={<BlogArticle />} />
        <Route path="/bookprintingcosts" element={<BlogArticle />} />
        <Route path="/bestpublishingcompanyinsouthafrica" element={<BlogArticle />} />
        <Route path="/selfpublishingvstraditionalpublishing" element={<BlogArticle />} />
        <Route path="/howtosellabookinsouthafrica" element={<BlogArticle />} />
        <Route path="/howtomakeabookcover" element={<BlogArticle />} />
        <Route path="/bookeditingexplained" element={<BlogArticle />} />

        <Route path="*" element={<PageNotFound />} />
      </Route>
    </Routes>
  );
};


function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App