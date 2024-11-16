// Note: Footer Component
import React from 'react'; // eslint-disable-line
import './Footer.css';

type FooterProps = {
    logo: string
}
const Footer = (props: FooterProps) => {
    return (
        <footer className='bot-footer' style={{ display: 'flex', alignItems: 'center' }}>
            <p style={{ display: 'flex', alignItems: 'center' }}>
                powered by 
                <img id="bot-footer-logo" src={props.logo} style={{ marginLeft: '5px', marginRight: '5px', width: '25px', height: '25px' }} /> 
                <b><a href="http://www.dash2labs.com" style={{ color: 'inherit' }}>Dash2 Labs</a></b>
            </p>
        </footer>
    );
};

export default Footer;