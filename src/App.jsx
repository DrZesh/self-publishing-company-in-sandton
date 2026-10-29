import { StaticRouter } from 'react-router-dom/server';
import ResetPassword from './pages/admin/ResetPassword';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import MainLayout from './components/layout/MainLayout';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';

// ─── Page components (static imports) ────────────────────────────────────────
// Core
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import GetQuote from './pages/GetQuote';
import FAQ from './pages/FAQ';
import Blog from './pages/Blog';
import BlogArticle from './pages/BlogArticle';
import Portfolio from './pages/Portfolio';
import AnnualReportDesign from './pages/AnnualReportDesign';

// Printing
import PrintingA5 from './pages/printing/PrintingA5.jsx';
import Printing6x9 from './pages/printing/Printing6x9.jsx';
import PrintingHardcover from './pages/printing/PrintingHardcover.jsx';
import PrintingChildrensBooks from './pages/printing/PrintingChildrensBooks';
import ChildrensBooks15x15 from './pages/printing/childrensbooks/ChildrensBooks15x15.jsx';
import ChildrensBooks20x20 from './pages/printing/childrensbooks/ChildrensBooks20x20.jsx';
import ChildrensBooks21x21 from './pages/printing/childrensbooks/ChildrensBooks21x21.jsx';

// Services
import BookPublishing from './pages/services/BookPublishing';
import MiniPublishingPackage from './pages/services/MiniPublishingPackage';
import A5BookPublishing from './pages/services/A5BookPublishing';
import SixByNinePublishing from './pages/services/SixByNinePublishing';
import FullPackagesA5 from './pages/publishing/FullPackagesA5';
import FullPackages6x9 from './pages/publishing/FullPackages6x9';
import MiniPackages from './pages/publishing/MiniPackages';
import BookPrinting from './pages/services/BookPrinting';
import BookEditing from './pages/services/BookEditing';
import AIGeneratedBookEditing from './pages/services/AIGeneratedBookEditing';
import Proofreading from './pages/services/Proofreading';
import AcademicEditing from './pages/services/AcademicEditing';
import ThesisEditing from './pages/services/ThesisEditing';
import DissertationEditing from './pages/services/DissertationEditing';
import BookCoverDesign from './pages/services/BookCoverDesign';
import EbookPublishing from './pages/services/EbookPublishing';
import Ghostwriting from './pages/services/Ghostwriting';
import BookTypesetting from './pages/services/BookTypesetting';
import SelfPublishingPackages from './pages/services/SelfPublishingPackages';
import AuthorWebsites from './pages/services/AuthorWebsites';
import ChildrensBookPackages from './pages/services/ChildrensBookPackages';
import MemoirWriting from './pages/services/MemoirWriting';
import BiographyWriting from './pages/services/BiographyWriting';
import ChristianBookWriting from './pages/services/ChristianBookWriting';
import LocationPage from './pages/services/LocationPage';
import ResourcePage from './pages/resources/ResourcePage';
import CompletePublishingGuide from './pages/resources/CompletePublishingGuide';
import ISBNRegistration from './pages/resources/ISBNRegistration';
import NDA from './pages/resources/NDA';
import CoverSizeCalculator from './pages/resources/CoverSizeCalculator';
import Documents from './pages/resources/Documents';
import CoverCalculator from './pages/Calculator';
import BarcodeGenerator from './pages/BarcodeGenerator';

// Legal & compliance
import LegalIndex from './pages/legal/LegalIndex';
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import CookiePolicy from './pages/legal/CookiePolicy';
import TermsAndConditions from './pages/legal/TermsAndConditions';
import RefundsAndReturns from './pages/legal/RefundsAndReturns';
import PaiaManual from './pages/legal/PaiaManual';
import Disclaimer from './pages/legal/Disclaimer';

