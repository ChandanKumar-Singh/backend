import { Router } from 'express';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { AdminMiddleware } from '../../middlewares/authenticate.js';
import ApiError from '../../middlewares/ApiError.js';
import httpStatus from 'http-status';
import Constants from '../../config/constants.js';

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Setup Flutter web path
const appPath = Constants.paths.flutterApp;
const flutterWebPath = path.join(__dirname, appPath);

// General view render helper
const renderView = (viewName, options = {}) => (req, res) => {
    var data = {
        appName: Constants.app?.name || 'MyApp',
        appVersion: Constants.app?.version || '1.0.0',
        appDescription: Constants.app?.description || 'Backend API Server',
        appAuthor: Constants.app?.author || 'Unknown Author',
        apiVersion: Constants.routes?.api || '',
        port: Constants.paths?.port,
        showFlutterAppLink: true,
        ...options,
    };
    console.log(data)
    res.render(viewName, data);
};

// Redirect helper
const redirect = (path) => (req, res) => res.redirect(path);

// Routes
router.get('/', redirect('/home'));

router.get('/home', renderView('index', { title: 'Home' }));

router.get('/admin', renderView('preview/admin/dashboard', {
    title: 'Admin Panel',
    appName: 'MyApp',
    pageTitle: 'Welcome Admin',
    totalUsers: 1240,
    ordersToday: 58,
    revenue: 8540,
    recentActivities: [
        'User <strong>John Doe</strong> signed up.',
        'Order <strong>#1234</strong> placed.',
        'Product <strong>“iPhone 15”</strong> updated.'
    ]
}));
router.get('/admin/users', renderView('preview/admin/users', {
    title: 'Users Management',
    pageTitle: 'Manage Users',
    appName: 'MyApp',
    users: [
        { name: 'John Doe', email: 'john@example.com', role: 'Admin', createdAt: '2023-04-21', active: true },
        { name: 'Jane Smith', email: 'jane@example.com', role: 'User', createdAt: '2023-05-01', active: false },
        { name: 'Bob Johnson', email: 'bob@example.com', role: 'User', createdAt: '2023-05-15', active: true },
    ],
}));

router.get('/auth', AdminMiddleware, renderView('index', { title: 'Admin Auth Page' }));

// Flutter Web App serving
router.use('/app', (req, res, next) => {
    express.static(flutterWebPath)(req, res, next);
});

/// also works
// router.get('/app', (req, res) => {
//   res.sendFile(path.join(flutterWebPath, 'index.html'));
// });

export default router;
