const mongoose = require("mongoose");
// mongoose.set('useFindAndModify', false);
const fileScheme = mongoose.Schema({
    name: {
        type: String,
        required: true
    }, 
    description: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
    },
    url: {
        type: String,
        required: true
    }
});

export default mongoose.models.File || mongoose.model('File', fileScheme)