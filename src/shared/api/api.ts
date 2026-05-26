const API_URL = 'http://localhost:8080/api';

export const api = {

  async login(email: string, password: string) {

    const response = await fetch(`${API_URL}/auth/login`, {

      method: 'POST',

      headers: {
        'Content-Type': 'application/json'
      },

      body: JSON.stringify({
        email,
        password
      })

    });

    if (!response.ok) {
      throw new Error('Email ou mot de passe incorrect');
    }

    return response.json();
  },

  async verifyOtp(otpId: string, code: string) {

    const response = await fetch(`${API_URL}/auth/verify-otp`, {

      method: 'POST',

      headers: {
        'Content-Type': 'application/json'
      },

      body: JSON.stringify({
        otpId,
        code
      })

    });

    if (!response.ok) {
      throw new Error('Code OTP invalide');
    }

    return response.json();
  },

  async getCurrentUser() {

    const token = localStorage.getItem('accessToken');

    const response = await fetch(`${API_URL}/auth/me`, {

      headers: {
        Authorization: `Bearer ${token}`
      }

    });

    if (!response.ok) {
      throw new Error('Non authentifié');
    }

    return response.json();
  }
};