// SEO landing pages
import PrintOnDemandSouthAfrica from './pages/blog/PrintOnDemandSouthAfrica';
import SelfPublishingCompaniesSouthAfrica from './pages/seo/SelfPublishingCompaniesSouthAfrica';
import BookCoverDesignPriceSouthAfrica from './pages/seo/BookCoverDesignPriceSouthAfrica';
import ISBNNumberSouthAfrica from './pages/seo/ISBNNumberSouthAfrica';
import BookDistributionSouthAfrica from './pages/seo/BookDistributionSouthAfrica';
import CostToSelfPublishKindle from './pages/blog/CostToSelfPublishKindle';
import ProfessionalCopyEditing from './pages/blog/ProfessionalCopyEditing';
import WhatIsGhostwriting from './pages/blog/WhatIsGhostwriting';
import WritingBookDedication from './pages/blog/WritingBookDedication';
import WritingBookAcknowledgment from './pages/blog/WritingBookAcknowledgment';
import HowToNameYourBook from './pages/blog/HowToNameYourBook';
import HowToPrintSelfPublishedBook from './pages/blog/HowToPrintSelfPublishedBook';
import ChildrensBookIllustrations from './pages/blog/ChildrensBookIllustrations';
import EbookVsPrint from './pages/blog/EbookVsPrint';
import HowLongSelfPublish from './pages/blog/HowLongSelfPublish';
import CostToSelfPublishAmazon from './pages/blog/CostToSelfPublishAmazon';
import BecomeAWriter from './pages/blog/BecomeAWriter';
import ISBNRegistrationSA from './pages/blog/ISBNRegistrationSA';
import HowToGetISBN from './pages/blog/HowToGetISBN';
import BeginnersGuideSelfPublishing from './pages/blog/BeginnersGuideSelfPublishing';
import SelfPublishChildrensBooks from './pages/blog/SelfPublishChildrensBooks';
import WhatIsSelfPublishing from './pages/blog/WhatIsSelfPublishing';
import CopyrightFAQsAuthors from './pages/blog/CopyrightFAQsAuthors';
import QuestionsToAskPublisher from './pages/blog/QuestionsToAskPublisher';
import HowDoIGetMyBookPublished from './pages/blog/HowDoIGetMyBookPublished';
import DoSouthAfricanPublishersChargeAuthors from './pages/blog/DoSouthAfricanPublishersChargeAuthors';
import HowMuchWillIEarnFromMyFirstBook from './pages/blog/HowMuchWillIEarnFromMyFirstBook';
import WhatIsAFairBookDeal from './pages/blog/WhatIsAFairBookDeal';
import DoINeedAnEditorBeforePublishing from './pages/blog/DoINeedAnEditorBeforePublishing';
import HowToFindALiteraryAgentSA from './pages/blog/HowToFindALiteraryAgentSA';
import HowToPublishChildrensBookSA from './pages/blog/HowToPublishChildrensBookSA';
import CanIPublishAComicBookSA from './pages/blog/CanIPublishAComicBookSA';
import HowToMarketSelfPublishedBookSA from './pages/blog/HowToMarketSelfPublishedBookSA';
import HowDoPublishersFindAuthors from './pages/blog/HowDoPublishersFindAuthors';
import WhatFreelanceProfessionalsDoINeed from './pages/blog/WhatFreelanceProfessionalsDoINeed';
import IsSelling3000CopiesGood from './pages/blog/IsSelling3000CopiesGood';
import HowDoIKnowIfMyBookIsReady from './pages/blog/HowDoIKnowIfMyBookIsReady';
import WhatPublishingJobsAreAvailable from './pages/blog/WhatPublishingJobsAreAvailable';
import HowLongToGetPublishedSA from './pages/blog/HowLongToGetPublishedSA';
import DoPublishersProvideCoverDesign from './pages/blog/DoPublishersProvideCoverDesign';
import WhatIs9010RuleAuthors from './pages/blog/WhatIs9010RuleAuthors';
import HowToChooseBetweenPublishingOffers from './pages/blog/HowToChooseBetweenPublishingOffers';
import CanYouMakeALivingAsAuthorSA from './pages/blog/CanYouMakeALivingAsAuthorSA';
import WhatToLookForInPublishingContract from './pages/blog/WhatToLookForInPublishingContract';
import HowToProtectBookIdeaSA from './pages/blog/HowToProtectBookIdeaSA';
import DoAuthorsNeedInternationalDistribution from './pages/blog/DoAuthorsNeedInternationalDistribution';
import HowMuchToSpendOnCoverDesign from './pages/blog/HowMuchToSpendOnCoverDesign';
import BestPlatformsToSelfPublishSA from './pages/blog/BestPlatformsToSelfPublishSA';
import HowToBuildAuthorPlatform from './pages/blog/HowToBuildAuthorPlatform';
import TraditionalVsSelfPublishingRoyalties from './pages/blog/TraditionalVsSelfPublishingRoyalties';
import CanIPublishInOtherLanguagesSA from './pages/blog/CanIPublishInOtherLanguagesSA';
import HowToFindBetaReadersSA from './pages/blog/HowToFindBetaReadersSA';
import WhatTaxesDoAuthorsPaySA from './pages/blog/WhatTaxesDoAuthorsPaySA';
import HowToGetBookReviewedSA from './pages/blog/HowToGetBookReviewedSA';
import ShouldIHirePublishingCoachSA from './pages/blog/ShouldIHirePublishingCoachSA';
import CommonPublishingMistakesSA from './pages/blog/CommonPublishingMistakesSA';
import HowToLaunchYourBookSA from './pages/blog/HowToLaunchYourBookSA';
import CanIPublishMultipleGenresSA from './pages/blog/CanIPublishMultipleGenresSA';
import HowDebutAuthorsGetBetterDeals from './pages/blog/HowDebutAuthorsGetBetterDeals';
import RoleLiteraryAgentSA from './pages/blog/RoleLiteraryAgentSA';
import HowToStartPublishingCareerSA from './pages/blog/HowToStartPublishingCareerSA';

// Existing SEO pages
import PublishingCompaniesSouthAfrica from './pages/seo/PublishingCompaniesSouthAfrica';
import BookPublishersSouthAfrica from './pages/seo/BookPublishersSouthAfrica';
import BookPublishersJohannesburg from './pages/seo/BookPublishersJohannesburg';
import BookPrintingJohannesburg from './pages/seo/BookPrintingJohannesburg';
import SelfPublishingSouthAfrica from './pages/seo/SelfPublishingSouthAfrica';
import BestPublishingCompaniesSouthAfrica from './pages/seo/BestPublishingCompaniesSouthAfrica';

// Location pages
import BookPrintingSandton from './pages/seo/location/BookPrintingSandton.jsx';
import BookEditingSandton from './pages/seo/location/BookEditingSandton.jsx';
import BookPrintingRandburg from './pages/seo/location/BookPrintingRandburg.jsx';
import BookPrintingMidrand from './pages/seo/location/BookPrintingMidrand.jsx';
import BookPrintingPretoria from './pages/seo/location/BookPrintingPretoria.jsx';
import BookPrintingCenturion from './pages/seo/location/BookPrintingCenturion.jsx';
import BookPrintingRoodepoort from './pages/seo/location/BookPrintingRoodepoort.jsx';
import BookCoverDesignSandton from './pages/seo/location/BookCoverDesignSandton';
import BookCoverDesignRandburg from './pages/seo/location/BookCoverDesignRandburg';
import BookCoverDesignMidrand from './pages/seo/location/BookCoverDesignMidrand';
import BookCoverDesignPretoria from './pages/seo/location/BookCoverDesignPretoria';
import BookCoverDesignCenturion from './pages/seo/location/BookCoverDesignCenturion';
import BookCoverDesignRoodepoort from './pages/seo/location/BookCoverDesignRoodepoort';
import BookCoverDesignCapeTown from './pages/seo/location/BookCoverDesignCapeTown';
import BookCoverDesignDurban from './pages/seo/location/BookCoverDesignDurban';
import LocationsHub from './pages/seo/LocationsHub';

