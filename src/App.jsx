import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
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

// Printing Sub-Pages (full content)
import PrintingA5 from './pages/printing/PrintingA5.jsx';
import Printing6x9 from './pages/printing/Printing6x9.jsx';
import PrintingHardcover from './pages/printing/PrintingHardcover.jsx';
import PrintingChildrensBooks from './pages/printing/PrintingChildrensBooks';
import ChildrensBooks15x15 from './pages/printing/childrensbooks/ChildrensBooks15x15.jsx';
import ChildrensBooks20x20 from './pages/printing/childrensbooks/ChildrensBooks20x20.jsx';
import ChildrensBooks21x21 from './pages/printing/childrensbooks/ChildrensBooks21x21.jsx';

// Service Silo Pages
import BookPublishing from './pages/services/BookPublishing';
import MiniPublishingPackage from './pages/services/MiniPublishingPackage';
import A5BookPublishing from './pages/services/A5BookPublishing';
import SixByNinePublishing from './pages/services/SixByNinePublishing';
import FullPackagesA5 from './pages/publishing/FullPackagesA5';
import FullPackages6x9 from './pages/publishing/FullPackages6x9';
import MiniPackages from './pages/publishing/MiniPackages';
import BookPrinting from './pages/services/BookPrinting';
import BookEditing from './pages/services/BookEditing';
import Proofreading from './pages/services/Proofreading';
import AcademicEditing from './pages/services/AcademicEditing';
import ThesisEditing from './pages/services/ThesisEditing';
import DissertationEditing from './pages/services/DissertationEditing';
import BookCoverDesign from './pages/services/BookCoverDesign';
import AnnualReportDesign from './pages/AnnualReportDesign';
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
import Portfolio from './pages/Portfolio';

// New SEO Blog Article Pages
import PrintOnDemandSouthAfrica from './pages/blog/PrintOnDemandSouthAfrica';

import SelfPublishingCompaniesSouthAfrica from './pages/seo/SelfPublishingCompaniesSouthAfrica';
import BookCoverDesignPriceSouthAfrica from './pages/seo/BookCoverDesignPriceSouthAfrica';
import BookEditorsSouthAfrica from './pages/seo/BookEditorsSouthAfrica';
import BookLayoutTypesetting from './pages/seo/BookLayoutTypesetting';
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

// Existing SEO Landing Pages
import PublishingCompaniesSouthAfrica from './pages/seo/PublishingCompaniesSouthAfrica';
import BookPublishersSouthAfrica from './pages/seo/BookPublishersSouthAfrica';
import BookPublishersJohannesburg from './pages/seo/BookPublishersJohannesburg';
import BookPrintingJohannesburg from './pages/seo/BookPrintingJohannesburg';
import SelfPublishingSouthAfrica from './pages/seo/SelfPublishingSouthAfrica';
import BookCoverDesignSouthAfrica from './pages/seo/BookCoverDesignSouthAfrica';
import ProofreadingServicesSouthAfrica from './pages/seo/ProofreadingServicesSouthAfrica';
import GhostwritersSouthAfrica from './pages/seo/GhostwritersSouthAfrica';
import BestPublishingCompaniesSouthAfrica from './pages/seo/BestPublishingCompaniesSouthAfrica';

// Gauteng Location Pages (dedicated)
import BookPrintingSandton from './pages/seo/location/BookPrintingSandton.jsx';
import BookEditingSandton from './pages/seo/location/BookEditingSandton.jsx';
import BookPrintingRandburg from './pages/seo/location/BookPrintingRandburg.jsx';
import BookPrintingMidrand from './pages/seo/location/BookPrintingMidrand.jsx';
import BookPrintingPretoria from './pages/seo/location/BookPrintingPretoria.jsx';
import BookPrintingCenturion from './pages/seo/location/BookPrintingCenturion.jsx';
import BookPrintingRoodepoort from './pages/seo/location/BookPrintingRoodepoort.jsx';

// Book Cover Design Location Pages
import BookCoverDesignSandton from './pages/seo/location/BookCoverDesignSandton';
import BookCoverDesignRandburg from './pages/seo/location/BookCoverDesignRandburg';
import BookCoverDesignMidrand from './pages/seo/location/BookCoverDesignMidrand';
import BookCoverDesignPretoria from './pages/seo/location/BookCoverDesignPretoria';
import BookCoverDesignCenturion from './pages/seo/location/BookCoverDesignCenturion';
import BookCoverDesignRoodepoort from './pages/seo/location/BookCoverDesignRoodepoort';
import BookCoverDesignCapeTown from './pages/seo/location/BookCoverDesignCapeTown';
import BookCoverDesignDurban from './pages/seo/location/BookCoverDesignDurban';

// City Pages (scalable component)
import LocationsHub from './pages/seo/LocationsHub';

