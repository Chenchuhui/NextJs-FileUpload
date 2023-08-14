import mongoose from 'mongoose'
const projectScehme = mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true
    }, 
    description: {
        type: String,
        required: true
    }, 
    files: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File'
    }]
});

export default mongoose.models.Project || mongoose.model('Project', projectScehme)