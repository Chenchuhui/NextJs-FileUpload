const mongoose = require("mongoose");
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
    uploaded: {
        // Check if the file is stored or not
        type: Boolean,
        default: false
    },
    url: {
        type: String,
        required: true
    }
});

export default mongoose.models.File || mongoose.model('File', fileScheme)