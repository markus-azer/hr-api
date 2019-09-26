const { EMPLOYEE, HRASSISTANT} = require('../models/enums');

const RACL = {
    [EMPLOYEE]: {
        '\/user\/signout': ["GET"], // eslint-disable-line no-useless-escape
        '\/user\/profile': ["GET", "PUT"], // eslint-disable-line no-useless-escape
        '\/benefit': ["GET"] // eslint-disable-line no-useless-escape
    },
    [HRASSISTANT]: {
        '\/user\/signout': ["GET"], // eslint-disable-line no-useless-escape
        '\/user\/profile': ["GET", "PUT"], // eslint-disable-line no-useless-escape
        '\/benefit': ["GET", "POST"], // eslint-disable-line no-useless-escape
        '\/benefit\/b[0-9]+': ["PUT", "DELETE"], // eslint-disable-line no-useless-escape
        '\/user': ["GET"], // eslint-disable-line no-useless-escape
        '\/user\/u[0-9]+': ["GET", "PUT", "DELETE"], // eslint-disable-line no-useless-escape
        '\/user\/invite-user': ["POST"], // eslint-disable-line no-useless-escape
    },
};

module.exports = {
    authorizedSubRoute: access => (req, res, next) => {
        try {
            if (empty(req.user) || empty(req.user.type) || (access != req.user.type))
                throw new CustomError(`Unauthorized`, 401);

            return next();
        } catch (err) {
            return next(err);
        }
    },
    RACL,
    checkAllowedRouteAndMethod: (type = RequiredParam('type'), originalUrl = RequiredParam('path'), method = RequiredParam('method')) => {
        const accessPaths = RACL[type];
        const path = originalUrl.replace(/\?.*/,'');

        const foundAcess = Object.entries(accessPaths).find(([key, values])=>{
            const pattern = new RegExp(`^${key}$`);
            if(pattern.test(path)){
                const foundMethod = values.find(value => value == method);

                if(!empty(foundMethod)){
                    return true;
                }
            }

            return false;
        });

        return (!empty(foundAcess))?true:false;
    }
};