export const saveTokens = (accessToken: string, refreshToken: string, firstName: string, lastName: string, avatarUrl: string) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('firstName', firstName);
    localStorage.setItem('lastName', lastName);
    localStorage.setItem('avatarUrl', avatarUrl);
};

export const getFullName = () => {
    const firstName = localStorage.getItem('firstName') || '';
    const lastName = localStorage.getItem('lastName') || '';
    return `${firstName} ${lastName}`.trim();
};
export const getAvatarUrl = () => {
    return localStorage.getItem('avatarUrl') || 'https://via.placeholder.com/40';
};

export const clearTokens = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('firstName');
    localStorage.removeItem('lastName');
    localStorage.removeItem('avatarUrl');
};


export const isAuthenticated = () => !!localStorage.getItem('accessToken');
