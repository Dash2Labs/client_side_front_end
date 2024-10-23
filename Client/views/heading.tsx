import React from 'react';

interface HeaderProps {
    img: string;
}

const Header: React.FC<HeaderProps> = (props) => {
    return (
        <div className="header">
            <img src={props.img} alt="Logo" />
        </div>
    );
};

export default Header;