// Industry pages
import PoetryBookPrinting from './pages/seo/industry/PoetryBookPrinting.jsx';
import MemoirBookPrinting from './pages/seo/industry/MemoirBookPrinting.jsx';
import ChristianBookPrinting from './pages/seo/industry/ChristianBookPrinting.jsx';
import BusinessBookPrinting from './pages/seo/industry/BusinessBookPrinting.jsx';
import TrainingManualPrinting from './pages/seo/industry/TrainingManualPrinting.jsx';
import SchoolBookPrinting from './pages/seo/industry/SchoolBookPrinting.jsx';
import NovelPrinting from './pages/seo/industry/NovelPrinting.jsx';
import EducationalBookPrinting from './pages/seo/industry/EducationalBookPrinting.jsx';

// Long-tail pages
import HowToPrintABook from './pages/seo/longtail/HowToPrintABook.jsx';
import HowMuchDoesBookPrintingCost from './pages/seo/longtail/HowMuchDoesBookPrintingCost.jsx';
import BestBookSizeForSelfPublishing from './pages/seo/longtail/BestBookSizeForSelfPublishing.jsx';
import A5vs6x9BookPrinting from './pages/seo/longtail/A5vs6x9BookPrinting.jsx';
import HardcoverVsPaperback from './pages/seo/longtail/HardcoverVsPaperback.jsx';
import HowToSelfPublishABook from './pages/seo/longtail/HowToSelfPublishABook.jsx';

// Tools & calculators
import BookPrintingCalculator from './pages/tools/BookPrintingCalculator.jsx';
import PublishingRoadmap from './pages/tools/PublishingRoadmap.jsx';
import UniversalCalculator from './pages/tools/UniversalCalculator.jsx';
import NewCalculator from './pages/calculator/index.jsx';

