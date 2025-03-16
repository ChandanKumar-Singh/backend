/**
 * Created by charnjeetelectrovese@gmail.com on 1/17/2020.
 */
export  function removeSpace(path) {
    if (path) {
        return path.replace(/ /g, '%20');
    } else {
        return path
    }
}

export function removeWildCards(filename) {
    if (filename) {
        return filename.replace(/[\ \/\\?%*:|"<>(),]/g, '_');
    } return filename;
}

export function generateYoutubeUrl(url){
    var ID = '';
    url = url.replace(/(>|<)/gi,'').split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
    if(url[2] !== undefined) {
        ID = url[2].split(/[^0-9a-z_\-]/i);
        ID = ID[0];
    }
    else {
        ID = url;
    }
    return 'https://youtube.com/watch?v='+ID;
}


export function getCountryContact(contact) {
    if (contact) {
        const splitData = contact.split(' ');
        if (splitData.length > 1) {
            let country = splitData.shift();
            if (country && !/(\+)/i.test(country)) {
                country = country;
            }
            const uContact = splitData.join(' ');
            const fContact = uContact.replace(/[()-/ /]/ig, '');
            return {contact: fContact, country_code: country};
        } else {
            return {contact: splitData[0], country_code: '+91'};
        }

    } return {contact: contact, country_code: '+91'};
}