// Admin pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminInbox from './pages/admin/AdminInbox';
import AdminLeads from './pages/admin/AdminLeads';
import AdminContacts from './pages/admin/AdminContacts';
import AdminSettings from './pages/admin/AdminSettings';
import AdminServices from './pages/admin/AdminServices';
import SearchConsoleDashboard from './pages/admin/SearchConsoleDashboard';
import SeoAnalytics from './pages/admin/SeoAnalytics';
import AdminPipeline from './pages/admin/AdminPipeline';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';

// Industry-Specific Printing Pages
import PoetryBookPrinting from './pages/seo/industry/PoetryBookPrinting.jsx';
import MemoirBookPrinting from './pages/seo/industry/MemoirBookPrinting.jsx';
import ChristianBookPrinting from './pages/seo/industry/ChristianBookPrinting.jsx';
import BusinessBookPrinting from './pages/seo/industry/BusinessBookPrinting.jsx';
import TrainingManualPrinting from './pages/seo/industry/TrainingManualPrinting.jsx';
import SchoolBookPrinting from './pages/seo/industry/SchoolBookPrinting.jsx';
import NovelPrinting from './pages/seo/industry/NovelPrinting.jsx';
import EducationalBookPrinting from './pages/seo/industry/EducationalBookPrinting.jsx';

// Long-Tail SEO Article Pages
import HowToPrintABook from './pages/seo/longtail/HowToPrintABook.jsx';
import HowMuchDoesBookPrintingCost from './pages/seo/longtail/HowMuchDoesBookPrintingCost.jsx';
import BestBookSizeForSelfPublishing from './pages/seo/longtail/BestBookSizeForSelfPublishing.jsx';
import A5vs6x9BookPrinting from './pages/seo/longtail/A5vs6x9BookPrinting.jsx';
import HardcoverVsPaperback from './pages/seo/longtail/HardcoverVsPaperback.jsx';
import HowToSelfPublishABook from './pages/seo/longtail/HowToSelfPublishABook.jsx';

// Interactive Tools
import BookPrintingCalculator from './pages/tools/BookPrintingCalculator.jsx';
import PublishingRoadmap from './pages/tools/PublishingRoadmap.jsx';
import UniversalCalculator from './pages/tools/UniversalCalculator.jsx';
import NewCalculator from './pages/calculator/index.jsx';

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
        <Route path="/selfpublishing" element={<Navigate to="/selfpublishingsouthafrica" replace />} />
        <Route path="/publishingpackages" element={<Navigate to="/publishingpackages/a5" replace />} />
        <Route path="/publishingpackages/mini" element={<MiniPackages />} />
        <Route path="/publishingpackages/a5" element={<FullPackagesA5 />} />
        <Route path="/publishingpackages/6x9" element={<FullPackages6x9 />} />
        <Route path="/premiumpublishingpackage" element={<Navigate to="/publishingpackages" replace />} />
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
        <Route path="/isbnregistration" element={<ISBNRegistration />} />
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
        
        {/* Dash-URL legacy redirects */}
        <Route path="/6x9-book-size-johannesburg" element={<Navigate to="/printing/6x9" replace />} />
        <Route path="/6x9-book-size-printing-johannesburg" element={<Navigate to="/printing/6x9" replace />} />
        <Route path="/a5-book-size-johannesburg" element={<Navigate to="/printing/a5" replace />} />
        <Route path="/childrens-books" element={<Navigate to="/printing/childrensbooks" replace />} />
        <Route path="/ebook-cover-design" element={<Navigate to="/ebookpublishing" replace />} />
        <Route path="/book-printing-johannesburg" element={<Navigate to="/bookprintingjohannesburg" replace />} />
        <Route path="/book-publishing-south-africa" element={<Navigate to="/bookpublisherssouthafrica" replace />} />
        <Route path="/self-publishing-south-africa" element={<Navigate to="/selfpublishingsouthafrica" replace />} />
        <Route path="/book-cover-design-south-africa" element={<Navigate to="/bookcoverdesignsouthafrica" replace />} />
        <Route path="/book-editing-south-africa" element={<Navigate to="/bookediting" replace />} />
        <Route path="/ghost-writing-south-africa" element={<Navigate to="/ghostwriting" replace />} />
        <Route path="/ghostwriting-south-africa" element={<Navigate to="/ghostwriting" replace />} />
        <Route path="/isbn-registration-south-africa" element={<Navigate to="/isbnregistration" replace />} />

        {/* 301 Redirects for deleted "New" SEO pages */}
        <Route path="/publishingcompaniesinsouthafrica" element={<Navigate to="/publishingcompaniessouthafrica" replace />} />
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
      <Route path="/admin/search-console" element={<ProtectedAdminRoute><SearchConsoleDashboard /></ProtectedAdminRoute>} />
      <Route path="/admin/seo" element={<ProtectedAdminRoute><SeoAnalytics /></ProtectedAdminRoute>} />
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