// Admin pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminInbox from './pages/admin/AdminInbox';
import AdminLeads from './pages/admin/AdminLeads';
import AdminContacts from './pages/admin/AdminContacts';
import AdminSettings from './pages/admin/AdminSettings';
import UserManagement from './components/admin/settings/UserManagement';
import AdminCompanySettings from './pages/admin/AdminCompanySettings';
import AdminServices from './pages/admin/AdminServices';
import AdminResourceDocuments from './pages/admin/AdminResourceDocuments';
import SearchConsoleDashboard from './pages/admin/SearchConsoleDashboard';
import SeoAnalytics from './pages/admin/SeoAnalytics';
import AdminPipeline from './pages/admin/AdminPipeline';
import AdminQuotes from './pages/admin/AdminQuotes';
import AdminQuoteBuilder from './pages/admin/AdminQuoteBuilder.jsx';
import AdminEmailTemplates from './pages/admin/AdminEmailTemplates';
import AdminEmailSettingsPage from './pages/admin/AdminEmailSettings';
import AdminMessageCentre from './pages/admin/AdminMessageCentre';
import AdminAutomationCentre from './pages/admin/AdminAutomationCentre';
import AdminContactDetail from './pages/admin/AdminContactDetail';
import AdminSignatures from './pages/admin/AdminSignatures';
import AdminSigningWorkflow from './pages/admin/AdminSigningWorkflow';
import AdminProjects from './pages/admin/AdminProjects';
import AdminInvoices from './pages/admin/AdminInvoices';
import AdminInvoiceBuilder from './pages/admin/AdminInvoiceBuilder';
import AdminPayments from './pages/admin/AdminPayments';
import AdminTasks from './pages/admin/AdminTasks';
import AdminDocuments from './pages/admin/AdminDocuments';
import AdminContracts from './pages/admin/AdminContracts';
import AdminCalendar from './pages/admin/AdminCalendar';
import AdminReports from './pages/admin/AdminReports';
import AdminClientPortal from './pages/admin/AdminClientPortal';
import AdminClientServiceUpdates from './pages/admin/AdminClientServiceUpdates';
import ClientPortal from './pages/ClientPortal';
import AdminAutomations from './pages/admin/AdminAutomations';
import QuoteView from './pages/QuoteView';
import InvoiceView from './pages/InvoiceView';
import DocumentView from './pages/DocumentView';
import AdminDocumentDashboard from './pages/admin/AdminDocumentDashboard';
import ProductionBoard from './pages/admin/ProductionBoard';
import RevenueForecast from './pages/admin/RevenueForecast';
import WalkInCheckin from './pages/WalkInCheckin';
import AdminBookLibrary from './pages/admin/AdminBookLibrary';
import AdminBookingSettings from './pages/admin/AdminBookingSettings';
import AdminAppointments from './pages/admin/AdminAppointments';
import BookAppointment from './pages/BookAppointment';
import AppointmentCancel from './pages/AppointmentCancel';
import AdminAuthors from './pages/admin/AdminAuthors';
import AdminCollections from './pages/admin/AdminCollections';
import ContractSign from './pages/ContractSign';
import AdminPipelineBuilder from './pages/admin/AdminPipelineBuilder';
import AdminClauseLibrary from './pages/admin/AdminClauseLibrary';
import AdminDocumentBuilder from './pages/admin/AdminDocumentBuilder';
import AdminFinance from './pages/admin/AdminFinance';
import AdminCommunication from './pages/admin/AdminCommunication';
import AdminChat from './pages/admin/AdminChat';
import AdminESignatures from './pages/admin/AdminESignatures';
import EmailPreview from './pages/admin/EmailPreview';
import AdminContractPrepare from './pages/admin/AdminContractPrepare';
import AdminContractPrepareContract from './pages/admin/AdminContractPrepareContract';
import AnalyticsDashboard from './pages/admin/AnalyticsDashboard';
import ESignatureSigning from './pages/ESignatureSigning';
import Unsubscribe from './pages/Unsubscribe';
import MyPortal from './pages/MyPortal';
import AdminExportData from './pages/admin/AdminExportData';
import AdminZohoBooks from './pages/admin/AdminZohoBooks';
import AdminProduction from './pages/admin/AdminProduction';
import AdminWorkflows from './pages/admin/AdminWorkflows';
import AdminMarketing from './pages/admin/AdminMarketing';
import AdminBusinessIntelligence from './pages/admin/AdminBusinessIntelligence';
import AdminOnboarding from './pages/admin/AdminOnboarding';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminBulkEmail from './pages/admin/AdminBulkEmail';
import AdminWhatsAppLog from './pages/admin/AdminWhatsAppLog';
import AdminFollowUps from './pages/admin/AdminFollowUps';
import AdminLeadScoring from './pages/admin/AdminLeadScoring';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();
  const ready = !isLoadingPublicSettings && !isLoadingAuth;

  if (!ready) {
    return null;
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
      <Route path="/admin/reset-password" element={<ResetPassword />} />
      <Route element={<MainLayout />}>
        {/* Core */}
        <Route path="/" element={<Home />} />
        <Route path="/aboutus" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/getquote" element={<GetQuote />} />
        <Route path="/faq" element={<FAQ />} />

        {/* Publishing Silo */}
        <Route path="/book-publishing" element={<BookPublishing />} />
        <Route path="/bookpublishing" element={<Navigate to="/book-publishing" replace />} />
        <Route path="/selfpublishing" element={<Navigate to="/self-publishing-south-africa" replace />} />
        <Route path="/publishingpackages" element={<Navigate to="/publishingpackages/a5" replace />} />
        <Route path="/publishingpackages/mini" element={<MiniPackages />} />
        <Route path="/publishingpackages/a5" element={<FullPackagesA5 />} />
        <Route path="/publishingpackages/6x9" element={<FullPackages6x9 />} />
        <Route path="/premiumpublishingpackage" element={<Navigate to="/publishingpackages/a5" replace />} />
        <Route path="/christianbookpublishing" element={<Navigate to="/book-publishing" replace />} />
        <Route path="/childrensbookpublishing" element={<Navigate to="/childrensbookpackages" replace />} />
        <Route path="/memoirpublishing" element={<Navigate to="/memoirwriting" replace />} />
        <Route path="/poetrypublishing" element={<Navigate to="/book-publishing" replace />} />
        <Route path="/businessbookpublishing" element={<Navigate to="/book-publishing" replace />} />

        <Route path="/self-publishing-packages-in-south-africa" element={<SelfPublishingPackages />} />
        <Route path="/selfpublishingpackagesinsouthafrica" element={<Navigate to="/self-publishing-packages-in-south-africa" replace />} />

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
        <Route path="/book-printing" element={<BookPrinting />} />
        <Route path="/a5bookprinting" element={<Navigate to="/printing/a5" replace />} />
        <Route path="/6x9bookprinting" element={<Navigate to="/printing/6x9" replace />} />
        <Route path="/hardcoverprinting" element={<Navigate to="/printing/hardcover" replace />} />
        <Route path="/softcoverprinting" element={<Navigate to="/book-printing" replace />} />
        <Route path="/creampaperprinting" element={<Navigate to="/book-printing" replace />} />
        <Route path="/whitepaperprinting" element={<Navigate to="/book-printing" replace />} />
        <Route path="/childrensbookprinting" element={<Navigate to="/printing/childrensbooks" replace />} />
        <Route path="/comicbookprinting" element={<Navigate to="/book-printing" replace />} />
        <Route path="/workbookprinting" element={<Navigate to="/book-printing" replace />} />
        <Route path="/manualprinting" element={<Navigate to="/book-printing" replace />} />
        <Route path="/bookprinting" element={<Navigate to="/book-printing" replace />} />

        {/* Editing Silo */}
        <Route path="/book-editing" element={<BookEditing />} />
        <Route path="/ai-generated-book-editing" element={<AIGeneratedBookEditing />} />
        <Route path="/proofreading" element={<Proofreading />} />
        <Route path="/copyediting" element={<Navigate to="/book-editing" replace />} />
        <Route path="/manuscriptevaluation" element={<Navigate to="/book-editing" replace />} />
        <Route path="/academicediting" element={<AcademicEditing />} />
        <Route path="/thesisediting" element={<ThesisEditing />} />
        <Route path="/dissertationediting" element={<DissertationEditing />} />
        <Route path="/technicalediting" element={<Navigate to="/book-editing" replace />} />
        <Route path="/languageediting" element={<Navigate to="/book-editing" replace />} />
        <Route path="/bookediting" element={<Navigate to="/book-editing" replace />} />

        {/* Design Silo */}
        <Route path="/book-cover-design" element={<BookCoverDesign />} />
        <Route path="/annualreportdesignsandton" element={<AnnualReportDesign />} />
        <Route path="/typesetting" element={<BookTypesetting />} />
        <Route path="/booklayoutdesign" element={<BookTypesetting />} />
        <Route path="/author-websites" element={<AuthorWebsites />} />
        <Route path="/authorwebsites" element={<Navigate to="/author-websites" replace />} />

        {/* Digital Silo */}
        <Route path="/bookcoverdesign" element={<Navigate to="/book-cover-design" replace />} />
        <Route path="/ebookpublishing" element={<Navigate to="/ebook-publishing" replace />} />
        <Route path="/ebookformatting" element={<EbookPublishing />} />
        <Route path="/ebook-publishing" element={<EbookPublishing />} />
        <Route path="/amazonkdp" element={<Navigate to="/ebook-publishing" replace />} />
        <Route path="/kindlepublishing" element={<Navigate to="/ebook-publishing" replace />} />
        <Route path="/ebook-packages" element={<Navigate to="/ebook-publishing" replace />} />

        {/* Writing Silo */}
        <Route path="/ghostwriting" element={<Ghostwriting />} />
        <Route path="/memoirwriting" element={<MemoirWriting />} />
        <Route path="/biographywriting" element={<BiographyWriting />} />
        <Route path="/christianbookwriting" element={<ChristianBookWriting />} />
        <Route path="/childrensbookpackages" element={<ChildrensBookPackages />} />

        {/* Existing SEO Landing Pages */}
        <Route path="/publishingcompaniesinsouthafrica" element={<PublishingCompaniesSouthAfrica />} />
        <Route path="/publishing-companies-south-africa" element={<PublishingCompaniesSouthAfrica />} />
        <Route path="/publishingcompaniessouthafrica" element={<Navigate to="/publishing-companies-south-africa" replace />} />
        <Route path="/book-publishers-south-africa" element={<BookPublishersSouthAfrica />} />
        <Route path="/book-publishers-johannesburg" element={<BookPublishersJohannesburg />} />
        <Route path="/bookpublishersjohannesburg" element={<Navigate to="/book-publishers-johannesburg" replace />} />
        <Route path="/book-printing-johannesburg" element={<BookPrintingJohannesburg />} />
        <Route path="/self-publishing-south-africa" element={<SelfPublishingSouthAfrica />} />
        <Route path="/bookcoverdesignsouthafrica" element={<Navigate to="/book-cover-design" replace />} />
        <Route path="/bookpublisherssouthafrica" element={<Navigate to="/book-publishers-south-africa" replace />} />
        <Route path="/selfpublishingsouthafrica" element={<Navigate to="/self-publishing-south-africa" replace />} />
        <Route path="/bookprintingjohannesburg" element={<Navigate to="/book-printing-johannesburg" replace />} />
        <Route path="/proofreadingservicessouthafrica" element={<Navigate to="/proofreading" replace />} />
        <Route path="/ghostwriterssouthafrica" element={<Navigate to="/ghostwriting" replace />} />
        <Route path="/best-publishing-companies-in-south-africa" element={<BestPublishingCompaniesSouthAfrica />} />
        <Route path="/bestpublishingcompaniesinsouthafrica" element={<Navigate to="/best-publishing-companies-in-south-africa" replace />} />

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
        <Route path="/bookprintingcapetown" element={<Navigate to="/book-printing" replace />} />
        <Route path="/bookprintingdurban" element={<Navigate to="/book-printing" replace />} />
        <Route path="/bookprintingbloemfontein" element={<Navigate to="/book-printing" replace />} />
        <Route path="/bookprintingpolokwane" element={<Navigate to="/book-printing" replace />} />
        <Route path="/bookprintingnelspruit" element={<Navigate to="/book-printing" replace />} />
        <Route path="/bookprintingportelizabeth" element={<Navigate to="/book-printing" replace />} />
        <Route path="/bookprintingeastlondon" element={<Navigate to="/book-printing" replace />} />
        <Route path="/bookprintingkimberley" element={<Navigate to="/book-printing" replace />} />
        <Route path="/bookprintingpietermaritzburg" element={<Navigate to="/book-printing" replace />} />
        <Route path="/bookprintingrustenburg" element={<Navigate to="/book-printing" replace />} />
        <Route path="/bookprintingboksburg" element={<Navigate to="/book-printing" replace />} />
        <Route path="/bookprintingbenoni" element={<Navigate to="/book-printing" replace />} />
        <Route path="/bookprintinggermiston" element={<Navigate to="/book-printing" replace />} />
        <Route path="/bookprintingkemptonpark" element={<Navigate to="/book-printing" replace />} />
        <Route path="/bookprintingfourways" element={<Navigate to="/book-printing" replace />} />
        <Route path="/bookprintingbryanston" element={<Navigate to="/book-printing" replace />} />

        {/* Self Publishing City Pages — all redirect to canonical */}
        <Route path="/selfpublishingjohannesburg" element={<Navigate to="/self-publishing-south-africa" replace />} />
        <Route path="/selfpublishingsandton" element={<Navigate to="/self-publishing-south-africa" replace />} />
        <Route path="/selfpublishingmidrand" element={<Navigate to="/self-publishing-south-africa" replace />} />
        <Route path="/selfpublishingrandburg" element={<Navigate to="/self-publishing-south-africa" replace />} />
        <Route path="/selfpublishingroodepoort" element={<Navigate to="/self-publishing-south-africa" replace />} />
        <Route path="/selfpublishingcenturion" element={<Navigate to="/self-publishing-south-africa" replace />} />
        <Route path="/selfpublishingpretoria" element={<Navigate to="/self-publishing-south-africa" replace />} />
        <Route path="/selfpublishingboksburg" element={<Navigate to="/self-publishing-south-africa" replace />} />
        <Route path="/selfpublishingbenoni" element={<Navigate to="/self-publishing-south-africa" replace />} />
        <Route path="/selfpublishingkemptonpark" element={<Navigate to="/self-publishing-south-africa" replace />} />
        <Route path="/selfpublishinggermiston" element={<Navigate to="/self-publishing-south-africa" replace />} />
        <Route path="/selfpublishingfourways" element={<Navigate to="/self-publishing-south-africa" replace />} />
        <Route path="/selfpublishingbryanston" element={<Navigate to="/self-publishing-south-africa" replace />} />
        <Route path="/selfpublishingsoweto" element={<Navigate to="/self-publishing-south-africa" replace />} />
        <Route path="/selfpublishingalberton" element={<Navigate to="/self-publishing-south-africa" replace />} />
        <Route path="/selfpublishingcapetown" element={<Navigate to="/self-publishing-south-africa" replace />} />
        <Route path="/selfpublishingstellenbosch" element={<Navigate to="/self-publishing-south-africa" replace />} />
        <Route path="/selfpublishingpaarl" element={<Navigate to="/self-publishing-south-africa" replace />} />
        <Route path="/selfpublishinggeorge" element={<Navigate to="/self-publishing-south-africa" replace />} />
        <Route path="/selfpublishingsomersetwest" element={<Navigate to="/self-publishing-south-africa" replace />} />
        <Route path="/selfpublishingbellville" element={<Navigate to="/self-publishing-south-africa" replace />} />
        <Route path="/selfpublishingdurban" element={<Navigate to="/self-publishing-south-africa" replace />} />
        <Route path="/selfpublishingumhlanga" element={<Navigate to="/self-publishing-south-africa" replace />} />
        <Route path="/selfpublishingpietermaritzburg" element={<Navigate to="/self-publishing-south-africa" replace />} />
        <Route path="/selfpublishingnewcastle" element={<Navigate to="/self-publishing-south-africa" replace />} />
        <Route path="/selfpublishingrichardsbay" element={<Navigate to="/self-publishing-south-africa" replace />} />
        <Route path="/selfpublishingportelizabeth" element={<Navigate to="/self-publishing-south-africa" replace />} />
        <Route path="/selfpublishingeastlondon" element={<Navigate to="/self-publishing-south-africa" replace />} />
        <Route path="/selfpublishinggrahamstown" element={<Navigate to="/self-publishing-south-africa" replace />} />
        <Route path="/selfpublishinguitenhage" element={<Navigate to="/self-publishing-south-africa" replace />} />
        <Route path="/selfpublishingbloemfontein" element={<Navigate to="/self-publishing-south-africa" replace />} />
        <Route path="/selfpublishingwelkom" element={<Navigate to="/self-publishing-south-africa" replace />} />
        <Route path="/selfpublishingpolokwane" element={<Navigate to="/self-publishing-south-africa" replace />} />
        <Route path="/selfpublishingtzaneen" element={<Navigate to="/self-publishing-south-africa" replace />} />
        <Route path="/selfpublishingthohoyandou" element={<Navigate to="/self-publishing-south-africa" replace />} />
        <Route path="/selfpublishingnelspruit" element={<Navigate to="/self-publishing-south-africa" replace />} />
        <Route path="/selfpublishingwitbank" element={<Navigate to="/self-publishing-south-africa" replace />} />
        <Route path="/selfpublishingmiddelburg" element={<Navigate to="/self-publishing-south-africa" replace />} />
        <Route path="/selfpublishingrustenburg" element={<Navigate to="/self-publishing-south-africa" replace />} />
        <Route path="/selfpublishingklerksdorp" element={<Navigate to="/self-publishing-south-africa" replace />} />
        <Route path="/selfpublishingpotchefstroom" element={<Navigate to="/self-publishing-south-africa" replace />} />
        <Route path="/selfpublishingkimberley" element={<Navigate to="/self-publishing-south-africa" replace />} />
        <Route path="/selfpublishingupington" element={<Navigate to="/self-publishing-south-africa" replace />} />

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
        <Route path="/bookprintingcalculator" element={<NewCalculator />} />
        <Route path="/tools/BookPrintingCalculator" element={<NewCalculator />} />
        <Route path="/tools/UniversalCalculator" element={<NewCalculator />} />
        <Route path="/publishingroadmap" element={<PublishingRoadmap />} />

        {/* Resource Pages */}
        <Route path="/how-to-get-an-isbn-in-south-africa" element={<ISBNRegistration />} />
        <Route path="/isbn" element={<Navigate to="/how-to-get-an-isbn-in-south-africa" replace />} />
        <Route path="/isbnregistration" element={<Navigate to="/how-to-get-an-isbn-in-south-africa" replace />} />
        <Route path="/howtopublishabook" element={<CompletePublishingGuide />} />
        <Route path="/publishingguide" element={<CompletePublishingGuide />} />
        <Route path="/printingguide" element={<ResourcePage resourceKey="printingguide" />} />
        <Route path="/editingguide" element={<ResourcePage resourceKey="editingguide" />} />
        <Route path="/bookmarketingguide" element={<ResourcePage resourceKey="bookmarketingguide" />} />
        <Route path="/book" element={<BookAppointment />} />
        <Route path="/appointment/cancel/:token" element={<AppointmentCancel />} />
        <Route path="/nda" element={<NDA />} />
        <Route path="/covercalculator" element={<CoverCalculator />} />
        <Route path="/covertemplatecalculator" element={<CoverCalculator />} />
        <Route path="/resources/CoverSizeCalculator" element={<CoverSizeCalculator />} />
        <Route path="/resources/documents" element={<Documents />} />
        <Route path="/resources/Documents" element={<Navigate to="/resources/documents" replace />} />
        <Route path="/calculator" element={<Navigate to="/resources/CoverSizeCalculator" replace />} />
        <Route path="/barcode-generator" element={<BarcodeGenerator />} />
        <Route path="/portfolio" element={<Portfolio />} />

        {/* Legal & Compliance */}
        <Route path="/legal" element={<LegalIndex />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/cookie-policy" element={<CookiePolicy />} />
        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
        <Route path="/refunds-and-returns" element={<RefundsAndReturns />} />
        <Route path="/paia-manual" element={<PaiaManual />} />
        <Route path="/disclaimer" element={<Disclaimer />} />

        {/* Blog */}
        <Route path="/blog" element={<Blog />} />
        <Route path="/publishingtips" element={<Blog />} />
        <Route path="/writingtips" element={<Blog />} />
        <Route path="/printingguides" element={<Blog />} />
        <Route path="/editingguides" element={<Blog />} />
        <Route path="/authorsuccessstories" element={<Blog />} />

        {/* Blog Articles */}
        <Route path="/howmuchdoesitcosttopublishabook" element={<BlogArticle />} />

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
        <Route path="/how-to-get-an-isbn-for-your-book" element={<HowToGetISBN />} />
        <Route path="/howtogetanisbnforyourbook" element={<Navigate to="/how-to-get-an-isbn-for-your-book" replace />} />
        <Route path="/howtogetanisbn" element={<Navigate to="/how-to-get-an-isbn-for-your-book" replace />} />
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
        <Route path="/ebook-cover-design" element={<Navigate to="/ebook-publishing" replace />} />
        <Route path="/book-printing-in-johannesburg" element={<Navigate to="/book-printing-johannesburg" replace />} />
        <Route path="/book-publishing-south-africa" element={<Navigate to="/book-publishers-south-africa" replace />} />
        <Route path="/book-cover-design-south-africa" element={<Navigate to="/book-cover-design" replace />} />
        <Route path="/book-editing-south-africa" element={<Navigate to="/book-editing" replace />} />
        <Route path="/ghost-writing-south-africa" element={<Navigate to="/ghostwriting" replace />} />
        <Route path="/ghostwriting-south-africa" element={<Navigate to="/ghostwriting" replace />} />
        <Route path="/isbn-registration-south-africa" element={<Navigate to="/isbn" replace />} />
        {/* Legacy WordPress-style URL redirects */}
        <Route path="/product/reflections-of-a-convoluted-mind-dr-samke-j-ngcobo" element={<Navigate to="/portfolio" replace />} />
        <Route path="/website-design" element={<Navigate to="/author-websites" replace />} />
        <Route path="/website-design-sandton" element={<Navigate to="/author-websites" replace />} />
        <Route path="/product/typesetting" element={<Navigate to="/typesetting" replace />} />
        <Route path="/get-quote" element={<Navigate to="/getquote" replace />} />
        <Route path="/self-publishing-quote" element={<Navigate to="/getquote" replace />} />
        <Route path="/request-a-self-publishing-quote" element={<Navigate to="/getquote" replace />} />
        <Route path="/contact-us" element={<Navigate to="/contact" replace />} />
        <Route path="/about-us" element={<Navigate to="/aboutus" replace />} />
        <Route path="/self-publishing-packages-south-africa" element={<Navigate to="/self-publishing-packages-in-south-africa" replace />} />
        <Route path="/self-publishing-packages" element={<Navigate to="/publishingpackages/a5" replace />} />
        <Route path="/publishers-of-johannesburg" element={<Navigate to="/book-publishers-johannesburg" replace />} />
        <Route path="/publishing-companies-in-south-africa" element={<Navigate to="/publishing-companies-south-africa" replace />} />
        <Route path="/proofreading-services" element={<Navigate to="/proofreading" replace />} />
        <Route path="/book-typesetting" element={<Navigate to="/typesetting" replace />} />
        <Route path="/shop" element={<Navigate to="/portfolio" replace />} />
        <Route path="/my-account" element={<Navigate to="/" replace />} />
        <Route path="/cart" element={<Navigate to="/" replace />} />
        <Route path="/checkout" element={<Navigate to="/getquote" replace />} />
        <Route path="/product-category/books" element={<Navigate to="/portfolio" replace />} />
        <Route path="/ghost-writing" element={<Navigate to="/ghostwriting" replace />} />

        {/* 301 Redirects for deleted "New" SEO pages */}
        <Route path="/bookpublishersinsouthafrica" element={<Navigate to="/book-publishers-south-africa" replace />} />
        <Route path="/selfpublishingcompaniesinsouthafrica" element={<SelfPublishingCompaniesSouthAfrica />} />
        <Route path="/bookprintingjohannesburgnew" element={<Navigate to="/book-printing-johannesburg" replace />} />
        <Route path="/bookcoverdesignpricesouthafrica" element={<BookCoverDesignPriceSouthAfrica />} />
        <Route path="/bookeditorsinsouthafrica" element={<Navigate to="/book-editing" replace />} />
        <Route path="/booklayoutandtypesetting" element={<Navigate to="/typesetting" replace />} />
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
      <Route path="/admin/resource-documents" element={<ProtectedAdminRoute><AdminResourceDocuments /></ProtectedAdminRoute>} />
      <Route path="/admin/settings" element={<ProtectedAdminRoute><AdminSettings /></ProtectedAdminRoute>} />
      <Route path="/admin/settings/users" element={<ProtectedAdminRoute><UserManagement /></ProtectedAdminRoute>} />
      <Route path="/admin/company-settings" element={<ProtectedAdminRoute><AdminCompanySettings /></ProtectedAdminRoute>} />
      <Route path="/admin/pipeline" element={<ProtectedAdminRoute><AdminPipeline /></ProtectedAdminRoute>} />
      <Route path="/admin/quotes" element={<ProtectedAdminRoute><AdminQuotes /></ProtectedAdminRoute>} />
      <Route path="/admin/quotes/new" element={<ProtectedAdminRoute><AdminQuoteBuilder /></ProtectedAdminRoute>} />
      <Route path="/admin/quotes/:id" element={<ProtectedAdminRoute><AdminQuoteBuilder /></ProtectedAdminRoute>} />
      <Route path="/admin/email-templates" element={<ProtectedAdminRoute><AdminEmailTemplates /></ProtectedAdminRoute>} />
      <Route path="/admin/contacts/detail" element={<ProtectedAdminRoute><AdminContactDetail /></ProtectedAdminRoute>} />
      <Route path="/admin/signatures" element={<ProtectedAdminRoute><AdminSignatures /></ProtectedAdminRoute>} />
      <Route path="/admin/signing" element={<ProtectedAdminRoute><AdminSigningWorkflow /></ProtectedAdminRoute>} />
      <Route path="/admin/projects" element={<ProtectedAdminRoute><AdminProjects /></ProtectedAdminRoute>} />
      <Route path="/admin/invoices" element={<ProtectedAdminRoute><AdminInvoices /></ProtectedAdminRoute>} />
      <Route path="/admin/invoices/new" element={<ProtectedAdminRoute><AdminInvoiceBuilder /></ProtectedAdminRoute>} />
      <Route path="/admin/invoices/:id" element={<ProtectedAdminRoute><AdminInvoiceBuilder /></ProtectedAdminRoute>} />
      <Route path="/admin/payments" element={<ProtectedAdminRoute><AdminPayments /></ProtectedAdminRoute>} />
      <Route path="/admin/tasks" element={<ProtectedAdminRoute><AdminTasks /></ProtectedAdminRoute>} />
      <Route path="/admin/documents" element={<ProtectedAdminRoute><AdminDocuments /></ProtectedAdminRoute>} />
      <Route path="/admin/contracts" element={<ProtectedAdminRoute><AdminContracts /></ProtectedAdminRoute>} />
      <Route path="/admin/calendar" element={<ProtectedAdminRoute><AdminCalendar /></ProtectedAdminRoute>} />
      <Route path="/admin/reports" element={<ProtectedAdminRoute><AdminReports /></ProtectedAdminRoute>} />
      <Route path="/admin/client-portal" element={<ProtectedAdminRoute><AdminClientPortal /></ProtectedAdminRoute>} />
      <Route path="/admin/client-service" element={<ProtectedAdminRoute><AdminClientServiceUpdates /></ProtectedAdminRoute>} />
      <Route path="/admin/automations" element={<ProtectedAdminRoute><AdminAutomations /></ProtectedAdminRoute>} />
      <Route path="/admin/search-console" element={<ProtectedAdminRoute><SearchConsoleDashboard /></ProtectedAdminRoute>} />
      <Route path="/admin/seo" element={<ProtectedAdminRoute><SeoAnalytics /></ProtectedAdminRoute>} />
      <Route path="/quote/view/:id/:token" element={<QuoteView />} />
      <Route path="/invoice/view/:id/:token" element={<InvoiceView />} />
      <Route path="/doc/view/:id/:token" element={<DocumentView />} />
      <Route path="/admin/document-dashboard" element={<ProtectedAdminRoute><AdminDocumentDashboard /></ProtectedAdminRoute>} />
      <Route path="/admin/production-board" element={<ProtectedAdminRoute><ProductionBoard /></ProtectedAdminRoute>} />
      <Route path="/admin/revenue-forecast" element={<ProtectedAdminRoute><RevenueForecast /></ProtectedAdminRoute>} />
      <Route path="/walk-in" element={<WalkInCheckin />} />
      <Route path="/admin/books" element={<ProtectedAdminRoute><AdminBookLibrary /></ProtectedAdminRoute>} />
      <Route path="/admin/booking-settings" element={<ProtectedAdminRoute><AdminBookingSettings /></ProtectedAdminRoute>} />
      <Route path="/admin/appointments" element={<ProtectedAdminRoute><AdminAppointments /></ProtectedAdminRoute>} />
      <Route path="/admin/authors" element={<ProtectedAdminRoute><AdminAuthors /></ProtectedAdminRoute>} />
      <Route path="/admin/collections" element={<ProtectedAdminRoute><AdminCollections /></ProtectedAdminRoute>} />
      <Route path="/portal/:token" element={<ClientPortal />} />
      <Route path="/sign/contract/:token" element={<ContractSign />} />
      <Route path="/admin/pipeline-builder" element={<ProtectedAdminRoute><AdminPipelineBuilder /></ProtectedAdminRoute>} />
      <Route path="/admin/clause-library" element={<ProtectedAdminRoute><AdminClauseLibrary /></ProtectedAdminRoute>} />
      <Route path="/admin/document-builder" element={<ProtectedAdminRoute><AdminDocumentBuilder /></ProtectedAdminRoute>} />
      <Route path="/admin/finance" element={<ProtectedAdminRoute><AdminFinance /></ProtectedAdminRoute>} />
      <Route path="/admin/communication" element={<ProtectedAdminRoute><AdminCommunication /></ProtectedAdminRoute>} />
      <Route path="/admin/chat" element={<ProtectedAdminRoute><AdminChat /></ProtectedAdminRoute>} />
      <Route path="/admin/esignatures" element={<ProtectedAdminRoute><AdminESignatures /></ProtectedAdminRoute>} />
      <Route path="/admin/esignatures/prepare/:id" element={<ProtectedAdminRoute><AdminContractPrepare /></ProtectedAdminRoute>} />
      <Route path="/admin/contracts/prepare/:id" element={<ProtectedAdminRoute><AdminContractPrepareContract /></ProtectedAdminRoute>} />
      <Route path="/admin/analytics" element={<ProtectedAdminRoute><AnalyticsDashboard /></ProtectedAdminRoute>} />
      <Route path="/admin/email-settings" element={<ProtectedAdminRoute><AdminEmailSettingsPage /></ProtectedAdminRoute>} />
      <Route path="/admin/email-preview" element={<EmailPreview />} />
      <Route path="/admin/message-centre" element={<ProtectedAdminRoute><AdminMessageCentre /></ProtectedAdminRoute>} />
      <Route path="/admin/automation-centre" element={<ProtectedAdminRoute><AdminAutomationCentre /></ProtectedAdminRoute>} />
      <Route path="/sign/esig/:requestId/:token" element={<ESignatureSigning />} />
      <Route path="/unsubscribe" element={<Unsubscribe />} />
      <Route path="/my-portal" element={<MyPortal />} />
      <Route path="/admin/export" element={<ProtectedAdminRoute><AdminExportData /></ProtectedAdminRoute>} />
      <Route path="/admin/production" element={<ProtectedAdminRoute><AdminProduction /></ProtectedAdminRoute>} />
      <Route path="/admin/workflows" element={<ProtectedAdminRoute><AdminWorkflows /></ProtectedAdminRoute>} />
      <Route path="/admin/marketing" element={<ProtectedAdminRoute><AdminMarketing /></ProtectedAdminRoute>} />
      <Route path="/admin/bi" element={<ProtectedAdminRoute><AdminBusinessIntelligence /></ProtectedAdminRoute>} />
      <Route path="/admin/onboarding" element={<ProtectedAdminRoute><AdminOnboarding /></ProtectedAdminRoute>} />
      <Route path="/admin/notifications" element={<ProtectedAdminRoute><AdminNotifications /></ProtectedAdminRoute>} />
      <Route path="/admin/bulk-email" element={<ProtectedAdminRoute><AdminBulkEmail /></ProtectedAdminRoute>} />
      <Route path="/admin/whatsapp-log" element={<ProtectedAdminRoute><AdminWhatsAppLog /></ProtectedAdminRoute>} />
      <Route path="/admin/zoho-books" element={<ProtectedAdminRoute><AdminZohoBooks /></ProtectedAdminRoute>} />
      <Route path="/admin/follow-ups" element={<ProtectedAdminRoute><AdminFollowUps /></ProtectedAdminRoute>} />
      <Route path="/admin/lead-scoring" element={<ProtectedAdminRoute><AdminLeadScoring /></ProtectedAdminRoute>} />
    </Routes>
  );
};

const SiteRouter = import.meta.env.SSR ? StaticRouter : Router;

function App({ url = "/" }) {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <SiteRouter location={url}>
          <AuthenticatedApp />
        </SiteRouter>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App