import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, ArrowRight } from 'lucide-react';
import PageMeta from '../../components/shared/PageMeta';

const locationsByRegion = {
  gauteng: [
    { city: 'Johannesburg', slug: 'bookprintingjohannesburg', desc: 'Main hub with same-day delivery' },
    { city: 'Sandton', slug: 'bookprintingsandton', desc: 'Premium business district' },
    { city: 'Midrand', slug: 'bookprintingmidrand', desc: 'Tech corridor, fast turnaround' },
    { city: 'Fourways', slug: 'bookprintingfourways', desc: 'Same-day delivery' },
    { city: 'Bryanston', slug: 'bookprintingbryanston', desc: 'North Johannesburg' },
    { city: 'Randburg', slug: 'bookprintingrandburg', desc: 'Serving West Rand' },
    { city: 'Pretoria', slug: 'bookprintingpretoria', desc: 'Tshwane region' },
    { city: 'Centurion', slug: 'bookprintingcenturion', desc: 'Southern suburbs' },
    { city: 'Roodepoort', slug: 'bookprintingroodepoort', desc: 'West Johannesburg' },
    { city: 'Boksburg', slug: 'bookprintingboksburg', desc: '1–2 day delivery' },
    { city: 'Benoni', slug: 'bookprintingbenoni', desc: 'East Rand' },
    { city: 'Germiston', slug: 'bookprintinggermiston', desc: 'Same-day delivery' },
    { city: 'Kempton Park', slug: 'bookprintingkemptonpark', desc: 'Fast turnaround' },
  ],
  western_cape: [
    { city: 'Cape Town', slug: 'bookprintingcapetown', desc: '3–5 day delivery' },
    { city: 'Stellenbosch', slug: 'bookprintingstellenbosch', desc: 'Wine country' },
    { city: 'Paarl', slug: 'bookprintingpaarl', desc: 'Western Cape' },
    { city: 'George', slug: 'bookprintinggeorge', desc: 'Garden Route' },
  ],
  kwazulu_natal: [
    { city: 'Durban', slug: 'bookprintingdurban', desc: '2–4 day delivery' },
    { city: 'Pietermaritzburg', slug: 'bookprintingpietermaritzburg', desc: 'Midlands' },
  ],
  eastern_cape: [
    { city: 'Port Elizabeth (Gqeberha)', slug: 'bookprintingportelizabeth', desc: '3–5 day delivery' },
    { city: 'East London', slug: 'bookprintingeastlondon', desc: 'Eastern Cape' },
  ],
  free_state: [
    { city: 'Bloemfontein', slug: 'bookprintingbloemfontein', desc: '2–3 day delivery' },
  ],
  northern_cape: [
    { city: 'Kimberley', slug: 'bookprintingkimberley', desc: '2–4 day delivery' },
  ],
  limpopo: [
    { city: 'Polokwane', slug: 'bookprintingpolokwane', desc: '2–3 day delivery' },
  ],
  mpumalanga: [
    { city: 'Nelspruit', slug: 'bookprintingnelspruit', desc: '2–3 day delivery' },
  ],
  north_west: [
    { city: 'Rustenburg', slug: 'bookprintingrustenburg', desc: '1–3 day delivery' },
  ],
};

const RegionSection = ({ region, cities }) => {
  const regionNames = {
    gauteng: 'Gauteng',
    western_cape: 'Western Cape',
    kwazulu_natal: 'KwaZulu-Natal',
    eastern_cape: 'Eastern Cape',
    free_state: 'Free State',
    northern_cape: 'Northern Cape',
    limpopo: 'Limpopo',
    mpumalanga: 'Mpumalanga',
    north_west: 'North West',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mb-12"
    >
      <h3 className="font-heading text-xl font-bold text-[#0F0F0F] mb-6">{regionNames[region]}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cities.map((loc, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Link
              to={`/${loc.slug}`}
              className="block p-4 rounded-lg bg-white border border-[#B87333]/15 hover:border-copper/40 hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h4 className="font-heading font-semibold text-[#0F0F0F] group-hover:text-copper transition-colors">
                    {loc.city}
                  </h4>
                  <p className="text-xs text-[#0F0F0F]/50 font-body mt-1">{loc.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-copper/40 group-hover:text-copper group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default function LocationsHub() {
  return (
    <>
      <PageMeta
        title="Book Publishing and Printing Locations in South Africa"
        description="Find your nearest book printing and publishing service. We serve all major South African cities with professional printing, editing, and publishing. Get a free quote."
        keywords="book printing locations, book printing near me, book printing South Africa, publishing services nationwide"
        canonical="https://www.creativebookssa.co.za/locations"
      />

      <div className="min-h-screen bg-vellum py-16 lg:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 bg-copper/10 border border-copper/20">
              <MapPin className="w-4 h-4 text-copper" />
              <span className="text-copper text-sm font-semibold">NATIONWIDE COVERAGE</span>
            </div>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-[#0F0F0F] mb-4">
              Book Publishing and Printing Locations in South Africa
            </h1>
            <p className="text-lg text-[#0F0F0F]/60 font-body max-w-2xl mx-auto">
              Professional book printing and self-publishing services in all major cities. Fast turnaround, premium quality, and competitive pricing nationwide.
            </p>
          </motion.div>

          <div className="bg-white rounded-2xl p-8 lg:p-12 border border-[#B87333]/10 shadow-sm">
            {Object.entries(locationsByRegion).map(([region, cities]) => (
              <RegionSection key={region} region={region} cities={cities} />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <p className="text-[#0F0F0F]/60 font-body mb-6">
              Don't see your city? We serve all of South Africa. Contact us for a custom quote.
            </p>
            <Link
              to="/getquote"
              className="inline-flex items-center gap-2 px-8 py-4 bg-copper text-white rounded-full font-semibold hover:shadow-lg transition-all"
            >
              Get a Free Quote
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </div>
    </>
  );
}