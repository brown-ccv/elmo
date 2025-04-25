import React, { ReactElement } from "react";
import CCVLogo from "@/assets/ccv-logo.svg";
import { FaArrowRight } from "react-icons/fa";
import { MdLocationPin, MdOutlinePhoneInTalk } from "react-icons/md";

// Footer link component
interface FooterLinkProps {
  href: string;
  label: string;
}

function FooterLink({ href, label }: FooterLinkProps): ReactElement {
  return (
    <a
      href={href}
      className="footer-link text-sm tracking-wider uppercase transition-all duration-300 text-[#FFD700] hover:text-white flex items-center !py-2 !px-3 !my-1 !mx-2"
      target="_blank"
      rel="noopener noreferrer"
      style={{ padding: '8px 10px', margin: '4px 6px' }}
    >
      <span>{label}</span>
      <span style={{ marginLeft: '12px', display: 'inline-flex' }}>
        <FaArrowRight className="transform transition-transform duration-300 group-hover:translate-x-1" />
      </span>
    </a>
  );
}

// Footer component based on Brown University's footer
function Footer() {
  return (
    <div style={{
      width: '100vw',
      position: 'relative',
      left: '50%',
      right: '50%',
      marginLeft: '-50vw',
      marginRight: '-50vw',
      background: '#5D4037'
    }}>
      <footer className="flex flex-col w-full text-white shadow-lg">
        <div className="w-full max-w-6xl mx-auto px-8 pt-32 pb-10">
          {/* University info */}
          <div className="text-center mb-10">
            <div className="uppercase text-xs tracking-widest mb-5 text-[#f0f0f0] pt-8" style={{ paddingTop: '48px', marginTop: '24px' }}>
              Brown University
            </div>

            <div className="flex flex-row justify-center items-center mb-8" style={{ gap: '100px' }}>
              <div className="flex items-center justify-center text-white" style={{ marginRight: '50px' }}>
                <MdLocationPin className="mr-2" style={{ color: '#d0d0d0' }} />
                <span style={{ fontFamily: 'Georgia, Times, serif', fontSize: '16px', color: 'white' }}>Providence, RI 02912</span>
              </div>
              <div className="flex items-center justify-center text-white" style={{ marginLeft: '50px' }}>
                <MdOutlinePhoneInTalk className="mr-2" style={{ color: '#d0d0d0' }} />
                <span style={{ fontFamily: 'Georgia, Times, serif', fontSize: '16px', color: 'white' }}>401-863-1000</span>
              </div>
            </div>
          </div>

          {/* Add spacing before nav sections */}
          <div style={{ height: '20px' }}></div>

          {/* First nav section */}
          <div className="footer-section pb-6 mb-0" style={{ paddingBottom: '24px', marginBottom: '0', paddingTop: '20px' }}>
            <div className="flex flex-wrap justify-center" style={{ gap: '13px' }}>
              <FooterLink href="https://www.brown.edu/about/visit" label="Visit Brown" />
              <FooterLink href="https://www.brown.edu/Facilities/Facilities_Management/maps/" label="Campus Map" />
              <FooterLink href="https://www.brown.edu/a-z" label="A to Z" />
              <FooterLink href="https://www.brown.edu/about/contact-us" label="Contact Us" />
            </div>
          </div>

          {/* Divider */}
          <div className="flex justify-center my-10" style={{ marginTop: '40px', marginBottom: '40px' }}>
            <div style={{ width: '1100px', height: '1px', backgroundColor: 'rgba(200, 200, 200, 0.3)' }}></div>
          </div>

          {/* Second nav section */}
          <div className="footer-section pb-10 mb-12" style={{ paddingBottom: '36px', marginBottom: '48px' }}>
            <div className="flex flex-wrap justify-center" style={{ gap: '13px' }}>
              <FooterLink href="https://www.brown.edu/news" label="News" />
              <FooterLink href="https://events.brown.edu/" label="Events" />
              <FooterLink href="https://dps.brown.edu/" label="Campus Safety" />
              <FooterLink href="https://www.brown.edu/website-accessibility" label="Accessibility" />
              <FooterLink href="https://www.brown.edu/careers" label="Careers at Brown" />
            </div>
          </div>

          {/* Give button */}
          <div className="flex justify-center mb-8" style={{ marginBottom: '40px', paddingBottom: '20px' }}>
            <a
              href="https://alumni-friends.brown.edu/giving"
              className="group flex justify-center items-center px-8 py-4 text-sm tracking-widest text-white uppercase border border-[#FFD700] rounded hover:bg-[#FFD700] hover:text-[#5D4037] transition-all duration-300 shadow-md hover:shadow-lg"
              style={{ padding: '14px 28px' }}
            >
              <span>Give to Brown</span>
              <span style={{ marginLeft: '12px', display: 'inline-flex' }}>
                <FaArrowRight className="text-[#FFD700] group-hover:text-[#5D4037] transform transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </a>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="flex flex-row items-center justify-between px-8 py-6 w-full bg-[#4E342E] font-serif text-base text-white md:px-24 md:text-lg border-t border-[#343a40]/30">
          <div className="hover:text-[#f8f9fa] transition-colors duration-300">&copy; {new Date().getFullYear()} Brown University</div>
          <img src={CCVLogo} alt="ccv logo" className="h-[36px] opacity-80 hover:opacity-100 transition-opacity duration-300" />
        </div>
      </footer>
    </div>
  );
}

export default Footer;

