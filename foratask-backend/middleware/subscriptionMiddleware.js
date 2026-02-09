const Subscription = require('../models/subscription');
const Company = require('../models/company');

/**
 * Subscription Middleware
 * Checks subscription status and restricts access based on user role
 */
const subscriptionMiddleware = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const companyId = req.user.company;

        // Master admin bypasses all subscription checks
        if (userRole === 'master-admin') {
            return next();
        }

        // Get company subscription
        const subscription = await Subscription.findOne({ company: companyId });

        if (!subscription) {
            // New company without subscription - allow during registration
            return next();
        }

        // Check manual restriction
        if (subscription.isManuallyRestricted) {
            return res.status(403).json({
                restricted: true,
                message: 'Your company account has been restricted. Please contact support.',
                reason: subscription.restrictionReason,
                contactEmail: process.env.SMTP_USER || 'support@foratask.com'
            });
        }

        // Check subscription status
        const isExpired = subscription.status === 'expired' || subscription.status === 'cancelled';
        const isTrial = subscription.status === 'trial';
        const isActive = subscription.status === 'active';

        // Check if trial has ended
        if (isTrial && subscription.trialEndDate) {
            const now = new Date();
            if (now > subscription.trialEndDate) {
                subscription.status = 'expired';
                await subscription.save();
                return handleExpiredAccess(req, res, userRole);
            }
        }

        // Check if paid subscription has ended
        if (isActive && subscription.currentPeriodEnd) {
            const now = new Date();
            if (now > subscription.currentPeriodEnd) {
                subscription.status = 'expired';
                await subscription.save();
                return handleExpiredAccess(req, res, userRole);
            }
        }

        // Handle expired subscription
        if (isExpired) {
            return handleExpiredAccess(req, res, userRole);
        }

        // Attach subscription info to request for use in controllers
        req.subscription = {
            id: subscription._id,
            status: subscription.status,
            planType: subscription.planType,
            daysUntilExpiry: subscription.getDaysUntilExpiry(),
            isTrialing: isTrial,
            currentUserCount: subscription.currentUserCount
        };

        next();
    } catch (error) {
        console.error('Subscription middleware error:', error);
        res.status(500).json({ message: 'Error checking subscription status' });
    }
};

/**
 * Handle expired subscription access
 */
const handleExpiredAccess = (req, res, userRole) => {
    const isReadOnlyRequest = ['GET'].includes(req.method);
    
    if (userRole === 'admin') {
        // Admin gets read-only access
        if (isReadOnlyRequest) {
            req.subscriptionExpired = true;
            req.readOnly = true;
            return res.status(403).json({
                restricted: true,
                readOnly: true,
                message: 'Your subscription has expired. Please renew to continue using ForaTask.',
                action: 'renew',
                actionUrl: '/settings/subscription'
            });
        } else {
            return res.status(403).json({
                restricted: true,
                message: 'Your subscription has expired. Please renew to perform this action.',
                action: 'renew',
                actionUrl: '/settings/subscription'
            });
        }
    } else {
        // Supervisors/Employees are completely blocked
        return res.status(403).json({
            restricted: true,
            blocked: true,
            message: 'Your company\'s subscription has expired. Please contact your administrator.',
            contactAdmin: true
        });
    }
};

/**
 * Check if user can write (not read-only)
 */
const writeAccessMiddleware = async (req, res, next) => {
    if (req.readOnly) {
        return res.status(403).json({
            message: 'Write access denied. Your subscription has expired.',
            action: 'renew'
        });
    }
    next();
};

/**
 * Middleware to get subscription warnings for UI
 */
const subscriptionWarningMiddleware = async (req, res, next) => {
    try {
        const companyId = req.user.company;
        const userRole = req.user.role;

        if (userRole === 'master-admin') {
            return next();
        }

        const subscription = await Subscription.findOne({ company: companyId });

        if (subscription && userRole === 'admin') {
            const daysLeft = subscription.getDaysUntilExpiry();
            
            req.subscriptionWarning = null;
            
            if (daysLeft <= 7 && daysLeft > 3) {
                req.subscriptionWarning = {
                    level: 'warning',
                    message: `Your ${subscription.status === 'trial' ? 'trial' : 'subscription'} expires in ${daysLeft} days`,
                    daysLeft
                };
            } else if (daysLeft <= 3 && daysLeft > 1) {
                req.subscriptionWarning = {
                    level: 'urgent',
                    message: `Your ${subscription.status === 'trial' ? 'trial' : 'subscription'} expires in ${daysLeft} days`,
                    daysLeft
                };
            } else if (daysLeft <= 1 && daysLeft > 0) {
                req.subscriptionWarning = {
                    level: 'critical',
                    message: `Your ${subscription.status === 'trial' ? 'trial' : 'subscription'} expires tomorrow!`,
                    daysLeft
                };
            }
        }

        next();
    } catch (error) {
        next();
    }
};

module.exports = {
    subscriptionMiddleware,
    writeAccessMiddleware,
    subscriptionWarningMiddleware
};
