const fs = require('fs');
const path = require('path');

module.exports=(imageUrl) => {
    const imgPath = path.join(__dirname, '..', imageUrl);
    fs.unlink(imgPath, (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log("image delete ", imageUrl);
        }
    });
};
