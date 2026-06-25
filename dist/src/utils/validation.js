"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const errors_1 = require("./errors");
const validate = (schemas) => {
    return (req, _res, next) => {
        const errors = {};
        if (schemas.body) {
            const result = schemas.body.safeParse(req.body);
            if (!result.success) {
                for (const issue of result.error.issues) {
                    const path = issue.path.join('.');
                    if (!errors[path]) {
                        errors[path] = [];
                    }
                    errors[path].push(issue.message);
                }
            }
            else {
                req.body = result.data;
            }
        }
        if (schemas.query) {
            const result = schemas.query.safeParse(req.query);
            if (!result.success) {
                for (const issue of result.error.issues) {
                    const path = issue.path.join('.');
                    if (!errors[path]) {
                        errors[path] = [];
                    }
                    errors[path].push(issue.message);
                }
            }
        }
        if (schemas.params) {
            const result = schemas.params.safeParse(req.params);
            if (!result.success) {
                for (const issue of result.error.issues) {
                    const path = issue.path.join('.');
                    if (!errors[path]) {
                        errors[path] = [];
                    }
                    errors[path].push(issue.message);
                }
            }
        }
        if (Object.keys(errors).length > 0) {
            throw new errors_1.ValidationError(errors);
        }
        next();
    };
};
exports.validate = validate;
