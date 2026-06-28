type AuthResponseBody = {
  data: {
    accessToken?: string;
    refreshToken?: string;
    user?: {
      id: string;
      organizations?: Array<{
        organizationId: string;
        organization?: { id: string; name?: string };
      }>;
    };
  };
};

export function getAccessToken(response: AuthResponseBody): string {
  const token = response.data.accessToken;
  if (!token) {
    throw new Error('Auth response missing accessToken');
  }
  return token;
}

export function getOrganizationId(response: AuthResponseBody): string {
  const organizations = response.data.user?.organizations;
  if (!organizations?.length) {
    throw new Error('Auth response missing user organizations');
  }

  const membership = organizations[0];
  return membership.organizationId ?? membership.organization?.id ?? '';
}

export function getUserId(response: AuthResponseBody): string {
  const userId = response.data.user?.id;
  if (!userId) {
    throw new Error('Auth response missing user id');
  }
  return userId;
}
