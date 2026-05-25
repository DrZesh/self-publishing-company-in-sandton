import { lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import MainLayout from './components/layout/MainLayout';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';

// ─── Lazy-loaded page components (code-split per route) ───────────────────────
// Core
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const GetQuote = lazy(() => import('./pages/GetQuote'));
const FAQ = lazy(() => import('./pages/FAQ'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogArticle = lazy(() => import('./pages/BlogArticle'));
const Portfolio = lazy(() => import('./pages/Portfolio'));
const AnnualReportDesign = lazy(() => import('./pages/AnnualReportDesign'));

// Printing
const PrintingA5 = lazy(() => import('./pages/printing/PrintingA5.jsx'));
const Printing6x9 = lazy(() => import('./pages/printing/Printing6x9.jsx'));
const PrintingHardcover = lazy(() => import('./pages/printing/PrintingHardcover.jsx'));
const PrintingChildrensBooks = lazy(() => import('./pages/printing/PrintingChildrensBooks'));
const ChildrensBooks15x15 = lazy(() => import('./pages/printing/childrensbooks/ChildrensBooks15x15.jsx'));
const ChildrensBooks20x20 = lazy(() => import('./pages/printing/childrensbooks/ChildrensBooks20x20.jsx'));
const ChildrensBooks21x21 = lazy(() => import('./pages/printing/childrensbooks/ChildrensBooks21x21.jsx'));

// Services
const BookPublishing = lazy(() => import('./pages/services/BookPublishing'));
const MiniPublishingPackage = lazy(() => import('./pages/services/MiniPublishingPackage'));
const A5BookPublishing = lazy(() => import('./pages/services/A5BookPublishing'));
const SixByNinePublishing = lazy(() => import('./pages/services/SixByNinePublishing'));
const FullPackagesA5 = lazy(() => import('./pages/publishing/FullPackagesA5'));
const FullPackages6x9 = lazy(() => import('./pages/publishing/FullPackages6x9'));
const MiniPackages = lazy(() => import('./pages/publishing/MiniPackages'));
const BookPrinting = lazy(() => import('./pages/services/BookPrinting'));
const BookEditing = lazy(() => import('./pages/services/BookEditing'));
const Proofreading = lazy(() => import('./pages/services/Proofreading'));
const AcademicEditing = lazy(() => import('./pages/services/AcademicEditing'));
const ThesisEditing = lazy(() => import('./pages/services/ThesisEditing'));
const DissertationEditing = lazy(() => import('./pages/services/DissertationEditing'));
const BookCoverDesign = lazy(() => import('./pages/services/BookCoverDesign'));
const EbookPublishing = lazy(() => import('./pages/services/EbookPublishing'));
const Ghostwriting = lazy(() => import('./pages/services/Ghostwriting'));
const BookTypesetting = lazy(() => import('./pages/services/BookTypesetting'));
const SelfPublishingPackages = lazy(() => import('./pages/services/SelfPublishingPackages'));
const AuthorWebsites = lazy(() => import('./pages/services/AuthorWebsites'));
const ChildrensBookPackages = lazy(() => import('./pages/services/ChildrensBookPackages'));
const MemoirWriting = lazy(() => import('./pages/services/MemoirWriting'));
const BiographyWriting = lazy(() => import('./pages/services/BiographyWriting'));
const ChristianBookWriting = lazy(() => import('./pages/services/ChristianBookWriting'));
const LocationPage = lazy(() => import('./pages/services/LocationPage'));
const ResourcePage = lazy(() => import('./pages/resources/ResourcePage'));
const CompletePublishingGuide = lazy(() => import('./pages/resources/CompletePublishingGuide'));
const ISBNRegistration = lazy(() => import('./pages/resources/ISBNRegistration'));
const NDA = lazy(() => import('./pages/resources/NDA'));
const CoverSizeCalculator = lazy(() => import('./pages/resources/CoverSizeCalculator'));

// SEO landing pages
const PrintOnDemandSouthAfrica = lazy(() => import('./pages/blog/PrintOnDemandSouthAfrica'));
const SelfPublishingCompaniesSouthAfrica = lazy(() => import('./pages/seo/SelfPublishingCompaniesSouthAfrica'));
const BookCoverDesignPriceSouthAfrica = lazy(() => import('./pages/seo/BookCoverDesignPriceSouthAfrica'));
const BookEditorsSouthAfrica = lazy(() => import('./pages/seo/BookEditorsSouthAfrica'));
const BookLayoutTypesetting = lazy(() => import('./pages/seo/BookLayoutTypesetting'));
const ISBNNumberSouthAfrica = lazy(() => import('./pages/seo/ISBNNumberSouthAfrica'));
const BookDistributionSouthAfrica = lazy(() => import('./pages/seo/BookDistributionSouthAfrica'));
const CostToSelfPublishKindle = lazy(() => import('./pages/blog/CostToSelfPublishKindle'));
const ProfessionalCopyEditing = lazy(() => import('./pages/blog/ProfessionalCopyEditing'));
const WhatIsGhostwriting = lazy(() => import('./pages/blog/WhatIsGhostwriting'));
const WritingBookDedication = lazy(() => import('./pages/blog/WritingBookDedication'));
const WritingBookAcknowledgment = lazy(() => import('./pages/blog/WritingBookAcknowledgment'));
const HowToNameYourBook = lazy(() => import('./pages/blog/HowToNameYourBook'));
const HowToPrintSelfPublishedBook = lazy(() => import('./pages/blog/HowToPrintSelfPublishedBook'));
const ChildrensBookIllustrations = lazy(() => import('./pages/blog/ChildrensBookIllustrations'));
const EbookVsPrint = lazy(() => import('./pages/blog/EbookVsPrint'));
const HowLongSelfPublish = lazy(() => import('./pages/blog/HowLongSelfPublish'));
const CostToSelfPublishAmazon = lazy(() => import('./pages/blog/CostToSelfPublishAmazon'));
const BecomeAWriter = lazy(() => import('./pages/blog/BecomeAWriter'));
const ISBNRegistrationSA = lazy(() => import('./pages/blog/ISBNRegistrationSA'));
const HowToGetISBN = lazy(() => import('./pages/blog/HowToGetISBN'));
const BeginnersGuideSelfPublishing = lazy(() => import('./pages/blog/BeginnersGuideSelfPublishing'));
const SelfPublishChildrensBooks = lazy(() => import('./pages/blog/SelfPublishChildrensBooks'));
const WhatIsSelfPublishing = lazy(() => import('./pages/blog/WhatIsSelfPublishing'));
const CopyrightFAQsAuthors = lazy(() => import('./pages/blog/CopyrightFAQsAuthors'));
const QuestionsToAskPublisher = lazy(() => import('./pages/blog/QuestionsToAskPublisher'));
const HowDoIGetMyBookPublished = lazy(() => import('./pages/blog/HowDoIGetMyBookPublished'));
const DoSouthAfricanPublishersChargeAuthors = lazy(() => import('./pages/blog/DoSouthAfricanPublishersChargeAuthors'));
const HowMuchWillIEarnFromMyFirstBook = lazy(() => import('./pages/blog/HowMuchWillIEarnFromMyFirstBook'));
const WhatIsAFairBookDeal = lazy(() => import('./pages/blog/WhatIsAFairBookDeal'));
const DoINeedAnEditorBeforePublishing = lazy(() => import('./pages/blog/DoINeedAnEditorBeforePublishing'));
const HowToFindALiteraryAgentSA = lazy(() => import('./pages/blog/HowToFindALiteraryAgentSA'));
const HowToPublishChildrensBookSA = lazy(() => import('./pages/blog/HowToPublishChildrensBookSA'));
const CanIPublishAComicBookSA = lazy(() => import('./pages/blog/CanIPublishAComicBookSA'));
const HowToMarketSelfPublishedBookSA = lazy(() => import('./pages/blog/HowToMarketSelfPublishedBookSA'));
const HowDoPublishersFindAuthors = lazy(() => import('./pages/blog/HowDoPublishersFindAuthors'));
const WhatFreelanceProfessionalsDoINeed = lazy(() => import('./pages/blog/WhatFreelanceProfessionalsDoINeed'));
const IsSelling3000CopiesGood = lazy(() => import('./pages/blog/IsSelling3000CopiesGood'));
const HowDoIKnowIfMyBookIsReady = lazy(() => import('./pages/blog/HowDoIKnowIfMyBookIsReady'));
const WhatPublishingJobsAreAvailable = lazy(() => import('./pages/blog/WhatPublishingJobsAreAvailable'));
const HowLongToGetPublishedSA = lazy(() => import('./pages/blog/HowLongToGetPublishedSA'));
const DoPublishersProvideCoverDesign = lazy(() => import('./pages/blog/DoPublishersProvideCoverDesign'));
const WhatIs9010RuleAuthors = lazy(() => import('./pages/blog/WhatIs9010RuleAuthors'));
const HowToChooseBetweenPublishingOffers = lazy(() => import('./pages/blog/HowToChooseBetweenPublishingOffers'));
const CanYouMakeALivingAsAuthorSA = lazy(() => import('./pages/blog/CanYouMakeALivingAsAuthorSA'));
const WhatToLookForInPublishingContract = lazy(() => import('./pages/blog/WhatToLookForInPublishingContract'));
const HowToProtectBookIdeaSA = lazy(() => import('./pages/blog/HowToProtectBookIdeaSA'));
const DoAuthorsNeedInternationalDistribution = lazy(() => import('./pages/blog/DoAuthorsNeedInternationalDistribution'));
const HowMuchToSpendOnCoverDesign = lazy(() => import('./pages/blog/HowMuchToSpendOnCoverDesign'));
const BestPlatformsToSelfPublishSA = lazy(() => import('./pages/blog/BestPlatformsToSelfPublishSA'));
const HowToBuildAuthorPlatform = lazy(() => import('./pages/blog/HowToBuildAuthorPlatform'));
const TraditionalVsSelfPublishingRoyalties = lazy(() => import('./pages/blog/TraditionalVsSelfPublishingRoyalties'));
const CanIPublishInOtherLanguagesSA = lazy(() => import('./pages/blog/CanIPublishInOtherLanguagesSA'));
const HowToFindBetaReadersSA = lazy(() => import('./pages/blog/HowToFindBetaReadersSA'));
const WhatTaxesDoAuthorsPaySA = lazy(() => import('./pages/blog/WhatTaxesDoAuthorsPaySA'));
const HowToGetBookReviewedSA = lazy(() => import('./pages/blog/HowToGetBookReviewedSA'));
const ShouldIHirePublishingCoachSA = lazy(() => import('./pages/blog/ShouldIHirePublishingCoachSA'));
const CommonPublishingMistakesSA = lazy(() => import('./pages/blog/CommonPublishingMistakesSA'));
const HowToLaunchYourBookSA = lazy(() => import('./pages/blog/HowToLaunchYourBookSA'));
const CanIPublishMultipleGenresSA = lazy(() => import('./pages/blog/CanIPublishMultipleGenresSA'));
const HowDebutAuthorsGetBetterDeals = lazy(() => import('./pages/blog/HowDebutAuthorsGetBetterDeals'));
const RoleLiteraryAgentSA = lazy(() => import('./pages/blog/RoleLiteraryAgentSA'));
const HowToStartPublishingCareerSA = lazy(() => import('./pages/blog/HowToStartPublishingCareerSA'));

// Existing SEO pages
const PublishingCompaniesSouthAfrica = lazy(() => import('./pages/seo/PublishingCompaniesSouthAfrica'));
const BookPublishersSouthAfrica = lazy(() => import('./pages/seo/BookPublishersSouthAfrica'));
const BookPublishersJohannesburg = lazy(() => import('./pages/seo/BookPublishersJohannesburg'));
const BookPrintingJohannesburg = lazy(() => import('./pages/seo/BookPrintingJohannesburg'));
const SelfPublishingSouthAfrica = lazy(() => import('./pages/seo/SelfPublishingSouthAfrica'));
const BookCoverDesignSouthAfrica = lazy(() => import('./pages/seo/BookCoverDesignSouthAfrica'));
const ProofreadingServicesSouthAfrica = lazy(() => import('./pages/seo/ProofreadingServicesSouthAfrica'));
const GhostwritersSouthAfrica = lazy(() => import('./pages/seo/GhostwritersSouthAfrica'));
const BestPublishingCompaniesSouthAfrica = lazy(() => import('./pages/seo/BestPublishingCompaniesSouthAfrica'));

// Location pages
const BookPrintingSandton = lazy(() => import('./pages/seo/location/BookPrintingSandton.jsx'));
const BookEditingSandton = lazy(() => import('./pages/seo/location/BookEditingSandton.jsx'));
const BookPrintingRandburg = lazy(() => import('./pages/seo/location/BookPrintingRandburg.jsx'));
const BookPrintingMidrand = lazy(() => import('./pages/seo/location/BookPrintingMidrand.jsx'));
const BookPrintingPretoria = lazy(() => import('./pages/seo/location/BookPrintingPretoria.jsx'));
const BookPrintingCenturion = lazy(() => import('./pages/seo/location/BookPrintingCenturion.jsx'));
const BookPrintingRoodepoort = lazy(() => import('./pages/seo/location/BookPrintingRoodepoort.jsx'));
const BookCoverDesignSandton = lazy(() => import('./pages/seo/location/BookCoverDesignSandton'));
const BookCoverDesignRandburg = lazy(() => import('./pages/seo/location/BookCoverDesignRandburg'));
const BookCoverDesignMidrand = lazy(() => import('./pages/seo/location/BookCoverDesignMidrand'));
const BookCoverDesignPretoria = lazy(() => import('./pages/seo/location/BookCoverDesignPretoria'));
const BookCoverDesignCenturion = lazy(() => import('./pages/seo/location/BookCoverDesignCenturion'));
const BookCoverDesignRoodepoort = lazy(() => import('./pages/seo/location/BookCoverDesignRoodepoort'));
const BookCoverDesignCapeTown = lazy(() => import('./pages/seo/location/BookCoverDesignCapeTown'));
const BookCoverDesignDurban = lazy(() => import('./pages/seo/location/BookCoverDesignDurban'));
const LocationsHub = lazy(() => import('./pages/seo/LocationsHub'));

// Industry pages
const PoetryBookPrinting = lazy(() => import('./pages/seo/industry/PoetryBookPrinting.jsx'));
const MemoirBookPrinting = lazy(() => import('./pages/seo/industry/MemoirBookPrinting.jsx'));
const ChristianBookPrinting = lazy(() => import('./pages/seo/industry/ChristianBookPrinting.jsx'));
const BusinessBookPrinting = lazy(() => import('./pages/seo/industry/BusinessBookPrinting.jsx'));
const TrainingManualPrinting = lazy(() => import('./pages/seo/industry/TrainingManualPrinting.jsx'));
const SchoolBookPrinting = lazy(() => import('./pages/seo/industry/SchoolBookPrinting.jsx'));
const NovelPrinting = lazy(() => import('./pages/seo/industry/NovelPrinting.jsx'));
const EducationalBookPrinting = lazy(() => import('./pages/seo/industry/EducationalBookPrinting.jsx'));

// Long-tail pages
const HowToPrintABook = lazy(() => import('./pages/seo/longtail/HowToPrintABook.jsx'));
const HowMuchDoesBookPrintingCost = lazy(() => import('./pages/seo/longtail/HowMuchDoesBookPrintingCost.jsx'));
const BestBookSizeForSelfPublishing = lazy(() => import('./pages/seo/longtail/BestBookSizeForSelfPublishing.jsx'));
const A5vs6x9BookPrinting = lazy(() => import('./pages/seo/longtail/A5vs6x9BookPrinting.jsx'));
const HardcoverVsPaperback = lazy(() => import('./pages/seo/longtail/HardcoverVsPaperback.jsx'));
const HowToSelfPublishABook = lazy(() => import('./pages/seo/longtail/HowToSelfPublishABook.jsx'));

// Tools & calculators
const BookPrintingCalculator = lazy(() => import('./pages/tools/BookPrintingCalculator.jsx'));
const PublishingRoadmap = lazy(() => import('./pages/tools/PublishingRoadmap.jsx'));
const UniversalCalculator = lazy(() => import('./pages/tools/UniversalCalculator.jsx'));
const NewCalculator = lazy(() => import('./pages/calculator/index.jsx'));

// Admin pages
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminInbox = lazy(() => import('./pages/admin/AdminInbox'));
const AdminLeads = lazy(() => import('./pages/admin/AdminLeads'));
const AdminContacts = lazy(() => import('./pages/admin/AdminContacts'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const AdminServices = lazy(() => import('./pages/admin/AdminServices'));
const SearchConsoleDashboard = lazy(() => import('./pages/admin/SearchConsoleDashboard'));
const SeoAnalytics = lazy(() => import('./pages/admin/SeoAnalytics'));
const AdminPipeline = lazy(() => import('./pages/admin/AdminPipeline'));
const AdminQuotes = lazy(() => import('./pages/admin/AdminQuotes'));
const AdminQuoteBuilder = lazy(() => import('./pages/admin/AdminQuoteBuilder.jsx'));
const AdminEmailTemplates = lazy(() => import('./pages/admin/AdminEmailTemplates'));
const AdminContactDetail = lazy(() => import('./pages/admin/AdminContactDetail'));
const AdminSignatures = lazy(() => import('./pages/admin/AdminSignatures'));
const QuoteView = lazy(() => import('./pages/QuoteView'));

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
    <Suspense fallback={
      <div className="fixed inset-0 flex items-center justify-center bg-obsidian">
        <div className="w-8 h-8 border-4 border-white/10 border-t-copper rounded-full animate-spin" />
      </div>
    }>
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
        <Route path="/selfpublishing" element={<Navigate to="/selfpublishingsouthafrica" replace />} />
        <Route path="/publishingpackages" element={<Navigate to="/publishingpackages/a5" replace />} />
        <Route path="/publishingpackages/mini" element={<MiniPackages />} />
        <Route path="/publishingpackages/a5" element={<FullPackagesA5 />} />
        <Route path="/publishingpackages/6x9" element={<FullPackages6x9 />} />
        <Route path="/premiumpublishingpackage" element={<Navigate to="/publishingpackages/a5" replace />} />
        <Route path="/christianbookpublishing" element={<Navigate to="/bookpublishing" replace />} />
        <Route path="/childrensbookpublishing" element={<Navigate to="/childrensbookpackages" replace />} />
        <Route path="/memoirpublishing" element={<Navigate to="/memoirwriting" replace />} />
        <Route path="/poetrypublishing" element={<Navigate to="/bookpublishing" replace />} />
        <Route path="/businessbookpublishing" element={<Navigate to="/bookpublishing" replace />} />

        <Route path="/selfpublishingpackagesinsouthafrica" element={<SelfPublishingPackages />} />

        {/* Printing Sub-Pages (full content) */}
        <Route path="/printing/a5" element={<PrintingA5 />} />
        <Route path="/printing/6x9" element={<Printing6x9 />} />
        <Route path="/printing/hardcover" element={<PrintingHardcover />} />
        <Route path="/printing/childrensbooks" element={<PrintingChildrensBooks />} />
        <Route path="/printing/childrensbooks/15cmx15cm" element={<ChildrensBooks15x15 />} />
        <Route path="/printing/childrensbooks/ChildrensBooks15x15" element={<ChildrensBooks15x15 />} />
        <Route path="/printing/childrensbooks/20cmx20cm" element={<ChildrensBooks20x20 />} />
        <Route path="/printing/childrensbooks/ChildrensBooks20x20" element={<ChildrensBooks20x20 />} />
        <Route path="/printing/childrensbooks/21cmx21cm" element={<ChildrensBooks21x21 />} />
        <Route path="/printing/childrensbooks/ChildrensBooks21x21" element={<ChildrensBooks21x21 />} />

        {/* Printing Silo (GenericServicePage) */}
        <Route path="/bookprinting" element={<BookPrinting />} />
        <Route path="/a5bookprinting" element={<Navigate to="/printing/a5" replace />} />
        <Route path="/6x9bookprinting" element={<Navigate to="/printing/6x9" replace />} />
        <Route path="/hardcoverprinting" element={<Navigate to="/printing/hardcover" replace />} />
        <Route path="/softcoverprinting" element={<Navigate to="/bookprinting" replace />} />
        <Route path="/creampaperprinting" element={<Navigate to="/bookprinting" replace />} />
        <Route path="/whitepaperprinting" element={<Navigate to="/bookprinting" replace />} />
        <Route path="/childrensbookprinting" element={<Navigate to="/printing/childrensbooks" replace />} />
        <Route path="/comicbookprinting" element={<Navigate to="/bookprinting" replace />} />
        <Route path="/workbookprinting" element={<Navigate to="/bookprinting" replace />} />
        <Route path="/manualprinting" element={<Navigate to="/bookprinting" replace />} />

        {/* Editing Silo */}
        <Route path="/bookediting" element={<BookEditing />} />
        <Route path="/proofreading" element={<Proofreading />} />
        <Route path="/copyediting" element={<Navigate to="/bookediting" replace />} />
        <Route path="/manuscriptevaluation" element={<Navigate to="/bookediting" replace />} />
        <Route path="/academicediting" element={<AcademicEditing />} />
        <Route path="/thesisediting" element={<ThesisEditing />} />
        <Route path="/dissertationediting" element={<DissertationEditing />} />
        <Route path="/technicalediting" element={<Navigate to="/bookediting" replace />} />
        <Route path="/languageediting" element={<Navigate to="/bookediting" replace />} />

        {/* Design Silo */}
        <Route path="/bookcoverdesign" element={<BookCoverDesign />} />
        <Route path="/annualreportdesignsandton" element={<AnnualReportDesign />} />
        <Route path="/typesetting" element={<BookTypesetting />} />
        <Route path="/booklayoutdesign" element={<BookTypesetting />} />
        <Route path="/authorwebsites" element={<AuthorWebsites />} />

        {/* Digital Silo */}
        <Route path="/ebookformatting" element={<EbookPublishing />} />
        <Route path="/ebookpublishing" element={<EbookPublishing />} />
        <Route path="/amazonkdp" element={<Navigate to="/ebookpublishing" replace />} />
        <Route path="/kindlepublishing" element={<Navigate to="/ebookpublishing" replace />} />
        <Route path="/ebook-packages" element={<Navigate to="/ebookpublishing" replace />} />

        {/* Writing Silo */}
        <Route path="/ghostwriting" element={<Ghostwriting />} />
        <Route path="/memoirwriting" element={<MemoirWriting />} />
        <Route path="/biographywriting" element={<BiographyWriting />} />
        <Route path="/christianbookwriting" element={<ChristianBookWriting />} />
        <Route path="/childrensbookpackages" element={<ChildrensBookPackages />} />

        {/* Existing SEO Landing Pages */}
        <Route path="/publishingcompaniesinsouthafrica" element={<PublishingCompaniesSouthAfrica />} />
        <Route path="/publishingcompaniessouthafrica" element={<PublishingCompaniesSouthAfrica />} />
        <Route path="/bookpublisherssouthafrica" element={<BookPublishersSouthAfrica />} />
        <Route path="/bookpublishersjohannesburg" element={<BookPublishersJohannesburg />} />
        <Route path="/bookprintingjohannesburg" element={<BookPrintingJohannesburg />} />
        <Route path="/selfpublishingsouthafrica" element={<SelfPublishingSouthAfrica />} />
        <Route path="/bookcoverdesignsouthafrica" element={<BookCoverDesignSouthAfrica />} />
        <Route path="/proofreadingservicessouthafrica" element={<ProofreadingServicesSouthAfrica />} />
        <Route path="/ghostwriterssouthafrica" element={<GhostwritersSouthAfrica />} />
        <Route path="/bestpublishingcompaniesinsouthafrica" element={<BestPublishingCompaniesSouthAfrica />} />

        {/* Locations Hub */}
        <Route path="/locations" element={<LocationsHub />} />

        {/* Gauteng Location Pages (dedicated) */}
        <Route path="/bookprintingsandton" element={<BookPrintingSandton />} />
        <Route path="/bookeditingsandton" element={<BookEditingSandton />} />
        <Route path="/bookprintingrandburg" element={<BookPrintingRandburg />} />
        <Route path="/bookprintingmidrand" element={<BookPrintingMidrand />} />
        <Route path="/bookprintingpretoria" element={<BookPrintingPretoria />} />
        <Route path="/bookprintingcenturion" element={<BookPrintingCenturion />} />
        <Route path="/bookprintingroodepoort" element={<BookPrintingRoodepoort />} />

        {/* Book Cover Design Location Pages */}
        <Route path="/bookcoverdesignsandton" element={<BookCoverDesignSandton />} />
        <Route path="/bookcoverdesignrandburg" element={<BookCoverDesignRandburg />} />
        <Route path="/bookcoverdesignmidrand" element={<BookCoverDesignMidrand />} />
        <Route path="/bookcoverdesignpretoria" element={<BookCoverDesignPretoria />} />
        <Route path="/bookcoverdesigncenturion" element={<BookCoverDesignCenturion />} />
        <Route path="/bookcoverdesignroodepoort" element={<BookCoverDesignRoodepoort />} />
        <Route path="/bookcoverdesigncapetown" element={<BookCoverDesignCapeTown />} />
        <Route path="/bookcoverdesigndurban" element={<BookCoverDesignDurban />} />

        {/* National City Printing Pages — redirect to main printing page */}
        <Route path="/bookprintingcapetown" element={<Navigate to="/bookprinting" replace />} />
        <Route path="/bookprintingdurban" element={<Navigate to="/bookprinting" replace />} />
        <Route path="/bookprintingbloemfontein" element={<Navigate to="/bookprinting" replace />} />
        <Route path="/bookprintingpolokwane" element={<Navigate to="/bookprinting" replace />} />
        <Route path="/bookprintingnelspruit" element={<Navigate to="/bookprinting" replace />} />
        <Route path="/bookprintingportelizabeth" element={<Navigate to="/bookprinting" replace />} />
        <Route path="/bookprintingeastlondon" element={<Navigate to="/bookprinting" replace />} />
        <Route path="/bookprintingkimberley" element={<Navigate to="/bookprinting" replace />} />
        <Route path="/bookprintingpietermaritzburg" element={<Navigate to="/bookprinting" replace />} />
        <Route path="/bookprintingrustenburg" element={<Navigate to="/bookprinting" replace />} />
        <Route path="/bookprintingboksburg" element={<Navigate to="/bookprinting" replace />} />
        <Route path="/bookprintingbenoni" element={<Navigate to="/bookprinting" replace />} />
        <Route path="/bookprintinggermiston" element={<Navigate to="/bookprinting" replace />} />
        <Route path="/bookprintingkemptonpark" element={<Navigate to="/bookprinting" replace />} />
        <Route path="/bookprintingfourways" element={<Navigate to="/bookprinting" replace />} />
        <Route path="/bookprintingbryanston" element={<Navigate to="/bookprinting" replace />} />

        {/* Self Publishing City Pages — all redirect to canonical */}
        <Route path="/selfpublishingjohannesburg" element={<Navigate to="/selfpublishingsouthafrica" replace />} />
        <Route path="/selfpublishingsandton" element={<Navigate to="/selfpublishingsouthafrica" replace />} />
        <Route path="/selfpublishingmidrand" element={<Navigate to="/selfpublishingsouthafrica" replace />} />
        <Route path="/selfpublishingrandburg" element={<Navigate to="/selfpublishingsouthafrica" replace />} />
        <Route path="/selfpublishingroodepoort" element={<Navigate to="/selfpublishingsouthafrica" replace />} />
        <Route path="/selfpublishingcenturion" element={<Navigate to="/selfpublishingsouthafrica" replace />} />
        <Route path="/selfpublishingpretoria" element={<Navigate to="/selfpublishingsouthafrica" replace />} />
        <Route path="/selfpublishingboksburg" element={<Navigate to="/selfpublishingsouthafrica" replace />} />
        <Route path="/selfpublishingbenoni" element={<Navigate to="/selfpublishingsouthafrica" replace />} />
        <Route path="/selfpublishingkemptonpark" element={<Navigate to="/selfpublishingsouthafrica" replace />} />
        <Route path="/selfpublishinggermiston" element={<Navigate to="/selfpublishingsouthafrica" replace />} />
        <Route path="/selfpublishingfourways" element={<Navigate to="/selfpublishingsouthafrica" replace />} />
        <Route path="/selfpublishingbryanston" element={<Navigate to="/selfpublishingsouthafrica" replace />} />
        <Route path="/selfpublishingsoweto" element={<Navigate to="/selfpublishingsouthafrica" replace />} />
        <Route path="/selfpublishingalberton" element={<Navigate to="/selfpublishingsouthafrica" replace />} />
        <Route path="/selfpublishingcapetown" element={<Navigate to="/selfpublishingsouthafrica" replace />} />
        <Route path="/selfpublishingstellenbosch" element={<Navigate to="/selfpublishingsouthafrica" replace />} />
        <Route path="/selfpublishingpaarl" element={<Navigate to="/selfpublishingsouthafrica" replace />} />
        <Route path="/selfpublishinggeorge" element={<Navigate to="/selfpublishingsouthafrica" replace />} />
        <Route path="/selfpublishingsomersetwest" element={<Navigate to="/selfpublishingsouthafrica" replace />} />
        <Route path="/selfpublishingbellville" element={<Navigate to="/selfpublishingsouthafrica" replace />} />
        <Route path="/selfpublishingdurban" element={<Navigate to="/selfpublishingsouthafrica" replace />} />
        <Route path="/selfpublishingumhlanga" element={<Navigate to="/selfpublishingsouthafrica" replace />} />
        <Route path="/selfpublishingpietermaritzburg" element={<Navigate to="/selfpublishingsouthafrica" replace />} />
        <Route path="/selfpublishingnewcastle" element={<Navigate to="/selfpublishingsouthafrica" replace />} />
        <Route path="/selfpublishingrichardsbay" element={<Navigate to="/selfpublishingsouthafrica" replace />} />
        <Route path="/selfpublishingportelizabeth" element={<Navigate to="/selfpublishingsouthafrica" replace />} />
        <Route path="/selfpublishingeastlondon" element={<Navigate to="/selfpublishingsouthafrica" replace />} />
        <Route path="/selfpublishinggrahamstown" element={<Navigate to="/selfpublishingsouthafrica" replace />} />
        <Route path="/selfpublishinguitenhage" element={<Navigate to="/selfpublishingsouthafrica" replace />} />
        <Route path="/selfpublishingbloemfontein" element={<Navigate to="/selfpublishingsouthafrica" replace />} />
        <Route path="/selfpublishingwelkom" element={<Navigate to="/selfpublishingsouthafrica" replace />} />
        <Route path="/selfpublishingpolokwane" element={<Navigate to="/selfpublishingsouthafrica" replace />} />
        <Route path="/selfpublishingtzaneen" element={<Navigate to="/selfpublishingsouthafrica" replace />} />
        <Route path="/selfpublishingthohoyandou" element={<Navigate to="/selfpublishingsouthafrica" replace />} />
        <Route path="/selfpublishingnelspruit" element={<Navigate to="/selfpublishingsouthafrica" replace />} />
        <Route path="/selfpublishingwitbank" element={<Navigate to="/selfpublishingsouthafrica" replace />} />
        <Route path="/selfpublishingmiddelburg" element={<Navigate to="/selfpublishingsouthafrica" replace />} />
        <Route path="/selfpublishingrustenburg" element={<Navigate to="/selfpublishingsouthafrica" replace />} />
        <Route path="/selfpublishingklerksdorp" element={<Navigate to="/selfpublishingsouthafrica" replace />} />
        <Route path="/selfpublishingpotchefstroom" element={<Navigate to="/selfpublishingsouthafrica" replace />} />
        <Route path="/selfpublishingkimberley" element={<Navigate to="/selfpublishingsouthafrica" replace />} />
        <Route path="/selfpublishingupington" element={<Navigate to="/selfpublishingsouthafrica" replace />} />

        {/* Location SEO (legacy - keep for backward compat) */}
        <Route path="/editingservicesjohannesburg" element={<LocationPage locationKey="editingservicesjohannesburg" />} />
        <Route path="/bookcoverdesignjohannesburg" element={<LocationPage locationKey="bookcoverdesignjohannesburg" />} />

        {/* Industry-Specific Printing Pages */}
        <Route path="/poetrybookprintingjohannesburg" element={<PoetryBookPrinting />} />
        <Route path="/memoirbookprintingjohannesburg" element={<MemoirBookPrinting />} />
        <Route path="/christianbookprintingjohannesburg" element={<ChristianBookPrinting />} />
        <Route path="/businessbookprintingjohannesburg" element={<BusinessBookPrinting />} />
        <Route path="/trainingmanualprintingjohannesburg" element={<TrainingManualPrinting />} />
        <Route path="/schoolbookprintingjohannesburg" element={<SchoolBookPrinting />} />
        <Route path="/novelprintingjohannesburg" element={<NovelPrinting />} />
        <Route path="/educationalbookprintingjohannesburg" element={<EducationalBookPrinting />} />

        {/* Long-Tail SEO Article Pages */}
        <Route path="/howtoprintabookinsouthafrica" element={<HowToPrintABook />} />
        <Route path="/howmuchdoesbookprintingcost" element={<HowMuchDoesBookPrintingCost />} />
        <Route path="/bestbooksizeforselfpublishing" element={<BestBookSizeForSelfPublishing />} />
        <Route path="/a5vs6x9bookprinting" element={<A5vs6x9BookPrinting />} />
        <Route path="/hardcovervspaperbackprinting" element={<HardcoverVsPaperback />} />
        <Route path="/howtoselfpublishabook" element={<HowToSelfPublishABook />} />

        {/* Interactive Tools */}
        <Route path="/calculator" element={<NewCalculator />} />
        <Route path="/bookprintingcalculator" element={<NewCalculator />} />
        <Route path="/tools/BookPrintingCalculator" element={<NewCalculator />} />
        <Route path="/tools/UniversalCalculator" element={<NewCalculator />} />
        <Route path="/publishingroadmap" element={<PublishingRoadmap />} />

        {/* Resource Pages */}
        <Route path="/isbn" element={<ISBNRegistration />} />
        <Route path="/isbnregistration" element={<Navigate to="/isbn" replace />} />
        <Route path="/howtopublishabook" element={<CompletePublishingGuide />} />
        <Route path="/publishingguide" element={<CompletePublishingGuide />} />
        <Route path="/printingguide" element={<ResourcePage resourceKey="printingguide" />} />
        <Route path="/editingguide" element={<ResourcePage resourceKey="editingguide" />} />
        <Route path="/bookmarketingguide" element={<ResourcePage resourceKey="bookmarketingguide" />} />
        <Route path="/nda" element={<NDA />} />
        <Route path="/covercalculator" element={<CoverSizeCalculator />} />
        <Route path="/resources/CoverSizeCalculator" element={<CoverSizeCalculator />} />
        <Route path="/portfolio" element={<Portfolio />} />

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

        {/* New Blog Article Pages */}
        <Route path="/printondemandbooksinsouthafrica" element={<PrintOnDemandSouthAfrica />} />
        <Route path="/howmuchdoesitcosttoselfpublishonamazonkindle" element={<CostToSelfPublishKindle />} />
        <Route path="/professionalcopyeditingservices" element={<ProfessionalCopyEditing />} />
        <Route path="/whatisghostwriting" element={<WhatIsGhostwriting />} />
        <Route path="/writingabookdedication" element={<WritingBookDedication />} />
        <Route path="/writingabookacknowledgment" element={<WritingBookAcknowledgment />} />
        <Route path="/howtonameyourbook" element={<HowToNameYourBook />} />
        <Route path="/howtoprintyourselfpublishedbookinsouthafrica" element={<HowToPrintSelfPublishedBook />} />
        <Route path="/childrensbookillustrationsprinting" element={<ChildrensBookIllustrations />} />
        <Route path="/ebookvsprintbookselfpublishing" element={<EbookVsPrint />} />
        <Route path="/howlongdoesittaketoselfpublish" element={<HowLongSelfPublish />} />
        <Route path="/howmuchdoesitcosttoselfpublishonamazon" element={<CostToSelfPublishAmazon />} />
        <Route path="/howtobecomeawriterinsouthafrica" element={<BecomeAWriter />} />
        <Route path="/isbnregistrationsouthafrica" element={<ISBNRegistrationSA />} />
        <Route path="/howtogetanisbnforyourbook" element={<HowToGetISBN />} />
        <Route path="/abeginnersguide" element={<BeginnersGuideSelfPublishing />} />
        <Route path="/howtoselfpublishchildrensbooks" element={<SelfPublishChildrensBooks />} />
        <Route path="/whatisselfpublishing" element={<WhatIsSelfPublishing />} />
        <Route path="/copyrightfaqsforauthors" element={<CopyrightFAQsAuthors />} />
        <Route path="/questionstoaskapublisher" element={<QuestionsToAskPublisher />} />
        <Route path="/howdoigetmybookpublishedinsouthafrica" element={<HowDoIGetMyBookPublished />} />
        <Route path="/dosouthafricanpublisherschargeauthors" element={<DoSouthAfricanPublishersChargeAuthors />} />
        <Route path="/howmuchwilliearnfrommyfirstbook" element={<HowMuchWillIEarnFromMyFirstBook />} />
        <Route path="/whatisafairbookdealforsouthafricanauthors" element={<WhatIsAFairBookDeal />} />
        <Route path="/doineedaneditorbeforepublishing" element={<DoINeedAnEditorBeforePublishing />} />
        <Route path="/howtofindliteraryagentinsouthafrica" element={<HowToFindALiteraryAgentSA />} />
        <Route path="/howtopublishachildrensbookinsouthafrica" element={<HowToPublishChildrensBookSA />} />
        <Route path="/canipublishacomicbookinsouthafrica" element={<CanIPublishAComicBookSA />} />
        <Route path="/howtomarketandsellyourselfpublishedbookinsouthafrica" element={<HowToMarketSelfPublishedBookSA />} />
        <Route path="/howdosouthafricanpublishinghousesfindnewauthors" element={<HowDoPublishersFindAuthors />} />
        <Route path="/whatfreelanceprofessionalsdoineedtoselfpublish" element={<WhatFreelanceProfessionalsDoINeed />} />
        <Route path="/isselling3000copiesofabookgoodinsouthafrica" element={<IsSelling3000CopiesGood />} />
        <Route path="/howdoiknowifmybookisreadytopublish" element={<HowDoIKnowIfMyBookIsReady />} />
        <Route path="/whatpublishingjobsareavailableinsouthafrica" element={<WhatPublishingJobsAreAvailable />} />
        <Route path="/howlongdoesittaketogetpublishedinsouthafrica" element={<HowLongToGetPublishedSA />} />
        <Route path="/dosouthafricanpublishersprovidecoverdesign" element={<DoPublishersProvideCoverDesign />} />
        <Route path="/dosouthafricanpublishersprovdecoverdesign" element={<Navigate to="/dosouthafricanpublishersprovidecoverdesign" replace />} />
        <Route path="/whatis9010ruleforauthorsandroyalties" element={<WhatIs9010RuleAuthors />} />
        <Route path="/howtochoosebetweenmultiplebookpublishingoffers" element={<HowToChooseBetweenPublishingOffers />} />
        <Route path="/canyoumakealivingasaselfpublishedauthorinsouthafrica" element={<CanYouMakeALivingAsAuthorSA />} />
        <Route path="/whattolookforinsouthafricanpublishingcontract" element={<WhatToLookForInPublishingContract />} />
        <Route path="/howtoprotectmybookideabeforepublishinginsouthafrica" element={<HowToProtectBookIdeaSA />} />
        <Route path="/dosouthafricanauthorsneedinternationaldistribution" element={<DoAuthorsNeedInternationalDistribution />} />
        <Route path="/howmuchdoispendonbookcoverdesigninsouthafrica" element={<HowMuchToSpendOnCoverDesign />} />
        <Route path="/bestplatformstoselfpublishinsouthafrica" element={<BestPlatformsToSelfPublishSA />} />
        <Route path="/howtobuildanauthorplatformbeforepublishing" element={<HowToBuildAuthorPlatform />} />
        <Route path="/traditionalvsselfpublishingroyaltiesinsouthafrica" element={<TraditionalVsSelfPublishingRoyalties />} />
        <Route path="/canipublishabookinsouthafricaifenglishisnotmyfirstlanguage" element={<CanIPublishInOtherLanguagesSA />} />
        <Route path="/howtofindbetareadersformybookinsouthafrica" element={<HowToFindBetaReadersSA />} />
        <Route path="/howtofindbetrareadersformybookinsouthafrica" element={<Navigate to="/howtofindbetareadersformybookinsouthafrica" replace />} />
        <Route path="/whattaxesdoselfpublishedauthorspayinsouthafrica" element={<WhatTaxesDoAuthorsPaySA />} />
        <Route path="/howtogetyourbookreviewedbysouthafricanpublications" element={<HowToGetBookReviewedSA />} />
        <Route path="/shouldihirepublishingcoachinsouthafrica" element={<ShouldIHirePublishingCoachSA />} />
        <Route path="/mostcommonpublishingmistakesbysouthafricanauthors" element={<CommonPublishingMistakesSA />} />
        <Route path="/mostcommonpublishingmistadebysouthafricanauthors" element={<Navigate to="/mostcommonpublishingmistakesbysouthafricanauthors" replace />} />
        <Route path="/howtolaunchyourbooksuccessfullyinsouthafrica" element={<HowToLaunchYourBookSA />} />
        <Route path="/canipublishmultiplegenresunderthesameauthorname" element={<CanIPublishMultipleGenresSA />} />
        
        {/* 301 redirects for broken /blog/ component URLs */}
        <Route path="/blog/BecomeAWriter" element={<Navigate to="/howtobecomeawriterinsouthafrica" replace />} />
        <Route path="/blog/BeginnersGuideSelfPublishing" element={<Navigate to="/abeginnersguide" replace />} />
        <Route path="/blog/BestPlatformsToSelfPublishSA" element={<Navigate to="/bestplatformstoselfpublishinsouthafrica" replace />} />
        <Route path="/blog/CanIPublishAComicBookSA" element={<Navigate to="/canipublishacomicbookinsouthafrica" replace />} />
        <Route path="/blog/CostToSelfPublishAmazon" element={<Navigate to="/howmuchdoesitcosttoselfpublishonamazon" replace />} />
        <Route path="/blog/CostToSelfPublishKindle" element={<Navigate to="/howmuchdoesitcosttoselfpublishonamazonkindle" replace />} />
        <Route path="/blog/DoAuthorsNeedInternationalDistribution" element={<Navigate to="/dosouthafricanauthorsneedinternationaldistribution" replace />} />
        <Route path="/blog/DoINeedAnEditorBeforePublishing" element={<Navigate to="/doineedaneditorbeforepublishing" replace />} />
        <Route path="/blog/DoPublishersProvideCoverDesign" element={<Navigate to="/dosouthafricanpublishersprovidecoverdesign" replace />} />
        <Route path="/blog/DoSouthAfricanPublishersChargeAuthors" element={<Navigate to="/dosouthafricanpublisherschargeauthors" replace />} />
        <Route path="/blog/EbookVsPrint" element={<Navigate to="/ebookvsprintbookselfpublishing" replace />} />
        <Route path="/blog/HowDebutAuthorsGetBetterDeals" element={<Navigate to="/howdebutauthorsgetbetterbookdealsinsouthafrica" replace />} />
        <Route path="/blog/HowDoIGetMyBookPublished" element={<Navigate to="/howdoigetmybookpublishedinsouthafrica" replace />} />
        <Route path="/blog/HowDoIKnowIfMyBookIsReady" element={<Navigate to="/howdoiknowifmybookisreadytopublish" replace />} />
        <Route path="/blog/HowDoPublishersFindAuthors" element={<Navigate to="/howdosouthafricanpublishinghousesfindnewauthors" replace />} />
        <Route path="/blog/CommonPublishingMistakesSA" element={<Navigate to="/mostcommonpublishingmistakesbysouthafricanauthors" replace />} />
        <Route path="/blog/CopyrightFAQsAuthors" element={<Navigate to="/copyrightfaqsforauthors" replace />} />

        {/* Dash-URL legacy redirects */}
        <Route path="/6x9-book-size-johannesburg" element={<Navigate to="/printing/6x9" replace />} />
        <Route path="/6x9-book-size-printing-johannesburg" element={<Navigate to="/printing/6x9" replace />} />
        <Route path="/a5-book-size-johannesburg" element={<Navigate to="/printing/a5" replace />} />
        <Route path="/childrens-books" element={<Navigate to="/printing/childrensbooks" replace />} />
        <Route path="/ebook-cover-design" element={<Navigate to="/ebookpublishing" replace />} />
        <Route path="/book-printing-johannesburg" element={<Navigate to="/bookprintingjohannesburg" replace />} />
        <Route path="/book-printing-in-johannesburg" element={<Navigate to="/bookprintingjohannesburg" replace />} />
        <Route path="/book-publishing-south-africa" element={<Navigate to="/bookpublisherssouthafrica" replace />} />
        <Route path="/self-publishing-south-africa" element={<Navigate to="/selfpublishingsouthafrica" replace />} />
        <Route path="/book-cover-design-south-africa" element={<Navigate to="/bookcoverdesignsouthafrica" replace />} />
        <Route path="/book-editing-south-africa" element={<Navigate to="/bookediting" replace />} />
        <Route path="/ghost-writing-south-africa" element={<Navigate to="/ghostwriting" replace />} />
        <Route path="/ghostwriting-south-africa" element={<Navigate to="/ghostwriting" replace />} />
        <Route path="/isbn-registration-south-africa" element={<Navigate to="/isbn" replace />} />
        {/* Legacy WordPress-style URL redirects */}
        <Route path="/product/reflections-of-a-convoluted-mind-dr-samke-j-ngcobo" element={<Navigate to="/portfolio" replace />} />
        <Route path="/website-design" element={<Navigate to="/authorwebsites" replace />} />
        <Route path="/product/typesetting" element={<Navigate to="/typesetting" replace />} />
        <Route path="/get-quote" element={<Navigate to="/getquote" replace />} />
        <Route path="/self-publishing-quote" element={<Navigate to="/getquote" replace />} />
        <Route path="/self-publishing-south-africa" element={<Navigate to="/selfpublishingsouthafrica" replace />} />
        <Route path="/book-cover-design-south-africa" element={<Navigate to="/bookcoverdesignsouthafrica" replace />} />
        <Route path="/book-editing-south-africa" element={<Navigate to="/bookediting" replace />} />
        <Route path="/ghost-writing-south-africa" element={<Navigate to="/ghostwriting" replace />} />
        <Route path="/ghostwriting-south-africa" element={<Navigate to="/ghostwriting" replace />} />
        <Route path="/isbn-registration-south-africa" element={<Navigate to="/isbn" replace />} />

        {/* 301 Redirects for deleted "New" SEO pages */}
        <Route path="/bookpublishersinsouthafrica" element={<Navigate to="/bookpublisherssouthafrica" replace />} />
        <Route path="/selfpublishingcompaniesinsouthafrica" element={<SelfPublishingCompaniesSouthAfrica />} />
        <Route path="/bookprintingjohannesburgnew" element={<Navigate to="/bookprintingjohannesburg" replace />} />
        <Route path="/bookcoverdesignpricesouthafrica" element={<BookCoverDesignPriceSouthAfrica />} />
        <Route path="/bookeditorsinsouthafrica" element={<BookEditorsSouthAfrica />} />
        <Route path="/booklayoutandtypesetting" element={<BookLayoutTypesetting />} />
        <Route path="/isbnnumbersouthafrica" element={<ISBNNumberSouthAfrica />} />
        <Route path="/bookdistributioninsouthafrica" element={<BookDistributionSouthAfrica />} />
        <Route path="/howdebutauthorsgetbetterbookdealsinsouthafrica" element={<HowDebutAuthorsGetBetterDeals />} />
        <Route path="/whatistheroleliteraryagentinsouthafrica" element={<RoleLiteraryAgentSA />} />
        <Route path="/howtostartpublishingcareerfromzeroinsouthafrica" element={<HowToStartPublishingCareerSA />} />

        <Route path="*" element={<PageNotFound />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
      <Route path="/admin/submissions" element={<ProtectedAdminRoute><AdminInbox /></ProtectedAdminRoute>} />
      <Route path="/admin/leads" element={<ProtectedAdminRoute><AdminLeads /></ProtectedAdminRoute>} />
      <Route path="/admin/contacts" element={<ProtectedAdminRoute><AdminContacts /></ProtectedAdminRoute>} />
      <Route path="/admin/services" element={<ProtectedAdminRoute><AdminServices /></ProtectedAdminRoute>} />
      <Route path="/admin/settings" element={<ProtectedAdminRoute><AdminSettings /></ProtectedAdminRoute>} />
      <Route path="/admin/pipeline" element={<ProtectedAdminRoute><AdminPipeline /></ProtectedAdminRoute>} />
      <Route path="/admin/quotes" element={<ProtectedAdminRoute><AdminQuotes /></ProtectedAdminRoute>} />
      <Route path="/admin/quotes/new" element={<ProtectedAdminRoute><AdminQuoteBuilder /></ProtectedAdminRoute>} />
      <Route path="/admin/quotes/:id" element={<ProtectedAdminRoute><AdminQuoteBuilder /></ProtectedAdminRoute>} />
      <Route path="/admin/email-templates" element={<ProtectedAdminRoute><AdminEmailTemplates /></ProtectedAdminRoute>} />
      <Route path="/admin/contacts/detail" element={<ProtectedAdminRoute><AdminContactDetail /></ProtectedAdminRoute>} />
      <Route path="/admin/signatures" element={<ProtectedAdminRoute><AdminSignatures /></ProtectedAdminRoute>} />
      <Route path="/admin/search-console" element={<ProtectedAdminRoute><SearchConsoleDashboard /></ProtectedAdminRoute>} />
      <Route path="/admin/seo" element={<ProtectedAdminRoute><SeoAnalytics /></ProtectedAdminRoute>} />
      <Route path="/quote/view/:id/:token" element={<QuoteView />} />
    </Routes>
    </Suspense>
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