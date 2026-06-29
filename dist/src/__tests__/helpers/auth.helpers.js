"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAccessToken = getAccessToken;
exports.getOrganizationId = getOrganizationId;
exports.getUserId = getUserId;
function getAccessToken(response) {
    const token = response.data.accessToken;
    if (!token) {
        throw new Error('Auth response missing accessToken');
    }
    return token;
}
function getOrganizationId(response) {
    const organizations = response.data.user?.organizations;
    if (!organizations?.length) {
        throw new Error('Auth response missing user organizations');
    }
    const membership = organizations[0];
    return membership.organizationId ?? membership.organization?.id ?? '';
}
function getUserId(response) {
    const userId = response.data.user?.id;
    if (!userId) {
        throw new Error('Auth response missing user id');
    }
    return userId;
}
