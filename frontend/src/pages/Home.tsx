import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/index';

export const Home: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 bg-slate-900">
          <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px]"></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl animate-fade-in">
            <span className="inline-block py-1 px-4 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-sm font-semibold mb-6">
              Experience the Open Road
            </span>
            <h1 className="text-6xl md:text-7xl font-extrabold text-white leading-tight mb-6">
              Premium car rentals for <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">every journey.</span>
            </h1>
            <p className="text-xl text-slate-300 mb-10 leading-relaxed max-w-2xl">
              From luxury sedans to rugged SUVs, find the perfect vehicle for your next adventure with our seamless booking experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/vehicles">
                <Button size="lg" className="w-full sm:w-auto h-14 text-lg">
                  Browse Our Fleet
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Button>
              </Link>
              <Link to="/booking-history">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto h-14 text-lg border-slate-700 bg-slate-800/50 text-white hover:bg-slate-800">
                  Manage Bookings
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Floating Car Element (Placeholder for Visual impact) */}
        <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4 opacity-40">
           <div className="w-[1000px] h-[500px] bg-gradient-to-l from-indigo-500/20 to-transparent rounded-full transform -rotate-12 blur-3xl"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Why Choose CarRental?</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">We provide the best service and experience for our customers, ensuring a smooth ride every time.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="group">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform duration-300">🚗</div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Wide Selection</h3>
              <p className="text-slate-600 leading-relaxed">Choose from our diverse fleet of vehicles, from economical hatchbacks to premium luxury cars.</p>
            </div>
            <div className="group">
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform duration-300">💰</div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Best Rates</h3>
              <p className="text-slate-600 leading-relaxed">We offer competitive pricing with no hidden fees, providing the best value for your money.</p>
            </div>
            <div className="group">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform duration-300">⚡</div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Quick Booking</h3>
              <p className="text-slate-600 leading-relaxed">Our streamlined process allows you to book your perfect vehicle in under 2 minutes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="bg-indigo-600 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-indigo-200">
             {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
            
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to hit the road?</h2>
              <p className="text-indigo-100 text-xl mb-10 max-w-2xl mx-auto">Join thousands of happy travelers and experience the freedom of driving with CarRental.</p>
              <Link to="/vehicles">
                <Button size="lg" className="bg-white text-indigo-600 hover:bg-indigo-50 border-none h-14 text-lg px-10">
                  Get Started Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
