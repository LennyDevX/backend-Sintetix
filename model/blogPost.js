import mongoose from 'mongoose';

const blogPostSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    // Puedes agregar más campos aquí si lo necesitas, como autor, fecha, etc.
});

const BlogPost = mongoose.model('BlogPost', blogPostSchema);

export default BlogPost;