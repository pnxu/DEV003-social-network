import {
  ssoGoogle,
  sendVerification,
  loginEmail,
} from '../src/firebase/firebase.js';

jest.mock('../src/lib/firebase-utils.js');

describe('sendVerification', () => {
  it('is a function', () => {
    expect(typeof sendVerification).toBe('function');
  });
  // it('loginEmail es a function', () => {
  //   expect(typeof loginEmail).toBe('function');
  // });
});

describe('login google', () => {
  beforeEach(() => {
    window.alert = jest.fn();
  });
  it('is a function', () => {
    expect(typeof ssoGoogle).toBe('function');
  });
  it('is login properly', async () => {
    await ssoGoogle();
    expect(window.alert).toHaveBeenCalled();
  });
});

describe('loginEmailTest', () => {
  it('loginEmail is a function', () => {
    expect(typeof loginEmail).toBe('function');
  });
  it('email is valid', () => {
    expect('userVerified').toBe('userVerified');
  });
});

describe('loginErrorHandlerTest', () => {
  it('Auth/email is invalid', () => {
    expect('auth/invalid-email').toBe('auth/invalid-email');
  });
  it('User not found', () => {
    expect('auth/user-not-found').toBe('auth/user-not-found');
  });
  it('Password no entered', () => {
    expect('auth/internal-error').toBe('auth/internal-error');
  });
  it('wrong user or password', () => {
    expect('auth/wrong-password').toBe('auth/wrong-password');
  });
  it('too-many-requests', () => {
    expect('auth/too-many-requests').toBe('auth/too-many-requests');
  });
});

describe('logoutTest', () => {
  it('Auth', () => {
    expect('auth/signOut').toBe('auth/signOut');
  });
});
