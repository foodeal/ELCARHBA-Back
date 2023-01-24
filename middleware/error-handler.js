module.exports = errorHandler;

function errorHandler(err, req, res, next) {
    switch (true) {
        case typeof err === 'string':
            // custom application error
            const is404 = err.toLowerCase().endsWith('Pas trouver');
            const statusCode = is404 ? 404 : 400;
            return res.status(statusCode).json({ message: err });
        case err.name === 'Interdit':
            // jwt authentication error
            return res.status(401).json({ message: 'Interdit' });
        default:
            return res.status(500).json({ message: err.message });
    }
}