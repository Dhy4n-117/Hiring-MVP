const errorHandler = (err, req, res, next) => {
    console.error('❌ Error:', err.message);

    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({ message: 'Validation Error', errors: messages });
    }

    if (err.name === 'CastError') {
        return res.status(400).json({ message: 'Invalid ID format' });
    }

    if (err.code === 11000) {
        return res.status(400).json({ message: 'Duplicate entry found' });
    }

    if (err.name === 'MulterError') {
        return res.status(400).json({ message: `File upload error: ${err.message}` });
    }

    res.status(err.statusCode || 500).json({
        message: err.message || 'Internal Server Error'
    });
};

module.exports = errorHandler;
