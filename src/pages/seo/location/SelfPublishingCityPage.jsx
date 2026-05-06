import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, CheckCircle, Star, Users, Award, Zap } from 'lucide-react';
import PageMeta from '../../../components/shared/PageMeta';
import CTASection from '../../../components/shared/CTASection';
import InternalLinks from '../../../components/shared/InternalLinks';
import FAQSection from '../../../components/shared/FAQSection';
import { serviceSchema, faqSchema, breadcrumbSchema } from '../../../lib/seo/schemas';

// ─── City Data ────────────────────────────────────────────────────────────────
export const selfPubCityData = {
  // GAUTENG
  johannesburg: {
    city: 'Johannesburg', province: 'Gauteng', region: 'Gauteng',
    nearby: ['Sandton', 'Randburg', 'Midrand', 'Soweto', 'Roodepoort'],
    nearbyPrinting: [{ label: 'Book Printing Johannesburg', path: '/bookprintingjohannesburg' }],
    intro: "Johannesburg is South Africa's publishing capital — home to more aspiring authors, business writers, and creative voices than anywhere else in the country. Whether you're writing your debut novel, a business leadership book, a memoir, or a children's story, Creative Books SA gives Johannesburg authors everything they need to publish professionally.",
    uniqueNote: "As South Africa's economic hub, Johannesburg-based authors often write business, entrepreneurship, and leadership titles — genres we know well. We have helped hundreds of Joburg authors go from manuscript to bookshelf.",
    printingPath: '/bookprintingjohannesburg',
  },
  sandton: {
    city: 'Sandton', province: 'Gauteng', region: 'Gauteng',
    nearby: ['Johannesburg', 'Randburg', 'Fourways', 'Bryanston', 'Midrand'],
    nearbyPrinting: [{ label: 'Book Printing Sandton', path: '/bookprintingsandton' }],
    intro: "Sandton is South Africa's corporate and financial hub — and a hotbed of business authors, corporate ghostwriters, and professional thought leaders. Creative Books SA provides world-class self-publishing services for Sandton-based authors and executives who want to publish authoritative, high-quality books.",
    uniqueNote: "Sandton business authors frequently use their published book as a high-value client acquisition and authority-building tool. We specialise in producing premium hardcover and softcover business books for the corporate market.",
    printingPath: '/bookprintingsandton',
  },
  midrand: {
    city: 'Midrand', province: 'Gauteng', region: 'Gauteng',
    nearby: ['Johannesburg', 'Pretoria', 'Centurion', 'Kempton Park', 'Fourways'],
    nearbyPrinting: [{ label: 'Book Printing Midrand', path: '/bookprintingmidrand' }],
    intro: "Midrand's strategic location between Johannesburg and Pretoria makes it one of the fastest-growing business nodes in Gauteng — and a growing centre for authors, educators, and corporate writers. Creative Books SA serves Midrand authors with complete self-publishing services delivered with Gauteng efficiency.",
    uniqueNote: "Midrand's mix of tech companies, government contractors, and educational institutions produces a unique variety of authors — from IT professionals writing industry guides to educators producing school materials. We serve all of them.",
    printingPath: '/bookprintingmidrand',
  },
  randburg: {
    city: 'Randburg', province: 'Gauteng', region: 'Gauteng',
    nearby: ['Johannesburg', 'Sandton', 'Roodepoort', 'Fourways', 'Bryanston'],
    nearbyPrinting: [{ label: 'Book Printing Randburg', path: '/bookprintingrandburg' }],
    intro: "Randburg is a vibrant, creative community in the heart of Gauteng — home to artists, educators, small business owners, and storytellers. Creative Books SA helps Randburg authors take their manuscripts to professionally published books without the barriers of traditional publishing.",
    uniqueNote: "Randburg's diverse, creative community produces a wide range of genres — from local fiction and poetry to practical guides and how-to books. We embrace this diversity and have experience publishing across all genres.",
    printingPath: '/bookprintingrandburg',
  },
  roodepoort: {
    city: 'Roodepoort', province: 'Gauteng', region: 'Gauteng',
    nearby: ['Johannesburg', 'Randburg', 'Krugersdorp', 'Soweto', 'Florida'],
    nearbyPrinting: [{ label: 'Book Printing Roodepoort', path: '/bookprintingroodepoort' }],
    intro: "Roodepoort on the West Rand is home to a rich community of educators, community leaders, and creative writers. Creative Books SA gives Roodepoort authors access to the same world-class publishing services available in Johannesburg's city centre — without having to travel far.",
    uniqueNote: "The West Rand has a strong tradition of community storytelling, religious publishing, and educational content. We have helped many Roodepoort authors publish memoirs, community histories, devotional books, and educational materials.",
    printingPath: '/bookprintingroodepoort',
  },
  centurion: {
    city: 'Centurion', province: 'Gauteng', region: 'Gauteng',
    nearby: ['Pretoria', 'Midrand', 'Johannesburg', 'Waterkloof', 'Irene'],
    nearbyPrinting: [{ label: 'Book Printing Centurion', path: '/bookprintingcenturion' }],
    intro: "Centurion sits at the heart of the Pretoria–Johannesburg corridor and is home to a growing creative and professional community. From Irene to Waterkloof Ridge, Centurion authors choose Creative Books SA for their comprehensive, quality-first approach to self-publishing.",
    uniqueNote: "Centurion's blend of corporate professionals and creatives produces a healthy mix of business books, memoirs, children's stories, and Christian publications. We are experienced in all these genres.",
    printingPath: '/bookprintingcenturion',
  },
  pretoria: {
    city: 'Pretoria', province: 'Gauteng', region: 'Gauteng',
    nearby: ['Centurion', 'Midrand', 'Hatfield', 'Waterkloof', 'Lynnwood'],
    nearbyPrinting: [{ label: 'Book Printing Pretoria', path: '/bookprintingpretoria' }],
    intro: "Pretoria — South Africa's administrative capital — is home to academics, government professionals, lawyers, and a thriving literary community. From university researchers to civil servants with stories to tell, Creative Books SA serves Pretoria authors with academic-grade publishing quality and professional delivery.",
    uniqueNote: "Pretoria has a high concentration of academic and professional writers. We have strong experience with academic non-fiction, government publications, thesis-to-book conversions, and institutional histories.",
    printingPath: '/bookprintingpretoria',
  },
  boksburg: {
    city: 'Boksburg', province: 'Gauteng', region: 'Gauteng',
    nearby: ['Benoni', 'Germiston', 'Kempton Park', 'Brakpan', 'Johannesburg'],
    nearbyPrinting: [{ label: 'Book Printing Johannesburg', path: '/bookprintingjohannesburg' }],
    intro: "Boksburg on the East Rand is part of Gauteng's most densely populated corridor. From Boksburg North to Vosloorus, this area is home to teachers, pastors, business owners, and first-time authors with important stories to share. Creative Books SA makes professional self-publishing accessible to every Boksburg author.",
    uniqueNote: "The East Rand has a strong tradition of community histories, church publications, and personal memoirs. We understand this market and produce books that resonate with local readers.",
    printingPath: '/bookprintingboksburg',
  },
  benoni: {
    city: 'Benoni', province: 'Gauteng', region: 'Gauteng',
    nearby: ['Boksburg', 'Kempton Park', 'Brakpan', 'Germiston', 'Edenvale'],
    nearbyPrinting: [{ label: 'Book Printing Johannesburg', path: '/bookprintingjohannesburg' }],
    intro: "Benoni — home to iconic South Africans and a proud community of East Rand storytellers — deserves a publishing partner that treats every author's book with the care it deserves. Creative Books SA brings professional self-publishing to Benoni's writers, educators, and thought leaders.",
    uniqueNote: "Benoni has produced world-famous creative talent. We honour that legacy by helping today's Benoni authors publish with the same ambition and professionalism as any traditionally published title.",
    printingPath: '/bookprintingbenoni',
  },
  kemptonpark: {
    city: 'Kempton Park', province: 'Gauteng', region: 'Gauteng',
    nearby: ['Benoni', 'Edenvale', 'Midrand', 'Boksburg', 'OR Tambo area'],
    nearbyPrinting: [{ label: 'Book Printing Johannesburg', path: '/bookprintingjohannesburg' }],
    intro: "Kempton Park is a dynamic East Rand hub with a growing community of authors, educators, and entrepreneurs. Its proximity to OR Tambo International Airport and major business parks makes it a fitting base for authors with national and international publishing ambitions. Creative Books SA is your local publishing partner in Kempton Park.",
    uniqueNote: "Kempton Park's diverse professional community produces business guides, motivational books, educational materials, and personal narratives. We publish across all these categories.",
    printingPath: '/bookprintingkemptonpark',
  },
  germiston: {
    city: 'Germiston', province: 'Gauteng', region: 'Gauteng',
    nearby: ['Boksburg', 'Johannesburg South', 'Alberton', 'Bedfordview', 'Ekurhuleni'],
    nearbyPrinting: [{ label: 'Book Printing Johannesburg', path: '/bookprintingjohannesburg' }],
    intro: "Germiston is at the geographic heart of Gauteng's East Rand and has a proud industrial and community heritage. Authors from Germiston, Bedfordview, and surrounding Ekurhuleni areas trust Creative Books SA to publish their work with precision and pride.",
    uniqueNote: "Germiston authors often write about community heritage, business journeys, and personal transformation — all genres we publish regularly. Our books look and feel as professional as any traditionally published title.",
    printingPath: '/bookprintinggermiston',
  },
  fourways: {
    city: 'Fourways', province: 'Gauteng', region: 'Gauteng',
    nearby: ['Sandton', 'Bryanston', 'Midrand', 'Randburg', 'Dainfern'],
    nearbyPrinting: [{ label: 'Book Printing Sandton', path: '/bookprintingsandton' }],
    intro: "Fourways has evolved into one of Gauteng's premier lifestyle and business destinations. Home to entrepreneurs, executives, and creative professionals, Fourways is the perfect base for an author with a message worth publishing. Creative Books SA helps Fourways authors publish books that match their own high standards.",
    uniqueNote: "Fourways authors often produce premium business books, motivational titles, and high-end lifestyle content. We specialize in producing books that look and sell as premium products.",
    printingPath: '/bookprintingfourways',
  },
  bryanston: {
    city: 'Bryanston', province: 'Gauteng', region: 'Gauteng',
    nearby: ['Sandton', 'Fourways', 'Randburg', 'Midrand', 'Craighall Park'],
    nearbyPrinting: [{ label: 'Book Printing Sandton', path: '/bookprintingsandton' }],
    intro: "Bryanston is one of Gauteng's most prestigious residential and business addresses — and home to authors who expect the best. Creative Books SA provides Bryanston authors with publishing services that match the premium standard of their neighbourhood: exquisite cover design, flawless editing, and premium printing.",
    uniqueNote: "Bryanston clients frequently produce high-end business books, gift-worthy hardcover memoirs, and luxury lifestyle titles. Our hardcover production quality consistently exceeds expectations.",
    printingPath: '/bookprintingbryanston',
  },
  soweto: {
    city: 'Soweto', province: 'Gauteng', region: 'Gauteng',
    nearby: ['Johannesburg', 'Roodepoort', 'Lenasia', 'Soweto'],
    nearbyPrinting: [{ label: 'Book Printing Johannesburg', path: '/bookprintingjohannesburg' }],
    intro: "Soweto has given the world some of South Africa's most powerful stories — from the anti-apartheid struggle to the voices of a new generation building the rainbow nation. Creative Books SA is honoured to serve Soweto authors and help them publish the stories, histories, and visions that the world needs to hear.",
    uniqueNote: "Soweto has a rich tradition of memoir, political narrative, community history, and inspirational storytelling. We publish these genres with the respect and quality they deserve. We believe every Soweto story deserves a professional stage.",
    printingPath: '/bookprintingjohannesburg',
  },
  alberton: {
    city: 'Alberton', province: 'Gauteng', region: 'Gauteng',
    nearby: ['Germiston', 'Johannesburg South', 'Boksburg', 'Vereeniging', 'Meyerton'],
    nearbyPrinting: [{ label: 'Book Printing Johannesburg', path: '/bookprintingjohannesburg' }],
    intro: "Alberton and the greater South of Johannesburg region has a deep-rooted community of educators, church leaders, and authors. Creative Books SA serves Alberton authors with professional self-publishing services that bring their manuscripts to life as quality published books.",
    uniqueNote: "South Johannesburg produces a wealth of community histories, devotional publications, and educational materials. We print and publish for all of these, from small chapel booklets to full-length community chronicles.",
    printingPath: '/bookprintingjohannesburg',
  },

  // WESTERN CAPE
  capetown: {
    city: 'Cape Town', province: 'Western Cape', region: 'Western Cape',
    nearby: ['Stellenbosch', 'Bellville', 'Paarl', 'Somerset West', 'Wynberg'],
    nearbyPrinting: [{ label: 'Book Printing Cape Town', path: '/bookprintingcapetown' }],
    intro: "Cape Town is South Africa's cultural capital — a city of writers, artists, storytellers, and visionaries. From the Cape Winelands to the Mother City's famous literary festivals, Cape Town has one of the richest author communities in Africa. Creative Books SA proudly serves Cape Town authors with world-class self-publishing services.",
    uniqueNote: "Cape Town authors produce everything from acclaimed literary fiction to wine books, travel guides, and social history. Our production quality meets the discerning tastes of the Cape Town creative market.",
    printingPath: '/bookprintingcapetown',
  },
  stellenbosch: {
    city: 'Stellenbosch', province: 'Western Cape', region: 'Western Cape',
    nearby: ['Cape Town', 'Paarl', 'Somerset West', 'Franschhoek', 'Bellville'],
    nearbyPrinting: [{ label: 'Book Printing Cape Town', path: '/bookprintingcapetown' }],
    intro: "Stellenbosch is South Africa's premier academic town — home to one of Africa's top universities, a thriving wine culture, and a community of researchers, academics, and cultural storytellers. Creative Books SA helps Stellenbosch authors — from PhD graduates turning dissertations into books to winemakers writing estate histories — publish with academic rigour and premium quality.",
    uniqueNote: "Stellenbosch has a uniquely high concentration of academic writers, wine industry professionals, and bilingual Afrikaans-English authors. We have extensive experience with academic non-fiction, wine books, and Afrikaans-language publications.",
    printingPath: '/bookprintingcapetown',
  },
  paarl: {
    city: 'Paarl', province: 'Western Cape', region: 'Western Cape',
    nearby: ['Cape Town', 'Stellenbosch', 'Franschhoek', 'Wellington', 'Worcester'],
    nearbyPrinting: [{ label: 'Book Printing Cape Town', path: '/bookprintingcapetown' }],
    intro: "Paarl sits in the heart of the Cape Winelands — a valley steeped in history, culture, and Afrikaans heritage. Authors from Paarl, Wellington, and the Drakenstein Valley trust Creative Books SA to publish their family histories, community narratives, cultural works, and personal stories with the care this region's heritage deserves.",
    uniqueNote: "Paarl is a significant centre of Afrikaans cultural heritage. We publish Afrikaans-language books with the same quality and care as English titles, and we have experience with all genres in both languages.",
    printingPath: '/bookprintingcapetown',
  },
  george: {
    city: 'George', province: 'Western Cape', region: 'Garden Route',
    nearby: ['Knysna', 'Mossel Bay', 'Oudtshoorn', 'Wilderness', 'Plettenberg Bay'],
    nearbyPrinting: [{ label: 'Book Printing Cape Town', path: '/bookprintingcapetown' }],
    intro: "George is the commercial heart of the Garden Route and a gateway to one of South Africa's most beautiful and culturally rich regions. From Knysna to Plettenberg Bay, the Garden Route has inspired countless writers. Creative Books SA provides George and Garden Route authors with full self-publishing services — remotely and efficiently.",
    uniqueNote: "Garden Route authors produce beautiful nature writing, travel memoirs, retirement narratives, and wildlife books. We bring these stories to life in print and digital formats distributed locally and internationally.",
    printingPath: '/bookprintingcapetown',
  },
  somersetwest: {
    city: 'Somerset West', province: 'Western Cape', region: 'Western Cape',
    nearby: ['Cape Town', 'Stellenbosch', 'Strand', 'Gordon\'s Bay', 'Paarl'],
    nearbyPrinting: [{ label: 'Book Printing Cape Town', path: '/bookprintingcapetown' }],
    intro: "Somerset West is a prestigious residential community nestled between the Helderberg Mountains and False Bay. Home to retired professionals, creatives, and a growing community of first-time authors, Somerset West is a hotspot for memoir writing, family histories, and inspirational personal narratives. Creative Books SA serves Somerset West authors with expert, personalised publishing support.",
    uniqueNote: "Somerset West's large retired professional community produces memoirs, family chronicles, and reflective non-fiction. We love working with life-story authors and bringing multi-decade narratives to beautiful, lasting books.",
    printingPath: '/bookprintingcapetown',
  },
  bellville: {
    city: 'Bellville', province: 'Western Cape', region: 'Western Cape',
    nearby: ['Cape Town', 'Parow', 'Durbanville', 'Goodwood', 'Stellenbosch'],
    nearbyPrinting: [{ label: 'Book Printing Cape Town', path: '/bookprintingcapetown' }],
    intro: "Bellville is the Northern Suburbs hub of Cape Town — a vibrant, diverse commercial and residential area with a rich Afrikaans cultural tradition. Creative Books SA serves Bellville and Cape Northern Suburbs authors with bilingual publishing capability, competitive pricing, and premium book production.",
    uniqueNote: "Bellville has a strong Afrikaans literary tradition and a growing English-language publishing community. We publish in both languages with equal quality and expertise.",
    printingPath: '/bookprintingcapetown',
  },

  // KWAZULU-NATAL
  durban: {
    city: 'Durban', province: 'KwaZulu-Natal', region: 'KwaZulu-Natal',
    nearby: ['Umhlanga', 'Pinetown', 'Westville', 'Ballito', 'Pietermaritzburg'],
    nearbyPrinting: [{ label: 'Book Printing Durban', path: '/bookprintingdurban' }],
    intro: "Durban is South Africa's third-largest city and a multicultural creative powerhouse — from its beachfront literary scene to the Indian Ocean's inspiring coastline. Durban authors write across every genre imaginable. Creative Books SA brings professional self-publishing to Durban's authors, with nationwide delivery and a service standard that matches international publishers.",
    uniqueNote: "Durban's unique cultural blend of Zulu, Indian, English, and Afrikaans heritage produces remarkable literature. We have published memoirs, cultural histories, religious texts, and fiction for Durban's diverse author community.",
    printingPath: '/bookprintingdurban',
  },
  umhlanga: {
    city: 'Umhlanga', province: 'KwaZulu-Natal', region: 'KwaZulu-Natal',
    nearby: ['Durban', 'Ballito', 'Westville', 'La Lucia', 'uMdloti'],
    nearbyPrinting: [{ label: 'Book Printing Durban', path: '/bookprintingdurban' }],
    intro: "Umhlanga is KwaZulu-Natal's premier business and lifestyle destination — home to executives, entrepreneurs, and creative professionals with stories worth telling. Creative Books SA serves Umhlanga authors with premium publishing services suited to the standard of this iconic coastal suburb.",
    uniqueNote: "Umhlanga's professional community often produces business books, personal development titles, and premium memoirs. We produce hardcover and softcover books at a standard that matches the prestige of Umhlanga's own brand.",
    printingPath: '/bookprintingdurban',
  },
  pietermaritzburg: {
    city: 'Pietermaritzburg', province: 'KwaZulu-Natal', region: 'KwaZulu-Natal',
    nearby: ['Durban', 'Howick', 'Richmond', 'Greytown', 'Ladysmith'],
    nearbyPrinting: [{ label: 'Book Printing Pietermaritzburg', path: '/bookprintingpietermaritzburg' }],
    intro: "Pietermaritzburg — the historic capital of KwaZulu-Natal — is a city of deep historical significance, academic heritage, and cultural richness. Home to the University of KwaZulu-Natal and a proud literary tradition, PMB authors can rely on Creative Books SA for publishing services that match their city's intellectual legacy.",
    uniqueNote: "Pietermaritzburg has significant academic, historical, and Christian publishing activity. We are experienced with academic non-fiction, community histories, and faith-based publications for the PMB market.",
    printingPath: '/bookprintingpietermaritzburg',
  },
  newcastle: {
    city: 'Newcastle', province: 'KwaZulu-Natal', region: 'KwaZulu-Natal',
    nearby: ['Ladysmith', 'Vryheid', 'Dundee', 'Amajuba District'],
    nearbyPrinting: [{ label: 'Book Printing Durban', path: '/bookprintingdurban' }],
    intro: "Newcastle in northern KwaZulu-Natal is an industrial and commercial hub with a proud community of educators, church leaders, and storytellers. Creative Books SA serves Newcastle authors with the same professional publishing quality available in South Africa's major cities — delivered to your door.",
    uniqueNote: "Newcastle authors often write community histories, church publications, educational materials, and personal memoirs. We are experienced in all these genres and serve authors in smaller cities with the same care as major urban clients.",
    printingPath: '/bookprintingdurban',
  },
  richardsbay: {
    city: 'Richards Bay', province: 'KwaZulu-Natal', region: 'KwaZulu-Natal',
    nearby: ['Empangeni', 'Eshowe', 'Ulundi', 'Zululand coast'],
    nearbyPrinting: [{ label: 'Book Printing Durban', path: '/bookprintingdurban' }],
    intro: "Richards Bay is KwaZulu-Natal's industrial port city — and a gateway to the rich cultural landscape of Zululand. Authors from Richards Bay, Empangeni, and the Zululand coast trust Creative Books SA to publish books that document their region's unique heritage, business stories, and personal journeys.",
    uniqueNote: "The greater Zululand region has compelling cultural, historical, and environmental stories waiting to be published. We work with authors on cultural heritage, nature writing, community history, and all other genres from this rich region.",
    printingPath: '/bookprintingdurban',
  },

  // EASTERN CAPE
  portelizabeth: {
    city: 'Gqeberha (Port Elizabeth)', province: 'Eastern Cape', region: 'Eastern Cape',
    nearby: ['Uitenhage', 'George', 'East London', 'Grahamstown', 'Jeffrey\'s Bay'],
    nearbyPrinting: [{ label: 'Book Printing Port Elizabeth', path: '/bookprintingportelizabeth' }],
    intro: "Gqeberha (Port Elizabeth) is the Eastern Cape's largest city and a diverse, proud community of authors, educators, and cultural leaders. From Nelson Mandela Bay's activist heritage to its world-class automotive industry professionals, Creative Books SA serves Gqeberha authors with complete, professional self-publishing services.",
    uniqueNote: "Port Elizabeth has a strong tradition of political memoir, activism history, and community storytelling. We have published powerful personal narratives and community histories from this region.",
    printingPath: '/bookprintingportelizabeth',
  },
  eastlondon: {
    city: 'East London', province: 'Eastern Cape', region: 'Eastern Cape',
    nearby: ['Gqeberha', 'King William\'s Town', 'Queenstown', 'Bisho', 'Jeffrey\'s Bay'],
    nearbyPrinting: [{ label: 'Book Printing East London', path: '/bookprintingeastlondon' }],
    intro: "East London sits on the beautiful Buffalo City coastline and is the Eastern Cape's second-largest city. With a strong educational infrastructure and a vibrant creative community, East London authors choose Creative Books SA for their professional publishing needs — knowing their books will be produced to the highest standards.",
    uniqueNote: "East London authors write across many genres — from Eastern Cape history and political memoir to fiction, Christian publishing, and educational materials. We serve all of these with equal expertise.",
    printingPath: '/bookprintingeastlondon',
  },
  grahamstown: {
    city: 'Makhanda (Grahamstown)', province: 'Eastern Cape', region: 'Eastern Cape',
    nearby: ['Gqeberha', 'East London', 'Cradock', 'King William\'s Town'],
    nearbyPrinting: [{ label: 'Book Printing Port Elizabeth', path: '/bookprintingportelizabeth' }],
    intro: "Makhanda (Grahamstown) is one of South Africa's great academic and arts towns — home to Rhodes University and the world-famous National Arts Festival. This small city has an outsized literary reputation, and its authors deserve publishing services equal to that reputation. Creative Books SA is the professional publishing partner for Makhanda's writers.",
    uniqueNote: "Makhanda has a concentration of academic writers, literary fiction authors, and arts practitioners. We specialise in academic-quality book production and literary fiction design for this discerning market.",
    printingPath: '/bookprintingportelizabeth',
  },
  uitenhage: {
    city: 'Uitenhage', province: 'Eastern Cape', region: 'Eastern Cape',
    nearby: ['Gqeberha', 'East London', 'Kirkwood', 'Despatch'],
    nearbyPrinting: [{ label: 'Book Printing Port Elizabeth', path: '/bookprintingportelizabeth' }],
    intro: "Uitenhage is one of the Eastern Cape's oldest industrial towns, with a rich cultural and community heritage. Authors from Uitenhage and the greater Nelson Mandela Bay Metropolitan Area use Creative Books SA to transform their manuscripts into published books that document the stories of this unique region.",
    uniqueNote: "Uitenhage authors frequently write community histories, personal memoirs, and educational materials. We publish all these genres with care and professionalism.",
    printingPath: '/bookprintingportelizabeth',
  },

  // FREE STATE
  bloemfontein: {
    city: 'Bloemfontein', province: 'Free State', region: 'Free State',
    nearby: ['Welkom', 'Botshabelo', 'Mangaung', 'Kroonstad', 'Sasolburg'],
    nearbyPrinting: [{ label: 'Book Printing Bloemfontein', path: '/bookprintingbloemfontein' }],
    intro: "Bloemfontein — South Africa's judicial capital and the City of Roses — has a proud academic and literary heritage. Home to the University of the Free State and a deeply Afrikaans cultural tradition, Bloemfontein authors can rely on Creative Books SA for self-publishing services that honour this city's intellectual reputation.",
    uniqueNote: "Bloemfontein has a strong Afrikaans literary culture and a significant academic publishing community. We publish Afrikaans and English titles with equal quality and bring the same professional standards as Johannesburg or Cape Town to every Bloemfontein project.",
    printingPath: '/bookprintingbloemfontein',
  },
  welkom: {
    city: 'Welkom', province: 'Free State', region: 'Free State',
    nearby: ['Bloemfontein', 'Virginia', 'Odendaalsrus', 'Kroonstad'],
    nearbyPrinting: [{ label: 'Book Printing Bloemfontein', path: '/bookprintingbloemfontein' }],
    intro: "Welkom is the Free State's mining heartland — a city with a gritty, proud history and a community that has weathered great change. Authors from Welkom, Virginia, and the Goldfields region trust Creative Books SA to publish books that preserve their unique stories, histories, and perspectives for future generations.",
    uniqueNote: "Welkom and the Goldfields area have rich industrial and community histories worth preserving in print. We work with first-time authors from smaller cities and give them the same level of professional attention as any major-city client.",
    printingPath: '/bookprintingbloemfontein',
  },

  // LIMPOPO
  polokwane: {
    city: 'Polokwane', province: 'Limpopo', region: 'Limpopo',
    nearby: ['Tzaneen', 'Mokopane', 'Bela-Bela', 'Louis Trichardt', 'Giyani'],
    nearbyPrinting: [{ label: 'Book Printing Polokwane', path: '/bookprintingpolokwane' }],
    intro: "Polokwane is the capital of Limpopo province and the gateway to South Africa's great north. It is a city of government, education, and cultural diversity — and home to authors writing in multiple languages including Northern Sotho, Venda, Tsonga, and English. Creative Books SA serves Polokwane authors with full self-publishing capability and nationwide delivery.",
    uniqueNote: "Polokwane authors often write in indigenous South African languages or bilingual formats. We are experienced with multilingual publishing and can accommodate Sepedi, Tshivenda, Xitsonga, and other South African language titles.",
    printingPath: '/bookprintingpolokwane',
  },
  tzaneen: {
    city: 'Tzaneen', province: 'Limpopo', region: 'Limpopo',
    nearby: ['Polokwane', 'Phalaborwa', 'Giyani', 'Haenertsburg', 'Letaba'],
    nearbyPrinting: [{ label: 'Book Printing Polokwane', path: '/bookprintingpolokwane' }],
    intro: "Tzaneen is nestled in the lush Tzaneen Valley of Limpopo — a town surrounded by tropical fruit farms, tea plantations, and one of South Africa's most beautiful landscapes. Authors from Tzaneen and the greater Mopani District choose Creative Books SA to publish books that reflect the richness of this extraordinary region.",
    uniqueNote: "Tzaneen and the Limpopo Lowveld region inspire nature writing, farming histories, missionary accounts, and cultural documentation. We help authors from this underrepresented region reach readers nationwide and internationally.",
    printingPath: '/bookprintingpolokwane',
  },
  thohoyandou: {
    city: 'Thohoyandou', province: 'Limpopo', region: 'Limpopo',
    nearby: ['Polokwane', 'Louis Trichardt', 'Messina', 'Musina', 'Vhembe District'],
    nearbyPrinting: [{ label: 'Book Printing Polokwane', path: '/bookprintingpolokwane' }],
    intro: "Thohoyandou is the cultural capital of the Venda people — a region with one of South Africa's richest indigenous artistic and literary traditions. Authors from the Vhembe District and Tshivenda-speaking communities trust Creative Books SA to produce books that preserve and celebrate their unique cultural heritage.",
    uniqueNote: "We have experience publishing books in Tshivenda and about Venda cultural heritage. We approach indigenous language and cultural publishing with the respect and expertise these titles deserve.",
    printingPath: '/bookprintingpolokwane',
  },

  // MPUMALANGA
  nelspruit: {
    city: 'Nelspruit (Mbombela)', province: 'Mpumalanga', region: 'Mpumalanga',
    nearby: ['White River', 'Hazyview', 'Barberton', 'Sabie', 'Kruger Park area'],
    nearbyPrinting: [{ label: 'Book Printing Nelspruit', path: '/bookprintingnelspruit' }],
    intro: "Nelspruit (Mbombela) is the gateway to the Kruger Park and one of South Africa's fastest-growing cities. Located at the crossroads of Mpumalanga's tourism economy, nature reserves, and cultural communities, Nelspruit authors have stories that captivate audiences far beyond provincial borders. Creative Books SA helps these authors publish professionally.",
    uniqueNote: "Nelspruit and the Lowveld region inspire nature writing, safari memoirs, farming histories, and cultural documentation. We help Mpumalanga authors share stories about this uniquely beautiful region with the world.",
    printingPath: '/bookprintingnelspruit',
  },
  witbank: {
    city: 'eMalahleni (Witbank)', province: 'Mpumalanga', region: 'Mpumalanga',
    nearby: ['Middelburg', 'Nelspruit', 'Secunda', 'Delmas', 'Belfast'],
    nearbyPrinting: [{ label: 'Book Printing Johannesburg', path: '/bookprintingjohannesburg' }],
    intro: "eMalahleni (Witbank) is Mpumalanga's coal mining and industrial heartland — a city with a working-class heritage and a community of authors whose stories deserve to be heard. Creative Books SA helps eMalahleni authors publish books about their industry, their families, and their communities.",
    uniqueNote: "Mining communities have remarkable stories — of underground heroism, family sacrifice, labour history, and community resilience. We have experience publishing mining memoirs, industry histories, and community narratives.",
    printingPath: '/bookprintingjohannesburg',
  },
  middelburg: {
    city: 'Middelburg', province: 'Mpumalanga', region: 'Mpumalanga',
    nearby: ['eMalahleni', 'Nelspruit', 'Belfast', 'Hendrina', 'Carolina'],
    nearbyPrinting: [{ label: 'Book Printing Johannesburg', path: '/bookprintingjohannesburg' }],
    intro: "Middelburg in Mpumalanga is an agricultural and industrial town at the heart of the Highveld. Known for its steel industry and farming heritage, Middelburg authors often write about history, community identity, and professional expertise. Creative Books SA gives Middelburg authors access to world-class publishing services.",
    uniqueNote: "Middelburg's authors write agricultural guides, community histories, and professional reference books. We publish practical non-fiction with the same quality as major-city literary titles.",
    printingPath: '/bookprintingjohannesburg',
  },

  // NORTH WEST
  rustenburg: {
    city: 'Rustenburg', province: 'North West', region: 'North West',
    nearby: ['Brits', 'Hartbeespoort', 'Mahikeng', 'Swartruggens', 'Sun City area'],
    nearbyPrinting: [{ label: 'Book Printing Rustenburg', path: '/bookprintingrustenburg' }],
    intro: "Rustenburg is the North West's economic powerhouse — driven by platinum mining, tourism, and a vibrant commercial sector. Authors from Rustenburg and the surrounding Bojanala District trust Creative Books SA to publish books that reflect their community's unique heritage, business insight, and personal stories.",
    uniqueNote: "Rustenburg has a diverse author community spanning mining histories, Tswana cultural heritage, business guides, and Christian publications. We serve all these genres with equal quality.",
    printingPath: '/bookprintingrustenburg',
  },
  klerksdorp: {
    city: 'Klerksdorp', province: 'North West', region: 'North West',
    nearby: ['Potchefstroom', 'Orkney', 'Stilfontein', 'Wolmaransstad', 'Lichtenburg'],
    nearbyPrinting: [{ label: 'Book Printing Johannesburg', path: '/bookprintingjohannesburg' }],
    intro: "Klerksdorp in the Dr Kenneth Kaunda District is North West's second-largest city — a gold mining town with deep Afrikaans and Setswana cultural roots. Creative Books SA helps Klerksdorp authors publish books that preserve and celebrate this region's history, faith traditions, and community stories.",
    uniqueNote: "Klerksdorp and the surrounding goldfields area have rich Afrikaans and Setswana cultural publishing traditions. We publish bilingual and multi-language titles and serve smaller city authors with the same personal attention as major urban clients.",
    printingPath: '/bookprintingjohannesburg',
  },
  potchefstroom: {
    city: 'Potchefstroom', province: 'North West', region: 'North West',
    nearby: ['Klerksdorp', 'Vereeniging', 'Carletonville', 'Rustenburg'],
    nearbyPrinting: [{ label: 'Book Printing Johannesburg', path: '/bookprintingjohannesburg' }],
    intro: "Potchefstroom is one of South Africa's oldest towns and home to North-West University — one of the country's leading academic institutions. The university town atmosphere produces academics, researchers, and thoughtful writers who expect publishing quality to match their intellectual work. Creative Books SA delivers exactly that.",
    uniqueNote: "Potchefstroom has a strong academic publishing tradition rooted in NWU and the broader Reformed Afrikaans community. We are experienced with academic non-fiction, theological publications, and Afrikaans-language titles.",
    printingPath: '/bookprintingjohannesburg',
  },

  // NORTHERN CAPE
  kimberley: {
    city: 'Kimberley', province: 'Northern Cape', region: 'Northern Cape',
    nearby: ['Upington', 'De Aar', 'Bloemfontein', 'Douglas'],
    nearbyPrinting: [{ label: 'Book Printing Kimberley', path: '/bookprintingkimberley' }],
    intro: "Kimberley — birthplace of the diamond rush and capital of the Northern Cape — has one of South Africa's most dramatic histories. Authors from the Diamond City and surrounding Northern Cape towns bring Creative Books SA stories of extraordinary richness — from mining heritage and colonial history to the Khoisan cultural legacy and Karoo wilderness.",
    uniqueNote: "Kimberley and the Northern Cape have exceptional historical, cultural, and environmental stories. We are proud to help authors from this region publish books that preserve these narratives for generations to come.",
    printingPath: '/bookprintingkimberley',
  },
  upington: {
    city: 'Upington', province: 'Northern Cape', region: 'Northern Cape',
    nearby: ['Kimberley', 'Augrabies', 'Springbok', 'Kakamas', 'Keimoes'],
    nearbyPrinting: [{ label: 'Book Printing Kimberley', path: '/bookprintingkimberley' }],
    intro: "Upington on the Orange River is the Northern Cape's largest town — gateway to the Kalahari, the Augrabies Falls, and the vast semi-arid splendour of South Africa's Big Empty. Authors from Upington and the Green Kalahari region trust Creative Books SA to bring their unique stories — of desert living, farming heritage, and Khoisan culture — to a published audience.",
    uniqueNote: "The Northern Cape's remote communities have remarkable stories of resilience, nature, and heritage. We are experienced in working with authors from remote areas fully online — no need to travel for consultations.",
    printingPath: '/bookprintingkimberley',
  },
};

