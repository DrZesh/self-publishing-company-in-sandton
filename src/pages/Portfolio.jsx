import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageMeta from '../components/shared/PageMeta';
import { Link } from 'react-router-dom';
import { X, ArrowRight } from 'lucide-react';

const books = [
  { title: 'Prison Love', author: 'Tshidi Monkoe', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/cb372f107_PrisonLove-TshidiMonkoe.jpg' },
  { title: 'Separation & Divorce', author: 'Hilton Chirambadare', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/55c986ac5_SeparationAndDivorce-HiltonChirambadare.jpg' },
  { title: 'A Provoked Mind', author: 'Thoriso Mokwena', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/3ed9cc572_AProvokedMind-ThorisoMokwena.jpg' },
  { title: 'Portfolio Collection 1', author: 'Creative Books SA', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/eebb5e218_CreativeBooksSAPortfolioCollection1.jpg' },
  { title: 'Portfolio Collection 2', author: 'Creative Books SA', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/a64669860_CreativeBooksSAPortfolioCollection2.jpg' },
  { title: 'I Wish What I Wrote Wasn\'t True', author: 'T.D Khoza Ka Phahla', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/7ed9a6d9a_IWishWhatIWroteWasntTrue-TDKhozaKaPhahla.jpg' },
  { title: 'Celebrating A Century Of Life Lessons', author: 'Henock Nthepeng Seloane', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/145cb89fc_CelebratingACenturyOfLifeLessons-HenockNthepengSeloane.jpg' },
  { title: 'Matters Of The Heart', author: 'Patience Sakutukwa', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/9dad4f29e_MattersOfTheHeart-PatienceSakutukwa.jpg' },
  { title: 'My Perspective Redefined', author: 'MMaphaka Valerie', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/7616ebaf3_MyPerspectiveRedefined-MMaphakaValerie.jpg' },
  { title: 'What God Said About Money', author: 'Helman Chauke', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/bbb5d269e_WhatGodSaidAboutMoney-HelmanChauke.jpg' },
  { title: 'Blue Street', author: 'Phumlani Mhlanga', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/4f6d6db34_BlueStreet-PhumlaniMhlanga.jpg' },
  { title: 'Bows and Butterflies', author: 'Xoli M', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/df8d89ae2_BowsandButterflies-XoliM.jpg' },
  { title: 'Plays For Directing Projects', author: 'Samson M. Mlambo', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/b93962ae2_PlaysForDirectingProjects-SamsonMMlambo.jpg' },
  { title: 'Determined To Succeed', author: 'Nodumo Nyathi', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/0f6c810b4_DeterminedToSucceed-NodumoNyathi.jpg' },
  { title: 'Men Your Wife Is Not Your Relative', author: 'Brian N & Emma T Sigauke', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/ff4f98790_MenYourWifeIsNotYourRelative-BrianNandEmmaTSigauke.jpg' },
  { title: 'Unspoken Feelings', author: 'Ntsako Banyini', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/cc866a049_UnspokenFeelings-NtsakoBanyini.jpg' },
  { title: 'Attempt It Pray', author: 'Smanga P. Ngcobo', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/1dd5983eb_AttemptItPray-SmangaPNgcobo.jpg' },
  { title: 'Somebody To Die For', author: 'Ongeziwe Anezwa Soboyisi', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/f783ab91a_SomebodyToDieFor-OngeziweAnezwaSoboyisi.jpg' },
  { title: 'Light After The Tunnel', author: 'Foster Mathebula', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/0425741a2_481057123_1412985989720821_1308675644816122699_n.jpg' },
  { title: 'Separation & Divorce — A Woman\'s Journey', author: 'Hilton Chirambadare', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/b39d4a5fe_481712462_1415248216161265_7801457630275157711_n.jpg' },
  { title: 'Creative Books SA Collection', author: 'Creative Books SA', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/3c9c39609_481082056_1416932652659488_2329853335739821948_n.jpg' },
  { title: 'Verbal Abuse', author: 'Rev Martin Mambane', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/d6ddaf235_482347127_1419979805688106_4311989565222432168_n.jpg' },
  { title: 'Looking For Mother', author: 'Nkosiyazi Kan Kanjiri', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/acd9b3e95_482320680_1419979825688104_6466652577653743729_n.jpg' },
  { title: 'Somebody To Die For & Light After The Tunnel', author: 'Creative Books SA', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/3de6fc723_486456823_1428168308202589_8099564604917232680_n.jpg' },
  { title: 'Light After The Tunnel Print', author: 'Foster Mathebula', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/61c52e9c6_485805561_1428179888201431_9065441170713343980_n.jpg' },
  { title: 'Unspoken Feelings & My Perspective Redefined', author: 'Creative Books SA', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/b559d9740_485390559_1428315504854536_4633144333674042542_n.jpg' },
  { title: 'Unspoken Feelings Print', author: 'Ntsako Banyini', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/514e5c1c9_486254226_1428315808187839_3513103197125635029_n.jpg' },
  { title: 'My Perspective Redefined Print', author: 'Mmaphaka Valerie', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/c1157f192_485362148_1428315694854517_1417408040886993596_n.jpg' },
  { title: 'Books Portfolio Display', author: 'Creative Books SA', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/6c1e24811_486142472_1430214814664605_772337559844262479_n.jpg' },
  { title: 'Books Portfolio Display 2', author: 'Creative Books SA', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/619b2fa7a_486245699_1430971774588909_3846656953162883785_n.jpg' },
  { title: 'Books Portfolio Display 3', author: 'Creative Books SA', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/09137cf9c_486827935_1431089517910468_4459431295245215902_n.jpg' },
  { title: 'Books Portfolio Display 4', author: 'Creative Books SA', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/0a10a2ca5_486532891_1431567897862630_8922239183235126550_n.jpg' },
  { title: 'Books Portfolio Display 5', author: 'Creative Books SA', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/4a2143147_486951476_1432292431123510_5344358916422194004_n.jpg' },
  { title: 'What God Said About Money & Celebrating A Century', author: 'Creative Books SA', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/91849ae14_486725675_1433311784354908_1843703876019910716_n.jpg' },
  { title: 'Superlative Study Guide Grd 12', author: 'Chauke Emmanuel', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/3eaaf9d81_487315814_1434218517597568_5341239330606114166_n.jpg' },
  { title: 'Superlative Study Guide', author: 'Chauke Emmanuel', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/a7816589b_487297346_1434277694258317_4928013951775287029_n.jpg' },
  { title: "Neelo's Adventures Cars", author: 'Creative Books SA', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/9763680a5_486980284_1434277687591651_4168997591253435503_n.jpg' },
  { title: 'Discovering The Truth', author: 'Bongiwe Evidence Fakude', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/cc1686823_486852565_1434415407577879_6433022695318487559_n.jpg' },
  { title: 'A Peak Into A Teardrop Of Happiness', author: 'Sharan Alijan', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/9a72a8a93_488269378_1438387573847329_1679021776497608938_n.jpg' },
  { title: 'Why I Am Not You And Why You Are Not Me', author: 'Xitiko Ebenezer Nghunyulu', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/4327a0d34_488521513_1439165790436174_1375640748531462311_n.jpg' },
  { title: 'Parenting Seeds', author: 'Sibusiso P.S. Mhlongo', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/b2076da77_488788980_1443088703377216_5577894074168202785_n.jpg' },
  { title: 'Diary Of An X-Cop', author: 'Dumisani Nyundu', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/c61228fa1_489915981_1444729573213129_737366825041737435_n.jpg' },
  { title: 'Power Of A Personal Brand', author: 'Zinhle Sibanyoni', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/c34120756_489069731_1444898846529535_5389383308401716051_n.jpg' },
  { title: 'Power & Prison Love Collection', author: 'Creative Books SA', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/0551bc0c1_489840085_1445656799787073_4703561137123273972_n.jpg' },
  { title: 'Resilience In Adversity', author: 'Dr Gladys Ke-Di-Bone Mokwena', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/c33bf6338_490361408_1446981266321293_9082906275607083903_n.jpg' },
  { title: 'The Mindset Of A Conqueror', author: 'Zama Madlala', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/ac3098c55_489952284_1447623226257097_1368638842173466999_n.jpg' },
  { title: 'The Taste Capture', author: 'Linda Jele', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/ed210d317_490029957_1447623619590391_8759098372461508298_n.jpg' },
  { title: 'Reg September Liberated African', author: 'Patric Tariq Mellet', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/178c370dc_494541819_1463369018015851_3325753113331345710_n.jpg' },
  { title: 'The Adventurous Tales Of Pearl And The Mirror Girl', author: 'Nompumelelo Maake', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/eb9d0ce12_498944229_1476865806666172_1887606263458043207_n.jpg' },
  { title: "Father's Child", author: 'Lesego Radebe', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/0a5a06d6f_499149110_1477920989893987_1610510947046230172_n.jpg' },
  { title: 'The Dreamer', author: 'Elves Tembe', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/9100a85ea_499044482_1477921969893889_1732815073641874176_n.jpg' },
  { title: 'And When You Pray Tonight', author: 'Basetsana Moeketsi', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/70d206af4_499701090_1477926973226722_5746544786768421367_n.jpg' },
  { title: 'And When You Pray Tonight', author: 'Basetsana Moeketsi', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/0dd20d353_612499034_1673022357050515_3625531959446017440_n.jpg' },
  { title: 'And When You Pray Tonight Vol 2', author: 'Basetsana Moeketsi', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/820a06a6e_613686556_1673022443717173_5227824340098708539_n.jpg' },
  { title: 'The Science Of Learning', author: 'Siyabulela Mokebe', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/da5c4a61d_587204344_1673022560383828_1326602594760566744_n.jpg' },
  { title: 'Who Told You', author: 'Rox-Anne Maistry', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/f08be2f3c_613645629_1673022573717160_4868470217783488830_n.jpg' },
  { title: 'The Rainbow Child', author: 'Theto Malala & Mondo M', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/26936a977_613685410_1673022663717151_5818703633439230012_n.jpg' },
  { title: 'Beyond The Pass Mark', author: 'Siyabulela Mokebe', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/3719f0f84_612937562_1673022727050478_1726583046877172818_n.jpg' },
  { title: 'Wounds And Scars', author: 'Christian Lukusa', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/9a06a059e_614901185_1673022750383809_5196130755017688285_n.jpg' },
  { title: 'Wounds And Scars Hardcover', author: 'Christian Lukusa', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/9cd8acd8b_612827861_1673022797050471_799742162979354989_n.jpg' },
  { title: 'Réveil Patriotique', author: 'J.M Tshiend Ph.D', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/29eb51cbd_613825720_1673022873717130_5749607364150069860_n.jpg' },
  { title: 'And When You Pray Tonight Print', author: 'Basetsana Moeketsi', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/54ffd28dc_613223658_1673022900383794_2060904026950211080_n.jpg' },
  { title: 'Heaven On Earth', author: 'Rev Willy Payane', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/a248fa354_614300638_1673022920383792_5346183831405111091_n.jpg' },
  { title: 'Dice Of Despair', author: 'Sibongile Adelaide Nkabinde', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/29d81b2e6_612283573_1673022973717120_3635468695120987543_n.jpg' },
  { title: 'The B In Black Is Not Silent', author: 'Lebogang ba ga Latli', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/4f084be9a_612459344_1673023060383778_269162190373615914_n.jpg' },
  { title: 'Prison Love Print Edition', author: 'Tshidi Monkoe', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/711be8899_577058520_1673023063717111_4776096105036837654_n.jpg' },
  { title: 'Power Of A Personal Brand Hardcover', author: 'Zinhle Sibanyoni', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/c197963fd_613685410_1673023097050441_4093193411788256980_n.jpg' },
  { title: 'The Two Minutes Thought', author: 'Makofe M Lepheana', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/844a81a43_612974405_1673023157050435_6919278186303054667_n.jpg' },
  { title: 'Tonde Grandpa And Mafuta', author: 'Ku Masango', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/0dcf67f34_614897422_1673023270383757_608944878746122219_n.jpg' },
  { title: 'Unpaid Blood Debt', author: 'Thandeka Zuke', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/e79982657_613033936_1673023320383752_6922539239422786757_n.jpg' },
  { title: 'Thula Mama Thula', author: 'Bonga Vincent Matu', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/b81c4c6cd_612421364_1673023413717076_1312791346435053470_n.jpg' },
  { title: 'Reg September Liberated African 2', author: 'Patric Tariq Mellet with Mellisa Steyn', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/a4b9cb9d0_617471178_1679262366426514_208221870615113703_n.jpg' },
  { title: 'Journeying Through Entrepreneurship', author: 'Ntsaphokazi Madyibi', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/7ae266750_618289732_1679262516426499_5309097380450558071_n.jpg' },
  { title: 'Finding Motaung', author: 'Moleboheng Lesedi Moletsane', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/d8582756a_475123751_2095246430905944_8228356794468590920_n.jpg' },
  { title: 'Constant Couple', author: 'Kabelo P.L Malao', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/6146dbfa7_475177039_2095223870908200_762147224449980801_n.jpg' },
  { title: 'Xewani Ntombhi Ya Mutsanga', author: 'Sandie Ngenelo', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/ac5ba692f_475205008_2096253637471890_4276545254420047407_n.jpg' },
  { title: 'The Awakening Of The World Around Me', author: 'Ms. S Alijan', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/ca7e46cbf_475267109_2096277917469462_3464850355929452373_n.jpg' },
  { title: 'A War I Never Fought', author: 'Dyondzo Nukeri', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/871207c57_475289099_2096611070769480_1847543067118796056_n.jpg' },
  { title: 'Her Foreign Dream', author: 'Thandeka Zuke', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/167fdb30f_474924343_2096931524070768_1688537834528325854_n.jpg' },
  { title: 'Financial Literacy A Starter Pack To Financial Freedom', author: 'Aphiwe Twaku', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/dd8a407cf_475137467_2096931724070748_7529541709111777105_n.jpg' },
  { title: 'A Woman\'s Journey', author: 'Hilton Chirambadare', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/4e2bea4c6_481250805_1410346059984814_4683779288429470934_n.jpg' },
  { title: "Neelo's Adventures Cars Colouring Book", author: 'Creative Books SA', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/9763680a5_486980284_1434277687591651_4168997591253435503_n.jpg' },
  { title: 'Light After The Tunnel & My Perspective Redefined', author: 'Creative Books SA', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/acd9b3e95_482320680_1419979825688104_6466652577653743729_n.jpg' },
  { title: 'Discovering The Truth Print', author: 'Bongiwe Evidence Fakude', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/cc1686823_486852565_1434415407577879_6433022695318487559_n.jpg' },
  { title: 'Reg September Liberated African Hardcover', author: 'Patric Tariq Mellet with Mellisa Steyn', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/a7816589b_487297346_1434277694258317_4928013951775287029_n.jpg' },
  { title: 'Superlative Study Guide Grd 12 Stack', author: 'Chauke Emmanuel', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/3eaaf9d81_487315814_1434218517597568_5341239330606114166_n.jpg' },
  { title: 'Superlative Study Guide Stack', author: 'Chauke Emmanuel', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/4327a0d34_488521513_1439165790436174_1375640748531462311_n.jpg' },
  { title: 'Accidentally Became', author: 'Pastor Dr Sibusiso Nxumalo', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/91849ae14_486725675_1433311784354908_1843703876019910716_n.jpg' },
  { title: 'Botho Ubuntu', author: 'Gladys Ke-di-bone Mokwena', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/9a72a8a93_488269378_1438387573847329_1679021776497608938_n.jpg' },
  { title: 'The Cartel Of Justice', author: 'Kabelo P.L Malao', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/c61228fa1_489915981_1444729573213129_737366825041737435_n.jpg' },
];

export default function Portfolio() {
  const [selected, setSelected] = useState(null);

  return (
    <div className="min-h-screen bg-obsidian">
      <PageMeta
        title="Our Portfolio | Books We've Published | Creative Books SA"
        description="Explore the stunning portfolio of books published by Creative Books SA. Hundreds of South African authors have trusted us with their publishing journey."
        canonical="https://www.creativebookssa.co.za/portfolio"
      />

      {/* Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden bg-obsidian">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(184,115,51,0.18) 0%, transparent 60%)' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="text-copper text-sm font-body tracking-[0.3em] uppercase mb-4 block">Our Work</span>
            <h1 className="font-heading text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Some of the Books<br />
              <span className="text-gradient-copper">We've Worked On</span>
            </h1>
            <p className="text-white/55 font-body text-lg max-w-2xl mx-auto leading-relaxed">
              Proudly published and designed by Creative Books SA — each title a story, each cover a work of art.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-12 pb-24 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
          {books.map((book, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: (i % 10) * 0.05 }}
              className="break-inside-avoid cursor-pointer group relative overflow-hidden rounded-xl"
              onClick={() => setSelected(book)}
              whileHover={{ scale: 1.02 }}
            >
              <div className="relative overflow-hidden rounded-xl"
                style={{ border: '1px solid rgba(184,115,51,0.12)' }}>
                <img
                  src={book.img}
                  alt={`${book.title} by ${book.author}`}
                  className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3"
                  style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)' }}>
                  <p className="text-white font-heading text-sm font-semibold leading-tight">{book.title}</p>
                  <p className="text-copper text-xs font-body mt-0.5">{book.author}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.92)' }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
              className="relative max-w-2xl w-full"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setSelected(null)}
                className="absolute -top-4 -right-4 z-10 w-10 h-10 rounded-full bg-copper flex items-center justify-center shadow-lg hover:bg-copper/80 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
              <img
                src={selected.img}
                alt={`${selected.title} by ${selected.author}`}
                className="w-full rounded-2xl object-contain max-h-[80vh]"
              />
              <div className="mt-4 text-center">
                <h3 className="font-heading text-xl font-bold text-white">{selected.title}</h3>
                <p className="text-copper font-body mt-1">{selected.author}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CTA */}
      <section className="relative py-16 overflow-hidden" style={{ background: 'linear-gradient(135deg, #0d1830 0%, #090E18 100%)', borderTop: '1px solid rgba(184,115,51,0.15)' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-4">
              Ready to Add Your Book to Our Portfolio?
            </h2>
            <p className="text-white/55 font-body mb-8">
              Join hundreds of South African authors who've trusted Creative Books SA with their publishing journey.
            </p>
            <Link to="/getquote"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-medium text-white transition-all group"
              style={{ background: '#B87333', boxShadow: '0 8px 24px rgba(184,115,51,0.3)' }}>
              Get a Free Quote
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}