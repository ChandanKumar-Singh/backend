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
    if (!contact) {
        return { contact: null, code: '+91' };
    }

    const splitData = contact.trim().split(' ');
    
    // Single value case - assume India (+91) as default
    if (splitData.length === 1) {
        return {
            contact: splitData[0].replace(/[()-/ /]/ig, ''),
            code: '+91'
        };
    }

    // Extract country code
    let countryCode = splitData.shift();
    if (!countryCode.startsWith('+')) {
        countryCode = '+' + countryCode.replace(/[^0-9]/g, '');
    }

    // Clean and format contact number
    const contactNumber = splitData.join(' ').replace(/[()-/ /]/ig, '');

    return {
        contact: contactNumber,
        code: countryCode
    };
}