// ─── Nearby city links generator ─────────────────────────────────────────────
function getNearbyLinks(cityKey, data) {
  return Object.entries(data)
    .filter(([key]) => key !== cityKey && data[cityKey]?.nearby?.some(n => n.toLowerCase().includes(data[key]?.city?.split(' ')[0]?.toLowerCase())))
    .slice(0, 5)
    .map(([key, d]) => ({ label: `Self Publishing ${d.city}`, path: `/selfpublishing${key}` }));
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SelfPublishingCityPage({ cityKey }) {
  const d = selfPubCityData[cityKey];
  if (!d) return <div className="min-h-screen flex items-center justify-center text-white">Page not found</div>;

  const faqs = [
    {
      question: `Can I self-publish a book in ${d.city}?`,
      answer: `Absolutely. Creative Books SA helps ${d.city} authors self-publish professionally — with editing, cover design, typesetting, printing, ISBN registration, and Amazon KDP setup. You receive all the services of a traditional publisher while retaining 100% of your rights and royalties.`
    },
    {
      question: `How much does self-publishing cost for ${d.city} authors?`,
      answer: `Self-publishing packages start from R4,999 for our Mini Package (editing, cover design, typesetting, and ISBN). Full publishing packages with editing, premium design, hardcover printing, and Amazon KDP setup range from R15,000–R45,000. Contact us for a personalised ${d.city} quote.`
    },
    {
      question: `Do I keep my rights when self-publishing in ${d.city}?`,
      answer: `Yes. You retain 100% of your rights, intellectual property, and royalties. Creative Books SA is a publishing services provider — not a traditional publisher. You own your book completely.`
    },
    {
      question: `How long does self-publishing take for a ${d.city} author?`,
      answer: `Editing takes 2–6 weeks. Cover design and typesetting takes 1–3 weeks. Printing takes 7–14 business days. A full self-publishing project for a ${d.city} author typically takes 8–16 weeks from manuscript submission to finished books delivered to your door.`
    },
    {
      question: `Do you work with ${d.city} authors remotely?`,
      answer: `Yes. We work with authors across South Africa — including ${d.city} — fully online. Consultations by phone or video call, files uploaded via email or our submission portal, and finished books couriered directly to your ${d.city} address.`
    },
  ];

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      serviceSchema({
        name: `Self Publishing ${d.city}`,
        description: `Professional self-publishing services for authors in ${d.city}, ${d.province}.`,
        url: `/selfpublishing${cityKey}`,
        areaServed: `${d.city}, ${d.province}, South Africa`
      }),
      faqSchema(faqs),
      breadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Self Publishing', path: '/selfpublishingsouthafrica' },
        { name: `Self Publishing ${d.city}`, path: `/selfpublishing${cityKey}` }
      ]),
    ],
  };

  const nearbyLinks = getNearbyLinks(cityKey, selfPubCityData);

  const relatedLinks = [
    { label: 'Self Publishing South Africa', path: '/selfpublishingsouthafrica' },
    { label: 'Publishing Packages', path: '/publishingpackages' },
    { label: 'Book Editing', path: '/bookediting' },
    { label: 'Book Cover Design', path: '/bookcoverdesign' },
    { label: 'ISBN Registration', path: '/isbnregistration' },
    { label: 'Book Printing SA', path: '/bookprinting' },
    { label: 'Amazon KDP', path: '/amazonkdp' },
    { label: 'How to Self Publish', path: '/howtoselfpublishabook' },
    ...d.nearbyPrinting,
    ...nearbyLinks,
    { label: 'Get a Free Quote', path: '/getquote' },
  ];

  const packages = [
    { name: 'Mini Package', price: 'From R4,999', includes: ['Professional proofreading', 'Basic cover design', 'Interior typesetting', 'ISBN registration', 'Print-ready PDF files'] },
    { name: 'Standard Package', price: 'From R14,999', includes: ['Full copy editing', 'Premium cover design', 'Interior layout & typesetting', 'ISBN & barcode', '100 printed softcover copies', 'Amazon KDP setup'] },
    { name: 'Premium Package', price: 'From R34,999', includes: ['Developmental editing', 'Award-quality cover design', 'Premium interior design', 'ISBN, barcode & legal deposit', '250 hardcover + 250 softcover copies', 'Amazon KDP + eBook formatting', 'Launch marketing support'] },
  ];

  return (
    <div>
      <PageMeta
        title={`Self Publishing ${d.city} | Publish Your Book in ${d.city} | Creative Books SA`}
        description={`Professional self-publishing services for ${d.city} authors. Editing, cover design, printing, ISBN & Amazon KDP. Keep 100% of your rights. Get a free quote today.`}
        keywords={`self publishing ${d.city.toLowerCase()}, self publish book ${d.city.toLowerCase()}, book publishing ${d.city.toLowerCase()}, publish a book in ${d.city.toLowerCase()}, book publishers ${d.city.toLowerCase()}, self publishing south africa`}
        canonical={`https://www.creativebookssa.co.za/selfpublishing${cityKey}`}
        schema={schema}
      />

      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-center pt-20 overflow-hidden bg-[#060504]">
        <div className="absolute inset-0" style={{ backgroundImage: `radial-gradient(circle at 30% 50%, rgba(184,115,51,0.2) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(184,115,51,0.1) 0%, transparent 50%)` }} />
        {[...Array(5)].map((_, i) => (
          <motion.div key={i} className="absolute w-1 h-1 rounded-full bg-copper/30"
            style={{ left: `${10 + i * 18}%`, top: `${20 + (i % 3) * 20}%` }}
            animate={{ y: [0, -15, 0], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.7 }}
          />
        ))}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
                style={{ background: 'rgba(184,115,51,0.1)', border: '1px solid rgba(184,115,51,0.2)' }}>
                <BookOpen className="w-4 h-4 text-copper" />
                <span className="text-copper text-sm font-medium">{d.region} Self Publishing</span>
              </div>
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Self Publishing<br />
                <span className="text-gradient-copper">in {d.city}</span>
              </h1>
              <p className="text-white/60 text-lg font-body leading-relaxed mb-8">
                {d.intro}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <Link to="/getquote"
                    className="inline-flex items-center gap-2 px-8 py-4 text-white font-medium rounded-full transition-all"
                    style={{ background: 'linear-gradient(135deg, #B87333 0%, #9a6030 100%)', boxShadow: '0 16px 40px rgba(184,115,51,0.35)' }}>
                    Get a Free Quote <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
                <Link to="/publishingpackages"
                  className="inline-flex items-center gap-2 px-8 py-4 text-white rounded-full transition-all"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)' }}>
                  View Packages
                </Link>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden lg:grid grid-cols-2 gap-4">
              {[
                { icon: CheckCircle, label: '100% Rights Retained' },
                { icon: Star, label: 'Premium Quality Production' },
                { icon: Users, label: '500+ Published Authors' },
                { icon: Award, label: '15+ Years Experience' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="p-5 rounded-2xl flex items-center gap-3"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(184,115,51,0.1)' }}>
                  <Icon className="w-5 h-5 text-copper shrink-0" />
                  <span className="text-white/80 text-sm font-body">{label}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Creative Books SA */}
      <section className="py-16 lg:py-24 bg-vellum">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0F0F0F] mb-4">
              Why {d.city} Authors Choose Creative Books SA
            </h2>
            <p className="text-[#0F0F0F]/60 max-w-2xl mx-auto font-body">{d.uniqueNote}</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: CheckCircle, title: 'You Keep 100% of Your Rights', desc: 'Unlike traditional publishers, we never take a share of your rights or royalties. Your book is yours — completely.' },
              { icon: Star, title: 'Premium Production Quality', desc: 'Our books look and feel as professional as any traditionally published title. Cover design, typesetting, and printing that commands respect.' },
              { icon: Zap, title: 'Complete Service Under One Roof', desc: 'Editing, cover design, typesetting, ISBN, printing, and Amazon KDP — you never need more than one service provider.' },
              { icon: Users, title: 'Experienced with All Genres', desc: 'Fiction, memoir, business, poetry, children\'s books, academic, Christian, and more. We have published them all.' },
              { icon: Award, title: '15+ Years of Publishing Experience', desc: 'Over 500 South African authors published. We know what works and what sells in the South African market.' },
              { icon: BookOpen, title: 'Nationwide Service from Johannesburg', desc: `${d.city} authors access our full Johannesburg team via phone, email, and video call. Books delivered to your door.` },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="p-6 rounded-2xl bg-white shadow-sm" style={{ border: '1px solid rgba(184,115,51,0.1)' }}>
                <item.icon className="w-6 h-6 text-copper mb-3" />
                <h3 className="font-heading font-semibold text-[#0F0F0F] mb-2">{item.title}</h3>
                <p className="text-[#0F0F0F]/60 text-sm font-body leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Publishing Process */}
      <section className="py-16 lg:py-24 bg-[#060504] relative overflow-hidden">
        <motion.div animate={{ opacity: [0.05, 0.1, 0.05] }} transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-0 left-1/3 w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(184,115,51,0.2) 0%, transparent 60%)', filter: 'blur(60px)' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">
              How We Publish Your Book in {d.city}
            </h2>
            <p className="text-white/50 max-w-xl mx-auto font-body">Seven steps from manuscript to published author — fully managed by our team.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Free Consultation', desc: `Schedule a free call from ${d.city}. We discuss your book, your goals, and the best publishing approach for your project.` },
              { step: '02', title: 'Editing', desc: 'Professional proofreading or copy editing to ensure your manuscript is polished and publication-ready.' },
              { step: '03', title: 'Cover & Interior Design', desc: 'Award-quality cover design and professional interior typesetting that positions your book competitively.' },
              { step: '04', title: 'ISBN & Legal Deposit', desc: 'We register your South African ISBN and handle legal deposit with the National Library.' },
              { step: '05', title: 'Printing', desc: `Your book is printed in Johannesburg to international standards and delivered to ${d.city} in 7–14 business days.` },
              { step: '06', title: 'Amazon KDP Setup', desc: 'We upload and configure your book on Amazon KDP for international print-on-demand and eBook sales.' },
              { step: '07', title: 'Launch Support', desc: 'Guidance on launching your book at events, submitting to bookshops, and marketing to your audience.' },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(184,115,51,0.1)' }}>
                <div className="text-copper font-heading text-2xl font-bold mb-3">{item.step}</div>
                <h3 className="font-heading font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-white/50 text-sm font-body leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages */}
      <section className="py-16 lg:py-24 bg-vellum">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0F0F0F] mb-4">
              Self Publishing Packages for {d.city} Authors
            </h2>
            <p className="text-[#0F0F0F]/60 max-w-xl mx-auto font-body">Choose the package that fits your project and budget.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages.map((pkg, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={`p-8 rounded-2xl ${i === 1 ? 'ring-2 ring-copper scale-[1.02]' : ''}`}
                style={{ background: 'white', border: i === 1 ? 'none' : '1px solid rgba(184,115,51,0.12)', boxShadow: i === 1 ? '0 20px 50px rgba(184,115,51,0.15)' : 'none' }}>
                {i === 1 && <div className="text-copper text-xs font-semibold uppercase tracking-wider mb-3">Most Popular</div>}
                <h3 className="font-heading text-xl font-bold text-[#0F0F0F] mb-1">{pkg.name}</h3>
                <p className="text-copper font-semibold mb-5">{pkg.price}</p>
                <ul className="space-y-2 mb-6">
                  {pkg.includes.map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm font-body text-[#0F0F0F]/70">
                      <CheckCircle className="w-4 h-4 text-copper shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link to="/getquote"
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm transition-all ${i === 1 ? 'bg-copper text-white hover:bg-copper/90' : 'border border-copper text-copper hover:bg-copper hover:text-white'}`}>
                  Get a Quote <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <FAQSection faqs={faqs} light />
      <InternalLinks title={`Related Services & ${d.city} Publishing Resources`} links={relatedLinks} light />
      <CTASection
        title={`Ready to Publish Your Book in ${d.city}?`}
        description={`Join hundreds of South African authors who have self-published professionally with Creative Books SA. Get your free ${d.city} publishing consultation today.`}
      />
    </div>
  );
}